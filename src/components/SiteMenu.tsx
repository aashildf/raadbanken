"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconMenu } from "@/components/icons";

const LINKS = [
  { href: "/", label: "Forside" },
  { href: "/medisinplanter", label: "Medisinplanter" },
  { href: "/historie", label: "Plantemedisinens historie" },
  { href: "/del-rad", label: "Del ditt råd" },
];

export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Meny"
        className="flex items-center justify-center text-ink transition-opacity hover:opacity-70"
      >
        <IconMenu className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>

      {open && (
        <div
          className="hairline fixed z-20 w-48 overflow-hidden rounded-2xl bg-paper p-2 shadow-2xl"
          style={{ top: "76px", right: "var(--page-pad)" }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-paper-deep"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
