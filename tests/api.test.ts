import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

// We need to set up the mocks before importing fetchAPI
vi.stubGlobal("localStorage", localStorageMock);

// Mock window.location
const locationMock = { href: "" };
vi.stubGlobal("location", locationMock);

// We'll dynamically import fetchAPI after mocks are set up
let fetchAPI: (endpoint: string, options?: RequestInit) => Promise<any>;

beforeEach(async () => {
  localStorageMock.clear();
  localStorageMock._setStore({});
  locationMock.href = "";
  vi.restoreAllMocks();
  // Re-stub after restoreAllMocks
  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("location", locationMock);

  // Re-import to get fresh module
  const mod = await import("../app/lib/api");
  fetchAPI = mod.fetchAPI;
});

function mockFetchResponse(status: number, body: any, ok?: boolean) {
  return vi.fn().mockResolvedValue({
    status,
    ok: ok !== undefined ? ok : status >= 200 && status < 300,
    statusText: status === 200 ? "OK" : "Error",
    json: vi.fn().mockResolvedValue(body),
  });
}

describe("fetchAPI", () => {
  it("adds Authorization header when access_token exists", async () => {
    localStorageMock._setStore({ access_token: "my-token" });
    const mockFetch = mockFetchResponse(200, { data: "ok" });
    vi.stubGlobal("fetch", mockFetch);

    await fetchAPI("/test");

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders["Authorization"]).toBe("Bearer my-token");
  });

  it("does NOT add Authorization when no token exists", async () => {
    localStorageMock._setStore({});
    const mockFetch = mockFetchResponse(200, { data: "ok" });
    vi.stubGlobal("fetch", mockFetch);

    await fetchAPI("/test");

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders["Authorization"]).toBeUndefined();
  });

  it("does NOT add Authorization when token is 'undefined' string", async () => {
    localStorageMock._setStore({ access_token: "undefined" });
    const mockFetch = mockFetchResponse(200, { data: "ok" });
    vi.stubGlobal("fetch", mockFetch);

    await fetchAPI("/test");

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders["Authorization"]).toBeUndefined();
  });

  it("sets Content-Type to application/json by default", async () => {
    const mockFetch = mockFetchResponse(200, { data: "ok" });
    vi.stubGlobal("fetch", mockFetch);

    await fetchAPI("/test");

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders["Content-Type"]).toBe("application/json");
  });

  it("does NOT set Content-Type for FormData bodies", async () => {
    const formData = new FormData();
    formData.append("file", "content");

    const mockFetch = mockFetchResponse(200, { data: "ok" });
    vi.stubGlobal("fetch", mockFetch);

    await fetchAPI("/upload", { method: "POST", body: formData });

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders["Content-Type"]).toBeUndefined();
  });

  it("throws on non-ok responses with error message", async () => {
    const mockFetch = mockFetchResponse(400, { message: "Bad request" }, false);
    vi.stubGlobal("fetch", mockFetch);

    await expect(fetchAPI("/test")).rejects.toThrow("Bad request");
  });

  it("throws with detail field when message is absent", async () => {
    const mockFetch = mockFetchResponse(404, { detail: "Not found" }, false);
    vi.stubGlobal("fetch", mockFetch);

    await expect(fetchAPI("/test")).rejects.toThrow("Not found");
  });

  it("401 response triggers token refresh and retries the request", async () => {
    localStorageMock._setStore({
      access_token: "expired-token",
      refresh_token: "my-refresh-token",
    });

    const mockFetch = vi.fn()
      // First call: 401
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        statusText: "Unauthorized",
        json: vi.fn().mockResolvedValue({}),
      })
      // Refresh call: success
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { access: "new-token" } }),
      })
      // Retry call: success
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: vi.fn().mockResolvedValue({ result: "success" }),
      });

    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchAPI("/test");

    expect(result).toEqual({ result: "success" });
    expect(mockFetch).toHaveBeenCalledTimes(3);

    // Verify the refresh was called with the refresh token
    const refreshCall = mockFetch.mock.calls[1];
    expect(refreshCall[0]).toContain("/accounts/token/refresh/");
    const refreshBody = JSON.parse(refreshCall[1].body);
    expect(refreshBody.refresh).toBe("my-refresh-token");

    // Verify the retry used the new token
    const retryHeaders = mockFetch.mock.calls[2][1].headers;
    expect(retryHeaders["Authorization"]).toBe("Bearer new-token");
  });

  it("401 with failed refresh redirects to login", async () => {
    localStorageMock._setStore({
      access_token: "expired-token",
      refresh_token: "bad-refresh",
    });

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        statusText: "Unauthorized",
        json: vi.fn().mockResolvedValue({}),
      })
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      });

    vi.stubGlobal("fetch", mockFetch);

    // The original 401 response is still not ok, so it should throw
    await expect(fetchAPI("/test")).rejects.toThrow();
    expect(locationMock.href).toBe("/login");
  });
});
