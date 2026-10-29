import Link from "next/link";
import { Paper } from "@/components/Paper";
import { ShareAdviceBox } from "@/components/ShareAdviceBox";

export const metadata = {
  title: "Om oss | RAVN",
  description: "Hva RAVN er, og hvorfor vi samler gamle husråd på nytt.",
};

// Bygget etter design/design_handoff_radbanken_forside/fasit/mal-artikkel-dybde.html
// ("README.md: mal-artikkel-dybde.html: redaksjonell... Gjelder Om oss"),
// samme mønster som /artikkel/nordisk-rad. Ingen toppbilde her (i motsetning
// til nordisk-rad-artikkelen) — denne siden handler om siten selv, ikke et
// konkret tema med et naturlig fotomotiv, så hodet er en vanlig mørk .phead
// (som /alle) i stedet for det delvis mørke båndet bak et bilde.
export default function OmOssPage() {
  return (
    <main className="relative" style={{ background: "#f5eee0" }}>
      <header className="relative overflow-hidden" style={{ background: "#111110" }}>
        <Paper id="om-oss-head" variant="dark" mottle={false} />
        <div
          className="relative z-10 mx-auto flex flex-col gap-4"
          style={{ maxWidth: 1480, paddingInline: "clamp(20px,3vw,40px)", paddingBlock: "56px 60px" }}
        >
          <ol className="m-0 flex flex-wrap gap-2 p-0 text-[13px]" style={{ color: "#cdc6b4" }} aria-label="Brødsmuler">
            <li>
              <Link href="/" className="transition-colors hover:text-[#a93415]">
                Forside
              </Link>
            </li>
            <li aria-current="page" className="before:mr-2 before:content-['/'] before:text-[#6d685c]" style={{ color: "#f5eee0" }}>
              Om oss
            </li>
          </ol>
          <div className="flex flex-col gap-1.5">
            <p className="font-lora m-0 text-[clamp(16px,1.4vw,20px)] font-medium uppercase leading-[1.2] tracking-[0.16em]" style={{ color: "#d4c9b3" }}>
              Om oss
            </p>
            <h1 className="font-lora m-0 text-[clamp(34px,3.6vw,52px)] leading-[1.08] text-balance" style={{ color: "#f5eee0" }}>
              Kunnskap er noe vi gir videre
            </h1>
          </div>
          <p className="m-0 max-w-[62ch] text-[clamp(17px,1.3vw,19px)] leading-[1.55] text-pretty" style={{ color: "#d9d2c1" }}>
            Før vi hadde Google, TikTok og et produkt for hver eneste lille utfordring, lærte vi av
            hverandre.
          </p>
        </div>
      </header>

      <article className="relative">
        <Paper id="om-oss-paper" variant="light" />

        <div className="relative z-10 mx-auto max-w-[calc(68ch+40px)] px-5 py-14 text-[18px] leading-[1.75] sm:py-20" style={{ color: "#111110" }}>
          <p className="m-0 first-letter:float-left first-letter:mr-[0.12em] first-letter:mt-[0.06em] first-letter:font-lora first-letter:text-[4.6em] first-letter:leading-[0.8] first-letter:text-[#111110]">
            Noen visste hvordan man fikk flekker av ull. Noen visste hvordan man tok vare på maten
            gjennom vinteren. Noen visste hvordan en ødelagt ting kunne repareres i stedet for å
            kastes. Og noen hadde ganske enkelt et godt triks som gjorde hverdagen litt enklere.
          </p>
          <p className="mt-5">
            Denne kunnskapen ble delt fra menneske til menneske, fra én generasjon til den neste.
          </p>
          <p className="mt-5">
            <strong style={{ color: "#111110" }}>RAVN er laget for å ta vare på den.</strong>
          </p>
          <p className="mt-5">
            Her samler vi kjerringråd, husråd, lifehacks, reparasjonstips, mattradisjoner,
            naturkunnskap og andre små og store erfaringer fra hverdagen.
          </p>
          <p className="mt-5">
            Men RAVN er ikke et ferdig arkiv. <strong style={{ color: "#111110" }}>Det er et arkiv som vokser.</strong>
          </p>
          <p className="mt-5">
            Du kan dele det du selv har lært. Du kan fortelle hva som fungerte for deg, eller hva
            som ikke gjorde det. Du kan stemme på andres råd og være med på å løfte frem det som har
            vist seg nyttig for flere.
          </p>

          <figure
            className="relative my-10 rounded-[2px] px-10 py-11 text-center sm:px-[52px]"
            style={{ background: "#111110" }}
          >
            <blockquote className="font-lora m-0 text-[clamp(24px,2.4vw,30px)] leading-[1.35] text-balance" style={{ color: "#f5eee0" }}>
              «Kunnskap trenger ikke å være ny for å være verdifull. Den trenger bare å bli brukt,
              delt og gitt videre.»
            </blockquote>
          </figure>

          <p className="mt-5">Slik møtes gammel erfaring og nye erfaringer på samme sted.</p>

          <aside className="relative mt-10 rounded-[6px] p-1.5" style={{ boxShadow: "inset 0 0 0 1.5px #6d685c" }}>
            <div className="flex flex-col gap-2 px-6 py-6 sm:px-7">
              <p className="font-lora m-0 text-[17px] font-medium uppercase tracking-[0.16em]" style={{ color: "#6d685c" }}>
                En liten viktig forskjell
              </p>
              <p className="m-0 text-[17px] leading-[1.6]">
                RAVN samler erfaringsbaserte råd. At et råd har fungert for én person, betyr
                ikke nødvendigvis at det fungerer for alle. Stemmer og erfaringer kan gi en
                pekepinn, men er ikke det samme som faglig dokumentasjon.
              </p>
              <p className="m-0 text-[17px] leading-[1.6]">
                Ved spørsmål om helse, sikkerhet eller andre forhold der feil råd kan få alvorlige
                konsekvenser, bør du alltid bruke relevante fagpersoner som kilde.
              </p>
            </div>
          </aside>
        </div>
      </article>

      <ShareAdviceBox id="om-oss-cta" background="#efe6cf" />
    </main>
  );
}
