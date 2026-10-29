// Statisk kategori-/tagg-struktur lagt over de eksisterende "problems" i Firestore.
// Ingen ny database-struktur, bare en gruppering + synonymer for meny og søk.

export type Subcategory = {
  id: string;
  name: string;
  problemSlugs: string[];
  synonyms: string[];
  topCategoryId: string;
  // Valgfritt bilde til undergruppe-kort (f.eks. i mega-menyen). Faller tilbake
  // til hovedkategoriens bilde når det ikke er satt.
  image?: string;
};

export const HEALTH_SUBCATEGORIES: Subcategory[] = [
  {
    id: "hals",
    name: "Hals",
    problemSlugs: ["hoste", "vond-hals"],
    synonyms: ["slim", "heshet", "sår hals", "tett hals", "harke"],
    topCategoryId: "helseogvelvare",
    image: "/pictures/menupictures/hals_pexels-cottonbro-5712690.jpg",
  },
  {
    id: "luftveier",
    name: "Forkjølelse",
    problemSlugs: ["forkjolelse"],
    synonyms: ["snue", "tett nese", "influensa", "feber"],
    topCategoryId: "helseogvelvare",
  },
  {
    id: "hode",
    name: "Hode",
    problemSlugs: ["hodepine"],
    synonyms: ["migrene", "vondt i hodet"],
    topCategoryId: "helseogvelvare",
    image: "/pictures/menupictures/hodepine.jpg",
  },
  {
    id: "sovn",
    name: "Søvn",
    problemSlugs: ["sovnproblemer"],
    synonyms: ["innsovning", "urolig natt", "insomni"],
    topCategoryId: "helseogvelvare",
    image: "/pictures/menupictures/goodsleep_pexels-olly-3807626.jpg",
  },
  {
    id: "hud",
    name: "Hud & insekter",
    problemSlugs: ["myggstikk", "solbrenthet-og-eksem"],
    synonyms: ["kløe", "insektbitt", "utslett", "stikk", "solbrent", "eksem"],
    topCategoryId: "helseogvelvare",
  },
  {
    id: "muskel",
    name: "Muskel & ledd",
    problemSlugs: ["forstuet-fot", "muskel-og-leddsmerter"],
    synonyms: ["vrikket ankel", "hevelse", "forstuing", "verk", "stivhet", "leddgikt"],
    topCategoryId: "helseogvelvare",
  },
  {
    id: "mage",
    name: "Mage & fordøyelse",
    problemSlugs: ["kvalme", "forstoppelse", "halsbrann"],
    synonyms: ["uvelhet", "oppkast", "reisesyke", "treg mage", "sure oppstøt", "fordøyelse"],
    topCategoryId: "helseogvelvare",
  },
  // --- Hud, hår & skjønnhet (del av "Helse & velvære") ---
  {
    id: "haret",
    name: "Håret",
    problemSlugs: ["haret"],
    synonyms: ["hårpleie", "hårkur", "hårvekst", "tørt hår"],
    topCategoryId: "helseogvelvare",
    image: "/pictures/menupictures/hair_pexels-pixabay-255339.jpg",
  },
  {
    id: "ansiktet",
    name: "Ansiktet",
    problemSlugs: ["ansiktet"],
    synonyms: ["ansiktsmaske", "hudpleie", "tørr hud", "uren hud"],
    topCategoryId: "helseogvelvare",
    image: "/pictures/menupictures/hud_pexels-boom-12585771.jpg",
  },
  {
    id: "oyne",
    name: "Poser under øynene",
    problemSlugs: ["poser-under-oynene"],
    synonyms: ["hovne øyne", "trøtte øyne", "øyeposer"],
    topCategoryId: "helseogvelvare",
  },
  {
    id: "velvaere",
    name: "Avslapning & velvære",
    problemSlugs: ["avslapning-og-velvaere"],
    synonyms: ["stress", "uro", "slappe av", "spa"],
    topCategoryId: "helseogvelvare",
    image: "/pictures/menupictures/stress_pexels-taryn-elliott-8096934.jpg",
  },
  // --- Hus & hjem ---
  {
    id: "avlop",
    name: "Tett sluk",
    problemSlugs: ["tett-sluk"],
    synonyms: ["tett avløp", "tett vask"],
    topCategoryId: "husoghjem",
  },
  {
    id: "oppvaskmaskin",
    name: "Oppvaskmaskin",
    problemSlugs: ["lukt-i-oppvaskmaskinen"],
    synonyms: ["vond lukt oppvaskmaskin"],
    topCategoryId: "husoghjem",
  },
  {
    id: "kjokken",
    name: "Kjøkkenskap",
    problemSlugs: ["fett-pa-kjokkenskap"],
    synonyms: ["fett på skap", "skittent kjøkken"],
    topCategoryId: "husoghjem",
  },
  {
    id: "klesvask",
    name: "Klesvask",
    problemSlugs: ["klesvask"],
    synonyms: ["skyllemiddel", "vaskemaskin", "stive håndklær"],
    topCategoryId: "husoghjem",
    image: "/pictures/menupictures/vaskemaskin_pexels-towfiqu-barbhuiya-3440682-11316620.jpg",
  },
  {
    id: "vinduer",
    name: "Vindusvask",
    problemSlugs: ["vindusvask"],
    synonyms: ["skjoldete vinduer", "vaske vinduer"],
    topCategoryId: "husoghjem",
    image: "/pictures/menupictures/speil_pexels-gustavo-fring-3867615.jpg",
  },
  {
    id: "hjemmelukt",
    name: "Vond lukt i hjemmet",
    problemSlugs: ["vond-lukt-i-hjemmet"],
    synonyms: ["vond lukt", "lukt i sko", "lukt i kjøleskap", "lukt i søppelbøtte"],
    topCategoryId: "husoghjem",
  },
  {
    id: "rust",
    name: "Rustflekker",
    problemSlugs: ["rustflekker"],
    synonyms: ["rust", "rustflekk"],
    topCategoryId: "husoghjem",
  },
  {
    id: "treverk",
    name: "Riper i treverk",
    problemSlugs: ["riper-i-treverk"],
    synonyms: ["riper", "riper i møbler"],
    topCategoryId: "husoghjem",
    image: "/pictures/menupictures/gulv_pexels-karola-g-5706430.jpg",
  },
  {
    id: "mikro",
    name: "Rengjøring av mikrobølgeovn",
    problemSlugs: ["rengjoring-av-mikrobolgeovn"],
    synonyms: ["skitten mikro", "rengjøre mikrobølgeovn"],
    topCategoryId: "husoghjem",
  },
];

