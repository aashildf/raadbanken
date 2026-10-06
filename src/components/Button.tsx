import Link from "next/link";
import { useId } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Paper } from "@/components/Paper";

// Delt knappe-stil — ett sted, ikke en classString kopiert inn i ni filer som
// sakte kan gli fra hverandre (det er nøyaktig det som skjedde: forsiden
// hadde fått en ny knappe-stil, resten av siden brukte fortsatt to eldre,
// ulike stiler). Alle primærknapper (Del et råd/Del rådet/Godta/Les mer …)
// bruker <PrimaryButton>; se forsidens hero (src/app/page.tsx) for fasiten
// denne er hentet fra.
//
// Firkantet (radius 2px) med hjørnekrøller, etter redesign-pakken
// (design/design_handoff_radbanken_forside/README.md, avsnittet "Knapper").
// Siden denne komponenten er delt, gjelder den nye stilen med én gang på
// hele siten, ikke bare forsiden — det er tilsiktet (README beskriver "ett
// knappe-system"), men verdt å vite siden forsiden er det eneste stedet
// resten av redesignet er rullet ut foreløpig.
// bg-* som Tailwind-klasse, ikke inline style — en inline bakgrunnsfarge har
// høyere spesifisitet enn hover:bg-klassen og vinner alltid over den, så
// hover ville gjort synlig ingenting (samme fallgruve som er beskrevet ved
// SecondaryButton under).
const PRIMARY_BASE =
  "relative isolate inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-[2px] bg-[#6f7d61] px-[31px] py-[17px] font-figtree text-xs font-semibold uppercase tracking-[0.2em] leading-none text-[#f5eee0] transition-colors delay-[60ms] duration-[550ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)] hover:bg-[#566349]";

// Papirtekstur.md, tabellen: "Primærknapper: dark (uten flekker) inni
// knappen, tekst z-index:1". useId gir hvert knappe-instans sin egen,
// stabile id — filter-id-er må være unike per papirtekstur.md regel 5.

// Hjørnemarkering — presisert av redesign-pakken etter første runde: IKKE
// krøller, men to vinkelrette, nøstede L-former (skarpe hjørner, miter/
// square), 3px inn fra kanten. Nede-til-høyre er samme form speilet
// (scale(-1,-1), tilsvarer rotate-180). Samme pynt på alle
// knappevariantene, kun strek-farge varierer (satt av className utenfra).
export function CornerFlourish({ className }: { className?: string }) {
  const corner = (
    <path
      d="M1 11V1H11M4 11V4H11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  );
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className={`pointer-events-none absolute left-[3px] top-[3px] z-10 h-[11px] w-[11px] ${className ?? ""}`}
      >
        {corner}
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className={`pointer-events-none absolute bottom-[3px] right-[3px] z-10 h-[11px] w-[11px] rotate-180 ${className ?? ""}`}
      >
        {corner}
      </svg>
    </>
  );
}

type PrimaryButtonProps = {
  children: ReactNode;
  className?: string;
};

type PrimaryLinkProps = PrimaryButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href"> & { href: string };

type PrimaryNativeButtonProps = PrimaryButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { href?: undefined };

export function PrimaryButton(props: PrimaryLinkProps | PrimaryNativeButtonProps) {
  const { children, className = "" } = props;
  const id = useId();
  const content = (
    <>
      <Paper id={`btn-primary-${id}`} variant="dark" mottle={false} />
      <CornerFlourish className="text-[rgba(245,238,224,0.75)]" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, className: _c, children: _ch, style, ...rest } = props;
    return (
      <Link href={href} className={`${PRIMARY_BASE} ${className}`} style={style} {...rest}>
        {content}
      </Link>
    );
  }

  const { className: _c2, children: _ch2, href: _h, style, ...rest } = props as PrimaryNativeButtonProps;
  return (
    <button className={`${PRIMARY_BASE} ${className}`} style={style} {...rest}>
      {content}
    </button>
  );
}

// Sekundær/outline-variant — brukt ved siden av en primærknapp (som i hero),
// ikke alene. "dark" (oppå foto/den mørke navbaren): transparent med
// champagne kontur+tekst i hvile, fylles champagne ved hover (teksten blir
// mørk, derav text-stroke — tynn mørk tekst mot en lys bunn ser ellers
// tyngre ut enn den skal). "terracotta" (f.eks. nederste CTA): samme idé i
// terrakotta. "light" (vanlig papirbunn) er uendret fra før.
const SECONDARY_BASE =
  "group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-[2px] px-[31px] py-[17px] font-figtree text-xs font-semibold uppercase tracking-[0.2em] leading-none transition-colors delay-[60ms] duration-[550ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)]";

const SECONDARY_TONE_CLASS = {
  dark: "border border-[#e6dcc0] text-[#efe6cf] hover:bg-[#efe6cf] hover:text-[#152318] hover:[-webkit-text-stroke:0.35px]",
  terracotta: "border border-[#8a5c47] text-[#8a5c47] hover:bg-[#8a5c47] hover:text-[#f5eee0]",
  light: "border border-[rgba(44,35,46,0.35)] text-ink hover:bg-[rgba(44,35,46,0.06)]",
} as const;

// Papirtekstur.md, tabellen: "Sekundærknapper: light (uten flekker),
// opacity:0 i hvile → 1 ved hover".
function SecondaryGrain({ id }: { id: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[550ms] group-hover:opacity-100"
    >
      <Paper id={id} variant="light" mottle={false} />
    </span>
  );
}

type SecondaryButtonProps = {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof SECONDARY_TONE_CLASS;
};

type SecondaryLinkProps = SecondaryButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href"> & { href: string };

type SecondaryNativeButtonProps = SecondaryButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { href?: undefined };

export function SecondaryButton(props: SecondaryLinkProps | SecondaryNativeButtonProps) {
  const { children, className = "", tone = "dark" } = props;
  const id = useId();
  const content = (
    <>
      {tone !== "light" && <SecondaryGrain id={`btn-secondary-${id}`} />}
      <CornerFlourish className="text-current transition-colors duration-[550ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)]" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );
  const classes = `${SECONDARY_BASE} ${SECONDARY_TONE_CLASS[tone]} ${className}`;

  if ("href" in props && props.href !== undefined) {
    const { href, className: _c, children: _ch, tone: _t, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  const { className: _c2, children: _ch2, href: _h, tone: _t2, ...rest } = props as SecondaryNativeButtonProps;
  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  );
}
