---
name: Rådbanken
description: Et varmt, redaksjonelt oppslagsverk for norske kjerringråd, bygget som et papirtrykt arkiv, ikke en helse-app.
colors:
  page-bg: "#E7DFC9"
  paper: "#f6f0e3"
  paper-deep: "#ede2c9"
  ink: "#2c232e"
  ink-soft: "#5c5063"
  header-bg: "#2E362C"
  header-text: "#E2DDD7"
  gold: "#c9a14a"
  gold-soft: "#e2c98a"
  sage: "#6f8f6c"
  rust: "#b25a3f"
  peach-accent: "#E1B08C"
  button-primary-bg: "#5E684F"
  plum-700: "#432065"
  plum-600: "#5c2f86"
  lilac-400: "#b07fe0"
  hero-bg: "#e7dbf0"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "normal"
  body:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.14em to 0.3em"
    textTransform: "uppercase"
rounded:
  pill: "9999px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  frame: "2rem"
spacing:
  page-pad-mobile: "20px"
  page-pad-desktop: "100px"
  content-max: "1280px"
  band-inset: "clamp(28px, 7vw, 110px)"
components:
  button-primary:
    backgroundColor: "{colors.button-primary-bg}"
    textColor: "#f5efeb"
    rounded: "{rounded.lg}"
    padding: "10px 24px"
  button-secondary-dark:
    backgroundColor: "rgba(20,24,18,0.42)"
    textColor: "#f5efeb"
    rounded: "{rounded.lg}"
    padding: "10px 24px"
  button-secondary-light:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "10px 24px"
---

# Design System: Rådbanken

## Overview

**Creative North Star: "Bestemors arkivskap"**

Rådbanken reads as a warm, aged paper archive, not a wellness dashboard. Every full-width surface (navbar, hero, "Ukens utfordring" band) carries the same fine grain texture, so the whole site feels like one continuous sheet of paper rather than stacked digital panels. The system deliberately rejects the generic SaaS pattern of uniform card grids: the homepage's ranking section (`src/app/page.tsx`, "Folkets favoritter") puts #1 in one dominant, boxed card and #2/#3 beside it as a plainer, unboxed list, specifically to avoid reproducing a "stat card" rhythm. Rows 4-10 drop into compact list rows with inline progress bars. Category pages (`src/app/kategori/[id]/page.tsx`) pair a sticky portrait image against a wide text column instead of a stacked hero.

Two confirmed anti-references, both stated directly in code comments: no "wellness app" polish (per PRODUCT.md), and no uniform three-card layout where asymmetry would read better. Numbers shown anywhere on the site (vote counts, weekly challenge, success rate) are always computed from live Firestore data, never fabricated, matching PRODUCT.md's "Evidence on Hand" constraint.

