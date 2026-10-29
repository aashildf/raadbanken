"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MEGA_CATEGORIES, MEGA_SHORTCUTS, MEGA_FEATURE } from "@/lib/megaMenu";
import { useSiteSearch } from "@/lib/useSiteSearch";
import { SiteMenu } from "@/components/SiteMenu";
import { SignInMenu } from "@/components/SignInMenu";
import { SecondaryButton } from "@/components/Button";
import { Paper } from "@/components/Paper";
import { RavnLogo } from "@/components/RavnLogo";
import { IconSearch, IconChevronDown, IconArrowRight } from "@/components/icons";

// Navbar — gjenskapt 1:1 fra
// design/design_handoff_radbanken_forside/fasit/komponent-navbar.html.
// Brytpunktet er 980px i fasiten, ikke Tailwinds vanlige md(768)/lg(1024) —
// derfor egne [min-width:981px]-varianter under i stedet for md:/lg:.
// Høyden (64px under 980px, 76px over) er satt via Tailwind h-16/h-[76px]
// på innholds-raden, ikke en JS-konstant, siden den må bytte med viewporten.

export function SiteHeader() {
  // Forsiden har menyen flytende/halvgjennomsiktig over toppbildet, og
  // mørkere etter scroll (se bredde-og-bladskygger.md/README). Resten av
  // siten har den faste navbaren fra komponent-navbar.html — samme
  // lenkestruktur og mega-meny begge steder, bare positurering/bakgrunn som
  // skiller dem.
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    function onScroll() {
      setScrolled(window.scrollY > 480);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const { query, setQuery, results: searchResults, suggestions: fuzzySuggestions } = useSiteSearch();
  const [focused, setFocused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openMega() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  }
  function keepMegaOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }
  function scheduleMegaClose() {
    // 220ms per fasit (".. eller når musen forlater (220 ms forsinkelse)").
    closeTimer.current = setTimeout(() => setMegaOpen(false), 220);
  }
  // Overlever selve sidenavigeringen (header ligger i layouten) — uten
  // dette sto mega-menyen åpen oppå den nye siden til man flyttet musen.
  function closeMega() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(false);
  }

  useEffect(() => {
    if (!megaOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMega();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  return (
    <header
      className={`z-50 overflow-visible [transition:background-color_.5s,backdrop-filter_.5s] ${
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0"
      }`}
      style={
        {
          // Samme farge som heroen (#faf5ea). Litt gjennomsiktig + blur på
          // forsiden etter scroll, så innhold som glir under fortsatt anes.
          background: isHome && scrolled ? "rgba(250,245,234,0.94)" : "#faf5ea",
          backdropFilter: isHome ? "blur(10px)" : undefined,
          WebkitBackdropFilter: isHome ? "blur(10px)" : undefined,
          "--focus-ring": "#a93415",
        } as React.CSSProperties
      }
    >
      <Paper id="nav" variant="light" mottle={false} />
      <div
        className="relative z-10 mx-auto flex h-16 items-center gap-8 [@media(min-width:981px)]:h-[76px]"
        style={{ maxWidth: 1480, paddingInline: "clamp(20px,3vw,40px)" }}
      >
        {/* Venstre: animert Ravn-logo (se RavnLogo.tsx), lenker til forsiden.
            Lenkens navn kommer fra logoens alt-tekst, "Ravn". */}
        <Link href="/" className="flex shrink-0 items-center transition-opacity active:opacity-70">
          <RavnLogo className="h-[52px] w-[81px] [@media(min-width:981px)]:h-[64px] [@media(min-width:981px)]:w-[100px]" />
        </Link>

        {/* Midten: Utforsk (mega-meny), Nordisk råd, Om Rådbanken — skjult
            under 981px, hamburger overtar der (se høyre-klyngen). */}
        <nav
          className="hidden items-center gap-9 [@media(min-width:981px)]:flex"
          style={{ marginInline: "auto", color: "#111110" }}
          onMouseLeave={scheduleMegaClose}
        >
          <div className="flex h-full items-center" onMouseEnter={() => matchMedia("(hover:hover)").matches && openMega()}>
            <button
              type="button"
              onClick={() => (megaOpen ? closeMega() : openMega())}
              aria-expanded={megaOpen}
              aria-controls="mega"
              className="inline-flex items-center gap-1.5 border-b border-transparent py-2 text-[13px] font-normal uppercase tracking-[0.2em] transition-colors hover:border-[#a93415] hover:text-[#a93415]"
            >
              Utforsk
              <IconChevronDown className={`h-3 w-3 transition-transform duration-500 ${megaOpen ? "rotate-180" : ""}`} />
            </button>

            {megaOpen && (
              <div
                id="mega"
                className="absolute top-full z-[60]"
                style={{ left: "clamp(20px,3vw,40px)", width: "min(1000px, calc(100vw - 40px))" }}
                onMouseEnter={keepMegaOpen}
                onMouseLeave={scheduleMegaClose}
              >
                <div className="relative overflow-hidden" style={{ background: "#f5eee0", padding: 6, boxShadow: "inset 0 0 0 1px #6d685c, 0 24px 48px rgba(17,17,16,.28)" }}>
                  <Paper id="mega" variant="light" />
                  <div
                    className="relative z-[3] grid gap-9"
                    style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", padding: "28px 30px 30px", boxShadow: "inset 0 0 0 1px rgba(138,92,71,.55)" }}
                  >
                    <div>
                      <p className="font-figtree mb-3 text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: "#6d685c" }}>
                        Kategorier
                      </p>
                      {/* Én kolonne — grid-cols-2 var satt opp for fasitens åtte
                          plasshoder-kategorier; med tre reelle kategorier ga
                          to-kolonners oppsett en skjev 2-over-1-rad. */}
                      <ul className="flex list-none flex-col p-0" style={{ margin: 0 }}>
                        {MEGA_CATEGORIES.map((cat) => (
                          <li key={cat.label}>
                            <Link
                              href={cat.href}
                              onClick={closeMega}
                              className="flex items-center gap-3 py-[11px] text-[15px] font-medium transition-colors hover:text-[#a93415]"
                              style={{ borderBottom: "1px solid #d9d2c1", color: "#111110" }}
                            >
                              <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0" fill="none" stroke="#6d685c" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                                <path d={cat.d} />
                              </svg>
                              <span>{cat.label}</span>
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href="/alle"
                            onClick={closeMega}
                            className="flex items-center gap-2 py-[11px] text-[15px] font-semibold transition-colors hover:text-[#a93415]"
                            style={{ color: "#a93415" }}
                          >
                            <span>Se alle kategorier</span>
                            <IconArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-figtree mb-3 text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: "#6d685c" }}>
                        Snarveier
                      </p>
                      <ul className="list-none p-0" style={{ margin: 0 }}>
                        {MEGA_SHORTCUTS.map((s) => (
                          <li key={s.label}>
                            <Link
                              href={s.href}
                              onClick={closeMega}
                              className="font-lora flex items-center justify-between gap-3 py-[11px] text-lg transition-colors hover:text-[#a93415]"
                              style={{ borderBottom: "1px solid #d9d2c1", color: "#111110" }}
                            >
                              <span>{s.label}</span>
                              <IconArrowRight className="h-3.5 w-3.5 shrink-0 text-[#a93415]" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link href={MEGA_FEATURE.href} onClick={closeMega} className="group flex flex-col gap-1.5 no-underline" style={{ color: "#111110" }}>
                      <div className="relative mb-2.5 aspect-4/3 overflow-hidden" style={{ padding: 6, borderRadius: "999px 999px 10px 10px", boxShadow: "inset 0 0 0 1.5px #6d685c" }}>
                        <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: "999px 999px 6px 6px" }}>
                          <Image src={MEGA_FEATURE.image} alt="" fill sizes="280px" className="object-cover" />
                        </div>
                      </div>
                      <p className="font-figtree text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: "#6d685c" }}>
                        {MEGA_FEATURE.kicker}
                      </p>
                      <span className="font-lora text-lg transition-colors group-hover:text-[#a93415]" style={{ textWrap: "balance" }}>
                        {MEGA_FEATURE.title}
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "#a93415" }}>
                        {MEGA_FEATURE.cta}
                        <IconArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/artikkel/nordisk-rad"
            className="border-b border-transparent py-2 text-[13px] font-normal uppercase tracking-[0.2em] transition-colors hover:border-[#a93415] hover:text-[#a93415]"
          >
            Nordisk råd
          </Link>
          <Link
            href="/om-oss"
            className="border-b py-2 text-[13px] font-normal uppercase tracking-[0.2em] transition-colors hover:border-[#a93415] hover:text-[#a93415]"
            style={pathname === "/om-oss" ? { color: "#111110", borderBottomColor: "#a93415" } : { borderBottomColor: "transparent" }}
          >
            Om RAVN
          </Link>
        </nav>

        {/* Høyre: søk, logg inn, del et råd (desktop), hamburger (<981px). */}
        <div className="flex shrink-0 items-center gap-5" style={{ color: "#111110" }}>
          <button
            aria-label="Søk"
            onClick={(e) => {
              e.currentTarget.blur();
              setSearchOpen((open) => {
                const next = !open;
                if (next) setTimeout(() => inputRef.current?.focus(), 50);
                return next;
              });
            }}
            className="no-focus-ring -m-2.5 grid h-11 w-11 place-items-center rounded-[2px] transition-colors hover:text-[#a93415]"
          >
            <IconSearch className="h-5 w-5" />
          </button>
          <div className="hidden [@media(min-width:981px)]:block">
            <SignInMenu />
          </div>
          <div className="hidden [@media(min-width:981px)]:block">
            <SecondaryButton href="/del-rad" tone="forest" className="!px-6 !py-[14px] !text-[11px]">
              Del et råd
            </SecondaryButton>
          </div>
          <div className="[@media(min-width:981px)]:hidden">
            <SiteMenu tone="#111110" />
          </div>
        </div>
      </div>

      {/* Søk-panel — flyter ut under headeren, åpnes/lukkes med søk-ikonet. */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-full z-20 flex justify-center" style={{ paddingInline: "clamp(20px,3vw,40px)" }}>
          <div className="relative mt-2 w-full sm:w-[460px]">
            {/* Samme oppskrift som søkefeltet på kategorisiden nå (6px radius,
                #cdc6b4-kant, Paper-tekstur), i stedet for sin egen gamle
                "ink"-pallett (rgba(17,17,16,…), svart hover, helt avrundede
                hjørner) — ett felles boks-språk, ikke to. Selve inputen er
                bg-transparent slik at korn-laget bak (lavere z) skinner
                gjennom overalt, også der du skriver, uten å ligge oppå
                teksten. Fokusringen settes her på selve pillen (inset,
                group-focus-within) i stedet for sidens vanlige --focus-ring
                på inputen — en ytre glødering ville blitt kuttet av
                overflow-hidden (som trengs for å klippe Paper-teksturen til
                de runde hjørnene). */}
            <div
              className="group relative flex items-center gap-2 overflow-hidden px-4 transition-shadow duration-200"
              style={{ height: 44, borderRadius: 6, background: "#fffaf0", boxShadow: "inset 0 0 0 1px #cdc6b4" }}
            >
              <Paper id="nav-search" variant="light" mottle={false} />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100"
                style={{ boxShadow: "inset 0 0 0 2px #a93415" }}
              />
              <IconSearch className="relative z-10 h-4 w-4 shrink-0 text-[#111110]" />
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
                className="no-focus-ring relative z-10 font-figtree w-full rounded-[6px] bg-transparent text-sm placeholder:text-[#6d685c] focus:outline-none"
                style={{ color: "#111110" }}
              />
            </div>
            {focused && query.trim() && (
              <div
                className="absolute inset-x-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-[6px]"
                style={{ background: "#fffaf0", boxShadow: "inset 0 0 0 1px #6d685c, 0 20px 48px rgba(20,14,10,0.22)" }}
              >
                <Paper id="nav-search-results" variant="light" mottle={false} />
                {searchResults.length > 0 ? (
                  <ul className="relative z-10 divide-y" style={{ borderColor: "#d9d2c1" }}>
                    {searchResults.map((r) => (
                      <li key={`${r.type}-${r.id}`}>
                        <Link
                          href={r.type === "problem" ? `/problem/${r.id}` : `/remedy/${r.id}`}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-[#f0e5cf]"
                        >
                          <span className="font-figtree truncate text-sm font-medium" style={{ color: "#111110" }}>
                            {r.label}
                          </span>
                          <span className="shrink-0 text-xs uppercase tracking-wide" style={{ color: "#4a473f" }}>
                            {r.sub}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="relative z-10 px-4 py-3">
                    <p className="text-sm" style={{ color: "#4a473f" }}>
                      Fant ingen treff på «{query.trim()}».
                    </p>
                    {fuzzySuggestions.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {fuzzySuggestions.map((s) => (
                          <li key={`${s.type}-${s.id}`}>
                            <Link
                              href={s.type === "problem" ? `/problem/${s.id}` : `/remedy/${s.id}`}
                              className="rounded-[2px] px-3 py-1 text-sm transition-colors hover:bg-[#f0e5cf]"
                              style={{ boxShadow: "inset 0 0 0 1px #cdc6b4", color: "#111110" }}
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
