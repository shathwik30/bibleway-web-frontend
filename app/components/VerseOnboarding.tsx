"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useVerseCardGenerator } from "./VerseShareCard";

interface VerseOnboardingProps {
  verseText: string;
  verseReference: string;
  onDismiss: () => void;
  onToast?: (msg: string) => void;
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

import { VERSE_BACKGROUNDS as BACKGROUNDS } from "../lib/constants";

export default function VerseOnboarding({ verseText, verseReference, onDismiss, onToast }: VerseOnboardingProps) {
  // Phases: black → bg → text → logo → actions → exit
  const [phase, setPhase] = useState<"black" | "bg" | "text" | "logo" | "actions" | "exit">("black");
  const [mounted, setMounted] = useState(false);
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const { generateCard } = useVerseCardGenerator();
  const actionsRef = useRef<HTMLDivElement>(null);
  const bgImage = BACKGROUNDS[new Date().getDay() % BACKGROUNDS.length];

  useEffect(() => { setMounted(true); }, []);

  // Pre-generate the card image for download (never shown)
  useEffect(() => {
    generateCard(verseText, verseReference, `/${bgImage}`).then((blob) => {
      if (blob) setCardBlob(blob);
    });
  }, []);

  // Animation timeline
  useEffect(() => {
    if (!mounted) return;
    const timers = [
      setTimeout(() => setPhase("bg"), 300),
      setTimeout(() => setPhase("text"), 1200),
      setTimeout(() => setPhase("logo"), 2400),
      setTimeout(() => setPhase("actions"), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [mounted]);

  function handleDismiss() {
    if (phase === "exit") return;
    setPhase("exit");
    setTimeout(onDismiss, 700);
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (phase !== "actions") return;
    if (actionsRef.current?.contains(e.target as Node)) return;
    handleDismiss();
  }

  function handleCopyText() {
    navigator.clipboard.writeText(`${verseText}\n${verseReference}\n\n— Shared via BibleWay`);
    onToast?.("Verse copied to clipboard");
    handleDismiss();
  }

  async function handleDownloadImage() {
    if (!cardBlob) return;
    try {
      if (navigator.share && navigator.canShare) {
        const file = new File([cardBlob], "bibleway-verse.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: `${verseText} ${verseReference}` });
          handleDismiss();
          return;
        }
      }
      const url = URL.createObjectURL(cardBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bibleway-verse.png";
      a.click();
      URL.revokeObjectURL(url);
      onToast?.("Verse image downloaded");
      handleDismiss();
    } catch { /* cancelled */ }
  }

  function handleEmail() {
    const subject = encodeURIComponent("Verse of the Day — BibleWay");
    const body = encodeURIComponent(`${verseText}\n\n${verseReference}\n\n— Shared via BibleWay`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    handleDismiss();
  }

  const isVisible = (from: string) => {
    const order = ["black", "bg", "text", "logo", "actions"];
    const phaseIndex = order.indexOf(phase);
    const fromIndex = order.indexOf(from);
    return phase !== "exit" && phaseIndex >= fromIndex;
  };

  const overlay = (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden cursor-default"
      style={{
        backgroundColor: "#000",
        transition: `opacity 600ms ${EASE}`,
        opacity: phase === "exit" ? 0 : 1,
      }}
    >
      {/* Background image — fades in from black */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/${bgImage}')`,
          opacity: isVisible("bg") ? 0.35 : 0,
          transition: `opacity 1200ms ${EASE}`,
        }}
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)",
          opacity: isVisible("bg") ? 1 : 0,
          transition: `opacity 1000ms ${EASE}`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-2xl w-full">
        {/* Heading */}
        <p
          className="text-xs sm:text-sm font-label uppercase tracking-[0.3em] text-white/50 mb-6"
          style={{
            opacity: isVisible("text") ? 1 : 0,
            transform: isVisible("text") ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 600ms ${EASE}, transform 700ms ${EASE}`,
          }}
        >
          Verse of the Day
        </p>

        {/* Verse text */}
        <p
          className="text-3xl sm:text-4xl md:text-5xl font-headline italic leading-tight text-white mb-6"
          style={{
            opacity: isVisible("text") ? 1 : 0,
            transform: isVisible("text") ? "translateY(0)" : "translateY(30px)",
            transition: `opacity 800ms ${EASE}, transform 900ms ${EASE}`,
          }}
        >
          {verseText}
        </p>

        {/* Reference */}
        <p
          className="text-lg sm:text-xl text-white/70 font-body mb-12"
          style={{
            opacity: isVisible("text") ? 1 : 0,
            transform: isVisible("text") ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 800ms ${EASE} 200ms, transform 900ms ${EASE} 200ms`,
          }}
        >
          {verseReference}
        </p>

        {/* BibleWay logo */}
        <div
          style={{
            opacity: isVisible("logo") ? 1 : 0,
            transform: isVisible("logo") ? "translateY(0) scale(1)" : "translateY(15px) scale(0.95)",
            transition: `opacity 700ms ${EASE}, transform 800ms ${EASE}`,
          }}
        >
          <img
            src="/bibleway-logo.png"
            alt="BibleWay"
            className="h-10 sm:h-12 w-auto mx-auto brightness-0 invert opacity-60"
          />
        </div>
      </div>

      {/* Actions tray */}
      <div
        ref={actionsRef}
        className="absolute bottom-12 sm:bottom-16 left-0 right-0 flex flex-col items-center z-10"
        style={{
          opacity: phase === "actions" ? 1 : 0,
          transform: phase === "actions" ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 600ms ${EASE}, transform 600ms ${EASE}`,
          pointerEvents: phase === "actions" ? "auto" : "none",
        }}
      >
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={handleDownloadImage}
            disabled={!cardBlob}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/25 transition-colors disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Save Image
          </button>
          <button
            onClick={handleCopyText}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/25 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">content_copy</span>
            Copy Text
          </button>
          <button
            onClick={handleEmail}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/25 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">mail</span>
            Email
          </button>
        </div>
        <p className="text-white/30 text-xs mt-5">Click anywhere to close</p>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(overlay, document.body);
}
