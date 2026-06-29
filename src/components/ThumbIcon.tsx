import Image from "next/image";

export function ThumbIcon({
  direction,
  className,
}: {
  direction: "up" | "down";
  className?: string;
}) {
  return (
    <Image
      src={direction === "up" ? "/ikoner/tommelopp3.png" : "/ikoner/tommelned4.png"}
      alt={direction === "up" ? "Fungerte" : "Fungerte ikke"}
      width={40}
      height={40}
      className={`object-contain ${className ?? ""}`}
    />
  );
}
