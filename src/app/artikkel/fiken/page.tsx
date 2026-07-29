import Link from "next/link";
import Image from "next/image";
import { RemedyDisclaimer } from "@/components/RemedyDisclaimer";

export const metadata = {
  title: "Fikens mange helsefordeler | Rådbanken",
  description: "Derfor er fiken godt for fordøyelsen, hjertehelsen og skjelettet.",
};

export default function FikenArticlePage() {
  return (
    <main className="min-h-full bg-paper">
      <div className="mx-auto w-full max-w-2xl px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          &larr; Tilbake til Rådbanken
        </Link>

        <header className="mt-8">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
            Frukt med lange tradisjoner
          </p>
          <h1 className="font-serif-display mt-4 text-3xl text-ink sm:text-4xl">
            Fiken – en liten frukt med store helsefordeler
          </h1>
          <p className="mt-4 text-ink-soft">
            Fiken har en rekke medisinske egenskaper som særlig styrker fordøyelsen, hjertehelsen
            og skjelettet, på grunn av sitt høye innhold av kostfiber, antioksidanter og
            essensielle mineraler. Frukten har en lang historie innen folkemedisinen som et
            naturlig legemiddel mot flere hverdagsplager.
          </p>
        </header>

        <div className="relative mt-10 aspect-5/3 overflow-hidden rounded-3xl">
          <Image src="/pictures/fiken.png" alt="Ferske fiken, hele og oppskåret" fill className="object-cover" />
        </div>

        <div className="mt-10 flex flex-col gap-6 text-ink-soft">
          <p>Her er de viktigste medisinske fordelene og bruksområdene til fiken:</p>

          <section>
            <h2 className="font-serif-display text-2xl text-ink">Fordøyelse og tarmhelse</h2>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <strong className="text-ink">Virker avførende:</strong> Fruktsukkeret og det høye
                fiberinnholdet gir en mild, men sikker effekt mot forstoppelse.
              </li>
              <li>
                <strong className="text-ink">Skånsom for barn:</strong> Stimulerer tarmens
                bevegelser (peristaltikk) uten å irritere tarmen, noe som gjør den ideell for barn.
              </li>
              <li>
                <strong className="text-ink">Prebiotisk effekt:</strong> Det høye
                kostfiberinnholdet gir næring til de gode tarmbakteriene og optimaliserer
                tarmpassasjen.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif-display text-2xl text-ink">Hjerte- og karsystemet</h2>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <strong className="text-ink">Blodtrykksregulerende:</strong> Fiken er spesielt rik
                på kalium, et mineral som bidrar til å skille ut natrium og senke blodtrykket.
              </li>
              <li>
                <strong className="text-ink">Forebygger hjertesykdom:</strong> Innholdet av vitamin
                B6 bidrar til å senke nivået av homocystein i blodet, som er en kjent risikofaktor
                for hjerte- og karsykdommer.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif-display text-2xl text-ink">Muskel- og skjeletthelse</h2>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <strong className="text-ink">Styrker skjelettet:</strong> Tørket fiken er en viktig
                kilde til kalsium og magnesium. Kun tre tørkede fiken dekker over 20 % av det
                daglige kalsiumbehovet for voksne kvinner.
              </li>
              <li>
                <strong className="text-ink">Motvirker beinskjørhet:</strong> Det høye innholdet av
                kalsium i kombinasjon med vitamin K bidrar til å opprettholde en normal og sterk
                beinstruktur.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif-display text-2xl text-ink">Andre tradisjonelle bruksområder</h2>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <strong className="text-ink">Blodsukkerstabiliserende:</strong> Studier og
                tradisjonell bruk viser at fikenblad (ofte drukket som te) kan bidra til å øke
                insulinsensitiviteten.
              </li>
              <li>
                <strong className="text-ink">Lindrer hoste:</strong> Fruktkjøttet har en
                slimløsende og bløtgjørende effekt, og har historisk vært brukt mot tørr hoste og
                sår hals.
              </li>
              <li>
                <strong className="text-ink">Betennelsesdempende:</strong> Det bløtgjørende
                fruktkjøttet har i folkemedisinen vært lagt på huden for å lindre smerte,
                tannbyller og lokale hevelser.
              </li>
            </ul>
          </section>

          <div className="hairline rounded-xl px-4 py-3 text-sm" style={{ background: "#F7EFD9" }}>
            <strong className="text-ink">Tips:</strong> For å få best mulig effekt mot
            forstoppelse, bør tørket fiken bløtlegges i vann over natten, og du bør drikke rikelig
            med væske ved siden av.
          </div>
        </div>

        <div className="mt-10">
          <RemedyDisclaimer text="fiken forstoppelse fordøyelse" />
        </div>
      </div>
    </main>
  );
}
