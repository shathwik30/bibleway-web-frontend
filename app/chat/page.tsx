"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MainLayout from "../components/MainLayout";
import { useChat } from "../lib/ChatContext";
import { useTranslation } from "../lib/i18n";

export default function ChatPage() {
  const { t } = useTranslation();
  const { conversations, loadConversations, markRead, onlineUsers, connected } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => { setCurrentUserId(localStorage.getItem("user_id")); }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const filtered = conversations.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = c.other_user?.full_name || "";
    return name.toLowerCase().includes(q);
  });

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  function getPreviewText(conv: typeof conversations[0]) {
    const text = conv.last_message_text;
    if (!text) return "Start a conversation";
    if (text.match(/^\[sticker:.+\]$/)) return "Sent a sticker";
    return text;
  }

  function getSenderPrefix(conv: typeof conversations[0]) {
    if (!conv.last_message_text) return "";
    if (conv.last_message_is_mine) return "You: ";
    return "";
  }

  return (
    <MainLayout hideFooter>
      <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem-5rem)] md:h-[calc(100vh-4rem)]" data-page>
        {/* Header */}
        <div className="px-5 pt-6 pb-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-headline text-2xl text-on-surface tracking-tight">Messages</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-400"}`} />
                <span className="text-[11px] text-on-surface-variant/60">{connected ? "Connected" : "Reconnecting..."}</span>
              </div>
            </div>
            <Link
              href="/chat/new"
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-all press-effect editorial-shadow"
            >
              <span className="material-symbols-outlined text-[20px]">edit_square</span>
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.length > 0 ? (
            <div className="px-4 space-y-1 py-2">
              {filtered.map((conv) => {
                const otherUser = conv.other_user || { full_name: "Chat", profile_photo: null, age: 0, id: "" };
                const lastTime = conv.last_message_at ? formatTime(conv.last_message_at) : "";
                const hasUnread = conv.unread_count > 0;

                return (
                  <Link
                    key={conv.id}
                    href={`/chat/${conv.id}`}
                    onClick={() => markRead(conv.id)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group border ${
                      hasUnread
                        ? "bg-primary/5 border-primary/15 hover:bg-primary/10"
                        : "bg-surface-container-lowest border-outline-variant/10 hover:bg-surface-container-low hover:border-outline-variant/20"
                    }`}
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ${hasUnread ? "ring-2 ring-primary/30" : ""} bg-surface-container-high`}>
                        {otherUser.profile_photo ? (
                          <img src={otherUser.profile_photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant text-[28px]">person</span>
                        )}
                      </div>
                      {otherUser.id && onlineUsers[otherUser.id] && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-surface" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className={`text-base truncate ${hasUnread ? "font-bold text-on-surface" : "font-semibold text-on-surface"}`}>
                          {otherUser.full_name || "Conversation"}
                        </h3>
                        <span className={`text-xs flex-shrink-0 ${hasUnread ? "text-primary font-semibold" : "text-on-surface-variant/60"}`}>
                          {lastTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className={`text-sm truncate ${hasUnread ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>
                          <span className="text-on-surface-variant/60">{getSenderPrefix(conv)}</span>
                          {getPreviewText(conv)}
                        </p>
                        {hasUnread && (
                          <span className="w-5 h-5 bg-primary text-on-primary rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {conv.unread_count > 9 ? "9+" : conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-8">
              <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant/25">forum</span>
              </div>
              <p className="text-on-surface font-semibold text-lg mb-1">
                {searchQuery ? "No results found" : "No conversations yet"}
              </p>
              <p className="text-sm text-on-surface-variant/60 text-center max-w-[240px]">
                {searchQuery
                  ? "Try a different search term"
                  : "Visit someone's profile to start a conversation"}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
