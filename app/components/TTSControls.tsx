"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface TTSControlsProps {
  content: string | null;
  chapterId: string;
}

function stripHTML(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export default function TTSControls({ content, chapterId }: TTSControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
  }, []);

  // Stop playback when chapter changes
  useEffect(() => {
    stopPlayback();
  }, [chapterId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const stopPlayback = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const startPlayback = useCallback(() => {
    if (!content) return;
    window.speechSynthesis.cancel();

    const text = stripHTML(content);
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }, [content, speed]);

  const togglePlayPause = useCallback(() => {
    if (!isPlaying && !isPaused) {
      startPlayback();
      return;
    }
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused, startPlayback]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    // If currently playing, restart with new speed
    if (isPlaying || isPaused) {
      window.speechSynthesis.cancel();
      const text = content ? stripHTML(content) : "";
      if (!text.trim()) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = newSpeed;
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, [content, isPlaying, isPaused]);

  if (!supported) return null;

  const speeds = [0.75, 1, 1.25, 1.5];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        isPlaying && !isPaused
          ? "bg-primary/10 border-primary/30 shadow-sm"
          : "bg-surface-container-lowest border-outline-variant/20"
      }`}
    >
      {/* Play/Pause */}
      <button
        onClick={togglePlayPause}
        disabled={!content}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
          isPlaying && !isPaused
            ? "bg-primary text-on-primary shadow-md"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label={isPlaying && !isPaused ? "Pause" : "Play"}
      >
        <span className="material-symbols-outlined text-xl">
          {isPlaying && !isPaused ? "pause" : "play_arrow"}
        </span>
      </button>

      {/* Stop */}
      <button
        onClick={stopPlayback}
        disabled={!isPlaying && !isPaused}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Stop"
      >
        <span className="material-symbols-outlined text-xl">stop</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-outline-variant/20" />

      {/* Speed selector */}
      <div className="flex items-center gap-1">
        <span className="material-symbols-outlined text-sm text-on-surface-variant/60">speed</span>
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => handleSpeedChange(s)}
            className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
              speed === s
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Active indicator */}
      {isPlaying && !isPaused && (
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs font-label text-primary">Reading</span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
        </div>
      )}
    </div>
  );
}
