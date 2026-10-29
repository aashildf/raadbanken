import Image from "next/image";
import Link from "next/link";
import { Paper } from "@/components/Paper";

// "Artikler" — tre kort: bilde 4/3, kicker i Ember, tittel i Alegreya og
// ingress. Ett kort har svart flate med tekst i stedet for bilde, som i
// prototypen. Artiklene er Rådbankens egne (src/app/artikkel/*), med
// titlene og ingressene fra sidenes egen metadata. Lesetid er utelatt,
// siden den ikke finnes for alle.
const ARTICLES = [
  {
    href: "/artikkel/tyttebaer",
    kicker: "Planter & urter",
    title: "Naturens egen hostesaft",
    lead: "Hvorfor ublandet tyttebærsaft har vært et husråd mot hoste og sår hals i generasjoner.",
    image: "/pictures/menupictures/tyytebaer_pexels-sandra-seitamaa-89384773-9669197.jpg",
  },
  {
    href: "/artikkel/nordisk-rad",
    kicker: "Kultur",
    title: "Nordisk råd: en hyllest til den værbitte sjel",
    lead: "Om nødvendigheten av kulde, stillhet og ull.",
    // Ikke et sitat: ordene fra artikkelens egen ingress, satt stort.
    quote: "Kulde, stillhet og ull.",
  },
  {
    href: "/artikkel/syrin",
    kicker: "Planter & urter",
    title: "Syrin, mer enn en vakker vårduft",
    lead: "Syrinblomster er spiselige og fulle av virkestoffer, tradisjonelt brukt mot uro, urolig mage og irritert hud.",
    image: "/pictures/syrin2_pexels-jovanvasiljevic-24388204.jpg",
  },
] as const;

export function RavnArticles() {
  return (
    <section className="ravn-section" aria-labelledby="ravn-articles-h">
      <div className="ravn-wrap">
        <div className="ravn-head">
          <h2 id="ravn-articles-h" className="ravn-h2">
            Artikler
          </h2>
          <span className="ravn-meta">Artikler om planter, urter og det vi ikke må glemme</span>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,320px),1fr))", gap: "clamp(20px,2.4vw,36px)" }}>
          {ARTICLES.map((a) => (
            <Link key={a.href} href={a.href} className="group flex flex-col gap-3.5" style={{ color: "var(--ravn-ink)", textDecoration: "none" }}>
              {"image" in a ? (
                <span className="relative block overflow-hidden" style={{ aspectRatio: "4/3", borderRadius: 6, background: "var(--ravn-sand)" }}>
                  <Image
                    src={a.image}
                    alt=""
                    fill
                    sizes="(max-width: 720px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                </span>
              ) : (
                <span
                  className="ravn-serif relative flex items-center justify-center overflow-hidden text-center italic"
                  style={{ aspectRatio: "4/3", borderRadius: 6, background: "#11120e", padding: "0 10%", fontSize: "clamp(26px,2.4vw,36px)", lineHeight: 1.2, color: "#f3f0e8" }}
                >
                  <Paper id="ravn-art-dark" variant="dark" />
                  <span className="relative z-[3]">{a.quote}</span>
                </span>
              )}
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ravn-muted)" }}>{a.kicker}</span>
              <span
                className="ravn-serif group-hover:underline"
                style={{ fontSize: "clamp(24px,2vw,30px)", fontWeight: 500, lineHeight: 1.15, textWrap: "balance", textDecorationColor: "var(--ravn-ember)", textDecorationThickness: 3, textUnderlineOffset: 5 }}
              >
                {a.title}
              </span>
              <span style={{ fontSize: 16, lineHeight: 1.55, color: "var(--ravn-text3)" }}>{a.lead}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
