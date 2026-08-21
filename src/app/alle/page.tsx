"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { TOP_CATEGORIES } from "@/lib/categories";
import { CategorySubcategoryList } from "@/components/CategorySubcategoryList";
import type { Problem } from "@/lib/types";

export default function AllePage() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "problems"), (snap) => {
      setProblems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Problem, "id">) })));
    });
    return unsub;
  }, []);

  return (
    <main className="min-h-full bg-paper">
      <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          &larr; Tilbake til Rådbanken
        </Link>

        <header className="mt-8">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">Rådbanken</p>
          <h1 className="font-serif-display mt-2 text-4xl text-ink sm:text-5xl">Alle kategorier</h1>
          <p className="mt-4 max-w-xl text-ink-soft">
            Alle plager, samlet ett sted. Hopp rett til en kategori, eller bla gjennom alle tre.
          </p>

          {/* Hopp-navigasjon — spesielt nyttig for Hus & hjem, som ligger lengst ned. */}
          <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-1">
            {TOP_CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="text-xs font-semibold uppercase tracking-[0.12em] text-plum-700 transition-opacity hover:opacity-70"
              >
                {cat.name}
              </a>
            ))}
          </nav>
        </header>

        <div className="mt-16 flex flex-col gap-20">
          {TOP_CATEGORIES.map((cat) => (
            <section key={cat.id} id={cat.id} className="scroll-mt-28">
              <div className="mb-6 flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                  <Image src={cat.image} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <h2 className="font-serif-display text-2xl text-ink sm:text-3xl">
                  <Link href={`/kategori/${cat.id}`} className="hover:text-plum-700">
                    {cat.name}
                  </Link>
                </h2>
              </div>
              <CategorySubcategoryList topCategoryId={cat.id} problems={problems} headingTag="h3" />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
