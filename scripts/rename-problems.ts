import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(readFileSync("./service-account.json", "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Disse problem-navnene fungerte ikke i sideskjemaet "Råd mot {navn}" (f.eks.
// "Råd mot avslapning og velvære" betyr det motsatte av hva som var ment).
// Slug og alle remedy-referanser er uendret, kun visningsnavnet rettes.
const RENAMES: Record<string, string> = {
  Aa8NTuAPBddVEOqVbJez: "Tørt og matt hår",
  zQtFJjgR6vK8Ot4YtpED: "Tørr og uren hud",
  pvFbRBxkFqGl9dbZbprj: "Stress og uro",
  ndnVa6wGLgh2QV4I15Pe: "Stive og illeluktende klær",
  ToyX5T1XAGG15XXScIKW: "Skjoldete vinduer",
  PnMHAAIFq4gpraQK4i5B: "Skitten mikrobølgeovn",
};

async function main() {
  const batch = db.batch();
  for (const [id, name] of Object.entries(RENAMES)) {
    batch.update(db.collection("problems").doc(id), { name });
  }
  await batch.commit();
  console.log(`Omdøpte ${Object.keys(RENAMES).length} problemer.`);
}

main().catch((err) => {
  console.error("Omdøping feilet:", err);
  process.exit(1);
});
