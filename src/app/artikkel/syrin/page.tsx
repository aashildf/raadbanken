import Link from "next/link";
import Image from "next/image";
import { RemedyDisclaimer } from "@/components/RemedyDisclaimer";

export const metadata = {
  title: "Syrin, mer enn en vakker vårduft | Rådbanken",
  description: "Syrinblomster er spiselige og fulle av virkestoffer, tradisjonelt brukt mot uro, urolig mage og irritert hud.",
};

const SYRIN_IDEAS: { title: string; text: string; image: string; credit: string; creditHref: string }[] = [
  {
    title: "Syrinvann",
    text: "Legg rensede blomster i en mugge med kaldt vann i kjøleskapet over natten, for en forfriskende smak.",
    image: "/pictures/syrinvann_pexels-alexandra-54876058-7829435.jpg",
    credit: "Alexandra / Pexels",
    creditHref: "https://www.pexels.com/photo/a-person-holding-a-glass-with-water-and-purple-flowers-7829435/",
  },
  {
    title: "Syrinte",
    text: "Hell kokende vann over friske eller tørkede blomster, og la det trekke i 5–10 minutter.",
    image: "/pictures/syrinte_pexels-marta-dzedyshko-1042863-6341627.jpg",
    credit: "Marta Dzedyshko / Pexels",
    creditHref: "https://pexels.com/photo/flowers-placed-near-tea-with-petals-6341627/",
  },
  {
    title: "Ansiktsvann",
    text: "Lag et sterkt uttrekk av blomstene i kokt vann, avkjøl, og bruk som en naturlig toner for huden.",
    image: "/pictures/ansiktsvann_syrin_pexels-shvets-production-9775117.jpg",
    credit: "SHVETS production / Pexels",
    creditHref: "https://www.pexels.com/photo/applying-gel-on-cotton-pad-9775117/",
  },
];

// Oppskrifter har plass til bilde per oppskrift — legg til `image`/`credit`/`creditHref`
// på det enkelte objektet når bildene er klare, så vises de automatisk (som på de andre).
// Flertrinnsoppskrifter (som makronene, med separat fyll/skall/montering) bruker `parts`
// i stedet for `ingredients`/`steps` direkte på oppskriften.
type RecipePart = { heading: string; note?: string; ingredients?: string[]; steps: string[] };

type SyrinRecipe = {
  title: string;
  intro: string;
  ingredients?: string[];
  steps?: string[];
  parts?: RecipePart[];
  tip?: string;
  image?: string;
  credit?: string;
  creditHref?: string;
};

