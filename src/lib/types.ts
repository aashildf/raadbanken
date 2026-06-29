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
}

export interface Vote {
  id: string;
  remedyId: string;
  userId: string;
  voteType: "up" | "down";
  comment: string | null;
  createdAt: Timestamp | null;
}
