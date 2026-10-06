// Myk, uskarp løvskygge — eksakt oppskrift fra
// design/design_handoff_radbanken_forside/bredde-og-bladskygger.md. Brukes
// kun to steder (Intro øvre høyre, Nordisk råd nedre venstre speilet), ikke
// som generell pynt andre steder.
const LEAVES: [number, number, number][] = [
  [60, 40, -30],
  [110, 70, -10],
  [150, 120, 20],
  [90, 140, -50],
  [180, 60, 35],
  [210, 150, 10],
  [140, 200, -20],
  [250, 110, 50],
  [60, 210, -70],
];
const STEMS =
  "M10 10C80 60 160 110 280 160M120 80C130 140 140 190 150 240M200 120C220 90 240 70 270 60";

export function LeafShadow({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", pointerEvents: "none", zIndex: 1, ...style }}
    >
      <svg
        viewBox="0 0 300 240"
        style={{
          width: "100%",
          height: "100%",
          overflow: "visible",
          mixBlendMode: "multiply",
          opacity: 0.5,
          filter: "blur(7px)",
          transformOrigin: "0 0",
          animation: "leafSway 11s ease-in-out infinite",
        }}
      >
        <path d={STEMS} fill="none" stroke="#3c4a32" strokeWidth="4" opacity={0.5} />
        {LEAVES.map(([x, y, r], i) => (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="30"
            ry="11"
            transform={`rotate(${r} ${x} ${y})`}
            fill="#3c4a32"
            opacity={0.32}
          />
        ))}
      </svg>
    </div>
  );
}
