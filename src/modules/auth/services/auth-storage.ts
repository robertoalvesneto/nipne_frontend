import type { JwtPayload } from "../interfaces/jwt-payload";

export const ACCESS_TOKEN_KEY = "nipne_access_token";
export const REFRESH_TOKEN_KEY = "nipne_refresh_token";
export const PAYLOAD_KEY = "nipne_auth_payload";
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

export type AuthSession = AuthTokens & {
  payload: JwtPayload;
};

export function setAuthTokens(tokens: AuthSession) {
  setCookie(ACCESS_TOKEN_KEY, tokens.accessToken);
  setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken);
  setCookie(PAYLOAD_KEY, JSON.stringify(tokens.payload));
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
  deleteCookie(PAYLOAD_KEY);
}

export function getAccessToken() {
  return getAuthTokens()?.accessToken ?? null;
}

export function decodeJwtPayload(accessToken: string): JwtPayload | null {
  const jwtParts = accessToken.split(".");

  if (jwtParts.length !== 3) {
    return null;
  }

  try {
    const base64 = jwtParts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));

    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function getJwtPayload() {
  const storedPayload = getCookie(PAYLOAD_KEY);

  if (storedPayload) {
    try {
      return JSON.parse(storedPayload) as JwtPayload;
    } catch {
      deleteCookie(PAYLOAD_KEY);
    }
  }

  const accessToken = getAccessToken();

  if (!accessToken) {
    return null;
  }

  return decodeJwtPayload(accessToken);
}

export function getAuthSession(): AuthSession | null {
  const tokens = getAuthTokens();
  const payload = getJwtPayload();

  if (!tokens || !payload) {
    return null;
  }

  return {
    ...tokens,
    payload,
  };
}

export function isAccessTokenValid() {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return false;
  }

  const payload = decodeJwtPayload(accessToken);

  if (!payload) {
    return true;
  }

  if (typeof payload.exp !== "number") {
    return true;
  }

  return payload.exp * 1000 > Date.now();
}
