import { create } from "zustand";
import type { PermissionState, Role } from "./types";
import { apiClient } from "../../api/client";

interface PermissionActions {
  /** 拉取指定组织的权限集 */
  fetchPermissions: (orgId: string) => Promise<void>;
  /** 检查是否拥有指定权限码 */
  checkPermission: (permission: string) => boolean;
  /** 清空权限（切换组织/登出时调用） */
  clearPermissions: () => void;
  /** 清除 error */
  clearError: () => void;
}

export type PermissionStore = PermissionState & PermissionActions;

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
  if (axiosErr.message) return axiosErr.message;
  return "操作失败";
}

export const usePermissionStore = create<PermissionStore>()((set, get) => ({
  roles: [],
  permissions: [],
  loading: false,
  error: null,

  fetchPermissions: async (orgId) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get<{ roles: Role[]; permissions: string[] }>(
        "/auth/permissions",
        { params: { orgId } },
      );
      set({
        roles: res.data.roles,
        permissions: res.data.permissions,
        loading: false,
        error: null,
      });
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) });
    }
  },

  checkPermission: (permission) => {
    return get().permissions.includes(permission);
  },

  clearPermissions: () => set({ roles: [], permissions: [] }),

  clearError: () => set({ error: null }),
}));
