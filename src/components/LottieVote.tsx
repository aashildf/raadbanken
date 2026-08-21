"use client";

import Image from "next/image";
import { useState } from "react";

export function LottieVote({
  direction,
  count,
  active,
  disabled,
  onClick,
  className,
  light = false,
  compact = false,
}: {
  direction: "up" | "down";
  count: number;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  className?: string;
  /** Lys variant for bruk oppå mørke/fargede kortbakgrunner (f.eks. topp-3-kortene). */
  light?: boolean;
  /** Mindre trykkflate for trange layouts, som topp-3-kortene på mobil. */
  compact?: boolean;
}) {
  const [popping, setPopping] = useState(false);

  function handleClick() {
    if (!active && !popping) {
      setPopping(true);
      setTimeout(() => setPopping(false), 450);
    }
    onClick();
  }

  const toneClasses = active
    ? direction === "up"
      ? "border-sage/40 bg-sage/15 text-ink"
      : "border-rust/40 bg-rust/15 text-ink"
    : light
      ? "border-white/35 text-white/90 hover:border-white/60 hover:text-white"
      : "border-ink/15 text-ink-soft hover:border-ink/30 hover:text-ink";
  const iconSize = compact ? 18 : 28;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={direction === "up" ? "Fungerte" : "Fungerte ikke"}
      className={`flex items-center rounded-full border font-medium transition-colors disabled:opacity-40 ${
        compact ? "gap-1 px-2 py-1 text-xs" : "gap-1.5 px-3 py-1.5 text-sm"
      } ${toneClasses} ${className ?? ""}`}
    >
      <Image
        src={direction === "up" ? "/ikoner/tommelopp3.png" : "/ikoner/tommelned4.png"}
        alt=""
        width={iconSize}
        height={iconSize}
        className={`object-contain ${popping ? "thumb-pop" : ""}`}
      />
      <span>{count}</span>
    </button>
  );
}
