"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { HEALTH_SUBCATEGORIES, TOP_CATEGORIES } from "@/lib/categories";
import { CATEGORY_ICON, IconChevronDown } from "@/components/icons";
import type { Problem } from "@/lib/types";

const TEASER_IMAGES = [
  { src: "/bilder_kategoriside/forkjolelse.png",               slug: "forkjolelse",  label: "Forkjølelse" },
  { src: "/bilder_kategoriside/hodepine_peppermynte.png",      slug: "hodepine",     label: "Hodepine" },
  { src: "/bilder_kategoriside/saar_hals.png",                 slug: "vond-hals",    label: "Sår hals" },
  { src: "/bilder_kategoriside/fordoyelse_laurbaerblader.png", slug: "forstoppelse", label: "Fordøyelse" },
];

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
        className="relative mx-auto w-full max-w-5xl flex-1 py-8 sm:py-12"
        style={{ paddingInline: "var(--page-pad)", zIndex: 2 }}
      >
        <Link
          href="/"
          className="text-sm text-ink-soft hover:text-ink"
          style={{ textShadow: "0 1px 6px rgba(238,223,196,0.9)" }}
        >
          &larr; Tilbake til Rådbanken
        </Link>

        <p
          className="font-display mt-4 text-[10px] uppercase tracking-[0.3em] text-plum-800/70"
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

        {/* De tre hovedkategoriene side om side, hver med bilde øverst og sine
            underkategorier logisk oppdelt under seg. */}
        <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-start">
          {TOP_CATEGORIES.map((cat) => {
            const subs = HEALTH_SUBCATEGORIES.filter((s) => s.topCategoryId === cat.id);

            return (
              <div
                key={cat.id}
                id={cat.id}
                className="flex flex-col overflow-hidden rounded-3xl"
                style={{ border: "1px solid rgba(44,35,46,0.10)", background: "rgba(246,240,227,0.55)" }}
              >
                {/* Representativt bilde — lenker til kategoriens egen side */}
                <Link href={`/kategori/${cat.id}`} className="group relative block aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={cat.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-500 group-hover:scale-105"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(25,12,45,0.55) 0%, rgba(25,12,45,0.05) 60%)" }}
                  />
                  <p className="font-serif-display absolute bottom-3 left-5 text-xl text-white">
                    {cat.name}
                  </p>
                </Link>

                {/* Underkategorier */}
                <div className="flex flex-1 flex-col">
                  {subs.map((sub, i) => {
                    const isExpanded = expandedId === sub.id;
                    const subProblems = sub.problemSlugs.map((s) => bySlug.get(s)).filter(Boolean) as Problem[];
                    return (
                      <div key={sub.id} className={i > 0 ? "border-t border-ink/8" : ""}>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                          className={`flex w-full items-center justify-between px-5 py-3 text-left text-sm transition-colors ${
                            isExpanded ? "bg-paper-deep font-semibold text-plum-700" : "text-ink hover:bg-paper-deep/50 hover:text-plum-700"
                          }`}
                        >
                          {sub.name}
                          <IconChevronDown
                            className={`ml-4 h-3.5 w-3.5 shrink-0 opacity-50 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                        {isExpanded && subProblems.length > 0 && (
                          <div className="flex flex-wrap gap-2 bg-paper-deep/40 px-5 pb-4 pt-2">
                            {subProblems.map((p) => {
                              const Icon = CATEGORY_ICON[p.slug];
                              return (
                                <Link
                                  key={p.id}
                                  href={`/problem/${p.id}`}
                                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ink transition-colors hover:bg-paper"
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
