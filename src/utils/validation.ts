/**
 * utils/validation.ts
 * ------------------------------------------------------------------
 * Validasi form kegiatan + konversi antara bentuk form, payload API,
 * dan data dari API.
 */

import type { NarsumItem, NarsumPayload } from "../services/narsumService";
import { toIsoDate } from "./formatDate";

export interface FormValues {
  nama: string;
  instansi: string;
  topik: string;
  mulai: string;
  selesai: string;
  lokasi: string;
  mode: string;
}

export type FormErrors = Partial<Record<keyof FormValues, string>>;

export const MODE_OPTIONS = ["Online", "Offline", "Hybrid"] as const;

export const EMPTY_FORM: FormValues = {
  nama: "",
  instansi: "",
  topik: "",
  mulai: "",
  selesai: "",
  lokasi: "",
  mode: "Online",
};

/** Form kosong / belum diisi sama sekali. */
export function isFormEmpty(values: FormValues): boolean {
  return (
    values.nama.trim() === "" &&
    values.instansi.trim() === "" &&
    values.topik.trim() === "" &&
    values.mulai === "" &&
    values.selesai === "" &&
    values.lokasi.trim() === ""
  );
}

export function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.nama.trim()) errors.nama = "Nama narasumber wajib diisi";
  else if (values.nama.trim().length > 200) errors.nama = "Maksimal 200 karakter";

  if (!values.instansi.trim()) errors.instansi = "Instansi wajib diisi";
  else if (values.instansi.trim().length > 500) errors.instansi = "Maksimal 500 karakter";

  if (!values.topik.trim()) errors.topik = "Topik wajib diisi";
  else if (values.topik.trim().length > 500) errors.topik = "Maksimal 500 karakter";

  if (!values.mulai) errors.mulai = "Tanggal mulai wajib diisi";
  if (!values.selesai) errors.selesai = "Tanggal selesai wajib diisi";

  if (values.mulai && values.selesai && values.selesai < values.mulai) {
    errors.selesai = "Tanggal selesai tidak boleh lebih awal dari tanggal mulai";
  }

  if (!values.lokasi.trim()) errors.lokasi = "Lokasi wajib diisi";
  else if (values.lokasi.trim().length > 500) errors.lokasi = "Maksimal 500 karakter";

  if (!values.mode.trim()) errors.mode = "Mode pelaksanaan wajib dipilih";

  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Form -> payload API (tanggal dikirim sebagai ISO YYYY-MM-DD). */
export function toPayload(values: FormValues): NarsumPayload {
  return {
    Nama: values.nama.trim(),
    Instansi: values.instansi.trim(),
    Topik: values.topik.trim(),
    "Tanggal Mulai": values.mulai,
    "Tanggal Selesai": values.selesai,
    Lokasi: values.lokasi.trim(),
    "Mode Pelaksanaan": values.mode.trim(),
  };
}

/** Data API -> nilai form (untuk mode edit). */
export function fromItem(item: NarsumItem): FormValues {
  return {
    nama: item.Nama,
    instansi: item.Instansi,
    topik: item.Topik,
    mulai: toIsoDate(item["Tanggal Mulai"]),
    selesai: toIsoDate(item["Tanggal Selesai"]),
    lokasi: item.Lokasi,
    mode: item["Mode Pelaksanaan"],
  };
}

/** Ringkas payload jadi satu baris untuk daftar draft. */
export function summarize(payload: NarsumPayload): string {
  return `${payload.Nama} · ${payload["Tanggal Mulai"]}`;
}
