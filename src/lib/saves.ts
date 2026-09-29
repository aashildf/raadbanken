import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function setSaved(remedyId: string, uid: string, saved: boolean) {
  const ref = doc(db, "saves", `${remedyId}_${uid}`);
  if (saved) {
    await setDoc(ref, { remedyId, userId: uid, createdAt: serverTimestamp() });
  } else {
    await deleteDoc(ref);
  }
}
