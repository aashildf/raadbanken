# Handoff: Rådbanken – ny visuell stil for forsiden

## Oversikt
Ny visuell identitet for forsiden til Rådbanken (kjerringråd og lifehacks), en blanding av "skogens ro", moderne editorial og art nouveau. Innhold og struktur finnes allerede i kodebasen. Denne pakken beskriver **utseende og oppførsel** som skal overføres.

## Om filene
`Radbanken Forside v2.dc.html` er en **designreferanse laget i HTML**: en prototype som viser utseende og oppførsel. Den er **ikke** produksjonskode som skal kopieres. Bygg designet på nytt i kodebasens eksisterende rammeverk og mønstre (komponenter, CSS-oppsett, routing). Åpne filen i nettleseren for å se den (`support.js` og `image-slot.js` må ligge ved siden av). Bildefelt er tomme plassholdere, og ekte bilder kommer fra kodebasen.

## Fidelity
**High-fidelity.** Farger, typografi, avstander, hover og animasjoner er endelige. Gjenskap nøyaktig.

---

## Design-tokens

### Farger
| Navn | Hex | Bruk |
|---|---|---|
| Skogsnatt | `#112418` | mørke flater, meny etter scroll, bunntekst (`#0c1b12`) |
| Mose mørk | `#2c3727` | mørkt kort "Nye trender", kategoriruter i hvile |
| Tekst | `#152318` | overskrifter, brødtekst på lys grunn |
| Tekst 2 | `#2e4332` | ingress, mellomtekst |
| Tekst 3 | `#4a5a4d` | metadata, tall |
| Lin | `#f5eee0` | sidebakgrunn, tekst på mørk grunn |
| Lin lys | `#faf5ea` | lyse seksjoner, kort |
| Papir | `#efe8da` | Utforsk-seksjonen |
| Lin kant | `#e1d6c2` | skillelinjer |
| Champagne | `#e6dcc0` / `#efe6cf` / `#d9c89c` | ornament, linjer og tekst på mørk grunn, frøkjerne |
| Champagne mørk | `#8a7a55` | tall, bilderammer på lys grunn |
| Gullbrun | `#8a6a2a` / `#a67628` | seksjonsoverskrifter, buerammer på lys grunn |
| Salvie (primærknapp) | `#6f7d61` → hover `#566349` | hovedknapper |
| Salvie ring | `#8c9476` | hover-ring på kategoriruter |
| Terrakotta | `#8a5c47` | RÅD i ordleken, rammen i "Del et råd", lenker |
| Terrakotta hover | `#7e523f` | kategoriruter ved hover |
| Dyp fersken | `#e9a985` | menylenker ved hover |
| Rust | `#8c491a` | hjerter |

### Typografi (Google Fonts)
- **Overskrifter:** Lora 500/600 (alternativ testet: Cormorant Garamond). **Ikke kursiv noe sted.**
- **Brødtekst og UI:** Figtree 400/500/600/700.
- **Ordleken RÅD:** IBM Plex Mono 400/500.
- **Logo-ordmerke:** Penshurst, levert som vektor-SVG (`stilpakke/logo/`), ingen font.

Skala:
- Seksjonsoverskrift: Lora, store bokstaver, `clamp(20px,1.9vw,26px)`, letter-spacing .16em, gullbrun. På mørk grunn champagne.
- H2: Lora 400, `clamp(20px,1.7vw,26px)` til `clamp(30px,3.2vw,44px)`, line-height 1.12–1.2, `text-wrap: balance`.
- Brødtekst: 15–18px / 1.6. Metadata: 13–14px.
- Knapper: Figtree 700, 12px, store bokstaver, letter-spacing .2em, line-height 1.
- Menylenker: Figtree 400, 12.5px, store bokstaver, letter-spacing .22em.

### Form
- Knapper: radius 2px. Kort og felt: radius 6–8px. Bilder i liste: 2px.
- Bue (klokken fra logoen), brukt sparsomt: `border-radius: 999px 999px 14px 14px` på collagebildet.
- Ingen pille-former.

