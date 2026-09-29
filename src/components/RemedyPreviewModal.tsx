"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { REMEDY_IMAGES } from "@/lib/remedyImages";
import { IconArrowDown, IconArrowUp, IconHeart, IconShare, IconX } from "@/components/icons";
import type { Remedy } from "@/lib/types";

/** Kompakt forhåndsvisning av ett råd — åpnes fra en liste uten å forlate den
    (ingen navigasjon, ingen tapt scroll-posisjon når den lukkes igjen).
    "Les full artikkel" tar deg videre til den fyldige siden for de som vil ha
    mer (flere avsnitt, erfaringer fra andre, stemmegivning med kommentar). */
export function RemedyPreviewModal({
  remedy,
  problemName,
  onClose,
  onVote,
  voting,
  myVote,
  saved,
  onToggleSave,
  saving,
  onPrev,
  onNext,
}: {
  remedy: Remedy | null;
  problemName?: string;
  onClose: () => void;
  onVote: (direction: "up" | "down") => void;
  voting: boolean;
  myVote?: "up" | "down";
  saved?: boolean;
  onToggleSave?: () => void;
  saving?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  if (remedy && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  function handleClose() {
    setVisible(false);
    window.setTimeout(() => {
      setMounted(false);
      onClose();
    }, 200);
  }

  useEffect(() => {
    if (!mounted) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, onNext, onPrev]);

  if (!mounted || !remedy) return null;

  const image = REMEDY_IMAGES[remedy.title];

  async function handleShare() {
    if (!remedy) return;
    const url = `${window.location.origin}/remedy/${remedy.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: remedy.title, url });
      } catch {
        // Brukeren avbrøt delingsdialogen — ingenting å gjøre.
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // Utklippstavle utilgjengelig (f.eks. ikke-sikker kontekst) — stille feil.
      }
    }
  }

  return (
    <div
      className={`modal-scrim fixed inset-0 z-100 flex items-center justify-center p-4 ${visible ? "is-visible" : ""}`}
      style={{ background: "rgba(20,10,35,0.4)" }}
      onClick={handleClose}
    >
      <div
        className={`modal-panel relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-page-bg sm:flex-row ${visible ? "is-visible" : ""}`}
        style={{ maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Lukk"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full text-ink shadow-sm transition-transform hover:scale-105 active:scale-95"
          style={{ background: "#FFFFFF" }}
        >
          <IconX className="h-4 w-4" />
        </button>

        {image && (
          <div className="relative aspect-4/3 w-full shrink-0 sm:aspect-auto sm:w-2/5">
            <Image src={image.src} alt="" fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover" />
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8">
          {problemName && (
            <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
              Kjerringråd mot {problemName.toLowerCase()}
            </p>
          )}
          <h2 className="font-serif-display mt-2 text-2xl text-ink">{remedy.title}</h2>
          {remedy.description && (
            <p className="mt-3 leading-relaxed text-ink-soft">{remedy.description}</p>
          )}

          <div className="mt-5 flex items-center gap-2">
            <button
              onClick={() => onVote("up")}
              disabled={voting}
              aria-label="Fungerte"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#E1B08C] hover:text-[#2c232e] disabled:opacity-40 ${
                myVote === "up" ? "text-sage" : "text-ink"
              }`}
              style={{ border: "1px solid rgba(44,35,46,0.22)" }}
            >
              <IconArrowUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => onVote("down")}
              disabled={voting}
              aria-label="Fungerte ikke"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#E1B08C] hover:text-[#2c232e] disabled:opacity-40 ${
                myVote === "down" ? "text-rust" : "text-ink"
              }`}
              style={{ border: "1px solid rgba(44,35,46,0.22)" }}
            >
              <IconArrowDown className="h-4 w-4" />
            </button>
            {onToggleSave && (
              <button
                onClick={onToggleSave}
                disabled={saving}
                aria-label={saved ? "Fjern fra mine lagrede råd" : "Lagre i mine lagrede råd"}
                aria-pressed={saved}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#E1B08C] hover:text-[#2c232e] disabled:opacity-40 ${
                  saved ? "text-[#E1B08C]" : "text-ink"
                }`}
                style={{ border: "1px solid rgba(44,35,46,0.22)" }}
              >
                <IconHeart className="h-4 w-4" filled={saved} />
              </button>
            )}
            <button
              onClick={handleShare}
              aria-label="Del"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-[#E1B08C] hover:text-[#2c232e]"
              style={{ border: "1px solid rgba(44,35,46,0.22)" }}
            >
              <IconShare className="h-4 w-4" />
            </button>
            {remedy.totalVotes > 0 && (
              <span className="ml-1 text-xs text-ink-soft">{remedy.successRate}% positiv</span>
            )}
          </div>

          <Link
            href={`/remedy/${remedy.id}`}
            className="group mt-6 inline-flex w-fit items-center gap-2 border-b pb-0.5 text-sm font-semibold transition-colors"
            style={{ color: "#3E2E3A", borderColor: "rgba(62,46,58,0.35)" }}
          >
            Les full artikkel
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </Link>

          {(onPrev || onNext) && (
            <div className="mt-auto flex items-center justify-between border-t border-ink/10 pt-5">
              <button
                onClick={onPrev}
                disabled={!onPrev}
                className="text-sm font-medium text-ink-soft transition-colors hover:text-ink disabled:opacity-30"
              >
                ← Forrige
              </button>
              <button
                onClick={onNext}
                disabled={!onNext}
                className="text-sm font-medium text-ink-soft transition-colors hover:text-ink disabled:opacity-30"
              >
                Neste →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
