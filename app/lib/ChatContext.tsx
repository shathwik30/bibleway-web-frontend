"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useWebSocket } from "./useWebSocket";
import { fetchAPI } from "./api";

interface Conversation {
  id: string;
  other_user?: {
    id: string;
    full_name: string;
    profile_photo: string | null;
    age: number;
  };
  last_message_text: string | null;
  last_message_at: string | null;
  last_message_is_mine: boolean;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  sender: {
    id: string;
    full_name: string;
    profile_photo: string | null;
    age?: number;
  };
  text: string;
  is_read: boolean;
  created_at: string;
}

interface ChatContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
  sendMessage: (convId: string, text: string) => void;
  markRead: (convId: string) => void;
  sendTyping: (convId: string, isTyping: boolean) => void;
  typingUsers: Record<string, string[]>;
  connected: boolean;
  loadConversations: () => void;
  loadMessages: (convId: string) => void;
  startConversation: (userId: string) => Promise<Conversation | null>;
  onlineUsers: Record<string, boolean>;
  getPresence: (convId: string) => void;
  leaveConversation: (convId: string) => void;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // Track which conversations we've joined (have messages loaded) to avoid double unread counts
  const joinedConvsRef = useRef<Set<string>>(new Set());

  // ------------------------------------------------------------------
  // WebSocket message handler
  // ------------------------------------------------------------------
  const handleWsMessage = useCallback((data: any) => {
    switch (data.type) {
      case "message.sent": {
        const msg = data.data;
        const convId = msg.conversation_id;
        if (!convId) break;
        const currentUserId = localStorage.getItem("user_id") || "";
        const realId = msg.message_id || msg.id;
        const isOwn = msg.sender_id === currentUserId;

        setMessages(prev => {
          const existing = prev[convId] || [];
          // Deduplicate — already have this real ID
          if (existing.some(m => m.id === realId)) return prev;

          if (isOwn) {
            // Replace the optimistic message (temp UUID) with the real server message.
            // The optimistic msg is the last message from us with a text match.
            const idx = existing.findLastIndex(
              m => m.sender.id === currentUserId && m.text === msg.text
            );
            if (idx !== -1) {
              const updated = [...existing];
              updated[idx] = {
                ...updated[idx],
                id: realId,
                created_at: msg.created_at,
              };
              return { ...prev, [convId]: updated };
            }
            // No optimistic message found — skip (shouldn't happen)
            return prev;
          }

          // Other user's message — append
          return {
            ...prev,
            [convId]: [...existing, {
              id: realId,
              sender: { id: msg.sender_id, full_name: msg.sender_name, profile_photo: msg.sender_photo || null },
              text: msg.text,
              is_read: false,
              created_at: msg.created_at,
            }],
          };
        });

        // Update conversation list (only bump unread for other user's messages)
        if (!isOwn) {
          setConversations(prev => prev.map(c =>
            c.id === convId
              ? { ...c, last_message_text: msg.text, last_message_at: msg.created_at, unread_count: c.unread_count + 1, updated_at: msg.created_at }
              : c
          ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
        }
        break;
      }
      case "conversation.updated": {
        const d = data.data;
        // If we've joined this conversation (messages loaded), we already
        // got message.sent which bumped unread. Don't double-count.
        const alreadyInGroup = joinedConvsRef.current.has(d.conversation_id);

        setConversations(prev => {
          const updated = prev.map(c =>
            c.id === d.conversation_id
              ? {
                  ...c,
                  last_message_text: d.last_message_text,
                  last_message_at: d.last_message_at,
                  last_message_is_mine: d.last_message_is_mine ?? false,
                  unread_count: alreadyInGroup ? c.unread_count : c.unread_count + 1,
                  updated_at: d.last_message_at,
                }
              : c
          );
          return updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        });
        break;
      }
      case "typing": {
        const { user_name, conversation_id, is_typing } = data.data;
        if (is_typing) {
          setTypingUsers(prev => ({
            ...prev,
            [conversation_id]: [...new Set([...(prev[conversation_id] || []), user_name])],
          }));
          const key = `${conversation_id}-${user_name}`;
          clearTimeout(typingTimers.current[key]);
          typingTimers.current[key] = setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [conversation_id]: (prev[conversation_id] || []).filter(n => n !== user_name),
            }));
          }, 3000);
        } else {
          setTypingUsers(prev => ({
            ...prev,
            [conversation_id]: (prev[conversation_id] || []).filter(n => n !== user_name),
          }));
        }
        break;
      }
      case "read_receipt.updated": {
        const { conversation_id, user_id } = data.data;
        const currentUserId = localStorage.getItem("user_id") || "";
        if (user_id === currentUserId) {
          // I read messages — clear my unread count
          setConversations(prev => prev.map(c =>
            c.id === conversation_id ? { ...c, unread_count: 0 } : c
          ));
        } else {
          // Other user read my messages — mark as read in message list
          setMessages(prev => {
            const convMsgs = prev[conversation_id];
            if (!convMsgs) return prev;
            return {
              ...prev,
              [conversation_id]: convMsgs.map(m =>
                m.sender.id === currentUserId ? { ...m, is_read: true } : m
              ),
            };
          });
        }
        break;
      }
      case "presence.status": {
        const users = data.data?.users || [];
        const map: Record<string, boolean> = {};
        users.forEach((u: any) => { map[u.user_id] = u.is_online; });
        setOnlineUsers(prev => ({ ...prev, ...map }));
        break;
      }
      case "presence.updated": {
        if (data.data?.user_id) {
          setOnlineUsers(prev => ({ ...prev, [data.data.user_id]: data.data.is_online }));
        }
        break;
      }
      case "joined": {
        // Acknowledged join — no-op
        break;
      }
    }
  }, []);

  const { connected, send, reconnect } = useWebSocket({ onMessage: handleWsMessage });

  // ------------------------------------------------------------------
  // REST API calls (for initial data load only)
  // ------------------------------------------------------------------

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetchAPI("/chat/conversations/");
      const convs = res?.data?.results || res?.results || [];
      const sorted = (Array.isArray(convs) ? convs : []).sort((a: any, b: any) => {
        const timeA = a.last_message_at || a.updated_at || "";
        const timeB = b.last_message_at || b.updated_at || "";
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });
      setConversations(sorted);
    } catch { /* failed to load conversations */ }
  }, []);

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetchAPI(`/chat/conversations/${convId}/messages/`);
      const msgs = res?.data?.results || res?.results || [];
      const messageList = Array.isArray(msgs) ? msgs : [];
      const reversed = [...messageList].reverse();
      const seen = new Set<string>();
      const deduped = reversed.filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
      setMessages(prev => ({ ...prev, [convId]: deduped }));
      joinedConvsRef.current.add(convId);
    } catch { /* failed to load messages */ }

    // Join conversation group via WS for real-time updates
    if (connected) {
      send("join_conversation", { conversation_id: convId });
    }
  }, [connected, send]);

  // ------------------------------------------------------------------
  // Actions — WS primary, REST fallback
  // ------------------------------------------------------------------

  const sendMessage = useCallback(async (convId: string, text: string) => {
    if (!convId || !text.trim()) return;
    const trimmed = text.trim();
    const currentUserId = localStorage.getItem("user_id") || "";

    // Optimistic message
    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();
    const optimisticMsg: Message = {
      id: tempId,
      sender: { id: currentUserId, full_name: "You", profile_photo: null },
      text: trimmed,
      is_read: false,
      created_at: now,
    };

    setMessages(prev => ({
      ...prev,
      [convId]: [...(prev[convId] || []), optimisticMsg],
    }));
    setConversations(prev => prev.map(c =>
      c.id === convId
        ? { ...c, last_message_text: trimmed, last_message_at: now, last_message_is_mine: true, updated_at: now }
        : c
    ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));

    // Try WebSocket first
    if (connected) {
      const sent = send("send_message", { conversation_id: convId, text: trimmed });
      if (sent) {
        // WS sent — the server will broadcast back via message.sent
        // Replace temp ID when we get the server response
        return;
      }
    }

    // Fallback to REST
    try {
      const res = await fetchAPI(`/chat/conversations/${convId}/messages/`, {
        method: "POST",
        body: JSON.stringify({ text: trimmed }),
      });
      const msg = res?.data || res;
      if (msg?.id) {
        // Replace optimistic message with real one
        setMessages(prev => ({
          ...prev,
          [convId]: (prev[convId] || []).map(m =>
            m.id === tempId
              ? {
                  id: msg.id,
                  sender: msg.sender || optimisticMsg.sender,
                  text: msg.text,
                  is_read: msg.is_read ?? false,
                  created_at: msg.created_at,
                }
              : m
          ),
        }));
      }
    } catch {
      // Remove optimistic message on failure
      setMessages(prev => ({
        ...prev,
        [convId]: (prev[convId] || []).filter(m => m.id !== tempId),
      }));
    }
  }, [connected, send]);

  const markRead = useCallback(async (convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));

    if (connected) {
      const sent = send("mark_read", { conversation_id: convId });
      if (sent) return;
    }

    // Fallback to REST
    try {
      await fetchAPI(`/chat/conversations/${convId}/messages/mark-read/`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    } catch { /* ignore */ }
  }, [connected, send]);

  const sendTyping = useCallback((convId: string, isTyping: boolean) => {
    send("typing", { conversation_id: convId, is_typing: isTyping });
  }, [send]);

  const getPresence = useCallback((convId: string) => {
    send("get_presence", { conversation_id: convId });
  }, [send]);

  const leaveConversation = useCallback((convId: string) => {
    send("leave_conversation", { conversation_id: convId });
  }, [send]);

  const startConversation = useCallback(async (userId: string): Promise<Conversation | null> => {
    try {
      const res = await fetchAPI("/chat/conversations/", {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      });
      const conv = res?.data || res;
      if (conv?.id) {
        await loadConversations();
        return conv;
      }
    } catch { /* failed */ }
    return null;
  }, [loadConversations]);

  // ------------------------------------------------------------------
  // Initial load — REST for conversation list, then WS for real-time
  // ------------------------------------------------------------------

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // When WS connects/reconnects, reload conversations to sync state
  useEffect(() => {
    if (connected) {
      loadConversations();
    }
  }, [connected, loadConversations]);

  return (
    <ChatContext.Provider value={{
      conversations, messages, activeConversation, setActiveConversation,
      sendMessage, markRead, sendTyping,
      typingUsers, connected, loadConversations, loadMessages, startConversation,
      onlineUsers, getPresence, leaveConversation,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() { return useContext(ChatContext); }
