"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { useProfile } from "@/lib/useProfile";
import { castVote } from "@/lib/votes";
import { setSaved } from "@/lib/saves";
import { RemedyPreviewModal } from "@/components/RemedyPreviewModal";
import { IconHeart } from "@/components/icons";
import type { Problem, Remedy } from "@/lib/types";

export default function MineLagredeRadPage() {
  const uid = useAnonAuth();
  const { displayName, loaded: profileLoaded } = useProfile();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savesLoaded, setSavesLoaded] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [openRemedyId, setOpenRemedyId] = useState<string | null>(null);

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
        setSavesLoaded(true);
      },
      () => {
        // F.eks. manglende Firestore-regler ennå ikke utrullet — vis tom
        // tilstand i stedet for å stå fast på "Laster…" for alltid.
        setSavesLoaded(true);
      }
    );
    return unsub;
  }, [uid]);

  const problemById = useMemo(() => new Map(problems.map((p) => [p.id, p])), [problems]);
  const savedRemedies = useMemo(
    () => remedies.filter((r) => savedIds.has(r.id)),
    [remedies, savedIds]
  );

  const openIndex = openRemedyId ? savedRemedies.findIndex((r) => r.id === openRemedyId) : -1;
  const openRemedy = openIndex >= 0 ? savedRemedies[openIndex] : null;

  const handleQuickVote = useCallback(
    async (remedyId: string, direction: "up" | "down") => {
      if (!uid) return;
      setVotingId(remedyId);
      try {
        await castVote(remedyId, uid, direction, "");
      } catch {
        // Stille feil, på linje med forsiden.
      } finally {
        setVotingId(null);
      }
    },
    [uid]
  );

  const handleToggleSaved = useCallback(
    async (remedyId: string) => {
      if (!uid) return;
      setSavingId(remedyId);
      try {
        await setSaved(remedyId, uid, !savedIds.has(remedyId));
      } catch {
        // ignorert
      } finally {
        setSavingId(null);
      }
    },
    [uid, savedIds]
  );

  const loading = !uid || !savesLoaded;

  return (
    <main className="min-h-full bg-paper">
      <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          &larr; Tilbake til Rådbanken
        </Link>

        <header className="mt-8">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-plum-700">
            {profileLoaded && displayName ? displayName : "Mine råd"}
          </p>
          <h1 className="font-serif-display mt-2 text-4xl text-ink sm:text-5xl">Mine lagrede råd</h1>
          <p className="mt-4 max-w-xl text-ink-soft">
            Husråd du har lagret med hjertet, samlet på ett sted. Foreløpig knyttet til denne
            nettleseren — ikke en ekte konto ennå.
          </p>
        </header>

        {loading && <p className="mt-10 text-sm text-ink-soft">Laster…</p>}

        {!loading && savedRemedies.length === 0 && (
          <div className="hairline mt-10 rounded-2xl px-6 py-10 text-center">
            <p className="text-sm text-ink-soft">
              Du har ikke lagret noen råd ennå. Trykk på hjertet på et råd for å samle det her.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-plum-700 transition-colors hover:text-plum-800"
            >
              Bla i råd →
            </Link>
          </div>
        )}

        {!loading && savedRemedies.length > 0 && (
          <div className="mt-10 flex flex-col divide-y divide-ink/10 border-t border-b border-ink/10">
            {savedRemedies.map((r) => {
              const problem = problemById.get(r.problemId);
              const isSaving = savingId === r.id;
              return (
                <div key={r.id} className="flex items-center gap-4 py-5">
                  <button onClick={() => setOpenRemedyId(r.id)} className="group min-w-0 flex-1 text-left">
                    <p className="truncate text-base font-semibold text-ink sm:text-lg">{r.title}</p>
                    <p className="truncate text-xs text-ink-soft">{problem?.name}</p>
                  </button>
                  <button
                    onClick={() => handleToggleSaved(r.id)}
                    disabled={isSaving}
                    aria-label="Fjern fra mine lagrede råd"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#E1B08C] transition-colors hover:bg-[#E1B08C] hover:text-[#2c232e] disabled:opacity-40"
                    style={{ border: "1px solid rgba(44,35,46,0.22)" }}
                  >
                    <IconHeart className="h-4 w-4" filled />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RemedyPreviewModal
        remedy={openRemedy}
        problemName={openRemedy ? problemById.get(openRemedy.problemId)?.name : undefined}
        onClose={() => setOpenRemedyId(null)}
        onVote={(direction) => openRemedy && handleQuickVote(openRemedy.id, direction)}
        voting={!!openRemedy && votingId === openRemedy.id}
        saved={!!openRemedy && savedIds.has(openRemedy.id)}
        onToggleSave={() => openRemedy && handleToggleSaved(openRemedy.id)}
        saving={!!openRemedy && savingId === openRemedy.id}
        onPrev={openIndex > 0 ? () => setOpenRemedyId(savedRemedies[openIndex - 1].id) : undefined}
        onNext={
          openIndex >= 0 && openIndex < savedRemedies.length - 1
            ? () => setOpenRemedyId(savedRemedies[openIndex + 1].id)
            : undefined
        }
      />
    </main>
  );
}
