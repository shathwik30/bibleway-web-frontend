"use client";

import { useRef, useCallback, useState } from "react";

interface VerseShareCardProps {
  text: string;
  reference: string;
  backgroundImage?: string;
}

import { VERSE_BACKGROUNDS as BACKGROUNDS } from "../lib/constants";

export function useVerseCardGenerator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateCard = useCallback(async (text: string, reference: string, bgImage?: string): Promise<Blob | null> => {
    const canvas = canvasRef.current || document.createElement("canvas");
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    // Background
    const bgSrc = bgImage || `/${BACKGROUNDS[new Date().getDay() % BACKGROUNDS.length]}`;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = bgSrc;
      });
      ctx.drawImage(img, 0, 0, W, H);
    } catch {
      // Fallback gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#1a1a2e");
      grad.addColorStop(0.5, "#16213e");
      grad.addColorStop(1, "#0f3460");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Dark overlay for readability
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, W, H);

    // Setup text rendering
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 4;

    // "Verse of the Day" title
    ctx.font = `600 18px "Inter", sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.letterSpacing = "6px";
    ctx.fillText("VERSE OF THE DAY", W / 2, 120);

    // Wrap verse text
    ctx.fillStyle = "#ffffff";
    const fontSize = text.length > 200 ? 36 : text.length > 100 ? 44 : 52;
    ctx.font = `italic ${fontSize}px "Playfair Display", Georgia, serif`;
    const maxWidth = W - 160;
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = fontSize * 1.5;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (H / 2) - (totalTextHeight / 2) - 10;

    lines.forEach((line, i) => {
      ctx.fillText(line, W / 2, startY + i * lineHeight);
    });

    // Reference
    ctx.shadowBlur = 10;
    ctx.font = `500 28px "Inter", sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText(reference, W / 2, startY + totalTextHeight + 40);

    // Logo image — bigger
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    try {
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        logo.onload = () => resolve();
        logo.onerror = () => reject();
        logo.src = "/bibleway-logo.png";
      });
      const logoH = 64;
      const logoW = (logo.naturalWidth / logo.naturalHeight) * logoH;
      ctx.globalAlpha = 0.7;
      ctx.drawImage(logo, (W - logoW) / 2, H - 110, logoW, logoH);
      ctx.globalAlpha = 1;
    } catch {
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = `700 30px "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("BibleWay", W / 2, H - 75);
    }

    // Export as blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 1);
    });
  }, []);

  return { generateCard };
}

interface ShareDropdownProps {
  verseText: string;
  verseReference: string;
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export default function VerseShareDropdown({ verseText, verseReference, onClose, onToast }: ShareDropdownProps) {
  const { generateCard } = useVerseCardGenerator();
  const [generating, setGenerating] = useState(false);

  const plainText = `${verseText}\n${verseReference}\n\n— Shared via BibleWay`;

  async function handleShareImage() {
    setGenerating(true);
    try {
      const blob = await generateCard(verseText, verseReference);
      if (!blob) return;

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "bibleway-verse.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: plainText });
          onClose();
          return;
        }
      }
      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bibleway-verse.png";
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch { /* cancelled or failed */ } finally {
      setGenerating(false);
    }
  }

  async function handleCopyText() {
    await navigator.clipboard.writeText(plainText);
    onToast?.("Verse copied to clipboard");
    onClose();
  }

  function handleEmail() {
    const subject = encodeURIComponent("Verse of the Day — BibleWay");
    const body = encodeURIComponent(plainText);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    onClose();
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 overflow-hidden w-52 z-[200]">
      <button
        onClick={handleShareImage}
        disabled={generating}
        className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-on-surface hover:bg-surface-container-low transition-colors"
      >
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">image</span>
        {generating ? "Creating..." : "Share as Image"}
      </button>
      <button
        onClick={handleCopyText}
        className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-on-surface hover:bg-surface-container-low transition-colors"
      >
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">content_copy</span>
        Copy Text
      </button>
      <button
        onClick={handleEmail}
        className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-on-surface hover:bg-surface-container-low transition-colors"
      >
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">mail</span>
        Email
      </button>
    </div>
  );
}
