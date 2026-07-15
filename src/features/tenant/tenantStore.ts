import { create } from "zustand";
import type { TenantState, TenantConfig, TenantCreateInput } from "../../types/tenant";
import { apiClient } from "../../api/client";

interface TenantActions {
  fetchTenants: (keyword?: string) => Promise<void>;
  fetchTenant: (id: string) => Promise<void>;
  createTenant: (input: TenantCreateInput) => Promise<void>;
  updateTenant: (id: string, input: Partial<TenantCreateInput>) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  clearError: () => void;
}

export type TenantStore = TenantState & TenantActions;

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
  if (axiosErr.message) return axiosErr.message;
  return "操作失败";
}

export const useTenantStore = create<TenantStore>()((set, get) => ({
  current: null,
  list: [],
  loading: false,
  error: null,

  fetchTenants: async (keyword?: string) => {
    set({ loading: true, error: null });
    try {
      const params: Record<string, string> = {};
      if (keyword) params.keyword = keyword;
      const res = await apiClient.get<TenantConfig[]>("/tenants", { params });
      set({ list: res.data, loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  fetchTenant: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get<TenantConfig>(`/tenants/${id}`);
      set({ current: res.data, loading: false, error: null });
    } catch (err) {
      set({ current: null, loading: false, error: extractErrorMessage(err) });
    }
  },

  createTenant: async (input) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post<TenantConfig>("/tenants", input);
      set({ list: [res.data, ...get().list], loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  updateTenant: async (id, input) => {
    set({ loading: true, error: null });
    try {
      await apiClient.put(`/tenants/${id}`, input);
      // refetch 保持 list 完整性和类型一致性
      await get().fetchTenants();
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  deleteTenant: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/tenants/${id}`);
      set({ list: get().list.filter((t) => t.id !== id), loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  clearError: () => set({ error: null }),
}));
