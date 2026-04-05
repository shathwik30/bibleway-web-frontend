"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import MainLayout from "../../components/MainLayout";

type Player = "X" | "O";
type Cell = Player | null;
type Board = Cell[];
type GameMode = "1P" | "2P";

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const VICTORY_VERSES = [
  '"I can do all things through Christ who strengthens me." \u2014 Philippians 4:13',
  '"The Lord is my strength and my shield." \u2014 Psalm 28:7',
  '"Be strong and courageous." \u2014 Joshua 1:9',
  '"With God all things are possible." \u2014 Matthew 19:26',
  '"The joy of the Lord is your strength." \u2014 Nehemiah 8:10',
];

const DRAW_VERSES = [
  '"Let us not grow weary of doing good." \u2014 Galatians 6:9',
  '"Iron sharpens iron, so one person sharpens another." \u2014 Proverbs 27:17',
  '"Two are better than one." \u2014 Ecclesiastes 4:9',
];

function getWinner(board: Board): { winner: Player; line: number[] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a]!, line };
    }
  }
  return null;
}

function minimax(board: Board, isMaximizing: boolean): number {
  const result = getWinner(board);
  if (result) return result.winner === "O" ? 10 : -10;
  if (board.every((c) => c !== null)) return 0;
  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) { if (!board[i]) { board[i] = "O"; best = Math.max(best, minimax(board, false)); board[i] = null; } }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) { if (!board[i]) { board[i] = "X"; best = Math.min(best, minimax(board, true)); board[i] = null; } }
    return best;
  }
}

function getBestMove(board: Board): number {
  let bestScore = -Infinity, bestMove = -1;
  for (let i = 0; i < 9; i++) { if (!board[i]) { board[i] = "O"; const score = minimax(board, false); board[i] = null; if (score > bestScore) { bestScore = score; bestMove = i; } } }
  return bestMove;
}

function randomVerse(verses: string[]) { return verses[Math.floor(Math.random() * verses.length)]; }

