"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MainLayout from "../components/MainLayout";
import { useChat } from "../lib/ChatContext";
import { useTranslation } from "../lib/i18n";

export default function ChatPage() {
  const { conversations, loadConversations, connected, markRead } = useChat();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const filtered = conversations.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = c.name || c.other_user?.full_name || "";
    return name.toLowerCase().includes(q);
  });

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8" data-page>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-headline text-3xl text-on-surface">Messages</h1>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-400"}`}></span>
            <span className="text-xs text-on-surface-variant">{connected ? "Connected" : "Offline"}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">search</span>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Conversations List */}
        <div className="bg-surface-container-lowest rounded-2xl editorial-shadow overflow-hidden divide-y divide-outline-variant/10 stagger-children">
          {/* Demo Conversation — TODO: REMOVE BEFORE PRODUCTION */}
          <Link href="/chat/demo" className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-all group bg-primary/5">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary">smart_toy</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors">Grace (BibleWay Assistant)</h3>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed/20 text-on-tertiary-fixed-variant text-[9px] font-bold uppercase tracking-widest">Demo</span>
              </div>
              <p className="text-sm text-on-surface-variant truncate mt-0.5">Try the chat feature! Tap to start chatting.</p>
            </div>
          </Link>

          {filtered.length > 0 ? filtered.map((conv) => {
            const otherUser = conv.other_user || { full_name: conv.name || "Chat" };
            const lastMsg = conv.last_message;
            const lastText = lastMsg?.text || lastMsg?.content || "";
            const lastTime = lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                onClick={() => markRead(conv.id)}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-all group ${conv.unread_count > 0 ? "bg-primary/5" : ""}`}
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden flex-shrink-0 border border-outline-variant/20">
                  {otherUser.profile_photo ? (
                    <img src={otherUser.profile_photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant">person</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                      {otherUser.full_name || conv.name || "Conversation"}
                    </h3>
                    <span className="text-xs text-on-surface-variant/60 flex-shrink-0 ml-2">{lastTime}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm text-on-surface-variant truncate">
                      {lastMsg?.file ? "Sent an attachment" : lastText || "Start chatting..."}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 bg-primary text-on-primary rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ml-2">
                        {conv.unread_count > 9 ? "9+" : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          }) : (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4 block">chat</span>
              <p className="text-on-surface-variant font-medium">No conversations yet</p>
              <p className="text-xs text-on-surface-variant/60 mt-1">Visit someone's profile to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
