import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, setToken } from "../../api/client";

export type AuthStatus = "idle" | "loading" | "authenticated" | "error";

export interface SaaSUser {
  id: string;
  username: string;
  displayName: string;
  /** 部门 id（v0.3.0 起从 orgId 改名 departmentId） */
  departmentId: string;
}

interface AuthState {
  user: SaaSUser | null;
  token: string | null;
  /** 当前租户 ID（v0.3.0 起多租户切换走 tenantId） */
  currentTenantId: string | null;
  status: AuthStatus;
  error: string | null;
}

interface AuthActions {
  /** OAuth 回调处理：用 code 换 token + user */
  handleOAuthCallback: (code: string, provider: string) => Promise<void>;
  /** 切换租户：更新 currentTenantId（权限刷新由调用方触发 permissionStore.fetchPermissions） */
  switchTenant: (tenantId: string) => Promise<void>;
  /** 登出 */
  logout: () => void;
  /** 清除 error */
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
  if (axiosErr.message) return axiosErr.message;
  return "认证失败";
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentTenantId: null,
      status: "idle",
      error: null,

      handleOAuthCallback: async (code, provider) => {
        set({ status: "loading", error: null });
        try {
          const res = await apiClient.post<{ token: string; user: SaaSUser & { tenantId?: string } }>(
            "/auth/oauth/callback",
            { code, provider },
          );
          const { token, user } = res.data;
          setToken(token);
          set({
            user: {
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              departmentId: user.departmentId ?? "",
            },
            token,
            currentTenantId: user.tenantId ?? null,
            status: "authenticated",
            error: null,
          });
        } catch (err) {
          setToken(null);
          set({
            user: null,
            token: null,
            currentTenantId: null,
            status: "error",
            error: extractErrorMessage(err),
          });
        }
      },

      switchTenant: async (tenantId) => {
        set({ currentTenantId: tenantId });
        // 权限刷新由调用方（组件层）触发 permissionStore.fetchPermissions(tenantId)
      },

      logout: () => {
        setToken(null);
        set({
          user: null,
          token: null,
          currentTenantId: null,
          status: "idle",
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "saas-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        currentTenantId: state.currentTenantId,
      }),
    },
  ),
);