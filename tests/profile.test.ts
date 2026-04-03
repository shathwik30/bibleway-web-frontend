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

describe("Profile - Own Profile", () => {
  it("fetches own profile", async () => {
    const profile = { id: "u1", full_name: "Alice", email: "alice@test.com", follower_count: 100, following_count: 50 };
    vi.stubGlobal("fetch", mockFetch(200, { data: profile }));

    const res = await fetchAPI("/accounts/profile/");
    expect(res.data.full_name).toBe("Alice");
    expect(res.data.follower_count).toBe(100);
  });

  it("updates profile", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { full_name: "Alice Updated", bio: "New bio" } }));

    const res = await fetchAPI("/accounts/profile/", {
      method: "PATCH",
      body: JSON.stringify({ full_name: "Alice Updated", bio: "New bio" }),
    });
    expect(res.data.full_name).toBe("Alice Updated");
  });

  it("uploads profile photo via FormData", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { profile_photo: "https://cdn.example.com/photo.jpg" } }));

    const formData = new FormData();
    formData.append("profile_photo", new Blob(["img"]), "photo.jpg");
    const res = await fetchAPI("/accounts/profile/", { method: "PATCH", body: formData });
    expect(res.data.profile_photo).toContain("photo.jpg");
  });
});

describe("Profile - Public User Profiles", () => {
  it("fetches another user's profile", async () => {
    const user = { id: "u2", full_name: "Bob", follower_count: 200, is_following: false };
    vi.stubGlobal("fetch", mockFetch(200, { data: user }));

    const res = await fetchAPI("/accounts/users/u2/");
    expect(res.data.full_name).toBe("Bob");
    expect(res.data.is_following).toBe(false);
  });

  it("searches users", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ id: "u3", full_name: "Charlie" }] } }));

    const res = await fetchAPI("/accounts/users/search/?q=char");
    expect(res.data.results[0].full_name).toBe("Charlie");
  });
});

describe("Profile - Follow System", () => {
  it("follows a user", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { message: "Followed." }));

    const res = await fetchAPI("/accounts/users/u2/follow/", { method: "POST" });
    expect(res.message).toContain("Followed");
  });

  it("unfollows a user", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { message: "Unfollowed." }));

    const res = await fetchAPI("/accounts/users/u2/follow/", { method: "DELETE" });
    expect(res.message).toContain("Unfollowed");
  });

  it("fetches followers list", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ id: "u3", full_name: "Charlie" }] } }));

    const res = await fetchAPI("/accounts/users/u1/followers/");
    expect(res.data.results).toHaveLength(1);
  });

  it("fetches following list", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ id: "u2", full_name: "Bob" }] } }));

    const res = await fetchAPI("/accounts/users/u1/following/");
    expect(res.data.results).toHaveLength(1);
  });
});

describe("Profile - Block System", () => {
  it("blocks a user", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { message: "Blocked." }));

    const res = await fetchAPI("/accounts/users/u2/block/", { method: "POST" });
    expect(res.message).toContain("Blocked");
  });

  it("unblocks a user", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { message: "Unblocked." }));

    const res = await fetchAPI("/accounts/users/u2/block/", { method: "DELETE" });
    expect(res.message).toContain("Unblocked");
  });

  it("fetches blocked users", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ id: "u4", full_name: "Blocked User" }] } }));

    const res = await fetchAPI("/accounts/blocked-users/");
    expect(res.data.results[0].full_name).toBe("Blocked User");
  });
});