### Papirtekstur (viktig for helheten)
Hver seksjon har et SVG-overlegg (`position:absolute; inset:0; pointer-events:none; z-index:2`) med tre lag `feTurbulence` + `feColorMatrix`:
1. Flekker: `baseFrequency 0.16`, numOctaves 4, alfa 0.05–0.06
2. Fibre: `baseFrequency "0.04 0.9"`, numOctaves 2, alfa 0.09–0.10
3. Korn: `baseFrequency 1.1`, numOctaves 3, alfa 0.22–0.26

Mørk grunn bruker lys farge (rgb ≈ 1,.97,.9), lys grunn bruker mørk brun (rgb ≈ .32,.25,.16). Se SVG-ene i HTML-filen for eksakte matriser. Toppbildet har svakere tekstur (kun fibre .08 + korn .19, ingen flekker).
**Tekstur skal ligge OVER fargeflater** (også over kategoriruter), så fargeskift ser ut som blekk som trekker inn i papiret. Tekst i knapper løftes over teksturen (`position:relative; z-index:1`).

### Bevegelse
Alle hover-overganger: `.55s cubic-bezier(.3,.6,.25,1) 60ms` (en kort forsinkelse er bevisst). Kategoriruter: `.7s`. **Ingen hopp eller skalering.** Bare farge, bakgrunn og kant endres.

---

## Seksjoner (i rekkefølge)

### 1. Meny
- `position: fixed`, over toppbildet. Bakgrunn `rgba(52,64,54,.62)` + `backdrop-filter: blur(10px)`. Etter scroll > 480px: `rgba(17,36,24,.96)`. Underkant `1px rgba(239,230,207,.14)`.
- Venstre: **bare løvetannhodet**, ikke tekst og ikke klokken. Bruk filen `stilpakke/logo/radbanken-ikon-krem.svg` (kremfarget, på den mørke menyen) i 46×46 px. `radbanken-ikon-mork.svg` er samme ikon til lys bakgrunn og favicon.
- Midten: UTFORSK (med pil og nedtrekk), NORDISK RÅD, OM RÅDBANKEN. Hover: farge `#e9a985` og 1px strek under i samme farge (strek finnes alltid, transparent i hvile, så ingenting hopper).
- Høyre: søk, LOGG INN, knappen "Del et råd" (sekundær, se Knapper). 11px/700, padding 14×28.
- **Nedtrekk Utforsk:** åpnes på hover og klikk, pilen roterer 180°. Panel 560px på `#f5eee0` med papirtekstur, dobbel ramme (1px `#8a5c47` ytre, 6px luft, 1px `rgba(138,92,71,.55)` indre). KATEGORIER (11px gullbrun), 8 kategorier i 2 kolonner med salvie-ikon og skillelinje, og nederst "Ukens utfordring →" og "Mest stemte →".

### 2. Toppbilde
- min-høyde 600px, bilde dekker. Radial overlegg: `rgba(17,36,24,.45) 0%, .25 45%, .55 100%`.
- Midtstilt: merke (klokke med løvetann, `radbanken-merke-mork.svg`, 150px høy) → ordmerke (`radbanken-ordmerke-mork.svg`, maks 460px) → "KUNNSKAP SOM GÅR I ARV" (Figtree 600 13px, .3em, `#efe6cf`) med champagne-linjer på hver side (gradient til transparent), like bred som ordmerket. Logoene har `drop-shadow(0 2px 10px rgba(10,22,14,.55))`.
- Knapper: "Utforsk råd" (primær) + "Del et råd" (sekundær).
- **Drivende frø:** 3 små løvetannfrø (SVG, `#efe6cf`) som flyter opp og ut fra logoen, 14s lineær uendelig løkke, forskjøvet 0, 4.5 og 9s (`translate(260px,-220px) rotate(20→70deg)`, toner inn og ut).

