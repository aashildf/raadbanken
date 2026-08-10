# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Bredt norsktalende publikum (alle aldre) som søker enkle, naturlige løsninger på vanlige hverdagsplager (forkjølelse, sår hals, hodepine, søvnproblemer, kløe/insektstikk, muskel- og leddsmerter, mage/fordøyelse m.m.) — som alternativ eller supplement til apotek. Både folk som søker råd og folk som selv vil bidra med og dele husråd de har erfaring med.

## Product Purpose

Rådbanken ("kjerringrad-web") er en nettside for å dele og finne erfaringer med gamle husråd og hjemmeremedier. Formål: gjøre spredt, muntlig overlevert husrådskunnskap (bestemor-visdom, familietradisjoner) søkbar, strukturert og kollektivt kvalitetssikret. Suksess = at brukere finner et relevant husråd raskt for sin plage, og stoler på det fordi det er forankret i andre brukeres erfaring.

## Positioning

Kombinasjon av to mekanismer konkurrenter (spredte blogginnlegg, Facebook-grupper, muntlig overlevering) mangler samtidig:
1. **Strukturert oppslagsverk** — husråd organisert etter helseplage/kategori med synonymer, søkbart og lett å navigere.
2. **Fellesskaps-verifisering** — husråd rangeres etter reelle brukerstemmer (Wilson score), slik at de mest pålitelige rådene stiger til topps fremfor bare nyeste eller mest markedsførte.

## Operating Context

- Innhold er brukergenerert: "problems" (helseplager) og "remedies" (husråd/oppskrifter) lagret i Firestore, hentet live via `onSnapshot`.
- Brukere kan søke/bla via kategori-meny, se medisinplanter ("plante-i-måneden"), stemme på husråd, og legge til egne husråd for en gitt plage.
- Nettsiden krever en disclaimer-gate og viser en nødknapp ("EmergencyButton") — husråd er erfaringsbasert deling, ikke medisinsk rådgivning, og siden skal aktivt lede folk med akutte/alvorlige symptomer videre til reelle helsetjenester.
- Alt innhold og UI er på norsk (bokmål, `lang="nb"`).

## Capabilities and Constraints

- Bygget i Next.js 16 (App Router) + React 19 + Tailwind v4, med Firebase/Firestore som datalag.
- Stemmegivning bruker Wilson score-estimat for å rangere husråd etter troverdighet, ikke bare rå stemmeantall.
- Statisk kategori-/synonym-struktur i `src/lib/categories.ts` legges over dynamiske "problems" fra Firestore — ingen ny databasestruktur kreves for å utvide taksonomien.
- Medisinplante-innhold (`src/lib/plants.ts`) er redaksjonelt/statisk, ikke brukergenerert.
- Terminologi: "husråd/hjemmeremedier" (ikke "medisin" eller "behandling"), "plage" (ikke "diagnose"), "erfaring" (ikke "bevis").

## Brand Commitments

- Navn: "Rådbanken" (produkttittel), domenenavn/kodebase heter "kjerringrad-web" — "kjerringråd" er et norsk uttrykk for gamle, folkelige husråd ("gamle koners råd"), og er en bevisst, varm/nostalgisk referanse som bør bevares i tone.
- Skal IKKE fremstå som en "wellness-app" eller alternativmedisin-produkt med kommersielle helsepåstander — husråd presenteres som delte erfaringer, ikke fakta eller anbefalinger.

## Evidence on Hand

Ingen ekte bruker-testimonials, casestudier eller pressedekning finnes ennå — dette er et hobbyprosjekt uten reelt brukergrunnlag per nå. Fremtidig arbeid må ikke dikte opp brukertall, attester eller "X tusen fornøyde brukere"-påstander.

## Product Principles

1. Erfaring, ikke autoritet — husråd presenteres alltid som delt erfaring, aldri som medisinsk fakta eller anbefaling.
2. Varme og folkelighet foran klinisk/kommersielt uttrykk — designspråket skal kjennes ut som bestemors kjøkkenbord, ikke en helse-app eller dashboard.
3. Sikkerhet før alt — disclaimer og nødvei til reell hjelp skal aldri svekkes eller gjemmes bort for estetikkens skyld.
4. Søkbarhet og struktur som differensiator — kategori/synonym-systemet er kjerneverdien; navigasjon og søk skal alltid prioriteres i design.
5. Troverdighet gjennom fellesskap — stemmegivning/Wilson-rangering skal være synlig og forståelig, ikke gjemt UI-detalj.

## Accessibility & Inclusion

Bredt aldersspenn i målgruppen (inkludert eldre brukere som er kjernemålgruppe for selve konseptet "kjerringråd") — tekststørrelse, kontrast og klikkbare flater bør ikke anta en ung, digitalt erfaren bruker.
