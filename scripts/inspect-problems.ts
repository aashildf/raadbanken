import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(readFileSync("./service-account.json", "utf8"));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
  const snap = await db.collection("problems").get();
  console.log(`Fant ${snap.size} problem-dokumenter:\n`);
  snap.forEach((doc) => {
    console.log(JSON.stringify({ id: doc.id, ...doc.data() }));
  });
}

main();
