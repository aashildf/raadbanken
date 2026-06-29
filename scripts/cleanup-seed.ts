import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(readFileSync("./service-account.json", "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const SEED_TITLES = new Set<string>(
  JSON.parse(readFileSync("./scripts/seed-titles.json", "utf8")) as string[]
);

async function main() {
  const remediesSnap = await db.collection("remedies").get();
  const toDeleteRemedyIds = new Set<string>();
  for (const doc of remediesSnap.docs) {
    if (SEED_TITLES.has(doc.data().title)) {
      toDeleteRemedyIds.add(doc.id);
    }
  }
  console.log(`Sletter ${toDeleteRemedyIds.size} seed-råd (av ${remediesSnap.size} totalt).`);

  const votesSnap = await db.collection("votes").get();
  const toDeleteVoteIds: string[] = [];
  for (const doc of votesSnap.docs) {
    const data = doc.data();
    if (String(data.userId).startsWith("seed-user-") || toDeleteRemedyIds.has(data.remedyId)) {
      toDeleteVoteIds.push(doc.id);
    }
  }
  console.log(`Sletter ${toDeleteVoteIds.length} seed-stemmer (av ${votesSnap.size} totalt).`);

  const allDeletes = [
    ...[...toDeleteRemedyIds].map((id) => db.collection("remedies").doc(id)),
    ...toDeleteVoteIds.map((id) => db.collection("votes").doc(id)),
  ];

  for (let i = 0; i < allDeletes.length; i += 450) {
    const batch = db.batch();
    for (const ref of allDeletes.slice(i, i + 450)) batch.delete(ref);
    await batch.commit();
  }
  console.log("Opprydding ferdig.");
}
main();
