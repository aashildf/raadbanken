"use client";

import { use, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { castVote } from "@/lib/votes";
import { setSaved } from "@/lib/saves";
import { wilsonScore } from "@/lib/wilson";
import { TOP_CATEGORIES, HEALTH_SUBCATEGORIES } from "@/lib/categories";
import { REMEDY_IMAGES } from "@/lib/remedyImages";
import { CategorySubcategoryList } from "@/components/CategorySubcategoryList";
import { RemedyCard } from "@/components/RemedyCard";
import { RemedyPreviewModal } from "@/components/RemedyPreviewModal";
import { Paper } from "@/components/Paper";
import { IconSearch, IconArrowRight } from "@/components/icons";
import { PrimaryButton } from "@/components/Button";
import { ravnIcon } from "@/components/ravn/shared";
import { ShareAdviceBox } from "@/components/ShareAdviceBox";
import type { Problem, Remedy } from "@/lib/types";

// Fordypningsartiklene som tidligere lå som faste teasere på forsiden, flyttet
// hit til kategorien de faktisk hører hjemme i (se forsidens "Ukens utfordring"
// og "Folkets favoritter" — artiklene konkurrerte med rangeringen om plass der).
type CategoryArticle = {
  href: string;
  image: string;
  alt: string;
  credit: { text: string; href: string };
  kicker: string;
  title: string;
  description: string;
};

const CATEGORY_ARTICLES: Record<string, CategoryArticle[]> = {
  matkonservering: [
    {
      href: "/artikkel/fiken",
      image: "/pictures/menupictures/fiken_pexels-adriannacalvo-23384641.jpg",
      alt: "Ferske fiken, hele og oppskåret",
      credit: { text: "Adrianna CA / Pexels", href: "https://www.pexels.com/photo/figs-in-white-bowl-23384641/" },
      kicker: "Frukt med lange tradisjoner",
      title: "Fiken: en liten frukt med store helsefordeler",
      description: "Derfor er den søte frukten godt for fordøyelsen, hjertehelsen og skjelettet.",
    },
    {
      href: "/artikkel/tyttebaer",
      image: "/pictures/menupictures/tyytebaer_pexels-sandra-seitamaa-89384773-9669197.jpg",
      alt: "Tyttebær",
      credit: { text: "Sandra Seitamaa / Pexels", href: "https://www.pexels.com/photo/close-up-of-plants-and-berries-9669197/" },
      kicker: "Gammelt husråd mot hoste",
      title: "Tyttebær: naturens egen hostesaft",
      description: "Derfor virker det gamle tyttebærtrikset mot hoste og sår hals, og hvordan du bruker det riktig.",
    },
  ],
  helseogvelvare: [
    {
      href: "/artikkel/syrin",
      image: "/pictures/syrin_pexels-iriser-1431192.jpg",
      alt: "Syrinklase i nærbilde",
      credit: { text: "Irina Iriser / Pexels", href: "https://www.pexels.com/photo/close-up-photography-of-orchid-flowers-1431192/" },
      kicker: "Duftende prydbusk med gamle røtter",
      title: "Syrin: mer enn en vakker vårduft",
      description:
        "Blomstene er spiselige og fulle av virkestoffer som tradisjonelt er brukt mot uro, urolig mage og irritert hud.",
    },
  ],
};

// Kortet ned til maks 2–3 setninger per KATEGORISIDE.md ("dagens lange intro
// kortes ned") — lengre historikk/bakgrunn kan heller leve i artiklene under.
const CATEGORY_INTRO: Record<string, string> = {
  helseogvelvare:
    "Før apotek og baderomshyller fulle av spesialprodukter ble planter, urter og naturlige råvarer sanket, dyrket og brukt i hverdagen. Mange råd gikk i arv fra generasjon til generasjon, noen er glemt, andre brukes fortsatt.",
  husoghjem:
    "Før spesialmidler fantes for enhver oppgave, måtte man være kreativ med det man hadde for hånden. Eddik, sitron, salt og grønnsåpe kunne brukes til langt mer enn man skulle tro, og mange av knepene lever fortsatt i beste velgående.",
  matkonservering:
    "Konservering, tørking, safting og andre gamle triks for å ta vare på det man har sanket. Vi bygger fortsatt opp denne kategorien, men her er noen artikler å begynne med i mellomtiden.",
};

export default function KategoriPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const category = TOP_CATEGORIES.find((c) => c.id === id);
  const uid = useAnonAuth();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [myVoteByRemedy, setMyVoteByRemedy] = useState<Map<string, "up" | "down">>(new Map());
  const [openRemedyId, setOpenRemedyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    const q = query(collection(db, "saves"), where("userId", "==", uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setSavedIds(new Set(snap.docs.map((d) => d.data().remedyId as string)));
      },
      () => {
        // Stille feil, på linje med stemmegivning.
      }
    );
    return unsub;
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "votes"), where("userId", "==", uid));
    const unsub = onSnapshot(q, (snap) => {
      setMyVoteByRemedy(new Map(snap.docs.map((d) => [d.data().remedyId as string, d.data().voteType as "up" | "down"])));
    });
    return unsub;
  }, [uid]);

  const subs = useMemo(() => (category ? HEALTH_SUBCATEGORIES.filter((s) => s.topCategoryId === category.id) : []), [category]);

  const categoryProblems = useMemo(() => {
    const slugs = new Set(subs.flatMap((s) => s.problemSlugs));
    return problems.filter((p) => slugs.has(p.slug));
  }, [subs, problems]);

  const categoryRemedies = useMemo(() => {
    const problemIds = new Set(categoryProblems.map((p) => p.id));
    return remedies.filter((r) => problemIds.has(r.problemId));
  }, [categoryProblems, remedies]);

  const remedyCountByProblemId = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of categoryRemedies) map.set(r.problemId, (map.get(r.problemId) ?? 0) + 1);
    return map;
  }, [categoryRemedies]);

  const totalVotes = useMemo(() => categoryRemedies.reduce((sum, r) => sum + r.totalVotes, 0), [categoryRemedies]);

  const topRemedies = useMemo(
    () =>
      [...categoryRemedies]
        .sort((a, b) => wilsonScore(b.votesUp, b.totalVotes) - wilsonScore(a.votesUp, a.totalVotes))
        .slice(0, 4),
    [categoryRemedies]
  );

  const openIndex = openRemedyId ? topRemedies.findIndex((r) => r.id === openRemedyId) : -1;
  const openRemedy = openIndex >= 0 ? topRemedies[openIndex] : null;

  async function handleVote(remedyId: string, voteType: "up" | "down") {
    if (!uid) return;
    setVotingId(remedyId);
    try {
      await castVote(remedyId, uid, voteType, "");
    } catch {
      // ignored
    } finally {
      setVotingId(null);
    }
  }

  async function handleToggleSaved(remedyId: string) {
    if (!uid) return;
    setSavingId(remedyId);
    try {
      await setSaved(remedyId, uid, !savedIds.has(remedyId));
    } catch {
      // ignored
    } finally {
      setSavingId(null);
    }
  }

  if (!category) {
    return (
      <main className="min-h-full" style={{ background: "#f5eee0" }}>
        <div className="mx-auto w-full max-w-2xl px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
          <Link href="/alle" className="text-sm transition-colors hover:text-[#a93415]" style={{ color: "#4a473f" }}>
            &larr; Alle kategorier
          </Link>
          <p className="mt-8 text-sm" style={{ color: "#4a473f" }}>
            Fant ikke denne kategorien.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative flex min-h-screen flex-col"
      style={{ background: "#efe6cf", "--focus-ring": "#a93415" } as React.CSSProperties}
    >
      {/* Sidehode — KATEGORISIDE.md "retning C": skogsgrønt, to-kolonne grid
          (tekst + buet kategoribilde), samme .phead-mønster som /alle og
          /problem/[id]. Ingen "Utforsk"-brødsmule (fasitens mellomsteg) —
          siten har ingen egen /utforsk-side å peke den til, så brødsmulene
          følger samme to-nivå mønster som resten av siten. */}
      {/* Lys topp (samme #faf5ea som navbaren og forsidens hero), kun
          kategoribildet til venstre for tittelen. Arkbildet til høyre er
          fjernet. */}
      <header className="relative overflow-hidden" style={{ background: "#faf5ea" }}>
        <Paper id="kat-head" variant="light" mottle={false} />
        <div
          className="relative z-10 mx-auto grid grid-cols-1 items-center gap-6"
          style={{ maxWidth: 1480, paddingInline: "clamp(20px,3vw,40px)", paddingBlock: "56px 60px" }}
        >
          <ol className="m-0 flex flex-wrap gap-2 p-0 text-[13px]" style={{ color: "#6d685c" }} aria-label="Brødsmuler">
            <li>
              <Link href="/" className="transition-colors hover:text-[#a93415]">
                Forside
              </Link>
            </li>
            <li aria-current="page" className="before:mr-2 before:content-['/'] before:text-[#6d685c]" style={{ color: "#111110" }}>
              {category.name}
            </li>
          </ol>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-5">
              {/* Kategoribildet fra forsidens RAVN-seksjoner (ravnIcon), på en
                  Sand-sirkel med 16 % luft: ikonene har svarte detaljer og skal
                  aldri ligge rett på mørk flate (ravn_trinnvis README). Uten
                  bilde for kategorien: strekikonet som før. */}
              {ravnIcon(category.id) ? (
                <span
                  className="relative block shrink-0 rounded-full"
                  style={{ width: "clamp(96px,11vw,150px)", aspectRatio: "1/1", background: "#d4c9b3" }}
                >
                  {/* inset, ikke padding: prosent-padding regnes av radens
                      bredde, ikke sirkelens. */}
                  <span
                    role="img"
                    aria-label={category.name}
                    className="absolute inset-[16%] block bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${ravnIcon(category.id)})` }}
                  />
                </span>
              ) : (
                <span className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-[6px]" style={{ background: "#efe6cf", color: "#111110" }}>
                  <svg viewBox="0 0 24 24" aria-hidden className="h-[38px] w-[38px]" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d={category.d} />
                  </svg>
                </span>
              )}
              <div className="flex flex-col gap-1.5">
                <p className="font-lora m-0 text-[clamp(16px,1.4vw,20px)] font-medium uppercase leading-[1.2] tracking-[0.16em]" style={{ color: "#6d685c" }}>
                  Kategori
                </p>
                <h1 className="font-lora m-0 text-[clamp(34px,3.6vw,52px)] leading-[1.08] text-balance" style={{ color: "#111110" }}>
                  {category.name}
                </h1>
              </div>
            </div>
            <p className="m-0 max-w-[46ch] text-[clamp(17px,1.3vw,19px)] leading-[1.55] text-pretty" style={{ color: "#3d3a33" }}>
              {category.tagline}
            </p>
            {categoryRemedies.length > 0 && (
              <p className="m-0 text-sm" style={{ color: "#6d685c" }}>
                <b style={{ color: "#111110", fontWeight: 600 }}>{categoryRemedies.length}</b> råd ·{" "}
                <b style={{ color: "#111110", fontWeight: 600 }}>{subs.length}</b> emner ·{" "}
                <b style={{ color: "#111110", fontWeight: 600 }}>{totalVotes.toLocaleString("nb-NO")}</b> stemmer
              </p>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden" style={{ background: "#efe6cf" }}>
        <Paper id="kat-body" variant="light" />
        {/* z-[3] (ikke z-10) — bare nok til å klarere Paper (z:2) og
            løvetann-lagene (z:1), så seksjonens eget korn får lov til å
            skinne gjennom på bare bakgrunn her (f.eks. rundt søkefeltet) i
            stedet for å bli usynlig bak en unødvendig høy wrapper-z-index.
            Overflater med egen farge (kort, "Om kategorien") legger uansett
            sitt eget Paper-lag, uavhengig av denne verdien. */}
        <div
          className="relative z-[3] mx-auto flex flex-col gap-[clamp(48px,6vw,72px)]"
          style={{ maxWidth: 1480, paddingInline: "clamp(20px,3vw,40px)", paddingBlock: "36px 72px" }}
        >
          {/* Om kategorien — én lys flate med avrundede hjørner (den doble
              rammen er fjernet).
              Eget Paper-lag her (ikke bare seksjonens) — sitronen ligger inni
              den ytre z-10-innholdspakken, som i seg selv ligger OVER
              seksjonens delte Paper (kat-body), så uten sitt eget lag ville
              denne boksen vist helt flatt i stedet for korn. */}
          <div
            className="relative max-w-[860px] overflow-hidden"
            style={{ background: "#f7f1e4", borderRadius: 6 }}
          >
            <Paper id={`kat-about-${category.id}`} variant="light" />
            <div className="relative z-10" style={{ padding: "40px clamp(28px,3.4vw,52px) 36px" }}>
              <p className="font-lora m-0 mb-2.5 text-[clamp(16px,1.4vw,20px)] font-medium uppercase leading-[1.2] tracking-[0.16em]" style={{ color: "#6d685c" }}>
                Om kategorien
              </p>
              <p className="m-0 text-[17px] leading-[1.65] text-pretty" style={{ color: "#3d3a33" }}>
                {CATEGORY_INTRO[category.id]}
              </p>
              {category.id === "helseogvelvare" && (
                <p className="m-0 mt-3 text-sm italic" style={{ color: "#5a4a3a" }}>
                  Rådene erstatter ikke helsehjelp. Ved alvorlige eller langvarige plager, kontakt lege.
                </p>
              )}
            </div>
          </div>

          {/* Velg plage — kort-rutenett (.sgrid/.scard) med søk, kun når
              kategorien faktisk har undergrupper (Mat & konservering har
              ingen ennå, se HEALTH_SUBCATEGORIES). */}
          {subs.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-lora m-0 text-[clamp(28px,3vw,38px)] leading-[1.1]" style={{ color: "#111110" }}>
                  Velg plage
                </h2>
                <div
                  className="group relative max-w-[360px] flex-[0_1_360px] overflow-hidden transition-shadow duration-300 hover:shadow-[inset_0_0_0_1px_#6d685c]"
                  style={{ borderRadius: 6, background: "#fffaf0", boxShadow: "inset 0 0 0 1px #cdc6b4" }}
                >
                  <Paper id={`kat-search-${category.id}`} variant="light" mottle={false} />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100"
                    style={{ boxShadow: "inset 0 0 0 2px #a93415" }}
                  />
                  <IconSearch className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[#6d685c]" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Søk i ${category.name} …`}
                    aria-label={`Søk i ${category.name}`}
                    className="no-focus-ring relative z-10 h-[52px] w-full bg-transparent pl-[48px] pr-4 font-figtree text-base placeholder:text-[#6d685c] focus:outline-none"
                  />
                </div>
              </div>
              <CategorySubcategoryList
                topCategoryId={category.id}
                problems={problems}
                variant="cards"
                remedyCountByProblemId={remedyCountByProblemId}
                query={searchQuery}
              />
            </div>
          )}

          {/* Mest stemte i kategorien — ekte topp-stemte råd, samme RemedyCard
              som resten av siten. */}
          {topRemedies.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-lora m-0 text-[clamp(28px,3vw,38px)] leading-[1.1]" style={{ color: "#111110" }}>
                  Mest stemte i {category.name}
                </h2>
                <Link
                  href={`/alle#${category.id}`}
                  className="group inline-flex items-center gap-2 font-semibold no-underline transition-colors hover:text-[#111110]"
                  style={{ color: "#a93415" }}
                >
                  Se alle {categoryRemedies.length} råd
                  <IconArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                </Link>
              </div>
              <ul className="m-0 grid list-none gap-x-[22px] gap-y-7 p-0" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,270px),1fr))" }}>
                {topRemedies.map((r) => (
                  <li key={r.id} className="flex">
                    <RemedyCard
                      remedy={r}
                      categoryLabel={category.name}
                      image={REMEDY_IMAGES[r.title]?.src}
                      isVoted={myVoteByRemedy.get(r.id) === "up"}
                      onToggleVote={() => handleVote(r.id, "up")}
                      voting={votingId === r.id}
                      isSaved={savedIds.has(r.id)}
                      onToggleSave={() => handleToggleSaved(r.id)}
                      saving={savingId === r.id}
                      onOpenPreview={() => setOpenRemedyId(r.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Fordypningsartikler — samme bilde-venstre/tekst-høyre mønster som
          tidligere lå på forsiden, nå flyttet til kategorien de hører til. */}
      {CATEGORY_ARTICLES[category.id] && (
        <div className="relative" style={{ background: "#f5eee0", borderTop: "1px solid #d9d2c1" }}>
          {CATEGORY_ARTICLES[category.id].map((article, i) => (
            <section key={article.href} className="relative">
              <div
                className={`mx-auto flex flex-col items-stretch py-8 sm:py-12 ${
                  i % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"
                }`}
                style={{ maxWidth: "var(--content-max)", paddingInline: "var(--page-pad)" }}
              >
                <div className="relative w-full shrink-0 sm:w-2/3">
                  <Link
                    href={article.href}
                    className="relative block aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]"
                  >
                    <Image src={article.image} alt={article.alt} fill className="object-cover" />
                  </Link>
                  <a
                    href={article.credit.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 left-3 z-10 text-[10px] text-paper/80 hover:text-paper"
                  >
                    Foto: {article.credit.text}
                  </a>
                </div>

                <div className="flex w-full flex-col items-start justify-center gap-3 px-6 py-10 sm:w-1/3 sm:px-8">
                  <p className="font-figtree text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "#4a473f" }}>
                    {article.kicker}
                  </p>
                  <h2 className="font-lora text-2xl sm:text-3xl" style={{ color: "#111110" }}>
                    {article.title}
                  </h2>
                  <p style={{ color: "#3d3a33" }}>{article.description}</p>
                  <PrimaryButton href={article.href} className="mt-2">
                    Les artikkel
                    <IconArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      <ShareAdviceBox id="kat-cta" />

      <RemedyPreviewModal
        remedy={openRemedy}
        problemName={category.name}
        onClose={() => setOpenRemedyId(null)}
        onVote={(direction) => openRemedy && handleVote(openRemedy.id, direction)}
        voting={votingId !== null}
        myVote={openRemedy ? myVoteByRemedy.get(openRemedy.id) : undefined}
        saved={!!openRemedy && savedIds.has(openRemedy.id)}
        onToggleSave={() => openRemedy && handleToggleSaved(openRemedy.id)}
        saving={!!openRemedy && savingId === openRemedy.id}
        onPrev={openIndex > 0 ? () => setOpenRemedyId(topRemedies[openIndex - 1].id) : undefined}
        onNext={openIndex >= 0 && openIndex < topRemedies.length - 1 ? () => setOpenRemedyId(topRemedies[openIndex + 1].id) : undefined}
      />
    </main>
  );
}
