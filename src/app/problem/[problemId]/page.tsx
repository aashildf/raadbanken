"use client";

import { use, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { castVote } from "@/lib/votes";
import { wilsonScore } from "@/lib/wilson";
import { ACUTE_RISK_SLUGS } from "@/lib/categories";
import { EmergencyButton } from "@/components/EmergencyButton";
import { ThumbIcon } from "@/components/ThumbIcon";
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

  async function handleVote(remedyId: string, voteType: "up" | "down") {
    if (!uid) return;
    setVotingId(remedyId);
    try {
      await castVote(remedyId, uid, voteType, "");
    } catch {
      // ignored: knappene går tilbake til normal tilstand, bruker kan prøve igjen
    } finally {
      setVotingId(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="text-sm text-zinc-500">
          &larr; Tilbake
        </Link>
        {problem && ACUTE_RISK_SLUGS.includes(problem.slug) && <EmergencyButton />}
      </div>
      <h1 className="text-2xl font-bold">
        {problem ? `Råd mot ${problem.name.toLowerCase()}` : "Råd"}
      </h1>

      {loading && <p className="text-sm text-zinc-500">Laster...</p>}

      <ul className="flex flex-col gap-2">
        {rankedRemedies.map((r) => {
          const myVote = myVoteByRemedy.get(r.id);
          return (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-xl border border-zinc-200 px-4 py-3"
            >
              <Link href={`/remedy/${r.id}`} className="block hover:opacity-70">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-lg font-medium">{r.title}</span>
                  <span className="shrink-0 text-sm font-semibold text-emerald-600">
                    {r.totalVotes > 0 ? `${r.successRate}% positiv` : "Ingen stemmer"}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">{r.totalVotes} stemmer</span>
              </Link>

              <div className="flex gap-2">
                <button
                  onClick={() => handleVote(r.id, "up")}
                  disabled={!uid || votingId !== null}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                    myVote === "up"
                      ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  <ThumbIcon direction="up" className="h-6 w-6" />
                  {r.votesUp}
                </button>
                <button
                  onClick={() => handleVote(r.id, "down")}
                  disabled={!uid || votingId !== null}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                    myVote === "down"
                      ? "bg-red-100 text-red-700 ring-1 ring-red-600"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  <ThumbIcon direction="down" className="h-6 w-6" />
                  {r.votesDown}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {!loading && remedies.length === 0 && (
        <p className="text-sm text-zinc-500">Ingen råd registrert for denne plagen ennå.</p>
      )}

      <Link
        href={`/problem/${problemId}/legg-til`}
        className="mt-4 rounded-xl bg-zinc-900 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-zinc-700"
      >
        + Legg til nytt råd
      </Link>
    </main>
  );
}
