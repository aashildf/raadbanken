"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { wilsonScore } from "@/lib/wilson";
import { HEALTH_SUBCATEGORIES, TOP_CATEGORIES, synonymsForSlug } from "@/lib/categories";
import { bestPartialSimilarity } from "@/lib/fuzzy";
import { MEDICINAL_PLANTS, plantOfTheMonth } from "@/lib/plants";
import { SiteMenu } from "@/components/SiteMenu";
import type { Problem, Remedy } from "@/lib/types";
import {
  CATEGORY_ICON,
  IconChevronDown,
  IconSearch,
  IconSparkle,
  PLANT_ICON,
} from "@/components/icons";

const PILL_HEIGHT = 68;
const NAV_ICON_HEIGHT_MIN = 44;
const NAV_ICON_HEIGHT_MAX = 62;
// Bredden på kategori-kort-stabelen i heroens høyre kolonne.
const HERO_CATEGORY_COL = "clamp(180px, 22%, 240px)";

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

  const [problems, setProblems] = useState<Problem[]>([]);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [headerQuery, setHeaderQuery] = useState("");
  const [headerFocused, setHeaderFocused] = useState(false);
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [hoveredTopCategoryId, setHoveredTopCategoryId] = useState<string | null>(null);
  const headerSearchInputRef = useRef<HTMLInputElement>(null);

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

  const rankedAll = useMemo(
    () =>
      [...remedies].sort(
        (a, b) => wilsonScore(b.votesUp, b.totalVotes) - wilsonScore(a.votesUp, a.totalVotes)
      ),
    [remedies]
  );

  const topTen = rankedAll.slice(0, 10);

  const featuredPlant = useMemo(() => plantOfTheMonth(), []);
  // Faste følgeplanter ved siden av månedens plante — hvis månedens plante selv skulle
  // være en av disse (roterer månedlig), filtreres duplikatet bort.
  const companionPlants = useMemo(
    () =>
      ["lavendel", "rosenrot"]
        .map((id) => MEDICINAL_PLANTS.find((p) => p.id === id))
        .filter((p): p is (typeof MEDICINAL_PLANTS)[number] => !!p && p.id !== featuredPlant.id),
    [featuredPlant]
  );
  const spotlightPlants = useMemo(() => [featuredPlant, ...companionPlants], [featuredPlant, companionPlants]);

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

  const headerSearchResults = useMemo(() => findMatches(headerQuery), [findMatches, headerQuery]);
  const headerFuzzySuggestions = useMemo(
    () => findFuzzySuggestions(headerQuery, headerSearchResults),
    [findFuzzySuggestions, headerQuery, headerSearchResults]
  );

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
              src="/logo/r_nylogo.png"
              alt="Rådbanken"
              width={624}
              height={748}
              style={{ height: `${navIconHeight}px`, width: "auto" }}
            />
          </Link>

          {/* CENTER: søkefelt + Del råd-knapp. Desktop: alltid synlig. Mobil: togglet via søk-ikonet til høyre. */}
          <div
            className={`absolute left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 ${
              headerSearchOpen ? "top-full mt-2 flex w-[calc(100vw-40px)]" : "hidden"
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
                  ref={headerSearchInputRef}
                  value={headerQuery}
                  onChange={(e) => setHeaderQuery(e.target.value)}
                  onFocus={() => setHeaderFocused(true)}
                  onBlur={() => { setHeaderFocused(false); if (!headerQuery) setHeaderSearchOpen(false); }}
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
            <Link
              href="/del-rad"
              className="flex shrink-0 items-center justify-center gap-2 px-5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ height: 38, borderRadius: 20, background: "#DBD1DC", color: "var(--logo-rad)" }}
            >
              Del råd
              <span aria-hidden>→</span>
            </Link>
            {/* Kategorier — klikk åpner de tre hovedkategoriene, hover på en av dem åpner
                en flyout til høyre med underkategoriene (samme mønster som en klassisk mega-meny). */}
            <div className="relative hidden shrink-0 sm:block">
              <button
                onClick={() => {
                  setCategoriesOpen((open) => !open);
                  setHoveredTopCategoryId(null);
                }}
                className="flex items-center gap-1 text-sm font-semibold text-[#3D2E3A] transition-opacity hover:opacity-70"
              >
                Kategorier
                <IconChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${categoriesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {categoriesOpen && (
                <div
                  className="hairline absolute left-0 top-[calc(100%+10px)] z-30 overflow-visible rounded-2xl bg-paper shadow-xl"
                  style={{ minWidth: 220 }}
                >
                  {TOP_CATEGORIES.map((cat, i) => {
                    const subs = HEALTH_SUBCATEGORIES.filter((s) => s.topCategoryId === cat.id);
                    const isHovered = hoveredTopCategoryId === cat.id;
                    return (
                      <div
                        key={cat.id}
                        className={`relative ${i > 0 ? "border-t border-ink/8" : ""}`}
                        onMouseEnter={() => setHoveredTopCategoryId(cat.id)}
                        onMouseLeave={() => setHoveredTopCategoryId(null)}
                      >
                        <Link
                          href={`/kategori/${cat.id}`}
                          onClick={() => setCategoriesOpen(false)}
                          className={`flex items-center justify-between gap-4 px-4 py-2.5 text-sm font-semibold transition-colors ${
                            isHovered ? "bg-paper-deep text-plum-700" : "text-ink hover:bg-paper-deep/60 hover:text-plum-700"
                          }`}
                        >
                          {cat.name}
                          <IconChevronDown className="h-3 w-3 shrink-0 -rotate-90 opacity-50" />
                        </Link>
                        {isHovered && subs.length > 0 && (
                          <div
                            className="hairline absolute left-full top-0 z-40 ml-1 overflow-hidden rounded-2xl bg-paper shadow-xl"
                            style={{ minWidth: 220 }}
                          >
                            {subs.map((sub) => {
                              const firstProblem = sub.problemSlugs
                                .map((slug) => problems.find((p) => p.slug === slug))
                                .find(Boolean);
                              return (
                                <Link
                                  key={sub.id}
                                  href={firstProblem ? `/problem/${firstProblem.id}` : "/alle"}
                                  onClick={() => setCategoriesOpen(false)}
                                  className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-paper-deep/60 hover:text-plum-700"
                                >
                                  {sub.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="border-t border-ink/10 px-4 py-2.5">
                    <Link
                      href="/alle"
                      onClick={() => setCategoriesOpen(false)}
                      className="text-xs font-medium text-plum-700 hover:text-plum-800"
                    >
                      Se alle kategorier →
                    </Link>
                  </div>
                </div>
              )}
            </div>
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
                setHeaderSearchOpen((open) => {
                  const next = !open;
                  if (next) setTimeout(() => headerSearchInputRef.current?.focus(), 50);
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
      </header>

      <main>
                  {/* HERO — CSS Grid koordinerer hovedinnhold (logo) og kategori-kortene i samme
                      kolonne-system. Bakgrunn er et dekorativt full-bleed lag som bevisst IKKE er et
                      grid-item: en absolutt-posisjonert grid-item sin "containing block" er grid-arealet
                      innenfor content-boksen (ekskludert section sin egen padding), mens vanlig
                      position:absolute mot en position:relative-forelder regner fra padding-boksen —
                      derfor plain fill. */}
                  <section
                    className="relative overflow-hidden text-ink"
                    style={{
                      // Ingen felt over hero lenger gir klaring for den faste navbaren,
                      // så hero må selv dekke PILL_HEIGHT på alle skjermbredder.
                      paddingTop: PILL_HEIGHT + 48,
                      paddingBottom: viewportWidth >= 640 ? 56 : 40,
                      minHeight: viewportWidth >= 640 ? "min(680px, 78vh)" : undefined,
                      display: "grid",
                      // Kolonne 2 (kun sm+) holder kategori-kort-stabelen; kolonne 1 tar resten
                      // og sentrerer hovedinnholdet i det som er igjen.
                      gridTemplateColumns: viewportWidth >= 640 ? `1fr ${HERO_CATEGORY_COL}` : "1fr",
                    }}
                  >
                    {/* Bakgrunn — dekker hele seksjonen (padding inkludert), derfor utenfor grid-plasseringen */}
                    <Image
                      src="/bakgrunner/bg5.png"
                      alt=""
                      aria-hidden
                      fill
                      sizes="100vw"
                      className="pointer-events-none object-cover object-center"
                      style={{ zIndex: 0 }}
                      priority
                    />

                    {/* Hovedinnhold: logo + eyebrow — sentrert i kolonne 1 */}
                    <div
                      className="relative z-10 mx-auto w-full max-w-7xl"
                      style={{ gridColumn: "1", alignSelf: "center", paddingInline: "var(--page-pad)" }}
                    >
                      <div className="relative flex flex-col items-center">
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
                      </div>
                    </div>

                    {/* Kategori-kort — stablet i kolonne 2, kun sm+. Hvert kort lenker til sin
                        egen kategoriside, med bildet fra TOP_CATEGORIES som eneste kilde til bilde. */}
                    <div
                      className="relative z-10 hidden flex-col gap-3 sm:flex"
                      style={{ gridColumn: "2", alignSelf: "center", justifySelf: "end", width: HERO_CATEGORY_COL, paddingRight: "var(--page-pad)" }}
                    >
                      {TOP_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/kategori/${cat.id}`}
                          className="group relative block overflow-hidden rounded-2xl shadow-lg shadow-plum-950/20"
                          style={{ aspectRatio: "4 / 3" }}
                        >
                          <Image
                            src={cat.image}
                            alt=""
                            fill
                            sizes="220px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            aria-hidden="true"
                          />
                          <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(to top, rgba(25,12,45,0.65) 0%, rgba(25,12,45,0.05) 55%)" }}
                          />
                          <span className="absolute bottom-2 left-2.5 right-2.5 text-[11px] font-semibold leading-tight text-white">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>

        {/* FIKEN — fremhevet artikkel, fullbredde felt rett under hero */}
        <section className="relative">
          <div className="relative left-1/2 w-screen -translate-x-1/2" style={{ background: "#F9E1C1" }}>
            <Reveal
              className="mx-auto flex flex-col items-stretch py-8 sm:flex-row sm:py-12"
              style={{ maxWidth: 1280, paddingInline: "var(--page-pad)" }}
            >
              {/* Bildet — 2/3 av bredden, fast aspect-ratio (ingen stretch-avhengig prosenthøyde) */}
              <div className="w-full shrink-0 sm:w-2/3">
                <Link
                  href="/artikkel/fiken"
                  className="relative block aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]"
                >
                  <Image
                    src="/pictures/fiken.png"
                    alt="Ferske fiken, hele og oppskåret"
                    fill
                    className="object-cover"
                  />
                </Link>
              </div>

              {/* Tekstboks — 1/3 av bredden, flush mot bildet, ingen mellomrom */}
              <div
                className="flex w-full flex-col items-start justify-center gap-3 px-6 py-10 sm:w-1/3 sm:px-8"
                style={{ background: "#FBEED4" }}
              >
                <p className="font-metrophobic text-xs uppercase tracking-[0.3em]" style={{ color: "#535E3D" }}>
                  Frukt med lange tradisjoner
                </p>
                <h2 className="font-metrophobic text-2xl sm:text-3xl" style={{ color: "#535E3D" }}>
                  Fiken – en liten frukt med store helsefordeler
                </h2>
                <p className="font-metrophobic" style={{ color: "#535E3D" }}>
                  Derfor er den søte frukten godt for fordøyelsen, hjertehelsen og skjelettet.
                </p>
                <Link
                  href="/artikkel/fiken"
                  className="mt-2 inline-flex items-center gap-2 rounded-[14px] px-6 py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                  style={{ background: "#72874E" }}
                >
                  Les artikkel
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FOLKETS FAVORITTER, topp 3 som store kort, 4-10 som kompakt liste */}
        <section className="relative z-10" style={{ paddingInline: 0 }}>
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-10 sm:py-12" style={{ paddingInline: "var(--page-pad)" }}>
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

        {/* I FOKUS: MEDISINPLANTER — månedens plante + to faste følgeplanter, som tre jevnstore kort */}
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:pb-20" style={{ paddingInline: "var(--page-pad)" }}>
          <Reveal>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">I fokus</p>
            <h2 className="font-display mt-2 text-2xl font-bold text-ink sm:text-3xl">
              <Link href="/medisinplanter" className="hover:text-plum-700">
                Medisinplanter
              </Link>
            </h2>
          </Reveal>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {spotlightPlants.map((p, i) => {
              const Icon = PLANT_ICON[p.shape];
              const href = p.sections ? `/plante/${p.id}` : null;
              return (
                <Reveal key={p.id} delay={i * 60} className="flex">
                  <div
                    className={`group relative flex w-full flex-col overflow-hidden rounded-[2rem] bg-[#FCFAF7] shadow-lg shadow-plum-950/10 ${href ? "transition-transform hover:-translate-y-0.5" : ""}`}
                  >
                    {href && (
                      <Link href={href} className="absolute inset-0 z-10" aria-label={`Les mer om ${p.name}`} />
                    )}
                    <div className="relative aspect-[4/3] w-full" style={{ background: p.bg }}>
                      {p.image ? (
                        <Image
                          src={p.image.src}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className={p.image.fit === "contain" ? "object-contain p-8" : "object-cover"}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Icon className="h-16 w-16 text-paper/85" />
                        </div>
                      )}
                      {i === 0 && (
                        <span className="hairline absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-[10px] font-semibold uppercase text-plum-800">
                          {new Date().toLocaleDateString("nb-NO", { month: "short" }).replace(".", "")}
                        </span>
                      )}
                      {p.image?.credit && (
                        <a
                          href={p.image.creditHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 left-3 z-20 text-[10px] text-paper/80 hover:text-paper"
                        >
                          Foto: {p.image.credit}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 px-6 py-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">{p.latinName}</p>
                      <h3 className="card-title text-ink">{p.name}</h3>
                      <p className="text-sm text-ink-soft">{p.description}</p>
                      {href && (
                        <span className="mt-2 text-sm font-medium text-plum-700 transition-colors group-hover:text-plum-800">
                          Les mer om urten →
                        </span>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* PLANTEMEDISINENS HISTORIE — mørk, horisontal banner-kort under medisinplantene,
            bevisst mørk/liggende i motsetning til medisinplantenes lyse, stående kort. */}
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:pb-28" style={{ paddingInline: "var(--page-pad)" }}>
          <Reveal>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">Fra fortiden</p>
            <h2 className="font-display mt-2 text-2xl font-bold text-ink sm:text-3xl">
              Plantemedisinens historie
            </h2>
          </Reveal>

          <Reveal delay={80} className="mt-6">
            <Link
              href="/historie"
              className="group flex flex-col overflow-hidden rounded-[2.5rem] shadow-lg shadow-plum-950/20 sm:flex-row-reverse"
              style={{ background: "var(--plum-900)" }}
            >
              {/* aspect-[3/2] matcher bildets faktiske proporsjoner (1073×716), slik at object-cover
                  ikke beskjærer noe — boksen får nøyaktig samme fasong som bildet selv. */}
              <div className="relative aspect-[3/2] w-full sm:w-2/5 sm:shrink-0">
                <Image
                  src="/pictures/urter_historie.png"
                  alt="En gammel tinkturflaske, merket for hånd, omgitt av blomster"
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-3 px-8 py-10 sm:px-12">
                <span className="font-serif-display text-2xl italic text-paper sm:text-3xl">
                  Fra mormor til barnebarn
                </span>
                <p className="max-w-md text-paper">
                  Hvordan kjerringråd ble til en muntlig tradisjon, og hvorfor vi samler den igjen.
                </p>
                <span className="flex items-center gap-2 text-sm font-medium text-paper">
                  Les historien
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
        </section>

        {/* ARTIKLER — Tyttebær i samme fullbredde bånd-stil som Fiken-artikkelen */}
        <section id="artikler" className="relative">
          <div className="relative left-1/2 w-screen -translate-x-1/2" style={{ background: "#F9E1C1" }}>
            <Reveal
              className="mx-auto flex flex-col items-stretch py-8 sm:flex-row sm:py-12"
              style={{ maxWidth: 1280, paddingInline: "var(--page-pad)" }}
            >
              {/* Bildet — 2/3 av bredden, fast aspect-ratio, samme oppsett som Fiken */}
              <div className="w-full shrink-0 sm:w-2/3">
                <Link
                  href="/artikkel/tyttebaer"
                  className="relative block aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]"
                >
                  <Image src="/pictures/tyttebaer.png" alt="Tyttebær" fill className="object-cover" />
                </Link>
              </div>

              {/* Tekstboks — 1/3 av bredden, flush mot bildet */}
              <div
                className="flex w-full flex-col items-start justify-center gap-3 px-6 py-10 sm:w-1/3 sm:px-8"
                style={{ background: "#FBEED4" }}
              >
                <p className="font-metrophobic text-xs uppercase tracking-[0.3em]" style={{ color: "#535E3D" }}>
                  Gammelt husråd mot hoste
                </p>
                <h2 className="font-metrophobic text-2xl sm:text-3xl" style={{ color: "#535E3D" }}>
                  Tyttebær – naturens egen hostesaft
                </h2>
                <p className="font-metrophobic" style={{ color: "#535E3D" }}>
                  Derfor virker det gamle tyttebærtrikset mot hoste og sår hals, og hvordan du
                  bruker det riktig.
                </p>
                <Link
                  href="/artikkel/tyttebaer"
                  className="mt-2 inline-flex items-center gap-2 rounded-[14px] px-6 py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                  style={{ background: "#72874E" }}
                >
                  Les artikkel
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
}
