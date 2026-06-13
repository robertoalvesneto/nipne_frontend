"use client";

import { useEffect, useState } from "react";
import { getAuthSession } from "../libs/auth";
import type { AuthSession } from "../services/auth-storage";

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const updateSession = () => {
      setSession(getAuthSession());
    };

    updateSession();

    const handlePotentialSessionChange = () => {
      updateSession();
    };

    window.addEventListener("focus", handlePotentialSessionChange);
    window.addEventListener("storage", handlePotentialSessionChange);

    return () => {
      window.removeEventListener("focus", handlePotentialSessionChange);
      window.removeEventListener("storage", handlePotentialSessionChange);
    };
  }, []);

  return session;
}
