"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "./api";
import { CACHE_DURATIONS } from "./cache";

// ═══════════════════════════════════════════════════════════════
// BIBLE
// ═══════════════════════════════════════════════════════════════

export function useBibles() {
  return useQuery({
    queryKey: ["bibles"],
    queryFn: async () => {
      const res = await fetchAPI("/bible/api-bible/bibles?language=eng");
      return res?.data || [];
    },
    ...CACHE_DURATIONS.bibleVersions,
  });
}

export function useBooks(bibleId: string | null) {
  return useQuery({
    queryKey: ["books", bibleId],
    queryFn: async () => {
      const res = await fetchAPI(`/bible/api-bible/bibles/${bibleId}/books`);
      return res?.data || [];
    },
    enabled: !!bibleId,
    ...CACHE_DURATIONS.bibleVersions,
  });
}

export function useChapters(bibleId: string | null, bookId: string | null) {
  return useQuery({
    queryKey: ["chapters", bibleId, bookId],
    queryFn: async () => {
      const res = await fetchAPI(`/bible/api-bible/bibles/${bibleId}/books/${bookId}/chapters`);
      return (res?.data || []).filter((ch: any) => ch.number !== "intro");
    },
    enabled: !!bibleId && !!bookId,
    ...CACHE_DURATIONS.bibleVersions,
  });
}

export function useChapterContent(bibleId: string | null, chapterId: string | null) {
  return useQuery({
    queryKey: ["chapterContent", bibleId, chapterId],
    queryFn: async () => {
      const res = await fetchAPI(`/bible/api-bible/bibles/${bibleId}/chapters/${chapterId}?content-type=html`);
      return res?.data || null;
    },
    enabled: !!bibleId && !!chapterId,
    ...CACHE_DURATIONS.bibleContent,
  });
}

// ── Study ────────────────────────────────────────────────────

export function useStudySections() {
  return useQuery({
    queryKey: ["studySections"],
    queryFn: async () => {
      const res = await fetchAPI("/bible/sections/");
      return res?.data || [];
    },
    ...CACHE_DURATIONS.segregatedPages,
  });
}

export function useStudyChapters(sectionId: string | null) {
  return useQuery({
    queryKey: ["studyChapters", sectionId],
    queryFn: async () => {
      const res = await fetchAPI(`/bible/sections/${sectionId}/chapters/`);
      return res?.data || [];
    },
    enabled: !!sectionId,
    ...CACHE_DURATIONS.segregatedPages,
  });
}

export function useStudyPages(chapterId: string | null) {
  return useQuery({
    queryKey: ["studyPages", chapterId],
    queryFn: async () => {
      const res = await fetchAPI(`/bible/chapters/${chapterId}/pages/`);
      return res?.data || [];
    },
    enabled: !!chapterId,
    ...CACHE_DURATIONS.segregatedPages,
  });
}

export function useStudyPageDetail(pageId: string | null) {
  return useQuery({
    queryKey: ["studyPageDetail", pageId],
    queryFn: async () => {
      const res = await fetchAPI(`/bible/pages/${pageId}/`);
      return res?.data || null;
    },
    enabled: !!pageId,
    ...CACHE_DURATIONS.segregatedPages,
  });
}

// ── Bible Study Tools ────────────────────────────────────────

export function useBookmarks() {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const res = await fetchAPI("/bible/bookmarks/?type=api_bible");
      return res?.data?.results || res?.results || res?.data || [];
    },
    ...CACHE_DURATIONS.bibleContent,
  });
}

export function useHighlights() {
  return useQuery({
    queryKey: ["highlights"],
    queryFn: async () => {
      const res = await fetchAPI("/bible/highlights/?type=api_bible");
      return res?.data?.results || res?.results || res?.data || [];
    },
    ...CACHE_DURATIONS.bibleContent,
  });
}

export function useNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await fetchAPI("/bible/notes/?type=api_bible");
      return res?.data?.results || res?.results || res?.data || [];
    },
    ...CACHE_DURATIONS.bibleContent,
  });
}

export function useBibleSearch(query: string) {
  return useQuery({
    queryKey: ["bibleSearch", query],
    queryFn: async () => {
      const res = await fetchAPI(`/bible/search/?q=${encodeURIComponent(query)}`);
      return res?.data?.results || res?.results || res?.data || [];
    },
    enabled: !!query.trim(),
    ...CACHE_DURATIONS.segregatedPages,
  });
}

// ═══════════════════════════════════════════════════════════════
// FEED
// ═══════════════════════════════════════════════════════════════

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: async () => {
      const [postsRes, prayersRes] = await Promise.all([
        fetchAPI("/social/posts/").catch(() => null),
        fetchAPI("/social/prayers/").catch(() => null),
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
        is_boosted: p.is_boosted || false,
      });
      const posts = (postsRes?.data?.results ?? postsRes?.results ?? []).map((p: any) => mapItem(p, "post"));
      const prayers = (prayersRes?.data?.results ?? prayersRes?.results ?? []).map((p: any) => mapItem(p, "prayer"));
      return [...posts, ...prayers].sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
    },
    ...CACHE_DURATIONS.feed,
  });
}

export function useVerseOfDay(date: string) {
  return useQuery({
    queryKey: ["verseOfDay", date],
    queryFn: async () => {
      const endpoint = date === new Date().toISOString().split("T")[0] ? "/verse-of-day/today/" : `/verse-of-day/${date}/`;
      const res = await fetchAPI(endpoint);
      const verse = res?.data;
      if (verse?.verse_text) return { text: `"${verse.verse_text}"`, reference: `\u2014 ${verse.bible_reference}` };
      return null;
    },
    ...CACHE_DURATIONS.verseOfDay,
  });
}

