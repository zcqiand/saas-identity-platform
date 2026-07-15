import { create } from "zustand";
import { apiClient } from "../../api/client";
import type { PermissionGroup } from "../../types/security";

interface State {
  list: PermissionGroup[];
  loading: boolean;
  error: string | null;
}
interface Actions {
  fetchPermissionGroups: () => Promise<void>;
  createPermissionGroup: (input: Partial<PermissionGroup>) => Promise<void>;
  updatePermissionGroup: (id: string, input: Partial<PermissionGroup>) => Promise<void>;
  deletePermissionGroup: (id: string) => Promise<void>;
}
export type Store = State & Actions;
function extract(e: unknown) {
  return (
    (e as { response?: { data?: { message?: string } }; message?: string }).response?.data
      ?.message ??
    (e as Error).message ??
    "操作失败"
  );
}
export const usePermissionGroupStore = create<Store>()((set, get) => ({
  list: [],
  loading: false,
  error: null,
  fetchPermissionGroups: async () => {
    set({ loading: true, error: null });
    try {
      set({
        list: (await apiClient.get<PermissionGroup[]>("/permission-groups")).data,
        loading: false,
      });
    } catch (e) {
      set({ loading: false, error: extract(e) });
    }
  },
  createPermissionGroup: async (input) => {
    set({ loading: true, error: null });
    try {
      const r = await apiClient.post<PermissionGroup>("/permission-groups", input);
      set({ list: [r.data, ...get().list], loading: false });
    } catch (e) {
      set({ loading: false, error: extract(e) });
    }
  },
  updatePermissionGroup: async (id, input) => {
    set({ loading: true, error: null });
    try {
      const r = await apiClient.put<PermissionGroup>(`/permission-groups/${id}`, input);
      set({ list: get().list.map((g) => (g.id === id ? r.data : g)), loading: false });
    } catch (e) {
      set({ loading: false, error: extract(e) });
    }
  },
  deletePermissionGroup: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/permission-groups/${id}`);
      set({ list: get().list.filter((g) => g.id !== id), loading: false });
    } catch (e) {
      set({ loading: false, error: extract(e) });
    }
  },
}));
