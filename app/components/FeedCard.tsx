"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchAPI } from "../lib/api";

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
  likes: number;
  prayers?: number;
  comments: number;
  type: "post" | "prayer";
  userReaction: string | null;
}

const REACTIONS = [
  { type: "praying_hands", emoji: "\u{1F64F}", label: "Praying Hands" },
  { type: "heart", emoji: "\u2764\uFE0F", label: "Heart" },
  { type: "fire", emoji: "\u{1F525}", label: "Fire" },
  { type: "amen", emoji: "\u{1F64C}", label: "Amen" },
  { type: "cross", emoji: "\u271D\uFE0F", label: "Cross" },
];

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

  async function loadComments() {
    setCommentsLoading(true);
    try {
      const endpoint = post.type === "post"
        ? `/social/posts/${post.id}/comments/`
        : `/social/prayers/${post.id}/comments/`;
      const res = await fetchAPI(endpoint);
      setComments(res?.data?.results ?? res?.results ?? []);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
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
    setPostingComment(true);
    try {
      const endpoint = post.type === "post"
        ? `/social/posts/${post.id}/comments/`
        : `/social/prayers/${post.id}/comments/`;
      await fetchAPI(endpoint, { method: "POST", body: JSON.stringify({ text: newComment.trim() }) });
      setNewComment("");
      setCommentCount((c) => c + 1);
      await loadComments();
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setPostingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("Delete comment?")) return;
    try {
      await fetchAPI(`/social/comments/${commentId}/`, { method: "DELETE" });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  }

  async function loadReplies(commentId: string) {
    setRepliesLoading(commentId);
    try {
      const res = await fetchAPI(`/social/comments/${commentId}/replies/`);
      setRepliesData((prev) => ({ ...prev, [commentId]: res?.data?.results ?? res?.results ?? [] }));
    } catch (err) {
      console.error("Failed to load replies:", err);
    } finally {
      setRepliesLoading(null);
    }
  }

  async function handlePostReply(commentId: string) {
    if (!replyText.trim() || postingReply) return;
    setPostingReply(true);
    try {
      await fetchAPI(`/social/comments/${commentId}/replies/`, { method: "POST", body: JSON.stringify({ text: replyText.trim() }) });
      setReplyText("");
      setReplyingTo(null);
      await loadReplies(commentId);
    } catch (err) {
      console.error("Failed to post reply:", err);
    } finally {
      setPostingReply(false);
    }
  }

  const userReactionEmoji = post.userReaction ? REACTIONS.find((r) => r.type === post.userReaction)?.emoji : null;

  return (
    <article data-post-id={post.id} data-post-type={post.type} className="bg-surface-container-lowest rounded-xl p-8 editorial-shadow relative card-hover">
      {animatingReaction?.postId === post.id && (
        <div className="reaction-animate top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{animatingReaction.emoji}</div>
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
          <div className="relative">
            <button onClick={() => setOpenMenu(!openMenu)} className="text-on-surface-variant hover:text-primary transition-colors p-2">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {openMenu && (
              <div className="absolute right-0 top-full mt-1 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 z-50 overflow-hidden w-36">
                <button onClick={() => { onReport(post.type, post.id); setOpenMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">flag</span> Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Link href={`/${post.type === "prayer" ? "prayer" : "post"}/${post.id}`} className="block group/link">
        {post.title && <h3 className="text-2xl font-headline mb-3 group-hover/link:text-primary transition-colors">{post.title}</h3>}
        <p className={`text-on-surface leading-relaxed mb-6 ${post.type === "prayer" ? "italic text-xl" : "text-lg"}`}>{post.content}</p>
      </Link>

      {post.image && (
        <div className="rounded-xl overflow-hidden mb-6 max-h-96 bg-surface-container-low flex items-center justify-center img-zoom">
          <img src={post.image} alt="Post media" className="w-full h-full object-cover" />
        </div>
      )}

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
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-xl border p-1.5 flex items-center gap-1 z-50 animate-in fade-in zoom-in duration-200">
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
              <input type="text" placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePostComment()} className="w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm" />
              <button onClick={handlePostComment} disabled={!newComment.trim() || postingComment} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary disabled:opacity-30"><span className="material-symbols-outlined text-lg">send</span></button>
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
                      <p className="text-sm text-on-surface-variant">{c.text}</p>
                    </div>
                  </div>
                  {replyingTo === c.id && (
                    <div className="ml-8 mt-2 space-y-2">
                      {repliesLoading === c.id ? (
                        <div className="flex justify-center py-1"><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary"></div></div>
                      ) : (repliesData[c.id] || []).map((r: any) => (
                        <div key={r.id} className="bg-surface-container-high rounded-lg px-3 py-1.5">
                          <span className="font-semibold text-xs">{r.user?.full_name || "User"}</span>
                          <p className="text-xs text-on-surface-variant">{r.text}</p>
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
