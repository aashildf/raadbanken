import Link from "next/link";
import Image from "next/image";
import { RemedyDisclaimer } from "@/components/RemedyDisclaimer";

export const metadata = {
  title: "Naturens egen hostesaft: Derfor virker det gamle tyttebærtrikset | Rådbanken",
  description: "Hvorfor ublandet tyttebærsaft har vært et husråd mot hoste og sår hals i generasjoner.",
};

export default function TyttebaerArticlePage() {
  return (
    <main className="min-h-full bg-paper">
      <div className="mx-auto w-full max-w-2xl px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          &larr; Tilbake til Rådbanken
        </Link>

        <header className="mt-8">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
            Naturens egen hostesaft
          </p>
          <h1 className="font-serif-display mt-4 text-3xl text-ink sm:text-4xl">
            Derfor virker det gamle tyttebærtrikset
          </h1>
          <p className="mt-4 text-ink-soft">
            Har du en gjenstridig hoste eller en sår hals som ikke vil gi seg? Før du løper til
            apoteket, kan det være verdt en tur i matboden eller fryseren. Et av våre eldste husråd
            gjemmer seg nemlig i det røde skogsgullet: tyttebæret.
          </p>
        </header>

        <div className="relative mt-10 aspect-5/3 overflow-hidden rounded-3xl">
          <Image src="/pictures/tyttebaer.png" alt="Tyttebær på busk" fill className="object-cover" />
        </div>

        <div className="mt-10 flex flex-col gap-6 text-ink-soft">
          <p>
            Gjennom generasjoner har lunken, ublandet tyttebærsaft vært flittig brukt i norsk
            folkemedisin mot både hoste og forkjølelse. Men er dette bare gammel overtro, eller er
            det faktisk noe i rådet? Mye av det de gamle generasjonene merket igjen, kan vi i dag
            forklare med bærets kjemiske innhold.
          </p>

          <section>
            <h2 className="font-serif-display text-2xl text-ink">Hvorfor virker tyttebærsaft mot hoste?</h2>
            <p className="mt-3">
              Når du drikker ublandet tyttebærsaft, skjer det flere ting i halsen samtidig. Bæret
              har tre egenskaper som tradisjonelt knyttes til lindring av hoste:
            </p>
            <ol className="mt-3 flex flex-col gap-4">
              <li>
                <strong className="text-ink">1. Naturens eget &laquo;aspirin&raquo;.</strong> Tyttebær
                har et naturlig høyt innhold av salisylsyre, samme kjemiske forbindelse som
                finnes i moderne smertestillende og febernedsettende midler. Den konsentrerte saften
                antas å kunne dempe den rispende følelsen som ofte utløser tørrhoste.
              </li>
              <li>
                <strong className="text-ink">2. Den trekker sammen hovne slimhinner.</strong> Har du
                lagt merke til at munnen blir litt tørr og stram av tyttebær? Det skyldes tanniner
                (garvestoffer). Når halsen er sår og betent, er slimhinnene hovne og røde.
                Garvestoffene i den ublandede saften har en sammentrekkende effekt som kan lette på
                trykket og dempe hosterefleksen noe.
              </li>
              <li>
                <strong className="text-ink">3. Naturlig rensende.</strong> Tyttebær muggner nesten
                aldri, takket være et høyt innhold av benzosyre (et naturlig konserveringsmiddel).
                Det gjør at saften antas å virke mildt antiseptisk i svelget mens du drikker den.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-serif-display text-2xl text-ink">Slik bruker du rådet</h2>
            <p className="mt-3">For at tyttebæret skal fungere best, er det to ting verdt å huske på:</p>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <strong className="text-ink">Drikk den ublandet.</strong> Saften skal ikke tynnes ut
                med vann, tykk og konsentrert legger den seg som et beskyttende lag over de
                følsomme slimhinnene i halsen.
              </li>
              <li>
                <strong className="text-ink">Drikk den lunken.</strong> Iskaldt vann kan irritere
                luftveiene og utløse hosteanfall, mens for varm væske irriterer en allerede sår
                hals. Lunken saft er mildest for svelget.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif-display text-2xl text-ink">En liten antioksidantbombe</h2>
            <p className="mt-3">
              I tillegg til den lindrende effekten på selve hosten, er tyttebær fulle av vitaminer
              og antioksidanter, som tradisjonelt regnes som en støtte for kroppen mens den
              bekjemper en forkjølelse.
            </p>
            <p className="mt-3">
              Så neste gang det kiler og river i halsen: varm opp en liten kopp ublandet
              tyttebærsaft, ta små slurker, og la kroppen gjøre resten.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <RemedyDisclaimer text="tyttebær hoste sår hals" />
        </div>
      </div>
    </main>
  );
}
