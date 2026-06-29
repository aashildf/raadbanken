import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(readFileSync("./service-account.json", "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
  const snap = await db.collection("remedies").get();
  console.log(`Total remedies: ${snap.size}`);
  snap.forEach((d) => {
    const data = d.data();
    console.log(d.id, "|", data.title, "|", data.problemId, "| votes:", data.totalVotes);
  });
}
main();
