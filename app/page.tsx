"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import MainLayout from "./components/MainLayout";
import { fetchAPI } from "./lib/api";
import Shimmer from "./components/Shimmer";
import FeedCard from "./components/FeedCard";
import PostingModal from "./components/PostingModal";
import { useTranslation } from "./lib/i18n";

const BACKGROUNDS = [
  "mountain-bg.png",
  "forest-bg.png",
  "ocean-bg.png",
  "aurora-bg.png",
  "desert-bg.png"
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"post" | "prayer">("post");
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [verseData, setVerseData] = useState({
    text: '"Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth."',
    reference: "\u2014 Psalm 46:10",
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // UI State
  const [openReactionId, setOpenReactionId] = useState<string | null>(null);
  const [animatingReaction, setAnimatingReaction] = useState<{ postId: string; emoji: string } | null>(null);
  const [showPostingModal, setShowPostingModal] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: string; id: string } | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // View tracking
  const viewedPosts = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Verse navigation
  const [verseDate, setVerseDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const today = new Date().toISOString().split("T")[0];

  const { t } = useTranslation();
  const reactionRef = useRef<HTMLDivElement>(null);
  const [bgIndex] = useState(() => typeof window !== "undefined" ? new Date().getDay() % BACKGROUNDS.length : 0);
  const currentBg = BACKGROUNDS[bgIndex];

  // Close reaction picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (reactionRef.current && !reactionRef.current.contains(e.target as Node)) {
        setOpenReactionId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadFeed() {
    setLoading(true);
    setFeedError(null);
    try {
      const [postsRes, prayersRes] = await Promise.all([
        fetchAPI("/social/posts/").catch(() => null),
        fetchAPI("/social/prayers/").catch(() => null)
      ]);

      const mapItem = (p: any, type: "post" | "prayer") => ({
        id: p.id,
        author: p.author?.full_name || "Anonymous",
        authorId: p.author?.id,
        authorPhoto: p.author?.profile_photo,
        time: new Date(p.created_at).toLocaleDateString(),
        rawDate: p.created_at,
        title: p.title,
        content: type === "post" ? p.text_content : p.description,
        image: p.media?.[0]?.file,
        likes: p.reaction_count ?? 0,
        prayers: type === "prayer" ? (p.reaction_count ?? 0) : undefined,
        comments: p.comment_count ?? 0,
        type,
        userReaction: p.user_reaction || null,
      });

      const posts = (postsRes?.data?.results ?? postsRes?.results ?? []).map((p: any) => mapItem(p, "post"));
      const prayers = (prayersRes?.data?.results ?? prayersRes?.results ?? []).map((p: any) => mapItem(p, "prayer"));

      setFeedPosts([...posts, ...prayers].sort((a, b) =>
        new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
      ));
    } catch (err) {
      console.error("Failed to load feed:", err);
      setFeedError("Failed to load feed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    setIsLoggedIn(!!token);
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("user_id");
      if (storedId) setCurrentUserId(storedId);
    }

    async function loadInitialData() {
      try {
        const verseRes = await fetchAPI("/verse-of-day/today/").catch(() => null);
        const verse = verseRes?.data;
        if (verse?.verse_text) {
          setVerseData({ text: `"${verse.verse_text}"`, reference: `\u2014 ${verse.bible_reference}` });
        }
      } catch {}

      if (typeof window !== "undefined") {
        const dTab = localStorage.getItem("draft_tab");
        if (dTab === "post" || dTab === "prayer") setActiveTab(dTab);
      }
      await loadFeed();
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("draft_tab", activeTab);
  }, [activeTab]);

  const displayedPosts = feedPosts.filter((post) => post.type === activeTab);

  const REACTIONS = [
    { type: "praying_hands", emoji: "\u{1F64F}" },
    { type: "heart", emoji: "\u2764\uFE0F" },
    { type: "fire", emoji: "\u{1F525}" },
    { type: "amen", emoji: "\u{1F64C}" },
    { type: "cross", emoji: "\u271D\uFE0F" },
  ];

  async function handleReact(postId: string, postType: string, emojiType: string) {
    const emoji = REACTIONS.find(r => r.type === emojiType)?.emoji || "\u2764\uFE0F";
    setAnimatingReaction({ postId, emoji });
    setTimeout(() => setAnimatingReaction(null), 700);
    setOpenReactionId(null);

    try {
      const endpoint = postType === "post" ? `/social/posts/${postId}/react/` : `/social/prayers/${postId}/react/`;
      const res = await fetchAPI(endpoint, { method: "POST", body: JSON.stringify({ emoji_type: emojiType }) });
      const wasRemoved = res?.message === "Reaction removed.";
      setFeedPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const countKey = postType === "post" ? "likes" : "prayers";
        return { ...p, [countKey]: wasRemoved ? Math.max(0, (p[countKey] || 0) - 1) : (p[countKey] || 0) + 1, userReaction: wasRemoved ? null : emojiType };
      }));
    } catch (err: unknown) {
      console.error("React failed:", err);
      if ((err as Error)?.message?.includes("token")) alert("Session expired. Please log in again.");
    }
  }

  async function handleShare(postId: string, postType: string) {
    const fallbackUrl = `${window.location.origin}/${postType === "prayer" ? "prayer" : "post"}/${postId}`;
    try {
      const endpoint = postType === "post" ? `/social/posts/${postId}/share/` : `/social/prayers/${postId}/share/`;
      const res = await fetchAPI(endpoint).catch(() => null);
      await navigator.clipboard.writeText(res?.data?.url || res?.url || fallbackUrl);
    } catch {
      await navigator.clipboard.writeText(fallbackUrl).catch(() => { prompt("Copy this link:", fallbackUrl); });
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  }

  async function handleReport() {
    if (!reportTarget || !reportReason.trim() || reportSubmitting) return;
    setReportSubmitting(true);
    try {
      await fetchAPI("/social/reports/", { method: "POST", body: JSON.stringify({ content_type: reportTarget.type, object_id: reportTarget.id, reason: reportReason }) });
      alert("Report submitted. Thank you.");
      setReportTarget(null);
      setReportReason("");
    } catch (err) {
      console.error("Report failed:", err);
    } finally {
      setReportSubmitting(false);
    }
  }

  async function navigateVerse(direction: -1 | 1) {
    const d = new Date(verseDate);
    d.setDate(d.getDate() + direction);
    const newDate = d.toISOString().split("T")[0];
    if (newDate > today) return;
    setVerseDate(newDate);
    try {
      const res = await fetchAPI(`/verse-of-day/${newDate}/`);
      const verse = res?.data;
      if (verse?.verse_text) setVerseData({ text: `"${verse.verse_text}"`, reference: `\u2014 ${verse.bible_reference}` });
    } catch (err) {
      console.error("Failed to load verse:", err);
    }
  }

  const trackView = useCallback((postId: string, postType: string) => {
    if (viewedPosts.current.has(postId)) return;
    viewedPosts.current.add(postId);
    fetchAPI("/analytics/views/", { method: "POST", body: JSON.stringify({ content_type: postType, object_id: postId }) }).catch(() => {});
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          if (el.dataset.postId && el.dataset.postType) trackView(el.dataset.postId, el.dataset.postType);
        }
      });
    }, { threshold: 0.5 });
    return () => observerRef.current?.disconnect();
  }, [trackView]);

  useEffect(() => {
    if (!observerRef.current || loading) return;
    const articles = document.querySelectorAll("[data-post-id]");
    articles.forEach((el) => observerRef.current?.observe(el));
    return () => articles.forEach((el) => observerRef.current?.unobserve(el));
  }, [feedPosts, loading, activeTab]);

  async function handleDelete(id: string, type: string) {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await fetchAPI(type === "post" ? `/social/posts/${id}/` : `/social/prayers/${id}/`, { method: "DELETE" });
      setFeedPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const ShimmerPost = () => (
    <div className="bg-surface-container-lowest rounded-xl p-8 editorial-shadow">
      <div className="flex items-center space-x-4 mb-6"><Shimmer className="w-12 h-12 rounded-full" /><div className="space-y-2"><Shimmer className="h-4 w-32" /><Shimmer className="h-3 w-16" /></div></div>
      <div className="space-y-3 mb-6"><Shimmer className="h-4 w-full" /><Shimmer className="h-4 w-5/6" /><Shimmer className="h-4 w-4/6" /></div>
      <div className="h-8 w-full border-t border-outline-variant/10 pt-4 flex gap-6"><Shimmer className="h-6 w-12" /><Shimmer className="h-6 w-12" /></div>
    </div>
  );

  return (
    <MainLayout>
      <style jsx global>{`
        @keyframes reactionPop { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.4); opacity: 1; } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 0; } }
        .reaction-animate { animation: reactionPop 0.7s ease-out forwards; position: absolute; font-size: 2rem; pointer-events: none; z-index: 50; }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col xl:flex-row gap-12">
        <section className="flex-1 space-y-12">
          {/* Verse Header */}
          <div className="relative overflow-hidden rounded-xl bg-primary-container text-white p-8 md:p-12 editorial-shadow min-h-[300px] flex items-center" style={{ backgroundImage: `url('/${currentBg}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="relative z-10 w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block text-[10px] font-label uppercase bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full tracking-widest">{verseDate === today ? t("feed.verseOfDay") : verseDate}</span>
                <div className="flex gap-2">
                  <button onClick={() => navigateVerse(-1)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                  <button onClick={() => navigateVerse(1)} disabled={verseDate >= today} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-30"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                </div>
              </div>
              <blockquote className="text-4xl md:text-5xl font-headline leading-tight mb-4 max-w-3xl">{verseData.text}</blockquote>
              <cite className="text-base text-white/80 font-body">{verseData.reference}</cite>
            </div>
          </div>

          {/* Feed Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-10">
              <button onClick={() => setActiveTab("post")} className={`pb-2 border-b-2 transition-all font-medium tracking-wide ${activeTab === "post" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"}`}>{t("feed.posts")}</button>
              <button onClick={() => setActiveTab("prayer")} className={`pb-2 border-b-2 transition-all font-medium tracking-wide ${activeTab === "prayer" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"}`}>{t("feed.prayers")}</button>
            </div>
            {isLoggedIn && (
              <button onClick={() => setShowPostingModal(true)} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-lg">add</span>
                {activeTab === "post" ? t("feed.createPost") : t("feed.createPrayer")}
              </button>
            )}
          </div>

          {/* Feed */}
          <div className="space-y-8 stagger-children">
            {feedError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center">
                {feedError} <button onClick={loadFeed} className="font-bold underline ml-2">Retry</button>
              </div>
            )}
            {loading ? (<><ShimmerPost /><ShimmerPost /><ShimmerPost /></>) : displayedPosts.length > 0 ? (
              displayedPosts.map((post) => (
                <FeedCard key={post.id} post={post} currentUserId={currentUserId} onReact={handleReact} onDelete={handleDelete} onShare={handleShare} onReport={(type, id) => setReportTarget({ type, id })} animatingReaction={animatingReaction} openReactionId={openReactionId} setOpenReactionId={setOpenReactionId} reactionRef={reactionRef} />
              ))
            ) : (
              <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-dashed text-on-surface-variant">{activeTab === "post" ? t("feed.noPostsYet") : t("feed.noPrayersYet")}</div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="hidden xl:block w-80 space-y-8">
          {/* Trending Posts */}
          <div className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <h3 className="font-headline text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">trending_up</span>
              Trending
            </h3>
            <div className="space-y-3">
              {feedPosts.filter(p => p.type === "post").sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 3).map((p, i) => (
                <Link href={`/post/${p.id}`} key={p.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-all group">
                  <span className="text-xs font-bold text-primary/40 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface line-clamp-2 group-hover:text-primary transition-colors">{p.content}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{p.author} &middot; {p.likes || 0} {REACTIONS[0].emoji}</p>
                  </div>
                </Link>
              ))}
              {feedPosts.filter(p => p.type === "post").length === 0 && (
                <p className="text-xs text-on-surface-variant text-center py-2">{t("common.empty")}</p>
              )}
            </div>
          </div>

          {/* Prayer Wall */}
          <div className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <h3 className="font-headline text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">folded_hands</span>
              {t("feed.prayers")}
            </h3>
            <div className="space-y-3">
              {feedPosts.filter(p => p.type === "prayer").slice(0, 3).map((p) => (
                <Link href={`/prayer/${p.id}`} key={p.id} className="block p-3 rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low transition-all group">
                  <p className="text-sm font-headline text-on-surface group-hover:text-primary transition-colors line-clamp-1">{p.title || "Prayer"}</p>
                  <p className="text-xs text-on-surface-variant italic line-clamp-2 mt-1">{p.content}</p>
                  <p className="text-xs text-on-surface-variant/60 mt-2">{p.author}</p>
                </Link>
              ))}
              {feedPosts.filter(p => p.type === "prayer").length === 0 && (
                <p className="text-xs text-on-surface-variant text-center py-2">{t("common.empty")}</p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <div className="space-y-1">
              <Link href="/bible" className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all text-sm font-medium">
                <span className="material-symbols-outlined text-lg">menu_book</span> {t("bible.bible")}
              </Link>
              <Link href="/shop" className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all text-sm font-medium">
                <span className="material-symbols-outlined text-lg">shopping_bag</span> {t("shop.shop")}
              </Link>
              <Link href="/analytics" className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all text-sm font-medium">
                <span className="material-symbols-outlined text-lg">analytics</span> {t("analytics.analytics")}
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all text-sm font-medium">
                <span className="material-symbols-outlined text-lg">settings</span> {t("settings.settings")}
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {showPostingModal && <PostingModal activeTab={activeTab} onClose={() => setShowPostingModal(false)} onPostCreated={loadFeed} />}

      {shareToast && <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface px-6 py-3 rounded-full shadow-xl z-[200] text-sm font-medium toast-enter">{t("feed.linkCopied")}</div>}

      {reportTarget && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 modal-overlay" onClick={() => setReportTarget(null)}>
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl p-8 editorial-shadow modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-headline text-xl mb-4">{t("feed.reportContent")}</h3>
            <textarea placeholder={t("feed.reportReason")} value={reportReason} onChange={(e) => setReportReason(e.target.value)} rows={3} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary/40 text-sm mb-4 resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setReportTarget(null)} className="flex-1 py-3 rounded-xl bg-surface-container-low text-on-surface-variant font-semibold">Cancel</button>
              <button onClick={handleReport} disabled={reportSubmitting || !reportReason.trim()} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50">{reportSubmitting ? "Submitting..." : "Report"}</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
