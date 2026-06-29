// Statisk kategori-/tagg-struktur lagt over de eksisterende "problems" i Firestore.
// Ingen ny database-struktur, bare en gruppering + synonymer for meny og søk.

export type Subcategory = {
  id: string;
  name: string;
  problemSlugs: string[];
  synonyms: string[];
};

export const HEALTH_SUBCATEGORIES: Subcategory[] = [
  {
    id: "hals",
    name: "Hals",
    problemSlugs: ["hoste", "vond-hals"],
    synonyms: ["slim", "heshet", "sår hals", "tett hals", "harke"],
  },
  {
    id: "luftveier",
    name: "Forkjølelse",
    problemSlugs: ["forkjolelse"],
    synonyms: ["snue", "tett nese", "influensa", "feber"],
  },
  {
    id: "hode",
    name: "Hode",
    problemSlugs: ["hodepine"],
    synonyms: ["migrene", "vondt i hodet"],
  },
  {
    id: "sovn",
    name: "Søvn",
    problemSlugs: ["sovnproblemer"],
    synonyms: ["innsovning", "urolig natt", "insomni"],
  },
  {
    id: "hud",
    name: "Hud & insekter",
    problemSlugs: ["myggstikk", "solbrenthet-og-eksem"],
    synonyms: ["kløe", "insektbitt", "utslett", "stikk", "solbrent", "eksem"],
  },
  {
    id: "muskel",
    name: "Muskel & ledd",
    problemSlugs: ["forstuet-fot", "muskel-og-leddsmerter"],
    synonyms: ["vrikket ankel", "hevelse", "forstuing", "verk", "stivhet", "leddgikt"],
  },
  {
    id: "mage",
    name: "Mage & fordøyelse",
    problemSlugs: ["kvalme", "forstoppelse", "halsbrann"],
    synonyms: ["uvelhet", "oppkast", "reisesyke", "treg mage", "sure oppstøt", "fordøyelse"],
  },
];

export const TOP_CATEGORIES = [
  { id: "helse", name: "Helse", enabled: true },
  { id: "husholdning", name: "Husholdning", enabled: false },
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
