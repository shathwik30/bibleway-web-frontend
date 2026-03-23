"use client";

import { useState, useRef } from "react";
import { fetchAPI } from "../lib/api";

interface PostingModalProps {
  activeTab: "post" | "prayer";
  onClose: () => void;
  onPostCreated: () => void;
}

export default function PostingModal({ activeTab, onClose, onPostCreated }: PostingModalProps) {
  const [postTitle, setPostTitle] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("draft_title") || "";
    return "";
  });
  const [postContent, setPostContent] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("draft_content") || "";
    return "";
  });
  const [posting, setPosting] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const userName = typeof window !== "undefined"
    ? (() => { try { return JSON.parse(localStorage.getItem("user") || "{}").full_name; } catch { return null; } })()
    : null;

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    setMediaPreview(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetchAPI("/social/media/upload/", {
        method: "POST",
        body: formData,
      });
      setMediaId(res.data?.id || res.id);
    } catch (err) {
      console.error("Media upload failed:", err);
      setMediaPreview(null);
    } finally {
      setUploadingMedia(false);
    }
  }

  async function handleCreatePost() {
    if (!postContent.trim() || posting) return;
    setPosting(true);
    try {
      const endpoint = activeTab === "post" ? "/social/posts/" : "/social/prayers/";
      const body: Record<string, unknown> = activeTab === "post"
        ? { text_content: postContent }
        : { title: postTitle || "Prayer Request", description: postContent };
      if (mediaId) body.media_ids = [mediaId];

      await fetchAPI(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (typeof window !== "undefined") {
        localStorage.removeItem("draft_content");
        localStorage.removeItem("draft_title");
      }
      onClose();
      onPostCreated();
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 modal-overlay"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-2xl rounded-[2.5rem] overflow-hidden editorial-shadow shadow-2xl modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div>
              <h2 className="text-xl font-headline text-on-surface">
                {activeTab === "post" ? "Create Post" : "Prayer Request"}
              </h2>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                Posting as <span className="text-primary">{userName || "You"}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-8 pb-8 pt-4 space-y-6">
          {mediaPreview && (
            <div className="relative">
              <img src={mediaPreview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl" />
              <button onClick={() => { setMediaPreview(null); setMediaId(null); }} className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {activeTab === "prayer" && (
            <div className="relative">
              <input
                type="text"
                placeholder="Subject of your prayer..."
                value={postTitle}
                onChange={(e) => { setPostTitle(e.target.value); localStorage.setItem("draft_title", e.target.value); }}
                className="w-full bg-transparent border-b border-outline-variant/30 px-0 py-3 focus:outline-none focus:border-primary transition-colors text-2xl font-headline placeholder:text-on-surface-variant/30"
              />
            </div>
          )}

          <div className="relative min-h-[240px]">
            <textarea
              rows={8}
              placeholder={activeTab === "post" ? "What's on your heart today?" : "Describe your prayer request..."}
              value={postContent}
              onChange={(e) => { setPostContent(e.target.value); localStorage.setItem("draft_content", e.target.value); }}
              className="w-full bg-transparent p-0 focus:outline-none resize-none text-xl md:text-2xl font-body leading-relaxed placeholder:text-on-surface-variant/20 no-scrollbar"
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
            <div className="flex gap-2">
              <button onClick={() => mediaInputRef.current?.click()} className="flex items-center gap-3 text-on-surface-variant font-bold text-xs uppercase tracking-widest py-3 px-5 rounded-full hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined text-lg">{uploadingMedia ? "hourglass_empty" : "image"}</span>
                {uploadingMedia ? "Uploading..." : "Add Media"}
              </button>
              <input type="file" ref={mediaInputRef} onChange={handleMediaUpload} className="hidden" accept="image/*,video/*" />
            </div>

            <button
              onClick={handleCreatePost}
              disabled={!postContent.trim() || posting}
              className="bg-linear-to-br from-primary to-primary-container text-on-primary px-10 py-3.5 rounded-full font-bold uppercase tracking-[0.15em] text-[11px] disabled:opacity-30 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {posting ? "Publishing..." : activeTab === "post" ? "Publish Post" : "Submit Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
