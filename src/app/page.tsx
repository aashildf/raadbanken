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
import { LottieVote } from "@/components/LottieVote";
import type { Problem, Remedy, Vote } from "@/lib/types";
import {
  CATEGORY_ICON,
  IconSearch,
  IconSparkle,
  PLANT_ICON,
} from "@/components/icons";

const PILL_HEIGHT = 68;
const NAV_ICON_HEIGHT_MIN = 44;
const NAV_ICON_HEIGHT_MAX = 62;

const LOGO_SEEDS = [
  { w: 28, left: "58%", top: "8%",  anim: "seed-drift-c", dur: "9s",  delay: "0s"   },
  { w: 20, left: "66%", top: "2%",  anim: "seed-drift-a", dur: "11s", delay: "2.5s" },
  { w: 16, left: "50%", top: "12%", anim: "seed-drift-b", dur: "13s", delay: "5s"   },
  { w: 22, left: "72%", top: "6%",  anim: "seed-drift-c", dur: "10s", delay: "7.5s" },
];

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


function Reveal({
  children,
  className,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
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
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}


export default function HomePage() {
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
  const heroSearchRef = useRef<HTMLInputElement>(null);

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

  const navIconHeight = Math.min(
    NAV_ICON_HEIGHT_MAX,
    Math.max(NAV_ICON_HEIGHT_MIN, viewportWidth * 0.045)
  );

  return (
    <div className="relative min-h-full" style={{ background: "#F4ECDA" }}>

      {/* Dekorative løvetannbilder — vekslende sider nedover */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" style={{ zIndex: 0 }}>
        <Image src="/ikoner/dandelion_shadow.png" alt="" aria-hidden width={1020} height={1020}
          className="absolute left-0" style={{ top: "55vh", width: 1020, height: "auto", opacity: 0.4 }} />
        <Image src="/ikoner/dandelion_shadow.png" alt="" aria-hidden width={900} height={900}
          className="absolute right-0" style={{ top: "195vh", width: 900, height: "auto", opacity: 0.3, transform: "scaleX(-1)" }} />
        <Image src="/ikoner/dandelion_shadow.png" alt="" aria-hidden width={860} height={860}
          className="absolute left-0" style={{ top: "310vh", width: 860, height: "auto", opacity: 0.25 }} />

        {/* Subtile radiale gradients — varmt sollys */}
        <div className="absolute" style={{ top: "5%",  right: "-10%", width: 900, height: 700,  background: "radial-gradient(ellipse, rgba(255,200,100,0.06) 0%, transparent 70%)" }} />
        <div className="absolute" style={{ top: "40%", left:  "-5%", width: 800, height: 600,  background: "radial-gradient(ellipse, rgba(255,180,80,0.05)  0%, transparent 70%)" }} />
        <div className="absolute" style={{ top: "70%", right: "0%",  width: 700, height: 600,  background: "radial-gradient(ellipse, rgba(255,210,120,0.05) 0%, transparent 70%)" }} />
        <div className="absolute" style={{ top: "90%", left:  "20%", width: 1000, height: 500, background: "radial-gradient(ellipse, rgba(255,190,90,0.04)  0%, transparent 70%)" }} />
      </div>

      {/* Sticky header, pill-formet navbar. Logoen lever her hele tiden og krymper/flytter seg med scroll-progresjon */}
      <header className="fixed inset-x-0 top-0 z-50 overflow-visible" style={{ height: PILL_HEIGHT }}>
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(255,255,255,0.58)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            borderBottom: "1px solid rgba(50,22,72,0.08)",
          }}
        />

        <div
          className="relative h-full"
          style={{ paddingInline: "var(--page-pad)" }}
        >
          {/* LEFT: logo */}
          <Link
            href="/"
            aria-label="Rådbanken"
            className="absolute"
            style={{ left: "var(--page-pad)", top: "50%", transform: "translateY(-50%)", zIndex: 1 }}
          >
            <Image
              src="/ikoner/heroicon2.png"
              alt="Rådbanken"
              width={842}
              height={968}
              style={{ height: `${navIconHeight}px`, width: "auto" }}
            />
          </Link>

          {/* CENTER: søkefelt (kun desktop) */}
          <div
            className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
            style={{ width: 300 }}
          >
            <div className="relative">
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
                  value={headerQuery}
                  onChange={(e) => setHeaderQuery(e.target.value)}
                  onFocus={() => setHeaderFocused(true)}
                  onBlur={() => setHeaderFocused(false)}
                  placeholder="Søk råd"
                  className="w-full bg-transparent font-sans text-sm focus:outline-none"
                  style={{ color: "#3D2E3A" }}
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
          </div>

          {/* RIGHT: aksjoner */}
          <div
            className="absolute inset-y-0 right-0 flex items-center gap-4 sm:gap-6"
            style={{ paddingRight: "var(--page-pad)" }}
          >
            <div className="hidden sm:block">
              <CategoryMenu problems={problems} compact align="right" textColor="#3D2E3A" />
            </div>
            <Link
              href="/del-rad"
              className="font-logo hidden text-base transition-opacity hover:opacity-70 sm:block sm:text-lg"
              style={{ color: "#3D2E3A" }}
            >
              Del råd
            </Link>
            {/* Mobil søk-ikon */}
            <button
              aria-label="Søk"
              onClick={() => { heroSearchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); heroSearchRef.current?.focus(); }}
              className="flex items-center justify-center transition-opacity hover:opacity-70 md:hidden"
              style={{ color: "#3D2E3A" }}
            >
              <IconSearch className="h-5 w-5" />
            </button>
            <SiteMenu textColor="#3D2E3A" />
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section
          className="relative overflow-hidden text-ink"
          style={{
            paddingTop: PILL_HEIGHT + 48,
            paddingBottom: viewportWidth >= 640 ? 56 : 40,
          }}
        >
          <Image
            src="/bakgrunner/bg5.png"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="pointer-events-none object-cover"
            style={{ zIndex: 0 }}
            priority
          />
          <div
            className="relative z-10 mx-auto max-w-5xl"
            style={{ paddingInline: "var(--page-pad)" }}
          >
            {/* Glassfelt over herotekst */}
            <div style={{ borderRadius: 60, background: "rgba(254,225,225,0.17)", padding: "40px 72px 36px" }}>
            {/* Logo + sitat */}
            <div className="relative mb-5 flex flex-col items-center sm:mb-8">
              {/* Logo + eyebrow */}
              <div className="relative z-10">
                {/* Frø som blåser av løvetannen i logoen */}
                {LOGO_SEEDS.map((s, i) => (
                  <Image
                    key={i}
                    src="/logo/dandelionseed.png"
                    alt=""
                    width={60}
                    height={60}
                    aria-hidden="true"
                    data-seed=""
                    style={{
                      position: "absolute",
                      left: s.left,
                      top: s.top,
                      width: s.w,
                      height: "auto",
                      animation: `${s.anim} ${s.dur} ${s.delay} infinite linear`,
                      zIndex: 20,
                    }}
                  />
                ))}
                <Image
                  src="/logo/herologo2.png"
                  alt="Rådbanken"
                  width={499}
                  height={455}
                  className="h-auto w-72 sm:w-96 lg:w-[26rem]"
                  priority
                  style={{  }}
                />
                <p className="mt-2 text-center text-xs uppercase tracking-[0.12em]" style={{ fontFamily: "var(--font-kantumruy)", color: "var(--logo-banken)" }}>
                  Et oppslagsverk for gamle husråd
                </p>
              </div>
              {/* Sitat under logo */}
              <div className="mt-5 rounded-2xl" style={{ background: "#E5D5B0", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 28px 22px 28px" }}>
                <h1 style={{ fontFamily: "var(--font-courier)", fontStyle: "italic", fontWeight: 400, fontSize: "17px", lineHeight: 1.4, color: "#36131D", textAlign: "center" }}>
                  «Det som funket for bestemor,<br />
                  samlet og stemt fram av deg.»
                </h1>
              </div>
            </div>
            </div>{/* slutt glassfelt */}

            <div className="relative mx-auto mt-14 max-w-2xl">
              <div
                className="bg-white/80 shadow-sm shadow-plum-950/8"
                style={{ borderRadius: 9999, border: "1px solid rgba(50,22,72,0.13)" }}
              >
                <div className="flex items-center gap-3 px-5 py-3">
                  <IconSearch className="h-4 w-4 shrink-0 text-ink/40" />
                  <input
                    ref={heroSearchRef}
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
        <section className="relative z-10" style={{ paddingInline: 0 }}>
        <div className="mx-auto max-w-5xl px-5 pb-10 pt-10 sm:py-12" style={{ paddingInline: "var(--page-pad)" }}>
          <Reveal>
            <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Folkets favoritter</h2>
            <p className="mt-1 text-sm text-ink-soft">De 10 mest pålitelige kjerringrådene.</p>
          </Reveal>

          {topTen.length === 0 && (
            <p className="hairline mt-5 rounded-2xl px-6 py-6 text-sm text-ink-soft" style={{ background: "#FCFAF7" }}>
              Ingen råd med stemmer ennå.
            </p>
          )}

          {/* Nr. 1–3: bilde-kort. Mobil: nr 1 full bredde, 2+3 side om side */}
          {(() => {
            const TOP3_IMAGES = [
              { src: "/bakgrunner/te.png", bg: "#7C9053", text: "light" as const },
              { src: "/bakgrunner/red.png", bg: "#7E334A", text: "light" as const },
              { src: "/bakgrunner/honning2.png", bg: "#F3D9A8", text: "dark" as const },
            ];
            return (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {topTen.slice(0, 3).map((r, i) => {
                  const problem = problemById.get(r.problemId);
                  const { src: imgSrc, bg: cardBg, text: textTone } = TOP3_IMAGES[i];
                  const isLight = textTone === "light";
                  return (
                    <Reveal key={r.id} delay={i * 60} className={i === 0 ? "col-span-2 sm:col-span-1" : ""}>
                      <Link
                        href={`/remedy/${r.id}`}
                        className={`group grid overflow-hidden rounded-2xl shadow-lg shadow-plum-950/10 transition-transform hover:-translate-y-0.5 ${i === 0 ? "aspect-[16/10]" : "aspect-[3/4]"} sm:aspect-[4/5]`}
                        style={{ background: cardBg, gridTemplateRows: "2fr 1fr" }}
                      >
                        <div className="relative overflow-hidden">
                          <Image
                            src={imgSrc}
                            alt=""
                            fill
                            sizes={i === 0 ? "(max-width:640px) 100vw, 33vw" : "(max-width:640px) 50vw, 33vw"}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span
                            className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold shadow"
                            style={{ background: cardBg, color: isLight ? "#fff" : "#3D2213" }}
                          >
                            {i + 1}
                          </span>
                        </div>
                        <div className="flex flex-col justify-center p-3 sm:p-4" style={{ background: cardBg }}>
                          <p
                            className={`text-[10px] font-semibold uppercase tracking-widest ${isLight ? "text-white/75" : "text-plum-700"}`}
                          >
                            {problem?.name}
                          </p>
                          <p
                            className={`mt-0.5 font-bold leading-snug ${isLight ? "text-white" : "text-ink"} ${i === 0 ? "text-base" : "text-sm"} sm:text-base`}
                          >
                            {r.title}
                          </p>
                          <p className={`mt-2 text-xs font-medium ${isLight ? "text-white/90" : "text-plum-700"}`}>
                            Les mer →
                          </p>
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            );
          })()}

          {/* Nr. 4–10: fargede kort i samme stil som topp 3 */}
          {topTen.length > 3 && (() => {
            const RANK_ACCENTS = [
              { bg: "#7C9053", text: "light" as const },
              { bg: "#7E334A", text: "light" as const },
              { bg: "#F3D9A8", text: "dark" as const },
            ];
            return (
              <div className="mt-3 flex flex-col gap-2">
                {topTen.slice(3).map((r, i) => {
                  const problem = problemById.get(r.problemId);
                  const Icon = problem ? CATEGORY_ICON[problem.slug] : undefined;
                  const accent = RANK_ACCENTS[i % RANK_ACCENTS.length];
                  const isLight = accent.text === "light";
                  return (
                    <Reveal key={r.id} delay={180 + i * 30}>
                      <Link
                        href={`/remedy/${r.id}`}
                        className="group flex items-center gap-3 rounded-2xl bg-[#FCFAF7] px-4 py-3 shadow-sm shadow-plum-950/8 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-plum-950/10 sm:px-5"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{ background: accent.bg, color: isLight ? "#fff" : "#3D2213" }}
                        >
                          {i + 4}
                        </span>
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                          style={{ background: `${accent.bg}1F`, color: accent.bg }}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">{r.title}</p>
                          <p className="truncate text-xs text-ink-soft">{problem?.name}</p>
                        </div>
                        <span
                          className="text-sm transition-transform group-hover:translate-x-1"
                          style={{ color: accent.bg }}
                        >
                          →
                        </span>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            );
          })()}
        </div>
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
              <section className="mx-auto max-w-5xl px-5 py-10 sm:py-12" style={{ paddingInline: "var(--page-pad)" }}>
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
                  className="group relative mt-5 flex flex-col gap-5 rounded-2xl p-6 shadow-lg shadow-plum-950/10 transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between sm:p-8"
                  style={{ background: "#FCFAF7" }}
                >
                  <Link
                    href={`/remedy/${r.id}`}
                    className="absolute inset-0 z-10 rounded-2xl"
                    aria-label={`${r.title} mot ${problem?.name ?? ""}`}
                  />
                  <div className="flex items-start gap-4">
                    {image ? (
                      <div className="hairline relative hidden h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:block sm:h-24 sm:w-24">
                        <Image src={image.src} alt={r.title} fill sizes="96px" className="object-cover" />
                      </div>
                    ) : (
                      Icon && (
                        <span className="hairline hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper-deep text-plum-700 sm:flex">
                          <Icon className="h-5 w-5" />
                        </span>
                      )
                    )}
                    <div>
                      <p className="card-title text-ink transition-colors group-hover:text-plum-700">
                        {r.title} <span className="text-ink-soft">mot {problem?.name.toLowerCase()}</span>
                      </p>
                      <p className="mt-2 max-w-md text-ink-soft">{r.description}</p>
                      <span className="mt-2 inline-block text-sm font-medium text-gold">
                        {r.successRate}% positiv · {r.totalVotes} stemmer
                      </span>
                    </div>
                  </div>
                  <div className="relative z-20 flex shrink-0 items-center gap-2">
                    <LottieVote
                      direction="up"
                      count={r.votesUp}
                      active={myVote === "up"}
                      disabled={!uid || votingId !== null}
                      onClick={() => handleVote(r.id, "up")}
                    />
                    <LottieVote
                      direction="down"
                      count={r.votesDown}
                      active={myVote === "down"}
                      disabled={!uid || votingId !== null}
                      onClick={() => handleVote(r.id, "down")}
                    />
                  </div>
                </Reveal>
              </section>
            );
          })()}

        {/* I FOKUS: MEDISINPLANTER + HISTORIE */}
        <section className="mx-auto max-w-5xl px-5 pb-20 sm:pb-28" style={{ paddingInline: "var(--page-pad)" }}>
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

              <Reveal delay={80} className="mt-5 flex flex-1">
                {(() => {
                  const FeaturedIcon = PLANT_ICON[featuredPlant.shape];
                  const featuredHref = featuredPlant.sections ? `/plante/${featuredPlant.id}` : null;
                  return (
                    <div
                      className={`group relative flex w-full flex-col overflow-hidden rounded-[2.5rem] bg-[#FCFAF7] shadow-lg shadow-plum-950/10 ${featuredHref ? "transition-transform hover:-translate-y-0.5" : ""}`}
                    >
                      {featuredHref && (
                        <Link
                          href={featuredHref}
                          className="absolute inset-0 z-10"
                          aria-label={`Les mer om ${featuredPlant.name}`}
                        />
                      )}
                      <div className="flex flex-col gap-2 px-8 pb-3 pt-7 sm:px-10 sm:pt-9">
                        <p className="text-xs uppercase tracking-[0.25em] text-ink-soft">
                          {featuredPlant.latinName}
                        </p>
                        <h3 className="card-title text-ink">{featuredPlant.name}</h3>
                        <p className="max-w-md text-ink-soft">{featuredPlant.description}</p>
                      </div>

                      <div className="relative mt-5 aspect-[4/3] w-full" style={{ background: featuredPlant.bg }}>
                        {featuredPlant.image ? (
                          <Image
                            src={featuredPlant.image.src}
                            alt={featuredPlant.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
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
                            className="absolute bottom-2 left-3 z-20 text-[10px] text-paper/80 hover:text-paper"
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
                        {featuredHref ? (
                          <span className="text-sm font-medium text-plum-700 transition-colors group-hover:text-plum-800">
                            Les mer om urten →
                          </span>
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

              <Reveal delay={120} className="mt-5 flex flex-1">
                <Link
                  href="/historie"
                  className="group flex w-full flex-col overflow-hidden rounded-[2.5rem] bg-[#FCFAF7] shadow-lg shadow-plum-950/10 transition-transform hover:-translate-y-0.5"
                >
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src="/pictures/urter_historie.png"
                      alt="En gammel tinkturflaske, merket for hånd, omgitt av blomster"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
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
        <section className="mx-auto max-w-5xl px-5 pb-20 sm:pb-28" style={{ paddingInline: "var(--page-pad)" }}>
          <Reveal>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">Lesestoff</p>
            <h2 className="font-display mt-2 text-2xl font-bold text-ink sm:text-3xl">Artikler</h2>
          </Reveal>

          <Reveal delay={80} className="mt-5">
            <Link
              href="/artikkel/tyttebaer"
              className="group flex flex-col gap-5 overflow-hidden rounded-[2.5rem] bg-[#FCFAF7] p-3 shadow-lg shadow-plum-950/10 transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center sm:p-4"
            >
              <div className="relative aspect-5/4 overflow-hidden rounded-4xl sm:aspect-square sm:w-2/5 sm:shrink-0">
                <Image src="/pictures/tyttebaer.png" alt="Tyttebær" fill sizes="(max-width: 640px) 100vw, 40vw" className="object-cover" />
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
