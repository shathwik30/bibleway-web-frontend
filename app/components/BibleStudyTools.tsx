"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "../lib/api";

interface BibleStudyToolsProps {
  selectedBibleId: string;
  selectedChapterId: string;
  onNavigateToChapter?: (chapterId: string) => void;
}

export default function BibleStudyTools({ selectedBibleId, selectedChapterId, onNavigateToChapter }: BibleStudyToolsProps) {
  const [activePanel, setActivePanel] = useState<"search" | "bookmarks" | "highlights" | "notes" | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);

  // Highlights
  const [highlights, setHighlights] = useState<any[]>([]);
  const [highlightsLoaded, setHighlightsLoaded] = useState(false);

  // Notes
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetchAPI(`/bible/search/?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res?.data?.results || res?.results || res?.data || []);
    } catch (err) {
      console.error("Bible search failed:", err);
    } finally {
      setSearching(false);
    }
  }

  async function loadBookmarks() {
    if (bookmarksLoaded) return;
    try {
      const res = await fetchAPI("/bible/bookmarks/");
      setBookmarks(res?.data?.results || res?.results || res?.data || []);
      setBookmarksLoaded(true);
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    }
  }

  async function addBookmark() {
    try {
      const res = await fetchAPI("/bible/bookmarks/", {
        method: "POST",
        body: JSON.stringify({ chapter_id: selectedChapterId, bible_id: selectedBibleId, note: "" }),
      });
      const newBm = res.data || res;
      setBookmarks((prev) => [newBm, ...prev]);
    } catch (err: any) {
      alert(err.message || "Failed to bookmark.");
    }
  }

  async function loadHighlights() {
    if (highlightsLoaded) return;
    try {
      const res = await fetchAPI("/bible/highlights/");
      setHighlights(res?.data?.results || res?.results || res?.data || []);
      setHighlightsLoaded(true);
    } catch (err) {
      console.error("Failed to load highlights:", err);
    }
  }

  async function addHighlight() {
    try {
      const res = await fetchAPI("/bible/highlights/", {
        method: "POST",
        body: JSON.stringify({ chapter_id: selectedChapterId, bible_id: selectedBibleId, color: "yellow" }),
      });
      const newHl = res.data || res;
      setHighlights((prev) => [newHl, ...prev]);
    } catch (err: any) {
      alert(err.message || "Failed to highlight.");
    }
  }

  async function loadNotes() {
    if (notesLoaded) return;
    try {
      const res = await fetchAPI("/bible/notes/");
      setNotes(res?.data?.results || res?.results || res?.data || []);
      setNotesLoaded(true);
    } catch (err) {
      console.error("Failed to load notes:", err);
    }
  }

  async function addNote() {
    if (!newNoteText.trim() || addingNote) return;
    setAddingNote(true);
    try {
      const res = await fetchAPI("/bible/notes/", {
        method: "POST",
        body: JSON.stringify({ chapter_id: selectedChapterId, bible_id: selectedBibleId, text: newNoteText.trim() }),
      });
      const newN = res.data || res;
      setNotes((prev) => [newN, ...prev]);
      setNewNoteText("");
    } catch (err: any) {
      alert(err.message || "Failed to add note.");
    } finally {
      setAddingNote(false);
    }
  }

  function togglePanel(panel: typeof activePanel) {
    if (activePanel === panel) {
      setActivePanel(null);
      return;
    }
    setActivePanel(panel);
    if (panel === "bookmarks") loadBookmarks();
    if (panel === "highlights") loadHighlights();
    if (panel === "notes") loadNotes();
  }

  return (
    <div className="space-y-4">
      {/* Tool Bar */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => togglePanel("search")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activePanel === "search" ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"}`}>
          <span className="material-symbols-outlined text-sm">search</span> Search
        </button>
        <button onClick={() => togglePanel("bookmarks")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activePanel === "bookmarks" ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"}`}>
          <span className="material-symbols-outlined text-sm">bookmark</span> Bookmarks
        </button>
        <button onClick={() => togglePanel("highlights")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activePanel === "highlights" ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"}`}>
          <span className="material-symbols-outlined text-sm">highlight</span> Highlights
        </button>
        <button onClick={() => togglePanel("notes")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activePanel === "notes" ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"}`}>
          <span className="material-symbols-outlined text-sm">edit_note</span> Notes
        </button>
      </div>

      {/* Action Buttons */}
      {selectedChapterId && (
        <div className="flex gap-2">
          <button onClick={addBookmark} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all" title="Bookmark this chapter">
            <span className="material-symbols-outlined text-sm">bookmark_add</span> Bookmark
          </button>
          <button onClick={addHighlight} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-800 text-xs font-semibold hover:bg-yellow-200 transition-all" title="Highlight this chapter">
            <span className="material-symbols-outlined text-sm">highlight</span> Highlight
          </button>
        </div>
      )}

      {/* Search Panel */}
      {activePanel === "search" && (
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20">
          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <input type="text" placeholder="Search the Bible..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" />
            <button type="submit" disabled={searching} className="bg-primary text-on-primary px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
              {searching ? "..." : "Search"}
            </button>
          </form>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {searchResults.map((r: any, i: number) => (
              <button
                key={i}
                onClick={() => onNavigateToChapter?.(r.chapter_id || r.id)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low text-sm transition-colors"
              >
                <span className="font-semibold text-primary">{r.reference || r.title || `Result ${i + 1}`}</span>
                <p className="text-xs text-on-surface-variant line-clamp-1">{r.text || r.content || ""}</p>
              </button>
            ))}
            {!searching && searchResults.length === 0 && searchQuery && (
              <p className="text-xs text-on-surface-variant text-center py-2">No results found.</p>
            )}
          </div>
        </div>
      )}

      {/* Bookmarks Panel */}
      {activePanel === "bookmarks" && (
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20">
          <label className="text-[10px] uppercase tracking-widest font-bold text-primary block mb-2">Saved Bookmarks</label>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {bookmarks.length > 0 ? bookmarks.map((bm: any, i: number) => (
              <button
                key={bm.id || i}
                onClick={() => onNavigateToChapter?.(bm.chapter_id)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low text-sm transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-primary text-sm">bookmark</span>
                <span>{bm.chapter_id || bm.reference || `Bookmark ${i + 1}`}</span>
              </button>
            )) : (
              <p className="text-xs text-on-surface-variant text-center py-2">No bookmarks yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Highlights Panel */}
      {activePanel === "highlights" && (
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20">
          <label className="text-[10px] uppercase tracking-widest font-bold text-primary block mb-2">Highlights</label>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {highlights.length > 0 ? highlights.map((hl: any, i: number) => (
              <button
                key={hl.id || i}
                onClick={() => onNavigateToChapter?.(hl.chapter_id)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-50 text-sm transition-colors flex items-center gap-2"
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hl.color || "yellow" }}></span>
                <span>{hl.chapter_id || hl.reference || `Highlight ${i + 1}`}</span>
              </button>
            )) : (
              <p className="text-xs text-on-surface-variant text-center py-2">No highlights yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Notes Panel */}
      {activePanel === "notes" && (
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20">
          <label className="text-[10px] uppercase tracking-widest font-bold text-primary block mb-2">Notes</label>
          <div className="flex gap-2 mb-3">
            <input type="text" placeholder="Add a note for this chapter..." value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()} className="flex-1 bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" />
            <button onClick={addNote} disabled={addingNote || !newNoteText.trim()} className="bg-primary text-on-primary px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
              {addingNote ? "..." : "Add"}
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {notes.length > 0 ? notes.map((note: any, i: number) => (
              <div key={note.id || i} className="px-3 py-2 rounded-lg bg-surface-container-low">
                <p className="text-xs text-primary font-semibold">{note.chapter_id || note.reference || `Chapter`}</p>
                <p className="text-sm text-on-surface-variant">{note.text}</p>
              </div>
            )) : (
              <p className="text-xs text-on-surface-variant text-center py-2">No notes yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
