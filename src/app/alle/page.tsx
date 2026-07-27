"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { HEALTH_SUBCATEGORIES } from "@/lib/categories";
import { CATEGORY_ICON, IconChevronDown } from "@/components/icons";
import type { Problem } from "@/lib/types";

const TEASER_IMAGES = [
  { src: "/bilder_kategoriside/forkjolelse.png",               slug: "forkjolelse",  label: "Forkjølelse" },
  { src: "/bilder_kategoriside/hodepine_peppermynte.png",      slug: "hodepine",     label: "Hodepine" },
  { src: "/bilder_kategoriside/saar_hals.png",                 slug: "vond-hals",    label: "Sår hals" },
  { src: "/bilder_kategoriside/fordoyelse_laurbaerblader.png", slug: "forstoppelse", label: "Fordøyelse" },
];

// Bakgrunnsbilde per kategori (der vi har det)
const SUB_IMAGE: Record<string, string> = {
  luftveier: "/bilder_kategoriside/forkjolelse.png",
  hode:      "/bilder_kategoriside/hodepine_peppermynte.png",
  hals:      "/bilder_kategoriside/saar_hals.png",
  mage:      "/bilder_kategoriside/fordoyelse_laurbaerblader.png",
};

// CSS-gradient for kategorier uten bilde
const SUB_GRADIENT: Record<string, string> = {
  sovn:   "linear-gradient(130deg, rgba(55,42,95,0.22) 0%, rgba(90,70,140,0.10) 100%)",
  hud:    "linear-gradient(130deg, rgba(178,90,60,0.20) 0%, rgba(210,140,90,0.08) 100%)",
  muskel: "linear-gradient(130deg, rgba(80,120,75,0.20) 0%, rgba(120,160,110,0.08) 100%)",
};

export default function AllePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "problems"), (snap) => {
      setProblems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Problem, "id">) })));
    });
    return unsub;
  }, []);

  const bySlug = new Map(problems.map((p) => [p.slug, p]));

  return (
    <main className="relative flex min-h-screen flex-col">
      {/* Bakgrunn */}
      <Image src="/bakgrunner/beige_bg.png" alt="" fill style={{ objectFit: "cover" }} priority aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(210,195,168,0.4)" }} aria-hidden="true" />

      {/* Gradient øverst — gjør overskriften lesbar */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{ background: "linear-gradient(to bottom, rgba(238,223,196,0.72) 0%, transparent 100%)", zIndex: 1 }}
        aria-hidden="true"
      />

      {/* Innhold */}
      <div
        className="relative mx-auto w-full max-w-2xl flex-1 py-8 sm:py-12"
        style={{ paddingInline: "var(--page-pad)", zIndex: 2 }}
      >
        <p
          className="font-display text-[10px] uppercase tracking-[0.3em] text-plum-800/70"
          style={{ textShadow: "0 1px 6px rgba(238,223,196,0.9)" }}
        >
          Rådbanken
        </p>
        <h1
          className="font-serif-display mt-0.5 text-2xl text-ink sm:text-3xl"
          style={{ textShadow: "0 1px 0 rgba(255,248,235,0.95), 0 2px 14px rgba(220,200,160,0.7)" }}
        >
          Alle kategorier
        </h1>

        {/* Kategorikort */}
        <div className="mt-7 flex flex-col gap-3">
          {HEALTH_SUBCATEGORIES.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const subProblems = sub.problemSlugs.map((s) => bySlug.get(s)).filter(Boolean) as Problem[];
            const imgSrc = SUB_IMAGE[sub.id];
            const gradient = SUB_GRADIENT[sub.id];

            return (
              <div key={sub.id}>
                {/* Kategoriknapp */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                  className="group relative w-full overflow-hidden rounded-2xl text-left transition-all"
                  style={{
                    minHeight: 96,
                    border: "1px solid rgba(44,35,46,0.10)",
                    boxShadow: isExpanded ? "0 4px 20px rgba(50,22,72,0.10)" : undefined,
                  }}
                >
                  {/* Bakgrunn */}
                  {imgSrc ? (
                    <>
                      <Image
                        src={imgSrc}
                        alt=""
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-700 group-hover:scale-105"
                        aria-hidden="true"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to right, rgba(25,12,45,0.62) 0%, rgba(25,12,45,0.28) 60%, rgba(25,12,45,0.10) 100%)" }}
                      />
                    </>
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ background: gradient ?? "rgba(246,240,227,0.92)" }}
                    />
                  )}

                  {/* Tekst */}
                  <div className="relative flex items-center justify-between px-6 py-5">
                    <div>
                      <p className={`font-serif-display text-xl ${imgSrc ? "text-white" : "text-ink"}`}>
                        {sub.name}
                      </p>
                      <p className={`mt-0.5 text-xs ${imgSrc ? "text-white/60" : "text-ink/45"}`}>
                        {sub.problemSlugs.length} {sub.problemSlugs.length === 1 ? "plage" : "plager"}
                      </p>
                    </div>
                    <IconChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""} ${imgSrc ? "text-white/70" : "text-ink/40"}`}
                    />
                  </div>
                </button>

                {/* Ekspandert: problemer som piller */}
                {isExpanded && subProblems.length > 0 && (
                  <div
                    className="-mt-2 flex flex-wrap gap-2 rounded-b-2xl px-5 pb-5 pt-5"
                    style={{ background: "rgba(237,226,200,0.80)", border: "1px solid rgba(44,35,46,0.10)", borderTop: "none" }}
                  >
                    {subProblems.map((p) => {
                      const Icon = CATEGORY_ICON[p.slug];
                      return (
                        <Link
                          key={p.id}
                          href={`/problem/${p.id}`}
                          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-ink transition-colors hover:bg-paper"
                          style={{ background: "rgba(246,240,227,0.92)", border: "1px solid rgba(44,35,46,0.08)" }}
                        >
                          {Icon && (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(67,32,101,0.10)" }}>
                              <Icon className="h-3 w-3 text-plum-700" />
                            </span>
                          )}
                          <span>{p.name}</span>
                          <span className="text-xs text-ink/30">→</span>
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

      {/* Teaser-bilder */}
      <div className="relative z-10 grid h-40 grid-cols-4 sm:h-52">
        {TEASER_IMAGES.map(({ src, slug, label }) => {
          const problem = bySlug.get(slug);
          return (
            <Link key={slug} href={problem ? `/problem/${problem.id}` : "#"} className="group relative overflow-hidden">
              <Image src={src} alt={label} fill style={{ objectFit: "cover" }} className="transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-end pb-2.5 pl-3" style={{ background: "linear-gradient(to top, rgba(50,22,72,0.60) 0%, transparent 55%)" }}>
                <span className="font-display text-[11px] font-semibold uppercase tracking-wide text-white drop-shadow-sm">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
