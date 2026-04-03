import { describe, it, expect, vi, beforeEach } from "vitest";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _setStore(s: Record<string, string>) { store = { ...s }; },
  };
})();

vi.stubGlobal("localStorage", localStorageMock);
vi.stubGlobal("location", { href: "" });

function mockFetch(status: number, body: any, ok?: boolean) {
  return vi.fn().mockResolvedValue({
    status,
    ok: ok !== undefined ? ok : status >= 200 && status < 300,
    statusText: status === 200 ? "OK" : "Error",
    json: vi.fn().mockResolvedValue(body),
  });
}

let fetchAPI: (endpoint: string, options?: RequestInit) => Promise<any>;

beforeEach(async () => {
  localStorageMock.clear();
  localStorageMock._setStore({ access_token: "valid-token" });
  vi.restoreAllMocks();
  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("location", { href: "" });
  const mod = await import("../app/lib/api");
  fetchAPI = mod.fetchAPI;
});

describe("Bible - API Bible Proxy", () => {
  it("fetches Bible versions", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: [{ id: "kjv", name: "King James Version" }] }));

    const res = await fetchAPI("/bible/api-bible/bibles?language=eng");
    expect(res.data[0].name).toBe("King James Version");
  });

  it("fetches books for a Bible version", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: [{ id: "GEN", name: "Genesis" }, { id: "EXO", name: "Exodus" }] }));

    const res = await fetchAPI("/bible/api-bible/bibles/kjv/books");
    expect(res.data).toHaveLength(2);
    expect(res.data[0].name).toBe("Genesis");
  });

  it("fetches chapters for a book", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: [{ id: "GEN.1", number: "1" }, { id: "GEN.intro", number: "intro" }] }));

    const res = await fetchAPI("/bible/api-bible/bibles/kjv/books/GEN/chapters");
    expect(res.data).toHaveLength(2);
  });

  it("fetches chapter content as HTML", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { id: "GEN.1", content: "<p>In the beginning...</p>" } }));

    const res = await fetchAPI("/bible/api-bible/bibles/kjv/chapters/GEN.1?content-type=html");
    expect(res.data.content).toContain("In the beginning");
  });
});

describe("Bible - Segregated Study Content", () => {
  it("fetches study sections", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: [{ id: "s1", title: "Children", age_min: 5, age_max: 12 }] }));

    const res = await fetchAPI("/bible/sections/");
    expect(res.data[0].title).toBe("Children");
  });

  it("fetches chapters in a section", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: [{ id: "ch1", title: "Creation" }] }));

    const res = await fetchAPI("/bible/sections/s1/chapters/");
    expect(res.data[0].title).toBe("Creation");
  });

  it("fetches pages in a chapter", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: [{ id: "pg1", title: "Day 1" }] }));

    const res = await fetchAPI("/bible/chapters/ch1/pages/");
    expect(res.data[0].title).toBe("Day 1");
  });

  it("fetches page detail with content", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { id: "pg1", title: "Day 1", content: "# In the beginning", youtube_url: "https://youtube.com/watch?v=123" } }));

    const res = await fetchAPI("/bible/pages/pg1/");
    expect(res.data.content).toContain("In the beginning");
    expect(res.data.youtube_url).toBeTruthy();
  });
});

describe("Bible - Bookmarks", () => {
  it("fetches bookmarks", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ id: "b1", verse_reference: "John 3:16" }] } }));

    const res = await fetchAPI("/bible/bookmarks/?type=api_bible");
    expect(res.data.results[0].verse_reference).toBe("John 3:16");
  });

  it("creates a bookmark", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { data: { id: "b2" } }));

    await fetchAPI("/bible/bookmarks/", {
      method: "POST",
      body: JSON.stringify({ bookmark_type: "api_bible", verse_reference: "Psalm 23:1" }),
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.verse_reference).toBe("Psalm 23:1");
  });

  it("deletes a bookmark", async () => {
    vi.stubGlobal("fetch", mockFetch(204, {}));
    await fetchAPI("/bible/bookmarks/b1/", { method: "DELETE" });
    expect(vi.mocked(fetch).mock.calls[0][1]!.method).toBe("DELETE");
  });
});

describe("Bible - Highlights", () => {
  it("fetches highlights", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ id: "h1", color: "yellow", verse_reference: "Rom 8:28" }] } }));

    const res = await fetchAPI("/bible/highlights/?type=api_bible");
    expect(res.data.results[0].color).toBe("yellow");
  });

  it("creates a highlight with color", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { data: { id: "h2" } }));

    await fetchAPI("/bible/highlights/", {
      method: "POST",
      body: JSON.stringify({ highlight_type: "api_bible", verse_reference: "Isa 41:10", color: "green", selected_text: "Do not fear" }),
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.color).toBe("green");
  });

  it("deletes a highlight", async () => {
    vi.stubGlobal("fetch", mockFetch(204, {}));
    await fetchAPI("/bible/highlights/h1/", { method: "DELETE" });
  });
});

describe("Bible - Notes", () => {
  it("fetches notes", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ id: "n1", text: "My study note" }] } }));

    const res = await fetchAPI("/bible/notes/?type=api_bible");
    expect(res.data.results[0].text).toBe("My study note");
  });

  it("creates a note", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { data: { id: "n2" } }));

    await fetchAPI("/bible/notes/", {
      method: "POST",
      body: JSON.stringify({ note_type: "api_bible", verse_reference: "Matt 5:1", text: "Sermon on the mount" }),
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.text).toBe("Sermon on the mount");
  });

  it("updates a note", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { id: "n1", text: "Updated note" } }));

    await fetchAPI("/bible/notes/n1/", {
      method: "PATCH",
      body: JSON.stringify({ text: "Updated note" }),
    });
    expect(vi.mocked(fetch).mock.calls[0][1]!.method).toBe("PATCH");
  });

  it("deletes a note", async () => {
    vi.stubGlobal("fetch", mockFetch(204, {}));
    await fetchAPI("/bible/notes/n1/", { method: "DELETE" });
  });
});

describe("Bible - Search", () => {
  it("searches Bible content", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ title: "John 3:16", snippet: "For God so loved..." }] } }));

    const res = await fetchAPI("/bible/search/?q=love");
    expect(res.data.results[0].snippet).toContain("God so loved");
  });
});

describe("Verse of the Day", () => {
  it("fetches today's verse", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { verse_text: "The Lord is my shepherd", bible_reference: "Psalm 23:1" } }));

    const res = await fetchAPI("/verse-of-day/today/");
    expect(res.data.verse_text).toContain("shepherd");
  });

  it("fetches verse for a specific date", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { verse_text: "Be still and know", bible_reference: "Psalm 46:10", display_date: "2026-04-01" } }));

    const res = await fetchAPI("/verse-of-day/2026-04-01/");
    expect(res.data.display_date).toBe("2026-04-01");
  });

  it("handles missing verse gracefully", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: null }));

    const res = await fetchAPI("/verse-of-day/2020-01-01/");
    expect(res.data).toBeNull();
  });
});
