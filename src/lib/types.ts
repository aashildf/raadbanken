import type { Timestamp } from "firebase/firestore";

export interface Problem {
  id: string;
  name: string;
  slug: string;
}

export interface Remedy {
  id: string;
  title: string;
  description: string;
  problemId: string;
  votesUp: number;
  votesDown: number;
  totalVotes: number;
  successRate: number;
  createdAt: Timestamp | null;
  /** Fra del-rad-skjemaet (mal-skjema-dybde.html, "Slik gjør du"/"Hvor kommer
      rådet fra"/"Om deg") — valgfrie, ingen eksisterende visning (kort,
      detaljside) leser dem ennå. Lagret for ikke å miste det innsenderen
      skrev, klart for når detaljsiden utvides til å vise det. */
  need?: string[];
  steps?: string[];
  source?: string;
  authorName?: string;
  anonymous?: boolean;
}

export interface Vote {
  id: string;
  remedyId: string;
  userId: string;
  voteType: "up" | "down";
  comment: string | null;
  createdAt: Timestamp | null;
}
