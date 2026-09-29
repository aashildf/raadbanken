"use client";

import { use, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { castVote } from "@/lib/votes";
import { setSaved } from "@/lib/saves";
import { REMEDY_DETAILS } from "@/lib/remedyImages";
import { RemedyDisclaimer } from "@/components/RemedyDisclaimer";
import { IconArrowDown, IconArrowUp, IconHeart } from "@/components/icons";
import type { Remedy, Vote } from "@/lib/types";

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
  const [saved, setSavedState] = useState(false);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(
      doc(db, "saves", `${remedyId}_${uid}`),
      (snap) => setSavedState(snap.exists()),
      () => {
        // Stille feil, på linje med stemmegivning.
      }
    );
    return unsub;
  }, [remedyId, uid]);

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

  async function handleToggleSaved() {
    if (!uid) return;
    setSaving(true);
    try {
      await setSaved(remedyId, uid, !saved);
    } catch {
      // ignorert
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-full bg-page-bg">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:py-14" style={{ paddingInline: "var(--page-pad)" }}>
        <button onClick={() => router.back()} className="text-sm text-ink-soft transition-colors hover:text-ink">
          &larr; Tilbake
        </button>

        {!remedy && <p className="mt-8 text-sm text-ink-soft">Laster…</p>}

        {remedy && (
          <>
            {/* Tittel + beskrivelse */}
            <header className="mt-8">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
                Kjerringråd{problemName ? ` mot ${problemName.toLowerCase()}` : ""}
              </p>
              <h1 className="font-serif-display mt-3 text-3xl text-ink sm:text-4xl">{remedy.title}</h1>
              {remedy.description && (
                <p className="mt-3 leading-relaxed text-ink-soft">{remedy.description}</p>
              )}
            </header>

            {/* Stemmeseksjon */}
            <section className="mt-10 border-t border-ink/10 pt-10">
              <p className="text-sm font-medium text-ink">
                {myVote ? "Endre din stemme" : "Har du prøvd dette?"}
              </p>

              <div className="mt-5 flex justify-center gap-10">
                {(["up", "down"] as const).map((dir) => (
                  <div key={dir} className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => handleVote(dir)}
                      disabled={!uid || submitting !== null}
                      className={`flex items-center justify-center rounded-full border-2 text-ink transition-all hover:bg-[#E1B08C] hover:text-[#2c232e] disabled:opacity-50 ${
                        myVote?.voteType === dir
                          ? dir === "up" ? "border-sage bg-sage/10" : "border-rust bg-rust/10"
                          : "border-ink/15 hover:border-[#E1B08C]"
                      }`}
                      style={{ width: 72, height: 72 }}
                    >
                      {dir === "up" ? (
                        <IconArrowUp className="h-7 w-7" />
                      ) : (
                        <IconArrowDown className="h-7 w-7" />
                      )}
                    </button>
                    <span className="text-xs font-medium text-ink-soft">
                      {dir === "up" ? "Fungerte" : "Fungerte ikke"}
                    </span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={handleToggleSaved}
                    disabled={!uid || saving}
                    aria-pressed={saved}
                    className={`flex items-center justify-center rounded-full border-2 transition-all hover:bg-[#E1B08C] hover:text-[#2c232e] disabled:opacity-50 ${
                      saved ? "border-[#E1B08C] bg-[#E1B08C]/10 text-[#E1B08C]" : "border-ink/15 text-ink hover:border-[#E1B08C]"
                    }`}
                    style={{ width: 72, height: 72 }}
                  >
                    <IconHeart className="h-7 w-7" filled={saved} />
                  </button>
                  <span className="text-xs font-medium text-ink-soft">
                    {saved ? "Lagret" : "Lagre"}
                  </span>
                </div>
              </div>

              {remedy.totalVotes > 0 && (
                <p className="mt-4 text-center text-xs text-ink-soft">
                  {remedy.votesUp} av {remedy.totalVotes} synes dette fungerte
                </p>
              )}

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Del din erfaring (valgfritt)"
                rows={3}
                className="mt-5 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-plum-600"
                style={{ background: "rgba(61,46,58,0.04)" }}
              />
              {error && <p className="mt-2 text-sm text-rust">{error}</p>}
            </section>

            {/* Artikkelinnhold */}
            {details && (
              <section className="mt-10 border-t border-ink/10 pt-10">
                <h2 className="font-display text-lg font-semibold text-ink">Om dette rådet</h2>
                <div className="relative mt-4 aspect-4/3 overflow-hidden rounded-xl bg-paper-deep">
                  <Image
                    src={details.drawing}
                    alt={`Illustrasjon: ${remedy.title}`}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  {details.paragraphs.map((p, i) => (
                    <p key={i} className="leading-relaxed text-ink-soft">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Erfaringer + ansvarsfraskrivelse */}
            <section className="mt-10 border-t border-ink/10 pt-10">
              <h2 className="font-display text-lg font-semibold text-ink">
                Hva folk opplevde {experiences.length > 0 && `(${experiences.length})`}
              </h2>
              {experiences.length === 0 && (
                <p className="mt-3 text-sm text-ink-soft">Ingen har delt sin erfaring ennå.</p>
              )}
              {experiences.length > 0 && (
                <ul className="mt-4 flex flex-col divide-y divide-ink/10 border-t border-ink/10">
                  {experiences.map((v) => (
                    <li key={v.id} className="py-3 text-sm text-ink-soft">
                      {v.voteType === "up" ? (
                        <IconArrowUp className="mr-2 inline h-4 w-4 align-text-bottom text-sage" />
                      ) : (
                        <IconArrowDown className="mr-2 inline h-4 w-4 align-text-bottom text-rust" />
                      )}
                      {v.comment}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6">
                <RemedyDisclaimer
                  text={`${remedy.title} ${remedy.description} ${details?.paragraphs.join(" ") ?? ""}`}
                />
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
