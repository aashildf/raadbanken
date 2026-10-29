"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Remedy } from "@/lib/types";
import { Paper } from "@/components/Paper";
import { ravnIcon, folketsDom, fmt, UpIcon, DownIcon, HEALTH_NOTE } from "./shared";

export type RavnTopItem = {
  remedy: Remedy;
  categoryId: string | null;
  categoryLabel: string;
  vote?: "up" | "down";
};

type Props = {
  items: RavnTopItem[];
  onVote: (remedyId: string, direction: "up" | "down") => void;
  canVote: boolean;
};

// "Mest nyttige råd akkurat nå", variant Kombi (README: bygg kun Kombi).
// Plass 1 som mørkt buekort, plass 2–3 som rader ved siden av, og "Like
// bak" (plass 4–8) som stolper som fylles når listen kommer i bildet.
// Dataene er ekte og kommer live fra Firestore (onSnapshot i page.tsx), så
// lista oppdaterer seg selv når folk stemmer — ingen simulering.
// Stemmene går gjennom den eksisterende castVote-flyten (handleQuickVote).
export function RavnTopList({ items, onVote, canVote }: Props) {
  if (items.length === 0) return null;
  const [first, ...rest] = items;
  const next2 = rest.slice(0, 2);
  const more = rest.slice(2, 7);

  return (
    <section className="ravn-section" aria-labelledby="ravn-top-h">
      <div className="ravn-wrap">
        <div className="ravn-head" style={{ borderBottomWidth: 2 }}>
          <h2 id="ravn-top-h" className="ravn-h2 flex items-center gap-3.5">
            Mest nyttige råd akkurat nå
            <span className="ravn-live">
              <span className="ravn-live__dot" aria-hidden="true" />
              Live
            </span>
          </h2>
          <span className="ravn-meta">
            Sortert etter <b style={{ color: "var(--ravn-ink)", fontWeight: 600 }}>folkets dom</b>, andelen som sier rådet virket
          </span>
        </div>

        <div className="flex flex-wrap items-stretch" style={{ gap: "clamp(20px,2.4vw,36px)" }}>
          <FirstCard item={first} onVote={onVote} canVote={canVote} />
          {next2.length > 0 && (
            <div className="flex min-w-0 flex-col" style={{ flex: "1 1 320px" }}>
              {next2.map((it, i) => (
                <RowCard key={it.remedy.id} item={it} rank={i + 2} onVote={onVote} canVote={canVote} />
              ))}
              <span className="ravn-meta" style={{ marginTop: 14 }}>
                Oppdateres fortløpende når folk stemmer
              </span>
            </div>
          )}
        </div>

        {more.length > 0 && <MoreBars items={more} onVote={onVote} canVote={canVote} />}

        <p style={{ margin: "clamp(24px,3vw,40px) 0 0", maxWidth: "72ch", fontSize: 13, lineHeight: 1.55, color: "var(--ravn-muted)" }}>
          {HEALTH_NOTE}
        </p>
      </div>
    </section>
  );
}

function VoteButtons({
  item,
  onVote,
  canVote,
  dark = false,
}: {
  item: RavnTopItem;
  onVote: Props["onVote"];
  canVote: boolean;
  dark?: boolean;
}) {
  const r = item.remedy;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={`ravn-vote ${dark ? "ravn-vote--on-dark" : ""}`}
        aria-pressed={item.vote === "up"}
        aria-label={`Det virket (${r.votesUp})`}
        disabled={!canVote}
        onClick={() => onVote(r.id, "up")}
      >
        <UpIcon />
        {fmt(r.votesUp)}
      </button>
      <button
        type="button"
        className={`ravn-vote ravn-vote--down ${dark ? "ravn-vote--on-dark" : ""}`}
        aria-pressed={item.vote === "down"}
        aria-label={`Virket ikke (${r.votesDown ?? 0})`}
        disabled={!canVote}
        onClick={() => onVote(r.id, "down")}
      >
        <DownIcon />
        {fmt(r.votesDown ?? 0)}
      </button>
    </div>
  );
}

function FirstCard({ item, onVote, canVote }: { item: RavnTopItem; onVote: Props["onVote"]; canVote: boolean }) {
  const r = item.remedy;
  const icon = ravnIcon(item.categoryId);
  return (
    <article
      className="relative grid min-w-0 items-end overflow-hidden"
      style={{
        flex: "1.7 1 520px",
        gridTemplateColumns: icon ? "minmax(0,1.3fr) minmax(0,1fr)" : "minmax(0,1fr)",
        gap: "clamp(16px,2vw,32px)",
        padding: "clamp(28px,3.4vw,52px)",
        borderRadius: "clamp(120px,14vw,220px) clamp(120px,14vw,220px) 6px 6px",
        background: "var(--ravn-ink)",
        color: "var(--ravn-bone)",
      }}
    >
      <Paper id="ravn-top1" variant="dark" />
      <div className="relative z-[3] flex min-w-0 flex-col" style={{ gap: "clamp(12px,1.4vw,20px)", paddingTop: "clamp(40px,6vw,96px)" }}>
        <span className="flex items-baseline gap-3.5">
          <span className="ravn-serif italic" style={{ fontSize: "clamp(48px,5vw,76px)", lineHeight: 0.9, color: "var(--ravn-bone)" }}>
            1.
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".04em", color: "var(--ravn-edge)" }}>{item.categoryLabel}</span>
        </span>
        <Link
          href={`/remedy/${r.id}`}
          className="ravn-serif ravn-link"
          style={{ fontWeight: 500, fontSize: "clamp(28px,2.8vw,42px)", lineHeight: 1.12, color: "var(--ravn-bone)" }}
        >
          {r.title}
        </Link>
        <span className="flex flex-wrap items-baseline gap-3">
          <span className="ravn-serif ravn-ember-text" style={{ fontSize: "clamp(72px,8vw,128px)", lineHeight: 0.85, letterSpacing: "-.03em" }}>
            {folketsDom(r)}
            <span style={{ fontSize: ".4em" }}>%</span>
          </span>
          <span style={{ fontSize: 15, lineHeight: 1.35, color: "var(--ravn-edge)" }}>
            virket for
            <br />
            <b style={{ fontWeight: 600, color: "var(--ravn-bone)" }}>{fmt(r.totalVotes)}</b> som har prøvd
          </span>
        </span>
        <VoteButtons item={item} onVote={onVote} canVote={canVote} dark />
      </div>
      {icon && (
        <span className="relative z-[3] block aspect-square w-full rounded-full" style={{ background: "var(--ravn-sand)", padding: "16%" }}>
          <span
            role="img"
            aria-label={item.categoryLabel}
            className="block h-full w-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${icon})` }}
          />
        </span>
      )}
    </article>
  );
}

