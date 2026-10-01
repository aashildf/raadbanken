"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { synonymsForSlug } from "@/lib/categories";
import { bestPartialSimilarity } from "@/lib/fuzzy";
import { useMenuEntries } from "@/lib/useMenuEntries";
import { SiteMenu } from "@/components/SiteMenu";
import { SignInMenu } from "@/components/SignInMenu";
import { GRAIN_BG } from "@/components/GrainOverlay";
import { HEADER_BG, HEADER_TEXT } from "@/lib/theme";
import { IconSearch } from "@/components/icons";
import type { Problem, Remedy } from "@/lib/types";

const PILL_HEIGHT = 92;

export function SiteHeader() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const menuEntries = useMenuEntries();
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openEntry(id: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveEntryId(id);
  }
  function keepOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setActiveEntryId(null), 150);
  }
  // Header/dropdown ligger i layouten og overlever selve sidenavigeringen —
  // uten dette ble aktiveEntryId stående etter et klikk på en lenke inni
  // dropdownen (museevnten "forlot" aldri lenken, den navigerte bare vekk),
  // så menyen sto synlig åpen oppå den nye siden til man flyttet musen.
  function closeEntry() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveEntryId(null);
  }
  const activeLinkEntry = menuEntries.find((e) => e.id === activeEntryId) ?? null;
  const activeEntry = activeLinkEntry?.kind === "dropdown" ? activeLinkEntry : null;

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
    <header
      className="relative z-50 overflow-visible"
      style={{ background: HEADER_BG, "--focus-ring": "#E1B08C" } as React.CSSProperties}
    >
      {/* Papirkorn oppå den solide bakgrunnsfargen — samme feTurbulence-teknikk
          som resten av siden, så headeren føles som et trykt papirfelt i
          stedet for en flat digital bjelke. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: GRAIN_BG, opacity: 0.4 }}
      />
      {/* Ett samlet linje: logo venstre, kategori-lenker midtstilt (egen
          grid-kolonne — sentrert uavhengig av hvor bred logoen/høyre-klyngen
          er), søk/del råd/meny høyre. Ikke sticky. */}
      <div
        className="relative grid items-center"
        style={{
          height: PILL_HEIGHT,
          paddingInline: "var(--page-pad)",
          gridTemplateColumns: "1fr auto 1fr",
          columnGap: 16,
        }}
      >
        {/* VENSTRE: logo — den gamle sorte/kremhvite dandelion-ikonet byttet ut
            med den nye gullversjonen, som leser bedre mot den mørke bjelken.
            Prøvde et ordmerke ved siden av ikonet (for den tomme venstre
            spalten), men det så rart ut — tilbake til bare ikonet, litt
            større enn før i stedet. */}
        <Link href="/" aria-label="Rådbanken" className="flex items-center transition-opacity active:opacity-70">
          <Image
            src="/logo/gold-logo.png"
            alt="Rådbanken"
            width={331}
            height={281}
            style={{ height: "clamp(46px, 5.2vw, 66px)", width: "auto" }}
          />
        </Link>

        {/* MIDTEN: fem nav-punkter, md+. Bare "Kjerringråd" har en
            hover-dropdown (kort + sitat + "se hele"-lenke) — resten
            (Om oss/Lifehacks/Kultur/Planter og urter) er vanlige lenker,
            akkurat som i referansebildet der bare "Categories" har en pil.
            Mobil bruker hamburgermenyen — hover finnes jo ikke på touch. */}
        <nav
          className="hidden items-center gap-6 lg:gap-8 md:flex"
          style={{ gridColumn: 2, color: HEADER_TEXT }}
          onMouseLeave={scheduleClose}
        >
          {menuEntries.map((entry) => (
            <div
              key={entry.id}
              className="relative flex h-full items-center py-2"
              onMouseEnter={entry.kind === "dropdown" ? () => openEntry(entry.id) : undefined}
            >
              <Link
                href={entry.href}
                onClick={closeEntry}
                className="text-xs font-normal uppercase tracking-[0.14em] transition-colors hover:text-[#E1B08C]"
                style={activeEntryId === entry.id ? { color: "#E1B08C" } : undefined}
              >
                {entry.name}
              </Link>
              {entry.kind === "dropdown" && activeEntryId === entry.id && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent"
                  style={{ borderTopColor: "#E1B08C" }}
                />
              )}
            </div>
          ))}
        </nav>

        {/* HØYRE: søk, del råd, meny (meny kun mobil nå, se over) */}
        <div className="flex items-center justify-end gap-4 sm:gap-6" style={{ gridColumn: 3, color: HEADER_TEXT }}>
          <button
            aria-label="Søk"
            onClick={(e) => {
              // blur: musetrykk skal ikke la en firkantet fokusring henge
              // igjen på selve ikon-knappen (den er ikke rund/avlang, så
              // ringen leser som en løsrevet firkant) — fokus flyttes uansett
              // videre til søkefeltet rett etter, se under.
              e.currentTarget.blur();
              setSearchOpen((open) => {
                const next = !open;
                if (next) setTimeout(() => inputRef.current?.focus(), 50);
                return next;
              });
            }}
            className="no-focus-ring flex items-center justify-center rounded-full p-1 transition-opacity hover:opacity-70 active:opacity-50"
          >
            <IconSearch className="h-5 w-5" />
          </button>
          <SignInMenu />
          <Link
            href="/del-rad"
            className="hidden shrink-0 items-center whitespace-nowrap rounded-lg px-5 py-2.5 text-xs font-normal uppercase tracking-[0.14em] transition-colors hover:bg-[#f6f0e3] hover:text-[#2c232e] sm:flex"
            style={{ border: `1px solid ${HEADER_TEXT}` }}
          >
            Del råd
          </Link>
          <div className="md:hidden">
            <SiteMenu tone={HEADER_TEXT} />
          </div>
        </div>
      </div>

      {/* Hover-dropdown — samme mørke bakgrunn+korn som headeren selv, så den
          leser som én sammenhengende papirflate ned fra navbaren, ikke et
          separat popup-panel. Full bredde uansett hvilken lenke som er
          aktiv, med kort + sitat/tagline + "se hele"-lenke, etter
          referansebildet. onMouseEnter/-Leave her også, så det ikke lukker
          seg idet musen flytter fra lenken ned til selve panelet. */}
      {activeEntry && (
        <div
          className="absolute inset-x-0 top-full z-30 hidden overflow-hidden md:block"
          style={{ background: HEADER_BG }}
          onMouseEnter={keepOpen}
          onMouseLeave={scheduleClose}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: GRAIN_BG, opacity: 0.4 }}
          />
          <div className="relative" style={{ paddingInline: "var(--page-pad)", paddingTop: 32, paddingBottom: 28 }}>
            <div className="flex flex-wrap gap-8">
              {activeEntry.cards.map((card) => (
                <Link key={card.key} href={card.href} onClick={closeEntry} className="group w-44 shrink-0">
                  <p className="font-serif-display mb-2 truncate text-sm" style={{ color: HEADER_TEXT }}>
                    {card.label}
                  </p>
                  <span className="relative block aspect-4/3 overflow-hidden">
                    <Image
                      src={card.image}
                      alt=""
                      fill
                      sizes="180px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </span>
                </Link>
              ))}
            </div>
            <div
              className="mt-8 flex items-center justify-between gap-8 border-t pt-4"
              style={{ borderColor: "rgba(226,221,215,0.18)" }}
            >
              <p className="font-serif-display max-w-xl truncate text-sm italic" style={{ color: "rgba(226,221,215,0.75)" }}>
                “{activeEntry.tagline}”
              </p>
              <Link
                href={activeEntry.href}
                onClick={closeEntry}
                className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-75"
                style={{ color: "#E1B08C" }}
              >
                Se hele {activeEntry.name.toLowerCase()} →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Søk-panel — samme flyt-ut-under-headeren for alle bredder nå (før kun
          mobil), åpnes/lukkes med søk-ikonet i stedet for å stå fast synlig. */}
      {searchOpen && (
        <div
          className="absolute inset-x-0 top-full z-20 flex justify-center"
          style={{ paddingInline: "var(--page-pad)" }}
        >
          <div className="relative mt-2 w-full sm:w-[460px]">
            {/* Solid papirbunn (var(--paper)) i stedet for en nesten
                gjennomsiktig mørk tone — søkefeltet flyter oppå hva som helst
                (hero-fotoet på forsiden, artikkelbilder), og en 7%-opasitet
                bakgrunn ga knapt noen flate å lese den mørke teksten mot. */}
            <div
              className="flex items-center gap-2 px-4"
              style={{
                height: 38,
                borderRadius: 20,
                background: "var(--paper)",
                border: "1px solid rgba(44,35,46,0.14)",
                boxShadow: "0 8px 24px rgba(20,14,10,0.22)",
              }}
            >
              <IconSearch className="h-4 w-4 shrink-0 text-ink" />
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
                className="no-focus-ring w-full rounded-full bg-transparent font-sans text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none"
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
                          className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-paper-deep active:bg-paper-deep"
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
                              className="hairline rounded-full px-3 py-1 text-sm text-ink transition-colors hover:bg-paper-deep active:bg-paper-deep"
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
        </div>
      )}
    </header>
  );
}
