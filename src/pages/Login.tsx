import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { checkHealth } from "../services/authService";
import { API_BASE_URL } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";

const FEATURES = [
  { icon: Layers, title: "Input banyak sekaligus", text: "Susun beberapa kegiatan lalu kirim dalam satu kali simpan." },
  { icon: BarChart3, title: "Rekap rapi & terukur", text: "Statistik kegiatan, mode pelaksanaan, dan instansi otomatis." },
  { icon: ShieldCheck, title: "Akses terbatas", text: "Hanya admin dengan token aktif yang bisa mengubah data." },
];

export function Login() {
  const { login, isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void checkHealth().then((ok) => {
      if (active) setApiOnline(ok);
    });
    return () => {
      active = false;
    };
  }, []);

  if (isReady && isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      toast.success("Berhasil masuk. Selamat bekerja!");
      navigate("/dashboard", { replace: true });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Gagal masuk, coba lagi.";
      setError(message);
      toast.error("Login gagal");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="app-grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute -left-32 top-10 size-80 rounded-full bg-indigo-300/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 size-72 rounded-full bg-violet-300/30 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur lg:grid-cols-[1.05fr_1fr]">
        <section className="relative hidden flex-col justify-between bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-9 text-white lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.55) 0, transparent 45%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.35) 0, transparent 40%)",
            }}
            aria-hidden
          />

          <div className="relative">
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25">
                <Sparkles className="size-5" />
              </span>
              <div className="leading-tight">
                <p className="text-[13px] font-bold tracking-wide">REKAPAN NARSUM</p>
                <p className="text-[11.5px] font-medium text-white/70">DIT TSI · Panel Admin</p>
              </div>
            </div>

            <h1 className="mt-10 text-3xl font-extrabold leading-tight tracking-tight">
              Kelola data narasumber
              <br />
              dalam satu tempat.
            </h1>
            <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-white/75">
              Catat, perbarui, dan rapikan seluruh kegiatan narasumber Direktorat TSI tanpa
              spreadsheet yang berserakan.
            </p>

            <ul className="mt-8 space-y-4">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/12 ring-1 ring-inset ring-white/20">
                    <feature.icon className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold">{feature.title}</p>
                    <p className="text-[12px] leading-relaxed text-white/70">{feature.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-10 flex items-center gap-2 text-[11.5px] text-white/60">
            <Lock className="size-3.5" />
            <span>Data internal · akses khusus administrator</span>
          </div>
        </section>

        <section className="flex flex-col justify-center p-7 sm:p-10">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-2.5 lg:hidden">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
                <Sparkles className="size-4.5" />
              </span>
              <div className="leading-tight">
                <p className="text-[13px] font-extrabold text-slate-900">Rekapan Narsum</p>
                <p className="text-[11px] text-slate-500">DIT TSI · Panel Admin</p>
              </div>
            </div>

            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                apiOnline === null
                  ? "bg-slate-50 text-slate-500 ring-slate-200"
                  : apiOnline
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-rose-50 text-rose-700 ring-rose-200",
              ].join(" ")}
              title={API_BASE_URL}
            >
              {apiOnline === null ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <span className={`size-1.5 rounded-full ${apiOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
              )}
              {apiOnline === null ? "Cek API" : apiOnline ? "API terhubung" : "API offline"}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Masuk ke panel admin</h2>
          <p className="mt-1.5 text-[13px] text-slate-500">
            Gunakan akun administrator untuk mengelola data kegiatan.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Username"
              required
              autoComplete="username"
              placeholder="admin"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              leftIcon={<User className="size-4" />}
            />

            <Input
              label="Password"
              required
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              leftIcon={<KeyRound className="size-4" />}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] font-medium text-rose-700"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isSubmitting}
              rightIcon={<ArrowRight className="size-4" />}
            >
              Masuk
            </Button>
          </form>

          <p className="mt-6 text-center text-[11.5px] leading-relaxed text-slate-400">
            Sesi berakhir otomatis bila token kedaluwarsa. Hubungi admin sistem jika lupa akses.
          </p>
        </section>
      </div>
    </main>
  );
}
