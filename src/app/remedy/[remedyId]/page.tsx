"use client";

import { use, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { castVote } from "@/lib/votes";
import { REMEDY_DETAILS } from "@/lib/remedyImages";
import { RemedyDisclaimer } from "@/components/RemedyDisclaimer";
import { ThumbIcon } from "@/components/ThumbIcon";
import type { Remedy, Vote } from "@/lib/types";

export default function RemedyDetailPage({
  params,
}: {
  params: Promise<{ remedyId: string }>;
}) {
  const { remedyId } = use(params);
  const uid = useAnonAuth();

  const [remedy, setRemedy] = useState<Remedy | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState<"up" | "down" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "remedies", remedyId), (snap) => {
      if (snap.exists()) {
        setRemedy({ id: snap.id, ...(snap.data() as Omit<Remedy, "id">) });
      }
    });
    return unsub;
  }, [remedyId]);

  useEffect(() => {
    const q = query(collection(db, "votes"), where("remedyId", "==", remedyId));
    const unsub = onSnapshot(q, (snap) => {
      setVotes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vote, "id">) })));
    });
    return unsub;
  }, [remedyId]);

  const details = remedy ? REMEDY_DETAILS[remedy.title] : undefined;

  const myVote = useMemo(() => votes.find((v) => v.userId === uid), [votes, uid]);

  const experiences = useMemo(
    () =>
      votes
        .filter((v) => v.comment)
        .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)),
    [votes]
  );

  async function handleVote(voteType: "up" | "down") {
    if (!uid) return;
    setSubmitting(voteType);
    setError(null);
    try {
      await castVote(remedyId, uid, voteType, comment);
      setComment("");
    } catch {
      setError("Noe gikk feil. Prøv igjen.");
    } finally {
      setSubmitting(null);
    }
  }

  if (!remedy) {
    return (
      <>
        <div className="fixed inset-0 -z-10">
          <Image
            src="/bakgrunner/bg_remedy.png"
            alt=""
            fill
            style={{ objectFit: "cover", transform: "scaleX(-1)" }}
            priority
            aria-hidden="true"
          />
        </div>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-8">
          <p className="text-sm text-zinc-500">Laster...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 -z-10">
        <Image
          src="/bakgrunner/bg_remedy.png"
          alt=""
          fill
          style={{ objectFit: "cover", transform: "scaleX(-1)" }}
          priority
          aria-hidden="true"
        />
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-8">
        <Link href={`/problem/${remedy.problemId}`} className="text-sm text-zinc-500">
          &larr; Tilbake
        </Link>

        {/* Gradientpanel bak alle bokser – strekker seg fra over tittel til under siste boks */}
        <div className="relative">
          <div
            className="absolute inset-0"
            style={{
              borderRadius: "50px",
              background: "linear-gradient(180deg, #CCA355 0%, #FACFA2 100%)",
            }}
          />

          <div className="relative flex flex-col gap-4 py-4">
            {/* Boks 1 – lysest: tittel + beskrivelse */}
            <div
              style={{ borderRadius: "30px", background: "rgba(245, 202, 153, 0.10)" }}
              className="px-7 py-6"
            >
              <h1 className="text-2xl font-bold">{remedy.title}</h1>
              {remedy.description && (
                <p className="mt-3 text-zinc-700 leading-relaxed">{remedy.description}</p>
              )}
            </div>

            {/* Boks 2: stemmestatistikk – kompakt, bare tall */}
            <div
              style={{ borderRadius: "30px", background: "rgba(245, 202, 153, 0.22)" }}
              className="flex items-center gap-3 px-6 py-3"
            >
              <span className="text-2xl font-bold text-emerald-600">
                {remedy.totalVotes > 0 ? `${remedy.successRate}%` : "-"}
              </span>
              <span className="flex items-center gap-1 text-sm text-zinc-500">
                <ThumbIcon direction="up" className="h-5 w-5" /> {remedy.votesUp}
                <ThumbIcon direction="down" className="ml-2 h-5 w-5" /> {remedy.votesDown}
                <span className="ml-1">({remedy.totalVotes} stemmer)</span>
              </span>
            </div>

            {/* Boks 3: stemmeformular */}
            <div
              style={{ borderRadius: "30px", background: "rgba(245, 202, 153, 0.34)" }}
              className="flex flex-col gap-3 px-6 py-5"
            >
              <span className="text-sm font-medium">
                {myVote ? "Endre din stemme" : "Har du prøvd dette?"}
              </span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Del din erfaring (valgfritt)"
                rows={3}
                className="rounded-lg border border-zinc-300 bg-white/60 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleVote("up")}
                  disabled={!uid || submitting !== null}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50 ${
                    myVote?.voteType === "up"
                      ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  <ThumbIcon direction="up" className="h-6 w-6" /> Fungerte
                </button>
                <button
                  onClick={() => handleVote("down")}
                  disabled={!uid || submitting !== null}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50 ${
                    myVote?.voteType === "down"
                      ? "bg-red-100 text-red-700 ring-1 ring-red-600"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  <ThumbIcon direction="down" className="h-6 w-6" /> Fungerte ikke
                </button>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            {/* Boks 4 (betinget): artikler – romslig for bilde + tekst */}
            {details && (
              <section
                style={{ borderRadius: "30px", background: "rgba(245, 202, 153, 0.43)" }}
                className="flex flex-col gap-4 px-6 py-6"
              >
                <h2 className="text-lg font-semibold">Artikler om dette rådet</h2>
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-zinc-50">
                  <Image
                    src={details.drawing}
                    alt={`Illustrasjon: ${remedy.title}`}
                    fill
                    className="object-contain"
                  />
                </div>
                {details.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm text-zinc-700 leading-relaxed">
                    {p}
                  </p>
                ))}
              </section>
            )}

            {/* Boks 5 – mørkest: erfaringer + ansvarsfraskrivelse */}
            <section
              style={{ borderRadius: "30px", background: "rgba(245, 202, 153, 0.55)" }}
              className="flex flex-col gap-3 px-6 py-5"
            >
              <h2 className="text-lg font-semibold">
                Hva folk opplevde {experiences.length > 0 && `(${experiences.length})`}
              </h2>
              {experiences.length === 0 && (
                <p className="text-sm text-zinc-500">Ingen har delt sin erfaring ennå.</p>
              )}
              <ul className="flex flex-col gap-2">
                {experiences.map((v) => (
                  <li
                    key={v.id}
                    className="rounded-xl bg-white/30 px-4 py-3 text-sm text-zinc-700"
                  >
                    <ThumbIcon
                      direction={v.voteType === "up" ? "up" : "down"}
                      className="mr-2 inline h-5 w-5 align-text-bottom"
                    />
                    {v.comment}
                  </li>
                ))}
              </ul>
              <RemedyDisclaimer
                text={`${remedy.title} ${remedy.description} ${details?.paragraphs.join(" ") ?? ""}`}
              />
            </section>
          </div>
        </div>

      </main>
    </>
  );
}
