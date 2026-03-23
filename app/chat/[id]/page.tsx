"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "../../components/MainLayout";
import { useChat } from "../../lib/ChatContext";
import { fetchAPI } from "../../lib/api";

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const convId = Number(params.id);
  const { messages, loadMessages, sendMessage, editMessage, deleteMessage, markRead, sendTyping, typingUsers, connected, getPresence, onlineUsers } = useChat();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  const convMessages = messages[convId] || [];
  const typing = typingUsers[convId] || [];

  useEffect(() => {
    if (convId) { loadMessages(convId); markRead(convId); getPresence(convId); }
  }, [convId, loadMessages, markRead, getPresence]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [convMessages.length]);

  function handleSend() {
    if (!text.trim() && !replyTo) return;
    sendMessage(convId, text.trim(), replyTo ? { parentMessageId: replyTo.id } : {});
    setText("");
    setReplyTo(null);
  }

  function handleTyping() {
    sendTyping(convId, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(convId, false), 2000);
  }

  function handleEdit(msg: any) {
    setEditingId(msg.id);
    setEditText(msg.text);
  }

  function submitEdit() {
    if (editingId && editText.trim()) {
      editMessage(editingId, editText.trim());
      setEditingId(null);
      setEditText("");
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversation_id", String(convId));
      const res = await fetchAPI("/chat/upload/", { method: "POST", body: formData });
      const data = res.data || res;
      sendMessage(convId, "", { fileUrl: data.file_url, fileType: data.file_type, fileSize: data.file_size, fileName: data.file_name });
    } catch (err) {
      console.error("File upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-80px)]" data-page>
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-outline-variant/10 bg-surface-container-lowest/80 backdrop-blur-sm sticky top-16 z-10">
          <button onClick={() => router.push("/chat")} className="p-2 rounded-full hover:bg-surface-container-high transition-all press-effect">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-on-surface-variant">person</span>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-on-surface">Conversation</h2>
            <p className="text-xs text-on-surface-variant">
              {typing.length > 0 ? `${typing.join(", ")} typing...` : connected ? "Online" : "Connecting..."}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-3 custom-scrollbar">
          {convMessages.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-3 block">chat_bubble</span>
              <p className="text-on-surface-variant">No messages yet. Say hello!</p>
            </div>
          )}
          {convMessages.map((msg) => {
            const isOwn = msg.sender?.id === currentUserId || msg.sender?.user_id === currentUserId;
            if (msg.is_deleted_for_everyone) {
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className="px-4 py-2 rounded-2xl bg-surface-container-high/50 text-on-surface-variant/50 text-sm italic">Message deleted</div>
                </div>
              );
            }
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}>
                <div className={`max-w-[75%] ${isOwn ? "order-2" : ""}`}>
                  {/* Reply reference */}
                  {msg.reply_to_id && (
                    <div className="text-xs text-on-surface-variant/60 px-3 py-1 mb-1 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg">
                      Replying to message
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl ${isOwn ? "bg-primary text-on-primary rounded-br-md" : "bg-surface-container-low text-on-surface rounded-bl-md"}`}>
                    {!isOwn && <p className="text-xs font-bold mb-1 opacity-70">{msg.sender?.full_name || msg.sender?.user_name || "User"}</p>}

                    {/* File attachment */}
                    {msg.file && (
                      <div className="mb-2">
                        {msg.file.type === "IMAGE" ? (
                          <img src={msg.file.url} alt={msg.file.name} className="max-w-full rounded-xl max-h-64 object-cover" />
                        ) : (
                          <a href={msg.file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm underline">
                            <span className="material-symbols-outlined text-sm">{msg.file.type === "VIDEO" ? "videocam" : "audio_file"}</span>
                            {msg.file.name}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Shared post */}
                    {msg.shared_post && (
                      <Link href={`/post/${msg.shared_post.post_id}`} className="block p-2 mb-2 rounded-lg bg-white/10 border border-white/20 text-xs">
                        <p className="font-bold">{msg.shared_post.title || "Shared Post"}</p>
                        <p className="opacity-70 line-clamp-2">{msg.shared_post.description}</p>
                      </Link>
                    )}

                    {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

                    <div className={`flex items-center gap-2 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                      <span className={`text-[10px] ${isOwn ? "text-on-primary/60" : "text-on-surface-variant/50"}`}>{formatTime(msg.created_at)}</span>
                      {msg.edited_at && <span className={`text-[10px] ${isOwn ? "text-on-primary/60" : "text-on-surface-variant/50"}`}>(edited)</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`flex gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? "justify-end" : "justify-start"}`}>
                    <button onClick={() => setReplyTo(msg)} className="text-[10px] text-on-surface-variant hover:text-primary px-1.5 py-0.5 rounded">Reply</button>
                    {isOwn && (
                      <>
                        <button onClick={() => handleEdit(msg)} className="text-[10px] text-on-surface-variant hover:text-primary px-1.5 py-0.5 rounded">Edit</button>
                        <button onClick={() => { if (confirm("Delete this message?")) deleteMessage(msg.id); }} className="text-[10px] text-on-surface-variant hover:text-red-500 px-1.5 py-0.5 rounded">Delete</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typing.length > 0 && (
            <div className="flex justify-start">
              <div className="px-4 py-2.5 rounded-2xl bg-surface-container-low rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit bar */}
        {editingId && (
          <div className="px-4 py-2 bg-primary/10 border-t border-primary/20 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-sm">edit</span>
            <input value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitEdit()} className="flex-1 bg-transparent text-sm text-on-surface focus:outline-none" autoFocus />
            <button onClick={submitEdit} className="text-primary font-bold text-xs">Save</button>
            <button onClick={() => setEditingId(null)} className="text-on-surface-variant text-xs">Cancel</button>
          </div>
        )}

        {/* Reply bar */}
        {replyTo && (
          <div className="px-4 py-2 bg-surface-container-low border-t border-outline-variant/10 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-sm">reply</span>
            <p className="flex-1 text-xs text-on-surface-variant truncate">Replying to: {replyTo.text || "message"}</p>
            <button onClick={() => setReplyTo(null)} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined text-sm">close</span></button>
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-outline-variant/10 bg-surface-container-lowest">
          <div className="flex items-end gap-2">
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="p-2.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all disabled:opacity-50">
              <span className="material-symbols-outlined">{uploading ? "hourglass_empty" : "attach_file"}</span>
            </button>
            <input type="file" ref={fileRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*,audio/*" />
            <div className="flex-1 relative">
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); handleTyping(); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message..."
                rows={1}
                className="w-full bg-surface-container-high rounded-2xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none max-h-32"
              />
            </div>
            <button onClick={handleSend} disabled={!text.trim()} className="p-2.5 rounded-full bg-primary text-on-primary hover:opacity-90 transition-all disabled:opacity-30 press-effect">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