**Key Characteristics:**
- Warm cream/paper backgrounds with a dark plum-black ink, not a neutral gray-on-white system.
- A fine multiply-blend grain overlay unifies navbar, hero photo, and dark bands as one paper surface.
- Asymmetric editorial composition (#1-featured + lighter list) over repeated card grids.
- Cormorant Garamond serif display headlines paired with Montserrat uppercase labels/body.
- Two distinct, non-interchangeable darks: `ink` for text/borders, `header-bg` for full-bleed contrast bands.

## Colors

The palette is warm and paper-based: a cream background, a dark plum-black ink for text, a separate dark olive for contrast bands, and a small set of accent colors each reserved for one job.

### Primary
- **Ink** (`#2c232e`): the body text and border color sitewide (`--ink`). Also backs `::selection` paired with lilac. Used for text and hairline borders only, never as a full-bleed surface fill.
- **Header Olive** (`#2E362C`, `HEADER_BG` in `src/lib/theme.ts`): reserved specifically for full-bleed dark contrast bands, the navbar, its mega-menu dropdown, and the homepage "Ukens utfordring" band. This is a **separate dark from Ink** and the two are not interchangeable: Ink is text/border-only, Header Olive is a surface fill for the site's "dark beat."

### Secondary
- **Gold** (`#c9a14a`, `--gold`): rank numerals in "Folkets favoritter" (1, 2, 3, 04-10), the "Og mer" overflow icon in the category strip. A decorative/numeric accent, not used for body text or buttons.
- **Peach Accent** (`#E1B08C`): the single accent for interaction state across the navbar and homepage vote controls: active nav-underline, dropdown bottom border, link hover color, saved-heart fill, and the homepage's deliberate down-vote color (chosen explicitly in code comments to avoid rust/red reading as a "warning" on a simple down-vote).
- **Sage** (`#6f8f6c`, `--sage`): the up-vote/success color. Used for the rank-#1 icon badge tint, the up-vote active state (as a translucent fill), and remedy success-rate progress bars.

### Tertiary
- **Button Olive** (`#5E684F`, hardcoded in `src/components/Button.tsx`): the fixed `PrimaryButton` fill. Distinct from both Header Olive and Sage; it is its own, button-only tone.
- **Plum family** (`--plum-700` `#432065` through `--plum-950` `#160a22`) and **Lilac** (`--lilac-400` `#b07fe0`): used for kicker/label text color (`text-plum-700`), text selection, and decorative frame accents (`OrnateFrame`).

### Neutral
- **Page Background** (`#E7DFC9`, `--page-bg`): the body background, a warmed cream chosen deliberately over a paler tone so visible paper grain reads as age rather than digital noise.
- **Paper** (`#f6f0e3`, `--paper`) / **Paper Deep** (`#ede2c9`, `--paper-deep`): card and panel surfaces, search dropdown fill, hover state for list rows.
- **Ink Soft** (`#5c5063`, `--ink-soft`): secondary/muted text (subtitles, metadata, taglines).
- **Rust** (`#b25a3f`, `--rust`): reserved for genuine warnings only, form errors, the `EmergencyButton`, and the remedy-detail page's down-vote icon. Note this is inconsistent with the homepage quick-vote controls, which use Peach for the same action (see Do's and Don'ts).

### Named Rules
**The Two Darks Rule.** `ink` (#2c232e) is for text and hairline borders only. `header-bg` (#2E362C) is the only fill reserved for full-bleed dark contrast bands (navbar, dropdown, "Ukens utfordring"). Never fill a large surface with `ink`, and never set body text in `header-bg`.

**The Non-Alarming Downvote Rule.** Red/rust is reserved for real warnings (errors, the emergency button). Where the homepage expresses a simple down-vote on a remedy, it deliberately uses the warm Peach accent instead of rust, so "didn't work for me" doesn't visually read as a system error.

## Typography

**Display Font:** Cormorant Garamond (with Georgia, serif fallback)
**Body Font:** Montserrat (with Plus Jakarta Sans, sans-serif fallback)

**Character:** A classic serif for headlines against a crisp, wide-tracked uppercase sans for labels and body, an editorial magazine pairing rather than a UI/app pairing.

**A naming footgun to preserve, not repeat:** in `globals.css`, the CSS custom properties are still named `--font-googlesans` and `--font-jakarta`, legacy names from fonts this project no longer uses (Google Sans Flex and Plus Jakarta Sans were swapped for Cormorant Garamond and Montserrat in `layout.tsx`, but the variable names were kept so existing `.font-display`/`.font-sans` usages didn't need updating everywhere). Consequently `.font-display` and `.font-serif-display` both resolve to `var(--font-googlesans)`, which is now **Cormorant Garamond, the serif**, not a sans-serif, despite the class name. Do not "fix" this by assuming `.font-display` should be sans; check `layout.tsx`'s `next/font` bindings first.

### Hierarchy
- **Display** (Cormorant Garamond, weight 500, `text-6xl` to `text-8xl` on category H1s, `leading-snug` on card titles): page titles, rank-#1 remedy title, section headings. Also used italic for editorial teaser headlines ("Fra mormor til barnebarn").
- **Title** (Cormorant Garamond, `text-2xl`-`text-3xl`): article/teaser headlines, "Les artikkel" sections.
- **Body** (Montserrat, regular weight, base size, `text-ink-soft` for secondary): paragraph copy, descriptions, taglines.
- **Label** (Montserrat, `text-xs`, uppercase, `tracking-[0.14em]` to `tracking-[0.3em]`, `text-plum-700` or `text-ink`): short all-caps tags above a heading or next to a headline (e.g. "Kategori", "Fra fortiden", "Har du et kjerringråd?", nav items). This tier is pervasive in the shipped build but is recorded here only as an observed pattern, see Do's and Don'ts; it is not an invitation to add further instances.

## Layout

The page shell is grid, not flex-stacked: `SiteHeader` uses a three-column grid (`1fr auto 1fr`) to center nav links independently of the logo/right-cluster width. Main content containers cap at `--content-max: 1280px` (`src/app/globals.css`), deliberately pulled back from an earlier 1680px attempt because wide outer containers made narrower inner prose columns (max-w-xl/2xl) look like they "jumped" from wide to narrow. Horizontal page padding (`--page-pad`) scales from 20px (mobile) to 100px (2xl) via media query steps, not a single clamp.

Full-bleed bands (hero, category strip, "Ukens utfordring") intentionally ignore `--content-max` and run to `--page-pad` only, so they read as wider than the content column beneath them. Section rhythm on the homepage alternates light paper, dark Header Olive band, light paper, photo-with-gradient-overlay band, deliberately avoiding two adjacent dark bands (confirmed in code comment on the closing CTA).

Editorial image+text sections alternate side (`sm:flex-row` / `sm:flex-row-reverse`) by index so repeated teaser blocks don't all mirror the same way. Category pages use a sticky `320px` image column beside a fluid text column on `sm:` and up; mobile stacks to a single column with a smaller portrait image.

## Elevation & Depth

Mostly flat paper with grain texture carrying material weight instead of shadow. Where lift is used, it is a soft two-layer photographic shadow (near + far pass) rather than a single hard CSS default, to read as natural light fall rather than a UI panel.

### Shadow Vocabulary
- **Card lift** (`.card-shadow`: `0 3px 8px -2px rgba(44,35,46,0.16), 0 18px 36px -14px rgba(44,35,46,0.24)`): the rank-#1 card and other paper panels that should sit slightly above the page.
- **Search panel** (`0 8px 24px rgba(20,14,10,0.22)`): the header's search input.
- **Ornate frame** (`shadow-2xl shadow-plum-950/10`): the decorative `OrnateFrame` component only.

### Named Rules
**The Grain-Over-Gloss Rule.** Depth and material feel come from the shared grain overlay (`GrainOverlay`, reused verbatim on navbar/hero/dark bands) and warm paper tone, not from gradients or glossy highlights. Gradients are used exactly once, as a legibility scrim over the closing-CTA photo, never decoratively.

## Shapes

Mostly soft, rounded geometry: full pill radius on buttons, icon buttons, and vote controls (`rounded-full`); `rounded-lg`/`rounded-xl`/`rounded-2xl` on panels and dropdowns. The one exception is `OrnateFrame`, a large `2rem`-radius frame with a dashed inner border and four corner flourish icons, used sparingly as a decorative picture frame, not a general card pattern. Borders sitewide are thin and low-contrast ("hairline": `1px solid rgba(36,21,49,0.12)`), never heavy or high-contrast.

## Components

### Buttons
- **Shape:** `rounded-lg` (8px), pill-adjacent but not fully round.
- **Primary:** `#5E684F` fill, `#f5efeb` uppercase text, `tracking-[0.14em]`, grain texture overlaid on the fill itself (same `GRAIN_BG` as navbar/hero) so a flat button doesn't stand out as the one gloss-free surface on a textured page. One shared `PrimaryButton` component (`src/components/Button.tsx`); never inline a new button class per page.
- **Hover/Focus:** `hover:brightness-110`; focus ring is `box-shadow`, not `outline`, so it follows the element's own radius instead of drawing a square over rounded corners.
- **Secondary:** `SecondaryButton` with a `tone` prop: `dark` (for use over photos/dark bands, translucent dark fill + grain + border) or `light` (plain ink border + text, no fill, used on plain paper backgrounds).

### Cards / Containers
- **Corner Style:** `rounded-xl`/`rounded-2xl` for panels; the rank-#1 card is a plain `hairline` + `paper` box, not a heavier card treatment.
- **Background:** `var(--paper)` on an outer `page-bg`, giving a one-step-lighter "sheet on a table" contrast without a shadow doing all the work.
- **Shadow Strategy:** see Elevation & Depth; two-pass soft shadow (`.card-shadow`) is applied selectively, not to every bordered box.
- **Border:** `.hairline` (1px, 12% ink opacity).

### Navigation
`SiteHeader` is a non-sticky, solid Header-Olive bar with grain overlay, a three-column grid, and a hover mega-menu for one entry ("Kjerringråd") only; other nav items are plain links. Active/hover state is always the Peach accent (text color, underline, dropdown border). Mobile collapses to a hamburger-triggered `SiteMenu` sheet with an accordion-row grid-template-rows transition, not JS height measurement.

### Signature Component: Reveal
`Reveal` (`src/app/page.tsx`) is an IntersectionObserver-based fade/translate-up wrapper (`opacity 0→1`, `translateY(28px)→0`, `cubic-bezier(0.16,1,0.3,1)`, optional stagger `delay`), applied throughout the homepage and category article teasers as the default way content enters on scroll. Respects `prefers-reduced-motion` by disabling the transform entirely.

### Icons
Custom hand-drawn line icons (`src/components/icons.tsx`, 1.5px stroke, rounded caps), not a third-party glyph icon font. `CATEGORY_ICON` maps specific problem slugs (hoste, vond-hals, forkjolelse, etc.) to a matching icon; `IconSprig` is the graceful fallback for any uncategorized problem.

## Do's and Don'ts

### Do:
- **Do** keep `ink` (#2c232e) for text/borders and `header-bg` (#2E362C) for full-bleed dark bands as two separate, non-interchangeable darks.
- **Do** reuse `GrainOverlay`'s `GRAIN_BG` texture (multiply blend) on any new full-bleed dark or photographic surface, so it reads as the same paper as the rest of the site.
- **Do** route every button through `PrimaryButton`/`SecondaryButton` in `src/components/Button.tsx`; never write a new inline button className.
- **Do** prefer an asymmetric featured-item + lighter-list composition over a uniform grid of equal cards when ranking or featuring content, per the homepage's "Folkets favoritter" pattern.
- **Do** check `layout.tsx`'s actual `next/font` bindings before trusting `--font-googlesans`/`--font-jakarta` variable names; they no longer name the fonts they sound like they name.

### Don't:
- **Don't** use rust/red for an ordinary down-vote; it's reserved for genuine warnings (errors, the emergency button). The homepage already deviates from this correctly; the remedy-detail page and `RemedyPreviewModal` still use rust for the same down-vote action as a pre-existing inconsistency, not a pattern to copy forward.
- **Don't** treat `.font-display` as a sans-serif class; it resolves to Cormorant Garamond (serif).
- **Don't** add more uppercase kicker/eyebrow labels beyond what already exists. The build carries several ("Kategori", "Fra fortiden", "Har du et kjerringråd?", article kickers) as a reused but informal device; this is recorded here as observed fact, not elevated into a rule inviting new ones.
- **Don't** reintroduce the unused `--navbar-bg` (#908EA2) token; it is defined in `globals.css` but no longer referenced anywhere in the app (superseded by `HEADER_BG`).
- **Don't** turn `OrnateFrame`'s dashed decorative frame into a general card pattern; it is a one-off picture-frame treatment, not the system's default container style.
