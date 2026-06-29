// Bilder knyttet til spesifikke råd (matchet på eksakt tittel), brukt der vi har fått bilder.
export const REMEDY_IMAGES: Record<string, { src: string; credit?: string; creditHref?: string }> = {
  "Hvitløk og honning": { src: "/pictures/hvitlok_honning.jpg" },
  "Kålblad-omslag": { src: "/pictures/kaalomslag.png" },
};

// Utvidet tekst + tegning for råd-detaljsiden, brukt der vi har skrevet mer utfyllende innhold.
export const REMEDY_DETAILS: Record<
  string,
  { drawing: string; paragraphs: string[] }
> = {
  "Kålblad-omslag": {
    drawing: "/pictures/kaalomslag_tegning.png",
    paragraphs: [
      "Kålbladomslag er et av de eldste husrådene i europeisk folkemedisin, brukt i generasjoner mot hovne og smertefulle ledd. Det dukker opp i kjerringråd-tradisjoner over hele kontinentet, ofte som førstevalget når et ledd har blitt stivt, varmt eller hovent etter en lang arbeidsdag.",
      "Slik gjøres det tradisjonelt: et friskt, ytre kålblad knuses lett eller varmes forsiktig slik at det blir mykt, legges rundt det vonde leddet og holdes på plass med en bandasje eller et tøystykke. Omslaget får gjerne ligge i 30–60 minutter, og kan gjentas et par ganger om dagen ved behov.",
      "Mange forklarer den kjølende, lindrende følelsen med at kålblader er fulle av vann og svovelforbindelser som trekker varme og hevelse ut av huden. Husrådet er særlig kjent for å bli brukt ved leddgikt, forstuinger og generell verk i knær, albuer og fingre.",
      "Som med de fleste kjerringråd er dette en erfaringsbasert tradisjon, ikke en medisinsk behandling, men for mange er det en enkel og billig ting å prøve før man griper til annet.",
    ],
  },
};
