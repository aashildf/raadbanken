// "Ukens boktips" — data-drevet i stedet for to hardkodede blokker i
// page.tsx, siden Åshild skal legge til flere bøker (og flere bilder per
// bok) etter hvert. Teksten i `blurb`/`review` er hennes egne, skrevne
// omtaler av disse offentlig tilgjengelige (public domain) bøkene fra
// Project Gutenberg, ikke utdrag fra selve bøkene.
export type BookTip = {
  id: string;
  title: string;
  author: string;
  year: string;
  cover: string;
  gutenbergHref: string;
  /** Kort tekst vist i hover-boblen over bokomslaget. */
  blurb: string;
  /** Fulltekst vist i "les mer"-modalen ved klikk. */
  review: {
    paragraphs: string[];
    recommendedFor?: string;
    note?: string;
  };
  /**
   * Bildet av hender som holder fram akkurat denne boken — når satt, er
   * dette "ukens" bok og vises alene (stort bilde) i stedet for den vanlige
   * raden med bokrygger. Bare én bok bør ha dette satt om gangen.
   */
  handImage?: string;
};

export const BOOK_TIPS: BookTip[] = [
  {
    id: "toadstools-mushrooms-fungi",
    title: "Toadstools, Mushrooms, Fungi",
    author: "Charles McIlvaine & Robert K. Macadam",
    year: "1900",
    cover: "/pictures/soppbok.png",
    gutenbergHref: "https://www.gutenberg.org/ebooks/51393",
    blurb: "Et klassisk verk innen mykologi, fra en mann som smakte seg gjennom hundrevis av sopparter.",
    review: {
      paragraphs: [
        "Denne boken om sopp fra 1900 er et klassisk verk innen mykologi (sopplære). McIlvaine var kjent for sine banebrytende og til tider ekstremt dristige eksperimenter der han prøvesmakte hundrevis av ulike sopparter for å kartlegge hvilke som var spiselige.",
        "I boken er det fotografier, tegninger og tekst som utforsker mangfoldet av sopper, fra de spiselige gode artene til de giftige og dødelige.",
        "For den nysgjerrige naturvennen er dette et lite dykk ned i eldre tiders soppkunnskap, og en påminnelse om hvor mye spennende som skjuler seg på skogbunnen.",
      ],
      recommendedFor: "naturhistorie, gamle bøker, kuriøse fakta og soppens underlige verden.",
      note: "Boka er historisk og bør ikke brukes alene til å identifisere spiselig sopp. Bruk oppdatert, kvalitetssikret kunnskap ved soppsanking.",
    },
  },
  {
    id: "plant-lore-legends-lyrics",
    title: "Plant Lore, Legends, and Lyrics",
    author: "Richard Folkard",
    year: "1884",
    cover: "/pictures/plantlore.png",
    gutenbergHref: "https://www.gutenberg.org/ebooks/44638",
    blurb: "Et viktoriansk storverk om myter, folketro og dikt knyttet til trær, blomster og planter.",
    handImage: "/pictures/handmedbok-crop.png",
    review: {
      paragraphs: [
        "Et omfattende og klassisk verk fra victoriatiden som tar for seg folkloristisk og mytologisk plantekunnskap fra ulike kulturer verden over. Boken utforsker historier, folketro, symbolikk og dikt knyttet til trær, blomster og planter.",
        "Enten du trenger den perfekte planten for å holde heksenes trolldom på avstand, lurer på hva alver og smånisser gjemte seg under når det regnet, eller vil vite hvilke blomster som fikk hedersplassen i kristne tradisjoner og legender — Richard Folkards Plant Lore, Legends, and Lyrics fra 1884 har svarene.",
        "Dette er den ultimate guiden fra victoriatiden til alt det merkelige, magiske og småsprø folk trodde om planteriket. Her får du hele historien om heksenes flyvesalver, overtroiske oppskrifter mot onde ånder, og de utroligste mytene som har oppstått rundt alt fra roser og liljer til helt vanlige ugressplanter.",
      ],
    },
  },
];
