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
  localStorageMock._setStore({});
  vi.restoreAllMocks();
  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("location", { href: "" });
  const mod = await import("../app/lib/api");
  fetchAPI = mod.fetchAPI;
});

describe("Feed - Posts", () => {
  it("fetches posts list", async () => {
    const posts = [
      { id: "p1", author: { id: "u1", full_name: "Alice" }, text_content: "Hello", reaction_count: 5, comment_count: 2, created_at: "2026-01-01T00:00:00Z" },
      { id: "p2", author: { id: "u2", full_name: "Bob" }, text_content: "World", reaction_count: 3, comment_count: 0, created_at: "2026-01-02T00:00:00Z" },
    ];
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: posts, next: null } }));

    const res = await fetchAPI("/social/posts/");
    expect(res.data.results).toHaveLength(2);
    expect(res.data.results[0].text_content).toBe("Hello");
    expect(res.data.next).toBeNull();
  });

  it("fetches single post detail", async () => {
    const post = { id: "p1", author: { id: "u1", full_name: "Alice" }, text_content: "Detailed post", reaction_count: 10, comment_count: 5 };
    vi.stubGlobal("fetch", mockFetch(200, { data: post }));

    const res = await fetchAPI("/social/posts/p1/");
    expect(res.data.id).toBe("p1");
    expect(res.data.reaction_count).toBe(10);
  });

  it("creates a post with text only", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { data: { id: "new-post", text_content: "My post" } }));

    const res = await fetchAPI("/social/posts/", {
      method: "POST",
      body: JSON.stringify({ text_content: "My post" }),
    });
    expect(res.data.id).toBe("new-post");
  });

  it("creates a post with media", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { data: { id: "media-post" } }));

    const res = await fetchAPI("/social/posts/", {
      method: "POST",
      body: JSON.stringify({ text_content: "With images", media_ids: ["m1", "m2"] }),
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.media_ids).toEqual(["m1", "m2"]);
  });

  it("deletes a post", async () => {
    vi.stubGlobal("fetch", mockFetch(204, {}));
    await fetchAPI("/social/posts/p1/", { method: "DELETE" });
    expect(vi.mocked(fetch).mock.calls[0][1]!.method).toBe("DELETE");
  });

  it("handles cursor-based pagination", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ id: "p3" }], next: "http://api/social/posts/?cursor=abc123" } }));

    const res = await fetchAPI("/social/posts/");
    expect(res.data.next).toContain("cursor=abc123");
  });
});

describe("Feed - Prayers", () => {
  it("fetches prayers list", async () => {
    const prayers = [
      { id: "pr1", author: { id: "u1" }, title: "Health", description: "Pray for health", reaction_count: 3 },
    ];
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: prayers } }));

    const res = await fetchAPI("/social/prayers/");
    expect(res.data.results[0].title).toBe("Health");
  });

  it("creates a prayer request", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { data: { id: "new-prayer" } }));

    await fetchAPI("/social/prayers/", {
      method: "POST",
      body: JSON.stringify({ title: "Prayer Request", description: "Please pray" }),
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.title).toBe("Prayer Request");
  });

  it("deletes a prayer", async () => {
    vi.stubGlobal("fetch", mockFetch(204, {}));
    await fetchAPI("/social/prayers/pr1/", { method: "DELETE" });
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain("/social/prayers/pr1/");
  });
});

describe("Reactions", () => {
  it("adds a reaction to a post", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { message: "Reaction added.", data: { reaction_count: 6 } }));

    const res = await fetchAPI("/social/posts/p1/react/", {
      method: "POST",
      body: JSON.stringify({ emoji_type: "heart" }),
    });
    expect(res.message).toBe("Reaction added.");
    expect(res.data.reaction_count).toBe(6);
  });

  it("removes a reaction (toggle off)", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { message: "Reaction removed.", data: { reaction_count: 5 } }));

    const res = await fetchAPI("/social/posts/p1/react/", {
      method: "POST",
      body: JSON.stringify({ emoji_type: "heart" }),
    });
    expect(res.message).toBe("Reaction removed.");
    expect(res.data.reaction_count).toBe(5);
  });

  it("sends correct emoji_type values", async () => {
    const emojiTypes = ["praying_hands", "heart", "fire", "amen", "cross"];
    for (const emoji of emojiTypes) {
      vi.stubGlobal("fetch", mockFetch(200, { message: "Reaction added." }));
      await fetchAPI("/social/posts/p1/react/", {
        method: "POST",
        body: JSON.stringify({ emoji_type: emoji }),
      });
      const body = JSON.parse(vi.mocked(fetch).mock.calls.at(-1)![1]!.body as string);
      expect(body.emoji_type).toBe(emoji);
    }
  });

  it("reacts to a prayer", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { message: "Reaction added." }));

    await fetchAPI("/social/prayers/pr1/react/", {
      method: "POST",
      body: JSON.stringify({ emoji_type: "praying_hands" }),
    });
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain("/social/prayers/pr1/react/");
  });
});

