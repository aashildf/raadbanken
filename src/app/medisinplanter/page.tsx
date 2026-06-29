import Link from "next/link";
import Image from "next/image";
import { MEDICINAL_PLANTS } from "@/lib/plants";
import { PLANT_ICON } from "@/components/icons";

export const metadata = {
  title: "Medisinplanter | Rådbanken",
  description: "Oversikt over medisinplanter og urter i Rådbanken, med tradisjonell bruk og bakgrunn.",
};

export default function MedisinplanterPage() {
  return (
    <main className="min-h-full bg-paper">
      <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          &larr; Tilbake til Rådbanken
        </Link>

        <header className="mt-8">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">Urter og planter</p>
          <h1 className="font-serif-display mt-4 text-4xl text-ink sm:text-5xl">Medisinplanter</h1>
          <p className="mt-4 max-w-xl text-ink-soft">
            En samling artikler om planter og urter som tradisjonelt har blitt brukt i folkemedisin
            og kjerringråd, med litt mer bakgrunn om hver av dem.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MEDICINAL_PLANTS.map((plant) => {
            const Icon = PLANT_ICON[plant.shape];
            return (
              <Link
                key={plant.id}
                href={`/plante/${plant.id}`}
                className="hairline group flex flex-col gap-3 overflow-hidden rounded-3xl bg-paper-deep/50 p-3 transition-transform hover:-translate-y-0.5"
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl" style={{ background: plant.bg }}>
                  {plant.image ? (
                    <Image
                      src={plant.image.src}
                      alt={plant.name}
                      fill
                      className={plant.image.fit === "contain" ? "object-contain p-6" : "object-cover"}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Icon className="h-16 w-16 text-paper/85" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 px-2 pb-2">
                  {Icon && <Icon className="h-4 w-4 shrink-0 text-plum-700" />}
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-ink-soft/70">{plant.latinName}</p>
                    <p className="font-serif-display text-lg text-ink group-hover:text-plum-700">
                      {plant.name}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
