import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MEDICINAL_PLANTS } from "@/lib/plants";
import { PLANT_ICON } from "@/components/icons";

export function generateStaticParams() {
  return MEDICINAL_PLANTS.map((p) => ({ id: p.id }));
}

export default async function PlantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plant = MEDICINAL_PLANTS.find((p) => p.id === id);
  if (!plant) notFound();

  const Icon = PLANT_ICON[plant.shape];

  return (
    <main className="min-h-full bg-paper">
      <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          &larr; Tilbake til Rådbanken
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
