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
import { RemedyPreviewModal } from "@/components/RemedyPreviewModal";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import type { Problem, Remedy } from "@/lib/types";
import { Paper } from "@/components/Paper";
import { LeafShadow } from "@/components/LeafShadow";
import {
  IconChevronDown,
  IconHeart,
  IconPlus,
  IconSprig,
  CATEGORY_ICON,
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

// Frøene som driver ut fra hero-merket — gjenbruker seed-drift-a/b/c
// (globals.css), som lå ferdige men ubrukte fra en tidligere runde. Negativ
// delay (samme triks som BOKEH_ORBS) så de er spredt ut fra første sekund i
// stedet for å starte samlet.
const SEEDS = [
  { variant: "a", delay: 0 },
  { variant: "b", delay: -4.5 },
  { variant: "c", delay: -9 },
] as const;

// "Utforsk Rådbanken"-raden — egne ikoner og eksakte etiketter fra
// design/design_handoff_radbanken_forside/fasit/utforsk.html (ikke de delte
// icons.tsx-komponentene, som har andre strøk/paths), siden fasiten eksplisitt
// ber om "bruk ikonene fra filen". Visuell smakebit, ikke reell mega-meny —
// noen punkter peker til nærmeste eksisterende side i stedet for en dedikert
// kategori som ennå ikke finnes (Mat & konservering, Reparasjon).
const CATEGORY_STRIP = [
  { label: "Kjerringråd", href: "/alle", d: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" },
  {
    label: "Lifehacks",
    href: "/alle",
    d: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7Z",
  },
  {
    label: "Kultur",
    href: "/historie",
    d: "M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m7.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H15m-3 4.5V15M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  },
  {
    label: "Planter & urter",
    href: "/medisinplanter",
    d: "M7 20h10M10 20c5.5-2.5.8-6.4 3-10M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8ZM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2Z",
  },
  {
    label: "Mat & konservering",
    href: "/alle",
    d: "M8 2h8v3H8ZM7 5h10l1 3v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8Z M6 12h12",
  },
  { label: "Hus & hjem", href: "/kategori/husoghjem", d: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" },
  {
    label: "Reparasjon",
    href: "/alle",
    d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9Z",
  },
  { label: "Helse & velvære", href: "/kategori/helse", d: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" },
] as const;

// Løvetann-frø ved hover på Utforsk-rutene — kopiert 1:1 fra <script>-taggen i
// design/design_handoff_radbanken_forside/fasit/utforsk.html (8 dun-frø,
// vind fra pekerhastighet, avstand 75 %, varighet 70 %). Ren DOM/WAAPI, ikke
// React — fungerer identisk utenfor komponenttreet, akkurat som i fasiten.
function rbSeedBurst(x: number, y: number, vel: { x: number; y: number }) {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const N = 8,
    D = 0.75,
    T = 0.7; // antall, avstand, varighet
  const R = (a: number, b: number) => a + Math.random() * (b - a);
  let hairs = "";
  for (let i = 0; i < 15; i++) {
    const a = -Math.PI + (i / 14) * Math.PI;
    hairs += "M10 11L" + (10 + Math.cos(a) * 9).toFixed(1) + " " + (11 + Math.sin(a) * 9).toFixed(1);
  }
  const DUN =
    '<svg viewBox="0 0 20 34" style="display:block;width:100%;height:100%;overflow:visible"><path d="' +
    hairs +
    '" fill="none" stroke="#fbf6ea" stroke-width=".7" stroke-linecap="round" opacity=".95"/><path d="M10 11V27" stroke="#fbf6ea" stroke-width=".9"/><ellipse cx="10" cy="29.5" rx="1.4" ry="3" fill="#8a6a3a"/><circle cx="10" cy="11" r=".9" fill="#fbf6ea"/></svg>';
  const wind = {
    x: Math.max(-1, Math.min(1, ((vel && vel.x) || 0) / 18)),
    y: Math.max(-1, Math.min(1, ((vel && vel.y) || 0) / 18)),
  };
  for (let i = 0; i < N; i++) {
    const s = R(0.6, 1.25),
      w = 15 * s,
      h = 26 * s,
      el = document.createElement("i");
    el.setAttribute("aria-hidden", "true");
    el.style.cssText =
      "position:fixed;left:0;top:0;pointer-events:none;z-index:9999;will-change:transform,opacity;filter:drop-shadow(0 0 1px rgba(21,35,24,.45));width:" +
      w +
      "px;height:" +
      h +
      "px";
    el.innerHTML = DUN;
    document.body.appendChild(el);
    const a = R(0, Math.PI * 2),
      d = R(70, 260) * D;
    const dx = Math.cos(a) * d + wind.x * 120,
      dy = Math.sin(a) * d * 0.8 - 40 + wind.y * 80,
      sw = R(-30, 30),
      rot = R(-270, 270);
    const k: [number, number, number, number, number, number?][] = [
      [0, 0, 0, 0.4, 0],
      [dx * 0.35, dy * 0.35 - 20, rot * 0.3, 1, 0.95, 0.18],
      [dx * 0.8 + sw, dy * 0.8, rot * 0.75, 1, 0.7, 0.65],
      [dx - sw * 0.5, dy + 70, rot, 0.9, 0],
    ];
    const frames = k.map(([fx, fy, r, sc, op, off]) => {
      const f: Keyframe = {
        transform: "translate(" + (x + fx - w / 2) + "px," + (y + fy - h / 2) + "px) rotate(" + r + "deg) scale(" + sc + ")",
        opacity: op,
      };
      if (off !== undefined) f.offset = off;
      return f;
    });
    el.animate(frames, { duration: R(2200, 4000) * T, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" }).onfinish = () =>
      el.remove();
  }
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

// Ordleken i forsidens intro-seksjon — "RÅD" ligger fast i midten, et ord
// bytter venstre og/eller høyre for hver RAD_STEPS-intervall. Venstre/
// høyre-fordelingen er bekreftet av Åshild (referanse-HTML-en kjørte ikke
// selv, malingsmotor manglet i eksporten).
const RAD_STEPS: { left: string; right: string }[] = [
  { left: "", right: "-LØS?" },
  { left: "BESTEMORS ·", right: "" },
  { left: "", right: "· FOR FORKJØLELSE" },
  { left: "NORDISKE ·", right: "" },
  { left: "DER GODE ·", right: "· ER GRATIS" },
  { left: "", right: "· FOR STORE OG SMÅ" },
  { left: "NÅR DU TRENGER GODE ·", right: "" },
  { left: "", right: "· DU DELER" },
  { left: "", right: "·BANKEN" },
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
      <span key={`l-${step}`} className="word-pop justify-self-end text-right" style={{ whiteSpace: "pre", color: "#6f7d61" }}>
        {left}
      </span>
      <span className="px-1" style={{ color: "#8a5c47", fontWeight: 500 }}>
        RÅD
      </span>
      <span key={`r-${step}`} className="word-pop-delay justify-self-start text-left" style={{ whiteSpace: "pre", color: "#6f7d61" }}>
        {right}
      </span>
    </div>
  );
}

// Jugendhjørner (art nouveau-hjørnepynt) på "Nye trender"-kortet — egen,
// mer dekorativ form enn knappenes CornerFlourish, hentet fra referanse-
// HTML-ens <symbol id="fCorner"> (i motsetning til løvetannhodet var denne
// banen reell, ikke en uløst malingsvariabel).
function JugendCorner({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 60 60" className={className} style={style}>
      <path
        d="M4 56V24C4 12 12 4 24 4H56M14 56V30C14 20 20 14 30 14H56M30 30C30 22 38 22 38 28C38 33 32 33 32 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Fasitens .tick / #tick-symbol — strekene i hjørnet på kvadratbildene i
// "Toppen av visdom". Nesten lik Button.tsx sin CornerFlourish, men med
// egen strokeWidth (1.2) og negativ offset (-3px, utenfor kanten), så en
// bespoke kopi her i stedet for å gjenbruke/endre den delte komponenten.
function Tick({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className={className} style={style}>
      <path
        d="M1 11V1H11M4 11V4H11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
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

// Ekte bilder til "Toppen av visdom", matchet på tittel — ingen "image"-felt
// finnes på Remedy ennå, så dette er en kuratert erstatning for dagens
// topp-3, ikke en generell løsning. Faller tilbake til kategori-ikonet
// (RankIcon) hvis rangeringen noensinne endrer seg og tittelen ikke lenger
// matcher.
const TOP_REMEDY_IMAGES: Record<string, string> = {
  "Ingefær og honning mot forkjølelse og sår hals": "/pictures/menupictures/honning-ingefaer.png",
  "Natron i joggesko": "/pictures/menupictures/sko.png",
  "Natron + eddik til sluk": "/pictures/menupictures/sluk.png",
};

export default function HomePage() {
  const uid = useAnonAuth();

  // Pekerhastighet (for frø-vinden) + per-rute nedkjøling (900ms, samme som
  // fasiten) for rbSeedBurst på Utforsk-rutene.
  const pointerVel = useRef({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0 });
  const seedCooldowns = useRef<Record<string, number>>({});

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      pointerVel.current = { x: e.clientX - lastPointer.current.x, y: e.clientY - lastPointer.current.y };
      lastPointer.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

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

  const topThree = rankedAll.slice(0, 3);

  const openIndex = openRemedyId ? topThree.findIndex((r) => r.id === openRemedyId) : -1;
  const openRemedy = openIndex >= 0 ? topThree[openIndex] : null;

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
                      {/* Papirkorn på selve fotoet — <Paper variant="hero">
                          per papirtekstur.md (svakere, uten flekker). */}
                      <Paper id="hero" variant="hero" />
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
                        className="absolute inset-0 z-10 flex flex-col items-center px-6 pb-10 pt-[calc(9vh+56px)] text-center sm:pt-[calc(8vh+56px)]"
                        style={{ color: "#f5efeb", textShadow: "0 1px 2px rgba(0,0,0,0.55), 0 2px 22px rgba(0,0,0,0.6)" }}
                      >
                        {/* Merke (bue+løvetann) og ordmerke som to separate SVG-er, etter
                            redesign-pakken, i stedet for den gamle ferdigslåtte
                            lockup-PNG-en — gir plass til frøene som driver ut fra
                            merket, og til tagline-linjen i samme bredde som ordmerket. */}
                        <div className="relative" style={{ filter: "drop-shadow(0 2px 10px rgba(10,22,14,0.55))" }}>
                          {SEEDS.map((seed) => (
                            <Image
                              key={seed.variant}
                              src="/logo/dandelionseed.png"
                              alt=""
                              aria-hidden
                              width={40}
                              height={40}
                              data-seed=""
                              className="pointer-events-none absolute left-1/2 top-1/3 w-3.5 select-none opacity-0"
                              style={{ animation: `seed-drift-${seed.variant} 14s linear ${seed.delay}s infinite` }}
                            />
                          ))}
                          <Image
                            src="/logo/radbanken-merke-mork.svg"
                            alt=""
                            aria-hidden
                            width={240}
                            height={340}
                            priority
                            className="relative mx-auto h-[100px] w-auto sm:h-[130px] lg:h-[150px]"
                          />
                        </div>
                        <Image
                          src="/logo/radbanken-ordmerke-mork.svg"
                          alt="Rådbanken"
                          width={960}
                          height={200}
                          priority
                          className="mt-2 h-auto w-[260px] sm:w-[360px] lg:w-[440px]"
                        />
                        <div className="mt-3 flex w-[260px] items-center gap-3 sm:w-[360px] lg:w-[440px]">
                          <span
                            className="h-px flex-1"
                            style={{ background: "linear-gradient(to left, rgba(230,220,192,0.7), transparent)" }}
                          />
                          <p
                            className="font-figtree shrink-0 text-[11px] font-semibold tracking-[0.3em] sm:text-[13px]"
                            style={{ color: "#efe6cf" }}
                          >
                            KUNNSKAP SOM GÅR I ARV
                          </p>
                          <span
                            className="h-px flex-1"
                            style={{ background: "linear-gradient(to right, rgba(230,220,192,0.7), transparent)" }}
                          />
                        </div>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                          <PrimaryButton href="/alle" className="h-11" style={{ textShadow: "none" }}>
                            Utforsk råd
                            <span aria-hidden>→</span>
                          </PrimaryButton>
                          <SecondaryButton
                            href="/del-rad"
                            tone="dark"
                            className="h-11"
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

        {/* INTRO — ordleken RÅD. Ingressen (flyttet ut av hero-fotoet) står
            under. */}
        <section className="relative overflow-hidden" style={{ background: "#f5eee0" }}>
          <LeafShadow style={{ right: -80, top: -60, width: 520, height: 416 }} />
          <Paper id="intro" variant="light" />
          <Image
            src="/pictures/menupictures/linjetegning.png"
            alt=""
            aria-hidden
            width={1456}
            height={1092}
            className="pointer-events-none absolute left-[4%] top-1/2 z-10 hidden w-[200px] select-none md:block lg:w-[260px] xl:w-[300px]"
            style={{ transform: "translateY(-50%) rotate(4deg)" }}
          />
          <Image
            src="/pictures/menupictures/handmedbilde.png"
            alt=""
            aria-hidden
            width={1235}
            height={1235}
            className="pointer-events-none absolute right-[4%] top-1/2 z-10 hidden w-[200px] select-none md:block lg:w-[280px] xl:w-[320px]"
            style={{ transform: "translateY(-50%) rotate(-6deg)" }}
          />
          <div
            className="relative z-10 mx-auto flex max-w-[1480px] flex-col items-center gap-4 py-16 text-center sm:py-20"
            style={{ paddingInline: "var(--page-pad)" }}
          >
            <p className="font-figtree text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#8a6a2a" }}>
              <span style={{ color: "#8a5c47" }}>RÅD</span>BANKEN
            </p>
            <RadWordplay />
            <p className="mt-2 max-w-[440px] text-sm leading-relaxed" style={{ color: "#4a5a4d" }}>
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
                <p className="font-figtree whitespace-nowrap text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#8a6a2a" }}>
                  Ukens utfordring
                </p>
                <h2 className="font-lora mt-2 text-2xl sm:text-[28px]" style={{ color: "#152318", maxWidth: "19ch" }}>
                  Har du et tips mot tørre vinterhender?
                </h2>
                <p className="mt-3 text-sm" style={{ color: "#4a5a4d" }}>
                  Del det du pleier å gjøre når kulda tar på huden, så andre kan prøve det også.
                </p>
                <PrimaryButton href="/del-rad" className="mt-5 w-fit">
                  Del et tips
                  <span aria-hidden>→</span>
                </PrimaryButton>
              </div>

              <div className="shrink-0">
                <div
                  className="relative overflow-hidden"
                  style={{ width: "clamp(160px,16vw,240px)", aspectRatio: "4/5", padding: 10, border: "2px solid #a67628", borderRadius: "999px 999px 14px 14px" }}
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
                <p className="font-figtree mt-3 max-w-[220px] text-center text-[13px] leading-snug" style={{ color: "#56633f" }}>
                  «Det som funket for bestemor, samlet og stemt frem av deg.»
                </p>
              </div>
            </div>

            <div aria-hidden="true" className="hidden h-44 w-px self-center md:block" style={{ background: "#d8c9a6" }} />

            <div>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-6" style={{ background: "#d8c9a6" }} />
                <p className="font-figtree shrink-0 text-xs font-semibold tracking-[0.26em]" style={{ color: "#a67628" }}>
                  UKENS BOKTIPS
                </p>
                <span aria-hidden="true" className="h-px w-6" style={{ background: "#d8c9a6" }} />
              </div>
              <div className="mt-6 flex items-start gap-5">
                <div style={{ width: "clamp(110px,11vw,155px)" }}>
                  <div className="relative overflow-hidden rounded-md" style={{ aspectRatio: "2/3", boxShadow: "0 10px 24px rgba(21,35,24,0.18)" }}>
                    <Image src="/pictures/bok1.png" alt="Darwin and the Art of Botany" fill sizes="155px" className="object-cover" />
                  </div>
                  <p className="font-lora mt-2 text-sm" style={{ color: "#152318" }}>Darwin and the Art of Botany</p>
                  <p className="text-xs" style={{ color: "#4a5a4d" }}>Costa &amp; Angell</p>
                </div>
                <div className="mt-7" style={{ width: "clamp(110px,11vw,155px)" }}>
                  <div className="relative overflow-hidden rounded-md" style={{ aspectRatio: "2/3", boxShadow: "0 10px 24px rgba(21,35,24,0.18)" }}>
                    <Image src="/pictures/bok2.png" alt="Farm to Body" fill sizes="155px" className="object-cover" />
                  </div>
                  <p className="font-lora mt-2 text-sm" style={{ color: "#152318" }}>Farm to Body</p>
                </div>
              </div>
            </div>
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
            <Reveal className="relative flex flex-col overflow-hidden rounded-[6px]" style={{ background: "#2c3727", color: "#f5eee0" }}>
              <Paper id="nye-trender" variant="dark" />
              <JugendCorner className="pointer-events-none absolute left-[14px] top-[14px] z-10 h-10 w-10" style={{ color: "#d9c89c" }} />
              <JugendCorner
                className="pointer-events-none absolute bottom-[14px] right-[14px] z-10 h-10 w-10 rotate-180"
                style={{ color: "#d9c89c" }}
              />
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
                    <Image src="/logo/radbanken-ikon-krem.svg" alt="" aria-hidden width={100} height={100} className="h-11 w-11 shrink-0" style={{ color: "#efe6cf" }} />
                    <h2
                      className="font-lora font-medium uppercase"
                      style={{ fontSize: "clamp(20px,1.9vw,26px)", letterSpacing: ".16em", lineHeight: 1.2, color: "#e6dcc0", margin: 0 }}
                    >
                      Nye
                      <br />
                      trender
                    </h2>
                  </div>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "#e1d6c2" }}>
                    Rådene i Rådbanken kommer ikke bare fra gamle bøker og bestemødre. Her er de
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
                        <span className="font-lora shrink-0 text-center" style={{ width: 20, fontSize: 22, lineHeight: 1, color: "#d9c89c" }}>
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
                          className="flex shrink-0 items-center transition-opacity hover:opacity-70 disabled:opacity-40"
                          style={{ gap: 4, fontSize: 14, color: "#d9c89c" }}
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
                        <p className="font-figtree text-[9px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#d9c89c" }}>
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
                <span style={{ color: "#e1d6c2" }}>
                  {TRENDING_ITEMS.reduce(
                    (sum, item) => sum + (remedies.find((r) => r.id === item.remedyId)?.totalVotes ?? 0),
                    0
                  )}{" "}
                  aktive stemmer
                </span>
                <Link href="/alle" className="transition-opacity hover:opacity-75" style={{ color: "#d9c89c", fontWeight: 600, textDecoration: "none", paddingRight: 44 }}>
                  Se hva folk har stemt frem →
                </Link>
              </div>
            </Reveal>

            {/* TOPPEN AV VISDOM — lyst kort, dobbel ramme via inset box-shadow
                (ikke nøstede border-divs) som i fasiten. */}
            <Reveal className="relative rounded-[6px]" style={{ background: "#faf5ea", padding: 6, boxShadow: "inset 0 0 0 1.5px #a67628" }}>
              <div
                className="relative flex h-full flex-col"
                style={{ padding: "40px 40px 32px", boxShadow: "inset 0 0 0 1px rgba(166,118,40,.5)", gap: 14 }}
              >
                <Paper id="toppen-visdom" variant="light" />
                <h2
                  className="font-lora relative z-10 font-medium uppercase"
                  style={{ fontSize: "clamp(20px,1.9vw,26px)", letterSpacing: ".16em", lineHeight: 1.2, color: "#8a6a2a", margin: 0 }}
                >
                  Toppen av visdom
                </h2>
                <span className="relative z-10" style={{ fontSize: 17, color: "#2e4332" }}>
                  Kjerringråd med aller flest stemmer fra folket.
                </span>

                {topThree.length === 0 && (
                  <p className="relative z-10 text-sm text-ink-soft">Ingen råd med stemmer ennå.</p>
                )}

                {topThree.length > 0 && (
                  <ol className="relative z-10 flex list-none flex-col" style={{ margin: 0, padding: 0 }}>
                    {topThree.map((r, i) => {
                      const problem = problemById.get(r.problemId);
                      const RankIcon = (problem && CATEGORY_ICON[problem.slug]) || IconSprig;
                      const image = TOP_REMEDY_IMAGES[r.title];
                      const isSaved = pendingSaves.has(r.id) ? pendingSaves.get(r.id)! : savedIds.has(r.id);
                      const isSaving = savingId === r.id;
                      return (
                        <li
                          key={r.id}
                          className="flex items-center"
                          style={{ gap: 18, padding: "16px 0", borderBottom: "1px solid #e1d6c2" }}
                        >
                          <span className="font-lora shrink-0 text-center" style={{ width: 22, fontSize: 30, lineHeight: 1, color: "#8a7a55" }}>
                            {i + 1}
                          </span>
                          <span
                            className="relative shrink-0 rounded-[2px]"
                            style={{ width: 68, height: 68, padding: 4, boxShadow: "inset 0 0 0 1px #8a7a55" }}
                          >
                            {/* overflow-hidden kun på denne indre innpakningen,
                                ikke den ytre boksen — ellers klipper den bort
                                tikkene under, som sitter UTENFOR kanten (-3px). */}
                            {image ? (
                              <span className="relative block h-full w-full overflow-hidden rounded-[inherit]">
                                <Image src={image} alt="" fill sizes="60px" className="object-cover" />
                              </span>
                            ) : (
                              <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]" style={{ background: "#e7ddd0" }}>
                                <RankIcon className="h-6 w-6 text-sage" />
                              </span>
                            )}
                            <Tick className="absolute -left-[3px] -top-[3px] h-[11px] w-[11px]" style={{ color: "#8a7a55" }} />
                            <Tick className="absolute -bottom-[3px] -right-[3px] h-[11px] w-[11px] rotate-180" style={{ color: "#8a7a55" }} />
                          </span>
                          <button onClick={() => setOpenRemedyId(r.id)} className="flex min-w-0 flex-1 flex-col text-left" style={{ gap: 2 }}>
                            <span
                              className="font-lora"
                              style={{ fontSize: 21, fontWeight: 400, lineHeight: 1.2, color: "#152318" }}
                            >
                              {r.title}
                            </span>
                            <span style={{ fontSize: 14, color: "#4a5a4d" }}>{r.totalVotes} stemmer</span>
                          </button>
                          <button
                            onClick={() => handleToggleSaved(r.id)}
                            disabled={!uid || isSaving}
                            aria-label={isSaved ? "Fjern fra mine lagrede råd" : "Lagre i mine lagrede råd"}
                            aria-pressed={isSaved}
                            className="flex shrink-0 hover:opacity-70 disabled:opacity-40"
                            style={{ padding: 8, margin: -8, background: "none", border: 0 }}
                          >
                            <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill={isSaved ? "#8c491a" : "none"} stroke="#8c491a" strokeWidth={1.75} strokeLinejoin="round">
                              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
                            </svg>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                )}

                <Link
                  href="/alle"
                  className="relative z-10 transition-opacity hover:opacity-75"
                  style={{ marginTop: "auto", paddingTop: 12, fontSize: 15, fontWeight: 600, color: "#8a5c47", textDecoration: "none" }}
                >
                  Se alle råd →
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* UTFORSK RÅDBANKEN — gjenskapt 1:1 fra
            design/design_handoff_radbanken_forside/fasit/utforsk.html, med
            Åshilds justerte hover-farger på toppen (#7e523f/#fffaf0 i stedet
            for fasitens #9a6b55, og tekst/ikon endrer seg NÅ ved hover —
            bevisst avvik fra fasitens "Tekst og ikon endrer seg IKKE"). NB:
            ingen z-index på .explore__inner-ekvivalenten under — papirlaget
            (Paper, z-index 2) skal ligge over rutene, se egen Paper inni
            selve rutenettet og CSS-klassene .explore-tile/.explore-grid i
            globals.css for den eksakte overgangen + smal-skjerm-oppførselen
            (fortsatt én rad, horisontal scroll, ikke linjeskift). */}
        <section
          className="relative overflow-hidden"
          style={{ background: "#efe8da", borderTop: "1px solid #e1d6c2", borderBottom: "1px solid #e1d6c2" }}
        >
          <Paper id="utforsk" variant="light" />
          <div
            className="relative mx-auto flex max-w-[1480px] flex-col"
            style={{ padding: "72px clamp(20px,3vw,40px)", gap: 32 }}
          >
            <div className="flex flex-col" style={{ gap: 6 }}>
              <h2
                className="font-lora font-medium uppercase"
                style={{ margin: 0, fontSize: "clamp(20px,1.9vw,26px)", letterSpacing: ".16em", lineHeight: 1.2, color: "#8a6a2a" }}
              >
                Utforsk Rådbanken
              </h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, color: "#2e4332" }}>
                Finn råd som gjør hverdagen litt enklere.
              </p>
            </div>
            <ul className="explore-grid relative grid list-none" style={{ gap: 10, margin: 0, padding: 0 }}>
              <Paper id="utforsk-grid" variant="dark" mottle={false} />
              {CATEGORY_STRIP.map(({ label, href, d }) => (
                <li key={label} style={{ display: "contents" }}>
                  <Link
                    href={href}
                    className="explore-tile flex flex-col items-center text-center"
                    onPointerEnter={(e) => {
                      const now = performance.now();
                      if (now - (seedCooldowns.current[label] ?? 0) < 900) return;
                      seedCooldowns.current[label] = now;
                      rbSeedBurst(e.clientX, e.clientY, pointerVel.current);
                    }}
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
            <div className="relative aspect-4/3 overflow-hidden" style={{ padding: 10, border: "2.5px solid #a67628" }}>
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
                style={{ fontSize: "clamp(20px,1.9vw,26px)", letterSpacing: ".16em", lineHeight: 1.2, color: "#8a6a2a" }}
              >
                Nordisk råd
              </p>
              <h2 className="font-lora mt-3" style={{ fontSize: "clamp(28px,3vw,36px)", lineHeight: 1.15, color: "#152318" }}>
                En hyllest til den værbitte sjel.
              </h2>
              <p className="font-figtree mt-3" style={{ fontSize: 19, fontWeight: 600, color: "#2e4332" }}>
                Om nødvendigheten av kulde, stillhet og ull.
              </p>
              <p className="mt-4 max-w-md" style={{ fontSize: 18, lineHeight: 1.6, color: "#2e4332" }}>
                Det moderne mennesket har glemt kuldens verdi. Vi lever i en evig temperert sone,
                beskyttet av isolasjonsglass og varmepumper. Men i Nordisk råd tror vi at karakter
                bygges når vinden biter i kinnene.
              </p>
              <Link
                href="/artikkel/nordisk-rad"
                className="mt-5 inline-block text-sm font-semibold transition-opacity hover:opacity-75"
                style={{ color: "#8a5c47" }}
              >
                Les hele innlegget →
              </Link>
              <p className="font-lora mt-8 max-w-xs text-right text-lg italic" style={{ color: "#4a5a4d", marginLeft: "auto" }}>
                «Norge er ikke bare et land, det er en tilstand man må kle seg for.»
              </p>
            </div>
          </Reveal>
        </section>

        {/* DEL ET RÅD — ramme nesten i full bredde (1.5px #8a5c47 + 6px luft
            + 1px #8a5c47 inni, samme boxShadow-dobbeltramme-teknikk som
            Toppen av visdom), jugendhjørner i terrakotta i alle fire hjørner
            (samme JugendCorner som Nye trender, bare 4 i stedet for 2). */}
        <section className="relative overflow-hidden" style={{ background: "#f5eee0" }}>
          <Paper id="del-et-rad" variant="light" />
          <div className="relative z-10 mx-auto max-w-[1180px] px-6 py-10 sm:py-14" style={{ paddingInline: "var(--page-pad)" }}>
            <Reveal
              className="relative mx-auto max-w-[1100px]"
              style={{ boxShadow: "inset 0 0 0 1.5px #8a5c47", borderRadius: 6, padding: 6 }}
            >
              <div
                className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between"
                style={{ boxShadow: "inset 0 0 0 1px #8a5c47", padding: "40px 48px" }}
              >
                <JugendCorner className="pointer-events-none absolute left-3 top-3 h-10 w-10" style={{ color: "#8a5c47" }} />
                <JugendCorner className="pointer-events-none absolute right-3 top-3 h-10 w-10 -scale-x-100" style={{ color: "#8a5c47" }} />
                <JugendCorner className="pointer-events-none absolute bottom-3 left-3 h-10 w-10 -scale-y-100" style={{ color: "#8a5c47" }} />
                <JugendCorner className="pointer-events-none absolute bottom-3 right-3 h-10 w-10 rotate-180" style={{ color: "#8a5c47" }} />

                <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
                  <Image
                    src="/logo/radbanken-merke-lys.svg"
                    alt=""
                    aria-hidden
                    width={240}
                    height={340}
                    className="h-[88px] w-auto shrink-0"
                    style={{ borderRadius: "999px 999px 8px 8px", boxShadow: "inset 0 0 0 1px #a67628" }}
                  />
                  <div>
                    <h2 className="font-lora text-2xl sm:text-3xl" style={{ color: "#152318" }}>
                      Har du et godt råd å dele?
                    </h2>
                    <p className="mt-2 max-w-md" style={{ color: "#2e4332" }}>
                      Noe du har lært fra en forelder, besteforelder eller nabo, eller funnet ut av
                      selv? Gi det videre.
                    </p>
                  </div>
                </div>

                {/* Knapp+tagline ved siden av (ikke under) resten av innholdet
                    på store skjermer — stabler bare på smale. */}
                <div className="flex shrink-0 flex-col items-center gap-3 lg:items-end">
                  <SecondaryButton href="/del-rad" tone="terracotta">
                    Del et råd
                    <span aria-hidden>→</span>
                  </SecondaryButton>
                  <p className="font-lora whitespace-nowrap italic" style={{ color: "#8a5c47" }}>
                    Sammen bevarer vi kunnskapen.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
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
        onPrev={openIndex > 0 ? () => setOpenRemedyId(topThree[openIndex - 1].id) : undefined}
        onNext={openIndex >= 0 && openIndex < topThree.length - 1 ? () => setOpenRemedyId(topThree[openIndex + 1].id) : undefined}
      />
    </div>
  );
}
