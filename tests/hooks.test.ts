import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock localStorage
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

function mockFetchResponse(status: number, body: any, ok?: boolean) {
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
  localStorageMock._setStore({});
  vi.restoreAllMocks();
  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("location", { href: "" });
  const mod = await import("../app/lib/api");
  fetchAPI = mod.fetchAPI;
});

describe("API endpoints for new features", () => {
  it("calls share endpoint for posts", async () => {
    const mockFetch = mockFetchResponse(200, { data: { url: "https://example.com/post/123" } });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchAPI("/social/posts/123/share/");
    expect(result.data.url).toBe("https://example.com/post/123");
    expect(mockFetch.mock.calls[0][0]).toContain("/social/posts/123/share/");
  });

  it("calls share endpoint for prayers", async () => {
    const mockFetch = mockFetchResponse(200, { data: { url: "https://example.com/prayer/456" } });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchAPI("/social/prayers/456/share/");
    expect(result.data.url).toBe("https://example.com/prayer/456");
  });

  it("fetches comment replies", async () => {
    const mockReplies = [
      { id: "r1", user: { full_name: "User1" }, text: "Reply 1" },
      { id: "r2", user: { full_name: "User2" }, text: "Reply 2" },
    ];
    const mockFetch = mockFetchResponse(200, { data: { results: mockReplies } });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchAPI("/social/comments/c1/replies/");
    expect(result.data.results).toHaveLength(2);
    expect(result.data.results[0].text).toBe("Reply 1");
  });

  it("posts a reply to a comment", async () => {
    const mockFetch = mockFetchResponse(201, { data: { id: "r3", text: "New reply" } });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchAPI("/social/comments/c1/replies/", {
      method: "POST",
      body: JSON.stringify({ text: "New reply" }),
    });
    expect(result.data.text).toBe("New reply");
    const callOpts = mockFetch.mock.calls[0][1];
    expect(callOpts.method).toBe("POST");
    expect(JSON.parse(callOpts.body).text).toBe("New reply");
  });

  it("uploads media with FormData", async () => {
    const mockFetch = mockFetchResponse(200, { data: { id: "media-123" } });
    vi.stubGlobal("fetch", mockFetch);

    const formData = new FormData();
    formData.append("file", new Blob(["test"]), "test.jpg");

    const result = await fetchAPI("/social/media/upload/", {
      method: "POST",
      body: formData,
    });
    expect(result.data.id).toBe("media-123");
    // FormData should not have Content-Type set (browser sets it with boundary)
    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders["Content-Type"]).toBeUndefined();
  });

  it("fetches download URL for purchased product", async () => {
    const mockFetch = mockFetchResponse(200, { data: { url: "https://cdn.example.com/file.pdf" } });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchAPI("/shop/downloads/prod-123/");
    expect(result.data.url).toBe("https://cdn.example.com/file.pdf");
  });

  it("submits a content report", async () => {
    const mockFetch = mockFetchResponse(201, { message: "Report submitted." });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchAPI("/social/reports/", {
      method: "POST",
      body: JSON.stringify({
        content_type_model: "post",
        object_id: "post-123",
        reason: "inappropriate",
        description: "Offensive content",
      }),
    });
    expect(result.message).toBe("Report submitted.");
  });

  it("creates a post with multiple media_ids", async () => {
    const mockFetch = mockFetchResponse(201, { data: { id: "new-post" } });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchAPI("/social/posts/", {
      method: "POST",
      body: JSON.stringify({
        text_content: "Hello world",
        media_ids: ["m1", "m2", "m3"],
      }),
    });
    expect(result.data.id).toBe("new-post");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.media_ids).toEqual(["m1", "m2", "m3"]);
  });

  it("deletes a reply", async () => {
    const mockFetch = mockFetchResponse(204, {});
    vi.stubGlobal("fetch", mockFetch);

    await fetchAPI("/social/comments/c1/replies/r1/", { method: "DELETE" });
    expect(mockFetch.mock.calls[0][0]).toContain("/social/comments/c1/replies/r1/");
    expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
  });
});
