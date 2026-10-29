"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { TOP_CATEGORIES } from "@/lib/categories";
import { CategorySubcategoryList } from "@/components/CategorySubcategoryList";
import { Paper } from "@/components/Paper";
import { ShareAdviceBox } from "@/components/ShareAdviceBox";
import type { Problem } from "@/lib/types";

// "Alle råd" — fasit/mal-liste-dybde.html sin .phead-variant uten ikonboks
// (se kommentaren i den filen: "«Alle råd»: samme header uten ikonboks,
// kicker «Arkivet», tittel «Alle råd»"). Selve innholdet under er fortsatt
// kategori-/undergruppe-oversikten (ikke en flat råd-kort-rutenett som
// resten av mal-liste-dybde viser) — det matcher den faktiske
// taksonomien her (kategori → undergruppe → plage), mens fasitens
// rutenett forutsetter kategori → råd direkte.
export default function AllePage() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "problems"), (snap) => {
      setProblems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Problem, "id">) })));
    });
    return unsub;
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col" style={{ background: "#efe6cf" }}>
      <header className="relative overflow-hidden" style={{ background: "#111110" }}>
        <Paper id="alle-head" variant="dark" mottle={false} />
        <div
          className="relative z-10 mx-auto flex flex-col gap-4"
          style={{ maxWidth: 1480, paddingInline: "clamp(20px,3vw,40px)", paddingBlock: "56px 60px" }}
        >
          <ol className="m-0 flex flex-wrap gap-2 p-0 text-[13px]" style={{ color: "#cdc6b4" }} aria-label="Brødsmuler">
            <li>
              <Link href="/" className="transition-colors hover:text-[#a93415]">
                Forside
              </Link>
            </li>
            <li aria-current="page" className="before:mr-2 before:content-['/'] before:text-[#6d685c]" style={{ color: "#f5eee0" }}>
              Alle råd
            </li>
          </ol>

          <div className="flex flex-col gap-1.5">
            <p className="font-lora m-0 text-[clamp(16px,1.4vw,20px)] font-medium uppercase leading-[1.2] tracking-[0.16em]" style={{ color: "#d4c9b3" }}>
              Arkivet
            </p>
            <h1 className="font-lora m-0 text-[clamp(34px,3.6vw,52px)] leading-[1.08] text-balance" style={{ color: "#f5eee0" }}>
              Alle råd
            </h1>
          </div>

          <p className="m-0 max-w-[62ch] text-[clamp(17px,1.3vw,19px)] leading-[1.55] text-pretty" style={{ color: "#d9d2c1" }}>
            Alle plager, samlet ett sted. Hopp rett til en kategori, eller bla gjennom alle.
          </p>

          {problems.length > 0 && (
            <p className="m-0 text-sm" style={{ color: "#cdc6b4" }}>
              <b style={{ color: "#f5eee0", fontWeight: 600 }}>{TOP_CATEGORIES.length}</b> kategorier ·{" "}
              <b style={{ color: "#f5eee0", fontWeight: 600 }}>{problems.length}</b> plager
            </p>
          )}

          {/* Hopp-navigasjon — spesielt nyttig for Hus & hjem, som ligger lengst ned. */}
          <nav className="mt-2 flex flex-wrap gap-2">
            {TOP_CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="inline-flex rounded-[2px] px-4 py-2.5 font-figtree text-[13px] font-semibold text-[#efe6cf] shadow-[inset_0_0_0_1px_rgba(239,230,207,0.4)] transition-colors hover:bg-[#efe6cf] hover:text-[#111110]"
              >
                {cat.name}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="relative flex-1 overflow-hidden" style={{ background: "#efe6cf" }}>
        <Paper id="alle-list" variant="light" />
        <div
          className="relative z-10 mx-auto flex flex-col gap-20"
          style={{ maxWidth: 1480, paddingInline: "clamp(20px,3vw,40px)", paddingBlock: "48px 72px" }}
        >
          {TOP_CATEGORIES.map((cat) => (
            <section key={cat.id} id={cat.id} className="scroll-mt-28">
              <div className="mb-7 flex items-center gap-5">
                <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[6px] p-[5px] shadow-[inset_0_0_0_1px_#6d685c]" style={{ background: "#faf5ea" }}>
                  <div className="relative h-full w-full overflow-hidden rounded-[2px]">
                    <Image src={cat.image} alt="" fill sizes="66px" className="object-cover" />
                  </div>
                </div>
                <h2 className="font-lora m-0 text-[clamp(26px,2.6vw,36px)] leading-[1.12]" style={{ color: "#111110" }}>
                  <Link href={`/kategori/${cat.id}`} className="text-inherit no-underline transition-colors hover:text-[#a93415]">
                    {cat.name}
                  </Link>
                </h2>
              </div>
              <CategorySubcategoryList topCategoryId={cat.id} problems={problems} headingTag="h3" />
            </section>
          ))}
        </div>
      </section>

      <ShareAdviceBox id="alle-cta" />
    </main>
  );
}
