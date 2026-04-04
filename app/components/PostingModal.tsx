"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { fetchAPI } from "../lib/api";
import ImageCropper from "./ImageCropper";
import StickerPicker from "./StickerPicker";

interface PostingModalProps {
  activeTab: "post" | "prayer";
  onClose: () => void;
  onPostCreated: () => void;
}

export default function PostingModal({ activeTab: initialTab, onClose, onPostCreated }: PostingModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [postTitle, setPostTitle] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("draft_title") || "";
    return "";
  });
  const [postContent, setPostContent] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("draft_content") || "";
    return "";
  });
  const [posting, setPosting] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [mediaKeys, setMediaKeys] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [cropQueue, setCropQueue] = useState<{ file: File; src: string }[]>([]);
  const [croppedFiles, setCroppedFiles] = useState<File[]>([]);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const userName = typeof window !== "undefined"
    ? (() => { try { return JSON.parse(localStorage.getItem("user") || "{}").full_name; } catch { return null; } })()
    : null;

  function handleMediaSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (mediaInputRef.current) mediaInputRef.current.value = "";

    const remaining = 10 - mediaKeys.length;
    const selected = Array.from(files).slice(0, remaining);
    if (selected.length === 0) return;

    // Videos go straight to upload, images go to crop queue
    const videos = selected.filter((f) => f.type.startsWith("video/"));
    const images = selected.filter((f) => !f.type.startsWith("video/"));

    if (videos.length > 0) uploadFiles(videos);

    if (images.length > 0) {
      const queue = images.map((f) => ({ file: f, src: URL.createObjectURL(f) }));
      setCropQueue(queue);
    }
  }

  function handleCropDone(blob: Blob) {
    const current = cropQueue[0];
    const file = new File([blob], current.file.name, { type: "image/jpeg" });
    setCroppedFiles((prev) => [...prev, file]);
    URL.revokeObjectURL(current.src);
    const remaining = cropQueue.slice(1);
    setCropQueue(remaining);

    // If no more to crop, upload all cropped files
    if (remaining.length === 0) {
      setCroppedFiles((prev) => {
        const allFiles = [...prev, file];
        uploadFiles(allFiles);
        return [];
      });
    }
  }

  function handleCropSkip() {
    const current = cropQueue[0];
    // Use original file without cropping
    setCroppedFiles((prev) => [...prev, current.file]);
    URL.revokeObjectURL(current.src);
    const remaining = cropQueue.slice(1);
    setCropQueue(remaining);

    if (remaining.length === 0) {
      setCroppedFiles((prev) => {
        const allFiles = [...prev, current.file];
        uploadFiles(allFiles);
        return [];
      });
    }
  }

  async function uploadFiles(files: File[]) {
    setUploadingMedia(true);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setMediaPreviews((prev) => [...prev, ...newPreviews]);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const res = await fetchAPI("/social/media/upload/", { method: "POST", body: formData });
      const results: { key: string; url: string }[] = res.data || res || [];
      const newKeys = results.map((r) => r.key);
      const newTypes = files.map((f) => f.type.startsWith("video/") ? "video" : "image");
      setMediaKeys((prev) => [...prev, ...newKeys]);
      setMediaTypes((prev) => [...prev, ...newTypes]);
    } catch {
      setMediaPreviews((prev) => prev.slice(0, prev.length - newPreviews.length));
    } finally {
      setUploadingMedia(false);
    }
  }

  function removeMedia(index: number) {
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    setMediaKeys((prev) => prev.filter((_, i) => i !== index));
    setMediaTypes((prev) => prev.filter((_, i) => i !== index));
  }

  function handleStickerSelect(stickerId: string) {
    setSelectedSticker(stickerId);
    setShowStickerPicker(false);
  }

  function clearSticker() {
    setSelectedSticker(null);
  }

  function getStickerPreview(stickerId: string) {
    const gifMatch = stickerId.match(/^gif_(\d+)$/);
    if (gifMatch) {
      return <img src={`/stickers/sticker_${gifMatch[1]}.gif`} alt="Sticker" className="w-20 h-20 object-contain" />;
    }
    return <span className="text-5xl">{stickerId}</span>;
  }

  async function handleCreatePost() {
    const hasText = postContent.trim().length > 0;
    const hasSticker = !!selectedSticker;
    const hasMedia = mediaKeys.length > 0;
    if ((!hasText && !hasSticker && !hasMedia) || posting) return;
    setPosting(true);
    try {
      const endpoint = activeTab === "post" ? "/social/posts/" : "/social/prayers/";
      const numId = selectedSticker?.startsWith("gif_") ? selectedSticker.replace("gif_", "") : selectedSticker;
      const textValue = hasSticker && !hasText ? `[sticker:${numId}]` : postContent;
      const body: Record<string, unknown> = activeTab === "post"
        ? { text_content: textValue }
        : { title: postTitle || "Prayer Request", description: textValue };
      if (mediaKeys.length > 0) {
        body.media_keys = mediaKeys;
        body.media_types = mediaTypes;
      }

      await fetchAPI(endpoint, { method: "POST", body: JSON.stringify(body) });

      if (typeof window !== "undefined") {
        localStorage.removeItem("draft_content");
        localStorage.removeItem("draft_title");
      }
      onClose();
      onPostCreated();
    } catch { /* failed to create post */ } finally {
      setPosting(false);
    }
  }

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const modal = (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/10 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-xl">
                {activeTab === "post" ? "edit" : "folded_hands"}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-headline text-on-surface">
                {activeTab === "post" ? "Create Post" : "Prayer Request"}
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                Posting as <span className="text-primary">{userName || "You"}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 sm:px-8 flex gap-4 border-b border-outline-variant/10">
          <button
            onClick={() => setActiveTab("post")}
            className={`pb-2.5 text-sm font-semibold transition-all border-b-2 ${activeTab === "post" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
          >
            Post
          </button>
          <button
            onClick={() => setActiveTab("prayer")}
            className={`pb-2.5 text-sm font-semibold transition-all border-b-2 ${activeTab === "prayer" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
          >
            Prayer Request
          </button>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6 space-y-4 overflow-y-auto flex-1">
          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {mediaPreviews.map((preview, i) => (
                <div key={i} className="relative">
                  <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-32 object-cover rounded-xl" />
                  <button onClick={() => removeMedia(i)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "prayer" && (
            <input
              type="text"
              placeholder="Subject of your prayer..."
              value={postTitle}
              onChange={(e) => { setPostTitle(e.target.value); localStorage.setItem("draft_title", e.target.value); }}
              className="w-full bg-transparent border-b border-outline-variant/30 px-0 py-3 focus:outline-none focus:border-primary transition-colors text-xl font-headline placeholder:text-on-surface-variant/30 text-on-surface"
            />
          )}

          {selectedSticker && (
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
              {getStickerPreview(selectedSticker)}
              <button onClick={clearSticker} className="w-6 h-6 bg-black/10 rounded-full flex items-center justify-center hover:bg-black/20 transition-colors">
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
          )}

          <textarea
            rows={6}
            placeholder={selectedSticker ? "Add a caption (optional)..." : activeTab === "post" ? "What's on your heart today?" : "Describe your prayer request..."}
            value={postContent}
            onChange={(e) => { setPostContent(e.target.value); localStorage.setItem("draft_content", e.target.value); }}
            className="w-full bg-transparent p-0 focus:outline-none resize-none text-lg font-body leading-relaxed placeholder:text-on-surface-variant/20 text-on-surface no-scrollbar min-h-[160px]"
          />
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-outline-variant/10 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button onClick={() => mediaInputRef.current?.click()} disabled={mediaKeys.length >= 10} className="flex items-center gap-2 text-on-surface-variant font-bold text-xs uppercase tracking-widest py-2.5 px-4 rounded-full hover:bg-surface-container-high transition-all disabled:opacity-30">
              <span className="material-symbols-outlined text-lg">{uploadingMedia ? "hourglass_empty" : "image"}</span>
              {uploadingMedia ? "Uploading..." : mediaKeys.length > 0 ? `Media (${mediaKeys.length}/10)` : "Media"}
            </button>
            <input type="file" ref={mediaInputRef} onChange={handleMediaSelect} className="hidden" accept="image/*,video/*" multiple />
            <div className="relative">
              <button onClick={() => setShowStickerPicker(!showStickerPicker)} className="flex items-center gap-2 text-on-surface-variant font-bold text-xs uppercase tracking-widest py-2.5 px-4 rounded-full hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined text-lg">sentiment_satisfied</span>
                Sticker
              </button>
              {showStickerPicker && (
                <StickerPicker onSelect={handleStickerSelect} onClose={() => setShowStickerPicker(false)} />
              )}
            </div>
          </div>
          <button
            onClick={handleCreatePost}
            disabled={(!postContent.trim() && !selectedSticker && mediaKeys.length === 0) || posting}
            className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[11px] disabled:opacity-30 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {posting ? "Publishing..." : activeTab === "post" ? "Publish" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );

  // Render via portal to escape overflow-hidden containers
  if (!mounted) return null;
  return (
    <>
      {createPortal(modal, document.body)}
      {cropQueue.length > 0 && (
        <ImageCropper
          imageSrc={cropQueue[0].src}
          onCropComplete={handleCropDone}
          onCancel={handleCropSkip}
        />
      )}
    </>
  );
}
