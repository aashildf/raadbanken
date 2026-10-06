"use client";

import { use, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { castVote } from "@/lib/votes";
import { setSaved } from "@/lib/saves";
import { wilsonScore } from "@/lib/wilson";
import { ACUTE_RISK_SLUGS } from "@/lib/categories";
import { EmergencyButton } from "@/components/EmergencyButton";
import { RemedyPreviewModal } from "@/components/RemedyPreviewModal";
import { PrimaryButton } from "@/components/Button";
import { IconArrowDown, IconArrowUp, IconHeart } from "@/components/icons";
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

  const rankedRemedies = useMemo(
    () =>
      [...remedies].sort(
        (a, b) => wilsonScore(b.votesUp, b.totalVotes) - wilsonScore(a.votesUp, a.totalVotes)
      ),
    [remedies]
  );

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

  return (
    <main className="relative flex min-h-screen flex-col bg-paper">
      <div
        className="relative mx-auto w-full max-w-4xl flex-1 py-8 sm:py-12"
        style={{ paddingInline: "var(--page-pad)" }}
      >
        {/* Toppraden */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/alle" className="text-sm font-medium text-plum-700 transition-opacity hover:opacity-70">
            ← Alle kategorier
          </Link>
          {problem && ACUTE_RISK_SLUGS.includes(problem.slug) && <EmergencyButton />}
        </div>

        {/* Overskrift — kickeren bruker bevisst IKKE font-display: den klassen
            peker (etter et tidligere fontbytte) på samme serif som
            overskriften under, og store bokstaver + bokstavavstand i en
            kalligrafisk serif er vanskelig å lese uansett størrelse/vekt.
            Vanlig sans (sidens body-font) leser derimot fint som liten,
            sporet versal-tekst. */}
        <p className="font-sans text-sm font-bold uppercase tracking-[0.14em] text-plum-700">Folkemedisin</p>
        <h1 className="font-serif-display mt-2 text-4xl text-ink sm:text-5xl">
          {problem ? `Råd mot ${problem.name.toLowerCase()}` : "Råd"}
        </h1>

        {loading && (
          <p className="mt-8 text-sm text-ink/40">Laster råd…</p>
        )}

        {/* Råd-liste — klikk åpner en forhåndsvisning uten å forlate listen (se
            RemedyPreviewModal), i stedet for å navigere til en egen side og
            miste scroll-posisjonen når man går tilbake. */}
        <ul className="mt-6 flex flex-col divide-y divide-ink/10 border-t border-b border-ink/10">
          {rankedRemedies.map((r, i) => {
            const myVote = myVoteByRemedy.get(r.id);
            const isSaved = savedIds.has(r.id);
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 px-3 py-4 -mx-3 transition-colors hover:bg-[rgba(111,143,108,0.14)] sm:gap-4"
              >
                <span className="font-serif-display w-8 shrink-0 text-base sm:text-lg" style={{ color: "var(--gold)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <button onClick={() => setOpenRemedyId(r.id)} className="group min-w-0 flex-1 text-left">
                  <span className="block truncate text-base font-semibold text-ink transition-colors group-hover:text-plum-700 sm:text-lg">
                    {r.title}
                  </span>
                  {r.totalVotes > 0 && (
                    <span className="mt-0.5 block truncate text-xs text-ink-soft">
                      {r.successRate}% positiv · {r.totalVotes} stemmer
                    </span>
                  )}
                </button>
                <div className="hidden h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-ink/10 sm:block md:w-32">
                  <div className="h-full rounded-full bg-sage" style={{ width: `${r.successRate ?? 0}%` }} />
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => handleVote(r.id, "up")}
                    disabled={!uid || votingId !== null}
                    aria-label="Fungerte"
                    aria-pressed={myVote === "up"}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                      myVote === "up" ? "text-[#f5efeb]" : "text-ink hover:bg-[#E1B08C] hover:text-[#2c232e]"
                    }`}
                    style={
                      myVote === "up"
                        ? { background: "rgba(79,107,74,0.55)", border: "1px solid rgba(79,107,74,0.55)" }
                        : { border: "1px solid rgba(44,35,46,0.22)" }
                    }
                  >
                    <IconArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleVote(r.id, "down")}
                    disabled={!uid || votingId !== null}
                    aria-label="Fungerte ikke"
                    aria-pressed={myVote === "down"}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                      myVote === "down" ? "text-[#2c232e]" : "text-ink hover:bg-[#E1B08C] hover:text-[#2c232e]"
                    }`}
                    style={
                      myVote === "down"
                        ? { background: "rgba(225,176,140,0.82)", border: "1px solid rgba(225,176,140,0.82)" }
                        : { border: "1px solid rgba(44,35,46,0.22)" }
                    }
                  >
                    <IconArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleToggleSaved(r.id)}
                    disabled={!uid || savingId === r.id}
                    aria-label={isSaved ? "Fjern fra mine lagrede råd" : "Lagre i mine lagrede råd"}
                    aria-pressed={isSaved}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#E1B08C] hover:text-[#2c232e] disabled:opacity-40 ${
                      isSaved ? "text-[#E1B08C]" : "text-ink"
                    }`}
                    style={{ border: "1px solid rgba(44,35,46,0.22)" }}
                  >
                    <IconHeart
                      className="h-3 w-3"
                      filled={isSaved}
                      style={isSaved ? { stroke: "var(--ink-soft)" } : undefined}
                    />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {!loading && remedies.length === 0 && (
          <p className="mt-8 text-sm text-ink/50">Ingen råd registrert for denne plagen ennå.</p>
        )}

        <PrimaryButton href={`/problem/${problemId}/legg-til`} className="mt-8 w-full">
          + Legg til nytt råd
        </PrimaryButton>
      </div>

      <RemedyPreviewModal
        remedy={openRemedy}
        problemName={problem?.name}
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
