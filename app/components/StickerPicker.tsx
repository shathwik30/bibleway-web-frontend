"use client";

import { useState, useRef, useEffect } from "react";

// 87 GIF stickers - IDs map to /stickers/sticker_{id}.gif
const STICKER_IDS = Array.from({ length: 87 }, (_, i) => i + 1);

// Emoji fallbacks for comment text rendering (when sticker GIF can't display inline)
const STICKERS = [
  { id: "praying", name: "Praying Hands", emoji: "\u{1F64F}" },
  { id: "heart", name: "Heart", emoji: "\u2764\uFE0F" },
  { id: "fire", name: "Fire", emoji: "\u{1F525}" },
  { id: "cross", name: "Cross", emoji: "\u271D\uFE0F" },
  { id: "dove", name: "Dove", emoji: "\u{1F54A}\uFE0F" },
  { id: "angel", name: "Angel", emoji: "\u{1F47C}" },
  { id: "church", name: "Church", emoji: "\u26EA" },
  { id: "star", name: "Star", emoji: "\u2B50" },
  { id: "rainbow", name: "Rainbow", emoji: "\u{1F308}" },
  { id: "candle", name: "Candle", emoji: "\u{1F56F}\uFE0F" },
  { id: "raised_hands", name: "Raised Hands", emoji: "\u{1F64C}" },
  { id: "sparkling_heart", name: "Sparkling Heart", emoji: "\u{1F496}" },
  { id: "folded_hands", name: "Folded Hands", emoji: "\u{1F932}" },
  { id: "peace", name: "Peace", emoji: "\u262E\uFE0F" },
  { id: "sunrise", name: "Sunrise", emoji: "\u{1F305}" },
  { id: "light", name: "Light", emoji: "\u{1F4A1}" },
  { id: "crown", name: "Crown", emoji: "\u{1F451}" },
  { id: "olive_branch", name: "Olive Branch", emoji: "\u{1F343}" },
  { id: "open_book", name: "Open Book", emoji: "\u{1F4D6}" },
  { id: "muscle", name: "Strength", emoji: "\u{1F4AA}" },
];

interface StickerPickerProps {
  onSelect: (stickerId: string) => void;
  onClose: () => void;
}

export default function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"gif" | "emoji">("gif");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 z-50 animate-in fade-in zoom-in duration-200 w-72"
    >
      {/* Tabs */}
      <div className="flex border-b border-outline-variant/10">
        <button
          onClick={() => setTab("gif")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${tab === "gif" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"}`}
        >
          Stickers
        </button>
        <button
          onClick={() => setTab("emoji")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${tab === "emoji" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"}`}
        >
          Emoji
        </button>
      </div>

      <div className="p-2 max-h-56 overflow-y-auto">
        {tab === "gif" ? (
          <div className="grid grid-cols-4 gap-1">
            {STICKER_IDS.map((id) => (
              <button
                key={id}
                onClick={() => onSelect(`gif_${id}`)}
                className="w-15 h-15 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-all p-0.5"
              >
                <img
                  src={`/stickers/sticker_${id}.gif`}
                  alt={`Sticker ${id}`}
                  className="w-14 h-14 object-contain"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            {STICKERS.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                title={s.name}
                className="w-14 h-14 flex items-center justify-center rounded-lg hover:bg-surface-container-high hover:scale-110 transition-all text-2xl"
              >
                {s.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { STICKERS };
