"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { BOOK_TIPS, type BookTip } from "@/lib/bookTips";
import { PrimaryButton } from "@/components/Button";
import { Paper } from "@/components/Paper";
import { IconAlertTriangle, IconX } from "@/components/icons";

// "Ukens boktips" — ÉN utvalgt bok om gangen (den med `handImage` satt i
// src/lib/bookTips.ts), vist stort med hendene som holder den fram i
// stedet for en rad med små bokrygger. Hover viser en kort smakebit
// (blurb), klikk åpner full omtale i en modal. Bytt ukens bok ved å flytte
// `handImage`-feltet til en annen bok i dataen (og legge til et tilsvarende
// hånd-bilde) — ingen markup å endre her.
export function BookTips() {
  const [open, setOpen] = useState(false);
  const featured = BOOK_TIPS.find((b) => b.handImage) ?? BOOK_TIPS[0];

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-px w-6" style={{ background: "#d4c9b3" }} />
        <p className="font-figtree shrink-0 text-xs font-semibold tracking-[0.26em]" style={{ color: "#6d685c" }}>
          UKENS BOKTIPS
        </p>
        <span aria-hidden="true" className="h-px w-6" style={{ background: "#d4c9b3" }} />
      </div>

      <div className="group relative mt-6" style={{ width: "clamp(240px,26vw,360px)" }}>
        {/* Hover-boble — kort smakebit. Native title-attributt erstattet med
            denne stylede boblen (var bare en nettleser-tooltip før). */}
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 w-[240px] -translate-x-1/2 rounded-[4px] p-3 text-left opacity-0 shadow-[0_10px_24px_rgba(17,17,16,0.22)] transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
          style={{ background: "#fffaf0", boxShadow: "inset 0 0 0 1px rgba(17,17,16,0.12), 0 10px 24px rgba(17,17,16,0.22)" }}
        >
          <p className="font-lora m-0 text-sm leading-snug" style={{ color: "#111110" }}>
            {featured.blurb}
          </p>
          <span
            aria-hidden
            className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45"
            style={{ background: "#fffaf0" }}
          />
        </div>

        <button type="button" onClick={() => setOpen(true)} className="block w-full text-left">
          <div className="relative transition-transform duration-300 group-hover:-translate-y-0.5" style={{ aspectRatio: "1.36" }}>
            <Image
              src={featured.handImage ?? featured.cover}
              alt=""
              aria-hidden
              fill
              sizes="360px"
              className="object-contain object-bottom"
            />
          </div>
          <p className="font-lora mt-1 text-sm underline-offset-2 group-hover:underline" style={{ color: "#111110" }}>
            {featured.title}
          </p>
          <p className="text-xs" style={{ color: "#4a473f" }}>
            {featured.author}
          </p>
        </button>
      </div>

      {open && <BookDetailModal book={featured} onClose={() => setOpen(false)} />}
    </div>
  );
}

function BookDetailModal({ book, onClose }: { book: BookTip; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function handleClose() {
    setVisible(false);
    window.setTimeout(onClose, 250);
  }

  // Portalert til document.body — modalen ligger inni <Reveal> (scroll-inn-
  // animasjonen), som setter en CSS transform på sin rot. Enhver transform
  // (selv identity/none-ferdig) lager et nytt containing block for
  // position:fixed-etterkommere, så uten portal ville modalen blitt
  // posisjonert/klippet relativt til den vesle Reveal-boksen i stedet for
  // hele viewporten (samme fallgruve SiteMenu.tsx allerede løser slik).
  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 transition-opacity duration-300"
      style={{ background: "rgba(17,17,16,.6)", backdropFilter: "blur(3px)", opacity: visible ? 1 : 0 }}
      onClick={handleClose}
    >
      <div
        className="relative flex w-full max-w-[640px] flex-col overflow-hidden rounded-[6px] p-1.5 transition-[opacity,transform] duration-300"
        style={{
          maxHeight: "88vh",
          background: "#faf5ea",
          boxShadow: "inset 0 0 0 1.5px #6d685c, 0 30px 70px rgba(17,17,16,.35)",
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(12px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex flex-col overflow-y-auto rounded-[2px]" style={{ maxHeight: "calc(88vh - 12px)", boxShadow: "inset 0 0 0 1px rgba(166,118,40,.5)" }}>
          <Paper id="booktip" variant="light" />
          <button
            onClick={handleClose}
            aria-label="Lukk"
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-[2px] bg-[#faf5ea] text-[#111110] shadow-[inset_0_0_0_1px_#6d685c] transition-colors duration-[550ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)] hover:bg-[#111110] hover:text-[#f5eee0]"
          >
            <IconX className="h-[18px] w-[18px]" />
          </button>

          <div className="relative z-[1] flex flex-col gap-5 p-6 sm:flex-row sm:p-8">
            <div className="mx-auto w-[150px] shrink-0 sm:mx-0">
              <div className="relative overflow-hidden rounded-md" style={{ aspectRatio: "2/3", boxShadow: "0 10px 24px rgba(17,17,16,0.18)" }}>
                <Image src={book.cover} alt={book.title} fill sizes="150px" className="object-cover" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="pr-12">
                <h2 className="font-lora m-0 text-2xl leading-[1.15] text-balance" style={{ color: "#111110" }}>
                  {book.title}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "#4a473f" }}>
                  {book.author} · {book.year}
                </p>
              </div>

              <div className="flex flex-col gap-3 text-[15px] leading-[1.6]" style={{ color: "#3d3a33" }}>
                {book.review.paragraphs.map((p, i) => (
                  <p key={i} className="m-0">
                    {p}
                  </p>
                ))}
              </div>

              {book.review.recommendedFor && (
                <p className="m-0 text-sm" style={{ color: "#3d3a33" }}>
                  <strong style={{ color: "#111110" }}>For deg som liker:</strong> {book.review.recommendedFor}
                </p>
              )}

              {book.review.note && (
                <p
                  className="m-0 flex items-start gap-2.5 rounded-[2px] px-4 py-3.5 text-sm leading-[1.5]"
                  style={{ background: "#e9e3d6", color: "#3d3a33" }}
                >
                  <IconAlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#6d685c]" />
                  <span>{book.review.note}</span>
                </p>
              )}

              <PrimaryButton href={book.gutenbergHref} target="_blank" rel="noopener noreferrer" className="mt-1 w-fit">
                Les boka gratis hos Project Gutenberg
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
