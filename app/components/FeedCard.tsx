"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { fetchAPI } from "../lib/api";
import StickerPicker, { STICKERS } from "./StickerPicker";
import { containsProfanity, getProfanityWarning } from "../lib/contentFilter";
import { useToast } from "./Toast";

interface MediaItem {
  id?: string;
  file: string;
  media_type: string;
  order?: number;
}

interface FeedPost {
  id: string;
  author: string;
  authorId: string;
  authorPhoto: string | null;
  time: string;
  rawDate: string;
  title?: string;
  content: string;
  image?: string;
  media?: MediaItem[];
  likes: number;
  prayers?: number;
  comments: number;
  type: "post" | "prayer";
  userReaction: string | null;
  is_boosted?: boolean;
}

const REACTIONS = [
  { type: "praying_hands", emoji: "\u{1F64F}", label: "Praying Hands" },
  { type: "heart", emoji: "\u2764\uFE0F", label: "Heart" },
  { type: "fire", emoji: "\u{1F525}", label: "Fire" },
  { type: "amen", emoji: "\u{1F64C}", label: "Amen" },
  { type: "cross", emoji: "\u271D\uFE0F", label: "Cross" },
];

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center cursor-zoom-out" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
        <span className="material-symbols-outlined">close</span>
      </button>
      <img src={src} alt="Preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

