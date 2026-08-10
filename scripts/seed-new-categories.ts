import { readFileSync, writeFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { NEW_PROBLEMS, NEW_REMEDIES } from "./new-categories-data";
import { POSITIVE_COMMENTS, NEUTRAL_OR_NEGATIVE_COMMENTS } from "./remedies-data";

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
  // 1) Opprett de nye problem-dokumentene, samle slug -> Firestore-ID
  const problemIdBySlug: Record<string, string> = {};
  let problemBatch = db.batch();
  for (const p of NEW_PROBLEMS) {
    const ref = db.collection("problems").doc();
    problemBatch.set(ref, { name: p.name, slug: p.slug });
    problemIdBySlug[p.slug] = ref.id;
  }
  await problemBatch.commit();
  console.log(`Opprettet ${NEW_PROBLEMS.length} nye problem-dokumenter.`);

  // 2) Bygg råd-liste med faste, men nye doc-IDer
  const slugs = Object.keys(NEW_REMEDIES);
  const remedyDocs: { id: string; problemId: string; title: string; description: string }[] = [];
  for (const slug of slugs) {
    const problemId = problemIdBySlug[slug];
    for (const r of NEW_REMEDIES[slug]) {
      const ref = db.collection("remedies").doc();
      remedyDocs.push({ id: ref.id, problemId, ...r });
    }
  }
  console.log(`Genererer ${remedyDocs.length} råd totalt.`);

  // 3) Fordel et mindre, men realistisk antall stemmer mellom rådene (skalert ned fra
  //    scripts/seed.ts sin 500-1000 for ~105 råd, til samme snitt per råd her)
  const totalVotesTarget = randomInt(100, 190);
  const weights = remedyDocs.map(() => Math.random() + 0.3);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const voteCounts = weights.map((w) => Math.max(2, Math.round((w / weightSum) * totalVotesTarget)));

  // 4) Bygg alle stemmer + aggreger opp/ned per råd
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

  // 5) Velg tilfeldige stemmer som skal ha en erfaringskommentar
  const commentTarget = Math.min(allVotes.length, randomInt(40, 60));
  const shuffledIndices = allVotes.map((_, i) => i).sort(() => Math.random() - 0.5);
  for (let i = 0; i < commentTarget; i++) {
    const vote = allVotes[shuffledIndices[i]];
    vote.comment = vote.voteType === "up" ? pick(POSITIVE_COMMENTS) : pick(NEUTRAL_OR_NEGATIVE_COMMENTS);
  }

  console.log(`Genererer ${allVotes.length} stemmer, ${commentTarget} med kommentar (erfaring).`);

  // 6) Skriv alt i batcher (maks 500 operasjoner per batch)
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

  // 7) Legg de nye rådtitlene inn i seed-titles.json, slik at scripts/cleanup-seed.ts
  //    fortsatt kan identifisere ALLE seedede råd (gamle + nye) ved behov.
  const existingTitles: string[] = JSON.parse(readFileSync("./scripts/seed-titles.json", "utf8"));
  const newTitles = remedyDocs.map((r) => r.title);
  const mergedTitles = Array.from(new Set([...existingTitles, ...newTitles]));
  writeFileSync("./scripts/seed-titles.json", JSON.stringify(mergedTitles, null, 2) + "\n");

  console.log("Ferdig!");
  console.log(`- ${NEW_PROBLEMS.length} nye problemer`);
  console.log(`- ${remedyDocs.length} nye råd`);
  console.log(`- ${allVotes.length} nye stemmer`);
  console.log(`- ${commentTarget} erfaringer (stemmer med kommentar)`);
  console.log("\nProblem-IDer (slug -> Firestore-ID):");
  console.log(JSON.stringify(problemIdBySlug, null, 2));
}

main().catch((err) => {
  console.error("Seed feilet:", err);
  process.exit(1);
});
