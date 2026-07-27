"use client";

import { use, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
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
      // ignored
    } finally {
      setVotingId(null);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col">
      {/* Bakgrunn */}
      <Image
        src="/bakgrunner/beige_bg.png"
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
        className="relative mx-auto w-full max-w-2xl flex-1 py-8 sm:py-12"
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

        {/* Råd-liste */}
        <ul className="mt-4 flex flex-col gap-2">
          {rankedRemedies.map((r) => {
            const myVote = myVoteByRemedy.get(r.id);
            return (
              <li
                key={r.id}
                className="group relative overflow-hidden rounded-2xl"
                style={{ background: "rgba(246,240,227,0.92)", border: "1px solid rgba(44,35,46,0.08)" }}
              >
                {/* Overlay-lenke — z-10, under knappene (z-20) men over bakgrunnen */}
                <Link
                  href={`/remedy/${r.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={r.title}
                />

                <div className="relative flex items-center gap-3 px-4 py-3.5">
                  {/* Venstre: tittel + les mer — pointer-events-none siden overlay tar klikk */}
                  <div className="min-w-0 flex-1 pointer-events-none">
                    <span className="block font-serif-display text-base leading-snug text-ink transition-colors group-hover:text-plum-700">
                      {r.title}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-plum-700 opacity-80">
                        Les mer →
                      </span>
                      {r.totalVotes > 0 && (
                        <span className="text-xs text-ink/35">
                          {r.successRate}% positiv · {r.totalVotes} stemmer
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Høyre: tommelknapper — z-20, named groups så kun den hovrete ikonet skalerer */}
                  <div className="relative z-20 flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleVote(r.id, "up")}
                      disabled={!uid || votingId !== null}
                      className={`group/up flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all disabled:cursor-default disabled:opacity-40 ${myVote === "up" ? "scale-110" : ""}`}
                      style={
                        myVote === "up"
                          ? { background: "rgba(255,255,255,0.95)", color: "#432065", boxShadow: "0 0 0 1.5px rgba(67,32,101,0.22)" }
                          : { background: "rgba(255,255,255,0.70)", color: "rgba(44,35,46,0.55)" }
                      }
                    >
                      <span className={`transition-transform duration-150 ${myVote === "up" ? "scale-110" : "group-hover/up:scale-125"}`}>
                        <ThumbIcon direction="up" className="h-6 w-6" />
                      </span>
                      <span>{r.votesUp}</span>
                    </button>
                    <button
                      onClick={() => handleVote(r.id, "down")}
                      disabled={!uid || votingId !== null}
                      className={`group/dn flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all disabled:cursor-default disabled:opacity-40 ${myVote === "down" ? "scale-110" : ""}`}
                      style={
                        myVote === "down"
                          ? { background: "rgba(255,255,255,0.95)", color: "#432065", boxShadow: "0 0 0 1.5px rgba(67,32,101,0.22)" }
                          : { background: "rgba(255,255,255,0.70)", color: "rgba(44,35,46,0.55)" }
                      }
                    >
                      <span className={`transition-transform duration-150 ${myVote === "down" ? "scale-110" : "group-hover/dn:scale-125"}`}>
                        <ThumbIcon direction="down" className="h-6 w-6" />
                      </span>
                      <span>{r.votesDown}</span>
                    </button>
                  </div>
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
          className="mt-6 block rounded-2xl px-5 py-3.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ background: "#432065" }}
        >
          + Legg til nytt råd
        </Link>
      </div>
    </main>
  );
}
