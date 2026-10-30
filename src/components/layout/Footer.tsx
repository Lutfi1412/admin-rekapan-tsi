import { formatDistanceToNow } from "../../utils/relativeTime";

interface FooterProps {
  total: number;
  lastUpdated: Date | null;
}

export function Footer({ total, lastUpdated }: FooterProps) {
  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-[12px] text-slate-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} Rekapan Narsum DIT TSI · Panel admin internal
        </p>
        <p className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {total} data tersimpan
          </span>
          <span className="text-slate-300">|</span>
          <span>{lastUpdated ? `Diperbarui ${formatDistanceToNow(lastUpdated)}` : "Belum dimuat"}</span>
        </p>
      </div>
    </footer>
  );
}
