"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useWebSocket } from "./useWebSocket";
import { fetchAPI } from "./api";

interface Conversation {
  id: number;
  type: "DIRECT" | "GROUP";
  name: string;
  other_user?: any;
  last_message?: any;
  unread_count: number;
  updated_at: string;
}

interface Message {
  id: number;
  conversation_id: number;
  sender: any;
  text: string;
  file?: { url: string; type: string; size: number; name: string } | null;
  reply_to_id?: number | null;
  shared_post?: any;
  created_at: string;
  edited_at?: string | null;
  is_deleted_for_everyone: boolean;
}

interface ChatContextType {
  conversations: Conversation[];
  messages: Record<number, Message[]>;
  activeConversation: number | null;
  setActiveConversation: (id: number | null) => void;
  sendMessage: (convId: number | null, text: string, opts?: { receiverId?: string; parentMessageId?: number; fileUrl?: string; fileType?: string; fileSize?: number; fileName?: string; sharedPostId?: string }) => void;
  editMessage: (messageId: number, text: string) => void;
  deleteMessage: (messageId: number) => void;
  markRead: (convId: number) => void;
  sendTyping: (convId: number, isTyping: boolean) => void;
  typingUsers: Record<number, string[]>;
  connected: boolean;
  loadConversations: () => void;
  loadMessages: (convId: number) => void;
  startConversation: (userId: string) => void;
  onlineUsers: Record<string, boolean>;
  getPresence: (convId: number) => void;
  leaveConversation: (convId: number) => void;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<number, string[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleWsMessage = useCallback((data: any) => {
    switch (data.type) {
      case "message.sent": {
        const msg = data.data;
        const convId = msg.conversation_id;
        setMessages(prev => ({
          ...prev,
          [convId]: [...(prev[convId] || []), {
            id: msg.message_id,
            conversation_id: convId,
            sender: { id: msg.sender_id, full_name: msg.sender_name },
            text: msg.text,
            file: msg.file || null,
            reply_to_id: msg.reply_to_id,
            shared_post: msg.shared_post,
            created_at: msg.created_at,
            edited_at: msg.edited_at,
            is_deleted_for_everyone: msg.is_deleted_for_everyone,
          }]
        }));
        setConversations(prev => prev.map(c =>
          c.id === convId ? { ...c, last_message: msg, unread_count: c.unread_count + 1, updated_at: msg.created_at } : c
        ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
        break;
      }
      case "message.edited": {
        const { message_id, conversation_id, text, edited_at } = data.data;
        setMessages(prev => ({
          ...prev,
          [conversation_id]: (prev[conversation_id] || []).map(m =>
            m.id === message_id ? { ...m, text, edited_at } : m
          )
        }));
        break;
      }
      case "message.deleted": {
        const { message_id, conversation_id } = data.data;
        setMessages(prev => ({
          ...prev,
          [conversation_id]: (prev[conversation_id] || []).map(m =>
            m.id === message_id ? { ...m, is_deleted_for_everyone: true, text: "" } : m
          )
        }));
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
      case "connection.established": {
        if (data.data?.user_id) setCurrentUserId(data.data.user_id);
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
      case "ack": {
        if (data.action === "send_message" && data.ok) {
          // Message sent successfully
        }
        break;
      }
    }
  }, []);

  const { connected, send } = useWebSocket({ onMessage: handleWsMessage });

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetchAPI("/chat/conversations/");
      const convs = res?.data?.results || res?.results || res?.data || [];
      setConversations(convs);
    } catch {}
  }, []);

  const loadMessages = useCallback(async (convId: number) => {
    try {
      const res = await fetchAPI(`/chat/conversations/${convId}/messages/`);
      const msgs = res?.data?.results || res?.results || res?.data || [];
      setMessages(prev => ({ ...prev, [convId]: msgs.reverse() }));
      send("join_conversation", { conversation_id: String(convId) });
    } catch {}
  }, [send]);

  const sendMessage = useCallback((convId: number | null, text: string, opts: any = {}) => {
    const payload: any = { content: text };
    if (convId) payload.conversation_id = String(convId);
    if (opts.receiverId) payload.receiver_id = opts.receiverId;
    if (opts.parentMessageId) payload.parent_message_id = String(opts.parentMessageId);
    if (opts.fileUrl) { payload.file_url = opts.fileUrl; payload.file_type = opts.fileType; payload.file_size = opts.fileSize; payload.file_name = opts.fileName; }
    if (opts.sharedPostId) payload.shared_post_id = opts.sharedPostId;
    send("send_message", payload);
  }, [send]);

  const editMessage = useCallback((messageId: number, text: string) => {
    send("edit_message", { message_id: String(messageId), content: text });
  }, [send]);

  const deleteMessage = useCallback((messageId: number) => {
    send("delete_message", { message_id: String(messageId) });
  }, [send]);

  const markRead = useCallback((convId: number) => {
    send("mark_read", { conversation_id: String(convId) });
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));
  }, [send]);

  const sendTyping = useCallback((convId: number, isTyping: boolean) => {
    send("typing", { conversation_id: String(convId), is_typing: isTyping });
  }, [send]);

  const getPresence = useCallback((convId: number) => {
    send("get_presence", { conversation_id: String(convId) });
  }, [send]);

  const leaveConversation = useCallback((convId: number) => {
    send("leave_conversation", { conversation_id: String(convId) });
  }, [send]);

  const startConversation = useCallback((userId: string) => {
    sendMessage(null, "Hey! \u{1F44B}", { receiverId: userId });
    setTimeout(loadConversations, 1000);
  }, [sendMessage, loadConversations]);

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