export default function TicTacToePage() {
  const [mode, setMode] = useState<GameMode>("1P");
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [verse, setVerse] = useState("");
  const computerThinking = useRef(false);

  const result = getWinner(board);
  const isDraw = !result && board.every((c) => c !== null);
  const gameOver = !!result || isDraw;

  useEffect(() => {
    if (mode !== "1P" || currentPlayer !== "O" || gameOver) return;
    computerThinking.current = true;
    const timer = setTimeout(() => {
      const move = getBestMove([...board]);
      if (move === -1) { computerThinking.current = false; return; }
      const newBoard = [...board]; newBoard[move] = "O"; setBoard(newBoard);
      const winResult = getWinner(newBoard);
      if (winResult) { setScores((prev) => ({ ...prev, O: prev.O + 1 })); setVerse(randomVerse(DRAW_VERSES)); }
      else if (newBoard.every((c) => c !== null)) { setVerse(randomVerse(DRAW_VERSES)); }
      else { setCurrentPlayer("X"); }
      computerThinking.current = false;
    }, 400);
    return () => clearTimeout(timer);
  }, [currentPlayer, mode, gameOver, board]);

  const handleCellPress = useCallback((index: number) => {
    if (board[index] || gameOver || (mode === "1P" && currentPlayer === "O") || computerThinking.current) return;
    const newBoard = [...board]; newBoard[index] = currentPlayer; setBoard(newBoard);
    const winResult = getWinner(newBoard);
    if (winResult) { setScores((prev) => ({ ...prev, [winResult.winner]: prev[winResult.winner] + 1 })); setVerse(randomVerse(VICTORY_VERSES)); }
    else if (newBoard.every((c) => c !== null)) { setVerse(randomVerse(DRAW_VERSES)); }
    else { setCurrentPlayer(currentPlayer === "X" ? "O" : "X"); }
  }, [board, currentPlayer, gameOver, mode]);

  const resetGame = useCallback(() => { setBoard(Array(9).fill(null)); setCurrentPlayer("X"); setVerse(""); computerThinking.current = false; }, []);
  const handleModeChange = useCallback((newMode: GameMode) => { setMode(newMode); setBoard(Array(9).fill(null)); setCurrentPlayer("X"); setScores({ X: 0, O: 0 }); setVerse(""); computerThinking.current = false; }, []);

  const youLabel = mode === "1P" ? "You" : "Player 1";
  const opponentLabel = mode === "1P" ? "Computer" : "Player 2";
  const isInputDisabled = gameOver || (mode === "1P" && currentPlayer === "O");

  const statusText = result
    ? mode === "1P"
      ? result.winner === "X" ? "You win! Praise the Lord!" : "Computer wins. Keep the faith!"
      : `Player ${result.winner === "X" ? "1" : "2"} wins!`
    : isDraw ? "It's a draw! Well played!"
    : mode === "1P" ? currentPlayer === "X" ? "Your turn" : "Computer is thinking..."
    : `Player ${currentPlayer === "X" ? "1" : "2"}'s turn`;

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link href="/games" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="text-sm font-medium">Games</span>
        </Link>

        <h1 className="text-3xl font-headline text-on-surface mb-6 text-center">Tic Tac Toe</h1>

        {/* Mode Toggle */}
        <div className="flex rounded-xl border border-outline-variant/20 overflow-hidden mb-6">
          <button onClick={() => handleModeChange("1P")} className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${mode === "1P" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
            <span className="material-symbols-outlined text-lg">person</span> vs Computer
          </button>
          <button onClick={() => handleModeChange("2P")} className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${mode === "2P" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
            <span className="material-symbols-outlined text-lg">group</span> 2 Players
          </button>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-center mb-6 bg-surface-container-lowest rounded-xl border border-outline-variant/10 editorial-shadow">
          <div className="flex-1 text-center py-4">
            <p className="text-xs font-semibold text-primary">{youLabel} (X)</p>
            <p className="text-3xl font-bold text-on-surface">{scores.X}</p>
          </div>
          <div className="w-px h-12 bg-outline-variant/20" />
          <div className="px-6 py-4"><span className="text-sm font-semibold text-on-surface-variant">VS</span></div>
          <div className="w-px h-12 bg-outline-variant/20" />
          <div className="flex-1 text-center py-4">
            <p className="text-xs font-semibold text-tertiary-fixed-dim">{opponentLabel} (O)</p>
            <p className="text-3xl font-bold text-on-surface">{scores.O}</p>
          </div>
        </div>

        {/* Status */}
        <p className={`text-center font-semibold mb-4 ${result ? (result.winner === "X" ? "text-primary" : "text-tertiary-fixed-dim") : isDraw ? "text-tertiary-fixed-dim" : "text-on-surface"}`}>
          {statusText}
        </p>

        {/* Board */}
        <div className="flex flex-col items-center gap-2.5 mb-6">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex gap-2.5">
              {[0, 1, 2].map((col) => {
                const index = row * 3 + col;
                const isWinning = result?.line.includes(index) ?? false;
                return (
                  <button
                    key={index}
                    onClick={() => handleCellPress(index)}
                    disabled={isInputDisabled || !!board[index]}
                    className={`w-24 h-24 rounded-xl border-2 flex items-center justify-center transition-all ${
                      isWinning ? "border-primary bg-primary/15" : "border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-low"
                    } ${!board[index] && !isInputDisabled ? "cursor-pointer hover:border-primary/40" : "cursor-default"}`}
                  >
                    {board[index] === "X" && (
                      <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'wght' 700" }}>close</span>
                    )}
                    {board[index] === "O" && (
                      <span className="material-symbols-outlined text-tertiary-fixed-dim text-4xl" style={{ fontVariationSettings: "'wght' 700" }}>circle</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Play Again */}
        {gameOver && (
          <div className="text-center">
            <button onClick={resetGame} className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              Play Again
            </button>
          </div>
        )}

        {/* Victory Verse */}
        {gameOver && verse && (
          <p className="text-center text-sm text-on-surface-variant italic mt-6 max-w-sm mx-auto leading-relaxed">{verse}</p>
        )}
      </div>
    </MainLayout>
  );
}
