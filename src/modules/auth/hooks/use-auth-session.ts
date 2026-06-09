"use client";

import { useSyncExternalStore } from "react";
import { getAuthSession } from "../libs/auth";
import type { AuthSession } from "../services/auth-storage";

let cachedCookieSnapshot: string | null = null;
let cachedSessionSnapshot: AuthSession | null = null;

function readCookieSnapshot() {
  if (typeof document === "undefined") {
    return "";
  }

  return document.cookie;
}

function getClientSnapshot() {
  const cookieSnapshot = readCookieSnapshot();

  if (cachedCookieSnapshot !== cookieSnapshot) {
    cachedCookieSnapshot = cookieSnapshot;
    cachedSessionSnapshot = getAuthSession();
  }

  return cachedSessionSnapshot;
}

function getServerSnapshot() {
  return null;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handlePotentialSessionChange = () => {
    cachedCookieSnapshot = null;
    onStoreChange();
  };

  window.addEventListener("focus", handlePotentialSessionChange);
  window.addEventListener("storage", handlePotentialSessionChange);

  return () => {
    window.removeEventListener("focus", handlePotentialSessionChange);
    window.removeEventListener("storage", handlePotentialSessionChange);
  };
}

export function useAuthSession() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
