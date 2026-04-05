const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-bibleway.up.railway.app/api/v1";

const FETCH_TIMEOUT_MS = 15000;

// Prevent multiple simultaneous token refresh requests
let refreshPromise: Promise<string | null> | null = null;

function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

async function doTokenRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;

  try {
    const refreshRes = await fetchWithTimeout(`${API_BASE_URL}/accounts/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshRes.ok) {
      const responseData = await refreshRes.json();
      const tokens = responseData.data || responseData;
      const newAccessToken = tokens.access || tokens.access_token;
      if (newAccessToken) {
        localStorage.setItem("access_token", newAccessToken);
        return newAccessToken;
      }
    }

    // Refresh token is invalid/expired — force re-login
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    return null;
  } catch (err) {
    console.error("Token refresh failed:", err);
    // Network error during refresh — clear tokens and redirect
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    return null;
  }
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = typeof window !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  Object.assign(headers, (options.headers as Record<string, string>) || {});

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token && token !== "undefined" && token !== "null") {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let response = await fetchWithTimeout(url, {
    ...options,
    headers,
  });

  // Handle Token Refresh on 401 Unauthorized
  if (response.status === 401 && typeof window !== "undefined") {
    // Use a single shared promise so concurrent 401s don't all refresh independently
    if (!refreshPromise) {
      refreshPromise = doTokenRefresh().finally(() => { refreshPromise = null; });
    }
    const newToken = await refreshPromise;

    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetchWithTimeout(url, {
        ...options,
        headers,
      });
    } else {
      // Refresh failed — doTokenRefresh already handles redirect, just return
      // a 401 response-like error without throwing to avoid noisy console errors
      return { data: null, status: 401 } as any;
    }
  }

  if (!response.ok) {
    let errorMsg = `API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMsg = errorData.message;
      }
      if (errorData.data && typeof errorData.data === "object") {
        const details = Object.entries(errorData.data)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" | ");
        errorMsg += ` (${details})`;
      } else if (errorData.detail) {
          errorMsg = errorData.detail;
      }
    } catch (e) {
      // Ignore JSON parsing errors
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
