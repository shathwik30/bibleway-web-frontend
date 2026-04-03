"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { marked } from "marked";
import DOMPurify from "dompurify";
import MainLayout from "../components/MainLayout";
import { fetchAPI } from "../lib/api";
import Shimmer from "../components/Shimmer";
import BibleStudyTools from "../components/BibleStudyTools";
import TTSControls from "../components/TTSControls";
import YouTubeSermons from "../components/YouTubeSermons";
import { useBibles, useBooks, useChapters, useChapterContent, useStudySections, useStudyChapters, useStudyPages, useStudyPageDetail } from "../lib/hooks";

marked.setOptions({ breaks: true, gfm: true });

function sanitizeHTML(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "b", "i", "em", "strong", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "ul", "ol", "li", "a", "sup", "sub"],
    ALLOWED_ATTR: ["class", "href", "target", "rel"],
  });
}

// ─── Book name mapping for readable display ───────────────────
const BOOK_NAMES: Record<string, string> = {
  GEN: "Genesis", EXO: "Exodus", LEV: "Leviticus", NUM: "Numbers", DEU: "Deuteronomy",
  JOS: "Joshua", JDG: "Judges", RUT: "Ruth", "1SA": "1 Samuel", "2SA": "2 Samuel",
  "1KI": "1 Kings", "2KI": "2 Kings", "1CH": "1 Chronicles", "2CH": "2 Chronicles",
  EZR: "Ezra", NEH: "Nehemiah", EST: "Esther", JOB: "Job", PSA: "Psalms",
  PRO: "Proverbs", ECC: "Ecclesiastes", SNG: "Song of Solomon", ISA: "Isaiah",
  JER: "Jeremiah", LAM: "Lamentations", EZK: "Ezekiel", DAN: "Daniel", HOS: "Hosea",
  JOL: "Joel", AMO: "Amos", OBA: "Obadiah", JON: "Jonah", MIC: "Micah",
  NAM: "Nahum", HAB: "Habakkuk", ZEP: "Zephaniah", HAG: "Haggai", ZEC: "Zechariah",
  MAL: "Malachi", MAT: "Matthew", MRK: "Mark", LUK: "Luke", JHN: "John",
  ACT: "Acts", ROM: "Romans", "1CO": "1 Corinthians", "2CO": "2 Corinthians",
  GAL: "Galatians", EPH: "Ephesians", PHP: "Philippians", COL: "Colossians",
  "1TH": "1 Thessalonians", "2TH": "2 Thessalonians", "1TI": "1 Timothy", "2TI": "2 Timothy",
  TIT: "Titus", PHM: "Philemon", HEB: "Hebrews", JAS: "James",
  "1PE": "1 Peter", "2PE": "2 Peter", "1JN": "1 John", "2JN": "2 John", "3JN": "3 John",
  JUD: "Jude", REV: "Revelation",
};

export function formatVerseRef(ref: string): string {
  if (!ref) return ref;
  // "GEN.1" → "Genesis 1", "JHN.3.16" → "John 3:16"
  const parts = ref.split(".");
  const bookCode = parts[0];
  const bookName = BOOK_NAMES[bookCode] || bookCode;
  if (parts.length === 1) return bookName;
  if (parts.length === 2) return `${bookName} ${parts[1]}`;
  return `${bookName} ${parts[1]}:${parts[2]}`;
}

// ─── Step type for the Standard Reader flow ────────────────────
type ReaderStep = "pick-bible" | "pick-book" | "pick-chapter" | "reading";
// ─── Step type for the Study flow ──────────────────────────────
type StudyStep = "pick-section" | "pick-module" | "reading";

function BibleContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "study" ? "study" : "standard";
  const [activeTab, setActiveTab] = useState<"standard" | "study">(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "study" || tab === "standard") setActiveTab(tab);
  }, [searchParams]);

  // ═══════════════════════════════════════════════════════════════
  // STANDARD READER STATE (React Query cached)
  // ═══════════════════════════════════════════════════════════════
  const [readerStep, setReaderStep] = useState<ReaderStep>("pick-bible");
  const [selectedBible, setSelectedBible] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  // React Query hooks — cached with mobile-matching TTLs
  const { data: bibles = [], isLoading: biblesLoading } = useBibles();
  const { data: books = [], isLoading: booksLoading } = useBooks(selectedBible?.id);
  const { data: chapters = [], isLoading: chaptersLoading } = useChapters(selectedBible?.id, selectedBook?.id);
  const { data: chapterData = null, isLoading: contentLoading } = useChapterContent(selectedBible?.id, selectedChapterId || null);

  // ═══════════════════════════════════════════════════════════════
  // STUDY STATE (React Query cached)
  // ═══════════════════════════════════════════════════════════════
  const [studyStep, setStudyStep] = useState<StudyStep>("pick-section");
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedStudyChapter, setSelectedStudyChapter] = useState<any>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const { data: sections = [], isLoading: sectionsLoading } = useStudySections();
  const { data: studyChapters = [], isLoading: studyChaptersLoading } = useStudyChapters(selectedSection?.id);
  const { data: pages = [], isLoading: studyPagesLoading } = useStudyPages(selectedStudyChapter?.id);
  const { data: pageData = null, isLoading: studyContentLoading } = useStudyPageDetail(selectedPageId);

  // Auto-select first page when pages load
  useEffect(() => {
    if (pages.length > 0 && !selectedPageId) setSelectedPageId(pages[0].id);
  }, [pages]);

  // ─── Highlight state for visual rendering ───────────────────
  const [activeHighlights, setActiveHighlights] = useState<any[]>([]);
  const [selectionPopup, setSelectionPopup] = useState<{ text: string; x: number; y: number } | null>(null);
  const [popupColor, setPopupColor] = useState("yellow");
  const articleRef = React.useRef<HTMLDivElement>(null);

  // Listen for text selection inside the bible article
  React.useEffect(() => {
    function handleMouseUp() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        // Delay clearing so click on popup buttons registers
        setTimeout(() => setSelectionPopup(null), 200);
        return;
      }
      // Only capture selections inside the article
      if (articleRef.current && articleRef.current.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionPopup({
          text: sel.toString().trim(),
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
      }
    }
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  async function handleHighlightSelection(color: string) {
    if (!selectionPopup || !selectedChapterId) return;
    try {
      const res = await fetchAPI("/bible/highlights/", {
        method: "POST",
        body: JSON.stringify({
          highlight_type: "api_bible",
          verse_reference: selectedChapterId,
          color,
          selected_text: selectionPopup.text,
        }),
      });
      const newHl = res.data || res;
      // Store the selected text locally even if backend doesn't return it
      if (!newHl.selected_text) newHl.selected_text = selectionPopup.text;
      setActiveHighlights((prev) => [...prev, newHl]);
      setSelectionPopup(null);
      window.getSelection()?.removeAllRanges();
    } catch (err: any) {
      alert(err.message || "Failed to highlight.");
    }
  }

  // Apply highlights to HTML content by wrapping matched text in <mark>
  function applyHighlightsToContent(html: string): string {
    if (!html) return html;
    const chapterHighlights = activeHighlights.filter(
      (hl) => hl.verse_reference === selectedChapterId && hl.selected_text
    );
    if (chapterHighlights.length === 0) return html;

    let result = html;
    const colorMap: Record<string, string> = {
      yellow: "rgba(253, 224, 71, 0.35)",
      green: "rgba(134, 239, 172, 0.35)",
      blue: "rgba(147, 197, 253, 0.35)",
      pink: "rgba(249, 168, 212, 0.35)",
    };
    for (const hl of chapterHighlights) {
      const text = hl.selected_text;
      if (!text) continue;
      // Escape special regex characters
      const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const bg = colorMap[hl.color] || colorMap.yellow;
      result = result.replace(
        new RegExp(`(?<=>)([^<]*?)(${escaped})`, "gi"),
        (_, before, match) => `${before}<mark style="background:${bg};padding:2px 0;border-radius:3px">${match}</mark>`
      );
    }
    return result;
  }

  // Bibles, books, chapters, content all loaded via React Query hooks above

  // ─── Browser back/forward button support ────────────────────
  const isRestoringRef = React.useRef(false);

  React.useEffect(() => {
    if (!window.history.state?.bibleStep) {
      window.history.replaceState({ bibleStep: "pick-bible", tab: "standard" }, "");
    }

    function handlePopState(e: PopStateEvent) {
      const state = e.state;
      if (!state?.bibleStep) return;
      isRestoringRef.current = true;

      // Just restore selections — React Query serves from cache instantly
      if (state.tab === "standard") {
        setActiveTab("standard");
        const step = state.bibleStep as ReaderStep;
        setReaderStep(step);
        if (step === "pick-bible") { setSelectedBible(null); setSelectedBook(null); setSelectedChapterId(""); }
        else if (step === "pick-book") { setSelectedBible(state.bible); setSelectedBook(null); setSelectedChapterId(""); }
        else if (step === "pick-chapter") { setSelectedBible(state.bible); setSelectedBook(state.book); setSelectedChapterId(""); }
        else if (step === "reading") { setSelectedBible(state.bible); setSelectedBook(state.book); setSelectedChapterId(state.chapterId); }
      } else if (state.tab === "study") {
        setActiveTab("study");
        const step = state.bibleStep as StudyStep;
        setStudyStep(step);
        if (step === "pick-section") { setSelectedSection(null); setSelectedStudyChapter(null); setSelectedPageId(null); }
        else if (step === "pick-module") { setSelectedSection(state.section); setSelectedStudyChapter(null); setSelectedPageId(null); }
        else if (step === "reading") { setSelectedSection(state.section); setSelectedStudyChapter(state.studyChapter); setSelectedPageId(null); }
      }
      isRestoringRef.current = false;
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function pushBibleHistory(step: string, tab: string, extra: Record<string, any> = {}) {
    window.history.pushState({ bibleStep: step, tab, ...extra }, "");
  }

  // ─── Pick Bible → load books ─────────────────────────────────
  // Navigation just sets state — React Query handles fetching + caching
  function handlePickBible(bible: any) {
    setSelectedBible(bible);
    setSelectedBook(null);
    setSelectedChapterId("");
    setReaderStep("pick-book");
    pushBibleHistory("pick-book", "standard", { bible });
  }

  function handlePickBook(book: any) {
    setSelectedBook(book);
    setSelectedChapterId("");
    setReaderStep("pick-chapter");
    pushBibleHistory("pick-chapter", "standard", { bible: selectedBible, book });
  }

  function handlePickChapter(chapterId: string) {
    setSelectedChapterId(chapterId);
    setReaderStep("reading");
    pushBibleHistory("reading", "standard", { bible: selectedBible, book: selectedBook, chapterId });
  }

  function handleSwitchChapter(chapterId: string) {
    setSelectedChapterId(chapterId);
    // If switching to a different book, update selectedBook
    const newBookCode = chapterId.split(".")[0];
    if (newBookCode !== selectedBook?.id && books.length > 0) {
      const matchingBook = books.find((b: any) => b.id === newBookCode);
      if (matchingBook) setSelectedBook(matchingBook);
    }
  }

  // Sections, study chapters, pages, page detail all loaded via React Query hooks above

  function handlePickSection(section: any) {
    setSelectedSection(section);
    setSelectedStudyChapter(null);
    setSelectedPageId(null);
    setStudyStep("pick-module");
    pushBibleHistory("pick-module", "study", { section });
  }

  function handlePickModule(chapter: any) {
    setSelectedStudyChapter(chapter);
    setSelectedPageId(null);
    setStudyStep("reading");
    pushBibleHistory("reading", "study", { section: selectedSection, studyChapter: chapter });
  }

  function handleSwitchPage(pageId: string) {
    setSelectedPageId(pageId);
  }

  // ─── Breadcrumb back navigation — just clear selections, data stays cached ──
  function goBackReader(to: ReaderStep) {
    setReaderStep(to);
    if (to === "pick-bible") { setSelectedBible(null); setSelectedBook(null); setSelectedChapterId(""); }
    if (to === "pick-book") { setSelectedBook(null); setSelectedChapterId(""); }
    if (to === "pick-chapter") { setSelectedChapterId(""); }
  }

  function goBackStudy(to: StudyStep) {
    setStudyStep(to);
    if (to === "pick-section") { setSelectedSection(null); setSelectedStudyChapter(null); setSelectedPageId(null); }
    if (to === "pick-module") { setSelectedStudyChapter(null); setSelectedPageId(null); }
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <MainLayout>
      <div className="flex flex-col items-center">
        {/* Tab Navigation */}
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 mb-6">
          <div className="flex gap-8 sm:gap-12 border-b border-outline-variant/20">
            <button
              onClick={() => setActiveTab("standard")}
              className={`pb-3 text-lg sm:text-xl font-headline transition-colors ${activeTab === "standard" ? "border-b-2 border-primary text-on-surface" : "text-on-surface-variant/50 hover:text-on-surface"}`}
            >
              Bible
            </button>
            <button
              onClick={() => setActiveTab("study")}
              className={`pb-3 text-lg sm:text-xl font-headline transition-colors ${activeTab === "study" ? "border-b-2 border-primary text-on-surface" : "text-on-surface-variant/50 hover:text-on-surface"}`}
            >
              Study
            </button>
          </div>
        </div>

        {/* ══════════════ STANDARD READER ══════════════ */}
        {activeTab === "standard" && (
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-32">

            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-1.5 text-sm text-on-surface-variant mb-8">
              <button onClick={() => goBackReader("pick-bible")} className="hover:text-primary transition-colors font-medium">Translations</button>
              {selectedBible && (
                <>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <button onClick={() => goBackReader("pick-book")} className="hover:text-primary transition-colors font-medium">{selectedBible.nameLocal || selectedBible.abbreviation}</button>
                </>
              )}
              {selectedBook && (
                <>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <button onClick={() => goBackReader("pick-chapter")} className="hover:text-primary transition-colors font-medium">{selectedBook.name}</button>
                </>
              )}
              {readerStep === "reading" && chapterData && (
                <>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <span className="text-primary font-semibold">{chapterData.reference}</span>
                </>
              )}
            </div>

            {/* STEP 1: Pick Bible Translation */}
            {readerStep === "pick-bible" && (
              <div>
                <h1 className="text-3xl sm:text-4xl font-headline text-on-surface mb-2">Choose a Translation</h1>
                <p className="text-on-surface-variant mb-8">Select a Bible version to start reading.</p>
                {biblesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3,4,5,6].map(i => <Shimmer key={i} className="h-24 rounded-xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bibles.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handlePickBible(b)}
                        className="text-left p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/15 hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-headline text-lg text-on-surface group-hover:text-primary transition-colors leading-tight">{b.nameLocal || b.name}</h3>
                            {b.description && <p className="text-sm text-on-surface-variant/60 mt-1 line-clamp-1">{b.description}</p>}
                            <p className="text-xs text-on-surface-variant/50 mt-2">{b.language?.nameLocal || "English"} — {b.abbreviation}</p>
                          </div>
                          <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-colors ml-3 mt-1 shrink-0">chevron_right</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Pick Book */}
            {readerStep === "pick-book" && (
              <div>
                <button onClick={() => goBackReader("pick-bible")} className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-4">
                  <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Translations
                </button>
                <h1 className="text-3xl sm:text-4xl font-headline text-on-surface mb-2">
                  {selectedBible?.nameLocal || "Bible"}
                </h1>
                <p className="text-on-surface-variant mb-8">Choose a book to read.</p>
                {booksLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[...Array(12)].map((_, i) => <Shimmer key={i} className="h-14 rounded-xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {books.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handlePickBook(b)}
                        className="text-left px-4 py-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/15 hover:border-primary/30 hover:bg-surface-container-low transition-all duration-200 group"
                      >
                        <span className="font-headline text-on-surface group-hover:text-primary transition-colors">{b.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Pick Chapter */}
            {readerStep === "pick-chapter" && (
              <div>
                <button onClick={() => goBackReader("pick-book")} className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-4">
                  <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Books
                </button>
                <h1 className="text-3xl sm:text-4xl font-headline text-on-surface mb-2">{selectedBook?.name}</h1>
                <p className="text-on-surface-variant mb-8">Pick a chapter.</p>
                {chaptersLoading ? (
                  <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-3">
                    {[...Array(20)].map((_, i) => <Shimmer key={i} className="aspect-square rounded-xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-3">
                    {chapters.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => handlePickChapter(ch.id)}
                        className="aspect-square flex items-center justify-center rounded-xl font-headline text-lg bg-surface-container-lowest border border-outline-variant/15 hover:bg-primary hover:text-on-primary hover:border-primary transition-all duration-200"
                      >
                        {ch.number}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Reading */}
            {readerStep === "reading" && (
              <div className="flex flex-col xl:flex-row gap-8">
                {/* Sidebar controls */}
                <aside className="w-full xl:w-72 space-y-6 xl:order-2 print:hidden">
                  {/* Chapter grid */}
                  <div>
                    <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-3">Chapters</label>
                    <div className="grid grid-cols-6 sm:grid-cols-8 xl:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {chapters.map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => handleSwitchChapter(ch.id)}
                          className={`aspect-square flex items-center justify-center rounded-lg font-headline text-sm transition-all ${
                            selectedChapterId === ch.id ? "bg-primary text-on-primary" : "bg-surface-container-lowest hover:bg-surface-container-high"
                          }`}
                        >
                          {ch.number}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Study Tools */}
                  <BibleStudyTools
                    selectedBibleId={selectedBible?.id || ""}
                    selectedChapterId={selectedChapterId}
                    onNavigateToChapter={(chId) => handleSwitchChapter(chId)}
                    onHighlightsChange={setActiveHighlights}
                  />
                </aside>

                {/* Content */}
                <div className="flex-1 xl:order-1">
                  <header className="mb-8">
                    <span className="text-xs font-label uppercase tracking-[0.3em] text-on-tertiary-fixed-variant bg-tertiary-fixed/30 px-3 py-1 rounded-full mb-4 inline-block">
                      {selectedBook?.name}
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline text-on-surface mb-4">
                      {chapterData?.reference || "Loading..."}
                    </h1>
                  </header>

                  <TTSControls content={chapterData?.content || null} chapterId={selectedChapterId} />

                  {contentLoading ? (
                    <div className="space-y-4 mt-6">
                      <Shimmer className="h-6 w-3/4" />
                      <Shimmer className="h-4 w-full" />
                      <Shimmer className="h-4 w-full" />
                      <Shimmer className="h-4 w-5/6" />
                    </div>
                  ) : (
                    <>
                      <div ref={articleRef} className="relative">
                        <article
                          className="bible-content space-y-4 text-on-surface font-body leading-[1.9] max-w-none mt-6
                            [&>p]:mb-5 [&>p]:text-base [&>p]:sm:text-lg [&>p]:pl-4 [&>p]:border-l-2 [&>p]:border-transparent
                            [&_.v]:text-primary/60 [&_.v]:text-xs [&_.v]:font-bold [&_.v]:align-super [&_.v]:mr-1
                            [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-6 [&_blockquote]:py-3
                            [&_blockquote]:my-6 [&_blockquote]:bg-primary/5 [&_blockquote]:rounded-r-lg [&_blockquote]:italic
                            [&_h3]:text-2xl [&_h3]:font-headline [&_h3]:mt-8 [&_h3]:mb-4
                            [&_h4]:text-xl [&_h4]:font-headline [&_h4]:mt-6 [&_h4]:mb-3"
                          dangerouslySetInnerHTML={{ __html: sanitizeHTML(applyHighlightsToContent(chapterData?.content || "<p>Select a chapter to begin reading</p>")) }}
                        />

                        {/* Floating highlight toolbar on text selection */}
                        {selectionPopup && (
                          <div
                            className="fixed z-[200] flex items-center gap-1 bg-surface-container-lowest rounded-full shadow-xl border border-outline-variant/20 px-2 py-1.5"
                            style={{ left: selectionPopup.x, top: selectionPopup.y, transform: "translate(-50%, -100%)" }}
                          >
                            {[
                              { color: "yellow", bg: "bg-yellow-300" },
                              { color: "green", bg: "bg-green-300" },
                              { color: "blue", bg: "bg-blue-300" },
                              { color: "pink", bg: "bg-pink-300" },
                            ].map((c) => (
                              <button
                                key={c.color}
                                onMouseDown={(e) => { e.preventDefault(); handleHighlightSelection(c.color); }}
                                className={`w-6 h-6 rounded-full ${c.bg} hover:scale-125 transition-transform`}
                                title={`Highlight ${c.color}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <YouTubeSermons
                        bookId={selectedBook?.id || ""}
                        bookName={selectedBook?.name || ""}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ STUDY ══════════════ */}
        {activeTab === "study" && (
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-32">

            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-1.5 text-sm text-on-surface-variant mb-8">
              <button onClick={() => goBackStudy("pick-section")} className="hover:text-primary transition-colors font-medium">Sections</button>
              {selectedSection && (
                <>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <button onClick={() => goBackStudy("pick-module")} className="hover:text-primary transition-colors font-medium">{selectedSection.title}</button>
                </>
              )}
              {selectedStudyChapter && (
                <>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <span className="text-primary font-semibold">{selectedStudyChapter.title}</span>
                </>
              )}
            </div>

            {/* STEP 1: Pick Section */}
            {studyStep === "pick-section" && (
              <div>
                <h1 className="text-3xl sm:text-4xl font-headline text-on-surface mb-2">Study Sections</h1>
                <p className="text-on-surface-variant mb-8">Choose a study section to begin.</p>
                {sectionsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3].map(i => <Shimmer key={i} className="h-28 rounded-xl" />)}
                  </div>
                ) : sections.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sections.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handlePickSection(s)}
                        className="text-left p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/15 hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-headline text-xl text-on-surface group-hover:text-primary transition-colors">{s.title}</h3>
                          <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-colors">arrow_forward</span>
                        </div>
                        {s.age_range && <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium mt-1">Ages {s.age_range}</span>}
                        {s.description && <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{s.description}</p>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">school</span>
                    <p className="text-on-surface-variant/60 text-lg">No study sections available yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Pick Module */}
            {studyStep === "pick-module" && (
              <div>
                <button onClick={() => goBackStudy("pick-section")} className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-4">
                  <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Sections
                </button>
                <h1 className="text-3xl sm:text-4xl font-headline text-on-surface mb-2">{selectedSection?.title}</h1>
                <p className="text-on-surface-variant mb-8">Choose a module to study.</p>
                {studyChaptersLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => <Shimmer key={i} className="h-20 rounded-xl" />)}
                  </div>
                ) : studyChapters.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {studyChapters.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handlePickModule(c)}
                        className="text-left p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/15 hover:border-primary/30 hover:shadow-md transition-all duration-200 group flex items-center gap-4"
                      >
                        <span className="material-symbols-outlined text-2xl text-on-surface-variant/40 group-hover:text-primary transition-colors">menu_book</span>
                        <div>
                          <h3 className="font-headline text-lg text-on-surface group-hover:text-primary transition-colors">{c.title}</h3>
                          {c.description && <p className="text-sm text-on-surface-variant mt-1 line-clamp-1">{c.description}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-on-surface-variant py-12">No modules in this section yet.</p>
                )}
              </div>
            )}

            {/* STEP 3: Reading */}
            {studyStep === "reading" && (
              <div className="flex flex-col xl:flex-row gap-8">
                {/* Page sidebar */}
                <aside className="w-full xl:w-72 space-y-4 xl:order-1">
                  <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block">Readings</label>
                  <div className="space-y-1">
                    {pages.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => handleSwitchPage(p.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3 ${
                          selectedPageId === p.id
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                          {idx + 1}
                        </span>
                        {p.title}
                      </button>
                    ))}
                  </div>
                </aside>

                {/* Content */}
                <div className="flex-1 xl:order-2">
                  {studyContentLoading ? (
                    <div className="space-y-4 py-8">
                      <Shimmer className="h-10 w-1/2 mb-8" />
                      <Shimmer className="h-4 w-full" />
                      <Shimmer className="h-4 w-full" />
                      <Shimmer className="h-4 w-5/6" />
                    </div>
                  ) : pageData ? (
                    <article className="py-4">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline text-on-surface mb-8">
                        {pageData.title}
                      </h1>
                      <div
                        className="study-content prose prose-lg max-w-none text-on-surface-variant leading-[1.9] font-body
                          [&>p]:mb-5 [&>p]:pl-4
                          [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-6 [&_blockquote]:py-3
                          [&_blockquote]:my-6 [&_blockquote]:bg-primary/5 [&_blockquote]:rounded-r-lg [&_blockquote]:italic
                          [&_h1]:text-3xl [&_h1]:font-headline [&_h1]:mt-8 [&_h1]:mb-4
                          [&_h2]:text-2xl [&_h2]:font-headline [&_h2]:mt-8 [&_h2]:mb-4
                          [&_h3]:text-xl [&_h3]:font-headline [&_h3]:mt-6 [&_h3]:mb-3
                          [&_ul]:pl-8 [&_ul]:space-y-2 [&_ol]:pl-8 [&_ol]:space-y-2
                          [&_strong]:text-on-surface [&_strong]:font-bold
                          [&_em]:italic"
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(marked.parse(pageData.content || "") as string) }}
                      />
                    </article>
                  ) : (
                    <div className="py-16 text-center">
                      <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">auto_stories</span>
                      <p className="text-on-surface-variant/60 text-lg">Select a reading to begin</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function BiblePage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <Shimmer className="h-12 w-full mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <Shimmer key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      </MainLayout>
    }>
      <BibleContent />
    </Suspense>
  );
}
