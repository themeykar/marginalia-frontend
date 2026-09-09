import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./auth";

let refreshPromise = null;

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Reuses a single in-flight promise to avoid duplicate concurrent refresh requests.
 *
 * @returns {Promise<string | null>} The new access token or null if refresh failed.
 */
async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (res.status === 200) {
        const data = await res.json().catch(() => null);
        if (data?.access) {
          setTokens(data.access, refreshToken);
          return data.access;
        }
      }

      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Shared authenticated API client.
 *
 * - Automatically attaches "Authorization: Bearer <access_token>"
 * - On 401 response: attempts POST /api/auth/refresh/ using the refresh token
 * - If refresh succeeds, updates access token and retries original request once
 * - If refresh fails (401), clears tokens and redirects to /login
 *
 * @param {string} path - URL path (e.g. "/api/auth/me/") or absolute URL
 * @param {RequestInit} [options={}] - Standard fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const url = path.startsWith("http://") || path.startsWith("https://")
    ? path
    : `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  // Helper to build headers with an access token
  const buildHeaders = (token) => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  };

  const initialToken = getAccessToken();
  let res = await fetch(url, {
    ...options,
    headers: buildHeaders(initialToken),
  });

  // On 401 response, attempt refresh and retry once
  if (res.status === 401) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      // Retry the original request once with the new access token
      res = await fetch(url, {
        ...options,
        headers: buildHeaders(newAccessToken),
      });

      // If it still 401s after retry, the token is invalid
      if (res.status === 401) {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } else {
      // Refresh failed or no refresh token available
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  return res;
}
