# Papirtekstur: eksakt oppskrift

Papirteksturen er ikke et bilde. Den er et SVG-filter (`feTurbulence`) som legges over hver seksjon. Bruk denne komponenten 1:1. Ikke bytt den mot en PNG, `noise.png`, CSS-gradient eller `opacity` på et bilde.

## Regler
1. **Ett overlegg per seksjon**, som første barn i seksjonen: `position:absolute; inset:0; pointer-events:none; z-index:2`. Seksjonen må ha `position:relative`.
2. **Teksturen ligger OVER fargeflater** (bakgrunn, kort, kategoriruter), men **under tekst i knapper**. Knappetekst får `position:relative; z-index:1`. Innhold som skal ha tekstur over seg skal *ikke* ha egen `z-index` høyere enn 2.
3. **Mørk og lys grunn bruker ulike farger** i fargematrisen. Lyst korn på mørkt, brunt korn på lyst. Feil variant gir "grått slør" eller "skitne flekker".
4. **Ingen `mix-blend-mode`, ingen `position:fixed` overlegg** over hele siden. Det ble testet og gav feil resultat.
5. Hvert filter må ha **unik `id`** per seksjon (f.eks. `pf-hero`, `pg-hero`), ellers gjenbruker nettleseren feil filter.
6. Filterområdet må være `x="0" y="0" width="100%" height="100%"`, ellers blir kantene beskåret eller uskarpe.

## Komponent (React)

```jsx
const VARIANTS = {
  // lys grunn (#f5eee0, #faf5ea, #efe8da)
  light: {
    mottle: '0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0.06 0',
    fiber:  '0 0 0 0 0.40  0 0 0 0 0.32  0 0 0 0 0.20  0 0 0 0.10 0',
    grain:  '0 0 0 0 0.32  0 0 0 0 0.25  0 0 0 0 0.16  0 0 0 0.26 0',
  },
  // mørk grunn (#112418, #2c3727, #0c1b12)
  dark: {
    mottle: '0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.90  0 0 0 0.05 0',
    fiber:  '0 0 0 0 1  0 0 0 0 1     0 0 0 0 0.92  0 0 0 0.09 0',
    grain:  '0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.90  0 0 0 0.22 0',
  },
  // toppbildet: svakere, uten flekker
  hero: {
    mottle: null,
    fiber:  '0 0 0 0 1  0 0 0 0 1     0 0 0 0 0.92  0 0 0 0.08 0',
    grain:  '0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.90  0 0 0 0.19 0',
  },
};

export function Paper({ id, variant = 'light' }) {
  const v = VARIANTS[variant];
  return (
    <svg aria-hidden="true" width="100%" height="100%"
         style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      {v.mottle && (
        <filter id={`pm-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves="4" />
          <feColorMatrix values={v.mottle} />
        </filter>
      )}
      <filter id={`pf-${id}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.9" numOctaves="2" />
        <feColorMatrix values={v.fiber} />
      </filter>
      <filter id={`pg-${id}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix values={v.grain} />
      </filter>
      {v.mottle && <rect width="100%" height="100%" filter={`url(#pm-${id})`} />}
      <rect width="100%" height="100%" filter={`url(#pf-${id})`} />
      <rect width="100%" height="100%" filter={`url(#pg-${id})`} />
    </svg>
  );
}
```

## Bruk

```jsx
<section style={{ position: 'relative', background: '#f5eee0' }}>
  <Paper id="intro" variant="light" />
  <div style={{ position: 'relative' }}>…innhold…</div>
</section>
```

| Seksjon | Variant |
|---|---|
| Meny, Toppbilde | `dark` / `hero` |
| Intro, Ukens utfordring, Trender og topp, Utforsk, Nordisk råd, Del et råd | `light` |
| Kortet «Nye trender» (inni seksjonen) | eget `dark`-overlegg i kortet |
| Kategoriraden i Utforsk | eget `dark`-overlegg over hele raden, så rutene får korn også ved hover |
| Primærknapper | `dark` (uten flekker) inni knappen, tekst `z-index:1` |
| Sekundærknapper | `light` (uten flekker), `opacity:0` i hvile → `1` ved hover |

## Vanlige feil
- **Ser glatt/digitalt ut:** overlegget ligger *under* innholdet (z-index) eller mangler `numOctaves`.
- **Kamuflasjeflekker:** `baseFrequency` på flekker er for lav (skal være `0.16`, ikke `0.01–0.06`) eller alfa for høy.
- **Grått slør over alt:** brukt `light`-matrise på mørk grunn, eller lagt ett felles lag med `mix-blend-mode`.
- **Teksten blir grumsete:** knappetekst mangler `position:relative; z-index:1`.
