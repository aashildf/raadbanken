"use client";

import { use, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { HEALTH_SUBCATEGORIES, TOP_CATEGORIES } from "@/lib/categories";
import { CATEGORY_ICON, IconChevronDown } from "@/components/icons";
import type { Problem } from "@/lib/types";

export default function KategoriPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const category = TOP_CATEGORIES.find((c) => c.id === id);
  const subs = HEALTH_SUBCATEGORIES.filter((s) => s.topCategoryId === id);

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

      <div
        className="relative mx-auto w-full max-w-2xl flex-1 py-8 sm:py-12"
        style={{ paddingInline: "var(--page-pad)", zIndex: 2 }}
      >
        <Link href="/alle" className="text-sm text-ink-soft hover:text-ink">
          &larr; Alle kategorier
        </Link>

        {!category ? (
          <p className="mt-8 text-sm text-ink/50">Fant ikke denne kategorien.</p>
        ) : (
          <>
            {/* Representativt bilde med tittel */}
            <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-3xl shadow-lg shadow-plum-950/10 sm:aspect-[21/9]">
              <Image src={category.image} alt="" fill sizes="(max-width: 640px) 100vw, 672px" style={{ objectFit: "cover" }} priority aria-hidden="true" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(25,12,45,0.60) 0%, rgba(25,12,45,0.05) 60%)" }}
              />
              <div className="absolute bottom-4 left-5 sm:bottom-6 sm:left-7">
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/70">Rådbanken</p>
                <h1 className="font-serif-display mt-0.5 text-2xl text-white sm:text-3xl">{category.name}</h1>
              </div>
            </div>

            {/* Underkategorier */}
            <div
              className="mt-6 overflow-hidden rounded-3xl"
              style={{ border: "1px solid rgba(44,35,46,0.10)", background: "rgba(246,240,227,0.55)" }}
            >
              {subs.map((sub, i) => {
                const isExpanded = expandedId === sub.id;
                const subProblems = sub.problemSlugs.map((s) => bySlug.get(s)).filter(Boolean) as Problem[];
                return (
                  <div key={sub.id} className={i > 0 ? "border-t border-ink/8" : ""}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                      className={`flex w-full items-center justify-between px-5 py-3.5 text-left text-sm transition-colors ${
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
          </>
        )}
      </div>
    </main>
  );
}
