import { IconImage } from "@/components/icons";

export function ImagePlaceholder({
  label,
  aspectRatio = "4 / 5",
  className = "",
}: {
  label: string;
  aspectRatio?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,var(--paper-deep),var(--hero-bg))] ${className}`}
      style={{ aspectRatio }}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(44,35,46,0.05) 0px, rgba(44,35,46,0.05) 1px, transparent 1px, transparent 11px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center text-ink-soft">
        <IconImage className="h-6 w-6" />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
}
