"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { synonymsForSlug } from "@/lib/categories";
import { bestPartialSimilarity } from "@/lib/fuzzy";
import type { Problem, Remedy } from "@/lib/types";

export type SiteSearchResult = { type: "problem" | "remedy"; id: string; label: string; sub: string };
export type SiteSearchSuggestion = { type: "problem" | "remedy"; id: string; label: string };

// Delt søkelogikk for navbarens desktop-søkepanel og mobilmenyens søkefelt
// (begge trengte samme Firestore-baserte treff/fuzzy-forslag — flyttet hit
// i stedet for å abonnere på problems/remedies to steder).
export function useSiteSearch() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "problems"), (snap) => {
      setProblems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Problem, "id">) })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "remedies"), (snap) => {
      setRemedies(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Remedy, "id">) })));
    });
    return unsub;
  }, []);

  const problemById = useMemo(() => new Map(problems.map((p) => [p.id, p])), [problems]);

  const results = useMemo<SiteSearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const problemMatches = problems
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          synonymsForSlug(p.slug).some((syn) => syn.toLowerCase().includes(q))
      )
      .map((p) => ({ type: "problem" as const, id: p.id, label: p.name, sub: "Plage" }));
    const remedyMatches = remedies
      .filter((r) => r.title.toLowerCase().includes(q))
      .slice(0, 6)
      .map((r) => ({
        type: "remedy" as const,
        id: r.id,
        label: r.title,
        sub: problemById.get(r.problemId)?.name ?? "",
      }));
    return [...problemMatches, ...remedyMatches];
  }, [problems, remedies, problemById, query]);

  const suggestions = useMemo<(SiteSearchSuggestion & { score: number })[]>(() => {
    const q = query.trim();
    if (!q || results.length > 0) return [];
    const candidates: SiteSearchSuggestion[] = [
      ...problems.map((p) => ({ type: "problem" as const, id: p.id, label: p.name })),
      ...remedies.map((r) => ({ type: "remedy" as const, id: r.id, label: r.title })),
    ];
    return candidates
      .map((c) => ({ ...c, score: bestPartialSimilarity(q, c.label) }))
      .filter((c) => c.score >= 0.45)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [problems, remedies, query, results]);

  return { query, setQuery, results, suggestions };
}
