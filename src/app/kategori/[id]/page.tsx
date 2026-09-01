"use client";

import { use, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { TOP_CATEGORIES } from "@/lib/categories";
import { CategorySubcategoryList } from "@/components/CategorySubcategoryList";
import type { Problem } from "@/lib/types";

// Frittstående collage-illustrasjoner (transparent PNG), brukt som venstre-spalte-
// bildet. Portrettformat (~8:15) egner seg godt til en sticky sidespalte, i
// motsetning til de brede kategori-fotoene (som ville krevd hard beskjæring her).
const CATEGORY_INTRO_IMAGE: Record<string, string> = {
  helse: "/pictures/helse_intro3.png",
  hudharskjonnhet: "/pictures/skjonnhet_intro.png",
  husoghjem: "/pictures/hus_intro3.png",
};

// Litt lengre redaksjonell introduksjon, vist rett under overskriften.
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
      <div className="mx-auto w-full max-w-7xl pb-4 pt-6" style={{ paddingInline: "var(--page-pad)" }}>
        <Link href="/alle" className="text-sm text-ink-soft hover:text-ink">
          &larr; Alle kategorier
        </Link>
      </div>

      {/* Duse løvetann-silhuett i bakgrunnen, samme motiv som forsiden. */}
      <div className="relative overflow-hidden">
        <Image
          src="/ikoner/dandelion_shadow.png"
          alt=""
          aria-hidden
          width={700}
          height={700}
          className="pointer-events-none absolute -right-20 top-4 select-none"
          style={{ width: 460, height: "auto", opacity: 0.3 }}
        />
        <Image
          src="/ikoner/dandelion_shadow.png"
          alt=""
          aria-hidden
          width={700}
          height={700}
          className="pointer-events-none absolute -left-24 bottom-0 select-none"
          style={{ width: 420, height: "auto", opacity: 0.2, transform: "scaleX(-1)" }}
        />

        {/* Bilde til venstre (sticky på brede skjermer) / overskrift, ingress og
            undergrupper til høyre — bruker mer av skjermbredden enn en smal,
            stablet kolonne, så man slipper å scrolle forbi et stort bilde for
            å komme til det man faktisk er ute etter. Ingen søsken-kategori-tags
            her — de ligger allerede lett tilgjengelig øverst i navbaren. */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20" style={{ paddingInline: "var(--page-pad)" }}>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-[320px_1fr] sm:gap-16">
            <div className="sm:sticky sm:top-28 sm:self-start">
              <div className="relative mx-auto aspect-[8/15] w-56 sm:w-full">
                <Image
                  src={CATEGORY_INTRO_IMAGE[category.id]}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 640px) 224px, 320px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div>
              <p className="font-metrophobic text-xs uppercase tracking-[0.3em] text-plum-700">Kategori</p>
              <h1 className="font-serif-display mt-2 text-6xl text-ink sm:text-7xl lg:text-8xl">
                {category.name}
              </h1>
              <p className="mt-3 max-w-xl text-lg text-ink-soft">{category.tagline}</p>
              <p className="mt-6 max-w-2xl leading-relaxed text-ink-soft">{CATEGORY_INTRO[category.id]}</p>

              <div className="mt-12">
                <CategorySubcategoryList topCategoryId={category.id} problems={problems} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
