"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { HEALTH_SUBCATEGORIES, type Subcategory } from "@/lib/categories";
import { CATEGORY_ICON } from "@/components/icons";
import type { Problem } from "@/lib/types";

const TEASER_IMAGES = [
  { src: "/bilder_kategoriside/forkjolelse.png",               slug: "forkjolelse",  label: "Forkjølelse" },
  { src: "/bilder_kategoriside/hodepine_peppermynte.png",      slug: "hodepine",     label: "Hodepine" },
  { src: "/bilder_kategoriside/saar_hals.png",                 slug: "vond-hals",    label: "Sår hals" },
  { src: "/bilder_kategoriside/fordoyelse_laurbaerblader.png", slug: "forstoppelse", label: "Fordøyelse" },
];

export default function AllePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selected, setSelected] = useState<Subcategory | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "problems"), (snap) => {
      setProblems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Problem, "id">) })));
    });
    return unsub;
  }, []);

  const bySlug = new Map(problems.map((p) => [p.slug, p]));

  const subProblems = selected
    ? (selected.problemSlugs.map((s) => bySlug.get(s)).filter(Boolean) as Problem[])
    : [];

  return (
    <main className="relative flex min-h-screen flex-col">
      <Image src="/bakgrunner/beige_bg.png" alt="" fill style={{ objectFit: "cover" }} priority aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(210,195,168,0.4)" }} aria-hidden="true" />

      <div
        className="relative mx-auto w-full max-w-md flex-1 px-5 py-7 sm:py-10"
        style={{ paddingInline: "var(--page-pad)" }}
      >
        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-plum-800/60">Rådbanken</p>
        <h1 className="font-serif-display mt-0.5 text-2xl text-ink sm:text-3xl">Alle kategorier</h1>

        <div className="mt-5 overflow-hidden rounded-2xl" style={{ background: "rgba(246,240,227,0.92)" }}>

          {/* Kategoriliste */}
          {!selected && HEALTH_SUBCATEGORIES.map((sub, i) => (
            <div key={sub.id}>
              {i > 0 && <div className="mx-4 border-t border-ink/8" />}
              <button
                onClick={() => setSelected(sub)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-paper/50"
              >
                <span className="flex-1 text-sm font-medium text-ink">{sub.name}</span>
                <span className="text-xs text-ink/30">›</span>
              </button>
            </div>
          ))}

          {/* Problemliste for valgt kategori */}
          {selected && (
            <>
              <button
                onClick={() => setSelected(null)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-paper/50"
              >
                <span className="text-sm text-plum-700">‹ Tilbake</span>
                <span className="text-xs font-bold uppercase tracking-wide text-ink/40">{selected.name}</span>
              </button>
              {subProblems.map((p, i) => {
                const Icon = CATEGORY_ICON[p.slug];
                return (
                  <div key={p.id}>
                    <div className="mx-4 border-t border-ink/8" />
                    <Link
                      href={`/problem/${p.id}`}
                      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-paper/50"
                    >
                      {Icon && (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(160,120,70,0.18)" }}>
                          <Icon className="h-3.5 w-3.5 text-plum-700" />
                        </span>
                      )}
                      <span className="flex-1 text-sm text-ink">{p.name}</span>
                      <span className="text-xs text-ink/30">→</span>
                    </Link>
                  </div>
                );
              })}
            </>
          )}

        </div>
      </div>

      {/* Teaser-bilder */}
      <div className="relative grid h-40 grid-cols-4 sm:h-52">
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
