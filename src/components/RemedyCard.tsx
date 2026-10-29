"use client";

import Link from "next/link";
import Image from "next/image";
import { Paper } from "@/components/Paper";
import { IconBookmark, IconHeart } from "@/components/icons";
import type { Remedy } from "@/lib/types";

// Råd-kort — fasit/komponent-kort.html, .rcard (standard, grid) og
// .rcard--row (kompakt, rad). Hele kortet er klikkbart via tittel-lenken
// (::after-triks, se titleHref); stem/lagre ligger over og fungerer for seg.
// Viser aldri et oppdiktet "Prøvd av"-tall (det finnes ikke i datamodellen,
// bare stemmer) — kompakt-varianten bruker successRate (ekte data) i stedet
// for fasitens plasshoder-tall der.
//
// Fasiten har alltid et bilde (.ph, en gråstripet "sett inn bilde her"-flate
// fra selve mockupen), men de fleste råd i databasen mangler foto ennå. Å
// vise den stripete flaten på ekte innhold så uferdig/ødelagt ut, så
// bilde-rammen utelates helt når det ikke finnes et ekte foto i stedet for
// å late som det gjør det — et rent tekst-kort er en bevisst variant, ikke
// en mangel.
function CardImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative shrink-0 rounded-[2px] p-[5px] shadow-[inset_0_0_0_1px_#6d685c]">
      <div className="relative aspect-4/3 overflow-hidden rounded-[inherit]">
        <Image src={src} alt={alt} fill sizes="270px" className="object-cover" />
      </div>
      <svg viewBox="0 0 12 12" aria-hidden className="absolute -left-1 -top-1 h-[11px] w-[11px] text-[#6d685c]">
        <path d="M1 11V1H11M4 11V4H11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
      <svg viewBox="0 0 12 12" aria-hidden className="absolute -right-1 -bottom-1 h-[11px] w-[11px] rotate-180 text-[#6d685c]">
        <path d="M1 11V1H11M4 11V4H11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    </div>
  );
}

type RemedyCardProps = {
  remedy: Remedy;
  categoryLabel: string;
  image?: string;
  isVoted: boolean;
  onToggleVote: () => void;
  voting?: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void;
  saving?: boolean;
  /** Når satt, åpner tittelen en forhåndsvisning (modal) i stedet for å
      navigere rett til /remedy/[id] — brukes der siden allerede har en
      RemedyPreviewModal (f.eks. plage-siden). */
  onOpenPreview?: () => void;
};

export function RemedyCard({
  remedy,
  categoryLabel,
  image,
  isVoted,
  onToggleVote,
  voting,
  isSaved,
  onToggleSave,
  saving,
  onOpenPreview,
}: RemedyCardProps) {
  const titleClassName =
    "relative text-inherit no-underline transition-colors duration-[550ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)] delay-[60ms] after:absolute after:inset-0 after:rounded-[6px] hover:text-[#a93415]";
  return (
    <article className="relative flex flex-col overflow-hidden rounded-[6px] bg-[#faf5ea] shadow-[inset_0_0_0_1px_#d9d2c1] transition-shadow duration-[550ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)] delay-[60ms] hover:shadow-[inset_0_0_0_1px_#a93415] focus-within:shadow-[inset_0_0_0_1px_#a93415]">
      <Paper id={`rcard-${remedy.id}`} variant="light" />
      <div className="relative z-10 flex flex-1 flex-col px-3 pb-3.5 pt-3">
        {image && <CardImage src={image} alt="" />}
        <div className={`flex flex-col gap-1.5 px-1 ${image ? "pt-4" : "pt-1"}`}>
          <span className="font-figtree text-[11px] font-bold uppercase tracking-[0.2em] text-[#4a473f]">{categoryLabel}</span>
          <h3 className="font-lora m-0 text-xl leading-[1.2] text-[#111110] text-balance">
            {onOpenPreview ? (
              <button type="button" onClick={onOpenPreview} className={`${titleClassName} text-left`}>
                {remedy.title}
              </button>
            ) : (
              <Link href={`/remedy/${remedy.id}`} className={titleClassName}>
                {remedy.title}
              </Link>
            )}
          </h3>
          {remedy.description && (
            <p className="m-0 overflow-hidden text-[15px] leading-[1.5] text-[#3d3a33]" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {remedy.description}
            </p>
          )}
        </div>
        {/* margin-top:auto (fasit .rcard__foot) — feste bunnraden nederst
            uansett tekstlengde over, viktig nå som bilde-rammen kan mangle. */}
        <div className="mt-auto flex items-center gap-3.5 border-t border-[#d9d2c1] px-1 pt-3 text-[13px] text-[#4a473f]">
          <button
            type="button"
            onClick={onToggleVote}
            disabled={voting}
            aria-pressed={isVoted}
            aria-label={isVoted ? `Du har stemt på ${remedy.title}` : `Stem på ${remedy.title}`}
            className="relative z-10 -m-1.5 flex min-h-9 items-center gap-1.5 rounded-[2px] p-1.5 font-figtree text-[13px] font-semibold text-[#4a473f] transition-opacity hover:opacity-70 disabled:opacity-40"
          >
            <IconHeart className="h-[18px] w-[18px] text-[#a93415]" filled={isVoted} />
            <span>{remedy.totalVotes}</span>
          </button>
          {remedy.totalVotes > 0 && <span>{remedy.successRate}% positivt</span>}
          {onToggleSave && (
            <button
              type="button"
              onClick={onToggleSave}
              disabled={saving}
              aria-pressed={isSaved}
              aria-label={isSaved ? `Fjern ${remedy.title} fra mine lagrede råd` : `Lagre ${remedy.title}`}
              className="relative z-10 -m-1.5 ml-auto flex min-h-9 items-center rounded-[2px] p-1.5 transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              <IconBookmark className="h-[18px] w-[18px] text-[#111110]" filled={isSaved} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function RemedyCardCompact({ remedy, categoryLabel, image }: { remedy: Remedy; categoryLabel: string; image?: string }) {
  return (
    <article className="relative flex items-center gap-3.5 overflow-hidden rounded-[6px] bg-[#faf5ea] p-2.5 shadow-[inset_0_0_0_1px_#d9d2c1] transition-shadow duration-[550ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)] delay-[60ms] hover:shadow-[inset_0_0_0_1px_#a93415] focus-within:shadow-[inset_0_0_0_1px_#a93415]">
      <Paper id={`rcard-row-${remedy.id}`} variant="light" />
      {image && (
        <div className="relative z-10 w-[76px] shrink-0">
          <CardImage src={image} alt="" />
        </div>
      )}
      <div className="relative z-10 flex min-w-0 flex-col gap-1">
        <span className="font-figtree text-[11px] font-bold uppercase tracking-[0.2em] text-[#4a473f]">{categoryLabel}</span>
        <h3 className="font-lora m-0 text-[17px] leading-[1.2] text-[#111110] text-balance">
          <Link href={`/remedy/${remedy.id}`} className="relative text-inherit no-underline transition-colors duration-[550ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)] delay-[60ms] after:absolute after:inset-0 after:rounded-[6px] hover:text-[#a93415]">
            {remedy.title}
          </Link>
        </h3>
        <span className="inline-flex items-center gap-1 text-[13px] text-[#4a473f]">
          <IconHeart className="h-3.5 w-3.5 shrink-0 text-[#a93415]" />
          {remedy.totalVotes}
          {remedy.totalVotes > 0 && ` · ${remedy.successRate}% positivt`}
        </span>
      </div>
    </article>
  );
}
