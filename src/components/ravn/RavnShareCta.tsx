import Image from "next/image";
import { PrimaryButton } from "@/components/Button";
import { Paper } from "@/components/Paper";

// "Vet du noe andre burde vite?" — Ember-varianten fra prototypen: lys flate,
// ravnehode-omriss til venstre, overskrift på to låste linjer og en
// svart pilleknapp (den felles PrimaryButton). Hover på flaten: fem Ember-"?" stiger fra ravnehodet
// (.ravn-q / @keyframes ravn-q i globals.css). Av ved reduced motion.
// [venstre %, topp %, forsinkelse s, størrelse px, dx px, rotasjon deg]
const QM = [
  [62, 6, 0, 26, -14, -18],
  [72, 2, 0.45, 34, 18, 22],
  [56, 10, 0.9, 22, -26, -10],
  [78, 8, 1.35, 30, 6, 16],
  [66, 4, 1.8, 24, -8, -24],
] as const;

export function RavnShareCta() {
  return (
    <section className="ravn-section" style={{ paddingBottom: "clamp(56px,7vw,104px)" }} aria-labelledby="ravn-cta-h">
      <div
        className="ravn-cta ravn-wrap relative grid"
        style={{
          gap: "clamp(20px,4vw,72px)",
          padding: "clamp(48px,6vw,88px) clamp(28px,6vw,96px) clamp(48px,5vw,72px)",
          background: "#e9e4d8",
          borderRadius: 6,
        }}
      >
        <Paper id="ravn-cta" variant="light" />
        <div className="ravn-cta__head relative z-[3]" style={{ marginTop: ".3em" }}>
          <Image src="/ravn/ravn-hode-ember.png" alt="" aria-hidden="true" width={138} height={136} className="block h-auto w-full" />
          {QM.map(([x, y, d, s, dx, rot], k) => (
            <span
              key={k}
              aria-hidden="true"
              className="ravn-q"
              style={
                {
                  left: `${x}%`,
                  top: `${y}%`,
                  fontSize: s,
                  animationDelay: `${d * 1.5}s`,
                  "--dx": `${dx}px`,
                  "--rot": `${rot}deg`,
                } as React.CSSProperties
              }
            >
              ?
            </span>
          ))}
        </div>
        <div className="relative z-[3] flex min-w-0 flex-col" style={{ gap: "clamp(20px,2.4vw,32px)" }}>
          <h2
            id="ravn-cta-h"
            className="ravn-serif m-0"
            style={{ fontWeight: 500, fontSize: "clamp(36px,3.8vw,54px)", lineHeight: 1.18, letterSpacing: "-.01em", color: "#11120e" }}
          >
            <span className="whitespace-nowrap">Vet du noe andre</span>
            <br />
            <span className="whitespace-nowrap">burde vite?</span>
          </h2>
          <div className="flex flex-col items-start gap-5 self-end" style={{ maxWidth: 420, marginRight: "clamp(0px,6vw,120px)" }}>
            <p className="m-0" style={{ fontSize: "clamp(20px,1.7vw,24px)", fontWeight: 500, lineHeight: 1.4, color: "#11120e" }}>
              Del rådet ditt. Folket avgjør om det virker.
            </p>
            <PrimaryButton href="/del-rad">
              Del et råd <span aria-hidden="true">→</span>
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}
