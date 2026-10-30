interface BadgeProps {
  mode: string;
  className?: string;
}

const STYLES: Record<string, string> = {
  online: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  offline: "bg-amber-50 text-amber-700 ring-amber-200",
  hybrid: "bg-sky-50 text-sky-700 ring-sky-200",
};

export function ModeBadge({ mode, className = "" }: BadgeProps) {
  const key = mode.trim().toLowerCase();
  const style = STYLES[key] ?? "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset",
        style,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {mode}
    </span>
  );
}
