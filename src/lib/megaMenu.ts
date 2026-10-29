import { TOP_CATEGORIES } from "@/lib/categories";

// Delt datagrunnlag for "Utforsk"-mega-menyen (navbar, desktop), mobilmenyens
// kategori-ruter og forsidens "Utforsk Rådbanken"-rutenett — avledet direkte
// fra TOP_CATEGORIES (samme liste som /alle og /kategori/[id] bruker), ikke
// en egen, uavhengig liste. Mega-menyen viste tidligere åtte generiske
// kategorier kopiert rett fra fasiten (Kjerringråd, Lifehacks, Kultur …),
// som verken fantes som egne sider eller stemte med de fem reelle
// kategoriene på /alle — forvirrende når "Hus & hjem" dukket opp som en
// egen sidestilt kategori ved siden av "Kjerringråd" i menyen. Nå er det
// bare ÉN kategoriliste, brukt alle steder.
export const MEGA_CATEGORIES = TOP_CATEGORIES.map((cat) => ({
  label: cat.name,
  href: `/kategori/${cat.id}`,
  d: cat.d,
}));

// "Snarveier" i mega-menyen — fasiten listet fem (inkl. "Plager A–Å"), men
// den siden finnes ikke i kodebasen ennå, så den er droppet i stedet for å
// peke til en side som ikke stemmer med lenketeksten. "Trending lifehacks"
// og "Toppen av visdom" peker til de to navngitte seksjonene på forsiden
// (id="nye-trender"/"toppen-av-visdom" i src/app/page.tsx) — lagt til etter
// at "Lifehacks" ble tatt ut som egen (tom) kategori, se TOP_CATEGORIES.
// Ingen "Alle råd" her — det er samme destinasjon (/alle) som "Se alle
// kategorier" nederst i Kategorier-kolonnen, og å ha begge var en duplikat
// lenke to steder i samme meny.
export const MEGA_SHORTCUTS = [
  { label: "Trending lifehacks", href: "/#nye-trender" },
  { label: "Toppen av visdom", href: "/#toppen-av-visdom" },
  { label: "Medisinplanter", href: "/medisinplanter" },
  { label: "Historie og kultur", href: "/historie" },
  { label: "Mine lagrede råd", href: "/mine-lagrede-rad" },
] as const;

// Mobilmenyens flate lenkeliste (komponent-navbar.html, .mm__links) — slår
// sammen de to øverste nav-lenkene (Nordisk råd/Om Rådbanken) og snarveiene
// over i én liste, siden mobilpanelet ikke har plass til et eget mega-nivå.
export const MOBILE_LINKS = [
  { label: "Alle råd", href: "/alle" },
  { label: "Trending lifehacks", href: "/#nye-trender" },
  { label: "Toppen av visdom", href: "/#toppen-av-visdom" },
  { label: "Medisinplanter", href: "/medisinplanter" },
  { label: "Nordisk råd", href: "/artikkel/nordisk-rad" },
  { label: "Historie og kultur", href: "/historie" },
  { label: "Om RAVN", href: "/om-oss" },
  { label: "Mine lagrede råd", href: "/mine-lagrede-rad" },
] as const;

// Samme faste, redaksjonelt valgte "Ukens utfordring"-banner som forsiden
// bruker (se src/app/page.tsx) — samme bilde/tekst, gjenbrukt her i stedet
// for å finne på noe nytt.
export const MEGA_FEATURE = {
  href: "/del-rad",
  image: "/pictures/menupictures/ukensutfordring.png",
  kicker: "Ukens utfordring",
  title: "Hva er ditt beste tips mot tørre vinterhender?",
  cta: "Send inn ditt svar",
} as const;
