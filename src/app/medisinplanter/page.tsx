import Link from "next/link";
import Image from "next/image";
import { MEDICINAL_PLANTS, plantOfTheMonth } from "@/lib/plants";
import { PLANT_ICON } from "@/components/icons";

export const metadata = {
  title: "Medisinplanter | Rådbanken",
  description: "Oversikt over medisinplanter og urter i Rådbanken, med tradisjonell bruk og bakgrunn.",
};

// Flyttet hit fra forsiden ("I fokus: Medisinplanter") — hører naturlig hjemme
// under "Planter og urter" i stedet for å ta plass i forsidens flyt.
function featuredAndCompanions() {
  const featured = plantOfTheMonth();
  // Faste følgeplanter ved siden av månedens plante. Går nedover kandidatlisten
  // og hopper over månedens plante selv (den roterer og kan falle på en av
  // kandidatene) slik at det alltid blir nøyaktig to følgeplanter.
  const candidateIds = ["lavendel", "rosenrot", "kamille", "ingefaer"];
  const companions: typeof MEDICINAL_PLANTS = [];
  for (const id of candidateIds) {
    if (companions.length >= 2) break;
    if (id === featured.id) continue;
    const plant = MEDICINAL_PLANTS.find((p) => p.id === id);
    if (plant) companions.push(plant);
  }
  return { featured, companions };
}

export default function MedisinplanterPage() {
  const { featured, companions } = featuredAndCompanions();
  const FeaturedIcon = PLANT_ICON[featured.shape];
  const featuredHref = featured.sections ? `/plante/${featured.id}` : null;

  return (
    <main className="min-h-full bg-paper">
      <div className="mx-auto w-full max-w-[var(--content-max)] px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          &larr; Tilbake til Rådbanken
        </Link>

        <header className="mt-8">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-plum-700">Urter og planter</p>
          <h1 className="font-serif-display mt-4 text-4xl text-ink sm:text-5xl">Medisinplanter</h1>
          <p className="mt-4 max-w-xl text-ink-soft">
            En samling artikler om planter og urter som tradisjonelt har blitt brukt i folkemedisin
            og kjerringråd, med litt mer bakgrunn om hver av dem.
          </p>
        </header>

        {/* I FOKUS — månedens plante, samme bilde+tekst-mønster som forsiden
            brukte, de to følgeplantene som en lettere liste ved siden av. */}
        <section className="mt-14">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-plum-700">I fokus</p>
          <h2 className="font-serif-display mt-2 text-2xl text-ink sm:text-3xl">Månedens plante</h2>

          <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
            <div className="group relative lg:w-3/5">
              {featuredHref && (
                <Link href={featuredHref} className="absolute inset-0 z-10" aria-label={`Les mer om ${featured.name}`} />
              )}
              <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9]" style={{ background: featured.bg }}>
                {featured.image ? (
                  <Image
                    src={featured.image.src}
                    alt={featured.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className={`${featured.image.fit === "contain" ? "object-contain p-8" : "object-cover"} transition-transform duration-500 group-hover:scale-105`}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FeaturedIcon className="h-20 w-20 text-paper/85" />
                  </div>
                )}
                <span className="hairline absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-[10px] font-semibold uppercase text-plum-800">
                  {new Date().toLocaleDateString("nb-NO", { month: "short" }).replace(".", "")}
                </span>
                {featured.image?.credit && (
                  <a
                    href={featured.image.creditHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 left-3 z-20 text-[10px] text-paper/80 hover:text-paper"
                  >
                    Foto: {featured.image.credit}
                  </a>
                )}
              </div>
              <div className="mt-4 flex flex-col gap-1.5">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-soft">{featured.latinName}</p>
                <h3 className="card-title text-ink">{featured.name}</h3>
                <p className="text-sm text-ink-soft">{featured.description}</p>
                {featuredHref && (
                  <span className="mt-1 text-sm font-medium text-plum-700 transition-colors group-hover:text-plum-800">
                    Les mer om urten →
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:w-2/5 lg:border-l lg:border-ink/10 lg:pl-10">
              {companions.map((p) => {
                const href = p.sections ? `/plante/${p.id}` : null;
                const Icon = PLANT_ICON[p.shape];
                return (
                  <div key={p.id} className="group relative flex gap-4">
                    {href && <Link href={href} className="absolute inset-0 z-10" aria-label={`Les mer om ${p.name}`} />}
                    <div className="flex flex-col justify-center gap-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-ink-soft">{p.latinName}</p>
                      <h3 className="font-display text-lg text-ink">{p.name}</h3>
                      <p className="line-clamp-2 text-sm text-ink-soft">{p.description}</p>
                      {href && (
                        <span className="mt-0.5 text-sm font-medium text-plum-700 transition-colors group-hover:text-plum-800">
                          Les mer →
                        </span>
                      )}
                    </div>
                    {!href && Icon && <Icon className="h-5 w-5 shrink-0 text-plum-700" />}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ALLE PLANTER — den opprinnelige fullstendige oversikten, uendret. */}
        <section className="mt-16 border-t border-ink/10 pt-14">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-plum-700">Hele samlingen</p>
          <h2 className="font-serif-display mt-2 text-2xl text-ink sm:text-3xl">Bla i alle plantene</h2>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MEDICINAL_PLANTS.map((plant) => {
              const Icon = PLANT_ICON[plant.shape];
              return (
                <Link
                  key={plant.id}
                  href={`/plante/${plant.id}`}
                  className="hairline card-shadow group flex flex-col gap-3 overflow-hidden rounded-3xl bg-paper-deep/50 p-3 transition-transform hover:-translate-y-0.5"
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
        </section>
      </div>
    </main>
  );
}
