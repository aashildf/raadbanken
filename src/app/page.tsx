"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { castVote } from "@/lib/votes";
import { wilsonScore } from "@/lib/wilson";
import { synonymsForSlug } from "@/lib/categories";
import { bestPartialSimilarity } from "@/lib/fuzzy";
import { MEDICINAL_PLANTS, plantOfTheMonth } from "@/lib/plants";
import { REMEDY_IMAGES } from "@/lib/remedyImages";
import { CategoryMenu } from "@/components/CategoryMenu";
import { SiteMenu } from "@/components/SiteMenu";
import { ThumbIcon } from "@/components/ThumbIcon";
import type { Problem, Remedy, Vote } from "@/lib/types";
import {
  CATEGORY_ICON,
  IconSearch,
  IconSparkle,
  PLANT_ICON,
} from "@/components/icons";

const PILL_HEIGHT = 68; // px, høyden på navbaren
const PILL_CENTER = PILL_HEIGHT / 2;
const SHRINK_DISTANCE = 260; // px scrollet for at krympingen skal være fullført

// "Råd" / "banken", forholdet mellom de to linjene og deres letter-spacing,
// hentet fra design-spec (295.46px / 107.255px, -26.591px / 5.363px)
const BANKEN_RATIO = 107.255 / 295.46;
const RAD_LETTER_SPACING_EM = -26.591 / 295.46;
const BANKEN_LETTER_SPACING_EM = 5.363 / 107.255;
const NAV_RAD_SIZE = 32; // px, "Råd" når krympet i navbaren
const HERO_RAD_MIN = 96;
const HERO_RAD_MAX = 295.46;
const LOGO_ICON_ASPECT = 162 / 138; // logo_r.png sitt bredde/høyde-forhold
const NAV_ICON_HEIGHT_MIN = 44; // px, høyden på r_logo.svg i navbaren på mobil
const NAV_ICON_HEIGHT_MAX = 62; // px, høyden på r_logo.svg i navbaren på desktop

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function useViewportWidth() {
  const [width, setWidth] = useState(1440);
  useEffect(() => {
    let raf = 0;
    function onResize() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setWidth(window.innerWidth);
        raf = 0;
      });
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return width;
}

function useScrollProgress(distance: number) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setProgress(clamp01(window.scrollY / distance));
        raf = 0;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [distance]);
  return progress;
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className ?? ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function voteButtonClass(active: boolean, type: "up" | "down") {
  if (!active) return "border-ink/15 bg-paper text-ink-soft hover:border-ink/30 hover:text-ink";
  return type === "up"
    ? "border-sage bg-sage/15 text-ink"
    : "border-rust bg-rust/15 text-ink";
}