### 3. Intro – ordleken RÅD
- Lav seksjon på `#f5eee0`, papirtekstur, myk bladskygge i hjørnet (uskarpe ellipser, `blur(7px)`, multiply, svaier sakte i 11s).
- **RÅD står fast midt på siden.** Grid `minmax(0,1fr) auto minmax(0,1fr)`. RÅD i midtkolonnen (`#8a5c47`, 500), ord til venstre høyrejustert og til høyre venstrejustert (`#6f7d61`), `white-space: pre` så mellomrom beholdes. IBM Plex Mono `clamp(17px,1.8vw,24px)`, letter-spacing .06em.
- Bytter hvert 2.6s: `-LØS?`, `BESTEMORS ·`, `· FOR FORKJØLELSE`, `NORDISKE ·`, `DER GODE · ER GRATIS`, `· FOR STORE OG SMÅ`, `NÅR DU TRENGER GODE ·`, `· DU DELER`, `·BANKEN`. Nye ord: `opacity 0→1, translateY(10px)→0, blur(3px)→0`, .9s, høyre side 120ms forsinket.
- Under: 15px, `#4a5a4d`, maks 440px, midtstilt.
- Venstre og høyre: frie utklipp uten bakgrunn (PNG). Høyre: hånd som holder polaroid. Venstre: presset blomst eller herbarium. Absolutt plassert, vertikalt midtstilt (brukerens valg: hånd ca. 320px bred, −6°).

### 4. Ukens utfordring
- Samlet og midtstilt: grid `auto 1px auto`, `justify-content: center`, gap `clamp(28px,4vw,64px)`, maks 1480px.
- Venstre gruppe (flex, ingen wrap, gap 16–24px):
  - Tekstspalte (maks 440px): "UKENS UTFORDRING" (seksjonsstil, nowrap, `clamp(14px,1.15vw,18px)`), H2 "Hva er ditt beste tips mot tørre vinterhender?" på 2 linjer (maks 19ch), "Vi samler folkets beste råd for den kommende kuldeperioden." på én linje (13–15px), knapp "Send inn ditt svar" + "127 råd samlet · 843 stemmer" (13px).
  - Collage i bue, bredde `clamp(160px,16vw,240px)`, 4:5, 10px luft og 2px ramme `#a67628`. Under: sitat 13px Figtree (ikke kursiv), `#56633f`.
- 1px loddrett linje `#d8c9a6`.
- "UKENS BOKTIPS" (12px .26em gullbrun med linjer på sidene) og 2 bokomslag 2:3, det andre forskjøvet 28px ned, skygge `0 10px 24px rgba(21,35,24,.18)`. Bredde `clamp(240px,24vw,340px)`.

### 5. Nye trender + Toppen av visdom (2 kolonner)
- **Nye trender** (mørkt kort `#2c3727`, radius 6, lys tekstur, jugendhjørner i champagne oppe til venstre og nede til høyre): løvetannikon + "NYE TRENDER", tekst, favorittliste (tall i Lora 22px champagne, **ingen sirkler**), "12 456 aktive stemmere", stripe med 3 personbilder (3px mellomrom), "Se hva folk har stemt frem →".
- **VIKTIG – rådtitler:** titlene i Toppen av visdom («Kaffegrut mot lukt» osv.) skal være **Lora 400, 21px, line-height 1.2** – ikke Figtree. Ingen `overflow:hidden`, `truncate` eller `line-clamp` på tittelen (det kutter g/j/p/y nederst).
- **Toppen av visdom** (`#faf5ea`, dobbel ramme 1.5px `#a67628` + 6px + 1px `rgba(166,118,40,.5)`): rad = tall (Lora 30px `#8a7a55`, ingen sirkel) · kvadratisk bilde 68×68 med 4px luft, 1px ramme `#8a7a55` og hjørnekrøller · tittel Lora 21px + "N stemmer" · hjerte.
- **Hjerte:** klikk for å stemme. Fylles `#8c491a`, teller +1, nytt klikk angrer. Hover: opacity .7.

