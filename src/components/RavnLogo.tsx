"use client";

import { useEffect, useRef } from "react";

// Animert Ravn-logo, public/animations/ravn-logo-animert.svg. Animasjonen
// ligger som CSS inne i filen og skal ikke endres: én 6 s syklus på uendelig
// løkke der bokstavene står oppå hverandre i to rader (0–20 %), sprer seg ut
// til RAVN på én linje (20–50 %), står slik (til 70 %) og samler seg igjen.
// Lastes i et <object> (ikke inline), så filens <style> og id-er ikke lekker
// ut i resten av siden, og styres utenfra med Web Animations API:
// - Ved innlasting: spiller én gang (sprer seg ut, venter litt, samler seg)
//   og blir så stående med bokstavene oppå hverandre.
// - Hover: sprer seg ut og blir stående. Musen bort: samler seg igjen.
// Avbrytbart midt i, og RATE gjør skiftet raskere enn filens eget tempo.
// Alle bokstavene deler samme currentTime, så filens forskjøvne
// animation-delay (0–0,24 s) gir fortsatt den lille forsinkelsen mellom dem.
// Ved prefers-reduced-motion slår filen selv av animasjonen: da finnes ingen
// animasjoner å styre, og logoen står bare som RAVN på én linje.
const STACKED = 0.2 * 6000; // slutten på 0–20 %-holdet
const SPREAD = 0.5 * 6000 + 240; // 50 % for den siste bokstaven (delay .24 s)
const RATE = 3;
const INTRO_HOLD = 700; // ms bokstavene står spredt under intro-avspillingen

const animationsOf = (obj: HTMLObjectElement | null) => obj?.contentDocument?.getAnimations() ?? [];

function settleAt(obj: HTMLObjectElement | null, t: number) {
  for (const a of animationsOf(obj)) {
    a.pause();
    a.currentTime = t;
  }
}

/** SVG-dokumentet er lastet (ikke bare objektets tomme startdokument). */
function svgReady(obj: HTMLObjectElement | null) {
  const d = obj?.contentDocument;
  return !!d && d.readyState === "complete" && d.documentElement?.nodeName.toLowerCase() === "svg";
}

export function RavnLogo({ className }: { className?: string }) {
  const objRef = useRef<HTMLObjectElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hovering = useRef(false);

  function goTo(target: number, then?: () => void) {
    const obj = objRef.current;
    const anims = animationsOf(obj);
    if (anims.length === 0) return;
    if (timer.current) clearTimeout(timer.current);
    const from = Number(anims[0].currentTime ?? STACKED);
    if (from === target) {
      then?.();
      return;
    }
    const rate = target > from ? RATE : -RATE;
    for (const a of anims) {
      a.playbackRate = rate;
      a.play();
    }
    timer.current = setTimeout(() => {
      settleAt(obj, target);
      then?.();
    }, Math.abs(target - from) / RATE);
  }

  useEffect(() => {
    const obj = objRef.current;
    if (!obj) return;
    let started = false;

    // Filens egen løkke går fra første stund, så den fryses straks SVG-en
    // er klar, og så spilles intro-en én gang. Både et direkte load-lytter
    // og en kort polling: load kan ha skjedd før React rakk å koble seg på
    // (f.eks. fra cache), og da ville løkka ellers gått for alltid.
    function start() {
      if (started || !svgReady(obj)) return;
      started = true;
      clearInterval(poll);
      if (animationsOf(obj).length === 0) return; // redusert bevegelse
      settleAt(obj, STACKED);
      goTo(SPREAD, () => {
        timer.current = setTimeout(() => {
          if (!hovering.current) goTo(STACKED);
        }, INTRO_HOLD);
      });
    }

    obj.addEventListener("load", start);
    const poll = setInterval(start, 120);
    const giveUp = setTimeout(() => clearInterval(poll), 8000);
    start();

    return () => {
      obj.removeEventListener("load", start);
      clearInterval(poll);
      clearTimeout(giveUp);
      if (timer.current) clearTimeout(timer.current);
    };
    // goTo leser bare refs, så effekten skal bare kjøre ved montering.
  }, []);

  return (
    <span
      className={`block ${className ?? ""}`}
      onMouseEnter={() => {
        hovering.current = true;
        goTo(SPREAD);
      }}
      onMouseLeave={() => {
        hovering.current = false;
        goTo(STACKED);
      }}
    >
      <object
        ref={objRef}
        data="/animations/ravn-logo-animert.svg"
        type="image/svg+xml"
        role="img"
        aria-label="Ravn"
        // Klikk skal gå til lenken rundt, ikke inn i SVG-dokumentet.
        className="pointer-events-none block h-full w-full"
      >
        Ravn
      </object>
    </span>
  );
}
