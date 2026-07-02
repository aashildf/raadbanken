"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function ThumbIcon({
  direction,
  className,
}: {
  direction: "up" | "down";
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    const btn = ref.current?.closest("button");
    if (!btn) return;
    const handler = () => {
      setPopping(true);
      setTimeout(() => setPopping(false), 450);
    };
    btn.addEventListener("click", handler);
    return () => btn.removeEventListener("click", handler);
  }, []);

  return (
    <span ref={ref} className="contents">
      <Image
        src={direction === "up" ? "/ikoner/tommelopp3.png" : "/ikoner/tommelned4.png"}
        alt=""
        width={28}
        height={28}
        className={`object-contain ${popping ? "thumb-pop" : ""} ${className ?? ""}`}
      />
    </span>
  );
}
