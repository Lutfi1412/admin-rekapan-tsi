import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { UNAUTHORIZED_EVENT } from "../services/api";
import {
  fetchProfile,
  login as loginRequest,
  type AdminUser,
} from "../services/authService";
import { AuthContext, type AuthContextValue } from "./authContextValue";

const TOKEN_KEY = "arn.token";
const USER_KEY = "arn.user";

function readStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AdminUser | null>(readStoredUser);
  const [isReady, setIsReady] = useState(false);

  /** Hapus sesi di state + localStorage. */
  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  /** Validasi token yang tersimpan saat aplikasi dibuka. */
  useEffect(() => {
    let active = true;

    if (!token) {
      setIsReady(true);
      return;
    }

    void (async () => {
      try {
        const profile = await fetchProfile(token);
        if (!active) return;
        setUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setIsReady(true);
      }
    })();

    return () => {
      active = false;
    };
    // Hanya dijalankan sekali saat mount; token awal dibaca dari localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Logout otomatis bila API menjawab 401. */
  useEffect(() => {
    const handler = () => clearSession();
    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, [clearSession]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginRequest(username, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    setIsReady(true);
  }, []);

  const logout = useCallback(() => clearSession(), [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isReady,
      login,
      logout,
    }),
    [token, user, isReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
