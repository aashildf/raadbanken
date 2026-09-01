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
    id: "lovetann",
    name: "Løvetann",
    latinName: "Taraxacum officinale",
    description:
      "Gul solblomst som vokser overalt. Blader, blomster og rot er alle brukt tradisjonelt, i te, salat og som mildt vanndrivende middel.",
    shape: "flower",
    bg: "var(--gold)",
    image: {
      src: "/pictures/menupictures/lovetann_pexels-huysuzkadraj-20827831.jpg",
      fit: "cover",
      credit: "Sadettin Dogan / Pexels",
      creditHref: "https://www.pexels.com/photo/person-fingers-holding-dandelion-on-meadow-20827831/",
    },
    sections: [
      {
        heading: "Om planten",
        body: "Løvetann (Taraxacum officinale) har en lang historie innen folkemedisinen og brukes primært for å støtte fordøyelsen, stimulere leveren og virke urindrivende. Mens tradisjonell bruk er utbredt, påpeker Norsk Helseinformatikk (NHI) at de fleste helseeffektene er basert på erfaring og laboratoriestudier, og i mindre grad på omfattende kliniske studier på mennesker. Her er de mest kjente medisinske og helsemessige egenskapene fordelt på plantens ulike deler:",
      },
      {
        heading: "1. Urindrivende effekt (bladene)",
        list: [
          "Naturlig vanndrivende: Løvetannblad har en dokumentert kraftig urindrivende effekt som øker utskillelsen av væske fra kroppen.",
          "Kaliumrik: I motsetning til mange konvensjonelle vanndrivende medisiner som tømmer kroppen for kalium, inneholder løvetann naturlig store mengder kalium. Dette veier opp for tapet gjennom urinen.",
          "Bruk: Brukes tradisjonelt mot milde væskeansamlinger (hovne bein) og for å skylle gjennom urinveiene.",
        ],
      },
      {
        heading: "2. Fordøyelse og leverfunksjon (roten)",
        list: [
          "Galle- og leverstimulerende: Bitterstoffene i løvetannroten stimulerer magesyresekresjonen, fremmer appetitten og øker frigjøringen av galle fra leveren og galleblæren. Dette hjelper kroppen med å bryte ned fett.",
          "Prebiotika (inulin): Røttene er spesielt rike på inulin, et prebiotisk fiber som gir næring til de gode tarmbakteriene og støtter en sunn tarmflora.",
          "Bruk: Løvetann-te eller tinkturer av løvetannrot brukes ofte mot forstoppelse, treg fordøyelse og oppblåsthet.",
        ],
      },
      {
        heading: "3. Antiinflammatorisk og antioksidant effekt",
        list: [
          "Cellebeskyttelse: Planten er full av sterke antioksidanter som beta-karoten, polyfenoler og flavonoider. Disse bidrar til å nøytralisere frie radikaler og dempe milde betennelsestilstander i kroppen.",
          "Blodsukker og kolesterol: Prekliniske studier (laboratorie- og dyrestudier) antyder at bioaktive forbindelser i løvetann kan bidra til å regulere blodsukkernivået og forbedre lipidprofilen (kolesterolet).",
        ],
      },
      {
        heading: "Oversikt: bruk av de ulike plantedelene",
        list: [
          "Blader — urindrivende, kaliumrik. Brukes som te, ferskpresset juice eller i salater, mot væskeansamlinger og lett høyt blodtrykk.",
          "Rot — fordøyelses- og leverstimulerende, prebiotisk. Brukes som avkok, tinktur eller tørket pulver, mot forstoppelse, oppblåsthet og for å støtte leveren.",
          "Blomst — antioksidantrik. Brukes i sirup, te eller oljeekstrakter, for generell immunstøtte og hudpleie.",
        ],
      },
      {
        heading: "Viktige forholdsregler og bivirkninger",
        body: "Selv om løvetann regnes som trygt i vanlige matmengder, bør du være oppmerksom på følgende ved medisinsk bruk:",
        list: [
          "Allergier: Personer som er allergiske mot planter i kurvplantefamilien (som krysantemum, regnfann, kamille eller burot), kan også reagere på løvetann.",
          "Galleveissykdommer: Siden løvetann stimulerer galleproduksjonen, skal den ikke brukes ved tette galleveier eller akutt galleblærebetennelse uten samråd med lege.",
          "Medisininteraksjoner: Plantens vanndrivende effekt kan påvirke effekten av reseptbelagte medisiner som litium eller andre vanndrivende midler. Den kan også teoretisk påvirke blodsukkersenkende og blodfortynnende medisiner.",
        ],
      },
    ],
  },
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
    image: {
      src: "/pictures/menupictures/kamille_pexels-noelnico-11052368.jpg",
      fit: "cover",
      credit: "Noel Nicolas / Pexels",
      creditHref: "https://www.pexels.com/photo/photograph-of-white-daisy-flowers-in-a-glass-jar-11052368/",
    },
    sections: [
      {
        heading: "Historie og tradisjon",
        body: "Navnet kamille stammer fra det greske ordet chamaimelon, som betyr «jord-eple», etter den friske, eple-aktige duften fra blomstene.",
        list: [
          "Egypt: I det gamle Egypt ble kamillen holdt for å være en hellig plante, dedisert til solguden Ra for sin helbredende kraft mot feber, og brukt i de eteriske oljene under mumifisering.",
          "Hellas og Romerriket: Leger som Hippokrates og Dioskorides beskrev kamille som et effektivt middel mot kramper, hodepine og kvinnesykdommer.",
          "Nordisk tradisjon: I norrøn mytologi ble kamille regnet som en av de ni hellige urtene Odin ga menneskene for å bekjempe gift og sykdom.",
          "Klosterhager: Gjennom middelalderen ble kamille dyrket i europeiske klosterhager som et universelt middel mot alt fra fordøyelsesplager til søvnløshet.",
        ],
      },
      {
        heading: "Medisinsk bruk i dag",
        body: "Moderne forskning har bekreftet mange av de tradisjonelle bruksområdene, selv om effektene ofte beskrives som milde og støttende snarere enn kurative.",
        list: [
          "Søvn og ro: Antioksidanten apigenin binder seg til reseptorer i hjernen på samme måte som enkelte beroligende midler, og bidrar til å dempe mild uro og gjøre det lettere å sovne.",
          "Fordøyelse: Kamille virker krampedempende på den glatte muskulaturen i mage- og tarmkanalen, og drikkes tradisjonelt mot oppblåsthet, milde magesmerter og urolig mage.",
          "Hud, munn og hals (utvortes): Omslag eller kremer med kamilleekstrakt brukes for å dempe hudbetennelser som eksem og solbrenthet, mens kamille-te som gurglevann demper betennelser i tannkjøtt og hals.",
        ],
      },
      {
        heading: "Bivirkninger og advarsler",
        body: "Kamille regnes som en svært trygg urt for de aller fleste, men noen forholdsregler er verdt å kjenne til:",
        list: [
          "Kurvplantefamilien (allergi): Kamille tilhører kurvplantefamilien (Asteraceae). Er du allergisk mot burot, prestekrage, løvetann eller krysantemum, kan du også reagere på kamille.",
          "Interaksjoner: Kamille inneholder naturlige kumariner, som kan ha en lett blodfortynnende effekt. Bør brukes med forsiktighet ved bruk av sterke blodfortynnende medisiner (som Marevan), og unngås i store mengder de siste to ukene før planlagt kirurgi.",
          "Øyne: Kamille-te ble tradisjonelt brukt til å skylle øyekatarr, men moderne øyeleger fraråder dette — fine partikler fra teen kan irritere øyet, og planten kan utløse allergiske reaksjoner.",
        ],
      },
    ],
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
    sections: [
      {
        heading: "Om planten",
        body: "Lavendel (Lavandula) tilhører leppeblomstfamilien, sammen med blant annet mynte og salvie, og stammer opprinnelig fra det tørre Middelhavsområdet. Planten er mest kjent for sine blålilla blomster, sin beroligende duft og sin utstrakte bruk i eteriske oljer, kosmetikk, medisin og matlaging. De mest utbredte artene er ekte lavendel (Lavandula angustifolia), som er mest hardfør, og sommerlavendel (Lavandula stoechas), kjennetegnet av store «vinger» på toppen av blomsten.",
      },
      {
        heading: "Historie og tradisjon",
        body: "Lavendel har fulgt menneskeheten i tusenvis av år som et symbol på renhet og velvære. Navnet stammer fra det latinske ordet lavare, som betyr «å vaske».",
        list: [
          "Romerriket: Romerne brukte flittig lavendel i sine berømte bad for å parfymere vannet og rense huden.",
          "Middelalderen: Planten ble strødd på gulvene i slott og kirker for å dempe vond lukt og holde insekter, lopper og lus unna.",
          "Pest og sykdom: Under pestutbrudd i Europa bar folk lavendelkvaster foran nesen i tro om beskyttelse mot smitte, noe som indirekte hjalp, siden lavendelolje frastøter lopper og fluer som bar på smitten.",
        ],
      },
      {
        heading: "Medisinsk og terapeutisk bruk",
        body: "Lavendel inneholder over 100 kjente aktive forbindelser, der de viktigste er linalool og linalylacetat. Disse stoffene absorberes raskt gjennom huden eller luftveiene og har en påvisbar effekt på nervesystemet.",
        list: [
          "Beroligende og søvnfremmende: Innånding av lavendelduft stimulerer det parasympatiske nervesystemet. Kliniske studier viser at lavendel kan redusere mild angst, uro og stress, forbedre søvnkvaliteten og senke hjerterytmen.",
          "Antiseptisk og lindrende på huden: Den eteriske oljen fra ekte lavendel er en av få eteriske oljer som i små mengder kan påføres huden direkte, selv om uttynning i baseolje alltid anbefales. Den virker lett bakteriedrepende på småsår og insektbitt, og kjøler lette brannskader.",
        ],
      },
      {
        heading: "Kulinarisk bruk",
        body: "Hele planten er spiselig, og den friske eller tørkede blomsten gir en parfymert og lett søtlig smak.",
        list: [
          "Krydderblandinger: Lavendel er en klassisk ingrediens i den franske krydderblandingen Herbes de Provence.",
          "Bakst og desserter: Tørket lavendel passer i lyst sukkerbrød, kjeks, eller infundert i crème brûlée og hjemmelaget is.",
          "Te: Lavendelblomster blandes ofte med kamille for en beroligende kvelds-te.",
          "Tips: Bruk lavendel med omhu i matlaging. For mye, og maten smaker fort såpe.",
        ],
      },
      {
        heading: "Bivirkninger og forholdsregler",
        list: [
          "Hudirritasjon: Ren eterisk olje kan utløse kontaktallergi hos sensitive personer. Test alltid på et lite hudområde først.",
          "Hormonell påvirkning: Enkelte studier har reist spørsmål ved om hyppig, ekstern bruk av ren lavendelolje hos unge gutter kan ha en mild hormonforstyrrende effekt, men forskningen er foreløpig ikke entydig.",
          "Innvortes inntak: Eterisk olje av lavendel må aldri drikkes eller svelges i ren form, den kan være giftig for lever og nyrer i konsentrerte mengder.",
        ],
      },
    ],
  },
  {
    id: "hvitloek",
    name: "Hvitløk",
    latinName: "Allium sativum",
    description:
      "Skarp løkplante med lange røtter i folkemedisinen, ofte brukt mot forkjølelse og luftveisplager.",
    shape: "root",
    bg: "var(--plum-800)",
    image: {
      src: "/pictures/menupictures/garlic_pexels-karola-g-4033161.jpg",
      fit: "cover",
      credit: "Kaboompics.com / Pexels",
      creditHref: "https://www.pexels.com/photo/composition-of-garlic-bulbs-with-purple-net-on-white-background-4033161/",
    },
    sections: [
      {
        heading: "Historie og tradisjon",
        body: "Hvitløk (Allium sativum) tilhører løkslekten, sammen med kepaløk, purre og gressløk, og har vært brukt som mat, krydder og medisin i over 5000 år. Evnen til å holde «onde krefter» unna er dypt forankret i historien, opprinnelig handlet det om å holde reelle trusler som smitte og parasitter på avstand.",
        list: [
          "Egypt: Det sies at de egyptiske pyramidebyggerne gikk til streik dersom den daglige hvitløksrasjonen uteble. Løken ble gitt for å gi arbeiderne styrke og beskytte dem mot sykdom.",
          "Antikkens sport: Greske idrettsutøvere spiste hvitløk før de olympiske leker som en tidlig, naturlig form for ytelsesfremmende middel, for å øke utholdenheten.",
          "Krigsmedisin: Helt frem til første verdenskrig ble fersk hvitløksaft brukt på slagmarken som et antiseptisk middel for å rense sår og forhindre koldbrann, den gang penicillin ennå ikke var tilgjengelig.",
        ],
      },
      {
        heading: "Den kjemiske magien: Allicin",
        body: "Når hvitløken ligger hel og uskadd i båtene, lukter den nesten ingenting. Magien skjer først når celleveggene brytes. Planten inneholder aminosyren alliin og enzymet allinase. Når du knuser, hakker eller tygger hvitløken, møtes disse to og danner stoffet allicin, som gir den karakteristiske, sterke lukten og står for de fleste av de medisinske effektene.",
        list: [
          "Tips til kjøkkenet: For å få maksimal helseeffekt bør du hakke eller knuse hvitløken og la den hvile i 10 minutter på fjøla før du varmebehandler den. Da rekker allicinet å utvikle seg fullt ut, og det tåler varmen bedre.",
        ],
      },
      {
        heading: "Medisinsk bruk i dag",
        body: "Moderne vitenskap har bekreftet at hvitløk har sterke biologiske effekter, spesielt på hjerte- og karsystemet og immunforsvaret.",
        list: [
          "Blodtrykk: Studier viser at høye doser hvitløksekstrakt kan redusere blodtrykket hos personer med forhøyet trykk, nesten på linje med enkelte milde medisiner.",
          "Kolesterol: Regelmessig inntak kan bidra til å senke det «leie» LDL-kolesterolet og de totale fettstoffene i blodet.",
          "Blodfortynnende: Hvitløk hemmer sammenklumping av blodplater, noe som reduserer risikoen for blodpropp.",
          "Immunforsvar og infeksjoner: Allicin har kraftige antimikrobielle egenskaper og fungerer i praksis som et mildt, bredspektret naturmiddel mot bakterier, virus og sopp. Mange opplever at regelmessig inntak kan redusere hyppigheten eller varigheten av en vanlig forkjølelse.",
          "Antioksidanter: Hvitløk er proppfull av antioksidanter som beskytter kroppens celler mot oksidativt stress og aldring.",
        ],
      },
      {
        heading: "Bivirkninger og interaksjoner",
        list: [
          "Blodfortynnende effekt: Siden hvitløk tynner blodet, må du være forsiktig med store mengder (særlig konsentrerte hvitløkskapsler) hvis du allerede går på medisiner som Marevan eller Albyl-E, eller før en planlagt operasjon.",
          "Mavebesvær: Fersk hvitløk i store mengder kan være sterkt for magen og forårsake halsbrann eller irritasjon i tarmen.",
          "Hvitløksånde: Den velkjente lukten skyldes svovelforbindelser som tas opp i blodet og skilles ut via pusten og huden. Rå persille, epler eller melk kan bidra til å nøytralisere lukten.",
        ],
      },
    ],
  },
  {
    id: "timian",
    name: "Timian",
    latinName: "Thymus vulgaris",
    description:
      "Aromatisk krydderurt. Trekkes som te og er et gammelt husråd mot hoste og slim.",
    shape: "sprig",
    bg: "var(--sage)",
    image: { src: "/pictures/timian.png", fit: "cover" },
    sections: [
      {
        heading: "Historie og tradisjon: mot og renhet",
        body: "Timian (Thymus vulgaris) tilhører leppeblomstfamilien, akkurat som lavendel og mynte, og stammer opprinnelig fra de tørre, solrike fjellsidene rundt Middelhavet. Navnet stammer trolig fra det greske ordet thumos, som betyr «mot» eller «livskraft», eller thuo, «å ofre/parfymere».",
        list: [
          "Antikkens Hellas: Grekerne brukte timian som røkelse i templene sine. Å lukte av timian var det største komplimentet en mann kunne få, det betydde at han var stilig, modig og full av energi. Romerske soldater badet i timianvann før de dro i krig for å få ekstra mot.",
          "Middelalderen: Europeiske riddere fikk ofte brodert en timiankvast med en bie på ridderkappene sine fra sine utvalgte damer, som et symbol på tapperhet.",
          "Beskyttelse mot mareritt: Det var vanlig å legge timian under hodeputen for å holde onde drømmer unna, og for å sikre en dyp og rolig søvn.",
        ],
      },
      {
        heading: "Den kjemiske superkraften: tymol",
        body: "Timian er ikke bare en smakfull urt, den er i praksis et lite apotek i seg selv. Den viktigste aktive komponenten i den eteriske oljen heter tymol, en ekstremt kraftig, naturlig fenol som virker sterkt antiseptisk, bakteriedrepende og soppdrepende. Før moderne antibiotika ble oppfunnet, var tymol et av de viktigste stoffene legene brukte til å desinfisere sår og medisinsk utstyr, og det brukes fortsatt som aktiv ingrediens i kjente munnskyllevann som Listerine den dag i dag.",
      },
      {
        heading: "Medisinsk bruk i dag",
        body: "Timian er spesielt anerkjent for sin effekt på luftveiene og halsen, og er godkjent av europeiske legemiddelmyndigheter som et tradisjonelt plantebasert legemiddel mot hoste og slim.",
        list: [
          "Naturens hostemedisin: Slimløsende, hjelper til med å tynne ut seigt slim i luftveiene så det blir lettere å hoste opp. Krampedempende, beroliger de glatte musklene i luftveiene, noe som demper gjenstridig tørrhoste og lindrer symptomer ved bronkitt.",
          "Sår hals og munn: Takket være de bakteriedrepende egenskapene er timian-te genialt å bruke som gurglevann ved sår hals, hovne mandler eller små blemmer i munnhulen.",
          "Fordøyelsen: I matlaging brukes timian ofte i fete og tunge retter som lam, svin og fløtesupper, ikke tilfeldig, siden timian stimulerer produksjonen av magesyre og galle, motvirker oppblåsthet og hjelper tarmen med å bryte ned tung mat.",
        ],
      },
      {
        heading: "Bivirkninger og forholdsregler",
        body: "Som kjøkkenurt i normale matmengder er timian helt trygt for alle. Bruker du den derimot medisinsk som konsentrert olje eller sterkt kosttilskudd, bør du merke deg dette:",
        list: [
          "Konsentrert eterisk olje: Ren timianolje er ekstremt sterk og kan irritere hud og slimhinner. Den må aldri svelges ren.",
          "Graviditet: Gravide kan trygt spise mat krydret med timian og drikke en normal kopp timian-te i ny og ne, men bør unngå konsentrerte timian-ekstrakter eller store medisinske doser, da urten i store mengder tradisjonelt har vært brukt til å stimulere livmoren.",
        ],
      },
    ],
  },
  {
    id: "fennikel",
    name: "Fennikel",
    latinName: "Foeniculum vulgare",
    description:
      "Søtaktig urt med frø som tradisjonelt brukes for å løse opp slim og lindre mageknute.",
    shape: "flower",
    bg: "var(--plum-600)",
    image: {
      src: "/pictures/menupictures/fenikkel_pexels-andromeda99-36248176.jpg",
      fit: "cover",
      credit: "Jeffry Surianto / Pexels",
      creditHref: "https://www.pexels.com/photo/close-up-of-yellow-flowering-fennel-plant-36248176/",
    },
    sections: [
      {
        heading: "Om planten",
        body: "Fennikel (Foeniculum vulgare) tilhører skjermplantefamilien, sammen med blant annet dill, karve, gulrot og selleri, og stammer opprinnelig fra Middelhavsområdet. Hele planten kan spises: den sprø, hvitgrønne knollen brukes som grønnsak, de fjærlignende bladene som urtekrydder, og frøene som et kraftfullt medisinsk krydder. Den har en karakteristisk, søtlig smak som minner om anis eller lakris.",
      },
      {
        heading: "Historie og tradisjon: Maratonslag og synsevne",
        list: [
          "Slaget ved Marathon: Det greske navnet på fennikel er marathos. Det berømte slaget ved Marathon i år 490 f.Kr. ble utspilt på en slette overgrodd med vill fennikel, stedet betyr bokstavelig talt «sletten med fennikel».",
          "Romersk styrke: Romerske krigere drakk fennikel-te før de dro i kamp fordi de mente urten ga fysisk styrke, mot og utholdenhet. Romerske kvinner spiste frøene for å dempe sultfølelsen under faste.",
          "Godt for synet: I middelalderen mente vitenskapsmenn og leger, blant annet abbedissen Hildegard von Bingen, at fennikel kunne kurere dårlig syn og øyesykdommer.",
          "Beskyttelse mot hekseri: På 1600-tallet i England hengte folk fennikelbunter over dørene sine på sankthansaften for å holde onde ånder og hekser unna huset.",
        ],
      },
      {
        heading: "De aktive komponentene",
        body: "Den medisinske kraften til fennikel, og den herlige lakrissmaken, ligger primært i de eteriske oljene i frøene. De viktigste virkestoffene er anethol (virker sterkt krampedempende og betennelsesdempende), fenchon (bidrar til den bitre, medisinske undertonen og stimulerer fordøyelsen) og flavonoider (antioksidanter som beskytter cellene mot betennelser og slitasje).",
      },
      {
        heading: "Medisinsk bruk i dag",
        body: "Fennikel er kanskje aller mest kjent for sin lindrende effekt på alt som har med magen å gjøre.",
        list: [
          "Oppblåst mage og luftplager: Fennikel er en av de beste naturlige remediene mot tarmgass og oppblåsthet. De aktive stoffene avslapper den glatte muskulaturen i mage- og tarmkanalen, slik at innesperret luft lettere passerer og magekrampene dempes. Den er ofte en hovedingrediens i «ammete», siden man tradisjonelt har ment at de virksomme stoffene går over i morsmelken og kan lindre kolikk hos spedbarn.",
          "Hoste og luftveisplager: Akkurat som timian har fennikelfrø en slimløsende effekt. Fennikel-te hjelper til med å løsne seigt slim i luftveiene ved forkjølelse, og beroliger sår hals og tørrhoste.",
          "Frisk pust og munnhelse: I India og deler av Midtøsten er det vanlig å tygge en klype ristede fennikelfrø (mukhwas) etter et måltid, det fjerner dårlig ånde, stimulerer spyttproduksjonen og starter fordøyelsesprosessen.",
        ],
      },
      {
        heading: "Kulinarisk bruk",
        list: [
          "Rå (knollen): Snittet i tynne skiver, gjerne sammen med eple, appelsin og god olivenolje, sprø, frisk og med tydelig lakrissmak.",
          "Varmebehandlet: Bakt, stekt eller kokt i supper mister knollen nesten hele lakrissmaken og blir i stedet søt, mild og fløyelsmyk, en klassisk partner til all hvit fisk og sjømat.",
        ],
      },
      {
        heading: "Bivirkninger og forholdsregler",
        body: "Fennikel som grønnsak og vanlig kjøkkenkrydder er helt trygt for alle. Ved medisinsk bruk av konsentrert fennikelolje eller store mengder te bør du merke deg:",
        list: [
          "Allergi: Er du allergisk mot andre planter i skjermplantefamilien, som selleri, gulrot eller karve, kan du også få en allergisk reaksjon av fennikel.",
          "Små barn og gravide: Statens legemiddelverk og europeiske helsemyndigheter anbefaler at gravide, ammende og barn under 4 år unngår konsentrerte fennikelekstrakter og rene eteriske oljer over lengre tid, på grunn av stoffet estragol. Vanlig fennikel i maten er helt uproblematisk.",
        ],
      },
    ],
  },
  {
    id: "salvie",
    name: "Salvie",
    latinName: "Salvia officinalis",
    description:
      "Kraftig, lett bitter urt. Tygges eller trekkes som te, tradisjonelt brukt mot sår hals og halsbetennelse.",
    shape: "sprig",
    bg: "var(--sage)",
    image: {
      src: "/pictures/menupictures/timian_pexels-owen-outdoors-409204690-32437498.jpg",
      fit: "cover",
      credit: "Owen.outdoors / Pexels",
      creditHref: "https://www.pexels.com/photo/close-up-of-purple-sage-flowers-in-bloom-32437498/",
    },
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
    sections: [
      {
        heading: "Om planten",
        body: "Aloe vera (Aloe barbadensis) har en over 2000 år lang tradisjon som medisinplante, og brukes i dag over hele verden til både utvortes hudbehandling og innvortes bruk. Medisinsk skiller man skarpt mellom to ulike substanser fra planten: den klare, indre geléen, og den gule, bitre plantesaften (lateks) som ligger rett under skallet. Planten inneholder over 200 biologisk aktive stoffer, blant annet vitaminer, enzymer, mineraler og polysakkarider (som acemannan), men Store medisinske leksikon påpeker at det trengs mer omfattende klinisk forskning for å bekrefte flere av de medisinske påstandene.",
      },
      {
        heading: "Utvortes bruk (gelen)",
        body: "Den klare geléen er mest kjent for sine kjølende, fuktighetsgivende og betennelsesdempende egenskaper på huden.",
        list: [
          "Brannskader og solbrenthet: Kliniske studier viser at aloe vera-gel kan redusere legetiden ved første- og andregrads forbrenninger sammenlignet med tradisjonelle kremer, siden den danner en beskyttende barriere og tilfører fuktighet.",
          "Sårheling: Geléen antas å stimulere kollagenproduksjonen og øke blodsirkulasjonen i huden, noe som kan fremskynde regenerering av celler.",
          "Hudlidelser: Brukes tradisjonelt for å lindre symptomer ved psoriasis, seborreisk eksem og tørr hud.",
          "Viktig advarsel: Aloe vera skal aldri brukes på dype operasjonssår eller åpne kirurgiske kutt — studier viser at den kan forsinke helingsprosessen og øke smerte i disse tilfellene.",
        ],
      },
      {
        heading: "Innvortes bruk (juice og lateks)",
        body: "Innvortes bruk skjer som regel i form av kosttilskudd eller medisinsk ekstrakt, men krever vesentlig større forsiktighet.",
        list: [
          "Avføringsmiddel (lateks): Den gule plantesaften (lateks) inneholder antrakinoner (aloin), som har en kraftig lakserende effekt. På grunn av risiko for sterke magekramper og elektrolyttforstyrrelser er stoffet strengt regulert i mange land.",
          "Blodsukkerregulering: Enkelte studier tyder på at oralt inntak kan bidra til å senke fastende blodsukker hos personer med diabetes type 2, men dette bør kun gjøres i samråd med lege.",
          "Munnhelse: Aloe vera-ekstrakt i munnskyllevann har vist gode resultater mot tannkjøttbetennelse (gingivitt) og blemmer i munnen.",
        ],
      },
      {
        heading: "Bivirkninger og sikkerhetsrisiko",
        body: "Selv om aloe vera er et naturprodukt, er det ikke uten risiko:",
        list: [
          "Allergi: Noen kan oppleve rødhet, svie eller kontakteksem ved hudkontakt.",
          "Innvortes risiko: Langvarig eller høyt inntak av aloe vera-produkter er knyttet til diaré, magesmerter og i alvorlige tilfeller nyre- eller leverskader.",
          "Interaksjoner: Inntak av aloe vera kan påvirke opptaket av faste medisiner, særlig vanndrivende og blodfortynnende midler. Gravide og ammende bør unngå innvortes bruk helt.",
        ],
      },
    ],
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
