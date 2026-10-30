/**
 * services/api.ts
 * ------------------------------------------------------------------
 * Wrapper fetch tunggal untuk seluruh request ke API rekapan narsum.
 * Base URL diambil dari env (`VITE_API_BASE_URL`) supaya mudah
 * dipindah antar environment tanpa menyentuh kode.
 */

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/** Base URL API tanpa slash di akhir. */
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

/** Event global saat API menjawab 401 (token hilang/kedaluwarsa). */
export const UNAUTHORIZED_EVENT = "api:unauthorized";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Bearer token hasil POST /login. */
  token?: string | null;
  /** Body JSON (otomatis di-stringify). */
  body?: unknown;
}

function extractMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim() !== "") return message;
  }
  if (typeof payload === "string" && payload.trim() !== "") return payload;
  return `Permintaan gagal (HTTP ${status})`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      "VITE_API_BASE_URL belum diisi. Salin .env.example menjadi .env lalu isi URL API.",
      0,
    );
  }

  const { token, body, headers, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Tidak dapat menghubungi server API. Periksa koneksi internet lalu coba lagi.",
      0,
    );
  }

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(extractMessage(payload, response.status), response.status, payload);
  }

  return payload as T;
}
