/**
 * services/narsumService.ts
 * ------------------------------------------------------------------
 * CRUD ke API rekapan narsum.
 *
 * Struktur payload & response mengikuti API yang sudah di-deploy:
 *  - GET    /admin            -> array data (wajib Bearer token)
 *  - POST   /create           -> satu object ATAU array object (3 worker)
 *  - PUT    /update/:id       -> satu object (full replace)
 *  - DELETE /delete/:id       -> hapus satu data
 */

import { apiRequest } from "./api";

/** Bentuk data dari API (key sesuai template). */
export interface NarsumItem {
  id: number;
  Nama: string;
  Instansi: string;
  Topik: string;
  "Tanggal Mulai": string;
  "Tanggal Selesai": string;
  Lokasi: string;
  "Mode Pelaksanaan": string;
}

/** Payload yang dikirim ke API. */
export interface NarsumPayload {
  Nama: string;
  Instansi: string;
  Topik: string;
  "Tanggal Mulai": string;
  "Tanggal Selesai": string;
  Lokasi: string;
  "Mode Pelaksanaan": string;
}

export interface BulkError {
  index: number;
  code?: string;
  message: string;
}

export interface BulkCreateResult {
  success: boolean;
  statusCode: number;
  message: string;
  total: number;
  inserted: number;
  failed: number;
  workers: number;
  data: NarsumItem[];
  errors: BulkError[];
}

interface Envelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/** Semua data (endpoint admin). */
export async function fetchNarsum(token: string): Promise<NarsumItem[]> {
  return apiRequest<NarsumItem[]>("/admin", { token, cache: "no-store" });
}

/** Tambah satu atau banyak data sekaligus. */
export async function createNarsum(
  token: string,
  payload: NarsumPayload | NarsumPayload[],
): Promise<BulkCreateResult> {
  const response = await apiRequest<BulkCreateResult>("/create", {
    method: "POST",
    token,
    body: payload,
  });
  return response;
}

/** Update satu data (full replace). */
export async function updateNarsum(
  token: string,
  id: number,
  payload: NarsumPayload,
): Promise<NarsumItem> {
  const response = await apiRequest<Envelope<NarsumItem>>(`/update/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
  return response.data;
}

/** Hapus satu data. */
export async function deleteNarsum(token: string, id: number): Promise<NarsumItem> {
  const response = await apiRequest<Envelope<NarsumItem>>(`/delete/${id}`, {
    method: "DELETE",
    token,
  });
  return response.data;
}
