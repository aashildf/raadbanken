"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAnonAuth } from "@/lib/useAnonAuth";
import { useProfile } from "@/lib/useProfile";
import { HEALTH_SUBCATEGORIES, TOP_CATEGORIES, slugify } from "@/lib/categories";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import { Paper } from "@/components/Paper";
import { IconUpload, IconCheck, IconX, IconPlus } from "@/components/icons";
import type { Problem } from "@/lib/types";

const ANNET = "annet";
const DESC_MAX = 280;
const DRAFT_KEY = "radbanken_del_rad_utkast";

// "Et godt råd er …" — design/design_handoff_radbanken_forside/
// fasit/mal-skjema-dybde.html, aside-boksen. Statisk redaksjonell
// veiledning, ikke avhengig av ekte data.
const GOOD_REMEDY_POINTS = [
  { b: "Konkret", t: "hva gjør man, steg for steg." },
  { b: "Ærlig", t: "hva det hjelper mot, og hva det ikke gjør." },
  { b: "Trygt", t: "ingen farlige mengder eller kombinasjoner." },
  { b: "Ditt eget", t: "skrevet med egne ord." },
];

// "Hva skjer etterpå?" i fasiten beskriver en redaksjon som leser gjennom
// råd før publisering — det finnes ikke her (handleSubmit under skriver
// rett til Firestore og rådet er synlig med én gang). Disse to stegene
// beskriver hva som faktisk skjer, i stedet for å love en gjennomgang som
// ikke finnes.
const WHAT_HAPPENS_STEPS = [
  "Rådet blir synlig i arkivet med én gang.",
  "Andre kan stemme på det og dele egne erfaringer under det.",
];

const SOURCE_OPTIONS = ["Familie", "Venner og naboer", "Bok eller arkiv", "Selvlært", "Annet"];

const inpClass =
  "w-full min-h-[52px] rounded-[2px] bg-[#fffaf0] px-4 py-3.5 font-figtree text-base text-[#111110] shadow-[inset_0_0_0_1px_#cdc6b4] outline-none transition-[box-shadow,background-color] duration-300 placeholder:text-[#6d685c] hover:shadow-[inset_0_0_0_1px_#6d685c] focus:bg-white";
const inpErrorClass = "shadow-[inset_0_0_0_1.5px_#a93415] bg-[#fcf4ec]";
const labelClass = "font-figtree text-[15px] font-semibold text-[#111110]";
const helpClass = "m-0 text-[13px] leading-[1.45] text-[#4a473f]";
const SELECT_CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238a5c47' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\") no-repeat right 16px center/16px";
const selectStyle = { appearance: "none" as const, background: `#fffaf0 ${SELECT_CHEVRON}` };

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 flex items-center gap-2 text-[13px] font-medium text-[#7a3f2a]">
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#6d685c" }} />
      {children}
    </p>
  );
}

function FieldsetLegend({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <legend className="mb-1.5 flex items-center gap-3.5 font-lora text-[clamp(16px,1.3vw,19px)] font-medium uppercase tracking-[0.16em]" style={{ color: "#6d685c" }}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-lora text-[15px] normal-case tracking-normal" style={{ boxShadow: "inset 0 0 0 1px #6d685c" }}>
        {n}
      </span>
      {children}
    </legend>
  );
}

function Checkbox({
  checked,
  onChange,
  hasError,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  hasError?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-[1.5]" style={{ color: "#111110" }}>
      <span
        className="relative mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[2px]"
        style={{
          background: checked ? "#111110" : "#fffaf0",
          boxShadow: hasError ? "inset 0 0 0 1.5px #a93415" : checked ? "none" : "inset 0 0 0 1px #6d685c",
        }}
      >
        {checked && <IconCheck className="h-[13px] w-[13px] text-[#f5eee0]" />}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span>{children}</span>
    </label>
  );
}

type Draft = {
  title: string;
  description: string;
  need: string;
  steps: string[];
  source: string;
  topCategory: string;
  subcategoryId: string;
  selectedProblemId: string;
  customProblemName: string;
  authorName: string;
  anonymous: boolean;
};