function RowCard({ item, rank, onVote, canVote }: { item: RavnTopItem; rank: number; onVote: Props["onVote"]; canVote: boolean }) {
  const r = item.remedy;
  const icon = ravnIcon(item.categoryId);
  return (
    <article
      className="grid flex-1 items-start gap-4"
      style={{
        gridTemplateColumns: "auto minmax(0,1fr) clamp(64px,6vw,88px)",
        padding: "clamp(18px,2vw,26px) 0",
        borderBottom: "1px solid var(--ravn-line)",
      }}
    >
      <span className="ravn-serif italic" style={{ fontSize: "clamp(36px,3.2vw,48px)", lineHeight: 0.9, color: "var(--ravn-ink)" }}>
        {rank}.
      </span>
      <span className="flex min-w-0 flex-col gap-2.5">
        <span className="ravn-meta">{item.categoryLabel}</span>
        <Link
          href={`/remedy/${r.id}`}
          className="ravn-link ravn-link--ember"
          style={{ fontSize: "clamp(19px,1.5vw,22px)", lineHeight: 1.25, color: "var(--ravn-text2)" }}
        >
          {r.title}
        </Link>
        <span style={{ fontSize: 15, color: "var(--ravn-text2)" }}>
          <b style={{ fontWeight: 600 }}>{folketsDom(r)} %</b>{" "}
          <span style={{ color: "var(--ravn-muted)" }}>virket · {fmt(r.totalVotes)} har prøvd</span>
        </span>
        <VoteButtons item={item} onVote={onVote} canVote={canVote} />
      </span>
      {icon ? (
        <span
          role="img"
          aria-label={item.categoryLabel}
          className="block aspect-square w-full bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${icon})` }}
        />
      ) : (
        <span />
      )}
    </article>
  );
}

function MoreBars({ items, onVote, canVote }: { items: RavnTopItem[]; onVote: Props["onVote"]; canVote: boolean }) {
  const ref = useRef<HTMLOListElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-1.5" style={{ marginTop: "clamp(32px,4vw,56px)" }}>
      <span className="ravn-meta" style={{ paddingBottom: 6, borderBottom: "1px solid var(--ravn-ink)" }}>
        Like bak
      </span>
      <ol ref={ref} className="m-0 list-none p-0">
        {items.map((it, i) => {
          const r = it.remedy;
          const icon = ravnIcon(it.categoryId);
          const pct = folketsDom(r);
          return (
            <li
              key={r.id}
              className="grid items-center"
              style={{
                gridTemplateColumns: "clamp(44px,4vw,64px) clamp(52px,5vw,76px) minmax(0,1fr) auto",
                gap: "clamp(12px,1.8vw,28px)",
                padding: "clamp(14px,1.6vw,22px) 0",
                borderBottom: "1px solid var(--ravn-line)",
              }}
            >
              <span className="ravn-serif italic" style={{ fontSize: "clamp(34px,3.2vw,48px)", lineHeight: 0.9, color: "var(--ravn-ink)" }}>
                {i + 4}.
              </span>
              {icon ? (
                <span
                  role="img"
                  aria-label={it.categoryLabel}
                  className="block aspect-square w-full bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${icon})` }}
                />
              ) : (
                <span />
              )}
              <span className="flex min-w-0 flex-col gap-2.5">
                <span className="flex flex-wrap items-baseline justify-between" style={{ gap: "4px 16px" }}>
                  <Link
                    href={`/remedy/${r.id}`}
                    className="ravn-link ravn-link--ember"
                    style={{ fontSize: "clamp(19px,1.5vw,22px)", lineHeight: 1.25, color: "var(--ravn-text2)" }}
                  >
                    {r.title}
                  </Link>
                  <span className="ravn-meta whitespace-nowrap">{fmt(r.totalVotes)} har prøvd</span>
                </span>
                <span className="flex items-center gap-3.5">
                  <span className="ravn-bar">
                    <span className="ravn-bar__fill" style={{ width: shown ? `${pct}%` : 0, transitionDelay: `${i * 0.12}s` }} />
                  </span>
                  <b className="ravn-serif shrink-0 text-right" style={{ minWidth: "3.2em", fontWeight: 500, fontSize: "clamp(22px,2vw,28px)", lineHeight: 1 }}>
                    {pct}%
                  </b>
                </span>
              </span>
              <button
                type="button"
                className="ravn-vote"
                aria-pressed={it.vote === "up"}
                aria-label={`Det virket (${r.votesUp})`}
                disabled={!canVote}
                onClick={() => onVote(r.id, "up")}
              >
                <UpIcon />
                {fmt(r.votesUp)}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
