import Link from "next/link";
import Image from "next/image";
import { Paper } from "@/components/Paper";
import { ArticleShareButton } from "@/components/ArticleShareButton";

export const metadata = {
  title: "Nordisk råd: en hyllest til den værbitte sjel | RAVN",
  description: "Om nødvendigheten av kulde, stillhet og ull.",
};

// Mockup-artikkel — Åshild skriver det ekte innholdet senere, dette er bare
// plassholdertekst i riktig toneleie så forsidens "Nordisk råd"-seksjon har
// en reell side å lenke til. Bygget etter
// design/design_handoff_radbanken_forside/fasit/mal-artikkel-dybde.html —
// "Visste du"-faktaboksen rommer selve mockup-varselet (ekte, ikke oppdiktet
// innhold: det ER en plassholderside), i stedet for å gjemme det i løpende
// tekst. Ingen forfatter/dato i bylinjen (ingen reell forfatter satt ennå) og
// ingen lagre-knapp (ingen lagringsmekanisme for artikler finnes), bare et
// reelt beregnet lesetid-anslag og en ekte del-knapp.

const PARAGRAPHS = [
  "Det moderne mennesket har glemt kuldens verdi. Vi lever i en evig temperert sone, beskyttet av isolasjonsglass og varmepumper.",
  "Men i Nordisk råd tror vi at karakter bygges når vinden biter i kinnene. Det er i møtet med det upolerte at vi finner tilbake til oss selv: en tur i mørket, en kald dusj, en natt uten dynetrekk.",
];

const QUOTE = "Norge er ikke bare et land, det er en tilstand man må kle seg for.";

const RELATED = [
  { href: "/artikkel/syrin", title: "Syrin: mer enn en vakker vårduft", readMinutes: 6 },
  { href: "/artikkel/tyttebaer", title: "Tyttebær: naturens egen hostesaft", readMinutes: 5 },
  { href: "/artikkel/fiken", title: "Fiken: en liten frukt med store helsefordeler", readMinutes: 4 },
];

