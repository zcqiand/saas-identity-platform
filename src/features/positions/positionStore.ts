import { create } from "zustand";
import { apiClient } from "../../api/client";
import type { Position } from "../../types/position";

interface State {
  list: Position[];
  loading: boolean;
  error: string | null;
}
interface Actions {
  fetchPositions: () => Promise<void>;
  createPosition: (input: Partial<Position>) => Promise<void>;
  updatePosition: (id: string, input: Partial<Position>) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;
}
export type Store = State & Actions;

function extract(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } }; message?: string }).response
      ?.data?.message ??
    (err as Error).message ??
    "操作失败"
  );
}

export const usePositionStore = create<Store>()((set, get) => ({
  list: [],
  loading: false,
  error: null,
  fetchPositions: async () => {
    set({ loading: true, error: null });
    try {
      set({ list: (await apiClient.get<Position[]>("/positions")).data, loading: false });
    } catch (e) {
      set({ loading: false, error: extract(e) });
    }
  },
  createPosition: async (input) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post<Position>("/positions", input);
      set({ list: [res.data, ...get().list], loading: false });
    } catch (e) {
      set({ loading: false, error: extract(e) });
    }
  },
  updatePosition: async (id, input) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.put<Position>(`/positions/${id}`, input);
      set({ list: get().list.map((p) => (p.id === id ? res.data : p)), loading: false });
    } catch (e) {
      set({ loading: false, error: extract(e) });
    }
  },
  deletePosition: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/positions/${id}`);
      set({ list: get().list.filter((p) => p.id !== id), loading: false });
    } catch (e) {
      set({ loading: false, error: extract(e) });
    }
  },
}));
