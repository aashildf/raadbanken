"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSiteSearch } from "@/lib/useSiteSearch";
import { PrimaryButton } from "@/components/Button";
import { IconArrowRight } from "@/components/icons";

// Plager som faktisk finnes i Rådbanken, så et søk på placeholder-ordet gir
// treff (handoffens ordliste var eksempler fra prototypen).
const WORDS = ["hoste", "tett sluk", "hodepine", "myggstikk", "halsbrann", "rustflekker"];

// Skrivende placeholder — design_handoff_radbanken_mor, del B. Ett tegn per
// 70 ms, pause 24 tick når ordet er skrevet og 5 tick når det er slettet,
// markøren blinker hvert 530 ms. Under markørens "av"-fase står et smalt
// mellomrom, så teksten ikke hopper. Ved redusert bevegelse: første ord,
// statisk.
function useTypingPlaceholder(words: string[]) {
  const [text, setText] = useState(words[0]);
  const [blink, setBlink] = useState(true);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let w = 0, i = 0, dir = 1, hold = 0;
    const t = setInterval(() => {
      setAnimated(true);
      if (hold > 0) { hold--; return; }
      i += dir;
      if (i >= words[w].length) { dir = -1; hold = 24; }
      if (i <= 0) { dir = 1; w = (w + 1) % words.length; hold = 5; }
      setText(words[w].slice(0, Math.max(0, i)));
    }, 70);
    const b = setInterval(() => setBlink((v) => !v), 530);
    return () => { clearInterval(t); clearInterval(b); };
  }, [words]);

  return { text, cursor: animated ? (blink ? "|" : " ") : "" };
}

export function HeroSearch({ stats }: { stats?: { remedies: number; votes: number } }) {
  const router = useRouter();
  const { query, setQuery, results, suggestions } = useSiteSearch();
  const { text, cursor } = useTypingPlaceholder(WORDS);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hrefFor = (r: { type: "problem" | "remedy"; id: string }) =>
    r.type === "problem" ? `/problem/${r.id}` : `/remedy/${r.id}`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Tomt felt: søk på ordet som står i placeholderen akkurat nå.
    if (!query.trim()) {
      setQuery(text.trim() || WORDS[0]);
      inputRef.current?.focus();
      return;
    }
    if (results[0]) router.push(hrefFor(results[0]));
  }

  const hasQuery = query.trim().length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {/* Toppstripe (ravn_trinnvis) — med Rådbankens ekte tall, ikke
          prototypens eksempeltall. Vises først når tallene er lastet. */}
      {stats && stats.remedies > 0 && (
        <div
          className="flex flex-wrap justify-between"
          style={{
            gap: "8px 24px",
            paddingBottom: 14,
            borderBottom: "1px solid #111110",
            fontFamily: "var(--font-source-sans), sans-serif",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "#6d685c",
          }}
        >
          <span>Søk i {stats.remedies.toLocaleString("nb-NO")} råd</span>
          <span>Vurdert {stats.votes.toLocaleString("nb-NO")} ganger</span>
        </div>
      )}
      <form role="search" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label
          htmlFor="hero-sok"
          className="font-lora text-[clamp(34px,4.4vw,64px)] font-semibold leading-[1.02] tracking-[-0.02em] text-balance"
          style={{ color: "#111110" }}
        >
          Jeg trenger et råd mot
        </label>
        <div className="flex items-end gap-4 sm:gap-5">
          {/* Ember-streken er et eget lag under teksten (ikke inputens
              bakgrunn), så den kan ha papirkorn uten at kornet legger seg
              over hele feltet. Plassert 86–94 % ned som i SPEC. */}
          <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            id="hero-sok"
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={focused ? "" : text + cursor}
            className="no-focus-ring font-lora block w-full min-w-0 rounded-none border-0 bg-transparent pb-1 text-[clamp(30px,3.6vw,52px)] leading-[1.15] placeholder:text-[#c2b59b] focus:outline-none"
            style={{ color: "#111110", caretColor: "#111110" }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0"
            style={{ top: "86%", height: "8%", background: "var(--ember-grain), #a93415" }}
          />
          </div>
          {/* Rund knapp med pil (ravn_trinnvis), samme PrimaryButton og
              dermed samme hover som resten av siden (svart → ember). */}
          <PrimaryButton
            type="submit"
            aria-label="Søk"
            className="mb-[0.35em] !h-[clamp(48px,4.6vw,64px)] !w-[clamp(48px,4.6vw,64px)] shrink-0 !p-0"
          >
            <IconArrowRight className="h-6 w-6" />
          </PrimaryButton>
        </div>
      </form>

      {hasQuery && (
        <div aria-live="polite">
          {results.length > 0 ? (
            <ul className="m-0 list-none p-0" style={{ borderTop: "1px solid #111110" }}>
              {results.slice(0, 6).map((r) => (
                <li key={`${r.type}-${r.id}`} style={{ borderBottom: "1px solid #d9d2c1" }}>
                  <Link
                    href={hrefFor(r)}
                    className="flex items-center justify-between gap-4 py-3 transition-opacity hover:opacity-75"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="font-figtree truncate text-[17px] font-semibold" style={{ color: "#111110" }}>
                      {r.label}
                    </span>
                    <span className="font-figtree shrink-0 text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#6d685c" }}>
                      {r.sub}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-3" style={{ borderTop: "1px solid #111110" }}>
              <p className="font-lora m-0 text-[19px]" style={{ color: "#111110" }}>
                Ingen har delt et råd om dette ennå.{" "}
                <Link
                  href="/del-rad"
                  className="font-figtree inline-flex items-center gap-1.5 text-[15px] font-semibold transition-opacity hover:opacity-75"
                  style={{ color: "#a93415", textDecoration: "none" }}
                >
                  Vær den første
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </p>
              {suggestions.length > 0 && (
                <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
                  {suggestions.map((s) => (
                    <li key={`${s.type}-${s.id}`}>
                      <Link
                        href={hrefFor(s)}
                        className="font-figtree rounded-[2px] px-3 py-1 text-sm transition-colors hover:bg-[#f0e5cf]"
                        style={{ boxShadow: "inset 0 0 0 1px #cdc6b4", color: "#111110", textDecoration: "none" }}
                      >
                        Mente du {s.label}?
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
  );
}
