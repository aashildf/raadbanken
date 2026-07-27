"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HEALTH_SUBCATEGORIES } from "@/lib/categories";
import { CATEGORY_ICON, IconChevronDown } from "@/components/icons";
import type { Problem } from "@/lib/types";

export function CategoryMenu({
  problems,
  compact: _compact = false,
  align = "left",
  textColor = "#FBF9FD",
}: {
  problems: Problem[];
  compact?: boolean;
  align?: "left" | "right";
  textColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setExpandedId(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const bySlug = new Map(problems.map((p) => [p.slug, p]));

  function close() {
    setOpen(false);
    setExpandedId(null);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="font-logo flex items-center gap-1 text-base transition-opacity hover:opacity-70 sm:text-lg"
        style={{ color: textColor }}
      >
        Kategorier
        <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`hairline absolute top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl bg-paper shadow-xl ${
            align === "right" ? "right-0" : "left-0"
          }`}
          style={{ minWidth: 220 }}
        >
          {HEALTH_SUBCATEGORIES.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const subProblems = sub.problemSlugs
              .map((s) => bySlug.get(s))
              .filter(Boolean) as Problem[];

            return (
              <div key={sub.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    isExpanded
                      ? "bg-paper-deep font-semibold text-plum-700"
                      : "text-ink hover:bg-paper-deep/60 hover:text-plum-700"
                  }`}
                >
                  {sub.name}
                  <IconChevronDown
                    className={`ml-4 h-3 w-3 shrink-0 opacity-50 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {isExpanded && subProblems.length > 0 && (
                  <div className="bg-paper-deep/40 pb-1 pt-0.5">
                    {subProblems.map((p) => {
                      const Icon = CATEGORY_ICON[p.slug];
                      return (
                        <Link
                          key={p.id}
                          href={`/problem/${p.id}`}
                          onClick={close}
                          className="flex items-center gap-2.5 px-5 py-2 text-sm text-ink/80 transition-colors hover:text-plum-700"
                        >
                          {Icon && (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lilac-300/30">
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

          <div className="border-t border-ink/10 px-4 py-2.5">
            <Link href="/alle" onClick={close} className="text-xs font-medium text-plum-700 hover:text-plum-800">
              Se alle kategorier →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
