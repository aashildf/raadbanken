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
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { castVote } from "@/lib/votes";
import { REMEDY_DETAILS } from "@/lib/remedyImages";
import { RemedyDisclaimer } from "@/components/RemedyDisclaimer";
import { ThumbIcon } from "@/components/ThumbIcon";
import type { Remedy, Vote } from "@/lib/types";

const BG = "/bakgrunner/rosa_bg.png";

function Block({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`hairline rounded-2xl px-6 py-5 backdrop-blur-sm ${className}`}
      style={{ background: "rgba(251, 248, 254, 0.88)" }}
    >
      {children}
    </div>
  );
}

export default function RemedyDetailPage({
  params,
}: {
  params: Promise<{ remedyId: string }>;
}) {
  const { remedyId } = use(params);
  const uid = useAnonAuth();
  const router = useRouter();

  const [remedy, setRemedy] = useState<Remedy | null>(null);
  const [problemName, setProblemName] = useState<string | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState<"up" | "down" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "remedies", remedyId), (snap) => {
      if (snap.exists()) {
        const r = { id: snap.id, ...(snap.data() as Omit<Remedy, "id">) };
        setRemedy(r);
        onSnapshot(doc(db, "problems", r.problemId), (pSnap) => {
          if (pSnap.exists()) setProblemName((pSnap.data() as { name: string }).name);
        });
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

  return (
    <>
      <div className="fixed inset-0 -z-10">
        <Image src={BG} alt="" fill style={{ objectFit: "cover" }} priority aria-hidden="true" />
      </div>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-5 py-8">
        <div className="hairline inline-block self-start rounded-xl px-4 py-2 backdrop-blur-sm" style={{ background: "rgba(251,248,254,0.88)" }}>
          <button onClick={() => router.back()} className="text-sm text-ink-soft hover:text-ink">
            &larr; Tilbake
          </button>
        </div>

        {!remedy && <p className="text-sm text-ink-soft">Laster…</p>}

        {remedy && (
          <>
            {/* Tittel + beskrivelse */}
            <Block>
              <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
                Kjerringråd{problemName ? ` mot ${problemName.toLowerCase()}` : ""}
              </p>
              <h1 className="font-serif-display mt-2 text-3xl text-ink">{remedy.title}</h1>
              {remedy.description && (
                <p className="mt-3 leading-relaxed text-ink-soft">{remedy.description}</p>
              )}
            </Block>

            {/* Stemmeformular */}
            <Block className="flex flex-col gap-4">
              <span className="text-sm font-medium text-ink">
                {myVote ? "Endre din stemme" : "Har du prøvd dette?"}
              </span>

              {/* Tommelknapper øverst */}
              <div className="flex justify-center gap-10">
                {(["up", "down"] as const).map((dir) => (
                  <div key={dir} className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => handleVote(dir)}
                      disabled={!uid || submitting !== null}
                      className={`flex items-center justify-center rounded-full border-2 transition-all disabled:opacity-50 ${
                        myVote?.voteType === dir
                          ? dir === "up" ? "border-sage shadow-md" : "border-rust shadow-md"
                          : "border-ink/15 hover:border-ink/30"
                      }`}
                      style={{ width: 72, height: 72, background: "#FBF8FE" }}
                    >
                      <ThumbIcon direction={dir} className="h-14 w-14" />
                    </button>
                    <span className="text-xs font-medium text-ink-soft">
                      {dir === "up" ? "Fungerte" : "Fungerte ikke"}
                    </span>
                  </div>
                ))}
              </div>

              {remedy.totalVotes > 0 && (
                <p className="text-center text-xs text-ink-soft">
                  {remedy.votesUp} av {remedy.totalVotes} synes dette fungerte
                </p>
              )}

              {/* Erfaringsfelt under */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Del din erfaring (valgfritt)"
                rows={3}
                className="rounded-lg border border-ink/15 px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-plum-600"
                style={{ background: "#FBF8FE" }}
              />
              {error && <p className="text-sm text-rust">{error}</p>}
            </Block>

            {/* Artikkelinnhold */}
            {details && (
              <Block className="flex flex-col gap-4">
                <h2 className="font-display text-lg font-semibold text-ink">Om dette rådet</h2>
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl" style={{ background: "#EDE4F5" }}>
                  <Image
                    src={details.drawing}
                    alt={`Illustrasjon: ${remedy.title}`}
                    fill
                    className="object-contain"
                  />
                </div>
                {details.paragraphs.map((p, i) => (
                  <p key={i} className="leading-relaxed text-ink-soft">
                    {p}
                  </p>
                ))}
              </Block>
            )}

            {/* Erfaringer + ansvarsfraskrivelse */}
            <Block className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-semibold text-ink">
                Hva folk opplevde {experiences.length > 0 && `(${experiences.length})`}
              </h2>
              {experiences.length === 0 && (
                <p className="text-sm text-ink-soft">Ingen har delt sin erfaring ennå.</p>
              )}
              <ul className="flex flex-col gap-2">
                {experiences.map((v) => (
                  <li key={v.id} className="rounded-xl px-4 py-3 text-sm text-ink-soft" style={{ background: "#EDE4F5" }}>
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
            </Block>
          </>
        )}
      </main>
    </>
  );
}
