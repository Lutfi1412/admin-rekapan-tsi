import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "../../services/api";
import type { BulkCreateResult, BulkError, NarsumItem, NarsumPayload } from "../../services/narsumService";
import {
  EMPTY_FORM,
  MODE_OPTIONS,
  fromItem,
  hasErrors,
  isFormEmpty,
  toPayload,
  validateForm,
  type FormErrors,
  type FormValues,
} from "../../utils/validation";
import { toDisplayDate } from "../../utils/formatDate";
import { Button } from "../common/Button";
import { Input, Select, Textarea } from "../common/Input";
import { Modal } from "../common/Modal";

interface DraftEntry {
  key: string;
  payload: NarsumPayload;
}

type DurationMode = "single" | "multi";

interface NarsumFormProps {
  open: boolean;
  editing: NarsumItem | null;
  onClose: () => void;
  onSaved: (message: string) => void;
  onCreateMany: (payloads: NarsumPayload[]) => Promise<BulkCreateResult>;
  onUpdate: (id: number, payload: NarsumPayload) => Promise<NarsumItem>;
}

function newKey(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function NarsumForm({
  open,
  editing,
  onClose,
  onSaved,
  onCreateMany,
  onUpdate,
}: NarsumFormProps) {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);
  const [serverErrors, setServerErrors] = useState<BulkError[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [askNext, setAskNext] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  /** "single" = kegiatan sehari (1 kolom tanggal), "multi" = lebih dari sehari (2 kolom). */
  const [duration, setDuration] = useState<DurationMode>("single");
  const nameRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(editing);

  useEffect(() => {
    if (!open) return;
    const initial = editing ? fromItem(editing) : EMPTY_FORM;
    setValues(initial);
    setDuration(editing && initial.selesai !== initial.mulai ? "multi" : "single");
    setErrors({});
    setDrafts([]);
    setServerErrors([]);
    setFormError(null);
    setAskNext(false);
    setSubmitting(false);
  }, [open, editing]);

  const hasContextOnly = !isFormEmpty(values) && values.nama.trim() === "";
  const currentFormReady = !isFormEmpty(values) && !hasContextOnly;
  const totalPayloads = drafts.length + (currentFormReady ? 1 : 0);

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  /** Pilih durasi: sehari (1 tanggal) atau lebih dari sehari (2 tanggal). */
  function changeDuration(next: DurationMode) {
    setDuration(next);
    setErrors((current) => ({ ...current, mulai: undefined, selesai: undefined }));
    setFormError(null);

    if (next === "single") {
      setValues((current) => ({ ...current, selesai: current.mulai }));
    }
  }

  /** Saat mode sehari, tanggal selesai selalu sama dengan tanggal mulai. */
  function updateSingleDate(value: string) {
    setValues((current) => ({ ...current, mulai: value, selesai: value }));
    setErrors((current) => ({ ...current, mulai: undefined, selesai: undefined }));
    setFormError(null);
  }

  /** Kosongkan total seluruh isian form. */
  function resetForm() {
    setValues(EMPTY_FORM);
    setDuration("single");
    setErrors({});
    setFormError(null);
    nameRef.current?.focus();
  }

  function handleAddToDraft() {
    const validation = validateForm(values);
    if (hasErrors(validation)) {
      setErrors(validation);
      toast.error("Lengkapi dulu data kegiatan ini");
      return;
    }

    setDrafts((current) => [...current, { key: newKey(), payload: toPayload(values) }]);
    setAskNext(true);
    resetForm();
    toast.success(`Kegiatan #${drafts.length + 1} masuk daftar, form sudah dikosongkan`);
  }

  function removeDraft(key: string) {
    setDrafts((current) => current.filter((draft) => draft.key !== key));
  }

  async function submitAll(payloads: NarsumPayload[]) {
    setSubmitting(true);
    setServerErrors([]);
    setFormError(null);

    try {
      const result = await onCreateMany(payloads);

      if (result.failed > 0) {
        setServerErrors(result.errors);
        toast.warning(`${result.inserted} tersimpan, ${result.failed} gagal`);
        if (result.inserted > 0) {
          setDrafts([]);
          resetForm();
        }
        return;
      }

      toast.success(result.message || `${result.inserted} kegiatan berhasil disimpan`);
      onSaved(`${result.inserted} kegiatan tersimpan`);
      onClose();
    } catch (caught) {
      if (caught instanceof ApiError) {
        const payload = caught.payload as { errors?: BulkError[] } | null;
        if (payload && Array.isArray(payload.errors) && payload.errors.length > 0) {
          setServerErrors(payload.errors);
        } else {
          setFormError(caught.message);
        }
      } else {
        setFormError(caught instanceof Error ? caught.message : "Gagal menyimpan data");
      }
      toast.error("Data belum tersimpan");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit() {
    if (isEditing && editing) {
      const validation = validateForm(values);
      if (hasErrors(validation)) {
        setErrors(validation);
        toast.error("Lengkapi dulu data kegiatan");
        return;
      }

      setSubmitting(true);
      try {
        await onUpdate(editing.id, toPayload(values));
        toast.success("Perubahan berhasil disimpan");
        onSaved("Data diperbarui");
        onClose();
      } catch (caught) {
        setFormError(caught instanceof Error ? caught.message : "Gagal menyimpan perubahan");
        toast.error("Perubahan gagal disimpan");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const payloads = drafts.map((draft) => draft.payload);

    if (hasContextOnly && drafts.length === 0) {
      setErrors({ nama: "Nama narasumber wajib diisi" });
      toast.error("Nama narasumber belum diisi");
      return;
    }

    if (hasContextOnly) {
      toast.info("Form yang belum lengkap (nama kosong) tidak ikut dikirim");
    }

    if (currentFormReady) {
      const validation = validateForm(values);
      if (hasErrors(validation)) {
        setErrors(validation);
        toast.error("Ada field yang belum benar");
        return;
      }
      payloads.push(toPayload(values));
    }

    if (payloads.length === 0) {
      toast.error("Belum ada kegiatan yang diisi");
      return;
    }

    await submitAll(payloads);
  }

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[12px] text-slate-500">
        {isEditing
          ? "Perubahan langsung menggantikan data lama."
          : `${drafts.length} kegiatan di daftar${currentFormReady ? " + form aktif" : ""}`}
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Batal
        </Button>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={handleAddToDraft}
            disabled={submitting}
            leftIcon={<Plus className="size-4" />}
          >
            Tambah ke daftar
          </Button>
        )}
        <Button
          onClick={() => void handleSubmit()}
          loading={submitting}
          leftIcon={isEditing ? <CheckCircle2 className="size-4" /> : <Send className="size-4" />}
        >
          {isEditing ? "Simpan perubahan" : `Kirim ${totalPayloads || ""} kegiatan`.trim()}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!submitting}
      size="xl"
      title={isEditing ? `Edit kegiatan #${editing?.id}` : "Input kegiatan narasumber"}
      description={
        isEditing
          ? "Perbarui detail kegiatan lalu simpan."
          : "Isi data kegiatan, tambahkan ke daftar, lalu kirim sekaligus."
      }
      icon={isEditing ? <ClipboardList className="size-5" /> : <CalendarPlus className="size-5" />}
      footer={footer}
    >
      {askNext && !isEditing && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-[13px] font-bold text-emerald-900">Kegiatan ditambahkan ke daftar</p>
              <p className="text-[12px] text-emerald-700">Mau input kegiatan lagi atau kirim yang sudah ada?</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="secondary" onClick={() => setAskNext(false)}>
              Ya, input lagi
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setAskNext(false);
                void handleSubmit();
              }}
              loading={submitting}
            >
              Kirim sekarang
            </Button>
          </div>
        </div>
      )}

      {formError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] font-medium text-rose-700">
          {formError}
        </div>
      )}

      {serverErrors.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
          <p className="text-[12.5px] font-bold text-amber-800">Sebagian data ditolak server:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-[12px] text-amber-700">
            {serverErrors.map((item) => (
              <li key={`${item.index}-${item.message}`}>
                Item #{item.index + 1}: {item.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-3.5">
          <Input
            ref={nameRef}
            label="Nama narasumber"
            required
            placeholder="cth. Mundhi Saptono Widigdo"
            value={values.nama}
            error={errors.nama}
            onChange={(event) => updateField("nama", event.target.value)}
          />

          <Textarea
            label="Instansi / jabatan"
            required
            rows={2}
            placeholder="cth. Kepala Biro Keuangan, Sekretariat Jenderal, Kementerian Keuangan"
            value={values.instansi}
            error={errors.instansi}
            onChange={(event) => updateField("instansi", event.target.value)}
          />

          <Textarea
            label="Topik"
            required
            rows={2}
            placeholder="cth. Knowledge Sharing Tata Kelola Penghapusan BMN"
            value={values.topik}
            error={errors.topik}
            onChange={(event) => updateField("topik", event.target.value)}
          />

          <div className="space-y-2">
            <p className="text-[12.5px] font-semibold text-slate-700">
              Durasi kegiatan <span className="text-rose-500">*</span>
            </p>
            <div
              role="radiogroup"
              aria-label="Durasi kegiatan"
              className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100/80 p-1"
            >
              {(
                [
                  { value: "single", label: "Sehari", icon: CalendarDays },
                  { value: "multi", label: "Lebih dari sehari", icon: CalendarRange },
                ] as const
              ).map((option) => {
                const active = duration === option.value;
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => changeDuration(option.value)}
                    className={[
                      "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition",
                      active
                        ? "bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                        : "text-slate-500 hover:text-slate-700",
                    ].join(" ")}
                  >
                    <Icon className="size-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {duration === "single" ? (
            <Input
              label="Tanggal kegiatan"
              required
              type="date"
              value={values.mulai}
              error={errors.mulai}
              onChange={(event) => updateSingleDate(event.target.value)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Input
                label="Tanggal mulai"
                required
                type="date"
                value={values.mulai}
                error={errors.mulai}
                onChange={(event) => updateField("mulai", event.target.value)}
              />
              <Input
                label="Tanggal selesai"
                required
                type="date"
                min={values.mulai || undefined}
                value={values.selesai}
                error={errors.selesai}
                onChange={(event) => updateField("selesai", event.target.value)}
              />
            </div>
          )}

          <Textarea
            label="Lokasi"
            required
            rows={2}
            placeholder="cth. Grand Mercure Jakarta Kemayoran / Daring"
            value={values.lokasi}
            error={errors.lokasi}
            onChange={(event) => updateField("lokasi", event.target.value)}
          />

          <Select
            label="Mode pelaksanaan"
            required
            value={values.mode}
            error={errors.mode}
            options={MODE_OPTIONS.map((mode) => ({ value: mode, label: mode }))}
            onChange={(event) => updateField("mode", event.target.value)}
          />
        </div>

        <aside className="flex flex-col lg:border-l lg:border-slate-100 lg:pl-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12.5px] font-bold text-slate-700">
              Daftar kegiatan {drafts.length > 0 && `(${drafts.length})`}
            </p>
            {drafts.length > 0 && (
              <button
                type="button"
                onClick={() => setDrafts([])}
                className="text-[11.5px] font-semibold text-rose-600 hover:underline"
              >
                Kosongkan
              </button>
            )}
          </div>

          {drafts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center">
              <p className="text-[12px] leading-relaxed text-slate-500">
                Belum ada kegiatan di daftar. Isi form lalu klik{" "}
                <span className="font-semibold text-slate-700">Tambah ke daftar</span> untuk menyimpan
                beberapa kegiatan sekaligus.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {drafts.map((draft, index) => (
                <li
                  key={draft.key}
                  className="group rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-[11px] font-bold text-indigo-600">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-bold text-slate-800">
                        {draft.payload.Nama}
                      </p>
                      <p className="truncate text-[11.5px] text-slate-500">{draft.payload.Topik}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {toDisplayDate(draft.payload["Tanggal Mulai"])} ·{" "}
                        {draft.payload["Mode Pelaksanaan"]}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDraft(draft.key)}
                      aria-label="Hapus dari daftar"
                      className="rounded-md p-1 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isEditing && currentFormReady && (
            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-2.5">
              <p className="text-[11.5px] font-semibold text-indigo-700">Form aktif (belum masuk daftar)</p>
              <p className="mt-0.5 truncate text-[11.5px] text-indigo-600">
                {values.nama || "(nama belum diisi)"} · {values.mulai || "tanggal belum diisi"}
              </p>
            </div>
          )}

          <div className="mt-4 hidden rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3 lg:mt-auto lg:block">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-500">
              Tips input cepat
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">
              Setelah ditambahkan ke daftar, seluruh kolom form otomatis dikosongkan lagi, jadi kamu
              bisa langsung mengisi kegiatan berikutnya dari awal tanpa menghapus isian sebelumnya.
            </p>
          </div>
        </aside>
      </div>
    </Modal>
  );
}
