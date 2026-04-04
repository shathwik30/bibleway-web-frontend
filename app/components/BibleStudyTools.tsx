"use client";

import { useState } from "react";
import { fetchAPI } from "../lib/api";
import { formatVerseRef } from "../bible/page";

// Helper to enrich highlights with locally-stored selected_text
function getHighlightTextMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("highlight_text_map") || "{}");
  } catch { return {}; }
}

function removeHighlightTextEntry(highlightId: string) {
  if (typeof window === "undefined") return;
  const map = getHighlightTextMap();
  delete map[highlightId];
  localStorage.setItem("highlight_text_map", JSON.stringify(map));
}

function enrichHighlights(highlights: any[]): any[] {
  const map = getHighlightTextMap();
  return highlights.map((hl) => ({
    ...hl,
    selected_text: hl.selected_text || map[hl.id] || "",
  }));
}

interface BibleStudyToolsProps {
  selectedBibleId: string;
  selectedChapterId: string;
  onNavigateToChapter?: (chapterId: string) => void;
  onHighlightsChange?: (highlights: any[]) => void;
}

export default function BibleStudyTools({ selectedBibleId, selectedChapterId, onNavigateToChapter, onHighlightsChange }: BibleStudyToolsProps) {
  const [activePanel, setActivePanel] = useState<"search" | "bookmarks" | "highlights" | "notes" | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  // Highlights
  const [highlights, setHighlights] = useState<any[]>([]);
  const [highlightsLoaded, setHighlightsLoaded] = useState(false);
  const [highlightsLoading, setHighlightsLoading] = useState(false);

  // Notes
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Highlight color (used by parent for text-selection highlighting)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      // Search endpoint searches segregated pages (study content)
      const res = await fetchAPI(`/bible/search/?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res?.data?.results || res?.results || res?.data || []);
    } catch { /* error */ } finally {
      setSearching(false);
    }
  }

  async function loadBookmarks() {
    if (bookmarksLoaded) return;
    setBookmarksLoading(true);
    try {
      const res = await fetchAPI("/bible/bookmarks/?type=api_bible");
      setBookmarks(res?.data?.results || res?.results || res?.data || []);
      setBookmarksLoaded(true);
    } catch { /* error */ } finally {
      setBookmarksLoading(false);
    }
  }

  async function addBookmark() {
    if (!selectedChapterId) return;
    // Check if already bookmarked
    const exists = bookmarks.some((bm) => bm.verse_reference === selectedChapterId);
    if (exists) return;
    try {
      const res = await fetchAPI("/bible/bookmarks/", {
        method: "POST",
        body: JSON.stringify({ bookmark_type: "api_bible", verse_reference: selectedChapterId }),
      });
      const newBm = res.data || res;
      setBookmarks((prev) => [newBm, ...prev]);
    } catch (err: any) {
      alert(err.message || "Failed to bookmark.");
    }
  }

  async function removeBookmark(id: string) {
    try {
      await fetchAPI(`/bible/bookmarks/${id}/`, { method: "DELETE" });
      setBookmarks((prev) => prev.filter((bm) => bm.id !== id));
    } catch { /* error */ }
  }

  async function loadHighlights() {
    if (highlightsLoaded) return;
    setHighlightsLoading(true);
    try {
      const res = await fetchAPI("/bible/highlights/?type=api_bible");
      const raw = res?.data?.results || res?.results || res?.data || [];
      const data = enrichHighlights(raw);
      setHighlights(data);
      setHighlightsLoaded(true);
      onHighlightsChange?.(data);
    } catch { /* error */ } finally {
      setHighlightsLoading(false);
    }
  }

  async function removeHighlight(id: string) {
    try {
      await fetchAPI(`/bible/highlights/${id}/`, { method: "DELETE" });
      removeHighlightTextEntry(id);
      const updated = highlights.filter((hl) => hl.id !== id);
      setHighlights(updated);
      onHighlightsChange?.(updated);
    } catch { /* error */ }
  }

  async function loadNotes() {
    if (notesLoaded) return;
    setNotesLoading(true);
    try {
      const res = await fetchAPI("/bible/notes/?type=api_bible");
      setNotes(res?.data?.results || res?.results || res?.data || []);
      setNotesLoaded(true);
    } catch { /* error */ } finally {
      setNotesLoading(false);
    }
  }

  async function addNote() {
    if (!newNoteText.trim() || addingNote || !selectedChapterId) return;
    setAddingNote(true);
    try {
      const res = await fetchAPI("/bible/notes/", {
        method: "POST",
        body: JSON.stringify({ note_type: "api_bible", verse_reference: selectedChapterId, text: newNoteText.trim() }),
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

  async function removeNote(id: string) {
    try {
      await fetchAPI(`/bible/notes/${id}/`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch { /* error */ }
  }

  function togglePanel(panel: typeof activePanel) {
    if (activePanel === panel) { setActivePanel(null); return; }
    setActivePanel(panel);
    if (panel === "bookmarks") loadBookmarks();
    if (panel === "highlights") loadHighlights();
    if (panel === "notes") loadNotes();
  }

  const isBookmarked = bookmarks.some((bm) => bm.verse_reference === selectedChapterId);

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

      {/* Quick Actions for current chapter */}
      {selectedChapterId && (
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => { if (isBookmarked) { const bm = bookmarks.find(b => b.verse_reference === selectedChapterId); if (bm) removeBookmark(bm.id); } else addBookmark(); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isBookmarked ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this chapter"}
          >
            <span className="material-symbols-outlined text-sm" style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}>bookmark</span>
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </button>
          <span className="text-[10px] text-on-surface-variant/50">Select text to highlight</span>
        </div>
      )}

      {/* Search Panel */}
      {activePanel === "search" && (
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20">
          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <input type="text" placeholder="Search study content..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40" />
            <button type="submit" disabled={searching} className="bg-primary text-on-primary px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
              {searching ? "..." : "Search"}
            </button>
          </form>
          <p className="text-[10px] text-on-surface-variant/50 mb-2">Searches across study sections and pages</p>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {searchResults.map((r: any, i: number) => (
              <div key={r.id || i} className="px-3 py-2 rounded-lg bg-surface-container-low text-sm">
                <span className="font-semibold text-primary">{r.title || `Result ${i + 1}`}</span>
                {r.chapter && <p className="text-xs text-on-surface-variant/60 mt-0.5">Chapter: {r.chapter}</p>}
              </div>
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
            {bookmarksLoading ? (
              <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary"></div></div>
            ) : bookmarks.length > 0 ? bookmarks.map((bm: any) => (
              <div key={bm.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors group">
                <button
                  onClick={() => onNavigateToChapter?.(bm.verse_reference)}
                  className="flex items-center gap-2 text-sm text-on-surface hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                  <span>{formatVerseRef(bm.verse_reference)}</span>
                </button>
                <button onClick={() => removeBookmark(bm.id)} className="text-on-surface-variant/0 group-hover:text-red-500 transition-all" title="Remove">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )) : (
              <p className="text-xs text-on-surface-variant text-center py-2">No bookmarks yet. Bookmark a chapter to see it here.</p>
            )}
          </div>
        </div>
      )}

      {/* Highlights Panel */}
      {activePanel === "highlights" && (
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20">
          <label className="text-[10px] uppercase tracking-widest font-bold text-primary block mb-2">Highlights</label>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {highlightsLoading ? (
              <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary"></div></div>
            ) : highlights.length > 0 ? highlights.map((hl: any) => (
              <div key={hl.id} className="flex items-start justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors group">
                <button
                  onClick={() => onNavigateToChapter?.(hl.verse_reference)}
                  className="flex items-start gap-2 text-left text-sm text-on-surface hover:text-primary transition-colors min-w-0"
                >
                  <span className="w-3 h-3 rounded-full shrink-0 mt-1" style={{ backgroundColor: hl.color || "yellow" }} />
                  <div className="min-w-0">
                    {hl.selected_text ? (
                      <>
                        <span className="line-clamp-1 italic text-on-surface-variant">&ldquo;{hl.selected_text.slice(0, 40)}{hl.selected_text.length > 40 ? "..." : ""}&rdquo;</span>
                        <span className="block text-[10px] text-primary/60 mt-0.5">{formatVerseRef(hl.verse_reference)}</span>
                      </>
                    ) : (
                      <span>{formatVerseRef(hl.verse_reference)}</span>
                    )}
                  </div>
                </button>
                <button onClick={() => removeHighlight(hl.id)} className="text-on-surface-variant/0 group-hover:text-red-500 transition-all shrink-0 mt-0.5" title="Remove">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )) : (
              <p className="text-xs text-on-surface-variant text-center py-2">No highlights yet. Select text in the reader to highlight.</p>
            )}
          </div>
        </div>
      )}

      {/* Notes Panel */}
      {activePanel === "notes" && (
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20">
          <label className="text-[10px] uppercase tracking-widest font-bold text-primary block mb-2">Notes</label>
          <div className="flex gap-2 mb-3">
            <input type="text" placeholder="Add a note for this chapter..." value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()} className="flex-1 bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40" />
            <button onClick={addNote} disabled={addingNote || !newNoteText.trim()} className="bg-primary text-on-primary px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
              {addingNote ? "..." : "Add"}
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {notesLoading ? (
              <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary"></div></div>
            ) : notes.length > 0 ? notes.map((note: any) => (
              <div key={note.id} className="px-3 py-2 rounded-lg bg-surface-container-low group relative">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-primary font-semibold">{formatVerseRef(note.verse_reference)}</p>
                  <button onClick={() => removeNote(note.id)} className="text-on-surface-variant/0 group-hover:text-red-500 transition-all" title="Delete">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <p className="text-sm text-on-surface-variant mt-0.5">{note.text}</p>
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
