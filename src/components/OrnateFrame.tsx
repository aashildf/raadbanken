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
    </div>
  );
}
