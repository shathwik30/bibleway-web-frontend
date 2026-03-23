"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { marked } from "marked";
import MainLayout from "../components/MainLayout";
import { fetchAPI } from "../lib/api";
import Shimmer from "../components/Shimmer";
import BibleStudyTools from "../components/BibleStudyTools";

// Configure marked for safe rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

function BibleContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "study" ? "study" : "standard";
  const [activeTab, setActiveTab] = useState<"standard" | "study">(initialTab);
  
  // Sync tab with URL param if it changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "study" || tab === "standard") {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Standard Reader State
  const [bibles, setBibles] = useState<any[]>([]);
  const [selectedBibleId, setSelectedBibleId] = useState<string>("de4e12af7f28f599-01"); // default KJV
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("JHN");
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("JHN.1");
  const [chapterData, setChapterData] = useState<any>(null);
  const [loadingContent, setLoadingContent] = useState<boolean>(false);

  // Study Experience State
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [studyChapters, setStudyChapters] = useState<any[]>([]);
  const [selectedStudyChapterId, setSelectedStudyChapterId] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [loadingStudy, setLoadingStudy] = useState(false);

  // 1. Fetch available Bibles (Standard)
  useEffect(() => {
    async function loadBibles() {
      if (activeTab !== "standard" || bibles.length > 0) return;
      try {
        const res = await fetchAPI("/bible/api-bible/bibles?language=eng");
        if (res?.data) setBibles(res.data);
      } catch (err) { console.error(err); }
    }
    loadBibles();
  }, [activeTab]);

  // 2. Fetch Books (Standard)
  useEffect(() => {
    if (!selectedBibleId || activeTab !== "standard") return;
    async function loadBooks() {
      try {
        const res = await fetchAPI(`/bible/api-bible/bibles/${selectedBibleId}/books`);
        if (res?.data) {
          setBooks(res.data);
          if (!res.data.find((b: any) => b.id === selectedBookId)) {
            setSelectedBookId(res.data[0].id);
          }
        }
      } catch (e) { console.error(e); }
    }
    loadBooks();
  }, [selectedBibleId, activeTab]);

  // 3. Fetch Chapters (Standard)
  useEffect(() => {
    if (!selectedBibleId || !selectedBookId || activeTab !== "standard") return;
    async function loadChapters() {
      try {
        const res = await fetchAPI(`/bible/api-bible/bibles/${selectedBibleId}/books/${selectedBookId}/chapters`);
        if (res?.data) {
          setChapters(res.data);
          if (!selectedChapterId.startsWith(selectedBookId)) {
            setSelectedChapterId(res.data.length > 1 ? res.data[1].id : res.data[0].id);
          }
        }
      } catch (e) { console.error(e); }
    }
    loadChapters();
  }, [selectedBibleId, selectedBookId, activeTab]);

  // 4. Fetch Chapter content (Standard)
  useEffect(() => {
    if (!selectedBibleId || !selectedChapterId || activeTab !== "standard") return;
    async function loadContent() {
      setLoadingContent(true);
      try {
        const res = await fetchAPI(`/bible/api-bible/bibles/${selectedBibleId}/chapters/${selectedChapterId}?content-type=html`);
        if (res?.data) setChapterData(res.data);
      } catch (e) { console.error(e); }
      setLoadingContent(false);
    }
    loadContent();
  }, [selectedBibleId, selectedChapterId, activeTab]);

  // STUDY EXPERIENCE FETCHING
  // 5. Fetch Sections
  useEffect(() => {
    async function loadSections() {
      if (activeTab !== "study" || sections.length > 0) return;
      setLoadingStudy(true);
      try {
        const res = await fetchAPI("/bible/sections/");
        const data = res?.data || [];
        setSections(data);
        if (data.length > 0) setSelectedSectionId(data[0].id);
      } catch (e) { console.error(e); }
      setLoadingStudy(false);
    }
    loadSections();
  }, [activeTab]);

  // 6. Fetch Study Chapters
  useEffect(() => {
    if (!selectedSectionId || activeTab !== "study") return;
    async function loadStudyChapters() {
      try {
        const res = await fetchAPI(`/bible/sections/${selectedSectionId}/chapters/`);
        const data = res?.data || [];
        setStudyChapters(data);
        if (data.length > 0) {
            setSelectedStudyChapterId(data[0].id);
        } else {
            setSelectedStudyChapterId(null);
            setPages([]);
        }
      } catch (e) { console.error(e); }
    }
    loadStudyChapters();
  }, [selectedSectionId, activeTab]);

  // 7. Fetch Pages
  useEffect(() => {
    if (!selectedStudyChapterId || activeTab !== "study") return;
    async function loadPages() {
      try {
        const res = await fetchAPI(`/bible/chapters/${selectedStudyChapterId}/pages/`);
        const data = res?.data || [];
        setPages(data);
        if (data.length > 0) setSelectedPageId(data[0].id);
        else setSelectedPageId(null);
      } catch (e) { console.error(e); }
    }
    loadPages();
  }, [selectedStudyChapterId, activeTab]);

  // 8. Fetch Page Detail
  useEffect(() => {
    if (!selectedPageId || activeTab !== "study") return;
    async function loadPageDetail() {
      setLoadingContent(true);
      try {
        const res = await fetchAPI(`/bible/pages/${selectedPageId}/`);
        setPageData(res?.data || null);
      } catch (e) { console.error(e); }
      setLoadingContent(false);
    }
    loadPageDetail();
  }, [selectedPageId, activeTab]);

  return (
    <MainLayout>
      <div className="flex flex-col items-center">
        {/* Tab Navigation */}
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 mb-8">
          <div className="flex gap-8 sm:gap-12 border-b border-outline-variant/20">
            <button 
              onClick={() => setActiveTab("standard")}
              className={`pb-4 text-lg sm:text-2xl font-headline transition-colors ${activeTab === "standard" ? "border-b-2 border-primary text-on-surface" : "text-on-surface/40 hover:text-on-surface"}`}
            >
              Standard Reader
            </button>
            <button 
              onClick={() => setActiveTab("study")}
              className={`pb-4 text-lg sm:text-2xl font-headline transition-colors ${activeTab === "study" ? "border-b-2 border-primary text-on-surface" : "text-on-surface/40 hover:text-on-surface"}`}
            >
              Study Experience
            </button>
          </div>
        </div>

        {activeTab === "standard" && (
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-32 flex flex-col xl:flex-row gap-8">
            {/* Sidebar (controls) — on mobile, show above content */}
            <aside className="w-full xl:w-72 space-y-6 xl:order-2 print:hidden">
              <div>
                <label className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">Translation</label>
                <select 
                  className="w-full mt-3 p-3 rounded-xl bg-surface-container-lowest border border-primary/20 appearance-none"
                  value={selectedBibleId}
                  onChange={(e) => setSelectedBibleId(e.target.value)}
                >
                  {bibles.map(b => (
                    <option key={b.id} value={b.id}>{b.nameLocal} ({b.abbreviation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">Book</label>
                <select 
                  className="w-full mt-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 appearance-none"
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Bible Study Tools */}
              <BibleStudyTools
                selectedBibleId={selectedBibleId}
                selectedChapterId={selectedChapterId}
                onNavigateToChapter={(chId) => setSelectedChapterId(chId)}
              />

              <div>
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-4">Chapters</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 xl:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {chapters.filter(ch => ch.number !== 'intro').map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChapterId(ch.id)}
                      className={`aspect-square flex items-center justify-center rounded-lg font-headline text-sm ${
                        selectedChapterId === ch.id ? "bg-primary text-on-primary" : "bg-surface-container-lowest hover:bg-stone-200"
                      }`}
                    >
                      {ch.number}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Reading Content */}
            <div className="flex-1 xl:order-1">
              <header className="mb-10">
                <span className="text-xs font-label uppercase tracking-[0.3em] text-on-tertiary-fixed-variant bg-tertiary-fixed/30 px-3 py-1 rounded-full mb-6 inline-block">
                  {books.find(b => b.id === selectedBookId)?.name || 'Books'}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline text-on-surface mb-4">
                  {chapterData?.reference || 'Loading...'}
                </h1>
              </header>

              {loadingContent ? (
                <div className="space-y-4">
                  <Shimmer className="h-6 w-3/4" />
                  <Shimmer className="h-4 w-full" />
                  <Shimmer className="h-4 w-full" />
                  <Shimmer className="h-4 w-5/6" />
                </div>
              ) : (
                <article 
                  className="bible-content space-y-4 text-on-surface font-body leading-[1.9] max-w-none
                    [&>p]:mb-5 [&>p]:text-base [&>p]:sm:text-lg [&>p]:pl-4 [&>p]:border-l-2 [&>p]:border-transparent
                    [&_.v]:text-primary/60 [&_.v]:text-xs [&_.v]:font-bold [&_.v]:align-super [&_.v]:mr-1
                    [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-6 [&_blockquote]:py-3
                    [&_blockquote]:my-6 [&_blockquote]:bg-primary/5 [&_blockquote]:rounded-r-lg [&_blockquote]:italic
                    [&_h3]:text-2xl [&_h3]:font-headline [&_h3]:mt-8 [&_h3]:mb-4
                    [&_h4]:text-xl [&_h4]:font-headline [&_h4]:mt-6 [&_h4]:mb-3"
                  dangerouslySetInnerHTML={{ __html: chapterData?.content || "<p>Select a chapter to begin reading</p>" }}
                />
              )}
            </div>
          </div>
        )}

        {/* STUDY EXPERIENCE */}
        {activeTab === "study" && (
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-32">
            {/* Breadcrumb navigation */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant mb-6">
              <span className="font-semibold text-primary">
                {sections.find(s => s.id === selectedSectionId)?.title || "Section"}
              </span>
              {selectedStudyChapterId && (
                <>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <span className="font-medium">
                    {studyChapters.find(c => c.id === selectedStudyChapterId)?.title || "Chapter"}
                  </span>
                </>
              )}
              {selectedPageId && pageData?.title && (
                <>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <span>{pageData.title}</span>
                </>
              )}
            </div>

            {/* Section tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSectionId(s.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedSectionId === s.id 
                      ? "bg-primary text-on-primary shadow-md" 
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {s.title}
                  {s.age_range ? <span className="ml-1 opacity-60 text-xs">({s.age_range})</span> : ""}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col xl:flex-row gap-8">
              {/* Chapter + Page sidebar */}
              <aside className="w-full xl:w-80 space-y-6 xl:order-1">
                {/* Chapters as clickable cards */}
                <div>
                  <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-3">Modules</label>
                  <div className="space-y-2">
                    {studyChapters.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedStudyChapterId(c.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${
                          selectedStudyChapterId === c.id 
                            ? "bg-primary/10 text-primary border-l-4 border-primary font-semibold" 
                            : "bg-surface-container-lowest hover:bg-surface-container-low"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {selectedStudyChapterId === c.id ? "menu_book" : "book"}
                        </span>
                        <span className="text-sm">{c.title}</span>
                      </button>
                    ))}
                    {studyChapters.length === 0 && (
                      <p className="text-sm text-on-surface-variant/50 py-4 text-center">No modules yet</p>
                    )}
                  </div>
                </div>

                {/* Page list */}
                {pages.length > 0 && (
                  <div>
                    <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-3">Readings</label>
                    <div className="space-y-1">
                      {pages.map((p, idx) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPageId(p.id)}
                          className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3 ${
                            selectedPageId === p.id 
                              ? "bg-surface-container-high text-on-surface font-semibold" 
                              : "text-on-surface-variant hover:bg-surface-container-low"
                          }`}
                        >
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          {p.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </aside>

              {/* Reading content */}
              <div className="flex-1 xl:order-2">
                {loadingContent ? (
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
                      className="study-content prose prose-stone prose-lg max-w-none text-on-surface-variant leading-[1.9] font-body
                        [&>p]:mb-5 [&>p]:pl-4
                        [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-6 [&_blockquote]:py-3
                        [&_blockquote]:my-6 [&_blockquote]:bg-primary/5 [&_blockquote]:rounded-r-lg [&_blockquote]:italic
                        [&_h1]:text-3xl [&_h1]:font-headline [&_h1]:mt-8 [&_h1]:mb-4
                        [&_h2]:text-2xl [&_h2]:font-headline [&_h2]:mt-8 [&_h2]:mb-4
                        [&_h3]:text-xl [&_h3]:font-headline [&_h3]:mt-6 [&_h3]:mb-3
                        [&_ul]:pl-8 [&_ul]:space-y-2 [&_ol]:pl-8 [&_ol]:space-y-2
                        [&_strong]:text-on-surface [&_strong]:font-bold
                        [&_em]:italic"
                      dangerouslySetInnerHTML={{ __html: marked.parse(pageData.content || "") as string }}
                    />
                  </article>
                ) : (
                  <div className="py-16 text-center">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">auto_stories</span>
                    <p className="text-on-surface-variant/60 text-lg">Select a module and reading to begin</p>
                  </div>
                )}
              </div>
            </div>
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
          <div className="flex gap-8">
            <Shimmer className="w-1/4 h-64" />
            <Shimmer className="flex-1 h-96" />
          </div>
        </div>
      </MainLayout>
    }>
      <BibleContent />
    </Suspense>
  );
}
