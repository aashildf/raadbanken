import Image from "next/image";
import type { ReactNode } from "react";
import { PrimaryButton } from "@/components/Button";
import { Paper } from "@/components/Paper";

// «Har du et godt råd å dele?»-boksen nederst på Alle råd, kategorisidene,
// plagesidene og Om oss. Én felles komponent i stedet for fire kopier.
// Satt opp som forsidens RAVN-CTA («Vet du noe andre burde vite?»): én lys
// flate med papirtekstur og ravnehode til venstre, ingen dobbel ramme.
// Ravnehodet er den svarte strektegningen (public/ravn/ravn-hode-strek.svg),
// samme tegning som forsidens røde hode, men i svart, siden rødt er
// forbeholdt det man kan gjøre noe med.
export function ShareAdviceBox({
  id,
  title = "Har du et godt råd å dele?",
  href = "/del-rad",
  button = "Del et råd",
  background = "#f5eee0",
}: {
  id: string;
  title?: ReactNode;
  href?: string;
  button?: ReactNode;
  background?: string;
}) {
  return (
    <section className="relative overflow-hidden" style={{ background }}>
      <Paper id={`${id}-section`} variant="light" />
      <div className="relative z-10 mx-auto max-w-[1480px]" style={{ padding: "40px clamp(16px,3vw,40px)" }}>
        <div
          className="share-box relative grid items-center overflow-hidden"
          style={{
            gap: "clamp(20px,4vw,64px)",
            padding: "clamp(36px,5vw,72px) clamp(24px,6vw,96px)",
            background: "#e9e4d8",
            borderRadius: 6,
          }}
        >
          <Paper id={id} variant="light" />
          <Image
            src="/ravn/ravn-hode-strek.svg"
            alt=""
            aria-hidden="true"
            width={294}
            height={301}
            className="share-box__ravn relative z-[3] h-auto"
          />
          <div className="relative z-[3] flex flex-wrap items-center gap-x-12 gap-y-6">
            <div className="max-w-[520px] flex-1" style={{ minWidth: 260 }}>
              <h2 className="font-lora m-0 mb-2 text-[clamp(26px,2.6vw,36px)] leading-[1.12]" style={{ color: "#111110" }}>
                {title}
              </h2>
              <p className="m-0 text-[17px] leading-[1.6]" style={{ color: "#3d3a33" }}>
                Noe du har lært av en forelder, besteforelder eller nabo, eller funnet ut selv? Gi det videre.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <PrimaryButton href={href}>{button}</PrimaryButton>
              <span className="font-lora text-[17px]" style={{ color: "#6d685c" }}>
                Sammen bevarer vi kunnskapen.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
