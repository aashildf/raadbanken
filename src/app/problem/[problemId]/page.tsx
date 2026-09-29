"use client";

import { use, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { castVote } from "@/lib/votes";
import { setSaved } from "@/lib/saves";
import { wilsonScore } from "@/lib/wilson";
import { ACUTE_RISK_SLUGS } from "@/lib/categories";
import { EmergencyButton } from "@/components/EmergencyButton";
import { RemedyPreviewModal } from "@/components/RemedyPreviewModal";
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
    <main className="relative flex min-h-screen flex-col">
      {/* Bakgrunn */}
      <Image
        src="/bakgrunner/beige_bg.jpg"
        alt=""
        fill
        style={{ objectFit: "cover" }}
        priority
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(210,195,168,0.4)" }}
        aria-hidden="true"
      />
      {/* Gradient for lesbarhet på overskrift */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{ background: "linear-gradient(to bottom, rgba(238,223,196,0.72) 0%, transparent 100%)", zIndex: 1 }}
        aria-hidden="true"
      />

      <div
        className="relative mx-auto w-full max-w-4xl flex-1 py-8 sm:py-12"
        style={{ paddingInline: "var(--page-pad)", zIndex: 2 }}
      >
        {/* Toppraden */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/alle"
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "#432065" }}
          >
            ← Alle kategorier
          </Link>
          {problem && ACUTE_RISK_SLUGS.includes(problem.slug) && <EmergencyButton />}
        </div>

        {/* Overskrift */}
        <p
          className="mt-4 font-display text-[10px] uppercase tracking-[0.3em] text-plum-800/70"
          style={{ textShadow: "0 1px 6px rgba(238,223,196,0.9)" }}
        >
          Folkemedisin
        </p>
        <h1
          className="font-serif-display mt-0.5 text-2xl text-ink sm:text-3xl"
          style={{ textShadow: "0 1px 0 rgba(255,248,235,0.95), 0 2px 14px rgba(220,200,160,0.7)" }}
        >
          {problem ? `Råd mot ${problem.name.toLowerCase()}` : "Råd"}
        </h1>

        {loading && (
          <p className="mt-8 text-sm text-ink/40">Laster råd…</p>
        )}

        {/* Råd-liste — klikk åpner en forhåndsvisning uten å forlate listen (se
            RemedyPreviewModal), i stedet for å navigere til en egen side og
            miste scroll-posisjonen når man går tilbake. */}
        <ul className="mt-4 flex flex-col divide-y divide-ink/10 border-t border-ink/10">
          {rankedRemedies.map((r) => {
            const myVote = myVoteByRemedy.get(r.id);
            return (
              <li key={r.id} className="flex items-center gap-3 py-3.5">
                <button
                  onClick={() => setOpenRemedyId(r.id)}
                  className="group min-w-0 flex-1 text-left"
                >
                  <span className="block font-serif-display text-base leading-snug text-ink transition-colors group-hover:text-plum-700">
                    {r.title}
                  </span>
                  {r.totalVotes > 0 && (
                    <span className="mt-0.5 block text-xs text-ink-soft">
                      {r.successRate}% positiv · {r.totalVotes} stemmer
                    </span>
                  )}
                </button>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => handleVote(r.id, "up")}
                    disabled={!uid || votingId !== null}
                    aria-label="Fungerte"
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#E1B08C] hover:text-[#2c232e] disabled:opacity-40 ${
                      myVote === "up" ? "text-sage" : "text-ink"
                    }`}
                    style={{ border: "1px solid rgba(44,35,46,0.22)" }}
                  >
                    <IconArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleVote(r.id, "down")}
                    disabled={!uid || votingId !== null}
                    aria-label="Fungerte ikke"
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#E1B08C] hover:text-[#2c232e] disabled:opacity-40 ${
                      myVote === "down" ? "text-rust" : "text-ink"
                    }`}
                    style={{ border: "1px solid rgba(44,35,46,0.22)" }}
                  >
                    <IconArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleToggleSaved(r.id)}
                    disabled={!uid || savingId === r.id}
                    aria-label={savedIds.has(r.id) ? "Fjern fra mine lagrede råd" : "Lagre i mine lagrede råd"}
                    aria-pressed={savedIds.has(r.id)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#E1B08C] hover:text-[#2c232e] disabled:opacity-40 ${
                      savedIds.has(r.id) ? "text-[#E1B08C]" : "text-ink"
                    }`}
                    style={{ border: "1px solid rgba(44,35,46,0.22)" }}
                  >
                    <IconHeart className="h-3 w-3" filled={savedIds.has(r.id)} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {!loading && remedies.length === 0 && (
          <p className="mt-8 text-sm text-ink/50">Ingen råd registrert for denne plagen ennå.</p>
        )}

        <Link
          href={`/problem/${problemId}/legg-til`}
          className="mt-6 block rounded-2xl px-5 py-3.5 text-center text-sm font-semibold transition-opacity hover:opacity-85"
          style={{ background: "#3E2E3A", color: "#FFFAEB" }}
        >
          + Legg til nytt råd
        </Link>
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
