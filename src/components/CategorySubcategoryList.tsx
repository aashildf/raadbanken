import Link from "next/link";
import { HEALTH_SUBCATEGORIES } from "@/lib/categories";
import { Paper } from "@/components/Paper";
import { CATEGORY_ICON, IconArrowRight } from "@/components/icons";
import type { Problem } from "@/lib/types";

/** Åpen redaksjonell liste over en kategoris undergrupper + deres plager, brukt på
    både /kategori/[id] og /alle. Ikon vises kun der CATEGORY_ICON faktisk har en
    (i dag bare Helse-plager) — ingen tomme ikonplasser for de andre kategoriene. */
export function CategorySubcategoryList({
  topCategoryId,
  problems,
  headingTag: Heading = "h2",
  variant = "list",
  remedyCountByProblemId,
  query = "",
}: {
  topCategoryId: string;
  problems: Problem[];
  headingTag?: "h2" | "h3";
  /** "list" (default, /alle): rolig tekstliste, ingen kort-chrome.
      "cards" (/kategori/[id], KATEGORISIDE.md "Velg plage"): .scard-stil
      med ikonsirkel, antall råd per plage og søkefilter. */
  variant?: "list" | "cards";
  /** Kun brukt av "cards" — antall råd per plage-id, til "{n} råd". */
  remedyCountByProblemId?: Map<string, number>;
  /** Kun brukt av "cards" — filtrerer plagene på navn (case-insensitive). En
      undergruppe vises bare når minst én av plagene dens matcher. */
  query?: string;
}) {
  const subs = HEALTH_SUBCATEGORIES.filter((s) => s.topCategoryId === topCategoryId);
  const bySlug = new Map(problems.map((p) => [p.slug, p]));
  const q = query.trim().toLowerCase();

  if (variant === "cards") {
    const cards = subs
      .map((sub) => {
        const subProblems = sub.problemSlugs.map((s) => bySlug.get(s)).filter(Boolean) as Problem[];
        const matching = q ? subProblems.filter((p) => p.name.toLowerCase().includes(q)) : subProblems;
        return { sub, subProblems: matching };
      })
      .filter(({ subProblems }) => subProblems.length > 0);

    if (cards.length === 0) {
      return (
        <p className="text-sm" style={{ color: "#4a473f" }}>
          Ingen plager matcher søket.
        </p>
      );
    }

    return (
      <ul className="m-0 grid list-none gap-5 p-0" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,270px),1fr))" }}>
        {cards.map(({ sub, subProblems }) => {
          const Icon = CATEGORY_ICON[sub.problemSlugs[0]];
          return (
            <li key={sub.id} className="flex">
              <article className="relative flex flex-1 flex-col overflow-hidden rounded-[6px] bg-[#faf5ea] shadow-[inset_0_0_0_1px_#d4c9b3] transition-[background-color,box-shadow] duration-[600ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)] hover:bg-[#f0e5cf] hover:shadow-[inset_0_0_0_1px_#6d685c] focus-within:bg-[#f0e5cf] focus-within:shadow-[inset_0_0_0_1px_#6d685c]">
                <Paper id={`scard-${sub.id}`} variant="light" />
                <div className="relative z-10 flex flex-1 flex-col gap-3.5 px-[22px] pb-[18px] pt-6">
                  <h3 className="font-lora m-0 flex items-center gap-3 text-[22px] leading-[1.2] text-[#111110]">
                    {Icon && (
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: "#111110", color: "#efe6cf" }}>
                        <Icon className="h-5 w-5" />
                      </span>
                    )}
                    {sub.name}
                  </h3>
                  <ul className="m-0 flex list-none flex-col p-0">
                    {subProblems.map((p) => (
                      <li key={p.id} className="border-t border-[#e6d9bf] first:border-t-0">
                        <Link
                          href={`/problem/${p.id}`}
                          className="group -mx-1.5 flex min-h-11 items-center gap-2.5 rounded-[4px] px-1.5 text-[16px] font-medium no-underline transition-colors duration-[500ms] hover:bg-[#f0e5cf]"
                          style={{ color: "#111110" }}
                        >
                          <span className="flex-1">{p.name}</span>
                          {remedyCountByProblemId && (
                            <small className="text-[13px] font-medium" style={{ color: "#6f6553" }}>
                              {remedyCountByProblemId.get(p.id) ?? 0} råd
                            </small>
                          )}
                          <IconArrowRight className="h-3.5 w-3.5 shrink-0 text-[#a93415] transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)] group-hover:translate-x-1" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {subs.map((sub) => {
        const subProblems = sub.problemSlugs.map((s) => bySlug.get(s)).filter(Boolean) as Problem[];
        return (
          <div key={sub.id}>
            <Heading className="font-lora text-lg" style={{ color: "#111110" }}>
              {sub.name}
            </Heading>
            <div className="mt-2 flex flex-col items-start gap-1.5">
              {subProblems.map((p) => {
                const Icon = CATEGORY_ICON[p.slug];
                return (
                  <Link
                    key={p.id}
                    href={`/problem/${p.id}`}
                    className="group flex items-center gap-2 text-sm transition-colors hover:text-[#a93415]"
                    style={{ color: "#4a473f" }}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-[#6d685c]" />}
                    <span>{p.name}</span>
                    <IconArrowRight className="h-3 w-3 shrink-0 text-[#cdc6b4] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
