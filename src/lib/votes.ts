import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Remedy } from "@/lib/types";

export async function castVote(
  remedyId: string,
  uid: string,
  voteType: "up" | "down",
  comment: string
) {
  const voteRef = doc(db, "votes", `${remedyId}_${uid}`);
  const remedyRef = doc(db, "remedies", remedyId);

  await runTransaction(db, async (tx) => {
    const [voteSnap, remedySnap] = await Promise.all([tx.get(voteRef), tx.get(remedyRef)]);
    if (!remedySnap.exists()) throw new Error("Rådet finnes ikke");

    const remedy = remedySnap.data() as Remedy;
    let votesUp = remedy.votesUp ?? 0;
    let votesDown = remedy.votesDown ?? 0;

    if (voteSnap.exists()) {
      const prevType = voteSnap.data().voteType as "up" | "down";
      if (prevType === "up") votesUp -= 1;
      else votesDown -= 1;
    }

    if (voteType === "up") votesUp += 1;
    else votesDown += 1;

    const totalVotes = votesUp + votesDown;
    const successRate = totalVotes > 0 ? Math.round((votesUp / totalVotes) * 100) : 0;

    tx.set(voteRef, {
      remedyId,
      userId: uid,
      voteType,
      comment: comment.trim() || null,
      createdAt: serverTimestamp(),
    });

    tx.update(remedyRef, { votesUp, votesDown, totalVotes, successRate });
  });
}
