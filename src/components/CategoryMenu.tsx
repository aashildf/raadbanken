"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HEALTH_SUBCATEGORIES, TOP_CATEGORIES } from "@/lib/categories";
import { CATEGORY_ICON, IconChevronDown } from "@/components/icons";
import type { Problem } from "@/lib/types";

export function CategoryMenu({
  problems,
  compact = false,
  align = "left",
}: {
  problems: Problem[];
  compact?: boolean;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const problemBySlug = new Map(problems.map((p) => [p.slug, p]));
  const helse = TOP_CATEGORIES.find((c) => c.id === "helse");
  const husholdning = TOP_CATEGORIES.find((c) => c.id === "husholdning");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="font-logo flex items-center gap-1 text-base text-ink transition-opacity hover:opacity-70 sm:text-lg"
      >
        Kategorier
        <IconChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`hairline z-20 w-[min(90vw,520px)] overflow-hidden rounded-2xl bg-paper p-5 shadow-2xl ${
            compact ? "fixed" : `absolute top-[calc(100%+8px)] ${align === "right" ? "right-0" : "left-0"}`
          }`}
          style={compact ? { position: "fixed", top: "76px", right: "var(--page-pad)" } : undefined}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold text-ink">{helse?.name}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3">
            {HEALTH_SUBCATEGORIES.map((sub) => (
              <div key={sub.id}>
                <p className="text-xs font-medium uppercase tracking-wide text-plum-700">{sub.name}</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {sub.problemSlugs.map((slug) => {
                    const p = problemBySlug.get(slug);
                    if (!p) return null;
                    const Icon = CATEGORY_ICON[slug];
                    return (
                      <li key={slug}>
                        <Link
                          href={`/problem/${p.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-1.5 text-sm text-ink hover:text-plum-700"
                        >
                          {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                          {p.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
            <span className="text-sm font-medium text-ink-soft">{husholdning?.name}</span>
            <span className="text-xs uppercase tracking-wide text-ink-soft/70">Kommer snart</span>
          </div>
        </div>
      )}
    </div>
  );
}
