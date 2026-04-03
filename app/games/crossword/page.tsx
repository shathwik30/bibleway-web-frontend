"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import MainLayout from "../../components/MainLayout";
import { LEVELS, type LevelData, type WordData } from "../constants/crosswordLevels";

function getStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}
function setStorage(key: string, value: string) {
  if (typeof window !== "undefined") localStorage.setItem(key, value);
}
function loadUnlocked(): number { const v = getStorage("crossword_unlocked_level"); return v ? parseInt(v, 10) : 1; }
function loadCompleted(): Set<number> { try { return new Set(JSON.parse(getStorage("crossword_completed_levels") || "[]")); } catch { return new Set(); } }

interface CellInfo { letter: string; wordIndices: number[] }

function buildGrid(level: LevelData): (CellInfo | null)[][] {
  const grid: (CellInfo | null)[][] = Array.from({ length: level.gridSize }, () => Array(level.gridSize).fill(null));
  level.words.forEach((word, wIdx) => {
    for (let i = 0; i < word.word.length; i++) {
      const r = word.direction === "across" ? word.row : word.row + i;
      const c = word.direction === "across" ? word.col + i : word.col;
      if (r < level.gridSize && c < level.gridSize) {
        if (!grid[r][c]) grid[r][c] = { letter: word.word[i], wordIndices: [wIdx] };
        else grid[r][c]!.wordIndices.push(wIdx);
      }
    }
  });
  return grid;
}

