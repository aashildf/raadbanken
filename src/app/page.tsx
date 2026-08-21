"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { wilsonScore } from "@/lib/wilson";
import { MEDICINAL_PLANTS, plantOfTheMonth } from "@/lib/plants";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { castVote } from "@/lib/votes";
import { LottieVote } from "@/components/LottieVote";
import type { Problem, Remedy } from "@/lib/types";
import { IconSparkle, PLANT_ICON } from "@/components/icons";

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

  const problemById = useMemo(() => new Map(problems.map((p) => [p.id, p])), [problems]);

  const rankedAll = useMemo(
    () =>
      [...remedies].sort(
        (a, b) => wilsonScore(b.votesUp, b.totalVotes) - wilsonScore(a.votesUp, a.totalVotes)
      ),
    [remedies]
  );

  const topTen = rankedAll.slice(0, 10);

  const handleQuickVote = useCallback(
    async (remedyId: string, direction: "up" | "down") => {
      if (!uid) return;
      setVotingId(remedyId);
      try {
        await castVote(remedyId, uid, direction, "");
      } catch {
        // Stille feil her — full stemmeflyt med feilmelding og kommentarfelt finnes på rådsiden.
      } finally {
        setVotingId(null);
      }
    },
    [uid]
  );

  const featuredPlant = useMemo(() => plantOfTheMonth(), []);
  // Faste følgeplanter ved siden av månedens plante. Går nedover kandidatlisten og hopper
  // over månedens plante selv (den roterer og kan falle på en av kandidatene) slik at det
  // alltid blir nøyaktig to følgeplanter, uansett hvilken plante som er i fokus.
  const companionPlants = useMemo(() => {
    const candidateIds = ["lavendel", "rosenrot", "kamille", "ingefaer"];
    const picked: (typeof MEDICINAL_PLANTS)[number][] = [];
    for (const id of candidateIds) {
      if (picked.length >= 2) break;
      if (id === featuredPlant.id) continue;
      const plant = MEDICINAL_PLANTS.find((p) => p.id === id);
      if (plant) picked.push(plant);
    }
    return picked;
  }, [featuredPlant]);
  const spotlightPlants = useMemo(() => [featuredPlant, ...companionPlants], [featuredPlant, companionPlants]);

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

      <main>
                  {/* HERO — bakgrunn er et dekorativt full-bleed lag utenfor innholdets padding-boks,
                      derfor plain fill fremfor å følge innholdets egen paddingInline. */}
                  <section
                    className="relative flex flex-col overflow-hidden text-ink"
                    style={{
                      // Headeren er sticky (i normal flyt), så hero trenger ikke lenger
                      // kompensere for headerens høyde — bare sin egen dekorative luft.
                      paddingTop: 48,
                      paddingBottom: viewportWidth >= 640 ? 56 : 40,
                      minHeight: viewportWidth >= 640 ? "min(680px, 78vh)" : undefined,
                      justifyContent: "center",
                    }}
                  >
                    {/* Bakgrunn — dekker hele seksjonen (padding inkludert). Løvetannen i bildet sitter
                        i venstre tredjedel; utsnittet forskyves mot venstre på sm+ slik at den ikke
                        havner rett bak den høyrestilte logoen. */}
                    <Image
                      src="/bakgrunner/bg5.png"
                      alt=""
                      aria-hidden
                      fill
                      sizes="100vw"
                      className="pointer-events-none object-cover"
                      style={{ zIndex: 0, objectPosition: viewportWidth >= 640 ? "30% 42%" : "center" }}
                      priority
                    />

                    {/* Hovedinnhold: logo + tagline — sentrert på mobil, høyrestilt fra sm+ slik at
                        løvetannen til venstre i bakgrunnsbildet blir stående fritt og synlig. */}
                    <div
                      className="relative z-10 mx-auto w-full max-w-7xl"
                      style={{ paddingInline: "var(--page-pad)" }}
                    >
                      <div className="relative flex flex-col items-center sm:items-end">
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
                          <p className="mt-2 text-center text-xs uppercase tracking-[0.12em] sm:text-right" style={{ fontFamily: "var(--font-kantumruy)", color: "var(--logo-banken)" }}>
                            Et oppslagsverk for gamle husråd
                          </p>
                        </div>
                      </div>
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
              { src: "/pictures/svisker.png", bg: "#7E334A", text: "light" as const },
              { src: "/bakgrunner/honning2.png", bg: "#F3D9A8", text: "dark" as const },
            ];
            return (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {topTen.slice(0, 3).map((r, i) => {
                  const problem = problemById.get(r.problemId);
                  const { src: imgSrc, bg: cardBg, text: textTone } = TOP3_IMAGES[i];
                  const isLight = textTone === "light";
                  const isVoting = votingId === r.id;
                  return (
                    <Reveal
                      key={r.id}
                      delay={i * 60}
                      className={`flex flex-col overflow-hidden rounded-2xl shadow-lg shadow-plum-950/10 transition-transform hover:-translate-y-0.5 ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}
                      style={{ background: cardBg }}
                    >
                      {/* Bildets sideforhold er satt uavhengig av tekstblokken under, slik at
                          bildene alltid blir like høye uansett hvor lang tittelen er. Mobil: nr. 1
                          er alene i egen full-bredde rad og får derfor en bevisst bredere ramme;
                          fra sm+ sitter alle tre likestilt i samme rad og deler samme sideforhold. */}
                      <Link
                        href={`/remedy/${r.id}`}
                        className={`group relative block overflow-hidden ${i === 0 ? "aspect-[3/2]" : "aspect-square"} sm:aspect-[4/3]`}
                      >
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
                      </Link>
                      <div className="flex flex-1 flex-col justify-between gap-2 p-3 sm:p-4">
                        <Link href={`/remedy/${r.id}`}>
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
                        </Link>
                        <div className="flex flex-col gap-1.5">
                          <Link
                            href={`/remedy/${r.id}`}
                            className={`text-xs font-medium ${isLight ? "text-white/90" : "text-plum-700"}`}
                          >
                            Les mer →
                          </Link>
                          <div className="flex shrink-0 items-center gap-1">
                            <LottieVote
                              direction="up"
                              count={r.votesUp ?? 0}
                              active={false}
                              disabled={!uid || isVoting}
                              light={isLight}
                              compact
                              onClick={() => handleQuickVote(r.id, "up")}
                            />
                            <LottieVote
                              direction="down"
                              count={r.votesDown ?? 0}
                              active={false}
                              disabled={!uid || isVoting}
                              light={isLight}
                              compact
                              onClick={() => handleQuickVote(r.id, "down")}
                            />
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            );
          })()}

          {/* Nr. 4–10: kompakt liste. Rangeringstall + tittel lenker til rådet; stemmeknappene
              stemmer direkte fra forsiden og lar Wilson-rangeringen oppdatere seg live. */}
          {topTen.length > 3 && (() => {
            const RANK_ACCENTS = [
              { bg: "#7C9053", text: "light" as const },
              { bg: "#7E334A", text: "light" as const },
              { bg: "#F3D9A8", text: "dark" as const },
            ];
            return (
              <div className="mt-3 overflow-hidden rounded-2xl border border-ink/8 bg-white/40">
                {topTen.slice(3).map((r, i) => {
                  const problem = problemById.get(r.problemId);
                  const accent = RANK_ACCENTS[i % RANK_ACCENTS.length];
                  const isLight = accent.text === "light";
                  const isVoting = votingId === r.id;
                  return (
                    <Reveal
                      key={r.id}
                      delay={180 + i * 30}
                      className={`flex flex-col gap-2.5 px-4 py-3 transition-colors hover:bg-white/50 sm:flex-row sm:items-center sm:gap-3 sm:px-5 sm:py-3.5 ${
                        i > 0 ? "border-t border-ink/8" : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3 sm:flex-1">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{ background: accent.bg, color: isLight ? "#fff" : "#3D2213" }}
                        >
                          {i + 4}
                        </span>
                        <Link href={`/remedy/${r.id}`} className="group min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-plum-700">
                            {r.title}
                          </p>
                          <p className="truncate text-xs text-ink-soft">{problem?.name}</p>
                        </Link>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 pl-11 sm:pl-0">
                        <LottieVote
                          direction="up"
                          count={r.votesUp ?? 0}
                          active={false}
                          disabled={!uid || isVoting}
                          onClick={() => handleQuickVote(r.id, "up")}
                        />
                        <LottieVote
                          direction="down"
                          count={r.votesDown ?? 0}
                          active={false}
                          disabled={!uid || isVoting}
                          onClick={() => handleQuickVote(r.id, "down")}
                        />
                      </div>
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

        {/* PLANTEMEDISINENS HISTORIE — samme fullbredde bånd-stil og lyse fargepalett som
            Fiken/Tyttebær under (bildet fyller hele blokkens høyde, tekstpanelet har en
            lysere flate ved siden av). */}
        <section className="relative">
          <div className="relative left-1/2 w-screen -translate-x-1/2" style={{ background: "#F9E1C1" }}>
            <Reveal
              className="mx-auto flex flex-col items-stretch py-8 sm:flex-row-reverse sm:py-12"
              style={{ maxWidth: 1280, paddingInline: "var(--page-pad)" }}
            >
              <div className="w-full shrink-0 sm:w-2/3">
                <Link
                  href="/historie"
                  className="group relative block aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]"
                >
                  <Image
                    src="/pictures/tinktur.png"
                    alt="En gammel tinkturflaske, merket for hånd, omgitt av blomster"
                    fill
                    sizes="(max-width: 640px) 100vw, 66vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              </div>

              <div
                className="flex w-full flex-col items-start justify-center gap-3 px-6 py-10 sm:w-1/3 sm:px-8"
                style={{ background: "#FBEED4" }}
              >
                <p className="font-metrophobic text-xs uppercase tracking-[0.3em]" style={{ color: "#535E3D" }}>
                  Fra fortiden
                </p>
                <h2 className="font-serif-display text-2xl italic sm:text-3xl" style={{ color: "#535E3D" }}>
                  Fra mormor til barnebarn
                </h2>
                <p style={{ color: "#535E3D" }}>
                  Hvordan kjerringråd ble til en muntlig tradisjon, og hvorfor vi samler den igjen.
                </p>
                <Link
                  href="/historie"
                  className="mt-2 inline-flex items-center gap-2 rounded-[14px] px-6 py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                  style={{ background: "#72874E" }}
                >
                  Les historien
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ARTIKLER — Tyttebær i samme fullbredde bånd-stil som Fiken-artikkelen */}
        <section id="artikler" className="relative">
          <div className="relative left-1/2 w-screen -translate-x-1/2" style={{ background: "#F9E1C1" }}>
            <Reveal
              className="mx-auto flex flex-col items-stretch py-8 sm:flex-row sm:py-12"
              style={{ maxWidth: 1280, paddingInline: "var(--page-pad)" }}
            >
              {/* Bildet — 2/3 av bredden, samme oppsett som Fiken. tyttebar.png (1259×1006,
                  ~5:4) passer godt i denne boksen med bare mild beskjæring. */}
              <div className="w-full shrink-0 sm:w-2/3">
                <Link
                  href="/artikkel/tyttebaer"
                  className="relative block aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]"
                >
                  <Image src="/pictures/tyttebar.png" alt="Tyttebær" fill className="object-cover" />
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
