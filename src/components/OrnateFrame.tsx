import { IconFlourish } from "@/components/icons";

export function OrnateFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative mx-auto ${className}`}>
      <div className="hairline rounded-[2rem] bg-paper p-3 shadow-2xl shadow-plum-950/10 sm:p-4">
        <div className="rounded-[1.5rem] border border-dashed border-plum-700/30 p-2 sm:p-3">
          <div className="overflow-hidden rounded-[1.1rem]">{children}</div>
        </div>
      </div>

      <IconFlourish className="absolute -left-2 -top-2 h-8 w-8 text-plum-700/50" />
      <IconFlourish className="absolute -right-2 -top-2 h-8 w-8 rotate-90 text-plum-700/50" />
      <IconFlourish className="absolute -bottom-2 -left-2 h-8 w-8 -rotate-90 text-plum-700/50" />
      <IconFlourish className="absolute -bottom-2 -right-2 h-8 w-8 rotate-180 text-plum-700/50" />
    </div>
  );
}
