import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Inbox, Pencil, Trash2 } from "lucide-react";
import type { NarsumItem } from "../../services/narsumService";
import { formatRange } from "../../utils/formatDate";
import { ModeBadge } from "../common/Badge";

const PAGE_SIZE = 10;

interface NarsumTableProps {
  items: NarsumItem[];
  isLoading: boolean;
  onEdit: (item: NarsumItem) => void;
  onDelete: (item: NarsumItem) => void;
  onResetFilter: () => void;
  hasFilter: boolean;
}

export function NarsumTable({
  items,
  isLoading,
  onEdit,
  onDelete,
  onResetFilter,
  hasFilter,
}: NarsumTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [items.length, hasFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page],
  );

  const startNumber = items.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endNumber = Math.min(page * PAGE_SIZE, items.length);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11.5px] uppercase tracking-wide text-slate-500">
              <th className="w-14 px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Narasumber</th>
              <th className="px-4 py-3 font-semibold">Topik</th>
              <th className="px-4 py-3 font-semibold">Tanggal</th>
              <th className="px-4 py-3 font-semibold">Mode</th>
              <th className="w-28 px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="h-3 w-6 rounded bg-slate-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-3 w-40 rounded bg-slate-100" />
                    <div className="mt-2 h-2.5 w-56 rounded bg-slate-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-3 w-64 rounded bg-slate-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-3 w-32 rounded bg-slate-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-5 w-16 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="ml-auto h-3 w-16 rounded bg-slate-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Inbox className="size-6" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {hasFilter ? "Tidak ada data yang cocok" : "Belum ada data kegiatan"}
                      </p>
                      <p className="mt-1 text-[12.5px] text-slate-500">
                        {hasFilter
                          ? "Coba ubah kata kunci pencarian atau filter mode."
                          : "Klik “Tambah data” untuk menyimpan kegiatan pertama."}
                      </p>
                    </div>
                    {hasFilter && (
                      <button
                        type="button"
                        onClick={onResetFilter}
                        className="text-[12.5px] font-semibold text-indigo-600 hover:underline"
                      >
                        Reset pencarian
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              pageItems.map((item) => (
                <tr key={item.id} className="group transition-colors hover:bg-indigo-50/40">
                  <td className="px-4 py-3.5 align-top">
                    <span className="inline-flex min-w-8 justify-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11.5px] font-bold text-slate-600">
                      {item.id}
                    </span>
                  </td>
                  <td className="max-w-[240px] px-4 py-3.5 align-top">
                    <p className="truncate text-[13.5px] font-bold text-slate-900">{item.Nama}</p>
                    <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-slate-500">
                      {item.Instansi}
                    </p>
                  </td>
                  <td className="max-w-[280px] px-4 py-3.5 align-top">
                    <p className="line-clamp-2 text-[13px] leading-snug text-slate-700">{item.Topik}</p>
                    <p className="mt-1 line-clamp-1 text-[11.5px] text-slate-400">{item.Lokasi}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 align-top text-[12.5px] font-medium text-slate-600">
                    {formatRange(item["Tanggal Mulai"], item["Tanggal Selesai"])}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <ModeBadge mode={item["Mode Pelaksanaan"]} />
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        title="Edit data"
                        aria-label={`Edit data ${item.Nama}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        title="Hapus data"
                        aria-label={`Hapus data ${item.Nama}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
        <p className="text-[12.5px] text-slate-500">
          Menampilkan <span className="font-semibold text-slate-700">{startNumber}</span>–
          <span className="font-semibold text-slate-700">{endNumber}</span> dari{" "}
          <span className="font-semibold text-slate-700">{items.length}</span> kegiatan
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="size-4" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
            const windowSize = Math.min(5, totalPages);
            const first = Math.min(Math.max(1, page - 2), totalPages - windowSize + 1);
            const pageNumber = first + index;
            return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={[
                    "inline-flex size-8 items-center justify-center rounded-lg text-[12.5px] font-semibold transition",
                    pageNumber === page
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {pageNumber}
                </button>
              );
            })}

          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
