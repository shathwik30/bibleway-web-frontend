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

describe("Analytics - View Tracking", () => {
  it("records a post view", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { message: "View recorded." }));

    await fetchAPI("/analytics/views/", {
      method: "POST",
      body: JSON.stringify({ content_type: "post", object_id: "p1" }),
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.content_type).toBe("post");
  });

  it("records a share event", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { message: "Share recorded." }));

    await fetchAPI("/analytics/views/", {
      method: "POST",
      body: JSON.stringify({ content_type: "post", object_id: "p1", view_type: "share" }),
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.view_type).toBe("share");
  });
});

describe("Analytics - Post Analytics", () => {
  it("fetches analytics for a post", async () => {
    const analytics = { views: 150, shares: 10, reactions: 45, comments: 12 };
    vi.stubGlobal("fetch", mockFetch(200, { data: analytics }));

    const res = await fetchAPI("/analytics/posts/p1/");
    expect(res.data.views).toBe(150);
    expect(res.data.shares).toBe(10);
  });

  it("fetches user analytics dashboard", async () => {
    const userAnalytics = { total_views: 1000, total_reactions: 200, follower_growth: 50 };
    vi.stubGlobal("fetch", mockFetch(200, { data: userAnalytics }));

    const res = await fetchAPI("/analytics/me/");
    expect(res.data.total_views).toBe(1000);
  });
});

describe("Analytics - Boost System", () => {
  it("creates a boost", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { data: { id: "boost1", post: "p1", tier: "basic", is_active: true } }));

    const res = await fetchAPI("/analytics/boosts/", {
      method: "POST",
      body: JSON.stringify({ post_id: "p1", tier: "basic", duration_days: 1 }),
    });
    expect(res.data.is_active).toBe(true);
  });

  it("lists user boosts", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ id: "boost1", is_active: true }, { id: "boost2", is_active: false }] } }));

    const res = await fetchAPI("/analytics/boosts/list/");
    expect(res.data.results).toHaveLength(2);
  });

  it("fetches boost analytics snapshots", async () => {
    const snapshots = [
      { date: "2026-04-01", impressions: 500, reach: 300, engagement_rate: 0.12 },
      { date: "2026-04-02", impressions: 700, reach: 450, engagement_rate: 0.15 },
    ];
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: snapshots } }));

    const res = await fetchAPI("/analytics/boosts/boost1/analytics/");
    expect(res.data.results).toHaveLength(2);
    expect(res.data.results[1].impressions).toBe(700);
  });
});

describe("Media Upload", () => {
  it("uploads an image", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { id: "media-1", file: "https://cdn.example.com/img.jpg" } }));

    const formData = new FormData();
    formData.append("file", new Blob(["img-data"]), "test.jpg");
    const res = await fetchAPI("/social/media/upload/", { method: "POST", body: formData });
    expect(res.data.id).toBe("media-1");
  });

  it("uploads a video", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { id: "media-2", file: "https://cdn.example.com/vid.mp4" } }));

    const formData = new FormData();
    formData.append("file", new Blob(["vid-data"]), "test.mp4");
    const res = await fetchAPI("/social/media/upload/", { method: "POST", body: formData });
    expect(res.data.id).toBe("media-2");
  });

  it("rejects oversized file", async () => {
    vi.stubGlobal("fetch", mockFetch(400, { message: "File too large. Max size: 100MB" }, false));

    const formData = new FormData();
    formData.append("file", new Blob(["big"]), "huge.mp4");
    await expect(fetchAPI("/social/media/upload/", { method: "POST", body: formData })).rejects.toThrow("File too large");
  });
});
