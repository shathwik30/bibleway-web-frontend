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

describe("Authentication - Registration", () => {
  it("registers a new user", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { message: "Registration successful. Please verify your email." }));

    const res = await fetchAPI("/accounts/register/", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "Pass123!", full_name: "Test User" }),
    });
    expect(res.message).toContain("Registration successful");
  });

  it("rejects duplicate email", async () => {
    vi.stubGlobal("fetch", mockFetch(400, { message: "Email already exists", data: { email: "already registered" } }, false));
    await expect(fetchAPI("/accounts/register/", {
      method: "POST",
      body: JSON.stringify({ email: "existing@example.com", password: "Pass123!" }),
    })).rejects.toThrow();
  });
});

describe("Authentication - Login", () => {
  it("logs in with valid credentials", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { access: "access-token", refresh: "refresh-token", user: { id: "u1", full_name: "Alice" } } }));

    const res = await fetchAPI("/accounts/login/", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "Pass123!" }),
    });
    expect(res.data.access).toBe("access-token");
    expect(res.data.refresh).toBe("refresh-token");
    expect(res.data.user.full_name).toBe("Alice");
  });

  it("rejects invalid credentials", async () => {
    vi.stubGlobal("fetch", mockFetch(401, { message: "Invalid credentials" }, false));
    await expect(fetchAPI("/accounts/login/", {
      method: "POST",
      body: JSON.stringify({ email: "wrong@example.com", password: "wrong" }),
    })).rejects.toThrow("Invalid credentials");
  });
});

describe("Authentication - Token Refresh", () => {
  it("refreshes expired access token automatically", async () => {
    localStorageMock._setStore({ access_token: "expired", refresh_token: "valid-refresh" });

    const f = vi.fn()
      .mockResolvedValueOnce({ status: 401, ok: false, statusText: "Unauthorized", json: vi.fn().mockResolvedValue({}) })
      .mockResolvedValueOnce({ status: 200, ok: true, json: vi.fn().mockResolvedValue({ data: { access: "new-access" } }) })
      .mockResolvedValueOnce({ status: 200, ok: true, json: vi.fn().mockResolvedValue({ data: "success" }) });
    vi.stubGlobal("fetch", f);

    const res = await fetchAPI("/test");
    expect(res.data).toBe("success");
    expect(f).toHaveBeenCalledTimes(3);
  });

  it("redirects to login on failed refresh", async () => {
    localStorageMock._setStore({ access_token: "expired", refresh_token: "bad-refresh" });

    const locationMock = { href: "" };
    vi.stubGlobal("location", locationMock);

    const f = vi.fn()
      .mockResolvedValueOnce({ status: 401, ok: false, statusText: "Unauthorized", json: vi.fn().mockResolvedValue({}) })
      .mockResolvedValueOnce({ status: 401, ok: false, json: vi.fn().mockResolvedValue({}) });
    vi.stubGlobal("fetch", f);

    await expect(fetchAPI("/test")).rejects.toThrow();
    expect(locationMock.href).toBe("/login");
  });
});

describe("Authentication - Email Verification", () => {
  it("verifies email with OTP", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { message: "Email verified successfully." }));

    const res = await fetchAPI("/accounts/verify-email/", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", otp: "123456" }),
    });
    expect(res.message).toContain("verified");
  });

  it("rejects invalid OTP", async () => {
    vi.stubGlobal("fetch", mockFetch(400, { message: "Invalid OTP" }, false));
    await expect(fetchAPI("/accounts/verify-email/", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", otp: "000000" }),
    })).rejects.toThrow("Invalid OTP");
  });

  it("resends OTP", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { message: "OTP resent." }));

    const res = await fetchAPI("/accounts/auth/resend-otp/", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });
    expect(res.message).toContain("resent");
  });
});

describe("Authentication - Password Reset", () => {
  it("initiates password reset", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { message: "Password reset OTP sent." }));

    const res = await fetchAPI("/accounts/password-reset/", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });
    expect(res.message).toContain("OTP sent");
  });

  it("confirms password reset with OTP", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { message: "Password reset successful." }));

    const res = await fetchAPI("/accounts/password-reset/confirm/", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", otp: "123456", new_password: "NewPass123!" }),
    });
    expect(res.message).toContain("successful");
  });

  it("changes password for authenticated user", async () => {
    localStorageMock._setStore({ access_token: "valid-token" });
    vi.stubGlobal("fetch", mockFetch(200, { message: "Password changed." }));

    const res = await fetchAPI("/accounts/change-password/", {
      method: "POST",
      body: JSON.stringify({ old_password: "OldPass123!", new_password: "NewPass123!" }),
    });
    expect(res.message).toContain("changed");
  });
});

describe("Authentication - Google OAuth", () => {
  it("authenticates via Google", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { access: "google-token", refresh: "google-refresh", user: { id: "g1" } } }));

    const res = await fetchAPI("/accounts/google-auth/", {
      method: "POST",
      body: JSON.stringify({ id_token: "google-id-token" }),
    });
    expect(res.data.access).toBe("google-token");
  });
});

describe("Authentication - Logout", () => {
  it("blacklists refresh token on logout", async () => {
    localStorageMock._setStore({ access_token: "valid", refresh_token: "to-blacklist" });
    vi.stubGlobal("fetch", mockFetch(200, { message: "Logged out." }));

    const res = await fetchAPI("/accounts/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh: "to-blacklist" }),
    });
    expect(res.message).toContain("Logged out");
  });
});
