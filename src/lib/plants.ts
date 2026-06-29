export type PlantShape = "sprig" | "flower" | "root" | "succulent";

export type PlantSection = { heading: string; body?: string; list?: string[] };

export type Plant = {
  id: string;
  name: string;
  latinName: string;
  description: string;
  shape: PlantShape;
  bg: string; // CSS-fargeverdi (var(--token)) til illustrasjons-flaten
  image?: { src: string; fit?: "cover" | "contain"; credit?: string; creditHref?: string };
  sections?: PlantSection[];
};

export const MEDICINAL_PLANTS: Plant[] = [
  {
    id: "ingefaer",
    name: "Ingefær",
    latinName: "Zingiber officinale",
    description:
      "Rotplante med en varm, skarp smak. Brukes tradisjonelt i te mot kvalme, forkjølelse og urolig mage.",
    shape: "root",
    bg: "var(--rust)",
    image: { src: "/pictures/ingefaer2.jpg", fit: "cover" },
    sections: [
      {
        heading: "Om planten",
        body: "Ingefær er en flerårig tropisk urt der den underjordiske stengelen (jordstengelen) brukes over hele verden som krydder, smaksforsterker og naturmedisin. Den har en karakteristisk skarp, brennende og frisk smak som skyldes de aktive virkestoffene gingeroler og shogaoler.",
      },
      {
        heading: "Helse og folkemedisin",
        body: "Ingefær har vært brukt i tradisjonell kinesisk og indisk medisin (Ayurveda) i tusenvis av år, og er en av urtene som er mest studert i moderne forskning. Slik beskrives den vanligvis i folkemedisinen:",
        list: [
          "Mot kvalme: Ingefær er en av de mest brukte plantene mot kvalme, og brukes tradisjonelt mot svangerskapskvalme og reisesyke. Ved kvalme etter operasjon eller cellegiftbehandling bør bruk alltid avklares med behandlende lege.",
          "Fordøyelse: Ingefær antas å stimulere produksjonen av spytt og magesaft, noe som kan bidra til fordøyelsen og dempe oppblåsthet og luft i magen.",
          "Betennelsesdempende: Ingefær antas å ha betennelsesdempende egenskaper, og brukes tradisjonelt for å lindre leddsmerter ved slitasjegikt (artrose).",
          "Immunforsvar: Rik på antioksidanter, og brukes tradisjonelt for å lindre symptomer ved forkjølelse, sår hals og feber.",
        ],
      },
      {
        heading: "Bivirkninger og advarsler",
        body: "Selv om ingefær er sunt, bør visse grupper utvise forsiktighet med høye doser, for eksempel konsentrerte kosttilskudd og store mengder ingefærshots.",
        list: [
          "Blodfortynnende effekt: Ingefær kan virke lett blodfortynnende. Personer som går på blodfortynnende medisiner (som Marevan), bør rådføre seg med lege før de tar store mengder.",
          "Galleproblemer: Ingefær kan stimulere utskillelsen av galle. Har du gallestein, bør du unngå høyt inntak.",
          "Graviditet: Gravide kan trygt spise mat med ingefær og drikke vanlig ingefær-te mot kvalme, men Statens legemiddelverk fraråder høykonsentrerte ingefærtilskudd og store mengder ingefærshots på grunn av manglende sikkerhetsdata.",
        ],
      },
      {
        heading: "Oppbevaring og holdbarhet",
        list: [
          "I kjøleskap: Uskrellet ingefær holder seg frisk i opptil 2–3 uker hvis den pakkes inn i tørkepapir og legges i en plastpose i grønnsaksskuffen.",
          "I fryseren: Du kan fryse ned hele ingefærknoller. Når du trenger ingefær, river du den frossen rett inn i maten med et rivjern (skallet behøver ikke tas av først).",
        ],
      },
    ],
  },
  {
    id: "kamille",
    name: "Kamille",
    latinName: "Matricaria chamomilla",
    description:
      "Liten daisy-aktig blomst. De tørkede blomstene trekkes som te og brukes tradisjonelt for å roe ned før søvn.",
    shape: "flower",
    bg: "var(--plum-600)",
    image: { src: "/pictures/kamillelbomst.png", fit: "cover" },
  },
  {
    id: "lavendel",
    name: "Lavendel",
    latinName: "Lavandula angustifolia",
    description:
      "Duftende blomsterspiker i lilla. Oljen brukes tradisjonelt for å roe sinnet og lindre lett hodepine.",
    shape: "flower",
    bg: "var(--plum-700)",
    image: {
      src: "/pictures/lavendel.jpg",
      credit: "Janine Joles / Unsplash",
      creditHref: "https://unsplash.com/@joyful_janine",
    },
  },
  {
    id: "hvitloek",
    name: "Hvitløk",
    latinName: "Allium sativum",
    description:
      "Skarp løkplante med lange røtter i folkemedisinen, ofte brukt mot forkjølelse og luftveisplager.",
    shape: "root",
    bg: "var(--plum-800)",
    image: { src: "/pictures/garlic.png", fit: "cover" },
  },
  {
    id: "tymian",
    name: "Tymian",
    latinName: "Thymus vulgaris",
    description:
      "Aromatisk krydderurt. Trekkes som te og er et gammelt husråd mot hoste og slim.",
    shape: "sprig",
    bg: "var(--sage)",
    image: { src: "/pictures/timian.png", fit: "cover" },
  },
  {
    id: "fennikel",
    name: "Fennikel",
    latinName: "Foeniculum vulgare",
    description:
      "Søtaktig urt med frø som tradisjonelt brukes for å løse opp slim og lindre mageknute.",
    shape: "flower",
    bg: "var(--plum-600)",
    image: { src: "/pictures/fenikkel.png", fit: "cover" },
  },
  {
    id: "salvie",
    name: "Salvie",
    latinName: "Salvia officinalis",
    description:
      "Kraftig, lett bitter urt. Tygges eller trekkes som te, tradisjonelt brukt mot sår hals og halsbetennelse.",
    shape: "sprig",
    bg: "var(--sage)",
    image: { src: "/pictures/salvie.png", fit: "cover" },
    sections: [
      {
        heading: "Om planten",
        body: "Salvie er en aromatisk, flerårig halvbusk i leppeblomstfamilien som brukes både som kjøkkenkrydder, prydplante og tradisjonell medisinplante. Navnet kommer fra det latinske ordet salvare, som betyr «å helbrede».",
      },
      {
        heading: "Helse og folkemedisin",
        body: "I tradisjonell naturmedisin har salvie en lang historie som et alle-i-ett-middel. Slik beskrives den vanligvis i folkemedisinen:",
        list: [
          "Hals og munn: Salvie antas å ha antiseptiske og sammentrekkende egenskaper. Avkjølt salvie-te brukes tradisjonelt som gurglevann ved sår hals, mandelbetennelse og blødende tannkjøtt.",
          "Overgangsalder: Urten er mest kjent for sin antatte svettedempende effekt, og brukes tradisjonelt i kosttilskudd for å dempe hetetokter og nattesvette.",
          "Fordøyelse: Te av tørkede salvieblader kan bidra til å lindre lettere fordøyelsesbesvær, oppblåsthet og diaré.",
        ],
      },
      {
        heading: "Bivirkninger og advarsler",
        body: "Salvie inneholder stoffet tujon, som kan være skadelig i store mengder.",
        list: [
          "Begrens inntaket: Salvie-te bør ikke drikkes sammenhengende i mer enn 1–2 uker.",
          "Eterisk olje: Ren eterisk olje av salvie er svært konsentrert. Den må aldri svelges, da den kan utløse kramper og hjerteproblemer.",
          "Graviditet og amming: Gravide og ammende bør unngå salvie i medisinske doser, inkludert te, da urten kan stimulere livmoren og redusere melkeproduksjonen.",
        ],
      },
    ],
  },
  {
    id: "aloe-vera",
    name: "Aloe vera",
    latinName: "Aloe vera",
    description:
      "Saftig, kaktusaktig plante. Gelen fra bladene brukes utvendig for å kjøle og lindre irritert hud.",
    shape: "succulent",
    bg: "var(--plum-700)",
    image: { src: "/pictures/aloevera.jpg", fit: "cover" },
  },
  {
    id: "rosenrot",
    name: "Rosenrot",
    latinName: "Rhodiola rosea",
    description:
      "Flerårig fjellplante hvis rotstokk lukter av roser når den deles. Kalt «Nordens ginseng» i folkemedisinen, og brukt i norsk tradisjon på torvtak som vern mot lynnedslag og brann.",
    shape: "succulent",
    bg: "var(--plum-800)",
    image: { src: "/pictures/rosenrot.png", fit: "cover" },
    sections: [
      {
        heading: "Egenskaper og påstått virkning",
        body: "I folkemedisinen og som moderne kosttilskudd kalles rosenrot ofte for «Nordens ginseng». Planten klassifiseres som et adaptogen, det betyr at den påstås å hjelpe kroppen med å tilpasse seg og takle ulike former for fysisk og psykisk stress. De mest kjente påstandene knyttet til rosenrot er at den kan bidra til:",
        list: [
          "Mer energi: reduserer tretthet og øker fysisk utholdenhet.",
          "Stressmestring: hjelper kroppen og binyrene med å takle hektiske perioder.",
          "Mental klarhet: støtter konsentrasjon, hukommelse og fokus.",
          "Bedret humør: har tradisjonelt vært brukt mot milde depressive følelser.",
        ],
      },
      {
        heading: "Hva sier forskningen?",
        body: "Selv om rosenrot er svært populært i naturmedisinen, påpeker medisinske fagmiljøer som NHI.no og RELIS at den faktiske vitenskapelige og medisinske dokumentasjonen for mange av disse effektene er mangelfull. Mange av studiene som er gjort er små, og det trengs mer omfattende forskning for å fastslå den eksakte effekten.",
      },
      {
        heading: "Bruk og dosering",
        body: "Røttene og jordstenglene er for harde og beske til å spises direkte. Derfor inntas planten vanligvis som kosttilskudd (kapsler eller tabletter med tørket ekstrakt, ofte 200–400 mg per dag) eller som tinktur, et flytende, konsentrert alkoholuttrekk av roten som dryppes i et glass vann. Går du på faste medisiner, bør du rådføre deg med lege først, da urter kan påvirke effekten av enkelte legemidler.",
      },
      {
        heading: "Historisk bruk i Norge",
        body: "Rosenrot har en lang historie i norsk folketradisjon, langt utover moderne helsekosttrender.",
        list: [
          "Magisk takplante: Det var en utbredt tradisjon å plante rosenrot på torvtak i Sør- og Midt-Norge, en skikk som stammer fra Karl den stores tid og skulle beskytte mot at gnister fra ildsteder antente taket. I folketroen ble planten også sett som et vern mot lynnedslag, brann og trolldom.",
          "Håkon Håkonssons saga (1218): Inga fra Varteig skulle bære jernbyrd i Bergen for å bevise sønnens kongelige avstamning, hun ble rådet til å smøre hendene med saften fra en plante som vokste på hustakene, etter alt å dømme rosenrot.",
          "Skjørbuk og nødmat: Siden rosenrot er rik på C-vitaminer og en av de tidligste vårplantene, ble den brukt mot skjørbuk, og i Nord-Norge også som nødfôr i den magre vårknipa.",
          "Skjønnhetspleie: Kalt «hårvokster» flere steder, kokt og brukt til hode- og hårvask for blankt hår.",
          "Ullfarging: Kokt sammen med alun ga ullen en grønn farge.",
        ],
      },
      {
        heading: "Sanking i naturen",
        body: "Rosenrot vokser vilt over nesten hele landet, særlig i fjellstrøk, bergsprekker og langs kysten i nord. Den bør sankes om høsten (september–oktober), når konsentrasjonen av aktive virkestoffer i rotstokken er på sitt høyeste. Se etter de karakteristiske tykke, blågrønne bladene, roten skal lukte tydelig av roser når du skjærer i den. Siden det er selve rotstokken som høstes, dør planten når den tas opp, så la det alltid stå nok planter igjen til at bestanden kan formere seg videre.",
      },
      {
        heading: "Dyrking i hagen",
        body: "Rosenrot er en arktisk, hardfør plante som er godt tilpasset det norske klimaet. Den kan formeres fra frø (som krever en kuldeperiode før spiring) eller ved å dele en eksisterende rotstokk. Den trives best i full sol og tåler de fleste jordtyper, men vokser særlig godt i myrjord. Dette er et langtidsprosjekt, planten vokser sakte i vårt kalde klima, og rotstokken må vanligvis stå i jorda i 4–5 år før den er stor nok til å høstes.",
      },
    ],
  },
];

export function plantOfTheMonth(): Plant {
  const now = new Date();
  const idx = (now.getFullYear() * 12 + now.getMonth()) % MEDICINAL_PLANTS.length;
  return MEDICINAL_PLANTS[idx];
}
