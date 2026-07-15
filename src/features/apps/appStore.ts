import { create } from "zustand";
import { apiClient } from "../../api/client";
import type { App, MenuItem } from "../../types/app";

interface AppState {
  apps: App[];
  currentApp: App | null;
  currentAppMenus: MenuItem[];
  loading: boolean;
  error: string | null;
}

interface AppActions {
  fetchApps: (keyword?: string) => Promise<void>;
  fetchApp: (id: string) => Promise<void>;
  createApp: (input: Partial<App>) => Promise<void>;
  updateApp: (id: string, input: Partial<App>) => Promise<void>;
  deleteApp: (id: string) => Promise<void>;
  fetchMenus: (appId: string) => Promise<void>;
  createMenu: (input: Partial<MenuItem>) => Promise<void>;
  updateMenu: (id: string, input: Partial<MenuItem>) => Promise<void>;
  deleteMenu: (id: string) => Promise<void>;
  clearError: () => void;
}

export type AppStore = AppState & AppActions;

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
  if (axiosErr.message) return axiosErr.message;
  return "操作失败";
}

export const useAppStore = create<AppStore>()((set, get) => ({
  apps: [],
  currentApp: null,
  currentAppMenus: [],
  loading: false,
  error: null,

  fetchApps: async (keyword?: string) => {
    set({ loading: true, error: null });
    try {
      const params: Record<string, string> = {};
      if (keyword) params.keyword = keyword;
      const res = await apiClient.get<App[]>("/apps", { params });
      set({ apps: res.data, loading: false });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  fetchApp: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get<App>(`/apps/${id}`);
      set({ currentApp: res.data, loading: false });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  createApp: async (input) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post<App>("/apps", input);
      set({ apps: [res.data, ...get().apps], loading: false });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  updateApp: async (id, input) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.put<App>(`/apps/${id}`, input);
      set({
        apps: get().apps.map((a) => (a.id === id ? res.data : a)),
        currentApp: get().currentApp?.id === id ? res.data : get().currentApp,
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  deleteApp: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/apps/${id}`);
      set({ apps: get().apps.filter((a) => a.id !== id), loading: false });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  fetchMenus: async (appId) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get<MenuItem[]>("/menus", { params: { appId } });
      set({ currentAppMenus: res.data, loading: false });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  createMenu: async (input) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post<MenuItem>("/menus", input);
      set({ currentAppMenus: [...get().currentAppMenus, res.data], loading: false });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  updateMenu: async (id, input) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.put<MenuItem>(`/menus/${id}`, input);
      set({
        currentAppMenus: get().currentAppMenus.map((m) => (m.id === id ? res.data : m)),
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  deleteMenu: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/menus/${id}`);
      set({
        currentAppMenus: get().currentAppMenus.filter((m) => m.id !== id),
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  clearError: () => set({ error: null }),
}));
