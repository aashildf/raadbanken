# Rådbanken

Rådbanken er et norsk oppslagsverk for tradisjonelle kjerringråd og husråd: det som funket
for mormor, samlet på ett sted og stemt fram av brukerne selv.

Brukere kan søke på en plage, lese opp gamle husråd, stemme på hva som faktisk fungerte, og
dele sine egne råd. Innholdet er ment som folkeopplysning, ikke medisinsk rådgivning, og
appen er bygget med det som førsteprioritet (se "Sikkerhet og ordlyd" under).

## Funksjoner

- **Plager og råd**: bla i kategorier (Hals, Hode, Søvn, Hud & insekter, Muskel & ledd,
  Mage & fordøyelse m.fl.), se råd rangert etter Wilson-score, og stem opp/ned
- **Del eget råd**: brukere kan legge til nye råd under en eksisterende plage, eller velge
  "Annet" på hoved-/underkategori og plage for å opprette en helt ny kategori selv
- **Medisinplanter**: egne artikler om enkeltplanter (bruk, historie, dyrking, bivirkninger)
- **Artikler**: lengre fagartikler om enkeltråd og plantemedisinens historie
- **Søk**: fritekstsøk med synonymer og fuzzy-matching på tvers av plager og råd

## Sikkerhet og ordlyd

Innholdet følger strenge regler for å holde seg på trygg juridisk grunn:

- Ingen kurerer/behandler-påstander; kun "lindrer", "tradisjonelt brukt mot", "kan bidra til"
- Disclaimer-modal ved første besøk (må godtas før appen kan brukes)
- Kontekstuell disclaimer nederst på hvert råd, inkl. automatisk honning-varsel for barn under 1 år
- "Nødknapp" med lenke til Legevakten (116 117) på plager der akutte symptomer kan forveksles
  med noe alvorlig (hodepine, muskel/ledd, kvalme, halsbrann, forstoppelse, forstuet fot)

## Teknisk stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (CSS-first konfigurasjon, ingen `tailwind.config.js`)
- [Firebase](https://firebase.google.com): Firestore (data), Anonymous Auth (stemmer er knyttet
  til en anonym bruker-id, ingen innlogging kreves)

## Komme i gang

```bash
npm install
cp .env.local.example .env.local   # fyll inn dine egne Firebase-nøkler
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

### Andre kommandoer

```bash
npm run build   # produksjonsbygg
npm run lint    # eslint
```

### Firestore-regler

Sikkerhetsreglene ligger i `firestore.rules`. Deploy med Firebase CLI:

```bash
npx firebase deploy --only firestore:rules --project <ditt-prosjekt-id>
```

### Admin-skript

`scripts/` inneholder noen frittstående skript for engangs-import/inspeksjon av data
(`seed.ts`, `inspect-problems.ts` m.fl.). Disse bruker `firebase-admin` og en lokal,
gitignored `service-account.json` (last ned fra Firebase Console → Project Settings →
Service Accounts) — denne filen må **aldri** committes.

```bash
npx tsx scripts/seed.ts
```
