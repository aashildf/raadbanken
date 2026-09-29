import Image from "next/image";
import Link from "next/link";
import { BUTTON_PRIMARY_CLASS, BUTTON_PRIMARY_STYLE } from "@/lib/buttonStyles";

export const metadata = {
  title: "Om oss | Rådbanken",
  description: "Hva Rådbanken er, og hvorfor vi samler gamle husråd på nytt.",
};

export default function OmOssPage() {
  return (
    <main className="min-h-full bg-paper">
      <div
        className="mx-auto w-full py-14 sm:py-20"
        style={{ maxWidth: "var(--content-max)", paddingInline: "var(--page-pad)" }}
      >
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          &larr; Tilbake til Rådbanken
        </Link>

        {/* To spalter på lg+ i stedet for én smal, lang tekstkolonne (som ble
            en "tarm" nedover — se feedback_page_width_composition-notatet):
            venstre spalte holder kicker/tittel og henger igjen (sticky) mens
            du leser, høyre spalte har prosaen, fortsatt kappet til en lesbar
            målebredde (måler ~60 tegn) — bredden er komposisjonen, ikke bare
            et tall. Under lg stables det som før. */}
        <div className="mt-10 lg:grid lg:grid-cols-[280px_1fr] lg:gap-16">
          <header className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">Om oss</p>
            <h1 className="font-serif-display mt-4 text-4xl text-ink sm:text-5xl lg:text-4xl">
              Kunnskap er noe vi gir videre
            </h1>
            <Image
              src="/ikoner/dandelion_shadow.png"
              alt=""
              aria-hidden
              width={700}
              height={700}
              className="pointer-events-none mt-10 hidden select-none lg:block"
              style={{ width: 160, height: "auto", opacity: 0.3 }}
            />
          </header>

          <div className="mt-10 max-w-[60ch] lg:mt-0">
            <div className="flex flex-col gap-5 text-ink-soft">
              <p>
                Før vi hadde Google, TikTok og et produkt for hver eneste lille utfordring, lærte vi
                av hverandre.
              </p>

              <p>
                Noen visste hvordan man fikk flekker av ull. Noen visste hvordan man tok vare på
                maten gjennom vinteren. Noen visste hvordan en ødelagt ting kunne repareres i stedet
                for å kastes. Og noen hadde ganske enkelt et godt triks som gjorde hverdagen litt
                enklere.
              </p>

              <p>
                Denne kunnskapen ble delt fra menneske til menneske, fra én generasjon til den
                neste.
              </p>

              <p>
                <strong className="text-ink">Rådbanken er laget for å ta vare på den.</strong>
              </p>

              <p>
                Her samler vi kjerringråd, husråd, lifehacks, reparasjonstips, mattradisjoner,
                naturkunnskap og andre små og store erfaringer fra hverdagen.
              </p>

              <p>
                Men Rådbanken er ikke et ferdig arkiv.{" "}
                <strong className="text-ink">Det er et arkiv som vokser.</strong>
              </p>

              <p>
                Du kan dele det du selv har lært. Du kan fortelle hva som fungerte for deg, eller
                hva som ikke gjorde det. Du kan stemme på andres råd og være med på å løfte frem det
                som har vist seg nyttig for flere.
              </p>

              <p>Slik møtes gammel erfaring og nye erfaringer på samme sted.</p>

              <p>
                For kunnskap trenger ikke å være ny for å være verdifull.
                <br />
                Den trenger bare å bli <strong className="text-ink">brukt, delt og gitt videre.</strong>
              </p>

              <section className="mt-5">
                <h2 className="font-serif-display text-2xl text-ink">En liten viktig forskjell</h2>
                <p className="mt-3">
                  Rådbanken samler erfaringsbaserte råd. At et råd har fungert for én person, betyr
                  ikke nødvendigvis at det fungerer for alle. Stemmer og erfaringer kan gi en
                  pekepinn, men er ikke det samme som faglig dokumentasjon.
                </p>
                <p className="mt-3">
                  Ved spørsmål om helse, sikkerhet eller andre forhold der feil råd kan få alvorlige
                  konsekvenser, bør du alltid bruke relevante fagpersoner som kilde.
                </p>
              </section>
            </div>

            <Link href="/del-rad" className={`mt-10 ${BUTTON_PRIMARY_CLASS}`} style={BUTTON_PRIMARY_STYLE}>
              Del et råd
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