### 6. Utforsk Rådbanken
- `#efe8da`, maks 1480px. "UTFORSK RÅDBANKEN" (seksjonsstil) + "Finn råd som gjør hverdagen litt enklere." (17px).
- **8 ruter på én rad** (`repeat(8,minmax(0,1fr))`, gap 10px). Rute: radius 6, padding 24/6/20, ikon 30px (Lucide-stil, strek 1.6) + etikett 14px/600, alltid `#f5eee0`.
- Hvile: bakgrunn `#2c3727`, ring `inset 0 0 0 3px transparent`.
- **Hover:** bakgrunn → `#efe6cf` (krem), ring → `#8a5c47` (3px, finnes alltid), tekst og ikon → `#152318`. `.7s`. Ingen transform.
- **Løvetann-frø ved hover:** 8 dun-frø løsner fra musepekeren og blåser ut over hele siden (Bris: alle retninger + vind fra musebevegelsen, avstand 75 %, varighet 70 %, 0.9s cooldown per rute, av ved `prefers-reduced-motion`). Ferdig funksjon `rbSeedBurst()` ligger i `fasit/utforsk.html`. Kopier den 1:1.
- Kategorier: Kjerringråd, Lifehacks, Kultur, Planter & urter, Mat & konservering, Hus & hjem, Reparasjon, Helse & velvære.

### 7. Nordisk råd
- Bilde 4:3 med 10px luft og 2.5px ramme `#a67628`, **alltid svart-hvitt**: `filter: grayscale(1) contrast(1.05) sepia(.08)`. Bladskygge i hjørnet.
- "NORDISK RÅD", H2 "En hyllest til den værbitte sjel.", undertittel 19px/600, brødtekst 18px, "Les hele innlegget →" og sitat i Lora.

### 8. Del et råd
- `#f5eee0` med lys tekstur. Ramme nesten i full bredde (40px fra kantene): 1.5px `#8a5c47`, 6px luft, 1px `#8a5c47` inni. Jugendhjørner i terrakotta (46px) i alle fire hjørner. Indre padding minst 64px, så innholdet ikke treffer hjørnene.
- Innhold midtstilt (maks 1100): lys logo `radbanken-merke-lys.svg` 130px · H2 "Har du et godt råd å dele?" + tekst · knapp "Del et råd" i terrakotta-variant + "Sammen bevarer vi kunnskapen." (terrakotta, Lora).

### 9. Bunntekst
`#0c1b12`, ordmerke 40px, lenker `#e1d6c2`, sosiale ikoner i champagne.

---

## Knapper (ett system)
Alle knapper: firkantet, radius 2px, padding 17×31 (meny 14×28). Ingen dobbel ramme rundt hele knappen.

**Hjørnemarkering:** i to motsatte hjørner (oppe til venstre og nede til høyre) sitter to små, **vinkelrette L-formede streker inni hverandre**. Det er ikke krøller og ikke avrundet. Hver markering er en 11×11px SVG, plassert 3px inn fra kanten. Den nederste er speilet med `transform: scale(-1,-1)`. Strekene er 1.1px, skarpe hjørner (`stroke-linejoin: miter`, `stroke-linecap: square`), og har fargen `currentColor`, så de følger knappens tekst- og ornamentfarge.

