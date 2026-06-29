import Link from "next/link";
import Image from "next/image";
import { OrnateFrame } from "@/components/OrnateFrame";

export const metadata = {
  title: "Plantemedisinens historie | Rådbanken",
  description: "Historien bak kjerringråd og plantemedisin, kunnskapen som gikk fra mormor til barnebarn.",
};

export default function HistoriePage() {
  return (
    <main className="min-h-full bg-paper">
      <div
        className="mx-auto w-full max-w-4xl px-5 py-14 sm:py-20"
        style={{ paddingInline: "var(--page-pad)" }}
      >
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          &larr; Tilbake til Rådbanken
        </Link>

        <header className="mt-8 text-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
            Tradisjon &middot; Kunnskap &middot; Fellesskap
          </p>
          <h1 className="font-serif-display mt-4 text-4xl italic text-ink sm:text-5xl">
            Plantemedisinens historie, og hvorfor den fortsatt brukes
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-soft">
            Plantemedisin har fulgt mennesket i tusener av år. Før medisinske
            systemer, sykehus og apotek fantes, var det naturen som var vår
            første helsekilde. Kunnskapen ble delt rundt kjøkkenbordet, i
            klosterhager og mellom generasjoner, et praktisk,
            erfaringsbasert system som vokste frem lenge før vitenskapen kunne
            forklare hvorfor det virket.
          </p>
        </header>

        <div className="mt-14">
          <OrnateFrame className="max-w-md">
            <div className="relative aspect-4/5">
              <Image
                src="/pictures/urter_historie.png"
                alt="En gammel tinkturflaske, merket for hånd, omgitt av blomster"
                fill
                className="object-cover"
              />
            </div>
          </OrnateFrame>
          <p className="mt-3 text-center text-xs uppercase tracking-wide text-ink-soft/70">
            Bestemors hostetinktur - en husråd-tradisjon på flaske
          </p>
          <p className="mt-1 text-center text-[10px] text-ink-soft/50">
            Foto: Priscilla Du Preez / Unsplash
          </p>
        </div>

        <section className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-[0.8fr_1.2fr] sm:items-start">
          <div>
            <div className="relative aspect-3/4 overflow-hidden rounded-2xl">
              <Image
                src="/pictures/urtemedisin_kjokken.png"
                alt="En kvinne og et barn forbereder tørkede urter på et gammeldags kjøkken"
                fill
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-xs uppercase tracking-wide text-ink-soft/70">
              Urter tørkes og forberedes på et gammeldags kjøkken, slik de har
              blitt gjort i generasjoner.
            </p>
          </div>
          <div>
            <h2 className="font-serif-display text-2xl text-ink sm:text-3xl">
              Fra folketradisjon til moderne forståelse
            </h2>
            <p className="mt-4 text-ink-soft">
              I Norge var det ofte de kloke konene som bar kunnskapen om
              planter og helse. De visste hvilke urter som kunne lindre smerte,
              roe en urolig mage eller hjelpe kroppen gjennom en forkjølelse.
              Selv om noe av praksisen var preget av ritualer og folketro, var
              mye av det de gjorde basert på observasjon og erfaring over lang
              tid.
            </p>
            <p className="mt-4 text-ink-soft">
              Etter hvert som medisinsk teori utviklet seg, ble urter knyttet
              til ideer om balanse i kroppen. Selv om disse teoriene er
              utdaterte i dag, la de grunnlaget for en helhetlig tankegang: at
              kroppen fungerer som et system, og at behandling må støtte flere
              prosesser samtidig.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif-display text-2xl text-ink sm:text-3xl">
            Vitenskapen bak hvorfor urter virker
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Moderne forskning har gitt oss et nytt språk for å beskrive det
            folk har visst lenge: planter er komplekse. De inneholder
            hundrevis av bioaktive stoffer som påvirker hverandre og kroppen i
            et intrikat samspill. Dette gjør at en plante ofte har flere
            effekter samtidig, den kan støtte immunforsvaret, påvirke
            fordøyelsen, dempe betennelse og gi næring, alt i én og samme
            organisme.
          </p>
          <p className="mt-4 max-w-2xl text-ink-soft">
            I motsetning til isolerte kjemiske stoffer, som ofte har én
            tydelig virkning, jobber plantebaserte preparater bredere og
            mildere. Det er nettopp denne helheten som gjør dem interessante i
            en tid der mange kroniske plager ikke har én enkel løsning.
          </p>
        </section>

        <section className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-start">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-5/4 overflow-hidden rounded-2xl">
              <Image
                src="/pictures/urtehage_barn.png"
                alt="Et barn plukker urter i en fargerik urtehage"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <h2 className="font-serif-display text-2xl text-ink sm:text-3xl">
              Hvorfor urtemedisin får økt oppmerksomhet i dag
            </h2>
            <p className="mt-4 text-ink-soft">
              Interessen for urtemedisin har vokst i takt med moderne
              helseutfordringer. Mange opplever at kroppen reagerer bedre på
              behandling som støtter egne prosesser, fremfor å presse
              fysiologien i én retning. Samtidig har resistens mot antibiotika
              og økende forekomst av livsstilssykdommer gjort at flere søker
              komplementære metoder.
            </p>
            <p className="mt-4 text-ink-soft">
              Urter brukes i dag både som et supplement til skolemedisin og
              som en del av hverdagshelse. De er ofte lettere å tåle ved
              langvarige plager, og mange mennesker opplever at de gir en mer
              balansert og helhetlig støtte.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif-display text-2xl text-ink sm:text-3xl">
            Mat og medisin, to sider av samme plante
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            I mange tradisjoner har mat og medisin aldri vært adskilt. Når vi
            spiser planter, får vi ikke bare energi, men også en rekke stoffer
            som påvirker kroppen på subtile måter. Noen gir ro til
            nervesystemet, andre støtter immunforsvaret, og noen hjelper
            kroppen å håndtere stress eller betennelse.
          </p>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Dette er en av grunnene til at plantemedisin har overlevd: den er
            integrert i hverdagen. Et måltid kan være like mye forebyggende
            helse som det er ernæring.
          </p>
        </section>

        <div className="mt-16 hairline mx-auto flex max-w-xl flex-col justify-center rounded-2xl bg-plum-900 p-8 text-center text-paper">
          <span className="font-serif-display text-2xl italic leading-snug">
            &laquo;Kunnskap som overlever fordi den deles.&raquo;
          </span>
          <span className="mt-4 text-sm uppercase tracking-wide text-paper/60">
            - Rådbanken
          </span>
        </div>

        <section className="mt-16">
          <h2 className="font-serif-display text-2xl text-ink sm:text-3xl">
            En kunnskap som overlever fordi den deles
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Selv om moderne medisin dominerte store deler av 1900-tallet,
            forsvant ikke urtekunnskapen. Den ble liggende i notatbøker, i
            gamle glassflasker og i minner fra barndommen. I dag ser vi en ny
            interesse for naturbasert helse, ikke som erstatning for
            vitenskap, men som et supplement som bygger på erfaring,
            fellesskap og respekt for naturens kompleksitet.
          </p>
        </section>

        <section className="mt-16 text-center">
          <h2 className="font-serif-display text-2xl text-ink sm:text-3xl">
            Hvorfor vi samler det igjen
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-soft">
            Rådbanken er et forsøk på å samle denne typen kunnskap på nytt,
            ikke som medisinske fasitsvar, men som erfaringer delt mellom
            folk. Når mange stemmer på hva som har fungert for dem, dukker
            mønstrene opp igjen, akkurat som de gjorde rundt kjøkkenbordet for
            hundre år siden.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-plum-800 px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-plum-700"
          >
            Bla i råd
            <span aria-hidden>→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
