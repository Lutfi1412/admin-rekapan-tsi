/**
 * hooks/useNarsum.ts
 * ------------------------------------------------------------------
 * State data rekapan + aksi CRUD (list, create, update, delete).
 * Semua request memakai token dari AuthContext.
 */

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../services/api";
import {
  createNarsum,
  deleteNarsum,
  fetchNarsum,
  updateNarsum,
  type BulkCreateResult,
  type NarsumItem,
  type NarsumPayload,
} from "../services/narsumService";
import { useAuth } from "./useAuth";

export interface UseNarsumResult {
  items: NarsumItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  createMany: (payloads: NarsumPayload[]) => Promise<BulkCreateResult>;
  updateOne: (id: number, payload: NarsumPayload) => Promise<NarsumItem>;
  removeOne: (id: number) => Promise<NarsumItem>;
}

export function useNarsum(): UseNarsumResult {
  const { token } = useAuth();
  const [items, setItems] = useState<NarsumItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setError(null);
    setIsRefreshing((current) => (items.length > 0 ? true : current));
    try {
      const data = await fetchNarsum(token);
      setItems(data);
      setLastUpdated(new Date());
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) return;
      setError(caught instanceof Error ? caught.message : "Gagal memuat data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, items.length]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createMany = useCallback(
    async (payloads: NarsumPayload[]) => {
      if (!token) throw new ApiError("Sesi berakhir, silakan login ulang.", 401);
      const result = await createNarsum(token, payloads);
      await refresh();
      return result;
    },
    [token, refresh],
  );

  const updateOne = useCallback(
    async (id: number, payload: NarsumPayload) => {
      if (!token) throw new ApiError("Sesi berakhir, silakan login ulang.", 401);
      const updated = await updateNarsum(token, id, payload);
      await refresh();
      return updated;
    },
    [token, refresh],
  );

  const removeOne = useCallback(
    async (id: number) => {
      if (!token) throw new ApiError("Sesi berakhir, silakan login ulang.", 401);
      const removed = await deleteNarsum(token, id);
      await refresh();
      return removed;
    },
    [token, refresh],
  );

  return {
    items,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
    createMany,
    updateOne,
    removeOne,
  };
}
