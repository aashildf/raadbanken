import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@/components/icons";

// Mor med kråka — design_handoff_radbanken_mor, del A. To pikselrett like
// PNG-er stablet oppå hverandre: basisbildet har bare omrisset av R-en, det
// øverste har R-en fylt i ember. Hover over bildet (eller tastaturfokus på
// lenken) toner det fylte bildet inn på 0,5 s. Bare opacity, ingen
// clip/maske — "tegne-inn"-effekten er valgt bort i handoffen.
// Egen komponent så testen kan fjernes ved å ta bort én import.
export function HeroMor() {
  return (
    <figure className="group/mor m-0 flex w-full min-w-0 flex-col gap-3.5">
      <div className="group/img relative" style={{ aspectRatio: "529 / 665" }}>
        <Image
          src="/pictures/hero-mor-tom.png"
          alt="Mor med kråke på skulderen og en kurv med urter"
          fill
          sizes="(max-width: 899px) 80vw, 560px"
          className="block"
          priority
        />
        <Image
          src="/pictures/hero-mor-fylt.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 899px) 80vw, 560px"
          className="pointer-events-none block opacity-0 transition-opacity duration-500 ease-[ease] group-hover/img:opacity-100 group-focus-within/mor:opacity-100 motion-reduce:transition-none"
          priority
        />
      </div>
      <figcaption className="flex flex-wrap items-end justify-between gap-x-5 gap-y-2.5">
        <span className="font-lora max-w-[30ch] text-[17px] italic leading-[1.35]" style={{ color: "#3d3a33" }}>
          Dette er mor, en dame med mange gode råd, og grunnen til at RAVN finnes.
        </span>
        <Link
          href="/alle"
          // Svart tekst med rød strek under (handoff: border-bottom 2px).
          className="inline-flex items-center gap-1.5 whitespace-nowrap pb-0.5 transition-opacity hover:opacity-75"
          style={{ fontSize: 15, fontWeight: 600, color: "#111110", textDecoration: "none", borderBottom: "2px solid #a93415" }}
        >
          Les mors beste råd
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </figcaption>
    </figure>
  );
}
