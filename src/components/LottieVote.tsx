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
}: {
  direction: "up" | "down";
  count: number;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  const [popping, setPopping] = useState(false);

  function handleClick() {
    if (!active && !popping) {
      setPopping(true);
      setTimeout(() => setPopping(false), 450);
    }
    onClick();
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={direction === "up" ? "Fungerte" : "Fungerte ikke"}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${
        active
          ? direction === "up"
            ? "border-sage/40 bg-sage/15 text-ink"
            : "border-rust/40 bg-rust/15 text-ink"
          : "border-ink/15 text-ink-soft hover:border-ink/30 hover:text-ink"
      } ${className ?? ""}`}
    >
      <Image
        src={direction === "up" ? "/ikoner/tommelopp3.png" : "/ikoner/tommelned4.png"}
        alt=""
        width={28}
        height={28}
        className={`object-contain ${popping ? "thumb-pop" : ""}`}
      />
      <span>{count}</span>
    </button>
  );
}
