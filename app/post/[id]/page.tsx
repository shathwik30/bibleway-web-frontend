"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MainLayout from "../../components/MainLayout";
import { fetchAPI } from "../../lib/api";

const REACTIONS = [
  { type: "praying_hands", emoji: "🙏", label: "Praying Hands" },
  { type: "heart", emoji: "❤️", label: "Heart" },
  { type: "fire", emoji: "🔥", label: "Fire" },
  { type: "amen", emoji: "🙌", label: "Amen" },
  { type: "cross", emoji: "✝️", label: "Cross" },
];

export default function SinglePostPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [openReaction, setOpenReaction] = useState(false);
  const reactionRef = useRef<HTMLDivElement>(null);
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  useEffect(() => {
    if (!postId) return;
    async function load() {
      try {
        const res = await fetchAPI(`/social/posts/${postId}/`);
        const data = res.data || res;
        setPost(data);
        loadComments();
      } catch (err) {
        console.error("Failed to load post:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId]);

  async function loadComments() {
    setCommentsLoading(true);
    try {
      const res = await fetchAPI(`/social/posts/${postId}/comments/`);
      setComments(res?.data?.results ?? res?.results ?? []);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleReact(emojiType: string) {
    setOpenReaction(false);
    try {
      const res = await fetchAPI(`/social/posts/${postId}/react/`, {
        method: "POST",
        body: JSON.stringify({ emoji_type: emojiType }),
      });
      const wasRemoved = res?.message === "Reaction removed.";
      setPost((p: any) => ({
        ...p,
        reaction_count: wasRemoved ? Math.max(0, (p.reaction_count || 0) - 1) : (p.reaction_count || 0) + 1,
        user_reaction: wasRemoved ? null : emojiType,
      }));
    } catch (err) {
      console.error("React failed:", err);
    }
  }

  async function handlePostComment() {
    if (!newComment.trim() || postingComment) return;
    setPostingComment(true);
    try {
      await fetchAPI(`/social/posts/${postId}/comments/`, {
        method: "POST",
        body: JSON.stringify({ text: newComment.trim() }),
      });
      setNewComment("");
      await loadComments();
      setPost((p: any) => ({ ...p, comment_count: (p.comment_count || 0) + 1 }));
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
      setPost((p: any) => ({ ...p, comment_count: Math.max(0, (p.comment_count || 0) - 1) }));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl font-headline mb-4">Post Not Found</h1>
          <Link href="/" className="text-primary font-bold">Go Home</Link>
        </div>
      </MainLayout>
    );
  }

  const userReactionEmoji = post.user_reaction ? REACTIONS.find((r) => r.type === post.user_reaction)?.emoji : null;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="text-sm font-medium">Back to Feed</span>
        </Link>

        <article className="bg-surface-container-lowest rounded-xl p-8 editorial-shadow">
          <div className="flex items-center space-x-4 mb-6">
            <Link href={`/user/${post.author?.id}`} className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center">
              {post.author?.profile_photo ? (
                <img src={post.author.profile_photo} alt={post.author.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              )}
            </Link>
            <div>
              <Link href={`/user/${post.author?.id}`} className="font-headline text-lg hover:text-primary transition-colors">{post.author?.full_name || "Anonymous"}</Link>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <p className="text-on-surface text-lg leading-relaxed mb-6">{post.text_content}</p>

          {post.media?.[0] && (
            <div className="rounded-xl overflow-hidden mb-6 max-h-[500px] bg-surface-container-low flex items-center justify-center">
              <img src={post.media[0].file} alt="Post media" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10" ref={reactionRef}>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <button
                  onClick={() => {
                    if (post.user_reaction) handleReact(post.user_reaction);
                    else setOpenReaction(!openReaction);
                  }}
                  className={`flex items-center space-x-2 transition-all ${post.user_reaction ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
                >
                  {userReactionEmoji ? <span className="text-xl">{userReactionEmoji}</span> : <span className="material-symbols-outlined">favorite</span>}
                  <span className="text-sm font-medium">{post.reaction_count || 0}</span>
                </button>
                {openReaction && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-xl border p-1.5 flex items-center gap-1 z-50">
                    {REACTIONS.map((r) => (
                      <button key={r.type} onClick={() => handleReact(r.type)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high hover:scale-125 transition-all">
                        <span className="text-xl">{r.emoji}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="flex items-center space-x-2 text-on-surface-variant">
                <span className="material-symbols-outlined">chat_bubble</span>
                <span className="text-sm font-medium">{post.comment_count || 0}</span>
              </span>
            </div>
          </div>
        </article>

        {/* Comments */}
        <div className="mt-8 space-y-4">
          <h3 className="font-headline text-xl">Comments</h3>
          <div className="flex items-start gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm"
              />
              <button onClick={handlePostComment} disabled={!newComment.trim() || postingComment} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary disabled:opacity-30">
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>

          {commentsLoading ? (
            <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary"></div></div>
          ) : (
            <div className="space-y-3">
              {comments.map((c: any) => (
                <div key={c.id} className="bg-surface-container-low rounded-xl px-4 py-3">
                  <div className="flex justify-between items-start">
                    <Link href={`/user/${c.user?.id}`} className="font-semibold text-sm hover:text-primary">{c.user?.full_name || "User"}</Link>
                    {currentUserId && c.user?.id === currentUserId && (
                      <button onClick={() => handleDeleteComment(c.id)} className="text-on-surface-variant hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-xs">delete</span>
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
