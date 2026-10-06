"use client";

import { usePathname } from "next/navigation";

// Papirfølelsen er tre lag, ikke ett — et korn-overlegg alene ser ut som
// digital støy. De tre lagene:
//   1. GrainOverlay (dette laget) — fint korn, fast til vinduet, over ALT
//      (navbar, hero-foto, resten av siden) med samme opasitet og blend
//      overalt. Det er det som gjør at hele siden føles som samme papir i
//      stedet for at hver seksjon har sin egen, ulike "korn-behandling".
//   2. BotanicalWatermark — et nesten umerkelig, flist bladmønster.
//   3. Varm bunnfarge og paper-border/card-shadow-utilities i globals.css
//      (.paper-border, .card-shadow) brukt på kortflater.
//
// Forrige versjon brukte normal blending (uten mix-blend-mode), som matcher
// oppskriften med en ekte, halvgjennomsiktig papir-PNG nøyaktig. Problemet
// er at kornet i seg selv i snitt er lys grå (se feComponentTransfer under —
// klemt mot midtgrått, men fortsatt lyst), og normal blending av noe lyst
// kan bare gjøre bunnen LYSERE, aldri mørkere. Over sidens lyse papirbunn er
// det fint — men over det mørke hero-fotoet vasket det ut skyggepartiene og
// gjorde bildet flatere/lysere, stikk i strid med at teksten skal poppe.
// multiply løser dette: den kan bare mørkne, aldri lysne — synlig korn på
// lyse flater (som før), og på det mørke fotoet blir mørke partier værende
// mørke (eller enda mørkere) i stedet for å vaskes ut.
//
// Rått feTurbulence-output er derimot HARD, tilfeldig per-piksel-støy —
// akkurat det ekte papir ikke er. Ved synlig opasitet leser det som
// TV-flimmer, ikke papirfiber. To triks retter det: en liten feGaussianBlur
// rett etter turbulensen mykner de harde piksel-til-piksel-hoppene til myke
// klumper i stedet for statisk snø, og en feComponentTransfer (lineær,
// slope 0.6/intercept 0.2) klemmer fargeområdet inn mot midtgrått i stedet
// for fullt sort-til-hvitt — ekte papirkorn er en svak tonevariasjon, ikke
// høykontrast-støy.
export const GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' result='t'/%3E%3CfeGaussianBlur in='t' stdDeviation='0.7' result='b'/%3E%3CfeComponentTransfer in='b'%3E%3CfeFuncR type='linear' slope='0.6' intercept='0.2'/%3E%3CfeFuncG type='linear' slope='0.6' intercept='0.2'/%3E%3CfeFuncB type='linear' slope='0.6' intercept='0.2'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// To små bladformer, flist hver 120px, nesten umerkelig (styrken kommer
// alene fra containerens opacity under — samme ett-sted-å-justere-prinsipp
// som kornet).
const BOTANICAL_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg fill='none' stroke='%232c232e' stroke-width='1.2'%3E%3Cpath d='M22 88 Q10 55 28 22 Q46 55 34 88 Q28 94 22 88Z'/%3E%3Cpath d='M23 87 L33 24'/%3E%3C/g%3E%3Cg fill='none' stroke='%232c232e' stroke-width='1.2' transform='translate(66,50) rotate(35)'%3E%3Cpath d='M22 88 Q10 55 28 22 Q46 55 34 88 Q28 94 22 88Z'/%3E%3Cpath d='M23 87 L33 24'/%3E%3C/g%3E%3C/svg%3E\")";

// Lavere enn normal-blend-versjonens 0.4 — multiply mørkner reelt (der
// normal ved samme opasitet bare vasket ut mot lyst), så samme tall ville
// blitt merkbart tyngre nå.
const GRAIN_OPACITY = 0.2;

export function GrainOverlay() {
  // Redesign-pakken (design/design_handoff_radbanken_forside/papirtekstur.md,
  // regel 4) forbyr eksplisitt ett felles fixed/mix-blend-mode-lag over hele
  // siden — "det ble testet og gav feil resultat". Forsiden har egne
  // per-seksjon <Paper>-overlegg nå, så det globale laget kobles ut akkurat
  // der. Resten av siten (ikke redesignet ennå) beholder det som før.
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[90]"
        style={{ backgroundImage: GRAIN_BG, opacity: GRAIN_OPACITY, mixBlendMode: "multiply" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[89]"
        style={{ backgroundImage: BOTANICAL_BG, opacity: 0.05 }}
      />
    </>
  );
}