describe("Comments", () => {
  it("fetches comments for a post", async () => {
    const comments = [
      { id: "c1", user: { id: "u1", full_name: "Alice" }, text: "Great post!" },
      { id: "c2", user: { id: "u2", full_name: "Bob" }, text: "Amen!" },
    ];
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: comments } }));

    const res = await fetchAPI("/social/posts/p1/comments/");
    expect(res.data.results).toHaveLength(2);
  });

  it("posts a comment", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { data: { id: "c3", text: "Nice" } }));

    const res = await fetchAPI("/social/posts/p1/comments/", {
      method: "POST",
      body: JSON.stringify({ text: "Nice" }),
    });
    expect(res.data.text).toBe("Nice");
  });

  it("deletes a comment", async () => {
    vi.stubGlobal("fetch", mockFetch(204, {}));
    await fetchAPI("/social/comments/c1/", { method: "DELETE" });
    expect(vi.mocked(fetch).mock.calls[0][1]!.method).toBe("DELETE");
  });

  it("comments on a prayer", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { data: { id: "c4" } }));
    await fetchAPI("/social/prayers/pr1/comments/", {
      method: "POST",
      body: JSON.stringify({ text: "Praying for you" }),
    });
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain("/social/prayers/pr1/comments/");
  });
});

describe("Comment Replies", () => {
  it("fetches replies for a comment", async () => {
    const replies = [
      { id: "r1", user: { full_name: "Alice" }, text: "Thanks!" },
      { id: "r2", user: { full_name: "Bob" }, text: "Me too!" },
    ];
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: replies } }));

    const res = await fetchAPI("/social/comments/c1/replies/");
    expect(res.data.results).toHaveLength(2);
    expect(res.data.results[0].text).toBe("Thanks!");
  });

  it("posts a reply", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { data: { id: "r3", text: "Reply here" } }));

    await fetchAPI("/social/comments/c1/replies/", {
      method: "POST",
      body: JSON.stringify({ text: "Reply here" }),
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.text).toBe("Reply here");
  });

  it("deletes a reply", async () => {
    vi.stubGlobal("fetch", mockFetch(204, {}));
    await fetchAPI("/social/comments/c1/replies/r1/", { method: "DELETE" });
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain("/replies/r1/");
  });
});

describe("Share Tracking", () => {
  it("records a post share", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { url: "https://app.com/post/p1" } }));

    const res = await fetchAPI("/social/posts/p1/share/");
    expect(res.data.url).toContain("/post/p1");
  });

  it("records a prayer share", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { url: "https://app.com/prayer/pr1" } }));

    const res = await fetchAPI("/social/prayers/pr1/share/");
    expect(res.data.url).toContain("/prayer/pr1");
  });
});

describe("Content Reporting", () => {
  it("reports a post as inappropriate", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { message: "Report submitted." }));

    await fetchAPI("/social/reports/", {
      method: "POST",
      body: JSON.stringify({
        content_type_model: "post",
        object_id: "p1",
        reason: "inappropriate",
        description: "",
      }),
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.reason).toBe("inappropriate");
  });

  it("reports with all valid reason types", async () => {
    const reasons = ["inappropriate", "spam", "false_teaching", "other"];
    for (const reason of reasons) {
      vi.stubGlobal("fetch", mockFetch(201, { message: "Report submitted." }));
      await fetchAPI("/social/reports/", {
        method: "POST",
        body: JSON.stringify({ content_type_model: "post", object_id: "p1", reason }),
      });
      const body = JSON.parse(vi.mocked(fetch).mock.calls.at(-1)![1]!.body as string);
      expect(body.reason).toBe(reason);
    }
  });
});
