const ACCESS_TOKEN_KEY = "marginalia_access_token";
const REFRESH_TOKEN_KEY = "marginalia_refresh_token";

/**
 * Stores access and refresh tokens in localStorage.
 * Safe for SSR environments.
 *
 * @param {string} access - JWT access token
 * @param {string} refresh - JWT refresh token
 */
export function setTokens(access, refresh) {
  if (typeof window === "undefined") return;
  if (access) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
  }
  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
}

/**
 * Retrieves the stored access token from localStorage.
 *
 * @returns {string | null}
 */
export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Retrieves the stored refresh token from localStorage.
 *
 * @returns {string | null}
 */
export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Clears both access and refresh tokens from localStorage.
 */
export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
