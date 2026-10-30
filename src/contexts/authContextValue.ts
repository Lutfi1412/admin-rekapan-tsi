import { createContext } from "react";
import type { AdminUser } from "../services/authService";

export interface AuthContextValue {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  /** true setelah pengecekan token awal selesai. */
  isReady: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
