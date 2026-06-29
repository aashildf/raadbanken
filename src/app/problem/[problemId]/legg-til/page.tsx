"use client";

import { use, useState, type FormEvent } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";

export default function AddRemedyPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = use(params);
  const router = useRouter();
  const uid = useAnonAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !uid) return;
    setSaving(true);
    setError(null);
    try {
      const ref = await addDoc(collection(db, "remedies"), {
        title: title.trim(),
        description: description.trim(),
        problemId,
        votesUp: 0,
        votesDown: 0,
        totalVotes: 0,
        successRate: 0,
        createdAt: serverTimestamp(),
      });
      router.push(`/remedy/${ref.id}`);
    } catch {
      setError("Noe gikk feil. Prøv igjen.");
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-8">
      <Link href={`/problem/${problemId}`} className="text-sm text-zinc-500">
        &larr; Tilbake
      </Link>
      <h1 className="text-2xl font-bold">Legg til nytt råd</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Råd</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="F.eks. Honning"
            className="rounded-lg border border-zinc-300 px-3 py-2"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Beskrivelse (valgfritt)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Hvordan brukes det?"
            rows={4}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving || !uid}
          className="rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          {saving ? "Lagrer..." : "Lagre råd"}
        </button>
      </form>
    </main>
  );
}
