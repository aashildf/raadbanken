"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { wilsonScore } from "@/lib/wilson";
import { MEDICINAL_PLANTS, plantOfTheMonth } from "@/lib/plants";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { castVote } from "@/lib/votes";
import { setSaved } from "@/lib/saves";
import { RemedyPreviewModal } from "@/components/RemedyPreviewModal";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import type { Problem, Remedy } from "@/lib/types";
import { GRAIN_BG } from "@/components/GrainOverlay";
import {
  IconArrowDown,
  IconArrowUp,
  IconBulb,
  IconChevronDown,
  IconClover,
  IconHeart,
  IconHouse,
  IconMore,
  IconPlus,
  IconPot,
  IconSparkle,
  IconSprig,
  IconFlowerHerb,
  IconWrench,
  PLANT_ICON,
} from "@/components/icons";

// Bokeh-orbs over hero-bildet — uskarpe lyspunkt som sakte faller/driver
// nedover, som lys som slipper gjennom trær med lav skarphetsdybde. Kun
// varme, naturlige toner fra selve fotoet (kremhvit sollys, gult/gyllent lys,
// dempet løvgrønt) — den forrige versjonen brukte hele rangeringslistens
// regnbue-palett (gull, terrakotta, salvie, blågrå, malve …) og leste som et
// juletre i stedet for lys i skogen. Negative delay-verdier gjør at de
// allerede er midt i syklusen ved innlasting (spredt utover bildet fra første
// sekund), og ulik duration/blur/størrelse gir en svak parallax.
const BOKEH_COLORS = ["#F5EFE2", "#D9B25C", "#8FA876"];
const BOKEH_ORBS = [
  { left: "8%",  size: 30, color: BOKEH_COLORS[0], blur: 9,  opacity: 0.45, duration: 32, delay: -4,  dx: 22,  dy: 720 },
  { left: "18%", size: 52, color: BOKEH_COLORS[2], blur: 16, opacity: 0.4,  duration: 44, delay: -18, dx: -18, dy: 760 },
  { left: "27%", size: 22, color: BOKEH_COLORS[1], blur: 9,  opacity: 0.5,  duration: 26, delay: -9,  dx: 16,  dy: 680 },
  { left: "38%", size: 64, color: BOKEH_COLORS[0], blur: 16, opacity: 0.35, duration: 48, delay: -30, dx: -26, dy: 800 },
  { left: "49%", size: 34, color: BOKEH_COLORS[2], blur: 9,  opacity: 0.45, duration: 30, delay: -2,  dx: 20,  dy: 700 },
  { left: "60%", size: 46, color: BOKEH_COLORS[1], blur: 16, opacity: 0.4,  duration: 38, delay: -21, dx: -14, dy: 740 },
  { left: "70%", size: 26, color: BOKEH_COLORS[0], blur: 9,  opacity: 0.5,  duration: 24, delay: -11, dx: 18,  dy: 660 },
  { left: "80%", size: 58, color: BOKEH_COLORS[2], blur: 16, opacity: 0.35, duration: 46, delay: -36, dx: -22, dy: 780 },
  { left: "90%", size: 38, color: BOKEH_COLORS[1], blur: 9,  opacity: 0.45, duration: 34, delay: -14, dx: 24,  dy: 720 },
  { left: "95%", size: 76, color: BOKEH_COLORS[0], blur: 16, opacity: 0.35, duration: 42, delay: -27, dx: -20, dy: 760 },
];

