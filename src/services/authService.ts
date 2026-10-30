/**
 * services/authService.ts
 * ------------------------------------------------------------------
 * Login admin + verifikasi token (`POST /login`, `GET /me`).
 */

import { apiRequest } from "./api";

export interface AdminUser {
  username: string;
  role?: string;
}

export interface LoginResult {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: AdminUser;
}

interface Envelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/** Tukar username/password dengan JWT. */
export async function login(username: string, password: string): Promise<LoginResult> {
  const response = await apiRequest<Envelope<LoginResult>>("/login", {
    method: "POST",
    body: { username, password },
  });
  return response.data;
}

/** Cek token masih valid dan ambil profil admin. */
export async function fetchProfile(token: string): Promise<AdminUser> {
  const response = await apiRequest<Envelope<AdminUser>>("/me", { token });
  return response.data;
}

/** Health check ringan (dipakai indikator status server). */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await apiRequest<{ success: boolean }>("/health", { cache: "no-store" });
    return Boolean(response?.success);
  } catch {
    return false;
  }
}