export default function HomePage() {
  const progress = useScrollProgress(SHRINK_DISTANCE);
  const viewportWidth = useViewportWidth();
  const uid = useAnonAuth();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [myVotes, setMyVotes] = useState<Vote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [headerQuery, setHeaderQuery] = useState("");
  const [headerFocused, setHeaderFocused] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "votes"), where("userId", "==", uid));
    const unsub = onSnapshot(q, (snap) => {
      setMyVotes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vote, "id">) })));
    });
    return unsub;
  }, [uid]);

  const problemById = useMemo(() => new Map(problems.map((p) => [p.id, p])), [problems]);
  const myVoteByRemedy = useMemo(
    () => new Map(myVotes.map((v) => [v.remedyId, v.voteType])),
    [myVotes]
  );

  const rankedAll = useMemo(
    () =>
      [...remedies].sort(
        (a, b) => wilsonScore(b.votesUp, b.totalVotes) - wilsonScore(a.votesUp, a.totalVotes)
      ),
    [remedies]
  );

  const topTen = rankedAll.slice(0, 10);

  const surprising = useMemo(() => {
    const topIds = new Set(topTen.map((r) => r.id));
    const eligible = [...remedies]
      .filter((r) => !topIds.has(r.id) && r.totalVotes >= 3 && r.totalVotes <= 14 && r.successRate >= 70)
      .sort((a, b) => b.successRate - a.successRate);
    // Fremhev kålbladomslaget når det kvalifiserer, siden vi har eget bilde og utvidet tekst for det.
    const pinnedIndex = eligible.findIndex((r) => r.title === "Kålblad-omslag");
    if (pinnedIndex > 0) {
      const [pinned] = eligible.splice(pinnedIndex, 1);
      eligible.unshift(pinned);
    }
    return eligible.slice(0, 3);
  }, [remedies, topTen]);

  const featuredPlant = useMemo(() => plantOfTheMonth(), []);
  const otherPlants = useMemo(
    () => MEDICINAL_PLANTS.filter((p) => p.id !== featuredPlant.id).slice(0, 4),
    [featuredPlant]
  );

  const findMatches = useCallback(
    (query: string) => {
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
    },
    [problems, remedies, problemById]
  );

  const findFuzzySuggestions = useCallback(
    (query: string, results: ReturnType<typeof findMatches>) => {
      const q = query.trim();
      if (!q || results.length > 0) return [];
      const candidates = [
        ...problems.map((p) => ({ type: "problem" as const, id: p.id, label: p.name })),
        ...remedies.map((r) => ({ type: "remedy" as const, id: r.id, label: r.title })),
      ];
      return candidates
        .map((c) => ({ ...c, score: bestPartialSimilarity(q, c.label) }))
        .filter((c) => c.score >= 0.45)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
    },
    [problems, remedies]
  );

  const searchResults = useMemo(() => findMatches(searchQuery), [findMatches, searchQuery]);
  const fuzzySuggestions = useMemo(
    () => findFuzzySuggestions(searchQuery, searchResults),
    [findFuzzySuggestions, searchQuery, searchResults]
  );

  const headerSearchResults = useMemo(() => findMatches(headerQuery), [findMatches, headerQuery]);
  const headerFuzzySuggestions = useMemo(
    () => findFuzzySuggestions(headerQuery, headerSearchResults),
    [findFuzzySuggestions, headerQuery, headerSearchResults]
  );

  async function handleVote(remedyId: string, voteType: "up" | "down") {
    if (!uid) return;
    setVotingId(remedyId);
    try {
      await castVote(remedyId, uid, voteType, "");
    } catch {
      // stemmen ble ikke registrert, knappen går tilbake til normal tilstand
    } finally {
      setVotingId(null);
    }
  }

  // Responsiv hero-størrelse for "Råd" (96px–295.46px), "banken" skalerer med samme forhold
  const heroRadSize = Math.min(HERO_RAD_MAX, Math.max(HERO_RAD_MIN, viewportWidth * 0.205));
  const heroBankenSize = heroRadSize * BANKEN_RATIO;
  const navBankenSize = NAV_RAD_SIZE * BANKEN_RATIO;
  const navIconHeight = Math.min(
    NAV_ICON_HEIGHT_MAX,
    Math.max(NAV_ICON_HEIGHT_MIN, viewportWidth * 0.045)
  );

  const radSize = NAV_RAD_SIZE + (heroRadSize - NAV_RAD_SIZE) * (1 - progress);
  const bankenSize = navBankenSize + (heroBankenSize - navBankenSize) * (1 - progress);

  const heroLogoHeight = heroRadSize * 1.15 + heroBankenSize * 1.15 - heroRadSize * 0.22;
  const heroLogoDisplayHeight = heroLogoHeight * 1.45;
  const heroCenterY = PILL_HEIGHT + 40 + heroLogoDisplayHeight / 2;
  const logoOffsetY = (heroCenterY - PILL_CENTER) * (1 - progress);
  const heroPaddingTop = PILL_HEIGHT + 40 + heroLogoDisplayHeight + 56;

  return (
    <div className="relative z-0 min-h-full bg-page-bg">
      <Image
        src="/pictures/bg.jpg"
        alt=""
        aria-hidden
        fill
        className="pointer-events-none -z-20 object-cover"
      />
      <div
        className="pointer-events-none absolute inset-x-5 sm:inset-x-0 mx-auto -z-10 max-w-6xl"
        style={{ top: PILL_HEIGHT + 180, bottom: 110, background: "rgba(163, 133, 160, 0.36)" }}
      />

      {/* Sticky header, pill-formet navbar. Logoen lever her hele tiden og krymper/flytter seg med scroll-progresjon */}
      <header className="fixed inset-x-0 top-0 z-50 overflow-visible" style={{ height: PILL_HEIGHT }}>
        <div
          className="absolute inset-0"
          style={{ background: "var(--navbar-bg)" }}
        />
        <div
          className="relative mx-auto h-full max-w-6xl"
          style={{ paddingLeft: "var(--page-pad)", paddingRight: "var(--page-pad)" }}
        >
          <Link
            href="/"
            className="font-logo absolute"
            style={{
              left: "var(--page-pad)",
              top: "50%",
              transform: `translateY(calc(-50% + ${logoOffsetY}px))`,
              opacity: 1 - progress,
              zIndex: 1,
              pointerEvents: progress > 0.5 ? "none" : "auto",
            }}
          >
            <Image
              src="/logo/hele_logoen.svg"
              alt="Rådbanken"
              width={600}
              height={400}
              className="pointer-events-none"
              style={{ height: `${heroLogoDisplayHeight}px`, width: "auto" }}
            />
          </Link>

          <Link
            href="/"
            aria-label="Rådbanken"
            className="absolute"
            style={{
              left: "var(--page-pad)",
              top: "50%",
              transform: "translateY(-50%)",
              opacity: progress,
              zIndex: 1,
              pointerEvents: progress > 0.5 ? "auto" : "none",
            }}
          >
            <Image
              src="/logo/r_logo.svg"
              alt="Rådbanken"
              width={162}
              height={138}
              style={{ height: `${navIconHeight}px`, width: "auto" }}
            />
          </Link>

          <div
            className="absolute flex items-center gap-5 sm:gap-7"
            style={{ right: "var(--page-pad)", top: "50%", transform: "translateY(-50%)" }}
          >
            <div className="relative hidden md:block" style={{ width: 220 }}>
              <div
                className="flex items-center gap-2 px-4"
                style={{
                  borderRadius: 20,
                  background: "#FBF9FD",
                  height: 38,
                }}
              >
                <IconSearch className="h-4 w-4 shrink-0 text-plum-800" />
                <input
                  value={headerQuery}
                  onChange={(e) => setHeaderQuery(e.target.value)}
                  onFocus={() => setHeaderFocused(true)}
                  onBlur={() => setHeaderFocused(false)}
                  placeholder="Søk etter en plage..."
                  className="w-full bg-transparent font-sans text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none"
                />
              </div>

              {headerFocused && headerQuery.trim() && (
                <div className="hairline absolute inset-x-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-2xl bg-paper shadow-2xl">
                  {headerSearchResults.length > 0 ? (
                    <ul className="divide-y divide-ink/10">
                      {headerSearchResults.map((r) => (
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
                      <p className="text-sm text-ink-soft">Fant ingen treff på «{headerQuery.trim()}».</p>

                      {headerFuzzySuggestions.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {headerFuzzySuggestions.map((s) => (
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
            <div className="hidden sm:block">
              <CategoryMenu problems={problems} compact align="right" />
            </div>
            <Link
              href="/del-rad"
              className="font-logo text-base transition-opacity hover:opacity-70 sm:text-lg"
              style={{ color: "#FBF9FD" }}
            >
              Del råd
            </Link>
            <SiteMenu />
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section
          className="text-ink"
          style={{ paddingTop: heroPaddingTop, paddingBottom: 72 }}
        >
          <div className="relative mx-auto max-w-6xl" style={{ paddingInline: "var(--page-pad)" }}>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
              Et oppslagsverk for gamle husråd
            </p>
            <h1 className="font-serif-display mt-4 max-w-xl text-3xl italic leading-snug text-ink sm:text-4xl">
              Det som funket for mormor, samlet på ett sted, og stemt fram av deg.
            </h1>

            <div className="relative mx-auto mt-10 max-w-2xl">
              <div
                className="bg-paper shadow-xl shadow-plum-950/10"
                style={{ borderRadius: 9999, border: "1px solid #8879A5" }}
              >
                <div className="flex items-center gap-3 px-5 py-5">
                  <IconSearch className="h-5 w-5 shrink-0 text-plum-700" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Søk på en plage eller et råd, f.eks. «hoste»"
                    className="w-full bg-transparent font-sans text-base text-ink placeholder:text-ink-soft/60 focus:outline-none sm:text-lg"
                  />
                </div>
              </div>

              {searchFocused && searchQuery.trim() && (
                <div className="hairline absolute inset-x-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-2xl bg-paper shadow-2xl">
                  {searchResults.length > 0 ? (
                    <ul className="divide-y divide-ink/10">
                      {searchResults.map((r) => (
                        <li key={`${r.type}-${r.id}`}>
                          <Link
                            href={r.type === "problem" ? `/problem/${r.id}` : `/remedy/${r.id}`}
                            className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-paper-deep"
                          >
                            <span className="font-sans text-sm font-medium text-ink">{r.label}</span>
                            <span className="text-xs uppercase tracking-wide text-ink-soft">{r.sub}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-5 py-4">
                      <p className="text-sm text-ink-soft">Fant ingen treff på «{searchQuery.trim()}».</p>

                      {fuzzySuggestions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs uppercase tracking-wide text-ink-soft/70">
                            Mente du
                          </p>
                          <ul className="mt-1.5 flex flex-wrap gap-2">
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
                        </div>
                      )}

                      <Link
                        href={`/del-rad?q=${encodeURIComponent(searchQuery.trim())}`}
                        className="mt-4 flex items-center justify-between rounded-xl bg-plum-800 px-4 py-3 text-sm font-medium text-paper transition-colors hover:bg-plum-700"
                      >
                        Fant du ikke noen gode råd? Legg til ditt eget
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FOLKETS FAVORITTER, topp 3 som store kort, 4-10 som kompakt liste */}
        <section className="mx-auto max-w-6xl px-5 py-10 sm:py-12" style={{ paddingInline: "var(--page-pad)" }}>
          <Reveal>
            <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Folkets favoritter</h2>
            <p className="mt-1 text-sm text-ink-soft">De 10 mest pålitelige kjerringrådene.</p>
          </Reveal>

          {topTen.length === 0 && (
            <p className="hairline mt-5 rounded-2xl bg-paper px-6 py-6 text-sm text-ink-soft">
              Ingen råd med stemmer ennå.
            </p>
          )}

          {/* Topp 3 */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {topTen.slice(0, 3).map((r, i) => {
              const problem = problemById.get(r.problemId);
              const Icon = problem ? CATEGORY_ICON[problem.slug] : undefined;
              const myVote = myVoteByRemedy.get(r.id);
              const rankBg = [`var(--gold)`, `var(--plum-600)`, `var(--sage)`][i];
              return (
                <Reveal key={r.id} delay={i * 80}>
                  <div className="hairline relative flex h-full flex-col gap-3 rounded-2xl bg-paper pb-5 pt-20">
                    <div className="absolute left-4 -top-4 flex h-24 w-24 items-center justify-center font-serif-display font-bold">
                      <Image
                        src="/logo/dandilion_emblem.svg"
                        alt=""
                        aria-hidden
                        fill
                        className="object-contain"
                        style={{ filter: "drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25))" }}
                      />
                      <span className="relative z-10 text-4xl leading-none" style={{ color: "#3D2E3A" }}>{i + 1}</span>
                    </div>
                    <div className="flex items-center gap-2 px-5 text-xs uppercase tracking-wide text-plum-700">
                      {Icon && <Icon className="h-4 w-4" />}
                      {problem?.name}
                    </div>
                    <Link href={`/remedy/${r.id}`} className="px-5 text-lg leading-snug text-ink hover:text-plum-700">
                      <strong className="font-semibold">{r.title}</strong>
                    </Link>
                    <p className="px-5 text-sm text-ink-soft line-clamp-3">{r.description}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 px-5 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVote(r.id, "up")}
                          disabled={!uid || votingId !== null}
                          className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${voteButtonClass(
                            myVote === "up",
                            "up"
                          )}`}
                        >
                          <ThumbIcon direction="up" className="h-6 w-6" />
                          {r.votesUp}
                        </button>
                        <button
                          onClick={() => handleVote(r.id, "down")}
                          disabled={!uid || votingId !== null}
                          className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${voteButtonClass(
                            myVote === "down",
                            "down"
                          )}`}
                        >
                          <ThumbIcon direction="down" className="h-6 w-6" />
                          {r.votesDown}
                        </button>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-gold">{r.successRate}%</span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Plass 4–10 */}
          {topTen.length > 3 && (
            <Reveal delay={120} className="hairline mt-5 divide-y divide-ink/10 overflow-hidden rounded-2xl">
              {topTen.slice(3, 10).map((r, i) => {
                const problem = problemById.get(r.problemId);
                const Icon = problem ? CATEGORY_ICON[problem.slug] : undefined;
                const myVote = myVoteByRemedy.get(r.id);
                const standout = r.successRate >= 90;
                return (
                  <div
                    key={r.id}
                    className={`flex items-center gap-3 px-5 py-3 sm:px-6 ${
                      standout ? "bg-sage/10" : i % 2 === 1 ? "bg-paper-deep/30" : "bg-paper"
                    }`}
                  >
                    <span className="font-serif-display w-6 shrink-0 text-right text-base text-gold">
                      {i + 4}
                    </span>
                    {Icon && <Icon className="h-4 w-4 shrink-0 text-plum-700" />}
                    <Link href={`/remedy/${r.id}`} className="min-w-0 flex-1 truncate hover:text-plum-700">
                      <strong className="font-semibold text-ink">{r.title}</strong>{" "}
                      <span className="text-sm text-ink-soft">mot {problem?.name.toLowerCase()}</span>
                    </Link>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => handleVote(r.id, "up")}
                        disabled={!uid || votingId !== null}
                        className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${voteButtonClass(
                          myVote === "up",
                          "up"
                        )}`}
                      >
                        <ThumbIcon direction="up" className="h-6 w-6" />
                        {r.votesUp}
                      </button>
                      <button
                        onClick={() => handleVote(r.id, "down")}
                        disabled={!uid || votingId !== null}
                        className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${voteButtonClass(
                          myVote === "down",
                          "down"
                        )}`}
                      >
                        <ThumbIcon direction="down" className="h-6 w-6" />
                        {r.votesDown}
                      </button>
                    </div>
                  </div>
                );
              })}
            </Reveal>
          )}
        </section>

        {/* MEST OVERRASKENDE RÅD, én boks, ett fremhevet råd */}
        {surprising.length > 0 &&
          (() => {
            const r = surprising[0];
            const problem = problemById.get(r.problemId);
            const Icon = problem ? CATEGORY_ICON[problem.slug] : undefined;
            const myVote = myVoteByRemedy.get(r.id);
            const image = REMEDY_IMAGES[r.title];
            return (
              <section className="mx-auto max-w-6xl px-5 py-10 sm:py-12" style={{ paddingInline: "var(--page-pad)" }}>
                <Reveal>
                  <div className="flex items-center gap-2">
                    <IconSparkle className="h-5 w-5 text-gold" />
                    <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                      Mest overraskende råd
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    Lite kjent, men overgår forventningene - verdt å prøve.
                  </p>
                </Reveal>

                <Reveal
                  delay={80}
                  className="hairline mt-5 flex flex-col gap-5 rounded-2xl bg-paper p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    {image ? (
                      <div className="hairline relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-24">
                        <Image src={image.src} alt={r.title} fill className="object-cover" />
                      </div>
                    ) : (
                      Icon && (
                        <span className="hairline flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper-deep text-plum-700">
                          <Icon className="h-5 w-5" />
                        </span>
                      )
                    )}
                    <div>
                      <Link href={`/remedy/${r.id}`} className="card-title text-ink hover:text-plum-700">
                        {r.title} <span className="text-ink-soft">mot {problem?.name.toLowerCase()}</span>
                      </Link>
                      <p className="mt-2 max-w-md text-ink-soft">{r.description}</p>
                      <span className="mt-2 inline-block text-sm font-medium text-gold">
                        {r.successRate}% positiv · {r.totalVotes} stemmer
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleVote(r.id, "up")}
                      disabled={!uid || votingId !== null}
                      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${voteButtonClass(
                        myVote === "up",
                        "up"
                      )}`}
                    >
                      <ThumbIcon direction="up" className="h-7 w-7" />
                      {r.votesUp}
                    </button>
                    <button
                      onClick={() => handleVote(r.id, "down")}
                      disabled={!uid || votingId !== null}
                      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${voteButtonClass(
                        myVote === "down",
                        "down"
                      )}`}
                    >
                      <ThumbIcon direction="down" className="h-7 w-7" />
                      {r.votesDown}
                    </button>
                  </div>
                </Reveal>
              </section>
            );
          })()}

        {/* I FOKUS: MEDISINPLANTER + HISTORIE */}
        <section className="mx-auto max-w-6xl px-5 pb-20 sm:pb-28" style={{ paddingInline: "var(--page-pad)" }}>
          <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-2">
            {/* Venstre: I fokus: medisinplanter */}
            <div className="flex h-full flex-col">
              <Reveal>
                <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
                  I fokus
                </p>
                <h2 className="font-display mt-2 text-2xl font-bold text-ink sm:text-3xl">
                  <Link href="/medisinplanter" className="hover:text-plum-700">
                    Medisinplanter
                  </Link>
                </h2>
              </Reveal>

              <Reveal delay={80} className="mt-8 flex flex-1">
                {(() => {
                  const FeaturedIcon = PLANT_ICON[featuredPlant.shape];
                  return (
                    <div className="hairline flex w-full flex-col overflow-hidden rounded-[2.5rem] bg-paper-deep/60 shadow-xl shadow-plum-950/5">
                      <div className="flex flex-col gap-3 px-8 pb-3 pt-9 sm:px-10 sm:pt-11">
                        <span className="hairline inline-flex h-11 w-11 items-center justify-center rounded-full bg-paper text-plum-700">
                          <FeaturedIcon className="h-5 w-5" />
                        </span>
                        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-ink-soft">
                          {featuredPlant.latinName}
                        </p>
                        <h3 className="card-title text-ink">{featuredPlant.name}</h3>
                        <p className="max-w-md text-ink-soft">{featuredPlant.description}</p>
                      </div>

                      <div className="relative mt-6 aspect-square w-full" style={{ background: featuredPlant.bg }}>
                        {featuredPlant.image ? (
                          <Image
                            src={featuredPlant.image.src}
                            alt={featuredPlant.name}
                            fill
                            className={
                              featuredPlant.image.fit === "contain" ? "object-contain p-10" : "object-cover"
                            }
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <FeaturedIcon className="h-24 w-24 text-paper/85 sm:h-28 sm:w-28" />
                          </div>
                        )}
                        <span className="hairline absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-paper/90 text-[10px] font-semibold uppercase text-plum-800">
                          {new Date().toLocaleDateString("nb-NO", { month: "short" }).replace(".", "")}
                        </span>
                        {featuredPlant.image?.credit ? (
                          <a
                            href={featuredPlant.image.creditHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 left-3 text-[10px] text-paper/80 hover:text-paper"
                          >
                            Foto: {featuredPlant.image.credit}
                          </a>
                        ) : !featuredPlant.image ? (
                          <span className="absolute bottom-6 left-6 text-paper/60">
                            <IconSparkle className="h-5 w-5" />
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between gap-3 px-8 py-5 sm:px-10">
                        {featuredPlant.sections ? (
                          <Link
                            href={`/plante/${featuredPlant.id}`}
                            className="text-sm font-medium text-plum-700 hover:text-plum-800"
                          >
                            Les mer om urten →
                          </Link>
                        ) : (
                          <span className="text-sm text-ink-soft">Les mer om urten kommer snart</span>
                        )}
                        <div className="flex shrink-0 -space-x-2">
                          {otherPlants.map((p) => {
                            const Icon = PLANT_ICON[p.shape];
                            return (
                              <span
                                key={p.id}
                                title={p.name}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-paper ring-2 ring-paper-deep/60"
                                style={{ background: p.bg }}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </Reveal>
            </div>

            {/* Høyre: Plantemedisinens historie */}
            <div className="flex h-full flex-col">
              <Reveal delay={40}>
                <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
                  Fra fortiden
                </p>
                <h2 className="font-display mt-2 text-2xl font-bold text-ink sm:text-3xl">
                  Plantemedisinens historie
                </h2>
              </Reveal>

              <Reveal delay={120} className="mt-8 flex flex-1">
                <Link
                  href="/historie"
                  className="hairline group flex w-full flex-col overflow-hidden rounded-[2.5rem] bg-paper-deep/60 shadow-xl shadow-plum-950/5 transition-transform hover:-translate-y-0.5"
                >
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src="/pictures/urter_historie.png"
                      alt="En gammel tinkturflaske, merket for hånd, omgitt av blomster"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-3 px-8 py-5 sm:px-10">
                    <span className="font-serif-display text-xl italic text-ink">
                      Fra mormor til barnebarn
                    </span>
                    <p className="text-ink-soft">
                      Hvordan kjerringråd ble til en muntlig tradisjon, og hvorfor vi samler
                      den igjen.
                    </p>
                    <span className="flex items-center gap-2 text-sm font-medium text-plum-700">
                      Les historien
                      <span aria-hidden className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ARTIKLER */}
        <section className="mx-auto max-w-6xl px-5 pb-20 sm:pb-28" style={{ paddingInline: "var(--page-pad)" }}>
          <Reveal>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">Lesestoff</p>
            <h2 className="font-display mt-2 text-2xl font-bold text-ink sm:text-3xl">Artikler</h2>
          </Reveal>

          <Reveal delay={80} className="mt-8">
            <Link
              href="/artikkel/tyttebaer"
              className="hairline group flex flex-col gap-5 overflow-hidden rounded-[2.5rem] bg-paper-deep/60 p-3 shadow-xl shadow-plum-950/5 transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center sm:p-4"
            >
              <div className="relative aspect-5/4 overflow-hidden rounded-4xl sm:aspect-square sm:w-2/5 sm:shrink-0">
                <Image src="/pictures/tyttebaer.png" alt="Tyttebær" fill className="object-cover" />
              </div>
              <div className="flex flex-col gap-3 px-3 pb-4 sm:px-2 sm:pb-2">
                <span className="font-serif-display text-xl italic text-ink">
                  Naturens egen hostesaft
                </span>
                <p className="text-ink-soft">
                  Derfor virker det gamle tyttebærtrikset mot hoste og sår hals, og hvordan du
                  bruker det riktig.
                </p>
                <span className="flex items-center gap-2 text-sm font-medium text-plum-700">
                  Les artikkelen
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
