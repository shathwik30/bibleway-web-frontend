const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle Token Refresh on 401 Unauthorized
  if (response.status === 401 && typeof window !== "undefined") {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/accounts/token/refresh/`, {
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
            headers["Authorization"] = `Bearer ${newAccessToken}`;
            response = await fetch(url, {
              ...options,
              headers,
            });
          } else {
            throw new Error("No access token returned from refresh");
          }
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      } catch (e) {
        console.error("Token refresh failed:", e);
      }
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