function readMinutes(paragraphs: string[]) {
  const words = paragraphs.join(" ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default function NordiskRadArticlePage() {
  const minutes = readMinutes(PARAGRAPHS);

  return (
    <main className="relative" style={{ background: "#f5eee0" }}>
      {/* Mørkt bånd bak toppen av siden, ned til omtrent midten av
          toppbildet — samme teknikk som fasiten (der høyden settes av JS
          basert på toppbildets høyde; her en fast verdi som funker på tvers
          av vanlige skjermbredder siden toppbildet selv har fast 16:8-rate). */}
      <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden" style={{ height: 420, background: "#111110" }}>
        <Paper id="nordisk-rad-band" variant="dark" mottle={false} />
      </div>

      <article className="relative">
        <Paper id="nordisk-rad-paper" variant="light" />

        <header className="relative z-10 mx-auto flex max-w-[900px] flex-col items-center gap-4 px-5 pb-10 pt-14 text-center sm:pt-[56px]">
          <ol className="m-0 flex list-none justify-center gap-2 p-0 text-[13px]" style={{ color: "#cdc6b4" }} aria-label="Brødsmuler">
            <li>
              <Link href="/" className="transition-colors hover:text-[#a93415]">
                Forside
              </Link>
            </li>
            <li className="before:mr-2 before:content-['/'] before:text-[#6d685c]" style={{ color: "#cdc6b4" }}>
              Nordisk råd
            </li>
          </ol>
          <p className="font-lora m-0 text-[clamp(16px,1.4vw,20px)] font-medium uppercase leading-[1.2] tracking-[0.16em]" style={{ color: "#d4c9b3" }}>
            Nordisk råd
          </p>
          <h1 className="font-lora m-0 text-[clamp(38px,4.6vw,64px)] leading-[1.06] tracking-[-0.01em] text-balance" style={{ color: "#f5eee0" }}>
            En hyllest til den værbitte sjel
          </h1>
          <p className="m-0 max-w-[60ch] text-[clamp(18px,1.5vw,21px)] leading-[1.55] text-pretty" style={{ color: "#d9d2c1" }}>
            Om nødvendigheten av kulde, stillhet og ull.
          </p>
          <p className="m-0 text-[13px]" style={{ color: "#cdc6b4" }}>
            {minutes} min lesing
          </p>
        </header>

        <figure className="relative z-10 mx-auto max-w-[1240px] px-5" style={{ paddingInline: "clamp(20px,3vw,40px)" }}>
          <div className="relative aspect-[16/8] rounded-[2px] p-2.5" style={{ background: "#f5eee0", boxShadow: "inset 0 0 0 2px #6d685c, 0 24px 48px rgba(17,17,16,.22)" }}>
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src="/pictures/skibilde.png"
                alt="To skiløpere i gammel, svart-hvitt vinterstemning"
                fill
                sizes="(max-width: 1280px) 100vw, 1240px"
                className="object-cover"
                style={{ filter: "grayscale(1) contrast(1.05) sepia(.08)" }}
                priority
              />
            </div>
          </div>
          <figcaption className="mt-2.5 text-center text-[13px]" style={{ color: "#4a473f" }}>
            Arkivbilder vises alltid i svart-hvitt med svak varm tone.
          </figcaption>
        </figure>

        <div className="relative z-10 mx-auto mt-14 max-w-[calc(68ch+40px)] px-5 text-[18px] leading-[1.75]" style={{ color: "#111110" }}>
          <p className="m-0 first-letter:float-left first-letter:mr-[0.12em] first-letter:mt-[0.06em] first-letter:font-lora first-letter:text-[4.6em] first-letter:leading-[0.8] first-letter:text-[#111110]">
            {PARAGRAPHS[0]}
          </p>
          {PARAGRAPHS.slice(1).map((p, i) => (
            <p key={i} className="mt-5">
              {p}
            </p>
          ))}

          <figure
            className="relative my-10 rounded-[2px] px-10 py-11 text-center sm:px-[52px]"
            style={{ background: "#111110" }}
          >
            <blockquote className="font-lora m-0 text-[clamp(24px,2.4vw,30px)] leading-[1.35] text-balance" style={{ color: "#f5eee0" }}>
              «{QUOTE}»
            </blockquote>
          </figure>

          <aside className="relative rounded-[6px] p-1.5" style={{ boxShadow: "inset 0 0 0 1.5px #6d685c" }}>
            <div className="flex flex-col gap-2 px-6 py-6 sm:px-7">
              <p className="font-lora m-0 text-[17px] font-medium uppercase tracking-[0.16em]" style={{ color: "#6d685c" }}>
                Visste du?
              </p>
              <p className="m-0 text-[17px] leading-[1.6]">
                Dette er en mockup-artikkel. Det ekte innholdet kommer senere, denne teksten er bare
                en plassholder slik at forsidens «Les hele innlegget →» peker på en reell side i
                mellomtiden.
              </p>
            </div>
          </aside>
        </div>

        <footer className="relative z-10 mx-auto mt-12 flex max-w-[calc(68ch+40px)] flex-wrap items-center justify-between gap-4 px-5 pt-6" style={{ borderTop: "1px solid #d9d2c1" }}>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {["Vinter", "Friluftsliv"].map((tag) => (
              <li key={tag}>
                <span
                  className="inline-flex rounded-[2px] px-[13px] py-[9px] font-figtree text-[13px] font-semibold"
                  style={{ boxShadow: "inset 0 0 0 1px #cdc6b4", color: "#111110" }}
                >
                  {tag}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2.5 text-[13px]" style={{ color: "#4a473f" }}>
            <span>Del artikkelen</span>
            <ArticleShareButton title="En hyllest til den værbitte sjel" />
          </div>
        </footer>
      </article>

      {/* Les også — ekte lenker til de andre artiklene, ikke oppdiktede. */}
      <section className="relative overflow-hidden" style={{ background: "#efe6cf", borderTop: "1px solid #d9d2c1" }}>
        <Paper id="nordisk-rad-more" variant="light" />
        <div className="relative z-10 mx-auto flex flex-col gap-6" style={{ maxWidth: 1480, paddingInline: "clamp(20px,3vw,40px)", paddingBlock: "64px 72px" }}>
          <h2 className="font-lora m-0 text-[clamp(16px,1.4vw,20px)] font-medium uppercase leading-[1.2] tracking-[0.16em]" style={{ color: "#6d685c" }}>
            Les også
          </h2>
          <ul className="m-0 grid list-none gap-7 p-0" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))" }}>
            {RELATED.map((item) => (
              <li key={item.href}>
                <article className="flex flex-col gap-2">
                  <span className="font-figtree text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "#4a473f" }}>
                    Artikkel
                  </span>
                  <h3 className="font-lora m-0 text-xl leading-[1.2] text-balance" style={{ color: "#111110" }}>
                    <Link href={item.href} className="text-inherit no-underline transition-colors hover:text-[#a93415]">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="m-0 text-[13px]" style={{ color: "#4a473f" }}>
                    {item.readMinutes} min lesing
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
