"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "radbanken_display_name";

/** Liksom-innlogging, ikke ekte autentisering — foreløpig bare et visningsnavn
    lagret i nettleseren. Den underliggende identiteten er fortsatt den samme
    anonyme Firebase-uiden hele tiden (se useAnonAuth), så "å logge inn" endrer
    ikke hvilken bruker lagrede råd/stemmer henger på — ingenting å migrere. */
export function useProfile() {
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setDisplayNameState(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      // localStorage utilgjengelig (f.eks. privat modus) — forblir "ikke logget inn".
    }
    setLoaded(true);
  }, []);

  const signIn = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
    } catch {
      // ignorert
    }
    setDisplayNameState(trimmed);
  }, []);

  const signOut = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignorert
    }
    setDisplayNameState(null);
  }, []);

  return { displayName, loaded, signIn, signOut };
}
