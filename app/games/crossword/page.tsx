"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import MainLayout from "../../components/MainLayout";
import {
  LEVELS,
  type LevelData,
  type WordData,
} from "../constants/crosswordLevels";

/* ------------------------------------------------------------------ */
/*  Persistence helpers                                                */
/* ------------------------------------------------------------------ */

function getStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}
function setStorage(key: string, value: string) {
  if (typeof window !== "undefined") localStorage.setItem(key, value);
}
function loadUnlocked(): number {
  const v = getStorage("crossword_unlocked_level");
  return v ? parseInt(v, 10) : 1;
}
function loadCompleted(): Set<number> {
  try {
    return new Set(JSON.parse(getStorage("crossword_completed_levels") || "[]"));
  } catch {
    return new Set();
  }
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LetterTile {
  id: string;
  letter: string;
  used: boolean;
}

interface CellInfo {
  letter: string;
  wordIndices: number[];
}

/* ------------------------------------------------------------------ */
/*  Utility functions                                                  */
/* ------------------------------------------------------------------ */

const DISTRACTOR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeBank(word: string): LetterTile[] {
  const unique = new Set(word.split(""));
  const distractors = shuffle(
    DISTRACTOR_POOL.split("").filter((c) => !unique.has(c))
  ).slice(0, Math.min(3, 12 - word.length));
  return shuffle([...word.split(""), ...distractors]).map((letter, i) => ({
    id: `${i}-${letter}-${Math.random().toString(36).slice(2, 6)}`,
    letter,
    used: false,
  }));
}

function buildGridMap(level: LevelData): Map<string, CellInfo> {
  const map = new Map<string, CellInfo>();
  level.words.forEach((w, wi) => {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.direction === "across" ? w.row : w.row + i;
      const c = w.direction === "across" ? w.col + i : w.col;
      const k = `${r}-${c}`;
      const ex = map.get(k);
      if (ex) ex.wordIndices.push(wi);
      else map.set(k, { letter: w.word[i], wordIndices: [wi] });
    }
  });
  return map;
}

function getGridBounds(gridMap: Map<string, CellInfo>): { minR: number; maxR: number; minC: number; maxC: number; rows: number; cols: number } {
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const key of gridMap.keys()) {
    const [r, c] = key.split("-").map(Number);
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (c < minC) minC = c;
    if (c > maxC) maxC = c;
  }
  if (minR === Infinity) return { minR: 0, maxR: 0, minC: 0, maxC: 0, rows: 1, cols: 1 };
  return { minR, maxR, minC, maxC, rows: maxR - minR + 1, cols: maxC - minC + 1 };
}

function getWordKeys(word: WordData): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < word.word.length; i++) {
    const r = word.direction === "across" ? word.row : word.row + i;
    const c = word.direction === "across" ? word.col + i : word.col;
    keys.add(`${r}-${c}`);
  }
  return keys;
}

/* ------------------------------------------------------------------ */
/*  CSS keyframes (injected once)                                      */
/* ------------------------------------------------------------------ */

const KEYFRAMES_ID = "crossword-keyframes";

function injectKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes cw-shake {
      0%, 100% { transform: translateX(0); }
      10% { transform: translateX(-8px); }
      20% { transform: translateX(8px); }
      30% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      50% { transform: translateX(-4px); }
      60% { transform: translateX(4px); }
      70% { transform: translateX(-2px); }
      80% { transform: translateX(2px); }
    }
    @keyframes cw-pop {
      0% { transform: scale(1); }
      40% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
    @keyframes cw-letter-in {
      0% { transform: scale(0.3); opacity: 0; }
      60% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .cw-shake { animation: cw-shake 0.5s ease-in-out; }
    .cw-pop   { animation: cw-pop 0.5s ease-out; }
    .cw-letter-in { animation: cw-letter-in 0.2s ease-out; }
  `;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function BibleCrosswordPage() {
  const [screen, setScreen] = useState<"levels" | "play" | "result">("levels");
  const [levelId, setLevelId] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    setUnlockedLevel(loadUnlocked());
    setCompletedLevels(loadCompleted());
    setMounted(true);
  }, []);

  // Game state
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [wordIdx, setWordIdx] = useState(0);
  const [input, setInput] = useState<string[]>([]);
  const [bank, setBank] = useState<LetterTile[]>([]);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(0);

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(480);
  const wordTabsRef = useRef<HTMLDivElement>(null);

  const level = LEVELS[levelId - 1];
  const gridMap = useMemo(() => level ? buildGridMap(level) : new Map(), [level]);
  const word = level?.words[wordIdx];
  const currKeys = useMemo(() => word ? getWordKeys(word) : new Set<string>(), [word]);
  const bounds = useMemo(() => getGridBounds(gridMap), [gridMap]);

  // Inject CSS keyframes on mount
  useEffect(() => { injectKeyframes(); }, []);

  // Measure grid container width for responsive cell sizing
  useEffect(() => {
    if (screen !== "play" || !gridContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setGridWidth(entry.contentRect.width);
      }
    });
    observer.observe(gridContainerRef.current);
    return () => observer.disconnect();
  }, [screen]);

  // Reset bank/input when word changes
  useEffect(() => {
    if (!word) return;
    setBank(makeBank(word.word));
    setInput([]);
    setFeedback("idle");
    setHints(0);
  }, [wordIdx, levelId, word]);

  // Scroll active word tab into view
  useEffect(() => {
    if (!wordTabsRef.current) return;
    const active = wordTabsRef.current.querySelector("[data-active='true']");
    if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [wordIdx]);

  /* ---- Game actions ---- */

  const startLevel = useCallback((id: number) => {
    setLevelId(id);
    setSolved(new Set());
    setWordIdx(0);
    setScore(0);
    setHints(0);
    setFeedback("idle");
    setInput([]);
    const lv = LEVELS[id - 1];
    setBank(makeBank(lv.words[0].word));
    setScreen("play");
  }, []);

  const selectNextUnsolved = useCallback(
    (currentSolved: Set<number>) => {
      const lvl = LEVELS[levelId - 1];
      for (let i = 0; i < lvl.words.length; i++) {
        if (!currentSolved.has(i)) {
          setWordIdx(i);
          return;
        }
      }
    },
    [levelId]
  );

  const tapTile = useCallback(
    (id: string, letter: string) => {
      if (!word || input.length >= word.word.length) return;
      setInput((p) => [...p, letter]);
      setBank((p) => p.map((t) => (t.id === id ? { ...t, used: true } : t)));
    },
    [input.length, word]
  );

  const deleteLast = useCallback(() => {
    if (!input.length) return;
    const last = input[input.length - 1];
    let done = false;
    setBank((p) => {
      const n = [...p];
      for (let i = n.length - 1; i >= 0; i--) {
        if (n[i].used && n[i].letter === last && !done) {
          n[i] = { ...n[i], used: false };
          done = true;
          break;
        }
      }
      return n;
    });
    setInput((p) => p.slice(0, -1));
  }, [input]);

  const clearAll = useCallback(() => {
    if (!input.length) return;
    setBank((p) => p.map((t) => ({ ...t, used: false })));
    setInput([]);
  }, [input]);

  const useHint = useCallback(() => {
    if (!word) return;
    const next = input.length;
    if (next >= word.word.length || hints >= 2) return;
    const needed = word.word[next];
    const tile = bank.find((t) => !t.used && t.letter === needed);
    if (!tile) return;
    setHints((h) => h + 1);
    tapTile(tile.id, tile.letter);
  }, [input.length, word, bank, tapTile, hints]);

  const checkAnswer = useCallback(() => {
    if (!word || input.length < word.word.length) return;
    if (input.join("") === word.word) {
      setFeedback("correct");
      const newSolved = new Set([...solved, wordIdx]);
      setSolved(newSolved);
      setScore((p) => p + Math.max(40, 100 - hints * 20));

      setTimeout(() => {
        if (newSolved.size >= level.words.length) {
          // Level complete
          setCompletedLevels((p) => {
            const next = new Set([...p, levelId]);
            setStorage("crossword_completed_levels", JSON.stringify([...next]));
            return next;
          });
          if (levelId >= unlockedLevel) {
            const next = Math.min(levelId + 1, LEVELS.length);
            setUnlockedLevel(next);
            setStorage("crossword_unlocked_level", String(next));
          }
          setScreen("result");
        } else {
          selectNextUnsolved(newSolved);
          setFeedback("idle");
        }
      }, 900);
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback("idle"), 600);
    }
  }, [input, word, wordIdx, level, levelId, hints, solved, unlockedLevel, selectNextUnsolved]);

  /* ================================================================ */
  /*  LEVEL SELECT SCREEN                                              */
  /* ================================================================ */

  // Wait for client-side hydration before rendering any game content
  if (!mounted) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-16 bg-surface-container-low rounded-xl" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (screen === "levels") {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">Games</span>
          </Link>
          <h1 className="text-3xl font-headline text-on-surface mb-2">
            Bible Crossword
          </h1>
          <p className="text-on-surface-variant text-sm mb-6">
            Solve crossword puzzles across 10 biblical themes
          </p>

          <div className="space-y-3">
            {LEVELS.map((lv) => {
              const locked = lv.id > unlockedLevel;
              const completed = completedLevels.has(lv.id);
              return (
                <button
                  key={lv.id}
                  onClick={() => !locked && startLevel(lv.id)}
                  disabled={locked}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    locked
                      ? "opacity-40 cursor-not-allowed border-outline-variant/10 bg-surface-container-low"
                      : "border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30 editorial-shadow card-hover"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      completed
                        ? "border-primary bg-primary/10"
                        : locked
                          ? "border-outline-variant/30"
                          : "border-primary"
                    }`}
                  >
                    {completed ? (
                      <span className="material-symbols-outlined text-primary text-lg">check</span>
                    ) : locked ? (
                      <span className="material-symbols-outlined text-on-surface-variant/40 text-sm">lock</span>
                    ) : (
                      <span className="text-sm font-bold text-primary">{lv.id}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-on-surface">{lv.theme}</p>
                    <p className="text-xs text-on-surface-variant">
                      {lv.title} &middot; {lv.words.length} words &middot; {lv.gridSize}&times;{lv.gridSize}
                    </p>
                  </div>
                  {!locked && (
                    <span className="material-symbols-outlined text-primary text-sm">
                      {completed ? "refresh" : "play_arrow"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </MainLayout>
    );
  }

  /* ================================================================ */
  /*  RESULT / LEVEL COMPLETE SCREEN                                   */
  /* ================================================================ */

  if (screen === "result") {
    const isLastLevel = levelId >= LEVELS.length;
    const stars =
      score >= level.words.length * 80 ? 3 : score >= level.words.length * 50 ? 2 : 1;

    return (
      <MainLayout>
        <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          {/* Trophy */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-4xl">emoji_events</span>
          </div>

          <h2 className="text-2xl font-bold text-on-surface mb-1">{level.theme}</h2>
          <p className="text-on-surface-variant mb-5">Level Complete!</p>

          {/* Stars */}
          <div className="flex items-center justify-center gap-1 mb-5">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`material-symbols-outlined text-3xl ${
                  n <= stars ? "text-yellow-500" : "text-on-surface-variant/20"
                }`}
              >
                {n <= stars ? "star" : "star"}
              </span>
            ))}
          </div>

          {/* Score card */}
          <div className="flex items-stretch bg-surface-container-lowest rounded-2xl border border-outline-variant/10 editorial-shadow mb-8 mx-auto max-w-xs">
            <div className="flex-1 flex flex-col items-center py-4">
              <span className="material-symbols-outlined text-yellow-500 text-xl mb-1">
                emoji_events
              </span>
              <p className="text-xl font-bold text-on-surface">{score}</p>
              <p className="text-xs text-on-surface-variant">Points</p>
            </div>
            <div className="w-px bg-outline-variant/10" />
            <div className="flex-1 flex flex-col items-center py-4">
              <span className="material-symbols-outlined text-primary text-xl mb-1">
                check_circle
              </span>
              <p className="text-xl font-bold text-on-surface">
                {level.words.length}/{level.words.length}
              </p>
              <p className="text-xs text-on-surface-variant">Solved</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {!isLastLevel && (
              <button
                onClick={() => startLevel(levelId + 1)}
                className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                Next Level
              </button>
            )}
            <button
              onClick={() => startLevel(levelId)}
              className="w-full border border-outline-variant/20 py-3.5 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Play Again
            </button>
            <button
              onClick={() => setScreen("levels")}
              className="text-primary font-semibold py-2"
            >
              All Levels
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  /* ================================================================ */
  /*  PLAY / GAME SCREEN                                               */
  /* ================================================================ */

  const CELL_GAP = 2;
  const maxCell = Math.min(
    44,
    Math.floor((gridWidth - CELL_GAP * (bounds.cols - 1) - 16) / bounds.cols)
  );
  const CELL = Math.max(24, maxCell);

  const inputBoxWidth = Math.min(
    44,
    Math.floor((Math.min(gridWidth, 480) - 16 - (word.word.length - 1) * 8) / word.word.length)
  );

  const feedbackAnimClass =
    feedback === "wrong" ? "cw-shake" : feedback === "correct" ? "cw-pop" : "";

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setScreen("levels")}
            className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="text-sm font-medium hidden sm:inline">Levels</span>
          </button>
          <h2 className="font-headline text-lg text-on-surface truncate px-2">
            {level.theme}
          </h2>
          <div className="flex items-center gap-1.5 bg-surface-container-lowest rounded-full px-3 py-1.5 border border-outline-variant/10">
            <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
            <span className="text-sm font-bold text-on-surface">{score}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(solved.size / level.words.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">
            {solved.size}/{level.words.length}
          </span>
        </div>

        {/* Word tabs - horizontal scrollable pills */}
        <div
          ref={wordTabsRef}
          className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {level.words.map((w, i) => {
            const isSolved = solved.has(i);
            const isActive = i === wordIdx;
            return (
              <button
                key={i}
                data-active={isActive ? "true" : "false"}
                onClick={() => !isSolved && setWordIdx(i)}
                disabled={isSolved}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border-[1.5px] whitespace-nowrap shrink-0 transition-all ${
                  isSolved
                    ? "border-green-500 bg-green-50 text-green-600"
                    : isActive
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant hover:border-primary/30"
                }`}
              >
                {isSolved && (
                  <span className="material-symbols-outlined text-green-500 text-sm">
                    check_circle
                  </span>
                )}
                {w.word.length} letters &middot; {w.direction}
              </button>
            );
          })}
        </div>

        {/* Crossword grid — cropped to bounding box of used cells */}
        <div ref={gridContainerRef} className="flex justify-center mb-4">
          <div
            className="bg-surface-container rounded-2xl p-2 sm:p-3 inline-block"
          >
            {Array.from({ length: bounds.rows }, (_, ri) => {
              const r = bounds.minR + ri;
              return (
                <div key={r} className="flex" style={{ gap: CELL_GAP, marginTop: ri > 0 ? CELL_GAP : 0 }}>
                  {Array.from({ length: bounds.cols }, (_, ci) => {
                    const c = bounds.minC + ci;
                    const k = `${r}-${c}`;
                    const cell = gridMap.get(k);
                    const isCur = currKeys.has(k);
                    const isDone = cell
                      ? cell.wordIndices.some((idx: number) => solved.has(idx))
                      : false;

                    if (!cell) {
                      return (
                        <div
                          key={k}
                          className="rounded-sm bg-surface-container"
                          style={{ width: CELL, height: CELL }}
                        />
                      );
                    }

                    return (
                      <div
                        key={k}
                        className={`flex items-center justify-center font-bold rounded-sm transition-colors ${
                          isDone
                            ? "bg-green-50 border-green-500"
                            : isCur
                              ? "bg-primary/10 border-primary"
                              : "bg-surface-container-lowest border-outline-variant/20"
                        }`}
                        style={{
                          width: CELL,
                          height: CELL,
                          borderWidth: 2,
                          borderStyle: "solid",
                          fontSize: Math.max(11, CELL * 0.42),
                        }}
                      >
                        {isDone ? (
                          <span className="text-green-700">{cell.letter}</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Clue card */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 editorial-shadow mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider rounded-lg px-2.5 py-1">
              {word.direction === "across" ? "ACROSS" : "DOWN"}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              {word.word.length} letters
            </span>
          </div>
          <p className="text-sm sm:text-base text-on-surface leading-relaxed">
            {word.hint}
          </p>
        </div>

        {/* Letter input boxes */}
        <div
          className={`flex items-center justify-center gap-1.5 sm:gap-2 mb-5 px-2 ${feedbackAnimClass}`}
          key={`input-${levelId}-${wordIdx}-${feedback}`}
        >
          {word.word.split("").map((_, i) => {
            const isFilled = !!input[i];
            const borderColor =
              feedback === "correct"
                ? "border-green-500"
                : feedback === "wrong"
                  ? "border-red-400"
                  : isFilled
                    ? "border-primary"
                    : "border-outline-variant/25";
            const bgColor =
              feedback === "correct"
                ? "bg-green-50"
                : feedback === "wrong"
                  ? "bg-red-50"
                  : isFilled
                    ? "bg-primary/5"
                    : "bg-surface-container-lowest";

            return (
              <div
                key={i}
                className={`flex items-center justify-center rounded-xl border-2 transition-all ${borderColor} ${bgColor}`}
                style={{ width: inputBoxWidth, height: inputBoxWidth + 4 }}
              >
                {input[i] ? (
                  <span className="text-lg font-bold text-on-surface cw-letter-in">
                    {input[i]}
                  </span>
                ) : (
                  <span className="block w-3 h-0.5 rounded-full bg-on-surface-variant/20" />
                )}
              </div>
            );
          })}
        </div>

        {/* Letter bank */}
        <div className="flex flex-wrap justify-center gap-2 mb-5 px-2">
          {bank.map((tile) => {
            const tileSize = Math.min(
              52,
              Math.floor((Math.min(gridWidth, 480) - 64 - 4 * 8) / 5)
            );
            return (
              <button
                key={tile.id}
                disabled={tile.used}
                onClick={() => tapTile(tile.id, tile.letter)}
                className={`flex items-center justify-center rounded-xl font-bold transition-all select-none ${
                  tile.used
                    ? "bg-surface-container text-on-surface-variant/20 cursor-default"
                    : "bg-primary text-on-primary hover:opacity-90 active:scale-95 shadow-md shadow-primary/20 cursor-pointer"
                }`}
                style={{
                  width: tileSize,
                  height: tileSize,
                  fontSize: Math.max(14, tileSize * 0.4),
                  opacity: tile.used ? 0.3 : 1,
                }}
              >
                {tile.letter}
              </button>
            );
          })}
        </div>

        {/* Action buttons row */}
        <div className="flex gap-2.5 mb-4">
          <button
            onClick={deleteLast}
            className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 text-on-surface-variant hover:bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined text-xl">backspace</span>
          </button>
          <button
            onClick={clearAll}
            className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 text-on-surface-variant hover:bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
            <span className="text-sm font-semibold hidden sm:inline">Clear</span>
          </button>
          <button
            onClick={useHint}
            disabled={hints >= 2}
            className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-xl">lightbulb</span>
            <span className="text-sm font-semibold">Hint</span>
            <span className="text-[10px] text-yellow-500 font-medium">
              {2 - hints}
            </span>
          </button>
        </div>

        {/* Check Answer button */}
        <button
          onClick={checkAnswer}
          disabled={!word || input.length < word.word.length}
          className="w-full h-14 rounded-2xl bg-primary text-on-primary font-bold text-base tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Check Answer
        </button>
      </div>
    </MainLayout>
  );
}
