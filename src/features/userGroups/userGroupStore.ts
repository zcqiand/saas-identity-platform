import { create } from "zustand";
import { apiClient } from "../../api/client";
import type { UserGroup } from "../../types/userGroup";

interface State {
  list: UserGroup[];
  loading: boolean;
  error: string | null;
}
interface Actions {
  fetchUserGroups: () => Promise<void>;
  createUserGroup: (input: Partial<UserGroup>) => Promise<void>;
  updateUserGroup: (id: string, input: Partial<UserGroup>) => Promise<void>;
  deleteUserGroup: (id: string) => Promise<void>;
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
export const useUserGroupStore = create<Store>()((set, get) => ({
  list: [],
  loading: false,
  error: null,
  fetchUserGroups: async () => {
    set({ loading: true, error: null });
    try {
      set({
        list: (await apiClient.get<UserGroup[]>("/user-groups")).data,
        loading: false,
      });
    } catch (e) {
      set({ loading: false, error: extract(e) });
    }
  },
  createUserGroup: async (input) => {
    set({ loading: true, error: null });
    try {
      const r = await apiClient.post<UserGroup>("/user-groups", input);
      set({ list: [r.data, ...get().list], loading: false });
    } catch (e) {
      set({ loading: false, error: extract(e) });
    }
  },
  updateUserGroup: async (id, input) => {
    set({ loading: true, error: null });
    try {
      const r = await apiClient.put<UserGroup>(`/user-groups/${id}`, input);
      set({ list: get().list.map((g) => (g.id === id ? r.data : g)), loading: false });
    } catch (e) {
      set({ loading: false, error: extract(e) });
    }
  },
  deleteUserGroup: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/user-groups/${id}`);
      set({ list: get().list.filter((g) => g.id !== id), loading: false });
    } catch (e) {
      set({ loading: false, error: extract(e) });
    }
  },
}));
