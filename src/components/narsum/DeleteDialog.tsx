import { AlertTriangle, Trash2 } from "lucide-react";
import type { NarsumItem } from "../../services/narsumService";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";

interface DeleteDialogProps {
  item: NarsumItem | null;
  onClose: () => void;
  onConfirm: (item: NarsumItem) => Promise<void>;
  isDeleting: boolean;
}

export function DeleteDialog({ item, onClose, onConfirm, isDeleting }: DeleteDialogProps) {
  return (
    <Modal
      open={Boolean(item)}
      onClose={onClose}
      dismissible={!isDeleting}
      size="md"
      title="Hapus data kegiatan?"
      description="Data yang dihapus tidak bisa dikembalikan."
      icon={<AlertTriangle className="size-5" />}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Batal
          </Button>
          <Button
            variant="danger"
            loading={isDeleting}
            leftIcon={<Trash2 className="size-4" />}
            onClick={() => item && void onConfirm(item)}
          >
            Ya, hapus
          </Button>
        </div>
      }
    >
      {item && (
        <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
          <p className="text-[13px] font-bold text-slate-900">{item.Nama}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{item.Topik}</p>
          <p className="mt-2 text-[12px] text-slate-500">
            {item["Tanggal Mulai"]} – {item["Tanggal Selesai"]} · {item["Mode Pelaksanaan"]}
          </p>
        </div>
      )}
    </Modal>
  );
}