// `d` = ikonsti til bruk i navbarens Utforsk-mega-meny, mobilmenyen og
// forsidens "Utforsk Rådbanken"-rutenett (se src/lib/megaMenu.ts) —
// gjenbrukt fra fasitens generiske plasshoder-ikoner
// (design/design_handoff_radbanken_forside/fasit/komponent-navbar.html).
// Disse TOP_CATEGORIES er den ENE reelle kategori-taksonomien på siten;
// mega-menyen avleder nå alt herfra i stedet for å vise sin egen liste.
//
// Ryddet 2026-10-10 (Åshild): gikk fra fem kategorier (inkl. "Gode gamle" og
// "Skjønnhet" som egne) til tre, siden "Gode gamle" var for uspesifikt og
// reelt sett dekket alt på siten, og "Skjønnhet" hører naturlig sammen med
// kroppslige plager. "Lifehacks"/"Kjerringråd"/"Kultur"/"Planter & urter"
// ble vurdert og bevisst utelatt som kategorier: de er enten synonyme med
// hele siten/arkivet, eller allerede egne sider (Historie og kultur,
// Medisinplanter) — "Lifehacks" lever videre som rammingen på forsidens
// "Nye trender"-seksjon i stedet for en tom sidestilt kategori.
export const TOP_CATEGORIES = [
  {
    id: "helseogvelvare",
    name: "Helse & velvære",
    enabled: true,
    image: "/pictures/helse.jpg",
    tagline: "Gamle husråd for kropp, hud og sinn, fra forkjølelse og hodepine til hår og velvære.",
    d: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  },
  {
    id: "husoghjem",
    name: "Hus & hjem",
    enabled: true,
    image: "/pictures/husoghjem.jpg",
    tagline: "Praktiske triks for et rent og ryddig hjem.",
    d: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z",
  },
  {
    id: "matkonservering",
    name: "Mat & konservering",
    enabled: true,
    image: "/pictures/tyttebaer2.png",
    tagline: "Å sanke fra naturen og ta vare på det du finner: bær, urter og frukt gjennom sesongen.",
    d: "M8 2h8v3H8ZM7 5h10l1 3v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8Z M6 12h12",
  },
];

// Plager der smerter/symptomer kan være tegn på noe mer alvorlig, viser en liten
// "nødknapp" med påminnelse om Legevakten på disse plage-sidene.
export const ACUTE_RISK_SLUGS = [
  "hodepine",
  "muskel-og-leddsmerter",
  "forstuet-fot",
  "kvalme",
  "halsbrann",
  "forstoppelse",
];

export function synonymsForSlug(slug: string): string[] {
  return HEALTH_SUBCATEGORIES.find((s) => s.problemSlugs.includes(slug))?.synonyms ?? [];
}

export function subcategoryForSlug(slug: string): Subcategory | undefined {
  return HEALTH_SUBCATEGORIES.find((s) => s.problemSlugs.includes(slug));
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
