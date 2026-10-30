/**
 * hooks/useAuth.ts
 * Akses sesi admin (token, user, login, logout) dari AuthProvider.
 */

import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "../contexts/authContextValue";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }
  return context;
}