function IngredientsList({ items }: { items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-plum-700">Ingredienser</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function StepsList({ steps }: { steps: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-plum-700">Steg for steg</p>
      <ol className="mt-2 flex flex-col gap-2">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-ink">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const SYRIN_FULL_RECIPES: SyrinRecipe[] = [
  {
    title: "Syrinsirup",
    intro: "Perfekt til kalde drinker, over pannekaker, vafler eller vaniljeis.",
    ingredients: [
      "3–4 dl rensede syrinblomster (kun lilla/hvite kronblader)",
      "3 dl vann",
      "3 dl sukker",
      "Saften av 1/2 sitron (bevarer den fine fargen og balanserer smaken)",
    ],
    steps: [
      "Rens blomstene nøye for stilker, blader og eventuelle småkryp.",
      "Kok opp vann, sukker og sitronsaft i en kjele til alt sukkeret er helt oppløst.",
      "Ta kjelen av varmen og rør inn de rensede syrinblomstene.",
      "Avkjøl blandingen, sett på lokk og la den stå i kjøleskapet i 1–2 døgn for å trekke ut maksimalt med smak og farge.",
      "Sil sirupen gjennom en fin sil eller et kjøkkenklede.",
      "Hell på en ren, steril flaske og oppbevar mørkt og kjølig.",
    ],
  },
  {
    title: "Syrinsukker",
    intro: "Enkelt å lage, og en nydelig smaksforsterker i te, eller til å strø over vafler og bær.",
    ingredients: ["2–3 dl vanlig finkornet sukker", "1 dl rensede syrinblomster"],
    steps: [
      "Tørk blomstene godt på et stykke kjøkkenpapir hvis de er fuktige etter plukking.",
      "Legg lagvis sukker og syrinblomster i et rent glass med tett lokk.",
      "Rist glasset godt en gang om dagen i 4–5 dager, slik at fuktigheten fordeler seg og sukkeret tar til seg aromaen.",
      "Sikt ut blomstene hvis du vil ha et helt rent sukker, eller la dem være i for syns skyld.",
    ],
    tip: "Hvis sukkeret blir litt klumpete av fuktigheten fra blomstene, kan du spre det utover et bakepapir til tørking en times tid, og deretter kjøre det raskt i en blender.",
    image: "/pictures/syrinsukker_pexels-micheile-12142784.jpg",
    credit: "Micheile Henderson / Pexels",
    creditHref: "https://pexels.com/photo/close-up-photo-of-sugar-in-a-glass-jar-with-lilac-flowers-12142784/",
  },
  {
    title: "Syrinis (uten ismaskin)",
    intro: "En fløyelsmyk og luksuriøs fløteis med et subtilt floralt preg.",
    ingredients: [
      "3 dl kremfløte",
      "1 boks (ca. 400 g) søt, kondensert melk (ikke vikingmelk)",
      "2 dl rensede syrinblomster",
    ],
    steps: [
      "Varm opp kremfløten forsiktig i en kjele til den når kokepunktet, og ta den umiddelbart av platen.",
      "Tilsett syrinblomstene i den varme fløten, sett på lokk, og la det trekke i minst 1 time (gjerne i kjøleskapet over natten for kraftigere smak).",
      "Sil fløten godt slik at alle blomstene fjernes, og press ut restene av væsken fra blomstene med en skje.",
      "Avkjøl fløten helt i kjøleskapet (den må være helt kald for å kunne piskes).",
      "Pisk den syrininfuserte fløten til en luftig krem.",
      "Vend inn den kondenserte melken forsiktig med en slikkepott til du har en jevn røre.",
      "Hell blandingen i en form, dekk til, og sett i fryseren i minst 6 timer til isen har satt seg.",
    ],
    image: "/pictures/syrinis_pexels-sunsetoned-5914228.jpg",
    credit: "Mariam Antadze / Pexels",
    creditHref: "https://pexels.com/photo/composition-of-fresh-flowers-with-plate-of-frozen-petals-5914228/",
  },
  {
    title: "Syrin-makroner",
    intro:
      "Å bruke syrin i makroner gir et elegant, fransk preg og en nydelig vårlig smak. Siden skallene er ømfintlige for fuktighet, får vi den beste syrinsmaken ved å smaksette fyllet, en hvit sjokoladeganache infisert med syrin, og eventuelt bruke syrinsukker i skallene. Gir ca. 30–40 ferdige, sammensatte makroner.",
    image: "/pictures/syrinmakroner_pexels-mila-walmus-2161305187-37394652.jpg",
    credit: "Mila Walmus / Pexels",
    creditHref: "https://www.pexels.com/photo/elegant-tea-setting-with-lilacs-and-macarons-37394652/",
    parts: [
      {
        heading: "Del 1: Syrinfyll (hvit sjokoladeganache)",
        note: "Dette fyllet må lages først, gjerne dagen før, da det må stivne helt i kjøleskapet før det kan sprøytes inn i makronene.",
        ingredients: [
          "1 dl kremfløte",
          "1,5 dl rensede syrinblomster (kun kronblader)",
          "150 g hvit sjokolade av god kvalitet (finhakket)",
          "1 ts sitronsaft (for å friske opp smaken)",
        ],
        steps: [
          "Infuser fløten: Varm opp kremfløten i en liten kjele til den akkurat når kokepunktet. Ta den av platen, rør inn syrinblomstene, og sett på lokk. La det trekke i 1 time.",
          "Sil: Sil fløten over i en ren kjele, og press godt på blomstene med en skje for å få ut all smaken. Etterfyll eventuelt med en skvett ekstra fløte så du har i underkant av 1 dl igjen.",
          "Smelt sjokoladen: Varm opp den silte syrinfløten på nytt til den er god og varm (ikke kok). Legg den finhakkede hvite sjokoladen i en bolle, og hell den varme fløten og sitronsaften over.",
          "Rør glatt: La det stå i 1 minutt, og rør deretter kraftig fra midten til du har en helt blank, glatt og homogen krem.",
          "Avkjøl: Dekk ganachen med plastfolie (trykk folien helt ned på overflaten så det ikke dannes snerk). Sett i kjøleskapet i minst 4 timer eller over natten, til den har fast sprøytekonsistens.",
        ],
      },
      {
        heading: "Del 2: Makronskall (fransk metode)",
        ingredients: [
          "150 g mandelmel (gjerne siktet, ikke fettredusert)",
          "150 g melis",
          "110 g eggehviter (romtempererte, delt opp i to boller à 55 g)",
          "150 g vanlig sukker (eller syrinsukker fra forrige oppskrift!)",
          "Valgfritt: en knivsodd lilla pastafarge (gelé-/pastafarge, ikke flytende konditorfarge)",
        ],
        steps: [
          "Sikt det tørre: Bland mandelmel og melis godt sammen. Sikt blandingen to ganger gjennom en fin sil for å fjerne store mandelbiter. Kast bitene som blir igjen i silen.",
          "Pisk marengs: Pisk de romtempererte eggehvitene i en ren, tørr bolle til de skummer. Tilsett sukkeret (eller syrinsukkeret) gradvis, én spiseskje av gangen, mens du pisker på medium til høy hastighet. Pisk til du har en blank, stiv marengs som danner faste topper.",
          "Farge (valgfritt): Vend forsiktig inn litt lilla pastafarge i marengsen helt mot slutten av piskingen.",
          "Macaronage (blandingen): Hell det siktede mandelmelet og melisen over i marengsen. Bruk en slikkepott til å vende det tørre inn i det våte, mens du presser luften forsiktig ut av røren.",
          "Sjekk konsistensen: Røren er ferdig når den flyter i et sammenhengende, tykt bånd fra slikkepotten uten å dele seg, du skal kunne tegne et «8-tall» med røren uten at båndet bryter. Stopper du for tidlig, blir makronene toppet; rører du for mye, blir de flate og renner utover.",
          "Sprøyt ut: Ha røren i en sprøytepose med en rund, glatt tyll (ca. 8–10 mm). Sprøyt ut små, jevne sirkler på et bakepapir eller en makronmatte av silikon.",
          "Slå ut luftboblene: Bank stekebrettet hardt mot kjøkkenbenken 3–4 ganger for å fjerne eventuelle luftbobler i røren.",
          "Tørking (viktig!): La makronene stå på kjøkkenbenken i 30–60 minutter, til det dannes en «hinne» på overflaten. Tar du forsiktig på dem med fingeren, skal røren ikke være klissete. Dette gjør at de hever oppover og danner de karakteristiske «føttene» under steking.",
          "Steking: Stek midt i ovnen på 150 °C (over- og undervarme) i ca. 13–15 minutter. De er ferdige når du tar på toppen og de ikke lenger «rir» eller flytter på seg på foten.",
          "Avkjøl: La skallene kjøle seg fullstendig ned på brettet før du forsiktig løsner dem fra papiret/matten.",
        ],
      },
      {
        heading: "Del 3: Montering",
        steps: [
          "Match opp makronskallene to og to etter størrelse.",
          "Ta den stive syringanachen ut av kjøleskapet og pisk den raskt opp i 10–20 sekunder med en håndmikser så den blir litt luftigere (ikke pisk for lenge, da kan hvit sjokolade skille seg).",
          "Ha fyllet i en sprøytepose og sprøyt en god dott på halvparten av skallene.",
          "Press forsiktig det andre skallet på over fyllet, slik at ganachen presses helt ut til kanten.",
          "Det viktigste steget: Legg makronene i en tett boks og sett dem i kjøleskapet i minst 24 timer før servering. Da trekker fuktigheten og den herlige syrinsmaken fra ganachen inn i skallene, og du får den perfekte, seige konsistensen.",
        ],
      },
    ],
  },
];

export default function SyrinArticlePage() {
  return (
    <main className="min-h-full bg-page-bg">
      <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20" style={{ paddingInline: "var(--page-pad)" }}>
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          &larr; Tilbake til Rådbanken
        </Link>

        {/* Bilde til venstre / kicker, tittel og ingress til høyre — samme
            mønster som kategori-sidene, i stedet for en smal tekstblokk
            midtstilt på en ellers tom side. */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[420px_1fr] lg:items-center lg:gap-16">
          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="relative aspect-3/4 w-full overflow-hidden rounded-3xl">
              <Image
                src="/pictures/syrin2_pexels-jovanvasiljevic-24388204.jpg"
                alt="Hender som holder frem en bukett med syrin i kveldslys"
                fill
                sizes="(max-width: 1024px) 448px, 420px"
                className="object-cover"
                priority
              />
            </div>
            <p className="mt-1 text-center text-[10px] text-ink-soft/50">Foto: Jovan Vasiljević / Pexels</p>
          </div>

          <header>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
              Duftende prydbusk med gamle røtter
            </p>
            <h1 className="font-serif-display mt-4 text-3xl text-ink sm:text-4xl lg:text-5xl">
              Syrin: mer enn en vakker vårduft
            </h1>
            <p className="mt-4 max-w-xl text-ink-soft">
              Syrin (Syringa vulgaris) er mest kjent for sitt vakre utseende og sin fantastiske duft,
              men planten har også antioksidantiske, betennelsesdempende og beroligende egenskaper
              som har vært brukt i tradisjonell folkemedisin. Ifølge Giftinformasjonen på Helsenorge
              er vanlig syrin en ufarlig prydbusk. Selve blomstene er spiselige og rike på aktive
              plantestoffer, mens barken og bladene historisk har vært brukt til mer kraftfull
              urtemedisin.
            </p>
          </header>
        </div>

        <div className="mt-20 text-ink-soft">
          {/* EGENSKAPER — enkel liste. God typografi og luft gjør jobben,
              ingen nummerering eller andre virkemidler som skal "gjøre den
              interessant" i seg selv. */}
          <section className="mx-auto w-full max-w-2xl">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">Egenskaper</p>
            <h2 className="font-serif-display mt-2 text-2xl text-ink">De viktigste egenskapene ved syrin</h2>
            <p className="mt-3">
              Her er noen av de viktigste egenskapene til syrin, og hva folketradisjonen har brukt dem til:
            </p>
            <ul className="mt-6 flex flex-col gap-4">
              <li>
                <strong className="text-ink">Rik på antioksidanter:</strong> Blomstene inneholder
                høye nivåer av flavonoider og polyfenoler, stoffer som bidrar til å beskytte
                cellene mot oksidativt stress.
              </li>
              <li>
                <strong className="text-ink">Betennelsesdempende:</strong> Nyere laboratoriestudier
                viser at ekstrakter fra syrin kan dempe betennelsesreaksjoner i kroppen, blant
                annet i tarmen.
              </li>
              <li>
                <strong className="text-ink">Stresslindring og bedre søvn:</strong> Den eteriske
                oljen og duften brukes tradisjonelt i aromaterapi for å dempe stress og fremme
                avslapning. En kopp syrin-te før sengetid kan bidra til bedre søvn.
              </li>
              <li>
                <strong className="text-ink">Støtter fordøyelsen:</strong> Syrinblomster har
                tradisjonelt blitt brukt til å berolige en urolig mage og lindre oppblåsthet.
              </li>
              <li>
                <strong className="text-ink">Hudpleie:</strong> På grunn av sine sammentrekkende
                og antibakterielle egenskaper brukes uttrekk av syrin for å roe irritert hud.
              </li>
              <li>
                <strong className="text-ink">Tradisjonell febersenking:</strong> I eldre
                folkemedisin ble te av syrinbark eller -blader brukt som febersenkende middel.
                Merk at bark og blader smaker svært bittert og bør brukes med forsiktighet.
              </li>
            </ul>
          </section>

          {/* INSPIRASJON — én forankrende bilde, ikke tre like kort. En liten,
              roligere gjenklang av heroens bilde+tekst-oppsett, som signaliserer
              at vi fortsatt er i den lette, redaksjonelle delen av artikkelen. */}
          <section className="mx-auto mt-16 w-full max-w-2xl">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">Inspirasjon</p>
            <h2 className="font-serif-display mt-2 text-2xl text-ink">Slik kan du bruke syrin</h2>
            <p className="mt-3">
              Vil du teste syrin selv, bruker du kun blomstene, plukket av den grønne stilken.
              Pass også på at busken ikke er sprøytet med kjemikalier.
            </p>

            <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
              <div className="mx-auto w-full max-w-[220px] shrink-0 sm:mx-0">
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl">
                  <Image
                    src={SYRIN_IDEAS[0].image}
                    alt=""
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                </div>
                <a
                  href={SYRIN_IDEAS[0].creditHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-center text-[10px] text-ink-soft/50 hover:text-ink-soft"
                >
                  Foto: {SYRIN_IDEAS[0].credit}
                </a>
              </div>

              <ul className="flex flex-1 flex-col divide-y divide-ink/10">
                {SYRIN_IDEAS.map((idea, i) => (
                  <li key={idea.title} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <span className="font-display shrink-0 pt-0.5 text-xs text-plum-700/60">0{i + 1}</span>
                    <div>
                      <h3 className="font-serif-display text-lg text-ink">{idea.title}</h3>
                      <p className="mt-1 text-sm">{idea.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* OPPSKRIFTER — hovedinnholdet, derfor mer luft foran og en litt
              større overskrift enn de andre seksjonene. Ett system for alle
              fire: bilde (når det finnes) pares med den korte ingredienslisten,
              fremgangsmåten ligger alltid under i full aksebredde. Oppskriften
              uten bilde og makron-oppskriften (med egne deler) bruker de samme
              byggeklossene (IngredientsList/StepsList), bare uten bildeparet. */}
          <section className="mx-auto mt-24 w-full max-w-2xl">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">Lag selv</p>
            <h2 className="font-serif-display mt-2 text-2xl text-ink sm:text-3xl">Oppskrifter</h2>

            <div className="mt-8 flex flex-col gap-16">
              {SYRIN_FULL_RECIPES.map((recipe, i) => (
                <div key={recipe.title} className={i > 0 ? "border-t border-ink/10 pt-16" : ""}>
                  <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">
                    Oppskrift {i + 1}
                  </p>
                  <h3 className="font-serif-display mt-2 text-2xl text-ink">{recipe.title}</h3>
                  <p className="mt-2">{recipe.intro}</p>

                  {recipe.parts ? (
                    <>
                      {recipe.image && (
                        <div className="mt-6">
                          <div className="relative aspect-3/2 w-full overflow-hidden rounded-2xl">
                            <Image src={recipe.image} alt="" fill sizes="672px" className="object-cover" />
                          </div>
                          {recipe.credit && (
                            <p className="mt-1 text-center text-[10px] text-ink-soft/50">Foto: {recipe.credit}</p>
                          )}
                        </div>
                      )}
                      <div className="mt-6 flex flex-col gap-8">
                        {recipe.parts.map((part) => (
                          <div key={part.heading}>
                            <h4 className="font-serif-display text-base text-ink">{part.heading}</h4>
                            {part.note && <p className="mt-1 text-sm">{part.note}</p>}
                            <div className="mt-3 flex flex-col gap-6">
                              {part.ingredients && <IngredientsList items={part.ingredients} />}
                              <StepsList steps={part.steps} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : recipe.image ? (
                    <>
                      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:gap-8">
                        <div className="mx-auto w-full max-w-[200px] shrink-0 sm:mx-0">
                          <div className="relative aspect-square overflow-hidden rounded-2xl">
                            <Image src={recipe.image} alt="" fill sizes="200px" className="object-cover" />
                          </div>
                          {recipe.credit && (
                            <p className="mt-1 text-center text-[10px] text-ink-soft/50">Foto: {recipe.credit}</p>
                          )}
                        </div>
                        {recipe.ingredients && (
                          <div className="flex-1">
                            <IngredientsList items={recipe.ingredients} />
                          </div>
                        )}
                      </div>
                      <div className="mt-6">
                        <StepsList steps={recipe.steps ?? []} />
                      </div>
                    </>
                  ) : (
                    <div className="mt-6 flex flex-col gap-6">
                      {recipe.ingredients && <IngredientsList items={recipe.ingredients} />}
                      <StepsList steps={recipe.steps ?? []} />
                    </div>
                  )}

                  {recipe.tip && (
                    <p className="mt-4 text-sm">
                      <strong className="text-ink">Tips:</strong> {recipe.tip}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* AVSLUTNING — rolig og tilbaketrukket, ingen konkurranse om
              oppmerksomheten etter hovedinnholdet. */}
          <div className="mx-auto mt-16 w-full max-w-2xl border-l-2 border-rust/50 pl-4 text-sm">
            <strong className="text-ink">Obs:</strong> Gravide, ammende eller personer som bruker
            blodfortynnende medisiner bør rådføre seg med lege før de inntar syrin i medisinske
            mengder.
          </div>
        </div>

        <div className="mx-auto mt-10 w-full max-w-2xl">
          <RemedyDisclaimer text="syrin avslapning hud fordøyelse" />
        </div>
      </div>
    </main>
  );
}
