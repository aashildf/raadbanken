"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { HEALTH_SUBCATEGORIES, TOP_CATEGORIES, slugify } from "@/lib/categories";
import type { Problem } from "@/lib/types";

const ANNET = "annet";

function DelRadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = useAnonAuth();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [topCategory, setTopCategory] = useState("helse");
  const [subcategoryId, setSubcategoryId] = useState(() => {
    const preselect = searchParams.get("problem");
    return (
      HEALTH_SUBCATEGORIES.find((s) => s.problemSlugs.includes(preselect ?? ""))?.id ??
      HEALTH_SUBCATEGORIES[0].id
    );
  });
  const [selectedProblemId, setSelectedProblemId] = useState(() => searchParams.get("problem") ?? "");
  const [customProblemName, setCustomProblemName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "problems"), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Problem, "id">) }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setProblems(list);
    });
    return unsub;
  }, []);

  const subcategory = useMemo(
    () => HEALTH_SUBCATEGORIES.find((s) => s.id === subcategoryId),
    [subcategoryId]
  );

  const problemsInSubcategory = useMemo(() => {
    if (!subcategory) return [];
    return problems.filter((p) => subcategory.problemSlugs.includes(p.slug));
  }, [problems, subcategory]);

  // Hvis hoved- eller underkategori er "Annet", finnes det ingen underliggende liste å
  // velge plage fra, så vi går rett på fritekstfeltet for plagen.
  const forceCustomProblem = topCategory === ANNET || subcategoryId === ANNET;

  // Den faktisk gjeldende plagen: brukerens eget valg om det fortsatt finnes i denne
  // underkategorien, ellers første plage i listen, ellers "Annet".
  const problemId = forceCustomProblem
    ? ANNET
    : selectedProblemId === ANNET || problemsInSubcategory.some((p) => p.id === selectedProblemId)
      ? selectedProblemId
      : problemsInSubcategory[0]?.id ?? ANNET;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !uid) return;
    if (problemId === ANNET && !customProblemName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      let finalProblemId = problemId;

      if (problemId === ANNET) {
        const name = customProblemName.trim();
        const existing = problems.find((p) => p.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          finalProblemId = existing.id;
        } else {
          const newProblem = await addDoc(collection(db, "problems"), {
            name,
            slug: slugify(name),
          });
          finalProblemId = newProblem.id;
        }
      }

      const ref = await addDoc(collection(db, "remedies"), {
        title: title.trim(),
        description: description.trim(),
        problemId: finalProblemId,
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
    <main className="relative min-h-full">
      <Image
        src="/bakgrunner/bg_purple.png"
        alt=""
        fill
        style={{ objectFit: "cover" }}
        priority
        aria-hidden="true"
      />
      <div className="relative mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-5 py-16">
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          &larr; Tilbake til Rådbanken
        </Link>

        <div>
          <p className="font-display text-xs uppercase tracking-[0.3em] text-plum-700">Del ditt råd</p>
          <h1 className="font-serif-display mt-3 text-3xl text-ink">Hva har funket for deg?</h1>
          <p className="mt-2 text-ink-soft">
            Del et husråd eller kjerringråd andre kan prøve. Beskriv det som en erfaring, ikke en
            medisinsk anbefaling.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="hairline flex flex-col gap-5 rounded-2xl bg-white/40 p-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Hovedkategori</span>
            <select
              value={topCategory}
              onChange={(e) => setTopCategory(e.target.value)}
              className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-plum-600"
            >
              {TOP_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} disabled={!c.enabled}>
                  {c.name} {!c.enabled && "(kommer snart)"}
                </option>
              ))}
              <option value={ANNET}>Annet (ikke i listen)</option>
            </select>
          </label>

          {topCategory !== ANNET && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Underkategori</span>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-plum-600"
              >
                {HEALTH_SUBCATEGORIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value={ANNET}>Annet (ikke i listen)</option>
              </select>
            </label>
          )}

          {!forceCustomProblem && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Hvilken plage gjelder rådet?</span>
              <select
                value={problemId}
                onChange={(e) => setSelectedProblemId(e.target.value)}
                className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-plum-600"
                required
              >
                {problemsInSubcategory.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                <option value={ANNET}>Annet (ikke i listen)</option>
              </select>
            </label>
          )}

          {problemId === ANNET && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Skriv inn plagen</span>
              <input
                value={customProblemName}
                onChange={(e) => setCustomProblemName(e.target.value)}
                placeholder="F.eks. Neseblod"
                className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-plum-600"
                required
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Råd</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="F.eks. Honning og varm melk"
              className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-plum-600"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Beskrivelse (valgfritt)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hvordan brukes det?"
              rows={4}
              className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-plum-600"
            />
          </label>

          {error && <p className="text-sm text-rust">{error}</p>}

          <button
            type="submit"
            disabled={saving || !uid || !problemId}
            className="rounded-xl bg-plum-800 px-4 py-3 font-medium text-paper transition-colors hover:bg-plum-700 disabled:opacity-50"
          >
            {saving ? "Lagrer..." : "Del rådet"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function DelRadPage() {
  return (
    <Suspense>
      <DelRadForm />
    </Suspense>
  );
}
