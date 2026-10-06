// Papirtekstur — eksakt oppskrift fra design/design_handoff_radbanken_forside/papirtekstur.md.
// Ikke et bilde: tre feTurbulence-lag (flekker/fibre/korn) per seksjon, ikke
// ett felles mix-blend-mode-lag over hele siden (det ble testet og forkastet,
// se filen). Verdiene under er hentet ordrett derfra — ikke endre dem.
const VARIANTS = {
  // lys grunn (#f5eee0, #faf5ea, #efe8da)
  light: {
    mottle: "0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0.06 0",
    fiber: "0 0 0 0 0.40  0 0 0 0 0.32  0 0 0 0 0.20  0 0 0 0.10 0",
    grain: "0 0 0 0 0.32  0 0 0 0 0.25  0 0 0 0 0.16  0 0 0 0.26 0",
  },
  // mørk grunn (#112418, #2c3727, #0c1b12)
  dark: {
    mottle: "0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.90  0 0 0 0.05 0",
    fiber: "0 0 0 0 1  0 0 0 0 1     0 0 0 0 0.92  0 0 0 0.09 0",
    grain: "0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.90  0 0 0 0.22 0",
  },
  // toppbildet: svakere, uten flekker
  hero: {
    mottle: null,
    fiber: "0 0 0 0 1  0 0 0 0 1     0 0 0 0 0.92  0 0 0 0.08 0",
    grain: "0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.90  0 0 0 0.19 0",
  },
} as const;

export function Paper({
  id,
  variant = "light",
  mottle = true,
}: {
  id: string;
  variant?: keyof typeof VARIANTS;
  /** Knapper bruker "uten flekker"-variant av dark/light — se tabellen i papirtekstur.md. */
  mottle?: boolean;
}) {
  const v = VARIANTS[variant];
  const showMottle = mottle && v.mottle;
  return (
    <svg
      aria-hidden="true"
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}
    >
      {showMottle && (
        <filter id={`pm-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={0.16} numOctaves={4} />
          <feColorMatrix values={v.mottle!} />
        </filter>
      )}
      <filter id={`pf-${id}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.9" numOctaves={2} />
        <feColorMatrix values={v.fiber} />
      </filter>
      <filter id={`pg-${id}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency={1.1} numOctaves={3} stitchTiles="stitch" />
        <feColorMatrix values={v.grain} />
      </filter>
      {showMottle && <rect width="100%" height="100%" filter={`url(#pm-${id})`} />}
      <rect width="100%" height="100%" filter={`url(#pf-${id})`} />
      <rect width="100%" height="100%" filter={`url(#pg-${id})`} />
    </svg>
  );
}
