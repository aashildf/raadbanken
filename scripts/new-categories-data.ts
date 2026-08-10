// --- Nye "problems" som må opprettes i Firestore (fantes ikke fra før) ---
// slug brukes også som nøkkel i REMEDIES under, og må matche problemSlugs i src/lib/categories.ts
export const NEW_PROBLEMS: { slug: string; name: string }[] = [
  // Hud, hår & skjønnhet
  { slug: "haret", name: "Håret" },
  { slug: "ansiktet", name: "Ansiktet" },
  { slug: "poser-under-oynene", name: "Poser under øynene" },
  { slug: "avslapning-og-velvaere", name: "Avslapning & velvære" },
  // Hus & hjem
  { slug: "tett-sluk", name: "Tett sluk" },
  { slug: "lukt-i-oppvaskmaskinen", name: "Lukt i oppvaskmaskinen" },
  { slug: "fett-pa-kjokkenskap", name: "Fett på kjøkkenskap" },
  { slug: "klesvask", name: "Klesvask" },
  { slug: "vindusvask", name: "Vindusvask" },
  { slug: "vond-lukt-i-hjemmet", name: "Vond lukt i hjemmet" },
  { slug: "rustflekker", name: "Rustflekker" },
  { slug: "riper-i-treverk", name: "Riper i treverk" },
  { slug: "rengjoring-av-mikrobolgeovn", name: "Rengjøring av mikrobølgeovn" },
];

// --- Husråd/kjerringråd per nytt problem ---
export const NEW_REMEDIES: Record<string, { title: string; description: string }[]> = {
  haret: [
    { title: "Rosmarinvann", description: "Kokt rosmarin avkjølt og brukt som skyll eller sprayet i hårbunnen. Tradisjonelt husråd som skal stimulere hårbunnen og gi håret mer glans." },
    { title: "Avokado-hårkur", description: "Moset avokado smurt utover håret og latt virke 20 minutter under et håndkle før vask. Kjent husråd mot tørt og stritt hår." },
  ],
  ansiktet: [
    { title: "Honningmaske", description: "Ren honning smurt tynt utover ansiktet i 15-20 minutter, skylles av med lunkent vann. Klassisk husråd for å gi tørr hud fuktighet og glød." },
    { title: "Rosevann", description: "Rosevann dabbet på med en bomullsdott som en oppfriskende toner. Tradisjonelt brukt for å gi huden en jevnere, mattere overflate." },
    { title: "Havremaske", description: "Finmalt havre rørt ut med litt vann eller yoghurt til en tykk maske. Mildt husråd som mange bruker mot uren og irritert hud." },
    { title: "Ingefær i ansiktsdamp", description: "Skiver av fersk ingefær i en bolle varmt vann, ansiktet holdt over dampen noen minutter. Husråd for å åpne porene før rens." },
    { title: "Kaffegrut-skrubb", description: "Brukt kaffegrut blandet med litt olje, gnidd inn i sirkelbevegelser på huden. Populært husråd for å fjerne døde hudceller." },
  ],
  "poser-under-oynene": [
    { title: "Agurk på øynene", description: "To tynne skiver kald agurk lagt over øynene i 10 minutter. Et av de mest kjente rådene mot hovne øyne og poser om morgenen." },
  ],
  "avslapning-og-velvaere": [
    { title: "Kamillebad", description: "Sterk kamillete tilsatt badevannet eller brukt som omslag. Gammelt husråd for å roe irritert og kløende hud." },
    { title: "Lavendel til avslapning", description: "Noen dråper lavendelolje på pute eller pulser, eventuelt i et varmt bad. Eldre husråd for å roe sinnet og senke skuldrene før man skal slappe av." },
  ],
  "tett-sluk": [
    { title: "Natron + eddik til sluk", description: "Hell et par skjeer natron i sluket, etterfulgt av eddik, og la det bruse i noen minutter før det skylles ned med varmt vann. Den klassiske løsningen på et tett sluk, og et av de mest søkte husrådene som finnes." },
  ],
  "lukt-i-oppvaskmaskinen": [
    { title: "Sitronskall i oppvaskmaskinen", description: "Legg et sitronskall i bestikkurven før en vask. Gir en frisk lukt og motvirker at maskinen lukter innelukket." },
  ],
  "fett-pa-kjokkenskap": [
    { title: "Bakepapir på toppen av kjøkkenskap", description: "Legg et ark bakepapir øverst på skapene der fett og støv samler seg. Når det blir skittent, kastes papiret og et nytt legges på. Gammelt husråd som har fått nytt liv på TikTok." },
  ],
  klesvask: [
    { title: "Eddik som skyllemiddel", description: "Vanlig 7 % klar eddik brukt i skyllerommet istedenfor skyllemiddel. Gjør håndklær mykere, fjerner lukt og etterlater mindre såperester." },
  ],
  vindusvask: [
    { title: "Avispapir til vindusvask", description: "Gamle aviser brukt til å tørke av vinduene etter vask, istedenfor klut. Gir blanke vinduer uten skjolder, og er fortsatt et av de mest kjente husrådene." },
  ],
  "vond-lukt-i-hjemmet": [
    { title: "Kaffegrut mot lukt", description: "Brukt kaffegrut i en liten skål plassert i kjøleskapet, skoene eller søppelbøtta. Trekker til seg vond lukt over tid." },
    { title: "Natron i joggesko", description: "En spiseskje natron strødd i hver sko over natten, ristes ut om morgenen. Reduserer vond lukt i sko." },
  ],
  rustflekker: [
    { title: "Potet mot rust", description: "Del en potet i to, dypp snittflaten i natron og gni den mot rustflekken. Eldre husråd mot rust på metall." },
  ],
  "riper-i-treverk": [
    { title: "Valnøtt mot riper i treverk", description: "Gni kjøttet av en valnøtt over en riper i treverk. Oljen i nøtten fyller og kamuflerer risset." },
  ],
  "rengjoring-av-mikrobolgeovn": [
    { title: "Mikrobølgeovn med sitron", description: "En bolle med vann og noen sitronskiver kjørt på full effekt i 3-5 minutter. Dampen løsner smuss og matrester, som lett tørkes bort etterpå." },
  ],
};
