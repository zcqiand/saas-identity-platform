import { create } from "zustand";
import type { OrgNode } from "../../types/user";
import { apiClient } from "../../api/client";

interface OrgState {
  tree: OrgNode | null;
  loading: boolean;
  error: string | null;
}

interface OrgActions {
  fetchOrgTree: () => Promise<void>;
  createOrgNode: (name: string, parentId: string) => Promise<void>;
  updateOrgNode: (id: string, name: string) => Promise<void>;
  deleteOrgNode: (id: string) => Promise<void>;
  clearError: () => void;
}

export type OrgStore = OrgState & OrgActions;

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
  if (axiosErr.message) return axiosErr.message;
  return "操作失败";
}

export const useOrgStore = create<OrgStore>()((set, get) => ({
  tree: null,
  loading: false,
  error: null,

  fetchOrgTree: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get<OrgNode>("/orgs");
      set({ tree: res.data, loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  createOrgNode: async (name, parentId) => {
    set({ loading: true, error: null });
    try {
      await apiClient.post("/orgs", { name, parentId });
      await get().fetchOrgTree();
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  updateOrgNode: async (id, name) => {
    set({ loading: true, error: null });
    try {
      await apiClient.put(`/orgs/${id}`, { name });
      await get().fetchOrgTree();
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  deleteOrgNode: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/orgs/${id}`);
      await get().fetchOrgTree();
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  clearError: () => set({ error: null }),
}));
