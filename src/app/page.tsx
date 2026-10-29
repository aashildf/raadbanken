"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { wilsonScore } from "@/lib/wilson";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { castVote } from "@/lib/votes";
import { setSaved } from "@/lib/saves";
import { BookTips } from "@/components/BookTips";
import { PrimaryButton } from "@/components/Button";
import type { Problem, Remedy } from "@/lib/types";
import { Paper } from "@/components/Paper";
import { MEGA_CATEGORIES } from "@/lib/megaMenu";
import { TOP_CATEGORIES, subcategoryForSlug } from "@/lib/categories";
import { RavnTopList, type RavnTopItem } from "@/components/ravn/RavnTopList";
import { RavnArchive } from "@/components/ravn/RavnArchive";
import { RavnArticles } from "@/components/ravn/RavnArticles";
import { RavnHowItWorks } from "@/components/ravn/RavnHowItWorks";
import { RavnShareCta } from "@/components/ravn/RavnShareCta";
import { LeafShadow } from "@/components/LeafShadow";
import { HeroMor } from "@/components/HeroMor";
import { HeroSearch } from "@/components/HeroSearch";
import {
  IconHeart,
  IconArrowRight,
} from "@/components/icons";


// "Utforsk Rådbanken"-raden — egne ikoner og eksakte etiketter fra
// design/design_handoff_radbanken_forside/fasit/utforsk.html (ikke de delte
// Flyttet til src/lib/megaMenu.ts (MEGA_CATEGORIES) — samme data trengs nå
// også i navbarens "Utforsk"-mega-meny og mobilmenyen, ikke bare her.
const CATEGORY_STRIP = MEGA_CATEGORIES;

function Reveal({
  children,
  className,
  delay = 0,
  style,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
  id?: string;
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
      id={id}
      className={`reveal ${visible ? "is-visible" : ""} ${className ?? ""}`}
      style={{ transitionDelay: `${delay}ms`, ...style, scrollMarginTop: "var(--header-height, 96px)" }}
    >
      {children}
    </div>
  );
}

// Ordleken i forsidens intro-seksjon — "RÅD" ligger fast i midten, et ord
// bytter venstre og/eller høyre for hver RAD_STEPS-intervall. Venstre/
// høyre-fordelingen er bekreftet av Åshild (referanse-HTML-en kjørte ikke
// selv, malingsmotor manglet i eksporten).
const RAD_STEPS: { left: string; right: string }[] = [
  { left: "", right: "-LØS?" },
  { left: "BESTEMORS ", right: "" },
  { left: "", right: " FOR FORKJØLELSE" },
  { left: "NORDISKE ", right: "" },
  { left: "DER GODE ", right: " ER GRATIS" },
  { left: "", right: " FOR STORE OG SMÅ" },
  { left: "NÅR DU TRENGER GODE ", right: "" },
  { left: "", right: " DU DELER" },
  { left: "", right: "BANKEN" },
];

