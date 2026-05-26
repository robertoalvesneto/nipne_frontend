const ACCESS_TOKEN_KEY = "nipne_access_token";
const REFRESH_TOKEN_KEY = "nipne_refresh_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function isBrowser() {
  return typeof document !== "undefined";
}

function getCookie(name: string) {
  if (!isBrowser()) {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=").slice(1).join("="));
}

function setCookie(name: string, value: string, maxAge = COOKIE_MAX_AGE) {
  if (!isBrowser()) {
    return;
  }

  const secure = window.location.protocol === "https:";
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Strict",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function deleteCookie(name: string) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict`;
}

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export function setAuthTokens(tokens: AuthTokens) {
  setCookie(ACCESS_TOKEN_KEY, tokens.accessToken);
  setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function getAuthTokens(): AuthTokens | null {
  const accessToken = getCookie(ACCESS_TOKEN_KEY);
  const refreshToken = getCookie(REFRESH_TOKEN_KEY);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export function clearAuthTokens() {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  return getAuthTokens()?.accessToken ?? null;
}

export function isAccessTokenValid() {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return false;
  }

  const jwtParts = accessToken.split(".");

  if (jwtParts.length !== 3) {
    return true;
  }

  try {
    const payload = JSON.parse(atob(jwtParts[1].replace(/-/g, "+").replace(/_/g, "/")));

    if (typeof payload.exp !== "number") {
      return true;
    }

    return payload.exp * 1000 > Date.now();
  } catch {
    return true;
  }
}
