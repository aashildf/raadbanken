"use client";

import { useEffect, useRef, useState } from "react";
import { UpIcon, ArrowIcon } from "./shared";

// "Slik virker det" — tre blokker. Hover, fokus eller trykk åpner en blokk:
// den får bakgrunn og et lite eksempel tones inn (.ravn-step i
// globals.css). Plassen til eksemplet er reservert, så layouten ikke
// hopper. Eksemplene er illustrasjoner av grensesnittet (fra prototypen),
// ikke ekte råd eller brukere.
const STEPS = [
  { n: "1.", t: "Søk på problemet", d: "Skriv det du lurer på slik du ville sagt det. Du får rådene rangert med en gang." },
  { n: "2.", t: "Se folkets dom", d: "Hvert råd viser hvor stor andel som sier det virket, og hvor mange som har prøvd." },
  { n: "3.", t: "Si fra hvordan det gikk", d: "Trykk «Virket» eller «Ikke», og skriv gjerne en erfaring. Da blir rådene bedre for neste person." },
];

const TYPED = "Hvordan fjerne grønske fra klær?";

const ANSWERS = [
  { p: 91, t: "Eddik og vann, la virke en time før vask" },
  { p: 84, t: "Grønnsåpe og kald skylling" },
  { p: 62, t: "Sitron og sol på hvitt tøy" },
];

export function RavnHowItWorks() {
  const [open, setOpen] = useState(-1);
  const [typedN, setTypedN] = useState(0);
  const typer = useRef<ReturnType<typeof setInterval> | null>(null);

  function openStep(i: number) {
    if (open === i) return;
    if (typer.current) clearInterval(typer.current);
    setOpen(i);
    setTypedN(0);
    if (i === 0) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setTypedN(TYPED.length);
        return;
      }
      let k = 0;
      typer.current = setInterval(() => {
        k++;
        setTypedN(k);
        if (k >= TYPED.length && typer.current) clearInterval(typer.current);
      }, 38);
    }
  }

  function closeStep(i: number) {
    if (open !== i) return;
    if (typer.current) clearInterval(typer.current);
    setOpen(-1);
  }

  useEffect(() => () => {
    if (typer.current) clearInterval(typer.current);
  }, []);

  return (
    <section className="ravn-section" style={{ paddingBottom: "clamp(96px,11vw,168px)" }} aria-label="Slik virker det">
      <div
        className="ravn-wrap grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", borderTop: "1px solid var(--ravn-ink)", paddingTop: 16 }}
      >
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            tabIndex={0}
            className="ravn-step"
            data-open={open === i}
            onMouseEnter={() => openStep(i)}
            onMouseLeave={() => closeStep(i)}
            onFocus={() => openStep(i)}
            onBlur={() => closeStep(i)}
            onClick={() => openStep(i)}
          >
            <span className="ravn-serif italic" style={{ fontSize: 44, lineHeight: 1, color: "var(--ravn-ink)" }}>
              {s.n}
            </span>
            <h3 className="m-0" style={{ fontSize: "clamp(20px,1.6vw,24px)", fontWeight: 600, letterSpacing: "-.02em" }}>
              {s.t}
            </h3>
            <p className="m-0" style={{ maxWidth: "34ch", fontSize: 17, lineHeight: 1.55, color: "var(--ravn-text3)" }}>
              {s.d}
            </p>
            <div className="ravn-step__demo" aria-hidden="true">
              {i === 0 && (
                <div className="ravn-demo-box flex items-center gap-2.5" style={{ height: 52, padding: "0 8px 0 18px", borderRadius: 999 }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" style={{ flex: "none", fill: "none", stroke: "var(--ravn-muted)", strokeWidth: 2.2, strokeLinecap: "round" }}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                  <span className="ravn-serif min-w-0 flex-1 truncate" style={{ fontSize: 18 }}>
                    {open === 0 ? TYPED.slice(0, typedN) : ""}
                    <span style={{ color: "var(--ravn-muted)" }}>|</span>
                  </span>
                  <span className="grid shrink-0 place-items-center rounded-full" style={{ width: 36, height: 36, background: "var(--ravn-ink)", color: "var(--ravn-bone)" }}>
                    <ArrowIcon size={16} />
                  </span>
                </div>
              )}
              {i === 1 && (
                <ol className="ravn-demo-box m-0 list-none" style={{ padding: "6px 16px" }}>
                  {ANSWERS.map((x, k) => (
                    <li
                      key={x.t}
                      className="grid items-center gap-3"
                      style={{ gridTemplateColumns: "52px minmax(0,1fr)", padding: "10px 0", borderBottom: k < 2 ? "1px solid #e4ddcc" : 0 }}
                    >
                      <span className="ravn-serif" style={{ fontSize: 24, lineHeight: 1 }}>
                        {x.p}
                        <sup style={{ fontSize: ".5em" }}>%</sup>
                      </span>
                      <span className="flex min-w-0 flex-col gap-[5px]">
                        <span style={{ fontSize: 15, lineHeight: 1.3, color: "var(--ravn-text2)" }}>{x.t}</span>
                        <span className="block" style={{ height: 3, background: "#e4ddcc" }}>
                          <span className="block h-full" style={{ width: `${x.p}%`, background: "var(--ember-grain), var(--ravn-ember)" }} />
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              {i === 2 && (
                <div className="ravn-demo-box flex flex-col gap-3" style={{ padding: "14px 16px" }}>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex items-center gap-1.5"
                      style={{ height: 36, padding: "0 12px 0 8px", borderRadius: 999, background: "var(--ember-grain), var(--ravn-ember)", color: "var(--ravn-bone)", fontSize: 14, fontWeight: 600 }}
                    >
                      <UpIcon />
                      Virket
                    </span>
                    <span style={{ fontSize: 13, color: "var(--ravn-muted)" }}>Takk for at du sa fra!</span>
                  </div>
                  <p className="m-0" style={{ padding: "10px 12px", borderRadius: "4px 12px 12px 12px", background: "#efe9dc", fontSize: 15, lineHeight: 1.45, color: "var(--ravn-text2)" }}>
                    «Eddik funket på den hvite skjorta, men ikke på ullgenseren.»
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