// "Hva finner du i Rådbanken?"-stripen rett under hero. Egen, litt bredere
// markedsføringstaksonomi enn TOP_CATEGORIES (som bare har fem kategorier) —
// denne er en visuell smakebit, ikke reell navigasjon, så noen punkter peker
// til nærmeste eksisterende side i stedet for en dedikert kategori som ennå
// ikke finnes (Mat, Reparasjon).
const CATEGORY_STRIP = [
  { label: "Kjerringråd", href: "/alle", Icon: IconSprig },
  { label: "Lifehacks", href: "/#artikler", Icon: IconBulb },
  { label: "Kultur", href: "/historie", Icon: IconClover },
  { label: "Planter og urter", href: "/medisinplanter", Icon: IconFlowerHerb },
  { label: "Mat", href: "/alle", Icon: IconPot },
  { label: "Reparasjon", href: "/alle", Icon: IconWrench },
  { label: "Hus og hjem", href: "/kategori/husoghjem", Icon: IconHouse },
  { label: "Helse og velvære", href: "/kategori/helse", Icon: IconHeart },
] as const;

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
  const uid = useAnonAuth();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [openRemedyId, setOpenRemedyId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  // Hvilken retning den innloggede brukeren har stemt per råd — manglet helt
  // før (bare skrive-siden fantes), så opp/ned-pilene i "Folkets favoritter"
  // kunne aldri vise hvilken man hadde trykket på. Samme mønster som
  // savedIds/pendingSaves under.
  const [userVotes, setUserVotes] = useState<Map<string, "up" | "down">>(new Map());
  const [pendingVotes, setPendingVotes] = useState<Map<string, "up" | "down">>(new Map());
  // Optimistiske overstyringer, holdt helt separat fra savedIds (som
  // onSnapshot under erstatter i sin helhet ved hver endring). Da den første
  // versjonen av dette skrev direkte inn/ut av samme Set som onSnapshot
  // erstatter, kunne en pågående optimistisk endring på ett råd bli overskrevet
  // av en snapshot som trigget av et ANNET råd rett før skrivingen dens var
  // bekreftet — synlig som at bare noen hjerter (og et annet sett hver gang)
  // faktisk skiftet farge. Rendring slår sammen de to: en pending-overstyring
  // vinner til den fjernes (skriving ferdig, uansett utfall).
  const [pendingSaves, setPendingSaves] = useState<Map<string, boolean>>(new Map());
  const [savingId, setSavingId] = useState<string | null>(null);

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

  // Hvilke råd den innloggede (anonyme) brukeren har lagret i "mine lagrede
  // råd" — hjertet i rangeringslisten under. Egen collection ("saves"), ett
  // dokument per råd+bruker, samme mønster som "votes".
  useEffect(() => {
    if (!uid) {
      setSavedIds(new Set());
      return;
    }
    const q = query(collection(db, "saves"), where("userId", "==", uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setSavedIds(new Set(snap.docs.map((d) => d.data().remedyId as string)));
      },
      () => {
        // F.eks. manglende Firestore-regler ennå ikke utrullet — stille feil,
        // hjertene viser bare uaktivert tilstand i stedet for å krasje.
      }
    );
    return unsub;
  }, [uid]);

  // Rydder bort en optimistisk overstyring først når de bekreftede dataene
  // fra Firestore faktisk har tatt den igjen — ikke med én gang skrive-
  // kallet returnerer. Det siste kan skje FØR onSnapshot-oppdateringen for
  // akkurat den skrivingen har rukket fram, og å fjerne overstyringen da gir
  // et glimt tilbake til feil farge (synlig som at hjertet fylles et
  // øyeblikk og så forsvinner igjen) før/om savedIds noen gang tar den igjen.
  useEffect(() => {
    setPendingSaves((prev) => {
      if (prev.size === 0) return prev;
      let changed = false;
      const next = new Map(prev);
      for (const [id, val] of prev) {
        if (savedIds.has(id) === val) {
          next.delete(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [savedIds]);

  // Egen brukers stemmer — samme "saves"-mønster, og "votes" har allerede
  // åpen lesetilgang (allow read: if true) i firestore.rules, så ingen
  // tilsvarende regel-fallgruve her.
  useEffect(() => {
    if (!uid) {
      setUserVotes(new Map());
      return;
    }
    const q = query(collection(db, "votes"), where("userId", "==", uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setUserVotes(new Map(snap.docs.map((d) => [d.data().remedyId as string, d.data().voteType as "up" | "down"])));
      },
      () => {
        // Stille feil, på linje med saves — pilene viser bare uaktivert
        // tilstand i stedet for å krasje.
      }
    );
    return unsub;
  }, [uid]);

  // Samme reconciliation-mønster som pendingSaves — se kommentaren der.
  useEffect(() => {
    setPendingVotes((prev) => {
      if (prev.size === 0) return prev;
      let changed = false;
      const next = new Map(prev);
      for (const [id, val] of prev) {
        if (userVotes.get(id) === val) {
          next.delete(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [userVotes]);

  const problemById = useMemo(() => new Map(problems.map((p) => [p.id, p])), [problems]);

  const rankedAll = useMemo(
    () =>
      [...remedies].sort(
        (a, b) => wilsonScore(b.votesUp, b.totalVotes) - wilsonScore(a.votesUp, a.totalVotes)
      ),
    [remedies]
  );

  const topTen = rankedAll.slice(0, 10);

  const openIndex = openRemedyId ? topTen.findIndex((r) => r.id === openRemedyId) : -1;
  const openRemedy = openIndex >= 0 ? topTen[openIndex] : null;

  const handleQuickVote = useCallback(
    async (remedyId: string, direction: "up" | "down") => {
      if (!uid) return;
      const previousVote = pendingVotes.has(remedyId) ? pendingVotes.get(remedyId) : userVotes.get(remedyId);
      setVotingId(remedyId);
      setPendingVotes((prev) => new Map(prev).set(remedyId, direction));
      try {
        try {
          await castVote(remedyId, uid, direction, "");
        } catch {
          await castVote(remedyId, uid, direction, "");
        }
      } catch {
        // Begge forsøk feilet reelt — rull tilbake til den forrige stemmen
        // (eller ingen) med én gang.
        setPendingVotes((prev) => {
          const next = new Map(prev);
          if (previousVote) next.set(remedyId, previousVote);
          else next.delete(remedyId);
          return next;
        });
      } finally {
        setVotingId(null);
      }
    },
    [uid, userVotes, pendingVotes]
  );

  const handleToggleSaved = useCallback(
    async (remedyId: string) => {
      if (!uid) return;
      const current = pendingSaves.has(remedyId) ? pendingSaves.get(remedyId)! : savedIds.has(remedyId);
      const willSave = !current;
      setSavingId(remedyId);
      // Optimistisk UI: speiler endringen med én gang i stedet for å vente på
      // Firestore-rundturen + onSnapshot — uten det føltes hjertet dødt/
      // uresponsivt ved selv en liten forsinkelse. Egen pendingSaves-stat i
      // stedet for å skrive rett i savedIds (se kommentar der). Ett nytt
      // forsøk dekker et kortvarig kappløp rett etter en fersk anonym
      // innlogging, før Firestore-SDKen har fått med seg det ferske
      // ID-tokenet på første forespørsel (sett i feilsøking 2026-10-01).
      setPendingSaves((prev) => new Map(prev).set(remedyId, willSave));
      try {
        try {
          await setSaved(remedyId, uid, willSave);
          // Lyktes — IKKE fjern overstyringen her. Reconciliation-effekten
          // over gjør det, først når savedIds fra Firestore faktisk har
          // tatt den igjen.
        } catch {
          await setSaved(remedyId, uid, willSave);
        }
      } catch {
        // Begge forsøk feilet reelt — ingenting ble skrevet, rull tilbake
        // med én gang i stedet for å vente på noe fra serveren som aldri
        // kommer.
        setPendingSaves((prev) => {
          const next = new Map(prev);
          next.delete(remedyId);
          return next;
        });
      } finally {
        setSavingId(null);
      }
    },
    [uid, savedIds, pendingSaves]
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
    // Headeren er nå en solid, fast farget bjelke (se SiteHeader.tsx) som
    // ligger i normal flyt — heroen starter rett under den som en vanlig
    // side, ikke bak den lenger (det var bare relevant da headeren var
    // gjennomsiktig og lå oppå bildet).
    <div
      className="relative min-h-full"
      style={{ background: "var(--page-bg)" }}
    >

      {/* Store dandelion-bakgrunnsbilder fjernet på forsiden — papirkornet
          (GrainOverlay + det ekstra laget på hero-fotoet) er teksturen nå. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" style={{ zIndex: 0 }}>
        {/* Subtile radiale gradients — varmt sollys */}
        <div className="absolute" style={{ top: "5%",  right: "-10%", width: 900, height: 700,  background: "radial-gradient(ellipse, rgba(255,200,100,0.06) 0%, transparent 70%)" }} />
        <div className="absolute" style={{ top: "40%", left:  "-5%", width: 800, height: 600,  background: "radial-gradient(ellipse, rgba(255,180,80,0.05)  0%, transparent 70%)" }} />
        <div className="absolute" style={{ top: "70%", right: "0%",  width: 700, height: 600,  background: "radial-gradient(ellipse, rgba(255,210,120,0.05) 0%, transparent 70%)" }} />
        <div className="absolute" style={{ top: "90%", left:  "20%", width: 1000, height: 500, background: "radial-gradient(ellipse, rgba(255,190,90,0.04)  0%, transparent 70%)" }} />
      </div>

      <main>
                  {/* HERO — to takter i stedet for én tett klynge oppå bildet: bildet bærer
                      bare logoen (det ene høylytte øyeblikket), tagline/kicker/CTA følger rolig
                      rett under, i sidens vanlige bakgrunn — ikke oppå fotoet lenger, så det
                      trengs ikke noe gradient-triks for lesbarhet der heller. */}
                  <section className="relative w-full overflow-hidden text-ink">
                    <div className="relative aspect-3/5 w-full overflow-hidden sm:aspect-auto sm:min-h-[clamp(500px,78vh,780px)]">
                      <Image
                        src="/pictures/heroimage2.png"
                        alt="Mor og datter går gjennom skogen med kurver fulle av sanket grønt"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        style={{ objectPosition: "18% 50%" }}
                        priority
                      />
                      {/* Toningslag fjernet — selv på 0.3 dekket den fortsatt for mye av
                          fotoet (mor/datter, trærne). Teksten lener seg nå bare på
                          text-shadow-haloen under (stor blur, nesten ingen offset) for
                          lesbarhet, som ikke legger noe som helst oppå selve bildet. */}
                      {/* Den lyse gløden som lå her var fra da logoen satt nederst til høyre
                          (før masthead-en ble midtstilt) — ved 70%/78% havnet den rett bak
                          taglinen i stedet, og leste som et rart hvitt felt nederst i
                          bildet. Fjernet: logoen har sin egen drop-shadow og teksten sin
                          egen text-shadow-halo, ingen bakgrunnsoppklaring trengs lenger. */}
                      {/* Papirkorn på selve fotoet — nøyaktig samme lag som i navbaren
                          (SiteHeader: GRAIN_BG, opasitet 0.4, vanlig blend), så foto og
                          navbar leser som samme papir. Det globale kornet bruker multiply
                          og forsvinner på mørke flater, derfor trengs dette laget her. */}
                      <div
                        className="pointer-events-none absolute inset-0 z-[4]"
                        aria-hidden="true"
                        style={{ backgroundImage: GRAIN_BG, opacity: 0.4 }}
                      />
                      {/* Mørkt radialt vignett — rammer inn bildet (mørkere i hjørnene,
                          lyst i midten der mor og datter går) og legger et ekstra mørkt
                          felt nederst og øverst der teksten/navbaren møter fotoet, for
                          lesbarhet uten at det legger seg som en flat, jevn toning over
                          hele bildet. */}
                      <div
                        className="pointer-events-none absolute inset-0 z-[5]"
                        aria-hidden="true"
                        style={{
                          background:
                            "radial-gradient(ellipse 85% 70% at 50% 42%, transparent 35%, rgba(10,14,8,0.55) 100%), linear-gradient(to bottom, rgba(8,12,6,0.32) 0%, transparent 22%), linear-gradient(to top, rgba(8,12,6,0.45) 0%, transparent 38%)",
                        }}
                      />
                      {/* Bokeh-orbs — usynlig for klikk, ligger oppå fotoet/kornet/gløden
                          men under masthead-teksten (z-[6] < z-10). */}
                      <div className="pointer-events-none absolute inset-0 z-[6] overflow-hidden" aria-hidden="true">
                        {BOKEH_ORBS.map((orb, i) => (
                          <div
                            key={i}
                            data-orb=""
                            className="absolute rounded-full"
                            style={
                              {
                                left: orb.left,
                                top: "-8%",
                                width: orb.size,
                                height: orb.size,
                                background: orb.color,
                                filter: `blur(${orb.blur}px)`,
                                mixBlendMode: "screen",
                                animation: `bokeh-fall ${orb.duration}s ${orb.delay}s linear infinite`,
                                "--orb-dx": `${orb.dx}px`,
                                "--orb-dy": `${orb.dy}px`,
                                "--orb-o": Math.min(orb.opacity * 1.8, 0.8),
                              } as React.CSSProperties
                            }
                          />
                        ))}
                      </div>
                      {/* Masthead — den ferdigtegnede logo-lockupen (bue + løvetann +
                          kursiv "Rådbanken", public/logo/radbanken-logo.png) i stedet for
                          satt tekst, en stor kursiv overskrift som bærer selve budskapet,
                          en mindre brødtekst under, og to CTA-er. Varm papirhvit
                          (#f5efeb, ikke ren #fff) + en myk, stor text-shadow for
                          lesbarhet mot fotoet — arver til alt under uten å settes flere
                          steder (knappene nuller den ut selv, se style der). */}
                      <div
                        className="absolute inset-0 z-10 flex flex-col items-center px-6 pb-10 pt-[9vh] text-center sm:pt-[8vh]"
                        style={{ color: "#f5efeb", textShadow: "0 1px 2px rgba(0,0,0,0.55), 0 2px 22px rgba(0,0,0,0.6)" }}
                      >
                        <Image
                          src="/logo/radbanken-logo-trim.png"
                          alt="Rådbanken"
                          width={424}
                          height={209}
                          priority
                          className="h-auto w-[240px] sm:w-[320px] lg:w-[380px]"
                          style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.45))" }}
                        />
                        {/* Bevisst enkel/rolig her (vanlig sans, ikke font-serif-display) —
                            en pyntet serif-overskrift rett under den kursive, "høylytte"
                            logoen gled i ett med den; ren, enkel sans skiller de to
                            momentene fra hverandre i stedet for å konkurrere. */}
                        <p
                          className="font-sans mt-6 max-w-[24ch] text-balance text-lg sm:max-w-xl sm:text-2xl"
                          style={{ fontWeight: 500, letterSpacing: "0.01em" }}
                        >
                          Kunnskap som går i arv, tilpasset livet vi lever i dag.
                        </p>
                        <p
                          className="font-sans mt-4 max-w-[32ch] text-sm leading-relaxed sm:max-w-md sm:text-base"
                          style={{ color: "rgba(245,239,235,0.85)" }}
                        >
                          Et levende arkiv for kjerringråd og gode tips, der brukerne deler sine
                          erfaringer og stemmer frem det som fungerer.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                          <PrimaryButton href="/alle" className="h-11 w-[190px]" style={{ textShadow: "none" }}>
                            Utforsk råd
                            <span aria-hidden>→</span>
                          </PrimaryButton>
                          <SecondaryButton
                            href="/del-rad"
                            tone="dark"
                            className="h-11 w-[190px]"
                            style={{ textShadow: "none" }}
                          >
                            Del et råd
                            <IconPlus className="h-3.5 w-3.5" />
                          </SecondaryButton>
                        </div>
                        {/* Scroll-hint — bare desktop (mobil er trangere, og heroen
                            følges uansett rett av kategori-stripen). Diskré, myk
                            hopp-animasjon (soft-bounce, se globals.css), av med
                            prefers-reduced-motion som resten av sidens bevegelse.
                            mt-auto skyver den til bunnen av masthead-en uansett hvor
                            høyt resten av innholdet flytter seg. */}
                        <div className="pointer-events-none mt-auto hidden flex-col items-center gap-2 pt-6 sm:flex" aria-hidden="true">
                          <span className="h-10 w-px" style={{ background: "rgba(245,239,235,0.5)" }} />
                          <IconChevronDown className="soft-bounce h-4 w-4 text-[#f5efeb]/70" />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* HVA FINNER DU I RÅDBANKEN — kategori-stripe rett under hero, i sidens
                      lyse papirfarge. Kicker + linje, så én rad med ikon+etikett som
                      teaser for bredden i innholdet (ikke reell mega-meny, se
                      CATEGORY_STRIP-kommentaren over). To duse løvetann-silhuetter
                      (samme motiv som kategori-sidene) markerer hjørnet uten å bli
                      enda et "kort". */}
                  <section className="relative overflow-hidden" style={{ background: "var(--paper)" }}>
                    <Image
                      src="/ikoner/dandelion_shadow.png"
                      alt=""
                      aria-hidden
                      width={700}
                      height={700}
                      className="pointer-events-none absolute -right-16 -top-10 hidden select-none sm:block"
                      style={{ width: 220, height: "auto", opacity: 0.35 }}
                    />
                    <Image
                      src="/ikoner/dandelion_shadow.png"
                      alt=""
                      aria-hidden
                      width={700}
                      height={700}
                      className="pointer-events-none absolute -right-6 bottom-0 hidden select-none md:block"
                      style={{ width: 340, height: "auto", opacity: 0.22 }}
                    />
                    {/* Ingen --content-max-cap her, med vilje — denne raden skal strekke
                        seg helt til samme kant som navbaren (bare --page-pad, som
                        SiteHeader sin indre rad), ikke stoppe smalere på brede skjermer
                        slik resten av sidens innholdsseksjoner gjør. */}
                    <div className="relative py-7 sm:py-9" style={{ paddingInline: "var(--page-pad)" }}>
                      <div className="flex items-center gap-6">
                        <p
                          className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em]"
                          style={{ color: "var(--ink)" }}
                        >
                          Hva finner du i Rådbanken?
                        </p>
                        <span aria-hidden="true" className="h-px flex-1" style={{ background: "rgba(44,35,46,0.15)" }} />
                      </div>
                      <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-5 lg:flex lg:flex-wrap lg:justify-between">
                        {CATEGORY_STRIP.map(({ label, href, Icon }) => (
                          <Link
                            key={label}
                            href={href}
                            className="group flex flex-col items-center gap-3 text-center transition-opacity hover:opacity-70"
                          >
                            <Icon className="h-7 w-7 text-ink" />
                            <span
                              className="text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] sm:text-[11px]"
                              style={{ color: "var(--ink-soft)" }}
                            >
                              {label}
                            </span>
                          </Link>
                        ))}
                        <Link
                          href="/alle"
                          className="group flex flex-col items-center gap-3 text-center transition-opacity hover:opacity-70"
                        >
                          <IconMore className="h-7 w-7 text-gold" />
                          <span
                            className="text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] sm:text-[11px]"
                            style={{ color: "var(--ink-soft)" }}
                          >
                            Og mer
                          </span>
                        </Link>
                      </div>
                    </div>
                  </section>

        {/* FOLKETS FAVORITTER — rett under hero. Ti like rader (ikke lenger ett
            stort bildekort for #1 + en smal tekstliste under) — nummer, tittel,
            en fremgangslinje for andel positive stemmer, og pil opp/ned + lagre
            til høyre, etter referansebildet. Bruker hele bredden på seksjonen
            (ingen indre max-w-3xl lenger — det var det som gjorde raden smal). */}
        <section className="relative z-10">
          <div className="mx-auto max-w-[var(--content-max)] px-5 pb-10 pt-10 sm:py-14" style={{ paddingInline: "var(--page-pad)" }}>
            <Reveal>
              <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">Rangering</p>
              <h2 className="font-serif-display mt-2 text-2xl text-ink sm:text-3xl">Folkets favoritter</h2>
              <p className="mt-2 text-sm text-ink-soft">De 10 mest pålitelige kjerringrådene, rangert etter stemmer.</p>
            </Reveal>

            {topTen.length === 0 && (
              <p className="hairline mt-6 rounded-xl px-5 py-5 text-sm text-ink-soft">
                Ingen råd med stemmer ennå.
              </p>
            )}

            {topTen.length > 0 && (
              <div className="mt-8 flex flex-col divide-y divide-ink/10 border-t border-b border-ink/10">
                {topTen.map((r, i) => {
                  const problem = problemById.get(r.problemId);
                  const isVoting = votingId === r.id;
                  const isSaving = savingId === r.id;
                  const isSaved = pendingSaves.has(r.id) ? pendingSaves.get(r.id)! : savedIds.has(r.id);
                  const myVote = pendingVotes.has(r.id) ? pendingVotes.get(r.id) : userVotes.get(r.id);
                  return (
                    <Reveal
                      key={r.id}
                      delay={i * 25}
                      className="group/row flex items-center gap-3 px-3 py-5 -mx-3 transition-colors hover:bg-[rgba(111,143,108,0.14)] sm:gap-6"
                    >
                      <span
                        className="font-serif-display w-9 shrink-0 text-lg sm:text-xl"
                        style={{ color: "var(--gold)" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <button onClick={() => setOpenRemedyId(r.id)} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-base font-semibold text-ink sm:text-lg">
                          {r.title}
                        </p>
                        <p className="truncate text-xs text-ink-soft">{problem?.name}</p>
                      </button>
                      <div className="hidden h-1.5 w-32 shrink-0 overflow-hidden rounded-full bg-ink/10 sm:block lg:w-44">
                        <div
                          className="h-full rounded-full bg-sage"
                          style={{ width: `${r.successRate ?? 0}%` }}
                        />
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => handleQuickVote(r.id, "up")}
                          disabled={!uid || isVoting}
                          aria-label="Fungerte"
                          aria-pressed={myVote === "up"}
                          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                            myVote === "up" ? "text-[#f5efeb]" : "text-ink hover:bg-[#E1B08C] hover:text-[#2c232e]"
                          }`}
                          style={
                            myVote === "up"
                              ? { background: "rgba(79,107,74,0.55)", border: "1px solid rgba(79,107,74,0.55)" }
                              : { border: "1px solid rgba(44,35,46,0.22)" }
                          }
                        >
                          <IconArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleQuickVote(r.id, "down")}
                          disabled={!uid || isVoting}
                          aria-label="Fungerte ikke"
                          aria-pressed={myVote === "down"}
                          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                            myVote === "down" ? "text-[#2c232e]" : "text-ink hover:bg-[#E1B08C] hover:text-[#2c232e]"
                          }`}
                          style={
                            // Samme aksentfarge som hjertet (ikke rust/rød) — rødt leste
                            // som en advarsel her, ikke som "stemt ned".
                            myVote === "down"
                              ? { background: "rgba(225,176,140,0.82)", border: "1px solid rgba(225,176,140,0.82)" }
                              : { border: "1px solid rgba(44,35,46,0.22)" }
                          }
                        >
                          <IconArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleSaved(r.id)}
                          disabled={!uid || isSaving}
                          aria-label={isSaved ? "Fjern fra mine lagrede råd" : "Lagre i mine lagrede råd"}
                          aria-pressed={isSaved}
                          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#E1B08C] hover:text-[#2c232e] disabled:opacity-40 ${
                            isSaved ? "text-[#E1B08C]" : "text-ink"
                          }`}
                          style={{ border: "1px solid rgba(44,35,46,0.22)" }}
                        >
                          {/* Kanten på selve rundingen er uendret (samme falmede grense
                              som ellers) — det mørke "klikket"-uttrykket skal ligge på
                              hjertet selv, ikke som en ring rundt hele knappen. stroke
                              tvinges til ink uavhengig av fyllfargen, slik den allerede
                              har når hjertet ikke er lagret (fill none, stroke ink). */}
                          <IconHeart
                            className="h-3.5 w-3.5"
                            filled={isSaved}
                            style={isSaved ? { stroke: "var(--ink-soft)" } : undefined}
                          />
                        </button>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FIKEN — fremhevet artikkel, rett under hero */}
        <section className="relative">
          <Reveal
            className="mx-auto flex flex-col items-stretch py-8 sm:flex-row sm:py-12"
            style={{ maxWidth: "var(--content-max)", paddingInline: "var(--page-pad)" }}
          >
            {/* Bildet — 2/3 av bredden, fast aspect-ratio (ingen stretch-avhengig prosenthøyde) */}
            <div className="relative w-full shrink-0 sm:w-2/3">
              <Link
                href="/artikkel/fiken"
                className="relative block aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]"
              >
                <Image
                  src="/pictures/menupictures/fiken_pexels-adriannacalvo-23384641.jpg"
                  alt="Ferske fiken, hele og oppskåret"
                  fill
                  className="object-cover"
                />
              </Link>
              <a
                href="https://www.pexels.com/photo/figs-in-white-bowl-23384641/"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 left-3 z-10 text-[10px] text-paper/80 hover:text-paper"
              >
                Foto: Adrianna CA / Pexels
              </a>
            </div>

            {/* Tekstboks — 1/3 av bredden, flush mot bildet, ingen mellomrom */}
            <div className="flex w-full flex-col items-start justify-center gap-3 px-6 py-10 sm:w-1/3 sm:px-8">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
                Frukt med lange tradisjoner
              </p>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">
                Fiken: en liten frukt med store helsefordeler
              </h2>
              <p className="font-display text-ink-soft">
                Derfor er den søte frukten godt for fordøyelsen, hjertehelsen og skjelettet.
              </p>
              <PrimaryButton href="/artikkel/fiken" className="mt-2">
                Les artikkel
                <span aria-hidden>→</span>
              </PrimaryButton>
            </div>
          </Reveal>
        </section>

        {/* I FOKUS: MEDISINPLANTER — månedens plante som redaksjonell hovedsak (samme
            bilde+tekst-mønster som Fiken-seksjonen over), de to følgeplantene som en
            lettere liste ved siden av — i stedet for tre jevnstore kort. */}
        <section className="mx-auto max-w-[var(--content-max)] px-5 pb-16 sm:pb-20" style={{ paddingInline: "var(--page-pad)" }}>
          <Reveal>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">I fokus</p>
            <h2 className="font-display mt-2 text-2xl font-bold text-ink sm:text-3xl">
              <Link href="/medisinplanter" className="hover:text-plum-700">
                Medisinplanter
              </Link>
            </h2>
          </Reveal>

          {(() => {
            const [featured, ...companions] = spotlightPlants;
            const FeaturedIcon = PLANT_ICON[featured.shape];
            const featuredHref = featured.sections ? `/plante/${featured.id}` : null;
            return (
              <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
                <Reveal className="group relative lg:w-3/5">
                  {featuredHref && (
                    <Link href={featuredHref} className="absolute inset-0 z-10" aria-label={`Les mer om ${featured.name}`} />
                  )}
                  <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9]" style={{ background: featured.bg }}>
                    {featured.image ? (
                      <Image
                        src={featured.image.src}
                        alt={featured.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className={`${featured.image.fit === "contain" ? "object-contain p-8" : "object-cover"} transition-transform duration-500 group-hover:scale-105`}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FeaturedIcon className="h-20 w-20 text-paper/85" />
                      </div>
                    )}
                    <span className="hairline absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-[10px] font-semibold uppercase text-plum-800">
                      {new Date().toLocaleDateString("nb-NO", { month: "short" }).replace(".", "")}
                    </span>
                    {featured.image?.credit && (
                      <a
                        href={featured.image.creditHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 left-3 z-20 text-[10px] text-paper/80 hover:text-paper"
                      >
                        Foto: {featured.image.credit}
                      </a>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col gap-1.5">
                    <p className="text-xs uppercase tracking-[0.25em] text-ink-soft">{featured.latinName}</p>
                    <h3 className="card-title text-ink">{featured.name}</h3>
                    <p className="text-sm text-ink-soft">{featured.description}</p>
                    {featuredHref && (
                      <span className="mt-1 text-sm font-medium text-plum-700 transition-colors group-hover:text-plum-800">
                        Les mer om urten →
                      </span>
                    )}
                  </div>
                </Reveal>

                <div className="flex flex-col gap-6 lg:w-2/5 lg:border-l lg:border-ink/10 lg:pl-10">
                  {companions.map((p, i) => {
                    const href = p.sections ? `/plante/${p.id}` : null;
                    return (
                      <Reveal key={p.id} delay={(i + 1) * 60} className="group relative flex gap-4">
                        {href && (
                          <Link href={href} className="absolute inset-0 z-10" aria-label={`Les mer om ${p.name}`} />
                        )}
                        <div className="flex flex-col justify-center gap-1">
                          <p className="text-xs uppercase tracking-[0.25em] text-ink-soft">{p.latinName}</p>
                          <h3 className="font-display text-lg text-ink">{p.name}</h3>
                          <p className="line-clamp-2 text-sm text-ink-soft">{p.description}</p>
                          {href && (
                            <span className="mt-0.5 text-sm font-medium text-plum-700 transition-colors group-hover:text-plum-800">
                              Les mer →
                            </span>
                          )}
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </section>

        {/* PLANTEMEDISINENS HISTORIE — bildet speilvendt (til høyre) for variasjon. */}
        <section className="relative">
          <Reveal
            className="mx-auto flex flex-col items-stretch py-8 sm:flex-row-reverse sm:py-12"
            style={{ maxWidth: "var(--content-max)", paddingInline: "var(--page-pad)" }}
          >
            <div className="w-full shrink-0 sm:w-2/3">
              <Link
                href="/historie"
                className="group relative block aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]"
              >
                <Image
                  src="/pictures/tinktur.jpg"
                  alt="En gammel tinkturflaske, merket for hånd, omgitt av blomster"
                  fill
                  sizes="(max-width: 640px) 100vw, 66vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            </div>

            <div className="flex w-full flex-col items-start justify-center gap-3 px-6 py-10 sm:w-1/3 sm:px-8">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
                Fra fortiden
              </p>
              <h2 className="font-serif-display text-2xl italic text-ink sm:text-3xl">
                Fra mormor til barnebarn
              </h2>
              <p className="text-ink-soft">
                Hvordan kjerringråd ble til en muntlig tradisjon, og hvorfor vi samler den igjen.
              </p>
              <PrimaryButton href="/historie" className="mt-2">
                Les historien
                <span aria-hidden>→</span>
              </PrimaryButton>
            </div>
          </Reveal>
        </section>

        {/* ARTIKLER — Tyttebær, samme oppsett som Fiken-artikkelen */}
        <section id="artikler" className="relative">
          <Reveal
            className="mx-auto flex flex-col items-stretch py-8 sm:flex-row sm:py-12"
            style={{ maxWidth: "var(--content-max)", paddingInline: "var(--page-pad)" }}
          >
            {/* Bildet — 2/3 av bredden, samme oppsett som Fiken. */}
            <div className="relative w-full shrink-0 sm:w-2/3">
              <Link
                href="/artikkel/tyttebaer"
                className="relative block aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]"
              >
                <Image
                  src="/pictures/menupictures/tyytebaer_pexels-sandra-seitamaa-89384773-9669197.jpg"
                  alt="Tyttebær"
                  fill
                  className="object-cover"
                />
              </Link>
              <a
                href="https://www.pexels.com/photo/close-up-of-plants-and-berries-9669197/"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 left-3 z-10 text-[10px] text-paper/80 hover:text-paper"
              >
                Foto: Sandra Seitamaa / Pexels
              </a>
            </div>

            {/* Tekstboks — 1/3 av bredden, flush mot bildet */}
            <div className="flex w-full flex-col items-start justify-center gap-3 px-6 py-10 sm:w-1/3 sm:px-8">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
                Gammelt husråd mot hoste
              </p>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">
                Tyttebær: naturens egen hostesaft
              </h2>
              <p className="font-display text-ink-soft">
                Derfor virker det gamle tyttebærtrikset mot hoste og sår hals, og hvordan du
                bruker det riktig.
              </p>
              <PrimaryButton href="/artikkel/tyttebaer" className="mt-2">
                Les artikkel
                <span aria-hidden>→</span>
              </PrimaryButton>
            </div>
          </Reveal>
        </section>

        {/* SYRIN — tredje artikkel, bildet speilvendt (til høyre) for å bryte opp rytmen
            fra Fiken/Tyttebær rett over. */}
        <section className="relative">
          <Reveal
            className="mx-auto flex flex-col items-stretch py-8 sm:flex-row-reverse sm:py-12"
            style={{ maxWidth: "var(--content-max)", paddingInline: "var(--page-pad)" }}
          >
            <div className="relative w-full shrink-0 sm:w-2/3">
              <Link
                href="/artikkel/syrin"
                className="relative block aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]"
              >
                <Image
                  src="/pictures/syrin_pexels-iriser-1431192.jpg"
                  alt="Syrinklase i nærbilde"
                  fill
                  className="object-cover"
                />
              </Link>
              <a
                href="https://www.pexels.com/photo/close-up-photography-of-orchid-flowers-1431192/"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 left-3 z-10 text-[10px] text-paper/80 hover:text-paper"
              >
                Foto: Irina Iriser / Pexels
              </a>
            </div>

            <div className="flex w-full flex-col items-start justify-center gap-3 px-6 py-10 sm:w-1/3 sm:px-8">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
                Duftende prydbusk med gamle røtter
              </p>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">
                Syrin: mer enn en vakker vårduft
              </h2>
              <p className="font-display text-ink-soft">
                Blomstene er spiselige og fulle av virkestoffer som tradisjonelt er brukt mot
                uro, urolig mage og irritert hud.
              </p>
              <PrimaryButton href="/artikkel/syrin" className="mt-2">
                Les artikkel
                <span aria-hidden>→</span>
              </PrimaryButton>
            </div>
          </Reveal>
        </section>
      </main>

      <RemedyPreviewModal
        remedy={openRemedy}
        problemName={openRemedy ? problemById.get(openRemedy.problemId)?.name : undefined}
        onClose={() => setOpenRemedyId(null)}
        onVote={(direction) => openRemedy && handleQuickVote(openRemedy.id, direction)}
        voting={!!openRemedy && votingId === openRemedy.id}
        saved={
          !!openRemedy &&
          (pendingSaves.has(openRemedy.id) ? pendingSaves.get(openRemedy.id)! : savedIds.has(openRemedy.id))
        }
        onToggleSave={() => openRemedy && handleToggleSaved(openRemedy.id)}
        saving={!!openRemedy && savingId === openRemedy.id}
        onPrev={openIndex > 0 ? () => setOpenRemedyId(topTen[openIndex - 1].id) : undefined}
        onNext={openIndex >= 0 && openIndex < topTen.length - 1 ? () => setOpenRemedyId(topTen[openIndex + 1].id) : undefined}
      />
    </div>
  );
}
