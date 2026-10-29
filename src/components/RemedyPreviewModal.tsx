"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { REMEDY_IMAGES } from "@/lib/remedyImages";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import { Paper } from "@/components/Paper";
import { IconAlertTriangle, IconArrowRight, IconBookmark, IconHeart, IconShare, IconX } from "@/components/icons";
import type { Remedy } from "@/lib/types";

// Forhåndsvisning av ett råd — fasit/komponent-modal.html, .pv. Kompakt
// forhåndsvisning uten å forlate listen (ingen navigasjon, ingen tapt
// scroll-posisjon). "Les hele rådet" tar deg videre til den fyldige siden.
//
// Fasitens modal har ett enkelt stem-hjerte (ikke opp/ned) og et
// "Prøvd av X"-tall i meta-raden — vi har ikke den sistnevnte dataen (bare
// stemmer), så meta-raden viser i stedet den reelle treffprosenten
// (successRate). Stegliste/sikkerhetsnotat i fasiten er plasshoder-tekst;
// `note` er derfor en valgfri prop siden vi ikke har strukturerte
// fremgangsmåte-steg i datamodellen — sidene sender bare inn ekte tekst der
// de har den (f.eks. akutt-risiko-varsel for enkelte plager).
export function RemedyPreviewModal({
  remedy,
  problemName,
  note,
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
  note?: string;
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
    }, 300);
  }

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, onNext, onPrev]);

  if (!mounted || !remedy) return null;

  const image = REMEDY_IMAGES[remedy.title];
  const isVoted = myVote === "up";

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
      className="fixed inset-0 z-100 flex items-center justify-center p-4 transition-opacity duration-[450ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)]"
      style={{ background: "rgba(17,17,16,.6)", backdropFilter: "blur(3px)", opacity: visible ? 1 : 0 }}
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pv-title"
        className="relative flex rounded-[6px] p-1.5 transition-[opacity,transform] duration-[450ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)]"
        style={{
          width: "min(680px, calc(100vw - 32px))",
          maxHeight: "calc(100dvh - 48px)",
          background: "#faf5ea",
          boxShadow: "inset 0 0 0 1.5px #6d685c, 0 30px 70px rgba(17,17,16,.35)",
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(12px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex flex-1 flex-col overflow-y-auto rounded-[2px]"
          style={{ maxHeight: "calc(100dvh - 48px)", boxShadow: "inset 0 0 0 1px rgba(166,118,40,.5)" }}
        >
          <Paper id="pv" variant="light" />
          {image && (
            <div className="relative mx-3.5 mt-3.5 aspect-[16/8] shrink-0 rounded-[2px] p-[5px] shadow-[inset_0_0_0_1px_#6d685c]">
              <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
                <Image src={image.src} alt="" fill sizes="(max-width: 680px) 100vw, 650px" className="object-cover" />
              </div>
            </div>
          )}

          <button
            onClick={handleClose}
            aria-label="Lukk forhåndsvisning"
            className="absolute right-[26px] top-[26px] z-10 grid h-11 w-11 place-items-center rounded-[2px] bg-[#faf5ea] text-[#111110] shadow-[inset_0_0_0_1px_#6d685c] transition-colors duration-[550ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)] delay-[60ms] hover:bg-[#111110] hover:text-[#f5eee0]"
          >
            <IconX className="h-[18px] w-[18px]" />
          </button>

          <div className="relative z-[1] flex flex-col gap-3 px-[34px] pb-2 pt-[26px]">
            {problemName && (
              <span className="font-figtree text-[11px] font-bold uppercase tracking-[0.2em] text-[#4a473f]">{problemName}</span>
            )}
            <h2 id="pv-title" className="font-lora m-0 text-[clamp(26px,3vw,32px)] leading-[1.15] text-[#111110] text-balance">
              {remedy.title}
            </h2>
            <ul className="m-0 flex list-none flex-wrap gap-x-[18px] gap-y-1.5 p-0 text-sm text-[#4a473f]">
              <li className="inline-flex items-center gap-1.5">
                <IconHeart className="h-4 w-4 text-[#6d685c]" />
                {remedy.totalVotes} stemmer
              </li>
              {remedy.totalVotes > 0 && (
                <li className="inline-flex items-center gap-1.5">{remedy.successRate}% positivt</li>
              )}
            </ul>
            {remedy.description && <p className="m-1 mt-1 text-[17px] leading-[1.6] text-[#3d3a33]">{remedy.description}</p>}
            {note && (
              <p className="m-0 flex items-start gap-2.5 rounded-[2px] bg-[#e9e3d6] px-4 py-3.5 text-sm leading-[1.5] text-[#3d3a33]">
                <IconAlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#6d685c]" />
                <span>{note}</span>
              </p>
            )}
          </div>

          <div
            className="sticky bottom-0 z-[1] mt-auto flex flex-wrap items-center gap-2.5 px-[34px] pb-[22px] pt-[18px] max-[560px]:px-5"
            style={{ background: "linear-gradient(to bottom, rgba(250,245,234,0), #faf5ea 26%)" }}
          >
            <SecondaryButton
              tone="olive"
              aria-pressed={isVoted}
              disabled={voting}
              onClick={() => onVote("up")}
              className="!px-6 !py-[14px] !text-[11px]"
            >
              <IconHeart className="h-4 w-4" filled={isVoted} />
              {isVoted ? "Stemt" : "Stem"}
            </SecondaryButton>
            {onToggleSave && (
              <SecondaryButton
                tone="olive"
                aria-pressed={saved}
                disabled={saving}
                onClick={onToggleSave}
                className="!px-6 !py-[14px] !text-[11px]"
              >
                <IconBookmark className="h-4 w-4" filled={saved} />
                {saved ? "Lagret" : "Lagre"}
              </SecondaryButton>
            )}
            <button
              onClick={handleShare}
              aria-label="Del"
              className="relative grid h-11 w-11 place-items-center rounded-[2px] text-[#111110] shadow-[inset_0_0_0_1px_#111110] transition-colors duration-[550ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)] delay-[60ms] hover:bg-[#111110] hover:text-[#f5eee0]"
            >
              <IconShare className="h-[18px] w-[18px]" />
            </button>
            <PrimaryButton
              onClick={() => (window.location.href = `/remedy/${remedy.id}`)}
              className="!px-6 !py-[14px] !text-[11px] ml-auto max-[560px]:ml-0 max-[560px]:w-full"
            >
              Les hele rådet
            </PrimaryButton>
          </div>

          {(onPrev || onNext) && (
            <div className="relative z-[1] flex items-center justify-between px-[34px] pb-4 max-[560px]:px-5">
              <button
                onClick={onPrev}
                disabled={!onPrev}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4a473f] transition-colors hover:text-[#111110] disabled:opacity-30"
              >
                <IconArrowRight className="h-3.5 w-3.5 rotate-180" />
                Forrige
              </button>
              <button
                onClick={onNext}
                disabled={!onNext}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4a473f] transition-colors hover:text-[#111110] disabled:opacity-30"
              >
                Neste
                <IconArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