// ═══════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetchAPI("/accounts/profile/");
      return res?.data || res;
    },
    ...CACHE_DURATIONS.profile,
  });
}

export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const res = await fetchAPI(`/accounts/users/${userId}/`);
      return res?.data || res;
    },
    enabled: !!userId,
    ...CACHE_DURATIONS.profile,
  });
}

// ═══════════════════════════════════════════════════════════════
// SHOP
// ═══════════════════════════════════════════════════════════════

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetchAPI("/shop/products/");
      return res?.data?.results || res?.results || [];
    },
    ...CACHE_DURATIONS.shopProducts,
  });
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ["productSearch", query],
    queryFn: async () => {
      const res = await fetchAPI(`/shop/products/search/?q=${encodeURIComponent(query)}`);
      return res?.data?.results || res?.results || [];
    },
    enabled: !!query.trim(),
    ...CACHE_DURATIONS.shopProducts,
  });
}

export function usePurchases() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const res = await fetchAPI("/shop/purchases/list/");
      return res?.data?.results || res?.results || res?.data || [];
    },
    ...CACHE_DURATIONS.shopProducts,
  });
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export function useUnreadCount() {
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      const res = await fetchAPI("/notifications/unread-count/");
      return res?.data?.count ?? res?.count ?? 0;
    },
    ...CACHE_DURATIONS.unreadCount,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetchAPI("/notifications/");
      return res?.data?.results || res?.results || [];
    },
    ...CACHE_DURATIONS.notifications,
  });
}

// ═══════════════════════════════════════════════════════════════
// COMMENTS & REPLIES
// ═══════════════════════════════════════════════════════════════

export function useCommentReplies(commentId: string | null) {
  return useQuery({
    queryKey: ["replies", commentId],
    queryFn: async () => {
      const res = await fetchAPI(`/social/comments/${commentId}/replies/`);
      return res?.data?.results ?? res?.results ?? [];
    },
    enabled: !!commentId,
    ...CACHE_DURATIONS.feed,
  });
}

export function useCreateReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, text }: { commentId: string; text: string }) => {
      return fetchAPI(`/social/comments/${commentId}/replies/`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["replies", variables.commentId] });
    },
  });
}

export function useDeleteReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, replyId }: { commentId: string; replyId: string }) => {
      return fetchAPI(`/social/comments/${commentId}/replies/${replyId}/`, { method: "DELETE" });
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["replies", variables.commentId] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// SHARE TRACKING
// ═══════════════════════════════════════════════════════════════

export function useShareContent() {
  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: "post" | "prayer" }) => {
      const endpoint = type === "post" ? `/social/posts/${id}/share/` : `/social/prayers/${id}/share/`;
      return fetchAPI(endpoint);
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// MEDIA UPLOAD
// ═══════════════════════════════════════════════════════════════

export function useMediaUpload() {
  return useMutation({
    mutationFn: async (files: File | File[]) => {
      const formData = new FormData();
      const fileArr = Array.isArray(files) ? files : [files];
      fileArr.forEach((f) => formData.append("files", f));
      const res = await fetchAPI("/social/media/upload/", { method: "POST", body: formData });
      return res.data || res; // returns [{key, url}]
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// SHOP DOWNLOADS
// ═══════════════════════════════════════════════════════════════

export function useDownload() {
  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetchAPI(`/shop/downloads/${productId}/`);
      return res.data?.url || res.url || res.data?.download_url || res.download_url;
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// MUTATIONS (shared)
// ═══════════════════════════════════════════════════════════════

export function useReact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, type, emojiType }: { id: string; type: string; emojiType: string }) => {
      const endpoint = type === "post" ? `/social/posts/${id}/react/` : `/social/prayers/${id}/react/`;
      return fetchAPI(endpoint, { method: "POST", body: JSON.stringify({ emoji_type: emojiType }) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed"] }); },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, body }: { type: "post" | "prayer"; body: Record<string, unknown> }) => {
      const endpoint = type === "post" ? "/social/posts/" : "/social/prayers/";
      return fetchAPI(endpoint, { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed"] }); },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      const endpoint = type === "post" ? `/social/posts/${id}/` : `/social/prayers/${id}/`;
      return fetchAPI(endpoint, { method: "DELETE" });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed"] }); },
  });
}

export function useFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: "follow" | "unfollow" }) => {
      return fetchAPI(`/accounts/users/${userId}/follow/`, { method: action === "follow" ? "POST" : "DELETE" });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile"] }); },
  });
}

export function useAddBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (verseRef: string) => {
      return fetchAPI("/bible/bookmarks/", { method: "POST", body: JSON.stringify({ bookmark_type: "api_bible", verse_reference: verseRef }) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookmarks"] }); },
  });
}

export function useRemoveBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return fetchAPI(`/bible/bookmarks/${id}/`, { method: "DELETE" });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookmarks"] }); },
  });
}

export function useAddHighlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { verse_reference: string; color: string; selected_text: string }) => {
      return fetchAPI("/bible/highlights/", { method: "POST", body: JSON.stringify({ highlight_type: "api_bible", ...data }) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["highlights"] }); },
  });
}

export function useRemoveHighlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return fetchAPI(`/bible/highlights/${id}/`, { method: "DELETE" });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["highlights"] }); },
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { verse_reference: string; text: string }) => {
      return fetchAPI("/bible/notes/", { method: "POST", body: JSON.stringify({ note_type: "api_bible", ...data }) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notes"] }); },
  });
}

export function useRemoveNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return fetchAPI(`/bible/notes/${id}/`, { method: "DELETE" });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notes"] }); },
  });
}
