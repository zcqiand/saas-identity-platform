import { create } from "zustand";
import type { RoleStore, RoleState, RoleCreateInput } from "./types";
import { apiClient } from "../../api/client";

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
  if (axiosErr.message) return axiosErr.message;
  return "操作失败";
}

export const useRoleStore = create<RoleStore>()((set, get) => ({
  list: [],
  loading: false,
  error: null,

  fetchRoles: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get<RoleState["list"]>("/roles");
      set({ list: res.data, loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  createRole: async (input: RoleCreateInput) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post<RoleState["list"][number]>("/roles", input);
      set({ list: [res.data, ...get().list], loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  updateRole: async (id, input) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.put<RoleState["list"][number]>(`/roles/${id}`, input);
      set({
        list: get().list.map((r) => (r.id === id ? res.data : r)),
        loading: false,
        error: null,
      });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  deleteRole: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/roles/${id}`);
      set({ list: get().list.filter((r) => r.id !== id), loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  clearError: () => set({ error: null }),
}));
