import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { PROBLEMS, REMEDIES, POSITIVE_COMMENTS, NEUTRAL_OR_NEGATIVE_COMMENTS } from "./remedies-data";

const serviceAccount = JSON.parse(readFileSync("./service-account.json", "utf8"));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

type SeedVote = {
  id: string;
  remedyId: string;
  userId: string;
  voteType: "up" | "down";
  comment: string | null;
  createdAt: Timestamp;
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function randomPastDate(maxDaysAgo: number) {
  const daysAgo = randomInt(0, maxDaysAgo);
  const hoursAgo = randomInt(0, 23);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d;
}

async function main() {
  const slugs = Object.keys(PROBLEMS);
  const remedyDocs: { id: string; problemId: string; problemName: string; title: string; description: string }[] = [];

  // 1) Bygg råd-liste med faste, men nye doc-IDer
  for (const slug of slugs) {
    const problemId = PROBLEMS[slug];
    const remedyList = REMEDIES[slug];
    for (const r of remedyList) {
      const ref = db.collection("remedies").doc();
      remedyDocs.push({ id: ref.id, problemId, problemName: slug, ...r });
    }
  }

  console.log(`Genererer ${remedyDocs.length} råd totalt.`);

  // 2) Fordel totalt antall stemmer mellom rådene (mellom 500 og 1000)
  const totalVotesTarget = randomInt(500, 1000);
  const weights = remedyDocs.map(() => Math.random() + 0.3);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const voteCounts = weights.map((w) => Math.max(2, Math.round((w / weightSum) * totalVotesTarget)));

  // 3) Bygg alle stemmer + aggreger opp/ned per råd
  const allVotes: SeedVote[] = [];
  const remedyAggregates: Record<string, { votesUp: number; votesDown: number }> = {};
  let voteUidCounter = 0;

  remedyDocs.forEach((remedy, idx) => {
    const count = voteCounts[idx];
    const successProb = 0.3 + Math.random() * 0.65; // 30%-95% positiv andel
    const votesUp = Math.round(count * successProb);
    const votesDown = count - votesUp;
    remedyAggregates[remedy.id] = { votesUp, votesDown };

    for (let i = 0; i < count; i++) {
      const voteType: "up" | "down" = i < votesUp ? "up" : "down";
      voteUidCounter += 1;
      allVotes.push({
        id: `${remedy.id}_seed-user-${voteUidCounter}`,
        remedyId: remedy.id,
        userId: `seed-user-${voteUidCounter}`,
        voteType,
        comment: null,
        createdAt: Timestamp.fromDate(randomPastDate(120)),
      });
    }
  });

  // 4) Velg tilfeldige stemmer (200-300) som skal ha en erfaringskommentar
  const commentTarget = Math.min(allVotes.length, randomInt(200, 300));
  const shuffledIndices = allVotes.map((_, i) => i).sort(() => Math.random() - 0.5);
  for (let i = 0; i < commentTarget; i++) {
    const vote = allVotes[shuffledIndices[i]];
    vote.comment = vote.voteType === "up" ? pick(POSITIVE_COMMENTS) : pick(NEUTRAL_OR_NEGATIVE_COMMENTS);
  }

  console.log(`Genererer ${allVotes.length} stemmer, ${commentTarget} med kommentar (erfaring).`);

  // 5) Skriv alt i batcher (maks 500 operasjoner per batch)
  let batch = db.batch();
  let opCount = 0;
  const batches: FirebaseFirestore.WriteBatch[] = [batch];

  function addWrite(ref: FirebaseFirestore.DocumentReference, data: object) {
    if (opCount >= 450) {
      batch = db.batch();
      batches.push(batch);
      opCount = 0;
    }
    batch.set(ref, data);
    opCount += 1;
  }

  for (const remedy of remedyDocs) {
    const agg = remedyAggregates[remedy.id];
    const totalVotes = agg.votesUp + agg.votesDown;
    const successRate = totalVotes > 0 ? Math.round((agg.votesUp / totalVotes) * 100) : 0;
    addWrite(db.collection("remedies").doc(remedy.id), {
      title: remedy.title,
      description: remedy.description,
      problemId: remedy.problemId,
      votesUp: agg.votesUp,
      votesDown: agg.votesDown,
      totalVotes,
      successRate,
      createdAt: Timestamp.fromDate(randomPastDate(150)),
    });
  }

  for (const vote of allVotes) {
    addWrite(db.collection("votes").doc(vote.id), {
      remedyId: vote.remedyId,
      userId: vote.userId,
      voteType: vote.voteType,
      comment: vote.comment,
      createdAt: vote.createdAt,
    });
  }

  console.log(`Skriver i ${batches.length} batch(er)...`);
  for (const b of batches) {
    await b.commit();
  }

  console.log("Ferdig!");
  console.log(`- ${remedyDocs.length} råd`);
  console.log(`- ${allVotes.length} stemmer`);
  console.log(`- ${commentTarget} erfaringer (stemmer med kommentar)`);
}

main().catch((err) => {
  console.error("Seed feilet:", err);
  process.exit(1);
});
