type IconProps = {
  className?: string;
};

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconPhone({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5.5 4h3l1.3 4.2-2 1.6c.9 2.3 2.6 4 4.9 4.9l1.6-2 4.2 1.3v3c0 1-1 1.8-2 1.6-3.6-.6-7-2.4-9.5-4.9S3.6 8.6 3 5c-.2-1 .6-1.9 1.6-1.9Z" />
    </svg>
  );
}

export function IconTeacup({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 9.5h13v3.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9.5Z" />
      <path d="M17 10.5h1.4a2.3 2.3 0 0 1 0 4.6H17" />
      <path d="M8 3.2c.5 1-.4 1.6 0 2.6M12.2 3.2c.5 1-.4 1.6 0 2.6" />
    </svg>
  );
}

export function IconLemon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 12.2c0-3.6 4-6.7 9-6.7s9 3.1 9 6.7-4 6.7-9 6.7-9-3.1-9-6.7Z" />
      <path d="M13 4.7c.8-1.4 2.3-2 3.8-1.8" />
      <path d="M8.2 9.8c1.2.9 2.5.9 3.8.9M8.2 14.6c1.2-.9 2.5-.9 3.8-.9" />
    </svg>
  );
}

export function IconThermometer({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12.3 14.6V5.2a2.1 2.1 0 1 0-4.2 0v9.4a4 4 0 1 0 4.2 0Z" />
      <path d="M10.2 7.6h1.4M10.2 10.4h1.4" />
    </svg>
  );
}

export function IconBolt({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M13.2 2.5 4.6 14h5.8l-.9 7.5 8.9-12.3h-5.8l.6-6.7Z" />
    </svg>
  );
}

export function IconMoon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M20 14.7A8.4 8.4 0 1 1 9.3 4a7 7 0 0 0 10.7 10.7Z" />
    </svg>
  );
}

export function IconBug({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <ellipse cx="12" cy="13.2" rx="3" ry="4.6" />
      <path d="M12 8.6V4M9.3 6.2 7.4 4.3M14.7 6.2l1.9-1.9M8.4 12.4H5M19 12.4h-3.4M8.8 17l-2.4 2M15.2 17l2.4 2" />
    </svg>
  );
}

export function IconFootprint({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9.3 21.2c-1.5 0-2.6-1.3-2.3-3l.6-4.8c.2-1.6-.3-2.5-1-3.7-.8-1.4-1.1-3-.1-4.3.9-1.2 2.7-1.6 3.7-.4.8 1 .6 2.3.3 3.5-.4 1.6.1 2.7.9 3.9.9 1.4 1.7 3.1 1.4 4.9-.3 2-1.8 4-3.5 3.9Z" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.3-4.3" />
    </svg>
  );
}

export function IconChevronUp({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m5 14.5 7-7 7 7" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m5 9.5 7 7 7-7" />
    </svg>
  );
}

export function IconSparkle({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  );
}

export function IconImage({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 5-5 3.5 3.5L17 11l4 4" />
    </svg>
  );
}

export function IconFlourish({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 21c0-10 7-17 17-17" />
      <circle cx="3" cy="21" r="1.3" fill="currentColor" stroke="none" />
      <path d="M9 5.5c1.6.4 2.6 1.7 2.6 3.2" />
    </svg>
  );
}

export function IconSprig({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21V9" />
      <path d="M12 13c-2-.5-3.5-2-3.5-4.5C10 9 12 10 12 13Z" />
      <path d="M12 9c2-.3 3.5-1.8 3.5-4C13.5 5.5 12 6.5 12 9Z" />
    </svg>
  );
}

export function IconFlowerHerb({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21v-9" />
      <circle cx="12" cy="8.5" r="1.6" />
      <path d="M12 6.9c-.6-1-2-1.4-3-.8M12 6.9c.6-1 2-1.4 3-.8" />
      <path d="M10.4 9.4c-1.1.2-2.2 1.1-2.4 2.3M13.6 9.4c1.1.2 2.2 1.1 2.4 2.3" />
    </svg>
  );
}

export function IconRootHerb({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 4c2 1 3 3.3 2.4 5.6-.5 2-2 2.8-2.4 4.9-.3 1.6.4 3 1.5 4" />
      <path d="M12 4c-2 1-3 3.3-2.4 5.6.5 2 2 2.8 2.4 4.9" />
      <path d="M9 7.5c-1-.3-1.8-1-2-1.8M15 7.5c1-.3 1.8-1 2-1.8" />
    </svg>
  );
}

export function IconSucculent({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21V11" />
      <path d="M12 13 8 6M12 13l4-7" />
      <path d="M12 16 7.5 10M12 16l4.5-6" />
    </svg>
  );
}

export function IconWave({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 9c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
      <path d="M3 15c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
    </svg>
  );
}

export function IconJoint({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 5c2 1 3 3 3 5.5" />
      <circle cx="12" cy="12" r="2.3" />
      <path d="M19 19c-2-1-3-3-3-5.5" />
    </svg>
  );
}

export function IconPrune({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 8c-3.5 0-6 3-6 6.5S8.5 21 12 21s6-3 6-6.5S15.5 8 12 8Z" />
      <path d="M12 8c0-1.6.8-2.6 2-3.2M12 8c-.3-1.2-.1-2.3.6-3.4" />
    </svg>
  );
}

export function IconFlame({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3c1 2.5-1.5 3.8-1.5 6.3 0 1.2 1 2.2 1.5 2.2s1.5-1 1.5-2.2c1.5 1 2.5 3 2.5 5 0 3.3-2.6 6-6 6s-6-2.7-6-6c0-3.5 2.2-5.8 4-7.5C9.5 5.3 10.8 4 12 3Z" />
    </svg>
  );
}

export function IconSun({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6" />
    </svg>
  );
}

export const PLANT_ICON: Record<string, (props: IconProps) => React.JSX.Element> = {
  sprig: IconSprig,
  flower: IconFlowerHerb,
  root: IconRootHerb,
  succulent: IconSucculent,
};

export const CATEGORY_ICON: Record<string, (props: IconProps) => React.JSX.Element> = {
  hoste: IconTeacup,
  "vond-hals": IconLemon,
  forkjolelse: IconThermometer,
  hodepine: IconBolt,
  sovnproblemer: IconMoon,
  myggstikk: IconBug,
  "forstuet-fot": IconFootprint,
  kvalme: IconWave,
  "muskel-og-leddsmerter": IconJoint,
  forstoppelse: IconPrune,
  halsbrann: IconFlame,
  "solbrenthet-og-eksem": IconSun,
};
