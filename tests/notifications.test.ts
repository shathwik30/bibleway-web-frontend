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

describe("Notifications - List & Count", () => {
  it("fetches notifications list", async () => {
    const notifications = [
      { id: "n1", notification_type: "follow", title: "New follower", is_read: false },
      { id: "n2", notification_type: "reaction", title: "Someone reacted", is_read: true },
    ];
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: notifications } }));

    const res = await fetchAPI("/notifications/");
    expect(res.data.results).toHaveLength(2);
    expect(res.data.results[0].notification_type).toBe("follow");
  });

  it("fetches unread count", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { count: 5 } }));

    const res = await fetchAPI("/notifications/unread-count/");
    expect(res.data.count).toBe(5);
  });

  it("returns zero unread count", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { count: 0 } }));

    const res = await fetchAPI("/notifications/unread-count/");
    expect(res.data.count).toBe(0);
  });
});

describe("Notifications - Actions", () => {
  it("marks notifications as read", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { message: "Marked as read." }));

    const res = await fetchAPI("/notifications/read/", {
      method: "POST",
      body: JSON.stringify({ notification_ids: ["n1", "n2"] }),
    });
    expect(res.message).toContain("read");
  });

  it("deletes a notification", async () => {
    vi.stubGlobal("fetch", mockFetch(204, {}));

    await fetchAPI("/notifications/n1/", { method: "DELETE" });
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain("/notifications/n1/");
  });
});

describe("Notifications - All Types", () => {
  const notificationTypes = [
    "follow", "reaction", "comment", "reply", "share",
    "boost_live", "boost_digest", "prayer_comment", "system_broadcast",
  ];

  for (const type of notificationTypes) {
    it(`handles ${type} notification type`, async () => {
      vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ id: "n1", notification_type: type, title: `Test ${type}` }] } }));

      const res = await fetchAPI("/notifications/");
      expect(res.data.results[0].notification_type).toBe(type);
    });
  }
});
