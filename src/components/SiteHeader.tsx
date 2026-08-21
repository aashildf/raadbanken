"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TOP_CATEGORIES, synonymsForSlug } from "@/lib/categories";
import { bestPartialSimilarity } from "@/lib/fuzzy";
import { SiteMenu } from "@/components/SiteMenu";
import { IconSearch } from "@/components/icons";
import type { Problem, Remedy } from "@/lib/types";

const PILL_HEIGHT = 68;
const CATEGORY_TAG_ROW_HEIGHT = 44;

export function SiteHeader() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const searchResults = useMemo(() => {
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

  const fuzzySuggestions = useMemo(() => {
    const q = query.trim();
    if (!q || searchResults.length > 0) return [];
    const candidates = [
      ...problems.map((p) => ({ type: "problem" as const, id: p.id, label: p.name })),
      ...remedies.map((r) => ({ type: "remedy" as const, id: r.id, label: r.title })),
    ];
    return candidates
      .map((c) => ({ ...c, score: bestPartialSimilarity(q, c.label) }))
      .filter((c) => c.score >= 0.45)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [problems, remedies, query, searchResults]);

  return (
    <header className="sticky top-0 z-50 overflow-visible">
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(255,255,255,0.58)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid rgba(50,22,72,0.08)",
        }}
      />

      <div className="relative" style={{ height: PILL_HEIGHT, paddingInline: "var(--page-pad)" }}>
        {/* LEFT: logo */}
        <Link
          href="/"
          aria-label="Rådbanken"
          className="absolute"
          style={{ left: "var(--page-pad)", top: "50%", transform: "translateY(-50%)", zIndex: 1 }}
        >
          <Image
            src="/logo/r_nylogo.png"
            alt="Rådbanken"
            width={624}
            height={748}
            style={{ height: "clamp(44px, 4.5vw, 62px)", width: "auto" }}
          />
        </Link>

        {/* CENTER: søkefelt + Del råd-knapp. Desktop: alltid synlig. Mobil: togglet via søk-ikonet til høyre. */}
        <div
          className={`absolute left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 ${
            searchOpen ? "top-full mt-2 flex w-[calc(100vw-40px)]" : "hidden"
          } md:top-1/2 md:mt-0 md:flex md:w-[460px] md:-translate-y-1/2`}
        >
          <div className="relative flex-1">
            <div
              className="flex items-center gap-2 px-4"
              style={{
                height: 38,
                borderRadius: 20,
                background: "rgba(61,46,58,0.07)",
                border: "1px solid rgba(61,46,58,0.10)",
              }}
            >
              <IconSearch className="h-4 w-4 shrink-0 text-[#3D2E3A]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                  setFocused(false);
                  if (!query) setSearchOpen(false);
                }}
                placeholder="Søk råd"
                className="w-full bg-transparent font-sans text-sm focus:outline-none"
                style={{ color: "#3D2E3A" }}
              />
            </div>
            {focused && query.trim() && (
              <div className="hairline absolute inset-x-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-2xl bg-paper shadow-2xl">
                {searchResults.length > 0 ? (
                  <ul className="divide-y divide-ink/10">
                    {searchResults.map((r) => (
                      <li key={`${r.type}-${r.id}`}>
                        <Link
                          href={r.type === "problem" ? `/problem/${r.id}` : `/remedy/${r.id}`}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-paper-deep"
                        >
                          <span className="truncate font-sans text-sm font-medium text-ink">{r.label}</span>
                          <span className="shrink-0 text-xs uppercase tracking-wide text-ink-soft">{r.sub}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3">
                    <p className="text-sm text-ink-soft">Fant ingen treff på «{query.trim()}».</p>
                    {fuzzySuggestions.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {fuzzySuggestions.map((s) => (
                          <li key={`${s.type}-${s.id}`}>
                            <Link
                              href={s.type === "problem" ? `/problem/${s.id}` : `/remedy/${s.id}`}
                              className="hairline rounded-full px-3 py-1 text-sm text-ink hover:bg-paper-deep"
                            >
                              {s.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <Link
            href="/del-rad"
            className="flex shrink-0 items-center justify-center gap-2 px-5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ height: 38, borderRadius: 20, background: "#DBD1DC", color: "var(--logo-rad)" }}
          >
            Del råd
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* RIGHT: aksjoner */}
        <div
          className="absolute inset-y-0 right-0 flex items-center gap-4 sm:gap-6"
          style={{ paddingRight: "var(--page-pad)" }}
        >
          {/* Mobil søk-ikon — åpner/lukker søkefeltet over */}
          <button
            aria-label="Søk"
            onClick={() => {
              setSearchOpen((open) => {
                const next = !open;
                if (next) setTimeout(() => inputRef.current?.focus(), 50);
                return next;
              });
            }}
            className="flex items-center justify-center transition-opacity hover:opacity-70 md:hidden"
            style={{ color: "#3D2E3A" }}
          >
            <IconSearch className="h-5 w-5" />
          </button>
          <SiteMenu />
        </div>
      </div>

      {/* Kategori-tag-rad — de tre hovedkategoriene alltid synlige, ingen dropdown-klikk
          nødvendig. Kun sm+; mobil bruker hamburgermenyen. */}
      <div
        className="relative hidden items-center justify-center gap-8 sm:flex"
        style={{ height: CATEGORY_TAG_ROW_HEIGHT, borderTop: "1px solid rgba(50,22,72,0.08)" }}
      >
        {TOP_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/kategori/${cat.id}`}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3D2E3A] transition-opacity hover:opacity-70"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
