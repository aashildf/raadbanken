import type { Remedy } from "@/lib/types";

// Felles for RAVN-seksjonene (design_handoff_ravn_trinnvis). Ikonene finnes
// bare for de tre kategoriene Rådbanken faktisk har — kopiert fra
// handoffens uploads/ (Helse.svg, Hus_og_hjem_1.svg, Mat_og_konservering.svg).
const ICONS: Record<string, string> = {
  helseogvelvare: "/ravn/icons/helseogvelvare.svg",
  husoghjem: "/ravn/icons/husoghjem.svg",
  matkonservering: "/ravn/icons/matkonservering.svg",
};

export function ravnIcon(categoryId: string | null | undefined) {
  return categoryId ? ICONS[categoryId] ?? null : null;
}

/** Folkets dom = round(opp / (opp + ned) × 100). */
export function folketsDom(r: Pick<Remedy, "votesUp" | "totalVotes">) {
  return r.totalVotes > 0 ? Math.round((r.votesUp / r.totalVotes) * 100) : 0;
}

export function fmt(n: number) {
  return n.toLocaleString("nb-NO");
}

export function UpIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style={{ fill: "currentColor" }}>
      <path d="M12 5l7 8h-4.5v6h-5v-6H5Z" />
    </svg>
  );
}

export function DownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style={{ fill: "currentColor" }}>
      <path d="M12 19l-7-8h4.5V5h5v6H19Z" />
    </svg>
  );
}

export function ArrowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" }}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export const HEALTH_NOTE =
  "Folkets dom bygger på brukernes egne erfaringer. Den er ikke medisinsk vurdering. Ved vedvarende eller alvorlige plager, kontakt lege.";