function RadWordplay() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % RAD_STEPS.length), 2600);
    return () => clearInterval(id);
  }, []);

  const { left, right } = RAD_STEPS[step];
  return (
    <div
      className="font-mono-rad grid w-full items-baseline"
      style={{ gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", fontSize: "clamp(17px,1.8vw,24px)", letterSpacing: "0.06em" }}
    >
      <span key={`l-${step}`} className="word-pop justify-self-end text-right" style={{ whiteSpace: "pre", color: "#6d685c" }}>
        {left}
      </span>
      <span className="px-1" style={{ color: "#111110", fontWeight: 500 }}>
        RÅD
      </span>
      <span key={`r-${step}`} className="word-pop-delay justify-self-start text-left" style={{ whiteSpace: "pre", color: "#6d685c" }}>
        {right}
      </span>
    </div>
  );
}

// "Nye trender" — tre redaksjonelt skrevne kjerringråd fra "den nye
// generasjonen" (Åshilds egen tekst, ikke ekte Firestore-data — samme
// prinsipp som den faste "Ukens utfordring"-banneren lenger opp). Ingen
// oppdiktet "aktive stemmere"-tall eller stock-bilder av late-som-brukere;
// bildene er ekte, levert av Åshild, ett per råd. Selve rådene er nå ekte
// Firestore-dokumenter (opprettet via den vanlige /del-rad-flyten, 2026-10-05)
// — remedyId kobler hvert element til sitt virkelige dokument, så
// stemmetall/hjerte blir reelle i stedet for oppdiktet.
const TRENDING_ITEMS = [
  {
    remedyId: "QtF1kSGS9f1IiU1I7VLY",
    image: "/pictures/menupictures/karsk.png",
    label: "Myntknepet",
    badge: "NYTT RÅD INNSENDT 💌",
    title: "Myntknepet for perfekt karsk",
    quote:
      "Legg en mynt i koppen, hell på litt kaffe, hell på hjemkok til du ser mynten igjen – perfekt.",
    handle: "@kaffekrise",
  },
  {
    remedyId: "IZO3lmf7I1B57ILbWJYN",
    image: "/pictures/menupictures/furudamp.png",
    label: "Furudamp for glass-skin",
    badge: null,
    title: "Furudamp for glass-skin",
    quote: "Hvorfor kjøpe dyre hudprodukter når skogen allerede har alt?",
    handle: "@skogsbarnet",
  },
  {
    remedyId: "LRwUzHYZDncPQnwdVBYX",
    image: "/pictures/menupictures/skogslatte.png",
    label: "Skogslatte",
    badge: null,
    title: "Matcha, men gjør det norsk",
    quote: "Dropp matcha. Visp litt pulverkaffe med bjørkesirup og kall det skogslatte.",
    handle: "@nordicgirl",
  },
] as const;

export default function HomePage() {
  const uid = useAnonAuth();


  const [problems, setProblems] = useState<Problem[]>([]);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [votingId, setVotingId] = useState<string | null>(null);
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


  // RAVN-seksjonene (design_handoff_ravn_trinnvis) — samme rankedAll som
  // resten av forsiden (Wilson-score, altså folkets dom vektet for hvor
  // mange som har stemt), bare råd som har fått minst én stemme.
  const categoryOf = useCallback(
    (problemId: string) => {
      const problem = problemById.get(problemId);
      const sub = problem ? subcategoryForSlug(problem.slug) : undefined;
      const top = sub ? TOP_CATEGORIES.find((c) => c.id === sub.topCategoryId) : undefined;
      return { id: top?.id ?? null, label: [top?.name, problem?.name].filter(Boolean).join(" · ") };
    },
    [problemById]
  );

  const ravnTopItems = useMemo<RavnTopItem[]>(
    () =>
      rankedAll
        .filter((r) => r.totalVotes > 0)
        .slice(0, 8)
        .map((r) => {
          const cat = categoryOf(r.problemId);
          return { remedy: r, categoryId: cat.id, categoryLabel: cat.label, vote: pendingVotes.get(r.id) ?? userVotes.get(r.id) };
        }),
    [rankedAll, categoryOf, pendingVotes, userVotes]
  );

  const ravnTopics = useMemo(
    () =>
      TOP_CATEGORIES.filter((c) => c.enabled).map((c) => ({
        id: c.id,
        name: c.name,
        count: remedies.filter((r) => categoryOf(r.problemId).id === c.id).length,
      })),
    [remedies, categoryOf]
  );

  const ravnStats = useMemo(
    () => ({ remedies: remedies.length, votes: remedies.reduce((sum, r) => sum + (r.totalVotes ?? 0), 0) }),
    [remedies]
  );


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

  // Hurtig-stemming (opp/ned rett fra en liste) finnes ikke lenger på
  // forsiden etter moodboard-ombyggingen av "Toppen av visdom" — der viser vi
  // bare rangeringstall + hjerte, samme som referansebildet. Stemmeknappene
  // ligger fortsatt i forhåndsvisningsmodalen (RemedyPreviewModal under),
  // som fortsatt bruker handleQuickVote/votingId.

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
                  {/* HERO — design_handoff_radbanken_mor: søk til venstre, mor med
                      kråka til høyre (under teksten på smal skjerm). Fotoet av
                      paret, kremvasken, rådkarusell-mobilen og knappene er tatt
                      bort. Lys papirgrunn, så papirteksturen synes gjennom den
                      gjennomsiktige bakgrunnen i mor-bildet. */}
                  <section className="relative w-full overflow-hidden text-ink" style={{ background: "#faf5ea" }}>
                    <Paper id="hero" variant="light" />
                    <div className="relative z-[4] mx-auto flex max-w-[1320px] flex-col gap-12 px-5 pb-16 pt-[112px] sm:px-8 sm:pt-[124px] min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-[clamp(40px,5vw,88px)] min-[900px]:pb-20 min-[900px]:pt-[124px]">
                      <div className="flex min-w-0 flex-col gap-10 min-[900px]:flex-[1.7_1_480px] min-[900px]:gap-14">
                        <HeroSearch stats={ravnStats} />
                      </div>
                      <div className="mx-auto w-[82%] max-w-[380px] min-[900px]:mx-0 min-[900px]:w-auto min-[900px]:max-w-[500px] min-[900px]:flex-[1_1_300px]">
                        <HeroMor />
                      </div>
                    </div>
                  </section>

        {/* RAVN — nye seksjoner fra design_handoff_ravn_trinnvis, lagt til
            ved siden av det eksisterende (ingenting under er fjernet).
            Egne komponenter i src/components/ravn/ og egen .ravn-CSS. */}
        <div className="ravn relative overflow-hidden" style={{ background: "#faf5ea" }}>
          {/* Samme papirtekstur som heroen over, så de nye seksjonene ligger
              på samme papir. Paper ligger på z-index 2, innholdet over. */}
          <Paper id="ravn" variant="light" />
          <div className="relative z-[4]">
            <RavnTopList items={ravnTopItems} onVote={handleQuickVote} canVote={!!uid && !votingId} />
            <RavnArchive topics={ravnTopics} />
            <RavnArticles />
            <RavnHowItWorks />
            <RavnShareCta />
          </div>
        </div>

        {/* INTRO — ordleken RÅD. Ingressen (flyttet ut av hero-fotoet) står
            under. */}
        <section className="relative overflow-hidden" style={{ background: "#f5eee0" }}>
          <LeafShadow style={{ right: -80, top: -60, width: 520, height: 416 }} />
          <Paper id="intro" variant="light" />
          <div
            className="pointer-events-none absolute left-[4%] top-1/2 z-10 hidden w-[200px] select-none md:block lg:w-[260px] xl:w-[300px]"
            style={{ transform: "translateY(-50%) rotate(4deg)" }}
          >
            <Image
              src="/pictures/menupictures/linjetegning.png"
              alt=""
              aria-hidden
              width={1456}
              height={1092}
              className="block h-auto w-full select-none"
            />
            {/* Dampen over kaffekoppen — viska bort fra selve tegningen og
                erstattet med disse to animerte stiene, se .steam-wisp i
                globals.css. */}
            <svg viewBox="0 0 1456 1092" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" fill="none" stroke="#111110" strokeWidth={9} strokeLinecap="round">
              <path className="steam-wisp" d="M278 528C250 500 302 478 274 450C248 425 296 400 278 378" />
              <path className="steam-wisp steam-wisp--b" d="M332 530C362 500 306 472 338 445C368 418 310 392 340 368" />
            </svg>
          </div>
          {/* handmedbilde.png (generisk hånd+bilde, uten reelt innhold) fjernet
              herfra — erstattes ikke 1:1, strektegningen bærer høyresiden
              alene nå. Den nye hånd-med-bok-illustrasjonen (handmedbok.png)
              viser et bestemt bokomslag, så den hører hjemme ved Ukens
              boktips i stedet, se der. */}
          <div
            className="relative z-10 mx-auto flex max-w-[1480px] flex-col items-center gap-4 py-16 text-center sm:py-20"
            style={{ paddingInline: "var(--page-pad)" }}
          >
            <RadWordplay />
            <p className="mt-2 max-w-[440px] text-sm leading-relaxed" style={{ color: "#4a473f" }}>
              Et levende arkiv for kjerringråd og gode tips, der brukerne deler sine erfaringer og
              stemmer frem det som fungerer.
            </p>
          </div>
        </section>

        {/* UKENS UTFORDRING — samlet og midtstilt (grid auto/1px/auto), etter
            redesignet: tekst+collage i en gruppe til venstre, loddrett
            skillelinje, "ukens boktips" til høyre. Stemmetall/antall-rad
            fjernet med vilje — ingen ekte data for det ennå (se siteStats
            lenger ned for samme prinsipp: ekte tall eller ingen). Egen
            papirfarge ("Lin lys" #faf5ea i stedet for intro-seksjonens
            "Lin" #f5eee0) så de to lyse seksjonene ikke flyter sammen til
            én stor flate. */}
        <section className="relative overflow-hidden" style={{ background: "#faf5ea" }}>
          <Paper id="ukens-utfordring" variant="light" />
          <Reveal
            className="relative z-10 mx-auto grid max-w-[1480px] grid-cols-1 items-center justify-center gap-10 px-6 py-16 sm:py-20 md:grid-cols-[auto_auto_auto] md:gap-[clamp(28px,4vw,64px)]"
          >
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div style={{ maxWidth: 440 }}>
                <p className="font-figtree whitespace-nowrap text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#6d685c" }}>
                  Ukens utfordring
                </p>
                <h2 className="font-lora mt-2 text-2xl sm:text-[28px]" style={{ color: "#111110", maxWidth: "19ch" }}>
                  Har du et tips mot tørre vinterhender?
                </h2>
                <p className="mt-3 text-sm" style={{ color: "#4a473f" }}>
                  Del det du pleier å gjøre når kulda tar på huden, så andre kan prøve det også.
                </p>
                <PrimaryButton href="/del-rad" className="mt-5 w-fit">
                  Del et tips
                  <IconArrowRight className="h-4 w-4" />
                </PrimaryButton>
              </div>

              <div className="shrink-0">
                <div
                  className="relative overflow-hidden"
                  style={{ width: "clamp(160px,16vw,240px)", aspectRatio: "4/5", padding: 10, border: "2px solid #6d685c", borderRadius: "999px 999px 14px 14px" }}
                >
                  <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: "999px 999px 8px 8px" }}>
                    <Image
                      src="/pictures/menupictures/ukensutfordring.png"
                      alt="Collage: hudpleie for tørr vinterhud"
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <p className="font-figtree mt-3 max-w-[220px] text-center text-[13px] leading-snug" style={{ color: "#4a473f" }}>
                  «Det som funket for bestemor, samlet og stemt frem av deg.»
                </p>
              </div>
            </div>

            <div aria-hidden="true" className="hidden h-44 w-px self-center md:block" style={{ background: "#d4c9b3" }} />

            <BookTips />
          </Reveal>
        </section>

        {/* NYE TRENDER + TOPPEN AV VISDOM — gjenskapt 1:1 fra
            design/design_handoff_radbanken_forside/fasit/trender-og-topp.html
            (eksakt CSS-fasit, ikke tolket). "Nye trender" er redaksjonell
            tekst (se TRENDING_ITEMS over), koblet til ekte Firestore-råd —
            fasiten selv bruker plasseholder-tall her. */}
        <section className="relative overflow-hidden" style={{ background: "#f5eee0" }}>
          <Paper id="trender-visdom" variant="light" />
          <div
            className="relative z-10 mx-auto grid max-w-[1480px] items-stretch"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,460px), 1fr))",
              gap: 28,
              padding: "80px clamp(20px,3vw,40px)",
            }}
          >
            {/* NYE TRENDER — mørkt kort */}
            <Reveal id="nye-trender" className="relative flex flex-col overflow-hidden rounded-[6px]" style={{ background: "#111110", color: "#f5eee0" }}>
              <Paper id="nye-trender" variant="dark" />
              <div
                className="relative z-10 grid"
                style={{
                  padding: "44px 40px 28px",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,200px), 1fr))",
                  gap: 28,
                }}
              >
                <div className="flex flex-col" style={{ gap: 14 }}>
                  <div className="flex items-center" style={{ gap: 14 }}>
                    <h2
                      className="font-lora font-medium uppercase"
                      style={{ fontSize: "clamp(20px,1.9vw,26px)", letterSpacing: ".16em", lineHeight: 1.2, color: "#cdc6b4", margin: 0 }}
                    >
                      Nye
                      <br />
                      trender
                    </h2>
                  </div>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "#d9d2c1" }}>
                    Rådene i RAVN kommer ikke bare fra gamle bøker og bestemødre. Her er de
                    beste rådene fra den nye generasjonen.
                  </p>
                </div>
                <ol className="flex list-none flex-col" style={{ margin: 0, padding: 0 }}>
                  {TRENDING_ITEMS.map((item, i) => {
                    const remedy = remedies.find((r) => r.id === item.remedyId);
                    // Hjerte+tall her er en stemme ("♡ 428" i fasiten), ikke en
                    // bokmerke-lagring — handleToggleSaved/savedIds var feil
                    // mekanisme (tallet rørte seg aldri, og startet "fylt" hvis
                    // rådet tilfeldigvis allerede var lagret). handleQuickVote
                    // (samme som Toppen av visdom-modalen bruker) endrer det
                    // faktiske totalVotes-tallet.
                    const isVoted = pendingVotes.has(item.remedyId)
                      ? pendingVotes.get(item.remedyId) === "up"
                      : userVotes.get(item.remedyId) === "up";
                    const isVoting = votingId === item.remedyId;
                    return (
                      <li
                        key={item.remedyId}
                        className="flex items-center"
                        style={{ gap: 14, padding: "11px 0", borderBottom: "1px solid rgba(239,230,207,.18)" }}
                      >
                        <span className="font-lora shrink-0 text-center" style={{ width: 20, fontSize: 22, lineHeight: 1, color: "#d4c9b3" }}>
                          {i + 1}
                        </span>
                        <Link href={`/remedy/${item.remedyId}`} className="min-w-0 flex-1" style={{ fontSize: 16 }}>
                          {item.label}
                        </Link>
                        <button
                          onClick={() => handleQuickVote(item.remedyId, "up")}
                          disabled={!uid || isVoting}
                          aria-label={isVoted ? "Du har stemt på dette rådet" : "Stem på dette rådet"}
                          aria-pressed={isVoted}
                          className="-m-1.5 flex min-h-9 shrink-0 items-center rounded-[2px] p-1.5 transition-colors hover:bg-[rgba(239,230,207,.1)] disabled:opacity-40"
                          style={{ gap: 4, fontSize: 14, color: "#d4c9b3" }}
                        >
                          {/* SVG, ikke Unicode-tegnet ♥/♡ — det rendres som en
                              trekant i Figtree i stedet for et hjerte. */}
                          <svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" fill={isVoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.75} strokeLinejoin="round">
                            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
                          </svg>
                          {remedy?.totalVotes ?? 0}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Bildestripe — tett (3px), bred og lav (aspect-ratio 3/1.15),
                  de tre ekte innsendte bildene. */}
              <div className="relative z-10 mt-auto grid aspect-[3/1.15] grid-cols-3" style={{ gap: 3 }}>
                {TRENDING_ITEMS.map((item) => (
                  <div key={item.image} className="group relative overflow-hidden" style={{ background: "#3a4734" }}>
                    <Image src={item.image} alt={item.title} fill sizes="(max-width: 1024px) 33vw, 20vw" className="object-cover" />
                    <div
                      className="pointer-events-none absolute inset-0 flex flex-col justify-end p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "linear-gradient(to top, rgba(10,14,8,0.85) 0%, transparent 60%)" }}
                    >
                      {item.badge && (
                        <p className="font-figtree text-[9px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#d4c9b3" }}>
                          {item.badge}
                        </p>
                      )}
                      <p className="font-lora text-xs leading-snug" style={{ color: "#f5eee0" }}>
                        «{item.quote}»
                      </p>
                      <p className="mt-1 text-[11px]" style={{ color: "#8fa876" }}>
                        {item.handle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative z-10 flex flex-wrap items-center justify-between" style={{ gap: 16, padding: "20px 40px 26px", fontSize: 14 }}>
                <span style={{ color: "#d9d2c1" }}>
                  {TRENDING_ITEMS.reduce(
                    (sum, item) => sum + (remedies.find((r) => r.id === item.remedyId)?.totalVotes ?? 0),
                    0
                  )}{" "}
                  aktive stemmer
                </span>
                <Link href="/alle" className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-75" style={{ color: "#d4c9b3", fontWeight: 600, textDecoration: "none", paddingRight: 44 }}>
                  Se hva folk har stemt frem
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* UTFORSK RÅDBANKEN — gjenskapt 1:1 fra
            design/design_handoff_radbanken_forside/fasit/utforsk.html, med
            Åshilds justerte hover-farger på toppen (#a93415/#fffaf0 i stedet
            for fasitens #9a6b55, og tekst/ikon endrer seg NÅ ved hover —
            bevisst avvik fra fasitens "Tekst og ikon endrer seg IKKE"). NB:
            ingen z-index på .explore__inner-ekvivalenten under — papirlaget
            (Paper, z-index 2) skal ligge over rutene, se egen Paper inni
            selve rutenettet og CSS-klassene .explore-tile/.explore-grid i
            globals.css for den eksakte overgangen + smal-skjerm-oppførselen
            (fortsatt én rad, horisontal scroll, ikke linjeskift). */}
        <section
          className="relative overflow-hidden"
          style={{ background: "#efe8da", borderTop: "1px solid #d9d2c1", borderBottom: "1px solid #d9d2c1" }}
        >
          <Paper id="utforsk" variant="light" />
          <div
            className="relative mx-auto flex max-w-[1480px] flex-col"
            style={{ padding: "72px clamp(20px,3vw,40px)", gap: 32 }}
          >
            <div className="flex flex-col" style={{ gap: 6 }}>
              <h2
                className="font-lora font-medium uppercase"
                style={{ margin: 0, fontSize: "clamp(20px,1.9vw,26px)", letterSpacing: ".16em", lineHeight: 1.2, color: "#6d685c" }}
              >
                Utforsk RAVN
              </h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, color: "#3d3a33" }}>
                Finn råd som gjør hverdagen litt enklere.
              </p>
            </div>
            <ul
              className="explore-grid relative grid list-none"
              style={{ gap: 10, margin: 0, padding: 0, "--tile-count": CATEGORY_STRIP.length } as React.CSSProperties}
            >
              <Paper id="utforsk-grid" variant="dark" mottle={false} />
              {CATEGORY_STRIP.map(({ label, href, d }) => (
                <li key={label} style={{ display: "contents" }}>
                  <Link
                    href={href}
                    className="explore-tile flex flex-col items-center text-center"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[30px] w-[30px]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                      <path d={d} />
                    </svg>
                    <span className="font-figtree text-balance" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* NORDISK RÅD — bilde 4:3 (10px luft, 2.5px gullramme, alltid
            svart-hvitt via CSS-filter) venstre, tekst høyre. Lenker til en
            ekte side (src/app/artikkel/nordisk-rad), foreløpig mockup-
            innhold — ekte tekst kommer senere (se kommentar i den filen).
            Bladskygge nedre venstre, speilet, per bredde-og-bladskygger.md. */}
        <section className="relative overflow-hidden" style={{ background: "#faf5ea" }}>
          <LeafShadow style={{ left: -90, bottom: -80, width: 560, height: 448, transform: "scaleX(-1)" }} />
          <Paper id="nordisk" variant="light" />
          <Reveal
            className="relative z-10 mx-auto grid max-w-[1480px] items-center"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,420px), 1fr))", gap: 48, padding: "80px clamp(20px,3vw,40px)" }}
          >
            <div className="relative aspect-4/3 overflow-hidden" style={{ padding: 10, border: "2.5px solid #6d685c" }}>
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src="/pictures/skibilde.png"
                  alt="To skiløpere i gammel, svart-hvitt vinterstemning"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  style={{ filter: "grayscale(1) contrast(1.05) sepia(.08)" }}
                />
              </div>
            </div>

            <div>
              <p
                className="font-lora font-medium uppercase"
                style={{ fontSize: "clamp(20px,1.9vw,26px)", letterSpacing: ".16em", lineHeight: 1.2, color: "#6d685c" }}
              >
                Nordisk råd
              </p>
              <h2 className="font-lora mt-3" style={{ fontSize: "clamp(28px,3vw,36px)", lineHeight: 1.15, color: "#111110" }}>
                En hyllest til den værbitte sjel.
              </h2>
              <p className="font-figtree mt-3" style={{ fontSize: 19, fontWeight: 600, color: "#3d3a33" }}>
                Om nødvendigheten av kulde, stillhet og ull.
              </p>
              <p className="mt-4 max-w-md" style={{ fontSize: 18, lineHeight: 1.6, color: "#3d3a33" }}>
                Det moderne mennesket har glemt kuldens verdi. Vi lever i en evig temperert sone,
                beskyttet av isolasjonsglass og varmepumper. Men i Nordisk råd tror vi at karakter
                bygges når vinden biter i kinnene.
              </p>
              <Link
                href="/artikkel/nordisk-rad"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-75"
                style={{ color: "#a93415" }}
              >
                Les hele innlegget
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
              <p className="font-lora mt-8 max-w-xs text-right text-lg italic" style={{ color: "#4a473f", marginLeft: "auto" }}>
                «Norge er ikke bare et land, det er en tilstand man må kle seg for.»
              </p>
            </div>
          </Reveal>
        </section>

      </main>

    </div>
  );
}