export default function BibleCrosswordPage() {
  const [screen, setScreen] = useState<"levels" | "play" | "result">("levels");
  const [levelId, setLevelId] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(loadUnlocked);
  const [completedLevels, setCompletedLevels] = useState(loadCompleted);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const level = LEVELS[levelId - 1];
  const grid = useMemo(() => level ? buildGrid(level) : [], [level]);

  // Focus container for keyboard input
  useEffect(() => {
    if (screen === "play") containerRef.current?.focus();
  }, [screen, selectedCell]);

  const startLevel = useCallback((id: number) => {
    setLevelId(id);
    const lv = LEVELS[id - 1];
    setUserGrid(Array.from({ length: lv.gridSize }, () => Array(lv.gridSize).fill("")));
    setSelectedCell(null); setSelectedWordIdx(null); setRevealedWords(new Set());
    setScreen("play");
  }, []);

  const handleCellClick = useCallback((r: number, c: number) => {
    const cell = grid[r]?.[c];
    if (!cell) return;
    setSelectedCell({ r, c });
    if (cell.wordIndices.length > 0) {
      setSelectedWordIdx((prev) => {
        if (prev !== null && cell.wordIndices.includes(prev)) {
          return cell.wordIndices[(cell.wordIndices.indexOf(prev) + 1) % cell.wordIndices.length];
        }
        return cell.wordIndices[0];
      });
    }
    containerRef.current?.focus();
  }, [grid]);

  const handleKeyInput = useCallback((key: string) => {
    if (!selectedCell || !level) return;
    const { r, c } = selectedCell;
    const cell = grid[r]?.[c];
    if (!cell) return;

    if (key === "Backspace") {
      setUserGrid((prev) => { const next = prev.map((row) => [...row]); next[r][c] = ""; return next; });
      if (selectedWordIdx !== null) {
        const word = level.words[selectedWordIdx];
        if (word.direction === "across" && c > word.col) setSelectedCell({ r, c: c - 1 });
        else if (word.direction === "down" && r > word.row) setSelectedCell({ r: r - 1, c });
      }
      return;
    }
    if (key.length === 1 && /[a-zA-Z]/.test(key)) {
      const letter = key.toUpperCase();
      setUserGrid((prev) => { const next = prev.map((row) => [...row]); next[r][c] = letter; return next; });
      if (selectedWordIdx !== null) {
        const word = level.words[selectedWordIdx];
        if (word.direction === "across" && c < word.col + word.word.length - 1) setSelectedCell({ r, c: c + 1 });
        else if (word.direction === "down" && r < word.row + word.word.length - 1) setSelectedCell({ r: r + 1, c });
      }
    }
  }, [selectedCell, selectedWordIdx, level, grid]);

  const revealWord = useCallback(() => {
    if (selectedWordIdx === null || !level) return;
    const word = level.words[selectedWordIdx];
    setUserGrid((prev) => {
      const next = prev.map((row) => [...row]);
      for (let i = 0; i < word.word.length; i++) {
        const r = word.direction === "across" ? word.row : word.row + i;
        const c = word.direction === "across" ? word.col + i : word.col;
        if (r < level.gridSize && c < level.gridSize) next[r][c] = word.word[i];
      }
      return next;
    });
    setRevealedWords((prev) => new Set([...prev, selectedWordIdx]));
  }, [selectedWordIdx, level]);

  const isComplete = useMemo(() => {
    if (!level || screen !== "play") return false;
    return level.words.every((word) => {
      for (let i = 0; i < word.word.length; i++) {
        const r = word.direction === "across" ? word.row : word.row + i;
        const c = word.direction === "across" ? word.col + i : word.col;
        if (userGrid[r]?.[c] !== word.word[i]) return false;
      }
      return true;
    });
  }, [userGrid, level, screen]);

  const handleComplete = useCallback(() => {
    setCompletedLevels((p) => { const next = new Set([...p, levelId]); setStorage("crossword_completed_levels", JSON.stringify([...next])); return next; });
    if (levelId >= unlockedLevel) { const next = Math.min(levelId + 1, LEVELS.length); setUnlockedLevel(next); setStorage("crossword_unlocked_level", String(next)); }
    setScreen("result");
  }, [levelId, unlockedLevel]);

  // LEVEL SELECT
  if (screen === "levels") {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Link href="/games" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">Games</span>
          </Link>
          <h1 className="text-3xl font-headline text-on-surface mb-2">Bible Crossword</h1>
          <p className="text-on-surface-variant text-sm mb-6">Solve clues about biblical places and fill the crossword grid</p>

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
                    locked ? "opacity-40 cursor-not-allowed border-outline-variant/10 bg-surface-container-low"
                    : "border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30 editorial-shadow card-hover"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    completed ? "border-primary bg-primary/10" : locked ? "border-outline-variant/30" : "border-primary"
                  }`}>
                    {completed ? <span className="material-symbols-outlined text-primary text-lg">check</span>
                    : locked ? <span className="material-symbols-outlined text-on-surface-variant/40 text-sm">lock</span>
                    : <span className="text-sm font-bold text-primary">{lv.id}</span>}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-on-surface">{lv.theme}</p>
                    <p className="text-xs text-on-surface-variant">{lv.title} &middot; {lv.words.length} words &middot; {lv.gridSize}x{lv.gridSize}</p>
                  </div>
                  {!locked && (
                    <span className="material-symbols-outlined text-primary text-sm">{completed ? "refresh" : "play_arrow"}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </MainLayout>
    );
  }

  // RESULT
  if (screen === "result") {
    const isLastLevel = levelId >= LEVELS.length;
    return (
      <MainLayout>
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-4xl">emoji_events</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-1">Crossword Complete!</h2>
          <p className="text-on-surface-variant mb-2">{level.theme}</p>
          <p className="text-sm text-on-surface-variant mb-8">
            {revealedWords.size > 0 ? `${level.words.length - revealedWords.size}/${level.words.length} solved without hints` : "Solved all words!"}
          </p>
          <div className="space-y-3">
            {!isLastLevel && (
              <button onClick={() => startLevel(levelId + 1)} className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined">arrow_forward</span> Next Level
              </button>
            )}
            <button onClick={() => startLevel(levelId)} className="w-full border border-outline-variant/20 py-3.5 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all">Retry</button>
            <button onClick={() => setScreen("levels")} className="text-primary font-semibold py-2">All Levels</button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // PLAY
  const selectedWord = selectedWordIdx !== null ? level.words[selectedWordIdx] : null;
  const cellSize = Math.min(36, Math.floor(480 / level.gridSize));

  const isCellInWord = (r: number, c: number, word: WordData) => {
    for (let i = 0; i < word.word.length; i++) {
      const wr = word.direction === "across" ? word.row : word.row + i;
      const wc = word.direction === "across" ? word.col + i : word.col;
      if (wr === r && wc === c) return true;
    }
    return false;
  };

  return (
    <MainLayout>
      <div
        ref={containerRef}
        className="max-w-5xl mx-auto px-4 sm:px-6 py-6 outline-none"
        onKeyDown={(e) => { e.preventDefault(); handleKeyInput(e.key); }}
        tabIndex={0}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setScreen("levels")} className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium hidden sm:inline">Levels</span>
          </button>
          <h2 className="font-headline text-lg text-on-surface">{level.theme}</h2>
          <span className="text-sm text-on-surface-variant">{level.words.length} words</span>
        </div>

        {/* Main layout: grid on left, clues on right */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Grid area */}
          <div className="flex-shrink-0">
            <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-4 editorial-shadow border border-outline-variant/10 inline-block">
              <table className="border-collapse" style={{ borderSpacing: 0 }}>
                <tbody>
                  {grid.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => {
                        if (!cell) {
                          return (
                            <td key={`${r}-${c}`} style={{ width: cellSize, height: cellSize, padding: 0 }}>
                              <div className="w-full h-full bg-surface-container" style={{ width: cellSize, height: cellSize }} />
                            </td>
                          );
                        }
                        const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                        const isInWord = selectedWord ? isCellInWord(r, c, selectedWord) : false;
                        const userLetter = userGrid[r]?.[c] || "";
                        const isCorrect = userLetter === cell.letter;
                        const isWrong = userLetter !== "" && !isCorrect;

                        return (
                          <td key={`${r}-${c}`} style={{ padding: 1 }}>
                            <button
                              onClick={() => handleCellClick(r, c)}
                              style={{ width: cellSize, height: cellSize }}
                              className={`flex items-center justify-center text-xs sm:text-sm font-bold transition-all border ${
                                isSelected ? "bg-primary/20 border-primary ring-1 ring-primary"
                                : isInWord ? "bg-primary/5 border-primary/30"
                                : "bg-surface-container-lowest border-outline-variant/15"
                              } ${isWrong ? "text-error" : "text-on-surface"}`}
                            >
                              {userLetter}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Keyboard hint */}
            <p className="text-xs text-on-surface-variant/60 text-center mt-3">Click a cell and type to fill in letters</p>
          </div>

          {/* Clues Panel */}
          <div className="flex-1 min-w-0 lg:max-w-xs space-y-4">
            {/* Active clue */}
            {selectedWord && (
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/15">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                  {selectedWord.direction === "across" ? "Across" : "Down"} &middot; {selectedWord.word.length} letters
                </p>
                <p className="text-sm text-on-surface font-medium leading-snug">{selectedWord.hint}</p>
                <button onClick={revealWord} className="mt-3 text-xs text-tertiary-fixed-dim font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity">
                  <span className="material-symbols-outlined text-sm">lightbulb</span> Reveal Word
                </button>
              </div>
            )}

            {/* All clues */}
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 editorial-shadow">
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Across</h4>
              {level.words.filter((w) => w.direction === "across").map((w) => {
                const wIdx = level.words.indexOf(w);
                const isActive = selectedWordIdx === wIdx;
                return (
                  <button
                    key={wIdx}
                    className={`block w-full text-left text-xs mb-1.5 rounded-lg px-2 py-1 transition-colors ${
                      isActive ? "bg-primary/10 text-primary font-semibold" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                    }`}
                    onClick={() => { setSelectedWordIdx(wIdx); setSelectedCell({ r: w.row, c: w.col }); containerRef.current?.focus(); }}
                  >
                    {w.hint}
                  </button>
                );
              })}
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 mt-4">Down</h4>
              {level.words.filter((w) => w.direction === "down").map((w) => {
                const wIdx = level.words.indexOf(w);
                const isActive = selectedWordIdx === wIdx;
                return (
                  <button
                    key={wIdx}
                    className={`block w-full text-left text-xs mb-1.5 rounded-lg px-2 py-1 transition-colors ${
                      isActive ? "bg-primary/10 text-primary font-semibold" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                    }`}
                    onClick={() => { setSelectedWordIdx(wIdx); setSelectedCell({ r: w.row, c: w.col }); containerRef.current?.focus(); }}
                  >
                    {w.hint}
                  </button>
                );
              })}
            </div>

            {isComplete && (
              <button onClick={handleComplete} className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined">check</span> Complete!
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
