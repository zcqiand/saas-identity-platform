import { create } from "zustand";
import type { Department as SharedDepartment } from "@saas/identity-platform-shared/schemas";
import { apiClient } from "../../api/client";

interface DepartmentState {
  /** 扁平部门列表（v0.3.0 起原嵌套树被替代，按 parentId 自引用） */
  tree: SharedDepartment[] | null;
  loading: boolean;
  error: string | null;
}

interface DepartmentActions {
  fetchDepartmentTree: () => Promise<void>;
  createDepartmentNode: (name: string, parentId: string) => Promise<void>;
  updateDepartmentNode: (id: string, name: string) => Promise<void>;
  deleteDepartmentNode: (id: string) => Promise<void>;
  clearError: () => void;
}

export type DepartmentStore = DepartmentState & DepartmentActions;

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
  if (axiosErr.message) return axiosErr.message;
  return "操作失败";
}

export const useDepartmentStore = create<DepartmentStore>()((set, get) => ({
  tree: null,
  loading: false,
  error: null,

  fetchDepartmentTree: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get<SharedDepartment[]>("/orgs");
      set({ tree: res.data, loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  createDepartmentNode: async (name, parentId) => {
    set({ loading: true, error: null });
    try {
      await apiClient.post("/orgs", { name, parentId });
      await get().fetchDepartmentTree();
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  updateDepartmentNode: async (id, name) => {
    set({ loading: true, error: null });
    try {
      await apiClient.put(`/orgs/${id}`, { name });
      await get().fetchDepartmentTree();
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  deleteDepartmentNode: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/orgs/${id}`);
      await get().fetchDepartmentTree();
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  clearError: () => set({ error: null }),
}));