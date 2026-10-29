"use client";

import { use, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { castVote } from "@/lib/votes";
import { setSaved } from "@/lib/saves";
import { wilsonScore } from "@/lib/wilson";
import { ACUTE_RISK_SLUGS, TOP_CATEGORIES, subcategoryForSlug } from "@/lib/categories";
import { REMEDY_IMAGES } from "@/lib/remedyImages";
import { EmergencyButton } from "@/components/EmergencyButton";
import { RemedyPreviewModal } from "@/components/RemedyPreviewModal";
import { RemedyCard } from "@/components/RemedyCard";
import { SecondaryButton } from "@/components/Button";
import { Paper } from "@/components/Paper";
import { CATEGORY_ICON, IconSprig } from "@/components/icons";
import { ShareAdviceBox } from "@/components/ShareAdviceBox";
import type { Problem, Remedy, Vote } from "@/lib/types";

export default function RemediesPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = use(params);
  const uid = useAnonAuth();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [myVotes, setMyVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [openRemedyId, setOpenRemedyId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<"stemt" | "nyeste">("stemt");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "problems", problemId), (snap) => {
      if (snap.exists()) {
        setProblem({ id: snap.id, ...(snap.data() as Omit<Problem, "id">) });
      }
    });
    return unsub;
  }, [problemId]);

  useEffect(() => {
    const q = query(collection(db, "remedies"), where("problemId", "==", problemId));
    const unsub = onSnapshot(q, (snap) => {
      setRemedies(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Remedy, "id">) })));
      setLoading(false);
    });
    return unsub;
  }, [problemId]);

  const rankedRemedies = useMemo(() => {
    if (sortMode === "nyeste") {
      return [...remedies].sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
    }
    return [...remedies].sort(
      (a, b) => wilsonScore(b.votesUp, b.totalVotes) - wilsonScore(a.votesUp, a.totalVotes)
    );
  }, [remedies, sortMode]);

  const topCategory = useMemo(() => {
    if (!problem) return undefined;
    const sub = subcategoryForSlug(problem.slug);
    return sub ? TOP_CATEGORIES.find((c) => c.id === sub.topCategoryId) : undefined;
  }, [problem]);

  const totalVotesSum = useMemo(() => remedies.reduce((sum, r) => sum + r.totalVotes, 0), [remedies]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "votes"), where("userId", "==", uid));
    const unsub = onSnapshot(q, (snap) => {
      setMyVotes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vote, "id">) })));
    });
    return unsub;
  }, [uid]);

  const myVoteByRemedy = useMemo(
    () => new Map(myVotes.map((v) => [v.remedyId, v.voteType])),
    [myVotes]
  );

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

  const openIndex = openRemedyId ? rankedRemedies.findIndex((r) => r.id === openRemedyId) : -1;
  const openRemedy = openIndex >= 0 ? rankedRemedies[openIndex] : null;

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

  const RankIcon = (problem && CATEGORY_ICON[problem.slug]) || IconSprig;

  return (
    <main className="relative flex min-h-screen flex-col" style={{ background: "#efe6cf" }}>
      {/* Sidehode — mørk skogsgrønn, matcher fasit/mal-liste-dybde.html sin
          .phead-variant (samme farge/stil som navbaren, ikke den lyse
          standardvarianten). */}
      <header className="relative overflow-hidden" style={{ background: "#111110" }}>
        <Paper id="problem-head" variant="dark" mottle={false} />
        <div
          className="relative z-10 mx-auto flex flex-col gap-4"
          style={{ maxWidth: 1480, paddingInline: "clamp(20px,3vw,40px)", paddingBlock: "56px 60px" }}
        >
          <div className="flex items-center justify-between gap-4">
            <ol className="m-0 flex flex-wrap gap-2 p-0 text-[13px]" style={{ color: "#cdc6b4" }} aria-label="Brødsmuler">
              <li>
                <Link href="/" className="transition-colors hover:text-[#a93415]">
                  Forside
                </Link>
              </li>
              {topCategory && (
                <li className="before:mr-2 before:content-['/'] before:text-[#6d685c]">
                  <Link href={`/kategori/${topCategory.id}`} className="transition-colors hover:text-[#a93415]">
                    {topCategory.name}
                  </Link>
                </li>
              )}
              <li aria-current="page" className="before:mr-2 before:content-['/'] before:text-[#6d685c]" style={{ color: "#f5eee0" }}>
                {problem?.name}
              </li>
            </ol>
            {problem && ACUTE_RISK_SLUGS.includes(problem.slug) && <EmergencyButton />}
          </div>

          <div className="flex items-center gap-5">
            <span className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-[6px]" style={{ background: "#efe6cf", color: "#111110" }}>
              <RankIcon className="h-[38px] w-[38px]" />
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="font-lora m-0 text-[clamp(16px,1.4vw,20px)] font-medium uppercase leading-[1.2] tracking-[0.16em]" style={{ color: "#d4c9b3" }}>
                Plage
              </p>
              <h1 className="font-lora m-0 text-[clamp(34px,3.6vw,52px)] leading-[1.08] text-balance" style={{ color: "#f5eee0" }}>
                {problem ? problem.name : "Råd"}
              </h1>
            </div>
          </div>

          {!loading && remedies.length > 0 && (
            <p className="m-0 text-sm" style={{ color: "#cdc6b4" }}>
              <b style={{ color: "#f5eee0", fontWeight: 600 }}>{remedies.length}</b> råd ·{" "}
              <b style={{ color: "#f5eee0", fontWeight: 600 }}>{totalVotesSum}</b> stemmer
            </p>
          )}
        </div>
      </header>

      {/* Liste — råd-kort i rutenett, samme komponent (RemedyCard) som resten
          av siten etter hvert skal bruke. Ingen fabrikkerte filter-chips
          eller "Prøvd av"-tall her (se RemedyCard-kommentaren) — bare et ekte
          sorteringsvalg (stemmer/nyeste), som vi faktisk har data til. */}
      <section className="relative flex-1" style={{ background: "#efe6cf" }}>
        <div
          className="relative z-10 mx-auto flex flex-col gap-[22px]"
          style={{ maxWidth: 1480, paddingInline: "clamp(20px,3vw,40px)", paddingBlock: "36px 72px" }}
        >
          {rankedRemedies.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Sorter etter">
              <SecondaryButton
                tone="olive"
                aria-pressed={sortMode === "stemt"}
                onClick={() => setSortMode("stemt")}
                className="!px-4 !py-3 !text-[13px] !font-semibold !normal-case !tracking-normal"
              >
                Mest stemt
              </SecondaryButton>
              <SecondaryButton
                tone="olive"
                aria-pressed={sortMode === "nyeste"}
                onClick={() => setSortMode("nyeste")}
                className="!px-4 !py-3 !text-[13px] !font-semibold !normal-case !tracking-normal"
              >
                Nyeste
              </SecondaryButton>
            </div>
          )}

          {loading && <p className="text-sm text-[#4a473f]">Laster råd…</p>}

          {!loading && remedies.length === 0 && (
            <p className="text-sm text-[#4a473f]">Ingen råd registrert for denne plagen ennå.</p>
          )}

          {rankedRemedies.length > 0 && (
            <ul className="m-0 grid list-none gap-x-[22px] gap-y-7 p-0" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,270px),1fr))" }}>
              {rankedRemedies.map((r) => {
                const myVote = myVoteByRemedy.get(r.id);
                const isSaved = savedIds.has(r.id);
                return (
                  <li key={r.id} className="flex">
                    <RemedyCard
                      remedy={r}
                      categoryLabel={topCategory?.name ?? "RAVN"}
                      image={REMEDY_IMAGES[r.title]?.src}
                      isVoted={myVote === "up"}
                      onToggleVote={() => handleVote(r.id, "up")}
                      voting={votingId === r.id}
                      isSaved={isSaved}
                      onToggleSave={() => handleToggleSaved(r.id)}
                      saving={savingId === r.id}
                      onOpenPreview={() => setOpenRemedyId(r.id)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <ShareAdviceBox
        id="problem-cta"
        title={<>Har du et råd mot {problem?.name.toLowerCase()}?</>}
        href={`/problem/${problemId}/legg-til`}
        button="+ Legg til nytt råd"
      />

      <RemedyPreviewModal
        remedy={openRemedy}
        problemName={problem?.name}
        note={
          problem && ACUTE_RISK_SLUGS.includes(problem.slug)
            ? "Smertene akutte eller uforklarlige? Ring Legevakten på 116 117 (gratis, døgnåpent), eller 113 ved livstruende tilstander."
            : undefined
        }
        onClose={() => setOpenRemedyId(null)}
        onVote={(direction) => openRemedy && handleVote(openRemedy.id, direction)}
        voting={votingId !== null}
        myVote={openRemedy ? myVoteByRemedy.get(openRemedy.id) : undefined}
        saved={!!openRemedy && savedIds.has(openRemedy.id)}
        onToggleSave={() => openRemedy && handleToggleSaved(openRemedy.id)}
        saving={!!openRemedy && savingId === openRemedy.id}
        onPrev={openIndex > 0 ? () => setOpenRemedyId(rankedRemedies[openIndex - 1].id) : undefined}
        onNext={openIndex >= 0 && openIndex < rankedRemedies.length - 1 ? () => setOpenRemedyId(rankedRemedies[openIndex + 1].id) : undefined}
      />
    </main>
  );
}
