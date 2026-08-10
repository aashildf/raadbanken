"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  collection,
  onSnapshot,
  orderBy,
  query as fsQuery,
  limit as fsLimit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HEALTH_SUBCATEGORIES, TOP_CATEGORIES } from "@/lib/categories";
import { IconChevronDown, IconMenu, IconSearch } from "@/components/icons";
import type { Problem, Remedy } from "@/lib/types";

const SEEDS: { left: string; top: string; rotate: string }[] = [
  { left: "76%", top: "9%",  rotate: "22deg"  },
  { left: "60%", top: "4%",  rotate: "-20deg" },
  { left: "88%", top: "62%", rotate: "40deg"  },
];

const MENU_CARDS = [
  { href: "/#artikler",      label: "Artikler",                    image: "/pictures/artikler_hjerte.png" },
  { href: "/medisinplanter", label: "Medisinplanter",               image: "/pictures/solhattmeny.png" },
  { href: "/historie",       label: "Plantemedisinens historie",    image: "/pictures/blomsterdamen.png" },
];

export function SiteMenu() {
  const [open, setOpen]             = useState(false);
  const [visible, setVisible]       = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [searchQ, setSearchQ]       = useState("");
  const [problems, setProblems]     = useState<Problem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "problems"), (snap) =>
      setProblems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Problem, "id">) })))
    );
    return unsub;
  }, []);

  const bySlug = useMemo(() => new Map(problems.map((p) => [p.slug, p])), [problems]);

  function openMenu() {
    setOpen(true);
    setTimeout(() => setVisible(true), 12);
  }

  function closeMenu() {
    setVisible(false);
    setExpandedId(null);
    setTimeout(() => setOpen(false), 300);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQ.trim();
    if (q) {
      router.push(`/?q=${encodeURIComponent(q)}`);
      closeMenu();
      setSearchQ("");
    }
  }

  const panel =
    open && mounted
      ? createPortal(
          <>
            {/* Backdrop */}
            <div
              onClick={closeMenu}
              className="fixed inset-0 z-40"
              style={{
                background: "rgba(20,10,35,0.22)",
                opacity: visible ? 1 : 0,
                transition: "opacity 260ms ease-out",
                pointerEvents: visible ? "auto" : "none",
              }}
            />

            {/* Panel */}
            <div
              className="fixed left-0 right-0 top-0 z-50 flex flex-col overflow-hidden"
              style={{
                maxHeight: "88vh",
                background: "#F9F7E8",
                borderBottomLeftRadius: 28,
                borderBottomRightRadius: 28,
                boxShadow: "0 8px 40px rgba(50,22,72,0.11), 0 2px 6px rgba(50,22,72,0.05)",
                transform: visible ? "translateY(0)" : "translateY(-105%)",
                transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Topplinje: søk og send-inn-råd — tydelig og midtstilt */}
              <div className="relative z-10 shrink-0" style={{ background: "#F9F7E8" }}>
                <div className="pb-3 pt-3" style={{ paddingInline: "max(28px, 6vw)" }}>
                  <div className="flex justify-end">
                    <button
                      onClick={closeMenu}
                      aria-label="Lukk meny"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold text-ink shadow-md transition-transform hover:scale-105"
                      style={{ background: "#FFFFFF" }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Søk råd + Send inn råd — store og midtstilte */}
                  <div className="mx-auto mt-2 flex w-full max-w-2xl flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
                    <form onSubmit={handleSearch} className="flex-1">
                      <div
                        className="flex h-full items-center gap-3 px-4"
                        style={{
                          height: 52,
                          background: "rgba(255,255,255,0.75)",
                          borderRadius: 14,
                          border: "1px solid rgba(50,22,72,0.10)",
                        }}
                      >
                        <IconSearch className="h-5 w-5 shrink-0 text-ink/40" />
                        <input
                          value={searchQ}
                          onChange={(e) => setSearchQ(e.target.value)}
                          placeholder="Søk etter råd…"
                          className="w-full bg-transparent text-base text-ink placeholder:text-ink/40 focus:outline-none"
                        />
                      </div>
                    </form>
                    <Link
                      href="/del-rad"
                      onClick={closeMenu}
                      className="flex shrink-0 items-center justify-center gap-2 rounded-[14px] px-6 text-base font-semibold text-paper transition-opacity hover:opacity-90"
                      style={{ height: 52, background: "#72874E" }}
                    >
                      Send inn råd
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Hovedinnhold: kategorier (bredere) / nav-kort (smalere) */}
              <div className="relative z-10 flex min-h-0 flex-1 flex-col sm:flex-row">
                <div
                  className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4 pb-8 sm:flex-row sm:items-start sm:gap-4 sm:overflow-visible"
                  style={{ paddingLeft: "max(28px, 6vw)", paddingRight: "max(48px, 7vw)" }}
                >
                  {/* Kategorier — bredere enn de tre kortene */}
                  <div
                    className="relative z-10 min-h-0 w-full shrink-0 pl-2 sm:w-0 sm:flex-[1.6] sm:overflow-y-auto sm:pl-4"
                  >
                    <p className="font-display mb-2 text-xl font-bold sm:text-2xl" style={{ color: "#576557" }}>
                      Kategorier
                    </p>
                    {/* Bare de tre hovedkategoriene vises her — klikk (eller hover på desktop)
                        åpner underkategoriene for den. Unngår at listen blir superlang, som den
                        ble da den viste alle 20 underkategoriene flatt. */}
                    <div className="overflow-hidden rounded-xl border border-ink/8 bg-white/40">
                      {TOP_CATEGORIES.map((cat, i) => {
                        const isExpanded = expandedId === cat.id;
                        const subs = HEALTH_SUBCATEGORIES.filter((s) => s.topCategoryId === cat.id);
                        return (
                          <div
                            key={cat.id}
                            className={i > 0 ? "border-t border-ink/8" : ""}
                            onMouseEnter={() => setExpandedId(cat.id)}
                          >
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                                isExpanded
                                  ? "bg-white/60 font-semibold text-plum-700"
                                  : "text-ink/80 hover:bg-white/50 hover:text-ink"
                              }`}
                            >
                              {cat.name}
                              <IconChevronDown
                                className={`ml-4 h-3 w-3 shrink-0 opacity-40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                            {isExpanded && subs.length > 0 && (
                              <div className="bg-white/25 pb-1 pt-0.5">
                                {subs.map((sub) => {
                                  const firstProblem = sub.problemSlugs
                                    .map((s) => bySlug.get(s))
                                    .find(Boolean);
                                  return (
                                    <Link
                                      key={sub.id}
                                      href={firstProblem ? `/problem/${firstProblem.id}` : "/alle"}
                                      onClick={closeMenu}
                                      className="block px-5 py-2 text-sm text-ink/70 transition-colors hover:text-plum-700"
                                    >
                                      {sub.name}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Artikler / Medisinplanter / Plantemedisinens historie */}
                  {MENU_CARDS.map((card) => (
                    <Link
                      key={card.href}
                      href={card.href}
                      onClick={closeMenu}
                      className="group flex w-full shrink-0 flex-col overflow-hidden rounded-2xl shadow-sm shadow-plum-950/10 transition-transform hover:-translate-y-0.5 sm:w-0 sm:flex-1"
                      style={{ background: "rgba(255,255,255,0.55)" }}
                    >
                      {/* Fast aspect-ratio (ikke sm:flex-1 mot en strukket rad) — kortet skal ha
                          egen, stabil høyde uavhengig av hvor mye Kategorier-listen ved siden av
                          har ekspandert seg til. */}
                      <div className="relative aspect-square w-full overflow-hidden">
                        <Image
                          src={card.image}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 200px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="px-3 py-2.5 text-center">
                        <span className="text-sm font-semibold leading-snug text-ink">{card.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Dandelion bg */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <Image
                  src="/logo/big_dandelion_bg.png"
                  alt=""
                  width={320}
                  height={320}
                  className="absolute right-[-4%] top-[-10%] select-none"
                  style={{ width: "38vw", maxWidth: 260, opacity: 0.15 }}
                  aria-hidden="true"
                />
                {SEEDS.map((s, i) => (
                  <Image
                    key={i}
                    src="/logo/dandelionseed.png"
                    alt=""
                    width={36}
                    height={36}
                    className="absolute select-none"
                    style={{ left: s.left, top: s.top, width: 30, opacity: 0.15, transform: `rotate(${s.rotate})` }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <button
        onClick={openMenu}
        aria-label="Meny"
        className="mr-2 flex items-center justify-center transition-opacity hover:opacity-70 sm:mr-0"
        style={{ color: "#3D2E3A" }}
      >
        <IconMenu className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>
      {panel}
    </>
  );
}
