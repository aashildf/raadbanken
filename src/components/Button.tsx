import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { GRAIN_BG } from "@/components/GrainOverlay";

// Delt knappe-stil — ett sted, ikke en classString kopiert inn i ni filer som
// sakte kan gli fra hverandre (det er nøyaktig det som skjedde: forsiden
// hadde fått en ny knappe-stil, resten av siden brukte fortsatt to eldre,
// ulike stiler). Alle primærknapper (Del et råd/Del rådet/Godta/Les mer …)
// bruker <PrimaryButton>; se forsidens hero (src/app/page.tsx) for fasiten
// denne er hentet fra.
//
// PrimaryButton legger korn direkte på selve knappe-flaten (samme GRAIN_BG
// som navbaren/hero-fotoet), fordi en helt jevn, blank fylt flate stikker seg
// ut nettopp fordi alt annet på siden (navbar, hero, dropdown) har den samme
// papirteksturen — se navbarens eget grain-lag for samme resonnement rundt
// mørke/fargede flater der det globale (multiply) kornet blir usynlig.
const PRIMARY_BASE =
  "relative isolate inline-flex items-center justify-center overflow-hidden rounded-lg px-6 py-2.5 text-xs font-normal uppercase tracking-[0.14em] text-[#f5efeb] transition-colors hover:brightness-110";

const PRIMARY_STYLE = { background: "#5E684F" } as const;

function PrimaryGrain() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: GRAIN_BG, opacity: 0.35 }}
    />
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
  const content = (
    <>
      <PrimaryGrain />
      <span className="relative flex items-center gap-2">{children}</span>
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, className: _c, children: _ch, style, ...rest } = props;
    return (
      <Link href={href} className={`${PRIMARY_BASE} ${className}`} style={{ ...PRIMARY_STYLE, ...style }} {...rest}>
        {content}
      </Link>
    );
  }

  const { className: _c2, children: _ch2, href: _h, style, ...rest } = props as PrimaryNativeButtonProps;
  return (
    <button className={`${PRIMARY_BASE} ${className}`} style={{ ...PRIMARY_STYLE, ...style }} {...rest}>
      {content}
    </button>
  );
}

// Sekundær/outline-variant — brukt ved siden av en primærknapp (som i hero),
// ikke alene. "dark" (oppå foto/den mørke navbaren) har en halvgjennomsiktig
// mørk bunnfarge + lett bakgrunnssløring (uten den var den nesten uleselig,
// ren kant uten noen flate i det hele tatt) og samme korn som PrimaryButton —
// "light" (vanlig papirbunn) trenger ikke bunnfarge/korn, ink-farget kant+
// tekst har nok kontrast mot papiret alene.
//
// Alt her går via ren Tailwind-klasser (ikke inline style for bakgrunn) —
// første forsøk brukte inline style for bunnfargen, som gjorde at
// hover-klassen aldri klarte å overstyre den (inline style vinner alltid
// over en vanlig utility-klasse), så hover gjorde synlig ingenting.
const SECONDARY_BASE =
  "relative isolate inline-flex items-center justify-center overflow-hidden gap-2 rounded-lg px-6 py-2.5 text-xs font-normal uppercase tracking-[0.14em] backdrop-blur-sm transition-colors";

const SECONDARY_TONE_CLASS = {
  dark: "border border-[#91928C] text-[#f5efeb] bg-[rgba(20,24,18,0.42)] hover:bg-[rgba(20,24,18,0.62)] hover:border-[#f5efeb]",
  light: "border border-[rgba(44,35,46,0.35)] text-ink hover:bg-[rgba(44,35,46,0.06)]",
} as const;

function SecondaryGrain() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: GRAIN_BG, opacity: 0.3 }}
    />
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
  const content = (
    <>
      {tone === "dark" && <SecondaryGrain />}
      <span className="relative flex items-center gap-2">{children}</span>
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