```html
<button class="rb-btn rb-btn--primary">
  <svg class="rb-corner rb-corner--tl" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 11V1H11M4 11V4H11"/></svg>
  <svg class="rb-corner rb-corner--br" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 11V1H11M4 11V4H11"/></svg>
  <span>Utforsk råd</span>
</button>
```
```css
.rb-btn{position:relative;display:inline-flex;align-items:center;border-radius:2px;padding:17px 31px;
  font:700 12px/1 'Figtree',sans-serif;letter-spacing:.2em;text-transform:uppercase;border:0;cursor:pointer;
  transition:background-color .55s cubic-bezier(.3,.6,.25,1) 60ms,color .55s cubic-bezier(.3,.6,.25,1) 60ms,box-shadow .55s cubic-bezier(.3,.6,.25,1) 60ms}
.rb-btn span{position:relative;z-index:1}
.rb-corner{position:absolute;width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:1.1;stroke-linecap:square;stroke-linejoin:miter;pointer-events:none}
.rb-corner--tl{left:3px;top:3px}
.rb-corner--br{right:3px;bottom:3px;transform:scale(-1,-1)}
.rb-btn--primary{background:#6f7d61;color:#f5eee0}
.rb-btn--primary .rb-corner{color:rgba(245,238,224,.75)}
.rb-btn--primary:hover{background:#566349}
.rb-btn--secondary{background:transparent;color:#efe6cf;box-shadow:inset 0 0 0 1px #e6dcc0}
.rb-btn--secondary:hover{background:#efe6cf;color:#152318;-webkit-text-stroke:.35px #152318}
.rb-btn--terra{background:transparent;color:#8a5c47;box-shadow:inset 0 0 0 1px #8a5c47}
.rb-btn--terra:hover{background:#8a5c47;color:#f5eee0}
```
- **Primær** ("Utforsk råd", "Send inn ditt svar"): bakgrunn `#6f7d61`, tekst `#f5eee0`, krøller `rgba(245,238,224,.75)`, papirtekstur. Hover: bakgrunn `#566349` (tekst uendret).
- **Sekundær** ("Del et råd" i meny og toppbilde): transparent, 1px kontur `#e6dcc0` (meny `rgba(239,230,207,.7)`), tekst og krøller champagne. Hover: fylles `#efe6cf`, tekst og krøller `#152318`, `-webkit-text-stroke: .35px` (mørk tekst ser tynnere ut), og papirtekstur toner inn (kun ved hover).
- **Terrakotta-variant** ("Del et råd" nederst): kontur og tekst `#8a5c47`. Hover: fyll `#8a5c47`, tekst `#f5eee0`.

## State
- `scrolled` (scrollY > 480) → menyens bakgrunn
- `menuOpen` → nedtrekk
- `liked: {id: bool}` → hjerter og tellere
- `rad` (0–8, intervall 2.6s) → ordleken
- hover-indekser for kategoriruter og sekundærknapper (kun for å tone inn tekstur, og kan løses med CSS `:hover` på barn i ekte kode)

## Assets
- `stilpakke/logo/*.svg`: merke, ordmerke, liggende og stående, i lys og mørk variant (champagne-metall-gradient i mørke filer). Disse er endelige.
- `stilpakke/logo/radbanken-ikon-krem.svg` / `-mork.svg`: løvetannhodet alene. Brukes i menyen og som favicon.
- Løvetannhode, frø og hjørneornament er inline SVG i HTML-filen (`#fPuff`, `#fCorner`) og kan hentes derfra.
- `uploads/heroimage.png`: toppbilde.
- Øvrige bilder (collage, polaroid-hånd, herbarium, bokomslag, personer, arkivfoto, rådbilder) leveres fra kodebasen.

## Filer
- `fasit/trender-og-topp.html`: **ren HTML/CSS-fasit** for Nye trender + Toppen av visdom. Ingen rammeverk, alle verdier løst opp. Åpne den og kopier CSS-en 1:1.
- `fasit/utforsk.html`: ren HTML/CSS-fasit for Utforsk Rådbanken (8 ruter, hover, papirkorn over rutene).
- `Radbanken Forside v2.dc.html`: hele forsiden (referanse; åpne i nettleser)
- `support.js`, `image-slot.js`: kun for å kunne åpne referansen
- `stilpakke/logo/`: logofiler
- `screenshots/01–07`: skjermbilder per seksjon (papirtekstur og animasjoner vises best i HTML-filen)
