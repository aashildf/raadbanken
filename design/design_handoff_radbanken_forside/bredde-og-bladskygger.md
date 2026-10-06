# Bredde og bladskygger: eksakt oppskrift

## 1. Full bredde (gjelder HELE siden)

**Regel:** Alle seksjoner går kant til kant, altså bakgrunn, papirtekstur og rammer i 100 % bredde. Bare *innholdet* inni har en maksbredde, og den er stor: **1480px**. Det er ingen smal "container" på 1100–1200px, og ingen hvit/tom marg på sidene av bakgrunnsfarger.

```css
/* Seksjonen: alltid full bredde */
.rb-section {
  position: relative;
  width: 100%;          /* aldri max-width på selve seksjonen */
  overflow: hidden;     /* bladskygger kan gå utenfor */
}

/* Innholdet: bredt, med luft som skalerer */
.rb-inner {
  max-width: 1480px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 40px);
}
```

Sjekkliste for Claude Code:
- Ingen `max-width` på `<section>`, `<header>` eller `<footer>`, kun på `.rb-inner`.
- Fjern eventuell global wrapper (`.container`, `.wrapper`, `main { max-width }`, Tailwind `container`/`max-w-7xl`/`max-w-6xl`) rundt seksjonene.
- Body/html: `margin:0`, ingen padding.
- Grid/flex inni bruker `minmax(0,1fr)` så kolonnene kan krympe, og ikke faste px-bredder.
- Skriftstørrelser og bilder skalerer med `clamp()` i stedet for å bryte til en smal layout.
- Kategoriraden i Utforsk: **8 ruter på én rad** (`grid-template-columns: repeat(8, minmax(0,1fr))`).
- «Del et råd»-rammen går nesten kant til kant, 40px fra sidene (`padding: 40px clamp(16px,3vw,40px)` på seksjonen, rammen fyller resten).

Test: på en 1920px skjerm skal ingen seksjon ha synlig "boks" i midten med tom bakgrunn rundt.

---

## 2. Bladskygger (pynt)

Myke, uskarpe skygger av løv, som sollys gjennom et tre som faller på papiret. De ligger i **hjørnet** av noen seksjoner, delvis utenfor kanten, og svaier svært sakte.

**Brukes i:** Intro (øvre høyre hjørne) og Nordisk råd (nedre venstre hjørne, speilet). Ikke flere steder.

### Komponent (React)

```jsx
const LEAVES = [
  [60, 40, -30], [110, 70, -10], [150, 120, 20], [90, 140, -50], [180, 60, 35],
  [210, 150, 10], [140, 200, -20], [250, 110, 50], [60, 210, -70],
];
const STEMS = 'M10 10C80 60 160 110 280 160M120 80C130 140 140 190 150 240M200 120C220 90 240 70 270 60';

export function LeafShadow({ style }) {
  return (
    <div aria-hidden="true"
         style={{ position: 'absolute', pointerEvents: 'none', zIndex: 1, ...style }}>
      <svg viewBox="0 0 300 240"
           style={{
             width: '100%', height: '100%', overflow: 'visible',
             mixBlendMode: 'multiply', opacity: 0.5, filter: 'blur(7px)',
             transformOrigin: '0 0', animation: 'leafSway 11s ease-in-out infinite',
           }}>
        <path d={STEMS} fill="none" stroke="#3c4a32" strokeWidth="4" opacity="0.5" />
        {LEAVES.map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx="30" ry="11"
                   transform={`rotate(${r} ${x} ${y})`} fill="#3c4a32" opacity="0.32" />
        ))}
      </svg>
    </div>
  );
}
```

```css
@keyframes leafSway {
  0%, 100% { transform: rotate(-1.2deg) translate(0, 0); }
  50%      { transform: rotate(1.4deg)  translate(6px, 3px); }
}
@media (prefers-reduced-motion: reduce) {
  [style*="leafSway"] { animation: none !important; }
}
```

### Plassering

```jsx
{/* Intro: øvre høyre */}
<section className="rb-section" style={{ background: '#f5eee0' }}>
  <Paper id="intro" variant="light" />
  <LeafShadow style={{ right: -80, top: -60, width: 520, height: 416 }} />
  <div className="rb-inner" style={{ position: 'relative' }}>…</div>
</section>

{/* Nordisk råd: nedre venstre, speilet */}
<section className="rb-section" style={{ background: '#faf5ea' }}>
  <Paper id="nordisk" variant="light" />
  <LeafShadow style={{ left: -90, bottom: -80, width: 560, height: 448, transform: 'scaleX(-1)' }} />
  <div className="rb-inner" style={{ position: 'relative' }}>…</div>
</section>
```

### Viktig
- Seksjonen **må** ha `position:relative; overflow:hidden`, ellers stikker skyggen ut over nabo-seksjonen.
- Lagrekkefølge: bakgrunn → **bladskygge (z-index 1)** → papirtekstur (z-index 2) → innhold. Da ligger kornet også over skyggen og den ser trykket ut.
- `mix-blend-mode: multiply` og `blur(7px)` er det som gjør den myk og "ekte". Ikke fjern dem.
- Den skal være svak. Hvis den ser ut som en mørk flekk, senk `opacity` på svg-en (0.35–0.5), ikke fargen.
- Et ekte foto av bladskygger (PNG med gjennomsiktighet, `multiply`, samme plassering) kan erstatte SVG-en senere.
