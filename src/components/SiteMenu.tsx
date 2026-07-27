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
import { HEALTH_SUBCATEGORIES } from "@/lib/categories";
import { CATEGORY_ICON, IconChevronDown, IconMenu, IconSearch } from "@/components/icons";
import type { Problem, Remedy } from "@/lib/types";

const SEEDS: { left: string; top: string; rotate: string }[] = [
  { left: "76%", top: "9%",  rotate: "22deg"  },
  { left: "60%", top: "4%",  rotate: "-20deg" },
  { left: "88%", top: "62%", rotate: "40deg"  },
];

const NAV_LINKS = [
  { href: "/del-rad",        label: "Send inn råd" },
  { href: "/medisinplanter", label: "Medisinplanter" },
  { href: "/historie",       label: "Plantemedisinens historie" },
];

export function SiteMenu({ textColor = "#FBF9FD" }: { textColor?: string }) {
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

            {/* Panel — max 60vh, no scroll */}
            <div
              className="fixed left-0 right-0 top-0 z-50 overflow-hidden"
              style={{
                maxHeight: "60vh",
                background: "#ECEBEE",
                borderBottomLeftRadius: 28,
                borderBottomRightRadius: 28,
                boxShadow: "0 8px 40px rgba(50,22,72,0.11), 0 2px 6px rgba(50,22,72,0.05)",
                transform: visible ? "translateY(0)" : "translateY(-105%)",
                transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Dandelion bg */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <Image
                  src="/logo/big_dandelion_bg.png"
                  alt=""
                  width={320}
                  height={320}
                  className="absolute right-[-4%] top-[-10%] select-none"
                  style={{ width: "38vw", maxWidth: 260, opacity: 0.2 }}
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
                    style={{ left: s.left, top: s.top, width: 30, opacity: 0.2, transform: `rotate(${s.rotate})` }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Content — responsiv sidemargin */}
              <div className="relative z-10">

                {/* Header — hvit overlay, full bredde */}
                <div style={{ background: "rgba(255,255,255,0.25)" }}>
                  <div className="pb-4 pt-6" style={{ paddingInline: "max(28px, 8vw)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src="/logo/dandelionsircle.png"
                          alt="Rådbanken"
                          width={842}
                          height={968}
                          className="h-11 w-auto"
                        />
                        <p className="font-logo text-sm" style={{ color: "rgba(50,22,72,0.5)", fontStyle: "italic" }}>
                          "Kunnskap samlet gjennom generasjoner"
                        </p>
                      </div>
                      <button
                        onClick={closeMenu}
                        aria-label="Lukk meny"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-medium text-ink/70 transition-colors hover:text-ink"
                        style={{ background: "rgba(255,255,255,0.55)" }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="mt-4">
                      <div
                        className="flex items-center gap-2.5 px-3.5"
                        style={{
                          height: 44,
                          maxWidth: 340,
                          background: "rgba(255,255,255,0.65)",
                          borderRadius: 12,
                          border: "1px solid rgba(50,22,72,0.08)",
                        }}
                      >
                        <IconSearch className="h-4 w-4 shrink-0 text-ink/40" />
                        <input
                          value={searchQ}
                          onChange={(e) => setSearchQ(e.target.value)}
                          placeholder="Søk etter råd…"
                          className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
                        />
                      </div>
                    </form>
                  </div>
                </div>

                {/* Kategorier — accordion */}
                <div className="pt-4" style={{ paddingInline: "max(28px, 8vw)" }}>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-ink/35">Kategorier</p>
                  <div className="overflow-hidden rounded-xl border border-ink/8 bg-white/30">
                    {HEALTH_SUBCATEGORIES.map((sub, i) => {
                      const isExpanded = expandedId === sub.id;
                      const subProblems = sub.problemSlugs
                        .map((s) => bySlug.get(s))
                        .filter(Boolean) as Problem[];
                      return (
                        <div key={sub.id} className={i > 0 ? "border-t border-ink/8" : ""}>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                            className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                              isExpanded
                                ? "bg-white/50 font-semibold text-plum-700"
                                : "text-ink/80 hover:bg-white/40 hover:text-ink"
                            }`}
                          >
                            {sub.name}
                            <IconChevronDown
                              className={`ml-4 h-3 w-3 shrink-0 opacity-40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                          {isExpanded && subProblems.length > 0 && (
                            <div className="bg-white/20 pb-1 pt-0.5">
                              {subProblems.map((p) => {
                                const Icon = CATEGORY_ICON[p.slug];
                                return (
                                  <Link
                                    key={p.id}
                                    href={`/problem/${p.id}`}
                                    onClick={closeMenu}
                                    className="flex items-center gap-2.5 px-5 py-2 text-sm text-ink/70 transition-colors hover:text-plum-700"
                                  >
                                    {Icon && (
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/60">
                                        <Icon className="h-3 w-3 text-plum-700" />
                                      </span>
                                    )}
                                    {p.name}
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

                {/* Nav-lenker */}
                <div className="pb-6 pt-4" style={{ paddingInline: "max(28px, 8vw)" }}>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-ink/35">Sider</p>
                  <ul>
                    {NAV_LINKS.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          onClick={closeMenu}
                          className="block py-1.5 text-sm text-ink transition-colors hover:text-plum-700"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

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
        className="flex items-center justify-center transition-opacity hover:opacity-70"
        style={{ color: textColor }}
      >
        <IconMenu className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>
      {panel}
    </>
  );
}
