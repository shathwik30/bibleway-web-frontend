"use client";

import React, { useState } from "react";

interface YouTubeSermonsProps {
  bookId: string;
  bookName: string;
}

// Map book IDs to YouTube video IDs of well-known sermon series
const SERMON_MAP: Record<string, { title: string; videoId: string }[]> = {
  GEN: [
    { title: "Genesis Overview - BibleProject", videoId: "GQI72THyO5I" },
    { title: "Through the Bible: Genesis - Skip Heitzig", videoId: "WLRA87TKXLM" },
  ],
  EXO: [
    { title: "Exodus Overview - BibleProject", videoId: "jH_aojNJM3E" },
    { title: "The Book of Exodus - David Guzik", videoId: "2bNRUbm_Opk" },
  ],
  PSA: [
    { title: "Psalms Overview - BibleProject", videoId: "j9phNEaPrv8" },
    { title: "The Psalms - Charles Spurgeon Sermon", videoId: "PPlCzGBQhq0" },
  ],
  PRO: [
    { title: "Proverbs Overview - BibleProject", videoId: "AzmYV8GNAIM" },
    { title: "The Book of Proverbs - John MacArthur", videoId: "AF-yzL-Kv1Y" },
  ],
  ISA: [
    { title: "Isaiah Overview Part 1 - BibleProject", videoId: "d0A6Uchb1F8" },
    { title: "Isaiah - David Pawson", videoId: "grz3gQ0YvFc" },
  ],
  MAT: [
    { title: "Matthew Overview Part 1 - BibleProject", videoId: "3Dv4-n2MRAo" },
    { title: "The Gospel of Matthew - John MacArthur", videoId: "nhGCMn_CJzs" },
  ],
  JHN: [
    { title: "John Overview Part 1 - BibleProject", videoId: "G-2e9mMf7E8" },
    { title: "The Gospel of John - David Guzik", videoId: "K1_BxTj3mJM" },
  ],
  ACT: [
    { title: "Acts Overview Part 1 - BibleProject", videoId: "CGbNw855ksw" },
    { title: "The Book of Acts - John MacArthur", videoId: "xbFOEo5k-bA" },
  ],
  ROM: [
    { title: "Romans Overview Part 1 - BibleProject", videoId: "ej_6dVdJSIU" },
    { title: "Romans - Martyn Lloyd-Jones", videoId: "r_-0JQ7d4L4" },
  ],
  REV: [
    { title: "Revelation Overview Part 1 - BibleProject", videoId: "5nvVVcYD-0w" },
    { title: "The Book of Revelation - John MacArthur", videoId: "UNDX4tUdj1Y" },
  ],
  "1CO": [
    { title: "1 Corinthians Overview - BibleProject", videoId: "yiHf8klCCc4" },
  ],
  GAL: [
    { title: "Galatians Overview - BibleProject", videoId: "vmx4UjRFp0M" },
  ],
};

export default function YouTubeSermons({ bookId, bookName }: YouTubeSermonsProps) {
  const [expanded, setExpanded] = useState(false);
  const sermons = SERMON_MAP[bookId];

  if (!sermons || sermons.length === 0) return null;

  return (
    <div className="mt-12 border-t border-outline-variant/20 pt-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full text-left group"
      >
        <span className="material-symbols-outlined text-primary text-2xl">
          {expanded ? "expand_less" : "expand_more"}
        </span>
        <div>
          <h2 className="text-xl font-headline text-on-surface group-hover:text-primary transition-colors">
            Related Sermons
          </h2>
          <p className="text-sm text-on-surface-variant/60">
            Suggested sermons for {bookName}
          </p>
        </div>
        <span className="ml-auto material-symbols-outlined text-on-surface-variant/40">
          smart_display
        </span>
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          {sermons.map((sermon) => (
            <div key={sermon.videoId} className="space-y-2">
              <h3 className="text-sm font-semibold text-on-surface-variant">
                {sermon.title}
              </h3>
              <div className="aspect-video rounded-xl overflow-hidden shadow-md">
                <iframe
                  src={`https://www.youtube.com/embed/${sermon.videoId}`}
                  title={sermon.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
