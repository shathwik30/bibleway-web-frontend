"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useWebSocket } from "./useWebSocket";
import { fetchAPI } from "./api";

/**
 * Conversation shape from the backend ConversationListSerializer.
 * Fields: id, other_user, last_message_text, last_message_at,
 *         last_message_is_mine, unread_count, created_at, updated_at
 */
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

/**
 * Message shape from the backend MessageSerializer.
 * Fields: id, sender: { id, full_name, profile_photo, age }, text, is_read, created_at
 */
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
  sendMessage: (convId: string, text: string, opts?: { parentMessageId?: string; fileUrl?: string; fileType?: string; fileSize?: number; fileName?: string }) => void;
  editMessage: (messageId: string, text: string) => void;
  deleteMessage: (messageId: string) => void;
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
  const pollInterval = useRef<ReturnType<typeof setInterval>>(undefined);

  // WS message handler -- still useful if WS connects, but chat works without it
  const handleWsMessage = useCallback((data: any) => {
    switch (data.type) {
      case "message.sent": {
        const msg = data.data;
        const convId = msg.conversation_id;
        if (!convId) break;
        setMessages(prev => ({
          ...prev,
          [convId]: [...(prev[convId] || []), {
            id: msg.message_id || msg.id,
            sender: { id: msg.sender_id, full_name: msg.sender_name, profile_photo: null },
            text: msg.text,
            is_read: false,
            created_at: msg.created_at,
          }]
        }));
        // Update conversation list
        setConversations(prev => prev.map(c =>
          c.id === convId
            ? { ...c, last_message_text: msg.text, last_message_at: msg.created_at, unread_count: c.unread_count + 1, updated_at: msg.created_at }
            : c
        ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
        break;
      }
      case "typing": {
        const { user_name, conversation_id, is_typing } = data.data;
        if (is_typing) {
          setTypingUsers(prev => ({
            ...prev,
            [conversation_id]: [...new Set([...(prev[conversation_id] || []), user_name])]
          }));
          const key = `${conversation_id}-${user_name}`;
          clearTimeout(typingTimers.current[key]);
          typingTimers.current[key] = setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [conversation_id]: (prev[conversation_id] || []).filter(n => n !== user_name)
            }));
          }, 3000);
        } else {
          setTypingUsers(prev => ({
            ...prev,
            [conversation_id]: (prev[conversation_id] || []).filter(n => n !== user_name)
          }));
        }
        break;
      }
      case "read_receipt.updated": {
        const { conversation_id } = data.data;
        setConversations(prev => prev.map(c =>
          c.id === conversation_id ? { ...c, unread_count: 0 } : c
        ));
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
    }
  }, []);

  const { connected, send } = useWebSocket({ onMessage: handleWsMessage });

  /**
   * Load conversations via REST API.
   * Backend response: { message, data: { count, next, previous, total_pages, current_page, results: [...] } }
   */
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetchAPI("/chat/conversations/");
      const convs = res?.data?.results || res?.results || [];
      // Sort by most recent message first
      const sorted = (Array.isArray(convs) ? convs : []).sort((a: any, b: any) => {
        const timeA = a.last_message_at || a.updated_at || "";
        const timeB = b.last_message_at || b.updated_at || "";
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });
      setConversations(sorted);
    } catch { /* failed to load conversations */ }
  }, []);

  /**
   * Load messages via REST API.
   * Backend response (cursor pagination): { message, data: { next, previous, results: [...] } }
   * Messages are ordered by -created_at (newest first), so we reverse for chronological display.
   */
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetchAPI(`/chat/conversations/${convId}/messages/`);
      const msgs = res?.data?.results || res?.results || [];
      const messageList = Array.isArray(msgs) ? msgs : [];
      // Backend returns newest-first (cursor pagination with -created_at ordering).
      // Reverse so oldest is first for chronological display.
      // Deduplicate by ID to prevent duplicate key errors from optimistic updates
      const reversed = [...messageList].reverse();
      const seen = new Set<string>();
      const deduped = reversed.filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
      setMessages(prev => ({ ...prev, [convId]: deduped }));
      // If WS is available, join the conversation channel
      if (connected) {
        send("join_conversation", { conversation_id: convId });
      }
    } catch { /* failed to load messages */ }
  }, [connected, send]);

  /**
   * Send a message via REST API POST (primary), with WS as bonus for real-time.
   * Backend expects: POST /chat/conversations/<uuid>/messages/ with body { text: "..." }
   * Backend returns: { message: "Message sent.", data: { id, sender, text, is_read, created_at } }
   */
  const sendMessage = useCallback(async (convId: string, text: string, _opts: any = {}) => {
    if (!convId || !text.trim()) return;
    try {
      const res = await fetchAPI(`/chat/conversations/${convId}/messages/`, {
        method: "POST",
        body: JSON.stringify({ text: text.trim() }),
      });
      const msg = res?.data || res;
      if (msg?.id) {
        // Add the sent message to local state immediately
        setMessages(prev => ({
          ...prev,
          [convId]: [...(prev[convId] || []), {
            id: msg.id,
            sender: msg.sender || { id: localStorage.getItem("user_id") || "", full_name: "You", profile_photo: null },
            text: msg.text,
            is_read: msg.is_read ?? false,
            created_at: msg.created_at,
          }]
        }));
        // Update conversation preview
        setConversations(prev => prev.map(c =>
          c.id === convId
            ? { ...c, last_message_text: msg.text, last_message_at: msg.created_at, last_message_is_mine: true, updated_at: msg.created_at }
            : c
        ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
      }
    } catch {
      // If REST fails, try WS as fallback
      send("send_message", { conversation_id: convId, content: text.trim() });
    }
  }, [send]);

  const editMessage = useCallback((_messageId: string, _text: string) => {
    // Edit not supported via REST API in this backend; WS-only feature
    send("edit_message", { message_id: _messageId, content: _text });
  }, [send]);

  const deleteMessage = useCallback((_messageId: string) => {
    // Delete not supported via REST API in this backend; WS-only feature
    send("delete_message", { message_id: _messageId });
  }, [send]);

  /**
   * Mark messages as read via REST API POST.
   * Backend: POST /chat/conversations/<uuid>/messages/mark-read/
   */
  const markRead = useCallback(async (convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));
    try {
      await fetchAPI(`/chat/conversations/${convId}/messages/mark-read/`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    } catch {
      // Also try WS
      send("mark_read", { conversation_id: convId });
    }
  }, [send]);

  const sendTyping = useCallback((convId: string, isTyping: boolean) => {
    send("typing", { conversation_id: convId, is_typing: isTyping });
  }, [send]);

  const getPresence = useCallback((convId: string) => {
    send("get_presence", { conversation_id: convId });
  }, [send]);

  const leaveConversation = useCallback((convId: string) => {
    send("leave_conversation", { conversation_id: convId });
  }, [send]);

  /**
   * Start a new conversation via REST API POST.
   * Backend: POST /chat/conversations/ with body { user_id: "<uuid>" }
   * Returns the conversation object.
   */
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
    } catch { /* failed to start conversation */ }
    return null;
  }, [loadConversations]);

  // Load conversations on mount (independent of WS) and set up polling
  useEffect(() => {
    loadConversations();

    // Poll conversations every 10 seconds for faster updates
    pollInterval.current = setInterval(() => {
      loadConversations();
    }, 10000);

    return () => {
      clearInterval(pollInterval.current);
    };
  }, [loadConversations]);

  // Also reload when WS connects (bonus)
  useEffect(() => {
    if (connected) loadConversations();
  }, [connected, loadConversations]);

  return (
    <ChatContext.Provider value={{
      conversations, messages, activeConversation, setActiveConversation,
      sendMessage, editMessage, deleteMessage, markRead, sendTyping,
      typingUsers, connected, loadConversations, loadMessages, startConversation,
      onlineUsers, getPresence, leaveConversation,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() { return useContext(ChatContext); }
