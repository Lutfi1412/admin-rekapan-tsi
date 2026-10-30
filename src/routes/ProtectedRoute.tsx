import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
          <Sparkles className="size-6" />
        </span>
        <p className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          Memeriksa sesi…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