function loadDraft(): Partial<Draft> | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<Draft>) : null;
  } catch {
    return null;
  }
}

function DelRadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = useAnonAuth();
  const { displayName } = useProfile();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [topCategory, setTopCategory] = useState("helseogvelvare");
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
  const [need, setNeed] = useState("");
  const [steps, setSteps] = useState<string[]>(["", ""]);
  const [source, setSource] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const nameTouched = useRef(false);

  // Fyller "Navn" med det lagrede visningsnavnet (samme ett som navbaren
  // viser når man er "logget inn", se useProfile) i stedet for et tomt
  // felt — rører den ikke hvis brukeren allerede har skrevet noe selv.
  useEffect(() => {
    if (displayName && !nameTouched.current) setAuthorName(displayName);
  }, [displayName]);

  // Utkast — ekte, men bare lokalt i nettleseren (ingen draft-lagring i
  // Firestore finnes). Lastes én gang ved åpning.
  useEffect(() => {
    const draft = loadDraft();
    if (!draft) return;
    if (draft.title) setTitle(draft.title);
    if (draft.description) setDescription(draft.description);
    if (draft.need) setNeed(draft.need);
    if (draft.steps && draft.steps.length > 0) setSteps(draft.steps);
    if (draft.source) setSource(draft.source);
    if (draft.topCategory) setTopCategory(draft.topCategory);
    if (draft.subcategoryId) setSubcategoryId(draft.subcategoryId);
    if (draft.selectedProblemId) setSelectedProblemId(draft.selectedProblemId);
    if (draft.customProblemName) setCustomProblemName(draft.customProblemName);
    if (draft.authorName) {
      setAuthorName(draft.authorName);
      nameTouched.current = true;
    }
    if (draft.anonymous) setAnonymous(draft.anonymous);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "problems"), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Problem, "id">) }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setProblems(list);
    });
    return unsub;
  }, []);

  const subcategoriesForTopCategory = useMemo(
    () => HEALTH_SUBCATEGORIES.filter((s) => s.topCategoryId === topCategory),
    [topCategory]
  );

  const subcategory = useMemo(
    () => HEALTH_SUBCATEGORIES.find((s) => s.id === subcategoryId),
    [subcategoryId]
  );

  const problemsInSubcategory = useMemo(() => {
    if (!subcategory) return [];
    return problems.filter((p) => subcategory.problemSlugs.includes(p.slug));
  }, [problems, subcategory]);

  const forceCustomProblem = topCategory === ANNET || subcategoryId === ANNET;

  const problemId = forceCustomProblem
    ? ANNET
    : selectedProblemId === ANNET || problemsInSubcategory.some((p) => p.id === selectedProblemId)
      ? selectedProblemId
      : problemsInSubcategory[0]?.id ?? ANNET;

  const titleError = submitAttempted && !title.trim();
  const descriptionError = submitAttempted && !description.trim();
  const problemError = submitAttempted && problemId === ANNET && !customProblemName.trim();
  const confirmError = submitAttempted && !confirmed;

  function saveDraft() {
    const draft: Draft = {
      title,
      description,
      need,
      steps,
      source,
      topCategory,
      subcategoryId,
      selectedProblemId,
      customProblemName,
      authorName,
      anonymous,
    };
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setStatusMessage("Utkast lagret i denne nettleseren.");
    } catch {
      setStatusMessage("Kunne ikke lagre utkastet.");
    }
  }

  function renumberSteps(list: string[]) {
    setSteps(list.length > 0 ? list : [""]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    setStatusMessage("");
    const hasError = !title.trim() || !description.trim() || (problemId === ANNET && !customProblemName.trim()) || !confirmed;
    if (hasError || !uid) return;

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

      const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);
      const cleanNeed = need
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const ref = await addDoc(collection(db, "remedies"), {
        title: title.trim(),
        description: description.trim(),
        problemId: finalProblemId,
        votesUp: 0,
        votesDown: 0,
        totalVotes: 0,
        successRate: 0,
        createdAt: serverTimestamp(),
        ...(cleanNeed.length > 0 && { need: cleanNeed }),
        ...(cleanSteps.length > 0 && { steps: cleanSteps }),
        ...(source && { source }),
        ...(!anonymous && authorName.trim() && { authorName: authorName.trim() }),
        anonymous,
      });

      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignorert
      }
      router.push(`/remedy/${ref.id}`);
    } catch {
      setError("Noe gikk feil. Prøv igjen.");
      setSaving(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen flex-col"
      style={{ background: "#efe6cf", "--focus-ring": "#a93415" } as React.CSSProperties}
    >
      {/* Sidehode — samme mørke .phead-mønster som resten av siten, ingen
          ikonboks her (fasiten har ingen for skjema-siden; det er en
          handling, ikke en kategori). */}
      <header className="relative overflow-hidden" style={{ background: "#111110" }}>
        <Paper id="delrad-head" variant="dark" mottle={false} />
        <div
          className="relative z-10 mx-auto flex flex-col gap-4"
          style={{ maxWidth: 1480, paddingInline: "clamp(20px,3vw,40px)", paddingBlock: "56px 60px" }}
        >
          <ol className="m-0 flex flex-wrap gap-2 p-0 text-[13px]" style={{ color: "#cdc6b4" }} aria-label="Brødsmuler">
            <li>
              <Link href="/" className="transition-colors hover:text-[#a93415]">
                Forside
              </Link>
            </li>
            <li aria-current="page" className="before:mr-2 before:content-['/'] before:text-[#6d685c]" style={{ color: "#f5eee0" }}>
              Del et råd
            </li>
          </ol>
          <div className="flex flex-col gap-1.5">
            <p className="font-lora m-0 text-[clamp(16px,1.4vw,20px)] font-medium uppercase leading-[1.2] tracking-[0.16em]" style={{ color: "#d4c9b3" }}>
              Del et råd
            </p>
            <h1 className="font-lora m-0 text-[clamp(34px,3.6vw,52px)] leading-[1.08] text-balance" style={{ color: "#f5eee0" }}>
              Gi et råd videre
            </h1>
          </div>
          <p className="m-0 max-w-[62ch] text-[clamp(17px,1.3vw,19px)] leading-[1.55] text-pretty" style={{ color: "#d9d2c1" }}>
            Noe du har lært av en forelder, en nabo eller funnet ut selv? Fyll ut skjemaet, så blir rådet lagt
            til i arkivet med én gang.
          </p>
        </div>
      </header>

      <section className="relative overflow-hidden flex-1" style={{ background: "#f5eee0" }}>
        <Paper id="delrad-form" variant="light" />
        <div
          className="relative z-10 mx-auto grid grid-cols-1 items-start gap-x-[clamp(32px,5vw,80px)] gap-y-10 min-[961px]:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]"
          style={{ maxWidth: 1480, paddingInline: "clamp(20px,3vw,40px)", paddingBlock: "48px 88px" }}
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            className="relative max-w-[860px] rounded-[6px] p-1.5"
            style={{ background: "#faf5ea", boxShadow: "inset 0 0 0 1.5px #6d685c" }}
          >
            <div
              className="flex flex-col gap-11 rounded-[2px]"
              style={{ padding: "clamp(44px,4vw,56px) clamp(40px,4vw,56px)", boxShadow: "inset 0 0 0 1px rgba(138,92,71,.55)" }}
            >
              <fieldset className="m-0 flex min-w-0 flex-col gap-[22px] border-0 p-0">
                <FieldsetLegend n={1}>Om rådet</FieldsetLegend>

                <div className="flex flex-col gap-2">
                  <label htmlFor="f-title" className={labelClass}>
                    Tittel<span className="ml-0.5 text-[#6d685c]">*</span>
                  </label>
                  <p className={helpClass}>Kort og konkret, hva gjør man, og mot hva?</p>
                  <input
                    id="f-title"
                    className={`${inpClass} ${titleError ? inpErrorClass : ""}`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Honning og ingefær mot sår hals"
                  />
                  {titleError && <FieldError>Gi rådet en tittel.</FieldError>}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="f-topcat" className={labelClass}>
                      Hovedkategori
                    </label>
                    <select
                      id="f-topcat"
                      value={topCategory}
                      onChange={(e) => {
                        const next = e.target.value;
                        setTopCategory(next);
                        const firstSub = HEALTH_SUBCATEGORIES.find((s) => s.topCategoryId === next);
                        setSubcategoryId(firstSub?.id ?? ANNET);
                        setSelectedProblemId("");
                      }}
                      className={`${inpClass} cursor-pointer pr-11`}
                      style={selectStyle}
                    >
                      {TOP_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id} disabled={!c.enabled}>
                          {c.name} {!c.enabled && "(kommer snart)"}
                        </option>
                      ))}
                      <option value={ANNET}>Annet (ikke i listen)</option>
                    </select>
                  </div>

                  {topCategory !== ANNET && (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="f-subcat" className={labelClass}>
                        Underkategori
                      </label>
                      <select
                        id="f-subcat"
                        value={subcategoryId}
                        onChange={(e) => {
                          setSubcategoryId(e.target.value);
                          setSelectedProblemId("");
                        }}
                        className={`${inpClass} cursor-pointer pr-11`}
                        style={selectStyle}
                      >
                        {subcategoriesForTopCategory.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                        <option value={ANNET}>Annet (ikke i listen)</option>
                      </select>
                    </div>
                  )}
                </div>

                {!forceCustomProblem && (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="f-problem" className={labelClass}>
                      Hvilken plage gjelder rådet?
                    </label>
                    <select
                      id="f-problem"
                      value={problemId}
                      onChange={(e) => setSelectedProblemId(e.target.value)}
                      className={`${inpClass} cursor-pointer pr-11`}
                      style={selectStyle}
                    >
                      {problemsInSubcategory.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                      <option value={ANNET}>Annet (ikke i listen)</option>
                    </select>
                  </div>
                )}

                {problemId === ANNET && (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="f-customproblem" className={labelClass}>
                      Skriv inn plagen<span className="ml-0.5 text-[#6d685c]">*</span>
                    </label>
                    <input
                      id="f-customproblem"
                      className={`${inpClass} ${problemError ? inpErrorClass : ""}`}
                      value={customProblemName}
                      onChange={(e) => setCustomProblemName(e.target.value)}
                      placeholder="F.eks. Neseblod"
                    />
                    {problemError && <FieldError>Skriv inn hvilken plage rådet gjelder.</FieldError>}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="f-desc" className={labelClass}>
                    Kort beskrivelse<span className="ml-0.5 text-[#6d685c]">*</span>
                  </label>
                  <p className={helpClass}>Vises på rådkortet og i forhåndsvisningen.</p>
                  <textarea
                    id="f-desc"
                    rows={3}
                    maxLength={DESC_MAX}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Hva er rådet, og hvorfor fungerer det?"
                    className={`${inpClass} min-h-[132px] resize-y leading-[1.55] ${descriptionError ? inpErrorClass : ""}`}
                  />
                  <span className="self-end text-[12px] tabular-nums" style={{ color: "#6d685c" }}>
                    {description.length} / {DESC_MAX}
                  </span>
                  {descriptionError && <FieldError>Skriv en kort beskrivelse.</FieldError>}
                </div>
              </fieldset>

              <fieldset className="m-0 flex min-w-0 flex-col gap-[22px] border-0 p-0">
                <FieldsetLegend n={2}>Slik gjør du</FieldsetLegend>

                <div className="flex flex-col gap-2">
                  <label htmlFor="f-need" className={labelClass}>
                    Du trenger
                  </label>
                  <p className={helpClass}>Én ting per linje.</p>
                  <textarea
                    id="f-need"
                    rows={3}
                    value={need}
                    onChange={(e) => setNeed(e.target.value)}
                    placeholder={"Fersk ingefær\n1 ts honning\nEn kopp vann"}
                    className={`${inpClass} min-h-[88px] resize-y leading-[1.55]`}
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className={labelClass}>Steg for steg</span>
                  <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {steps.map((step, i) => (
                      <li key={i} className="grid items-center gap-2.5" style={{ gridTemplateColumns: "36px minmax(0,1fr) 44px" }}>
                        <span aria-hidden className="text-center font-lora text-2xl" style={{ color: "#6d685c" }}>
                          {i + 1}
                        </span>
                        <input
                          value={step}
                          onChange={(e) => {
                            const next = [...steps];
                            next[i] = e.target.value;
                            setSteps(next);
                          }}
                          aria-label={`Steg ${i + 1}`}
                          placeholder={i === 0 ? "F.eks. Riv ingefæren fint" : ""}
                          className={inpClass}
                        />
                        <button
                          type="button"
                          onClick={() => renumberSteps(steps.filter((_, idx) => idx !== i))}
                          disabled={steps.length <= 1}
                          aria-label={`Fjern steg ${i + 1}`}
                          className="grid h-11 w-11 place-items-center rounded-[2px] transition-colors disabled:opacity-30"
                          style={{ color: "#6d685c" }}
                        >
                          <IconX className="h-[18px] w-[18px]" />
                        </button>
                      </li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    onClick={() => setSteps([...steps, ""])}
                    className="inline-flex w-fit items-center gap-2 border-b border-transparent pb-0.5 font-figtree text-sm font-semibold transition-colors hover:border-current"
                    style={{ color: "#a93415" }}
                  >
                    <IconPlus className="h-4 w-4" />
                    Legg til steg
                  </button>
                </div>
              </fieldset>

              <fieldset className="m-0 flex min-w-0 flex-col gap-[22px] border-0 p-0">
                <FieldsetLegend n={3}>
                  Bilde <em className="ml-1 font-figtree text-sm font-normal normal-case tracking-normal" style={{ color: "#4a473f" }}>(valgfritt)</em>
                </FieldsetLegend>
                <label
                  className="relative flex min-h-[170px] flex-col items-center justify-center gap-2 rounded-[6px] border-[1.5px] border-dashed p-6 text-center transition-colors"
                  style={{ borderColor: dragOver ? "#a93415" : "#cdc6b4", background: dragOver ? "#fff" : "#fffaf0" }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files[0];
                    if (f) setImageFile(f);
                  }}
                >
                  <IconUpload className="h-7 w-7 text-[#6d685c]" />
                  <b className="text-[15px]" style={{ color: "#111110" }}>
                    {imageFile ? `Valgt: ${imageFile.name}` : "Dra et bilde hit, eller velg fil"}
                  </b>
                  <span className="text-[13px]" style={{ color: "#4a473f" }}>
                    JPG eller PNG, maks 10 MB. Gjerne tatt i dagslys.
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    aria-label="Last opp bilde"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </fieldset>

              <fieldset className="m-0 flex min-w-0 flex-col gap-[22px] border-0 p-0">
                <FieldsetLegend n={4}>Hvor kommer rådet fra?</FieldsetLegend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Hvor kommer rådet fra">
                  {SOURCE_OPTIONS.map((opt) => {
                    const checked = source === opt;
                    return (
                      <label key={opt} className="relative">
                        <input
                          type="radio"
                          name="src"
                          checked={checked}
                          onChange={() => setSource(opt)}
                          className="sr-only"
                        />
                        <span
                          className="inline-flex min-h-11 cursor-pointer items-center rounded-[2px] px-4 font-figtree text-sm font-semibold transition-colors"
                          style={{
                            boxShadow: checked ? "inset 0 0 0 1px #111110" : "inset 0 0 0 1px #cdc6b4",
                            background: checked ? "#111110" : "transparent",
                            color: checked ? "#f5eee0" : "#111110",
                          }}
                        >
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="m-0 flex min-w-0 flex-col gap-[22px] border-0 p-0">
                <FieldsetLegend n={5}>Om deg</FieldsetLegend>
                <div className="flex flex-col gap-2">
                  <label htmlFor="f-name" className={labelClass}>
                    Navn
                  </label>
                  <p className={helpClass}>Vises sammen med rådet, med mindre du velger å være anonym.</p>
                  <input
                    id="f-name"
                    autoComplete="name"
                    value={authorName}
                    onChange={(e) => {
                      nameTouched.current = true;
                      setAuthorName(e.target.value);
                    }}
                    placeholder="Fornavn og sted, f.eks. Kari, Trondheim"
                    className={inpClass}
                  />
                </div>
                <Checkbox checked={anonymous} onChange={setAnonymous}>
                  Publiser anonymt
                </Checkbox>
                <div className="flex flex-col gap-2">
                  <Checkbox checked={confirmed} onChange={setConfirmed} hasError={confirmError}>
                    Jeg bekrefter at rådet er trygt å dele, og at jeg har rett til å dele eventuelle bilder.
                    <span className="ml-0.5 text-[#6d685c]">*</span>
                  </Checkbox>
                  {confirmError && <FieldError>Du må bekrefte før du sender inn.</FieldError>}
                </div>
              </fieldset>

              <div className="flex flex-wrap items-center gap-3 border-t pt-7" style={{ borderColor: "#d9d2c1" }}>
                <PrimaryButton type="submit" disabled={saving || !uid}>
                  {saving ? "Sender…" : "Send inn rådet"}
                </PrimaryButton>
                <SecondaryButton type="button" tone="olive" onClick={saveDraft}>
                  Lagre utkast
                </SecondaryButton>
                {(statusMessage || error) && (
                  <p className="m-0 basis-full text-[15px] font-semibold" style={{ color: error ? "#a8432f" : "#4a473f" }} role="status" aria-live="polite">
                    {error || statusMessage}
                  </p>
                )}
              </div>
            </div>
          </form>

          <aside className="flex flex-col gap-7 min-[961px]:sticky" style={{ top: 100 }} aria-label="Tips">
            <div className="relative rounded-[6px] p-1.5" style={{ boxShadow: "inset 0 0 0 1.5px #6d685c" }}>
              <div className="flex flex-col gap-2.5 rounded-[2px]" style={{ padding: "44px 46px 40px", boxShadow: "inset 0 0 0 1px rgba(166,118,40,.5)" }}>
                <h2 className="font-lora m-0 text-[clamp(16px,1.3vw,19px)] font-medium uppercase tracking-[0.16em]" style={{ color: "#6d685c" }}>
                  Et godt råd er …
                </h2>
                <ul className="m-0 flex list-none flex-col p-0">
                  {GOOD_REMEDY_POINTS.map((item) => (
                    <li key={item.b} className="flex items-start gap-3 border-b py-2.5 text-[15px] leading-[1.5] last:border-b-0" style={{ borderColor: "#d9d2c1" }}>
                      <IconCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#6d685c]" />
                      <span>
                        <b>{item.b}</b>, {item.t}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-lora m-0 text-[clamp(16px,1.3vw,19px)] font-medium uppercase tracking-[0.16em]" style={{ color: "#6d685c" }}>
                Hva skjer etterpå?
              </h2>
              <ol className="m-0 flex list-none flex-col p-0">
                {WHAT_HAPPENS_STEPS.map((text, i) => (
                  <li
                    key={text}
                    className="grid items-baseline gap-2.5 border-b py-2.5 text-[16px] leading-[1.6] last:border-b-0"
                    style={{ gridTemplateColumns: "30px minmax(0,1fr)", borderColor: "#d9d2c1", color: "#111110" }}
                  >
                    <span aria-hidden className="text-center font-lora text-2xl" style={{ color: "#6d685c" }}>
                      {i + 1}
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="m-0 rounded-[2px] px-[18px] py-3.5 text-sm leading-[1.5]" style={{ background: "#f7efe3", boxShadow: "inset 0 0 0 1px #d4c9b3", color: "#4a3a2a" }}>
              Helseråd erstatter aldri legehjelp. Del aldri farlige mengder eller kombinasjoner.
            </p>
          </aside>
        </div>
      </section>
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
