import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Nordisk råd: en hyllest til den værbitte sjel | Rådbanken",
  description: "Om nødvendigheten av kulde, stillhet og ull.",
};

// Mockup-artikkel — Åshild skriver det ekte innholdet senere, dette er bare
// plassholdertekst i riktig toneleie så forsidens "Nordisk råd"-seksjon har
// en reell side å lenke til.
export default function NordiskRadArticlePage() {
  return (
    <main className="min-h-full" style={{ background: "#faf5ea" }}>
      <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
        <Link href="/" className="text-sm transition-opacity hover:opacity-70" style={{ color: "#4a5a4d" }}>
          &larr; Tilbake til Rådbanken
        </Link>

        <p className="font-figtree mt-8 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#8a6a2a" }}>
          Nordisk råd
        </p>
        <h1 className="font-lora mt-3 text-3xl sm:text-4xl" style={{ color: "#152318" }}>
          En hyllest til den værbitte sjel
        </h1>
        <p className="font-figtree mt-3 text-lg font-semibold" style={{ color: "#2e4332" }}>
          Om nødvendigheten av kulde, stillhet og ull.
        </p>

        <div className="relative mt-8 aspect-4/3 overflow-hidden" style={{ padding: 10, border: "2.5px solid #a67628" }}>
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src="/pictures/skibilde.png"
              alt="To skiløpere i gammel, svart-hvitt vinterstemning"
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
              style={{ filter: "grayscale(1) contrast(1.05) sepia(.08)" }}
            />
          </div>
        </div>

        <div className="font-figtree mt-10 flex flex-col gap-6 text-[18px] leading-relaxed" style={{ color: "#2e4332" }}>
          <p>
            Det moderne mennesket har glemt kuldens verdi. Vi lever i en evig temperert sone,
            beskyttet av isolasjonsglass og varmepumper. Men i Nordisk råd tror vi at karakter
            bygges når vinden biter i kinnene. Det er i møtet med det upolerte at vi finner tilbake
            til oss selv.
          </p>
          <p>
            Dette er en mockup-artikkel. Det ekte innholdet kommer senere — denne teksten er bare en
            plassholder slik at forsidens «Les hele innlegget →» peker på en reell side i mellomtiden.
          </p>
          <p className="font-lora text-xl italic" style={{ color: "#152318" }}>
            «Norge er ikke bare et land, det er en tilstand man må kle seg for.»
          </p>
        </div>
      </div>
    </main>
  );
}
