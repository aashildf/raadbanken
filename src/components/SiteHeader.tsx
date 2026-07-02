"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CategoryMenu } from "@/components/CategoryMenu";
import { SiteMenu } from "@/components/SiteMenu";
import { IconSearch } from "@/components/icons";
import type { Problem } from "@/lib/types";

const HEIGHT = 68;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "problems"), (snap) => {
      setProblems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Problem, "id">) })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  if (pathname === "/") return null;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setQuery("");
    }
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{ height: HEIGHT, background: "var(--navbar-bg)" }}
    >
      <div
        className="relative mx-auto flex h-full max-w-5xl items-center justify-between gap-3"
        style={{ paddingInline: "var(--page-pad)" }}
      >
        <Link href="/" aria-label="Rådbanken" className="shrink-0">
          <Image
            src="/logo/r_logo.svg"
            alt="Rådbanken"
            width={162}
            height={138}
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        {/* Søkefelt – ekspanderer på mobil */}
        <form
          onSubmit={handleSearch}
          className={`flex flex-1 items-center transition-all ${searchOpen ? "opacity-100" : "pointer-events-none opacity-0 sm:pointer-events-auto sm:opacity-100"}`}
          style={{ maxWidth: 320 }}
        >
          <div
            className="flex w-full items-center gap-2 px-3"
            style={{ background: "rgba(251,249,253,0.18)", borderRadius: 9999, height: 38, border: "1px solid rgba(251,249,253,0.25)" }}
          >
            <IconSearch className="h-4 w-4 shrink-0 text-[#FBF9FD]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => { if (!query) setSearchOpen(false); }}
              placeholder="Søk på en plage…"
              className="w-full bg-transparent text-sm text-[#FBF9FD] placeholder:text-[#FBF9FD]/60 focus:outline-none"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-4 sm:gap-7">
          {/* Forstørrelseglass-knapp synlig på mobil når søk er lukket */}
          <button
            aria-label="Søk"
            onClick={() => setSearchOpen(true)}
            className={`text-[#FBF9FD] transition-opacity hover:opacity-70 sm:hidden ${searchOpen ? "hidden" : ""}`}
          >
            <IconSearch className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex sm:items-center sm:gap-7">
            <CategoryMenu problems={problems} compact />
          </div>
          <div className="sm:hidden">
            <CategoryMenu problems={problems} compact />
          </div>
          <SiteMenu />
        </div>
      </div>
    </header>
  );
}