function PostMediaCarousel({ media }: { media: { file: string; media_type: string }[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollTo(index: number) {
    const clamped = Math.max(0, Math.min(index, media.length - 1));
    setActiveIndex(clamped);
    scrollRef.current?.children[clamped]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }

  return (
    <>
      <div className="relative rounded-xl overflow-hidden mb-6 bg-surface-container-low">
        <div ref={scrollRef} onScroll={handleScroll} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
          {media.map((item, i) => (
            <div key={i} className="w-full shrink-0 snap-center cursor-zoom-in" onClick={() => setLightboxSrc(item.file)}>
              <img src={item.file} alt={`Media ${i + 1}`} className="w-full object-cover max-h-[600px] min-h-[200px]" />
            </div>
          ))}
        </div>
        {media.length > 1 && (
          <>
            {activeIndex > 0 && (
              <button onClick={(e) => { e.stopPropagation(); scrollTo(activeIndex - 1); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
            )}
            {activeIndex < media.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); scrollTo(activeIndex + 1); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {media.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIndex ? "bg-white w-3" : "bg-white/50"}`} />
              ))}
            </div>
          </>
        )}
      </div>
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </>
  );
}

interface FeedCardProps {
  post: FeedPost;
  currentUserId: string | null;
  onReact: (postId: string, postType: string, emojiType: string) => void;
  onDelete: (id: string, type: string) => void;
  onShare: (postId: string, postType: string) => void;
  onReport: (type: string, id: string) => void;
  animatingReaction: { postId: string; emoji: string } | null;
  openReactionId: string | null;
  setOpenReactionId: (id: string | null) => void;
  reactionRef: React.RefObject<HTMLDivElement | null>;
}

export default function FeedCard({
  post, currentUserId, onReact, onDelete, onShare, onReport,
  animatingReaction, openReactionId, setOpenReactionId, reactionRef,
}: FeedCardProps) {
  const { showToast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);
  const [repliesData, setRepliesData] = useState<Record<string, any[]>>({});
  const [repliesLoading, setRepliesLoading] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
        setOpenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [openMenu]);

  async function loadComments() {
    setCommentsLoading(true);
    try {
      const endpoint = post.type === "post"
        ? `/social/posts/${post.id}/comments/`
        : `/social/prayers/${post.id}/comments/`;
      const res = await fetchAPI(endpoint);
      setComments(res?.data?.results ?? res?.results ?? []);
    } catch { /* failed to load comments */ } finally {
      setCommentsLoading(false);
    }
  }

  function toggleComments() {
    if (showComments) { setShowComments(false); return; }
    setShowComments(true);
    if (comments.length === 0) loadComments();
  }

  async function handlePostComment() {
    if (!newComment.trim() || postingComment) return;
    if (containsProfanity(newComment)) {
      showToast("error", "Language Warning", getProfanityWarning());
      return;
    }
    setPostingComment(true);
    try {
      const endpoint = post.type === "post"
        ? `/social/posts/${post.id}/comments/`
        : `/social/prayers/${post.id}/comments/`;
      await fetchAPI(endpoint, { method: "POST", body: JSON.stringify({ text: newComment.trim() }) });
      setNewComment("");
      setCommentCount((c) => c + 1);
      await loadComments();
    } catch { /* failed to post comment */ } finally {
      setPostingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("Delete comment?")) return;
    try {
      await fetchAPI(`/social/comments/${commentId}/`, { method: "DELETE" });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentCount((c) => Math.max(0, c - 1));
    } catch { /* failed to delete comment */ }
  }

  async function loadReplies(commentId: string) {
    setRepliesLoading(commentId);
    try {
      const res = await fetchAPI(`/social/comments/${commentId}/replies/`);
      setRepliesData((prev) => ({ ...prev, [commentId]: res?.data?.results ?? res?.results ?? [] }));
    } catch { /* failed to load replies */ } finally {
      setRepliesLoading(null);
    }
  }

  async function handlePostReply(commentId: string) {
    if (!replyText.trim() || postingReply) return;
    if (containsProfanity(replyText)) {
      showToast("error", "Language Warning", getProfanityWarning());
      return;
    }
    setPostingReply(true);
    try {
      await fetchAPI(`/social/comments/${commentId}/replies/`, { method: "POST", body: JSON.stringify({ text: replyText.trim() }) });
      setReplyText("");
      setReplyingTo(null);
      await loadReplies(commentId);
    } catch { /* failed to post reply */ } finally {
      setPostingReply(false);
    }
  }

  function handleStickerSelect(stickerId: string) {
    setShowStickerPicker(false);
    const numId = stickerId.startsWith("gif_") ? stickerId.replace("gif_", "") : stickerId;
    setNewComment(`[sticker:${numId}]`);
    // Auto-submit the sticker as a comment
    (async () => {
      setPostingComment(true);
      try {
        const endpoint = post.type === "post"
          ? `/social/posts/${post.id}/comments/`
          : `/social/prayers/${post.id}/comments/`;
        await fetchAPI(endpoint, { method: "POST", body: JSON.stringify({ text: `[sticker:${numId}]` }) });
        setNewComment("");
        setCommentCount((c) => c + 1);
        await loadComments();
      } catch { /* failed to post sticker */ } finally {
        setPostingComment(false);
      }
    })();
  }

  function renderCommentText(text: string) {
    const stickerMatch = text.match(/^\[sticker:(\w+)\]$/);
    if (stickerMatch) {
      const stickerId = stickerMatch[1];
      // GIF sticker (gif_1 through gif_87)
      const gifMatch = stickerId.match(/^gif_(\d+)$/);
      if (gifMatch) {
        return <img src={`/stickers/sticker_${gifMatch[1]}.gif`} alt="Sticker" className="w-16 h-16 object-contain" />;
      }
      // Emoji sticker fallback
      const sticker = STICKERS.find((s) => s.id === stickerId);
      if (sticker) {
        return <span className="text-4xl leading-none">{sticker.emoji}</span>;
      }
    }
    return <>{text}</>;
  }

  function renderPostContent(text: string, type: string) {
    return <p className={`text-on-surface leading-relaxed mb-6 ${type === "prayer" ? "italic text-xl" : "text-lg"}`}>{text}</p>;
  }

  const userReactionEmoji = post.userReaction ? REACTIONS.find((r) => r.type === post.userReaction)?.emoji : null;

  return (
    <article data-post-id={post.id} data-post-type={post.type} className="bg-surface-container-lowest rounded-xl p-8 editorial-shadow relative">
      {animatingReaction?.postId === post.id && (
        <div className="reaction-animate top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{animatingReaction.emoji}</div>
      )}

      {post.is_boosted && (
        <div className="absolute top-4 right-4 bg-tertiary-fixed/20 text-tertiary px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
          <span className="material-symbols-outlined text-sm">rocket_launch</span>
          Boosted
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href={`/user/${post.authorId}`} className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center">
            {post.authorPhoto ? <img src={post.authorPhoto} alt={post.author} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-on-surface-variant">person</span>}
          </Link>
          <div>
            <Link href={`/user/${post.authorId}`} className="font-headline text-lg leading-tight hover:text-primary transition-colors">{post.author}</Link>
            <p className="text-xs text-on-surface-variant uppercase tracking-wider">{post.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {currentUserId && post.authorId === currentUserId && (
            <button onClick={() => onDelete(post.id, post.type)} className="text-on-surface-variant hover:text-red-500 transition-colors p-2" title="Delete">
              <span className="material-symbols-outlined">delete</span>
            </button>
          )}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setOpenMenu(!openMenu)} className="text-on-surface-variant hover:text-primary transition-colors p-2">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {openMenu && (
              <div className="absolute right-0 top-full mt-1 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 z-50 overflow-hidden w-44">
                {currentUserId && post.authorId === currentUserId && (
                  <Link href={`/boost?post=${post.id}`} onClick={() => setOpenMenu(false)} className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">rocket_launch</span> Boost Post
                  </Link>
                )}
                <button onClick={() => { onReport(post.type, post.id); setOpenMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">flag</span> Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Link href={`/${post.type === "prayer" ? "prayer" : "post"}/${post.id}`} className="block">
        {post.title && <h3 className="text-2xl font-headline mb-3 hover:text-primary transition-colors">{post.title}</h3>}
        {renderPostContent(post.content, post.type)}
      </Link>

      {(() => {
        const media = post.media && post.media.length > 0 ? post.media : post.image ? [{ file: post.image, media_type: "image" }] : [];
        if (media.length === 0) return null;
        return <PostMediaCarousel media={media} />;
      })()}

      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10" ref={openReactionId === post.id ? reactionRef : undefined}>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <button
              onClick={() => { if (post.userReaction) onReact(post.id, post.type, post.userReaction); else setOpenReactionId(openReactionId === post.id ? null : post.id); }}
              className={`flex items-center space-x-2 transition-all ${post.userReaction ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
            >
              {userReactionEmoji ? <span className="text-xl">{userReactionEmoji}</span> : <span className="material-symbols-outlined">{post.type === "prayer" ? "folded_hands" : "favorite"}</span>}
              <span className="text-sm font-medium">{post.likes || post.prayers || 0}</span>
            </button>
            {openReactionId === post.id && (
              <div className="absolute bottom-full left-0 mb-2 bg-surface-container-lowest rounded-full shadow-xl border border-outline-variant/20 p-1.5 flex items-center gap-1 z-50 animate-in fade-in zoom-in duration-200">
                {REACTIONS.map((r) => (
                  <button key={r.type} onClick={() => onReact(post.id, post.type, r.type)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high hover:scale-125 transition-all">
                    <span className="text-xl">{r.emoji}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={toggleComments} className={`flex items-center space-x-2 transition-colors ${showComments ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}>
            <span className="material-symbols-outlined">chat_bubble</span>
            <span className="text-sm font-medium">{commentCount}</span>
          </button>
        </div>
        <button onClick={() => onShare(post.id, post.type)} className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">share</span></button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-outline-variant/10">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1 relative">
              <input type="text" placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePostComment()} className="w-full bg-surface-container-high rounded-xl px-4 py-2.5 pr-16 text-sm" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <div className="relative">
                  <button onClick={() => setShowStickerPicker(!showStickerPicker)} className="text-on-surface-variant hover:text-primary transition-colors" title="Stickers">
                    <span className="material-symbols-outlined text-lg">sentiment_satisfied</span>
                  </button>
                  {showStickerPicker && (
                    <StickerPicker onSelect={handleStickerSelect} onClose={() => setShowStickerPicker(false)} />
                  )}
                </div>
                <button onClick={handlePostComment} disabled={!newComment.trim() || postingComment} className="text-primary disabled:opacity-30"><span className="material-symbols-outlined text-lg">send</span></button>
              </div>
            </div>
          </div>
          {commentsLoading ? (
            <div className="flex justify-center"><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary"></div></div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.map((c: any) => (
                <div key={c.id}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 bg-surface-container-low rounded-xl px-4 py-2 relative">
                      <div className="flex justify-between items-start">
                        <Link href={`/user/${c.user?.id}`} className="font-semibold text-sm hover:text-primary">{c.user?.full_name || "User"}</Link>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); if (!repliesData[c.id]) loadReplies(c.id); }} className="text-on-surface-variant hover:text-primary transition-colors" title="Reply">
                            <span className="material-symbols-outlined text-xs">reply</span>
                          </button>
                          {currentUserId && c.user?.id === currentUserId && (
                            <button onClick={() => handleDeleteComment(c.id)} className="text-on-surface-variant hover:text-red-500 transition-colors" title="Delete">
                              <span className="material-symbols-outlined text-xs">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant">{renderCommentText(c.text)}</p>
                    </div>
                  </div>
                  {replyingTo === c.id && (
                    <div className="ml-8 mt-2 space-y-2">
                      {repliesLoading === c.id ? (
                        <div className="flex justify-center py-1"><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary"></div></div>
                      ) : (repliesData[c.id] || []).map((r: any) => (
                        <div key={r.id} className="bg-surface-container-high rounded-lg px-3 py-1.5">
                          <span className="font-semibold text-xs">{r.user?.full_name || "User"}</span>
                          <p className="text-xs text-on-surface-variant">{renderCommentText(r.text)}</p>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input type="text" placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePostReply(c.id)} className="flex-1 bg-surface-container-high rounded-lg px-3 py-1.5 text-xs" />
                        <button onClick={() => handlePostReply(c.id)} disabled={!replyText.trim() || postingReply} className="text-primary disabled:opacity-30"><span className="material-symbols-outlined text-sm">send</span></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
