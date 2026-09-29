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
    topCategoryId: "helse",
    image: "/pictures/menupictures/hals_pexels-cottonbro-5712690.jpg",
  },
  {
    id: "luftveier",
    name: "Forkjølelse",
    problemSlugs: ["forkjolelse"],
    synonyms: ["snue", "tett nese", "influensa", "feber"],
    topCategoryId: "helse",
  },
  {
    id: "hode",
    name: "Hode",
    problemSlugs: ["hodepine"],
    synonyms: ["migrene", "vondt i hodet"],
    topCategoryId: "helse",
    image: "/pictures/menupictures/hodepine.jpg",
  },
  {
    id: "sovn",
    name: "Søvn",
    problemSlugs: ["sovnproblemer"],
    synonyms: ["innsovning", "urolig natt", "insomni"],
    topCategoryId: "helse",
    image: "/pictures/menupictures/goodsleep_pexels-olly-3807626.jpg",
  },
  {
    id: "hud",
    name: "Hud & insekter",
    problemSlugs: ["myggstikk", "solbrenthet-og-eksem"],
    synonyms: ["kløe", "insektbitt", "utslett", "stikk", "solbrent", "eksem"],
    topCategoryId: "helse",
  },
  {
    id: "muskel",
    name: "Muskel & ledd",
    problemSlugs: ["forstuet-fot", "muskel-og-leddsmerter"],
    synonyms: ["vrikket ankel", "hevelse", "forstuing", "verk", "stivhet", "leddgikt"],
    topCategoryId: "helse",
  },
  {
    id: "mage",
    name: "Mage & fordøyelse",
    problemSlugs: ["kvalme", "forstoppelse", "halsbrann"],
    synonyms: ["uvelhet", "oppkast", "reisesyke", "treg mage", "sure oppstøt", "fordøyelse"],
    topCategoryId: "helse",
  },
  // --- Hud, hår & skjønnhet ---
  {
    id: "haret",
    name: "Håret",
    problemSlugs: ["haret"],
    synonyms: ["hårpleie", "hårkur", "hårvekst", "tørt hår"],
    topCategoryId: "hudharskjonnhet",
    image: "/pictures/menupictures/hair_pexels-pixabay-255339.jpg",
  },
  {
    id: "ansiktet",
    name: "Ansiktet",
    problemSlugs: ["ansiktet"],
    synonyms: ["ansiktsmaske", "hudpleie", "tørr hud", "uren hud"],
    topCategoryId: "hudharskjonnhet",
    image: "/pictures/menupictures/hud_pexels-boom-12585771.jpg",
  },
  {
    id: "oyne",
    name: "Poser under øynene",
    problemSlugs: ["poser-under-oynene"],
    synonyms: ["hovne øyne", "trøtte øyne", "øyeposer"],
    topCategoryId: "hudharskjonnhet",
  },
  {
    id: "velvaere",
    name: "Avslapning & velvære",
    problemSlugs: ["avslapning-og-velvaere"],
    synonyms: ["stress", "uro", "slappe av", "spa"],
    topCategoryId: "hudharskjonnhet",
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

export const TOP_CATEGORIES = [
  {
    id: "godegamle",
    name: "Gode gamle",
    enabled: true,
    image: "/pictures/tinktur.jpg",
    tagline: "De klassiske husrådene — godt utprøvde triks gitt videre fra generasjon til generasjon.",
  },
  {
    id: "hudharskjonnhet",
    name: "Skjønnhet",
    enabled: true,
    image: "/pictures/beauty.jpg",
    tagline: "Naturlig pleie for hår, hud og velvære.",
  },
  {
    id: "helse",
    name: "Helse",
    enabled: true,
    image: "/pictures/helse.jpg",
    tagline: "Gamle husråd mot vanlige plager, fra forkjølelse til hodepine.",
  },
  {
    id: "husoghjem",
    name: "Hus & hjem",
    enabled: true,
    image: "/pictures/husoghjem.jpg",
    tagline: "Praktiske triks for et rent og ryddig hjem.",
  },
  {
    id: "sankingbevaring",
    name: "Sanking & bevaring",
    enabled: true,
    image: "/pictures/tyttebaer2.png",
    tagline: "Å sanke fra naturen og ta vare på det du finner — bær, urter og frukt gjennom sesongen.",
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
