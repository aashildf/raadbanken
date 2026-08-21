"use client";

import { use, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { TOP_CATEGORIES } from "@/lib/categories";
import { CategorySubcategoryList } from "@/components/CategorySubcategoryList";
import type { Problem } from "@/lib/types";

// Kort, varm ingress per kategori — TOP_CATEGORIES har ingen tagline i data.
const CATEGORY_TAGLINE: Record<string, string> = {
  helse: "Gamle husråd mot vanlige plager, fra forkjølelse til hodepine.",
  hudharskjonnhet: "Naturlig pleie for hår, hud og velvære.",
  husoghjem: "Praktiske triks for et rent og ryddig hjem.",
};

// Frittstående collage-illustrasjoner (transparent PNG) til introduksjonen — vises med
// object-contain rett på sidebakgrunnen, ikke beskåret inn i en fotoramme som et vanlig bilde.
const CATEGORY_INTRO_IMAGE: Record<string, string> = {
  helse: "/pictures/helse_intro3.png",
  hudharskjonnhet: "/pictures/skjonnhet_intro.png",
  husoghjem: "/pictures/hus_intro3.png",
};

// Litt lengre redaksjonell introduksjon, vist parret med et bilde under hero-banneret.
const CATEGORY_INTRO: Record<string, string> = {
  helse:
    "Her har vi samlet kjerringråd knyttet til helse, velvære og det å ta vare på kroppen. Før moderne medisiner og apotek fantes på hvert hjørne, ble planter, urter og andre naturlige råvarer sanket, dyrket og brukt som en del av hverdagen. Mange råd gikk i arv fra generasjon til generasjon – enkle løsninger basert på det man hadde for hånden. Noen har glemt dem, andre brukes fortsatt.",
  hudharskjonnhet:
    "Her finner du gamle råd og enkle knep for hud, hår og personlig pleie. Før baderomshyllene ble fulle av kremer, serum og spesialprodukter, brukte man det som fantes i kjøkkenet, hagen og naturen rundt seg. Oljer, urter, honning, havre og andre råvarer har gjennom tidene fått spille mange roller i jakten på mykere hud, blankere hår og litt ekstra glød. Mange av de gamle triksene er overraskende enkle – og noen er verdt å ta frem igjen.",
  husoghjem:
    "Her har vi samlet kjerringråd for hus og hjem – små løsninger på store og små hverdagsproblemer. Før spesialmidler og produkter fantes for enhver oppgave, måtte man være kreativ med det man hadde tilgjengelig. Eddik, sitron, salt, potetmel og grønnsåpe kunne brukes til langt mer enn man kanskje skulle tro. Kunnskapen ble delt, prøvd ut og gitt videre, og mange av de gamle knepene lever fortsatt i beste velgående.",
};

export default function KategoriPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const category = TOP_CATEGORIES.find((c) => c.id === id);

  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "problems"), (snap) => {
      setProblems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Problem, "id">) })));
    });
    return unsub;
  }, []);

  if (!category) {
    return (
      <main className="min-h-full bg-paper">
        <div className="mx-auto w-full max-w-2xl px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
          <Link href="/alle" className="text-sm text-ink-soft hover:text-ink">
            &larr; Alle kategorier
          </Link>
          <p className="mt-8 text-sm text-ink/50">Fant ikke denne kategorien.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-paper">
      {/* Liten tilbake-lenke over hero-banneret, ikke oppå bildet — holder banneret rent. */}
      <div className="mx-auto w-full max-w-7xl pb-4 pt-6" style={{ paddingInline: "var(--page-pad)" }}>
        <Link href="/alle" className="text-sm text-ink-soft hover:text-ink">
          &larr; Alle kategorier
        </Link>
      </div>

      {/* HERO — fullbredde banner-bilde (beskjært lavt/bredt) med stor overskrift og
          søsken-kategori-tags oppå, for et mer blikkfangende førsteinntrykk enn et
          smalt sidestilt bilde. */}
      <section className="relative">
        <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[3/1]">
          <Image
            src={category.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(25,12,45,0.78) 0%, rgba(25,12,45,0.25) 45%, rgba(25,12,45,0.05) 70%)" }}
          />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-6 sm:px-10 sm:pb-10">
            <p className="font-metrophobic text-xs uppercase tracking-[0.3em] text-white/70">Kategori</p>
            <h1 className="font-serif-display text-5xl text-white sm:text-7xl">{category.name}</h1>
            <p className="mt-2 max-w-md text-white/85">{CATEGORY_TAGLINE[category.id]}</p>

            {/* Søsken-kategori-tags — rask navigering mellom de tre uten å måtte
                bruke navbaren. */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
              {TOP_CATEGORIES.map((cat) => {
                const isCurrent = cat.id === category.id;
                return (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.id}`}
                    className="text-xs font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-80"
                    style={{ color: "#fff", opacity: isCurrent ? 1 : 0.55 }}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Resten av siden — duse løvetann-silhuett i bakgrunnen, samme motiv som brukes
          på forsiden, så siden ikke føles tom og "hjemmesnekret" mellom bildene. */}
      <div className="relative z-0 overflow-hidden">
        <Image
          src="/ikoner/dandelion_shadow.png"
          alt=""
          aria-hidden
          width={700}
          height={700}
          className="pointer-events-none absolute -right-20 top-4 select-none"
          style={{ width: 460, height: "auto", opacity: 0.35 }}
        />
        <Image
          src="/ikoner/dandelion_shadow.png"
          alt=""
          aria-hidden
          width={700}
          height={700}
          className="pointer-events-none absolute -left-24 bottom-0 select-none"
          style={{ width: 420, height: "auto", opacity: 0.22, transform: "scaleX(-1)" }}
        />

        {/* REDAKSJONELL INTRODUKSJON — parret med en collage-illustrasjon, samme
            asymmetriske image+tekst-mønster som historie-siden, i stedet for et
            ensomt avsnitt. Illustrasjonen er en transparent PNG (håndsatt collage
            av urter/blomster/gjenstander) og skal derfor flyte fritt på
            sidebakgrunnen med object-contain, ikke beskjæres inn i en fotoramme. */}
        <section className="relative z-10 mx-auto w-full max-w-4xl px-5 pt-14 sm:pt-20" style={{ paddingInline: "var(--page-pad)" }}>
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-12">
            <div className="relative aspect-[8/15] w-48 shrink-0 sm:w-56">
              <Image
                src={CATEGORY_INTRO_IMAGE[category.id]}
                alt=""
                aria-hidden
                fill
                sizes="224px"
                className="object-contain"
              />
            </div>
            <p className="leading-relaxed text-ink-soft sm:flex-1">{CATEGORY_INTRO[category.id]}</p>
          </div>
        </section>

        {/* UNDERGRUPPER — åpen redaksjonell liste, ikke en klikk-for-å-utvide-accordion.
            Med maks 9 undergrupper og 1-3 problemer hver (Hus & hjem) er alt lett
            skumbart uten interaksjon. */}
        <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-14 pt-10 sm:pb-20 sm:pt-12" style={{ paddingInline: "var(--page-pad)" }}>
          <CategorySubcategoryList topCategoryId={category.id} problems={problems} />
        </div>
      </div>
    </main>
  );
}
