import { LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";

interface NavbarProps {
  onLogout: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  const { user } = useAuth();
  const username = user?.username ?? "admin";
  const initial = username.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
            <Sparkles className="size-4.5" />
          </span>
          <div className="leading-tight">
            <p className="text-[13.5px] font-extrabold tracking-tight text-slate-900">
              Rekapan Narsum
            </p>
            <p className="text-[11px] font-medium text-slate-500">DIT TSI · Panel Admin</p>
          </div>
        </div>

        <span className="ml-2 hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 sm:inline-flex">
          <ShieldCheck className="size-3.5" />
          Sesi aktif
        </span>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full bg-slate-100/80 py-1 pl-1 pr-3 sm:flex">
            <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[12px] font-bold text-white">
              {initial}
            </span>
            <span className="text-[12.5px] font-semibold text-slate-700">{username}</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onLogout}
            leftIcon={<LogOut className="size-4" />}
            aria-label="Keluar"
          >
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
