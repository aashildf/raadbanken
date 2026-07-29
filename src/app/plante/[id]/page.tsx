import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MEDICINAL_PLANTS } from "@/lib/plants";
import { PLANT_ICON } from "@/components/icons";

export function generateStaticParams() {
  return MEDICINAL_PLANTS.map((p) => ({ id: p.id }));
}

// Ren SVG-støy (feTurbulence) — dekorativt korn på bakgrunnen, ingen bildefil nødvendig.
const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default async function PlantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plant = MEDICINAL_PLANTS.find((p) => p.id === id);
  if (!plant) notFound();

  const Icon = PLANT_ICON[plant.shape];

  if (plant.id === "lovetann") {
    return (
      <main className="relative min-h-full bg-paper">
        {/* Bakgrunn: dempet, uskarpt løvetannfelt med lett korn */}
        <div className="fixed inset-0 -z-10" aria-hidden="true">
          <Image
            src="/pictures/lovetann.png"
            alt=""
            fill
            priority
            className="object-cover"
            style={{ opacity: 0.4, filter: "blur(8px) saturate(1.05)" }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundImage: NOISE_BG, opacity: 0.06, mixBlendMode: "overlay" }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-4xl px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
          <Link href="/medisinplanter" className="text-sm text-ink-soft hover:text-ink">
            &larr; Tilbake til medisinplanter
          </Link>

          {/* Kort: løvetannbilde med tekstplass til høyre */}
          <div className="relative mt-8 min-h-[340px] w-full overflow-hidden rounded-3xl shadow-2xl shadow-plum-950/25 sm:aspect-[3/2] sm:min-h-0">
            <Image src="/pictures/lovetannblomst.png" alt={plant.name} fill className="object-cover" priority />
            <div className="relative grid h-full grid-cols-[3fr_2fr]">
              <div aria-hidden="true" />
              <div className="flex flex-col justify-center gap-2 py-6 pr-6 sm:gap-3 sm:py-10 sm:pr-14">
                {Icon && (
                  <span className="hairline flex h-9 w-9 items-center justify-center rounded-full bg-paper/80 text-plum-700 sm:h-11 sm:w-11">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                )}
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink-soft sm:text-xs sm:tracking-[0.25em]">
                  {plant.latinName}
                </p>
                <h1 className="font-serif-display text-2xl text-ink sm:text-4xl">{plant.name}</h1>
                <p className="text-xs text-ink-soft sm:text-base">{plant.description}</p>
              </div>
            </div>
          </div>

          {plant.sections && plant.sections.length > 0 && (
            <div className="mt-12 flex flex-col gap-10">
              {plant.sections.map((section, i) => (
                <section key={i}>
                  <h2 className="font-serif-display text-2xl text-ink">{section.heading}</h2>
                  {section.body && <p className="mt-3 text-ink-soft">{section.body}</p>}
                  {section.list && (
                    <ul className="mt-3 flex flex-col gap-2">
                      {section.list.map((item, j) => (
                        <li key={j} className="flex gap-2 text-ink-soft">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}

          <p className="mt-12 text-xs text-ink-soft/70">
            Informasjonen er ment som generell, tradisjonsbasert kunnskap, ikke medisinske
            råd. Snakk med lege eller farmasøyt før bruk, særlig ved bruk av andre legemidler.
          </p>

          <Link
            href="/"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-plum-800 px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-plum-700"
          >
            Bla i råd
            <span aria-hidden>→</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-paper">
      <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
        <Link href="/medisinplanter" className="text-sm text-ink-soft hover:text-ink">
          &larr; Tilbake til medisinplanter
        </Link>

        <header className="mt-8">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="hairline flex h-11 w-11 items-center justify-center rounded-full bg-paper-deep text-plum-700">
                <Icon className="h-5 w-5" />
              </span>
            )}
            <p className="text-xs uppercase tracking-[0.25em] text-ink-soft">{plant.latinName}</p>
          </div>
          <h1 className="font-serif-display mt-4 text-4xl text-ink sm:text-5xl">{plant.name}</h1>
          <p className="mt-4 max-w-xl text-ink-soft">{plant.description}</p>
        </header>

        {plant.image && (
          <div className="relative mt-10 aspect-5/3 overflow-hidden rounded-3xl">
            <Image
              src={plant.image.src}
              alt={plant.name}
              fill
              className={plant.image.fit === "contain" ? "object-contain p-8" : "object-cover"}
            />
            {plant.image.credit && (
              <a
                href={plant.image.creditHref}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 left-3 text-[10px] text-paper/80 hover:text-paper"
              >
                Foto: {plant.image.credit}
              </a>
            )}
          </div>
        )}

        <div className="mt-12 flex flex-col gap-10">
          {plant.sections?.map((section, i) => (
            <section key={i}>
              <h2 className="font-serif-display text-2xl text-ink">{section.heading}</h2>
              {section.body && <p className="mt-3 text-ink-soft">{section.body}</p>}
              {section.list && (
                <ul className="mt-3 flex flex-col gap-2">
                  {section.list.map((item, j) => (
                    <li key={j} className="flex gap-2 text-ink-soft">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p className="mt-12 text-xs text-ink-soft/70">
          Informasjonen er ment som generell, tradisjonsbasert kunnskap, ikke medisinske
          råd. Snakk med lege eller farmasøyt før bruk, særlig ved bruk av andre legemidler.
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-plum-800 px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-plum-700"
        >
          Bla i råd
          <span aria-hidden>→</span>
        </Link>
      </div>
    </main>
  );
}
