// Delt knappe-stil, samme mønster som HEADER_BG i theme.ts: ett sted, ikke en
// classString kopiert inn i åtte filer som sakte kan gli fra hverandre (det
// er nøyaktig det som skjedde før denne — forsiden hadde fått en ny knapp-
// stil, resten av siden brukte fortsatt to eldre, ulike stiler). Alle
// primærknapper på siden (Del et råd/Del rådet/Godta/Les mer …) skal bruke
// PRIMARY-paret; se forsidens hero (src/app/page.tsx) for fasiten disse er
// hentet fra.
export const BUTTON_PRIMARY_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-xs font-normal uppercase tracking-[0.14em] text-[#f5efeb] transition-colors hover:brightness-110";

export const BUTTON_PRIMARY_STYLE = { background: "#5E684F" } as const;

// Sekundær/outline-variant — brukt ved siden av en primærknapp (som i hero),
// ikke alene. To fargesett: "dark" for tekst/knapp oppå foto eller den mørke
// navbaren, "light" for den vanlige lyse papirbunnen resten av siden bruker.
export const BUTTON_SECONDARY_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-xs font-normal uppercase tracking-[0.14em] transition-colors";

export const BUTTON_SECONDARY_STYLE_DARK = { border: "1px solid #91928C", color: "#f5efeb" } as const;

export const BUTTON_SECONDARY_STYLE_LIGHT = { border: "1px solid rgba(44,35,46,0.35)", color: "var(--ink)" } as const;
