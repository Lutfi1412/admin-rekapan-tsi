import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Plus, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { DeleteDialog } from "../components/narsum/DeleteDialog";
import { NarsumForm } from "../components/narsum/NarsumForm";
import { NarsumTable } from "../components/narsum/NarsumTable";
import { StatCards } from "../components/narsum/StatCards";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/common/Button";
import { Input, Select } from "../components/common/Input";
import { useAuth } from "../hooks/useAuth";
import { useNarsum } from "../hooks/useNarsum";
import type { NarsumItem } from "../services/narsumService";
import { MODE_OPTIONS } from "../utils/validation";
import { toIsoDate } from "../utils/formatDate";

const MODE_FILTERS = [
  { value: "all", label: "Semua mode" },
  ...MODE_OPTIONS.map((mode) => ({ value: mode.toLowerCase(), label: mode })),
];

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { items, isLoading, isRefreshing, error, lastUpdated, refresh, createMany, updateOne, removeOne } =
    useNarsum();

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NarsumItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NarsumItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const matched = items.filter((item) => {
      const matchesMode =
        modeFilter === "all" || item["Mode Pelaksanaan"].toLowerCase() === modeFilter;
      if (!matchesMode) return false;
      if (!keyword) return true;
      return [item.Nama, item.Instansi, item.Topik, item.Lokasi, item["Tanggal Mulai"]]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });

    // Urutkan kronologis (tanggal mulai, lalu id) supaya nomor urut rapi.
    return matched.sort((a, b) => {
      const dateA = toIsoDate(a["Tanggal Mulai"]);
      const dateB = toIsoDate(b["Tanggal Mulai"]);
      if (dateA !== dateB) return dateA < dateB ? -1 : 1;
      return a.id - b.id;
    });
  }, [items, search, modeFilter]);

  const hasFilter = search.trim() !== "" || modeFilter !== "all";

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: NarsumItem) {
    setEditing(item);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete(item: NarsumItem) {
    setIsDeleting(true);
    try {
      await removeOne(item.id);
      toast.success(`Data “${item.Nama}” berhasil dihapus`);
      setDeleteTarget(null);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Gagal menghapus data");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleLogout() {
    logout();
    toast.success("Anda telah keluar");
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-indigo-600">
              Dashboard admin
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
              Rekapan Narasumber DIT TSI
            </h1>
            <p className="mt-1.5 text-[13px] text-slate-500">
              Halo {user?.username ?? "admin"}, kelola data kegiatan narasumber dari sini.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => void refresh()}
              disabled={isLoading || isRefreshing}
              leftIcon={<RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />}
            >
              Muat ulang
            </Button>
            <Button onClick={openCreate} leftIcon={<Plus className="size-4" />}>
              Tambah data
            </Button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-bold">Gagal memuat data</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-5">
          <StatCards items={items} />
        </div>

        <section className="mt-6">
          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-slate-900">Daftar kegiatan</h2>
              <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11.5px] font-bold text-slate-600">
                {filtered.length}
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="sm:w-72">
                <Input
                  placeholder="Cari nama, instansi, topik…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  leftIcon={<Search className="size-4" />}
                  aria-label="Cari data"
                />
              </div>
              <div className="sm:w-44">
                <Select
                  aria-label="Filter mode pelaksanaan"
                  value={modeFilter}
                  options={MODE_FILTERS}
                  onChange={(event) => setModeFilter(event.target.value)}
                  className="bg-white"
                />
              </div>
              {hasFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setModeFilter("all");
                  }}
                  leftIcon={<SlidersHorizontal className="size-3.5" />}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          <NarsumTable
            items={filtered}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onResetFilter={() => {
              setSearch("");
              setModeFilter("all");
            }}
            hasFilter={hasFilter}
          />
        </section>
      </main>

      <Footer total={items.length} lastUpdated={lastUpdated} />

      <NarsumForm
        open={formOpen}
        editing={editing}
        onClose={closeForm}
        onSaved={(message) => toast.success(message)}
        onCreateMany={createMany}
        onUpdate={updateOne}
      />

      <DeleteDialog
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
