// Statisk kategori-/tagg-struktur lagt over de eksisterende "problems" i Firestore.
// Ingen ny database-struktur, bare en gruppering + synonymer for meny og søk.

export type Subcategory = {
  id: string;
  name: string;
  problemSlugs: string[];
  synonyms: string[];
  topCategoryId: string;
};

export const HEALTH_SUBCATEGORIES: Subcategory[] = [
  {
    id: "hals",
    name: "Hals",
    problemSlugs: ["hoste", "vond-hals"],
    synonyms: ["slim", "heshet", "sår hals", "tett hals", "harke"],
    topCategoryId: "helse",
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
  },
  {
    id: "sovn",
    name: "Søvn",
    problemSlugs: ["sovnproblemer"],
    synonyms: ["innsovning", "urolig natt", "insomni"],
    topCategoryId: "helse",
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
  },
  {
    id: "ansiktet",
    name: "Ansiktet",
    problemSlugs: ["ansiktet"],
    synonyms: ["ansiktsmaske", "hudpleie", "tørr hud", "uren hud"],
    topCategoryId: "hudharskjonnhet",
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
  },
  {
    id: "vinduer",
    name: "Vindusvask",
    problemSlugs: ["vindusvask"],
    synonyms: ["skjoldete vinduer", "vaske vinduer"],
    topCategoryId: "husoghjem",
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
  { id: "helse", name: "Helse", enabled: true, image: "/pictures/helse.png" },
  { id: "hudharskjonnhet", name: "Hud, hår & skjønnhet", enabled: true, image: "/pictures/beauty.png" },
  { id: "husoghjem", name: "Hus & hjem", enabled: true, image: "/pictures/husoghjem.png" },
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
