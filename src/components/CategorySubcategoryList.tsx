import Link from "next/link";
import { HEALTH_SUBCATEGORIES } from "@/lib/categories";
import { CATEGORY_ICON } from "@/components/icons";
import type { Problem } from "@/lib/types";

/** Åpen redaksjonell liste over en kategoris undergrupper + deres plager, brukt på
    både /kategori/[id] og /alle. Ikon vises kun der CATEGORY_ICON faktisk har en
    (i dag bare Helse-plager) — ingen tomme ikonplasser for de andre kategoriene. */
export function CategorySubcategoryList({
  topCategoryId,
  problems,
  headingTag: Heading = "h2",
}: {
  topCategoryId: string;
  problems: Problem[];
  headingTag?: "h2" | "h3";
}) {
  const subs = HEALTH_SUBCATEGORIES.filter((s) => s.topCategoryId === topCategoryId);
  const bySlug = new Map(problems.map((p) => [p.slug, p]));

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
      {subs.map((sub) => {
        const subProblems = sub.problemSlugs.map((s) => bySlug.get(s)).filter(Boolean) as Problem[];
        return (
          <div key={sub.id}>
            <Heading className="font-serif-display text-lg text-ink">{sub.name}</Heading>
            <div className="mt-2 flex flex-col items-start gap-1.5">
              {subProblems.map((p) => {
                const Icon = CATEGORY_ICON[p.slug];
                return (
                  <Link
                    key={p.id}
                    href={`/problem/${p.id}`}
                    className="group flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-plum-700"
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-plum-700/70" />}
                    <span>{p.name}</span>
                    <span className="text-ink/30 transition-transform group-hover:translate-x-0.5">→</span>
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
