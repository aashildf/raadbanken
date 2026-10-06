"use client";

import { use, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { TOP_CATEGORIES } from "@/lib/categories";
import { CategorySubcategoryList } from "@/components/CategorySubcategoryList";
import { PrimaryButton } from "@/components/Button";
import type { Problem } from "@/lib/types";

// Fordypningsartiklene som tidligere lå som faste teasere på forsiden, flyttet
// hit til kategorien de faktisk hører hjemme i (se forsidens "Ukens utfordring"
// og "Folkets favoritter" — artiklene konkurrerte med rangeringen om plass der).
type CategoryArticle = {
  href: string;
  image: string;
  alt: string;
  credit: { text: string; href: string };
  kicker: string;
  title: string;
  description: string;
};

const CATEGORY_ARTICLES: Record<string, CategoryArticle[]> = {
  sankingbevaring: [
    {
      href: "/artikkel/fiken",
      image: "/pictures/menupictures/fiken_pexels-adriannacalvo-23384641.jpg",
      alt: "Ferske fiken, hele og oppskåret",
      credit: { text: "Adrianna CA / Pexels", href: "https://www.pexels.com/photo/figs-in-white-bowl-23384641/" },
      kicker: "Frukt med lange tradisjoner",
      title: "Fiken: en liten frukt med store helsefordeler",
      description: "Derfor er den søte frukten godt for fordøyelsen, hjertehelsen og skjelettet.",
    },
    {
      href: "/artikkel/tyttebaer",
      image: "/pictures/menupictures/tyytebaer_pexels-sandra-seitamaa-89384773-9669197.jpg",
      alt: "Tyttebær",
      credit: { text: "Sandra Seitamaa / Pexels", href: "https://www.pexels.com/photo/close-up-of-plants-and-berries-9669197/" },
      kicker: "Gammelt husråd mot hoste",
      title: "Tyttebær: naturens egen hostesaft",
      description: "Derfor virker det gamle tyttebærtrikset mot hoste og sår hals, og hvordan du bruker det riktig.",
    },
  ],
  helse: [
    {
      href: "/artikkel/syrin",
      image: "/pictures/syrin_pexels-iriser-1431192.jpg",
      alt: "Syrinklase i nærbilde",
      credit: { text: "Irina Iriser / Pexels", href: "https://www.pexels.com/photo/close-up-photography-of-orchid-flowers-1431192/" },
      kicker: "Duftende prydbusk med gamle røtter",
      title: "Syrin: mer enn en vakker vårduft",
      description:
        "Blomstene er spiselige og fulle av virkestoffer som tradisjonelt er brukt mot uro, urolig mage og irritert hud.",
    },
  ],
};

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
    "Her har vi samlet kjerringråd knyttet til helse, velvære og det å ta vare på kroppen. Før moderne medisiner og apotek fantes på hvert hjørne, ble planter, urter og andre naturlige råvarer sanket, dyrket og brukt som en del av hverdagen. Mange råd gikk i arv fra generasjon til generasjon, enkle løsninger basert på det man hadde for hånden. Noen har glemt dem, andre brukes fortsatt.",
  hudharskjonnhet:
    "Her finner du gamle råd og enkle knep for hud, hår og personlig pleie. Før baderomshyllene ble fulle av kremer, serum og spesialprodukter, brukte man det som fantes i kjøkkenet, hagen og naturen rundt seg. Oljer, urter, honning, havre og andre råvarer har gjennom tidene fått spille mange roller i jakten på mykere hud, blankere hår og litt ekstra glød. Mange av de gamle triksene er overraskende enkle, og noen er verdt å ta frem igjen.",
  husoghjem:
    "Her har vi samlet kjerringråd for hus og hjem: små løsninger på store og små hverdagsproblemer. Før spesialmidler og produkter fantes for enhver oppgave, måtte man være kreativ med det man hadde tilgjengelig. Eddik, sitron, salt, potetmel og grønnsåpe kunne brukes til langt mer enn man kanskje skulle tro. Kunnskapen ble delt, prøvd ut og gitt videre, og mange av de gamle knepene lever fortsatt i beste velgående.",
  godegamle:
    "De aller mest klassiske kjerringrådene, de fleste har hørt minst ett av dem fra en bestemor eller oldemor. Denne kategorien er foreløpig ny og tom, men er tenkt som samlestedet for de rådene som har gått igjen på tvers av generasjoner og familier.",
  sankingbevaring:
    "Konservering, tørking, safting og andre gamle triks for å ta vare på det man har sanket. Vi bygger fortsatt opp denne kategorien med flere konkrete kjerringråd, men her er noen artikler å begynne med i mellomtiden.",
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
      <div className="mx-auto w-full max-w-[var(--content-max)] pb-4 pt-6" style={{ paddingInline: "var(--page-pad)" }}>
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
        <div className="relative z-10 mx-auto w-full max-w-[var(--content-max)] px-5 pb-20" style={{ paddingInline: "var(--page-pad)" }}>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-[320px_1fr] sm:gap-16">
            <div className="sm:sticky sm:top-28 sm:self-start">
              <div className="relative mx-auto aspect-[8/15] w-56 sm:w-full">
                <Image
                  src={CATEGORY_INTRO_IMAGE[category.id] ?? category.image}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 640px) 224px, 320px"
                  className={CATEGORY_INTRO_IMAGE[category.id] ? "object-contain" : "object-cover"}
                  priority
                />
              </div>
            </div>

            <div>
              <p className="font-sans text-xs uppercase tracking-[0.3em] text-plum-700">Kategori</p>
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

      {/* Fordypningsartikler — samme bilde-venstre/tekst-høyre mønster som
          tidligere lå på forsiden, nå flyttet til kategorien de hører til. */}
      {CATEGORY_ARTICLES[category.id] && (
        <div className="relative border-t border-ink/10">
          {CATEGORY_ARTICLES[category.id].map((article, i) => (
            <section key={article.href} className="relative">
              <div
                className={`mx-auto flex flex-col items-stretch py-8 sm:py-12 ${
                  i % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"
                }`}
                style={{ maxWidth: "var(--content-max)", paddingInline: "var(--page-pad)" }}
              >
                <div className="relative w-full shrink-0 sm:w-2/3">
                  <Link
                    href={article.href}
                    className="relative block aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]"
                  >
                    <Image src={article.image} alt={article.alt} fill className="object-cover" />
                  </Link>
                  <a
                    href={article.credit.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 left-3 z-10 text-[10px] text-paper/80 hover:text-paper"
                  >
                    Foto: {article.credit.text}
                  </a>
                </div>

                <div className="flex w-full flex-col items-start justify-center gap-3 px-6 py-10 sm:w-1/3 sm:px-8">
                  <p className="font-sans text-xs uppercase tracking-[0.3em] text-plum-700">{article.kicker}</p>
                  <h2 className="font-serif-display text-2xl text-ink sm:text-3xl">{article.title}</h2>
                  <p className="text-ink-soft">{article.description}</p>
                  <PrimaryButton href={article.href} className="mt-2">
                    Les artikkel
                    <span aria-hidden>→</span>
                  </PrimaryButton>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
