"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import MainLayout from "../../components/MainLayout";

interface DemoMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
  time: string;
  replyTo?: { id: number; text: string } | null;
  edited?: boolean;
}

const BOT_NAME = "Grace (BibleWay Assistant)";
const BOT_PHOTO = null;

const BOT_REPLIES: Record<string, string[]> = {
  hello: ["Hello! God bless you! How can I help you today?", "Hi there! Welcome to BibleWay. How are you doing?", "Hey! Great to see you here. What's on your mind?"],
  pray: ["I'll be praying for you. Remember, Philippians 4:6 says 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.'", "Let's lift that up in prayer together. God hears you.", "That's beautiful. Prayer changes things. I'm with you in spirit."],
  bible: ["Have you tried our Bible reader? It has multiple translations and a study experience! Go to the Bible tab.", "A great verse for today: 'Trust in the Lord with all your heart and lean not on your own understanding.' - Proverbs 3:5", "The Bible section has bookmarks, highlights, and notes. You should check it out!"],
  thanks: ["You're welcome! God bless you!", "Anytime! That's what community is for.", "Happy to help! Have a blessed day."],
  help: ["I can help with:\n- Prayer requests\n- Bible study tips\n- Navigating the app\n- Community guidelines\n\nJust ask!", "Sure! What do you need help with? I'm here for you.", "Of course! Ask me anything about BibleWay or your faith journey."],
  shop: ["Check out our Digital Sanctuary shop! We have study guides and devotional media. Go to the Shop tab.", "The shop has some amazing free resources too! Worth browsing."],
  how: ["I'm doing great, thank you for asking! How about you?", "Blessed and grateful! How are you doing today?"],
  amen: ["Amen indeed! God is good.", "Amen! All the time, God is faithful.", "Amen! Praise the Lord!"],
  default: [
    "That's a great thought! I'd love to hear more.",
    "Interesting! Have you shared this with the community? You could create a post about it.",
    "I appreciate you sharing that. Remember, this community is here to support you.",
    "Beautiful words! You might want to check out our prayer wall for more encouragement.",
    "Thanks for sharing! Feel free to explore the Bible reader for related scriptures.",
    "God works in mysterious ways. Keep the faith!",
    "That resonates deeply. Would you like to write a prayer request about it?",
  ],
};

function getBotReply(userText: string): string {
  const lower = userText.toLowerCase();
  for (const [key, replies] of Object.entries(BOT_REPLIES)) {
    if (key !== "default" && lower.includes(key)) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  const defaults = BOT_REPLIES.default;
  return defaults[Math.floor(Math.random() * defaults.length)];
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DemoChatPage() {
  const [messages, setMessages] = useState<DemoMessage[]>([
    { id: 1, sender: "bot", text: "Hey! Welcome to BibleWay Chat. I'm Grace, your community assistant. Feel free to ask me anything about the app, Bible, or just chat!", time: formatTime(), replyTo: null },
  ]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<DemoMessage | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(2);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, isTyping]);

  function handleSend() {
    if (!text.trim()) return;
    const userMsg: DemoMessage = { id: idRef.current++, sender: "user", text: text.trim(), time: formatTime(), replyTo: replyTo ? { id: replyTo.id, text: replyTo.text } : null };
    setMessages((prev) => [...prev, userMsg]);
    const userText = text.trim();
    setText("");
    setReplyTo(null);

    setIsTyping(true);
    const delay = 800 + Math.random() * 1500;
    setTimeout(() => {
      setIsTyping(false);
      const reply = getBotReply(userText);
      setMessages((prev) => [...prev, { id: idRef.current++, sender: "bot", text: reply, time: formatTime(), replyTo: null }]);
    }, delay);
  }

  function handleEdit(msg: DemoMessage) {
    setEditingId(msg.id);
    setEditText(msg.text);
  }

  function submitEdit() {
    if (editingId && editText.trim()) {
      setMessages((prev) => prev.map(m => m.id === editingId ? { ...m, text: editText.trim(), edited: true } : m));
      setEditingId(null);
      setEditText("");
    }
  }

  function handleDelete(id: number) {
    setMessages((prev) => prev.filter(m => m.id !== id));
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-80px)]" data-page>
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-outline-variant/10 bg-surface-container-lowest/80 backdrop-blur-sm sticky top-16 z-10">
          <Link href="/chat" className="p-2 rounded-full hover:bg-surface-container-high transition-all press-effect">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-on-surface">{BOT_NAME}</h2>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              {isTyping ? "Typing..." : "Online"}
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-tertiary-fixed/20 text-on-tertiary-fixed-variant text-[10px] font-bold uppercase tracking-widest">
            Demo
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-3 custom-scrollbar">
          {messages.map((msg) => {
            const isOwn = msg.sender === "user";
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}>
                <div className={`max-w-[75%]`}>
                  {msg.replyTo && (
                    <div className={`text-xs text-on-surface-variant/60 px-3 py-1 mb-1 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg ${isOwn ? "ml-auto max-w-[90%]" : "max-w-[90%]"}`}>
                      Replying: {msg.replyTo.text.slice(0, 50)}...
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl ${isOwn ? "bg-primary text-on-primary rounded-br-md" : "bg-surface-container-low text-on-surface rounded-bl-md"}`}>
                    {!isOwn && <p className="text-xs font-bold mb-1 text-primary">{BOT_NAME}</p>}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div className={`flex items-center gap-2 mt-1 ${isOwn ? "justify-end" : ""}`}>
                      <span className={`text-[10px] ${isOwn ? "text-on-primary/60" : "text-on-surface-variant/50"}`}>{msg.time}</span>
                      {msg.edited && <span className={`text-[10px] ${isOwn ? "text-on-primary/60" : "text-on-surface-variant/50"}`}>(edited)</span>}
                    </div>
                  </div>
                  <div className={`flex gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? "justify-end" : "justify-start"}`}>
                    <button onClick={() => setReplyTo(msg)} className="text-[10px] text-on-surface-variant hover:text-primary px-1.5 py-0.5 rounded">Reply</button>
                    {isOwn && (
                      <>
                        <button onClick={() => handleEdit(msg)} className="text-[10px] text-on-surface-variant hover:text-primary px-1.5 py-0.5 rounded">Edit</button>
                        <button onClick={() => handleDelete(msg.id)} className="text-[10px] text-on-surface-variant hover:text-red-500 px-1.5 py-0.5 rounded">Delete</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-surface-container-low rounded-bl-md">
                <div className="flex gap-1.5">
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
            <p className="flex-1 text-xs text-on-surface-variant truncate">Replying to: {replyTo.text.slice(0, 60)}</p>
            <button onClick={() => setReplyTo(null)} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined text-sm">close</span></button>
          </div>
        )}

        {/* Quick replies */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {["Hello!", "Pray for me", "Tell me a verse", "How does the app work?", "Amen!"].map((q) => (
            <button key={q} onClick={() => { setText(q); }} className="flex-shrink-0 px-4 py-1.5 rounded-full bg-surface-container-low text-on-surface-variant text-xs font-medium hover:bg-primary/10 hover:text-primary transition-all border border-outline-variant/20">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-outline-variant/10 bg-surface-container-lowest">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
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
