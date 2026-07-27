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
      style={{
        height: HEIGHT,
        background: "rgba(255,255,255,0.58)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid rgba(50,22,72,0.08)",
      }}
    >
      <div
        className="relative flex h-full items-center justify-between gap-3"
        style={{ paddingInline: "var(--page-pad)" }}
      >
        <Link href="/" aria-label="Rådbanken" className="shrink-0">
          <Image
            src="/logo/dandelionsircle.png"
            alt="Rådbanken"
            width={842}
            height={968}
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
            style={{ background: "rgba(61,46,58,0.07)", borderRadius: 9999, height: 38, border: "1px solid rgba(61,46,58,0.10)" }}
          >
            <IconSearch className="h-4 w-4 shrink-0 text-[#3D2E3A]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => { if (!query) setSearchOpen(false); }}
              placeholder="Søk råd"
              className="w-full bg-transparent text-sm text-[#3D2E3A] placeholder:text-[#3D2E3A]/50 focus:outline-none"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-4 sm:gap-7">
          <button
            aria-label="Søk"
            onClick={() => setSearchOpen(true)}
            className={`text-[#3D2E3A] transition-opacity hover:opacity-70 sm:hidden ${searchOpen ? "hidden" : ""}`}
          >
            <IconSearch className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex sm:items-center sm:gap-7">
            <CategoryMenu problems={problems} compact textColor="#3D2E3A" />
          </div>
          <div className="sm:hidden">
            <CategoryMenu problems={problems} compact textColor="#3D2E3A" />
          </div>
          <SiteMenu textColor="#3D2E3A" />
        </div>
      </div>
    </header>
  );
}
