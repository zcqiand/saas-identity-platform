import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient, setToken } from '../../api/client'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error'

export interface SaaSUser {
  id: string
  username: string
  displayName: string
  orgId: string
}

interface AuthState {
  user: SaaSUser | null
  token: string | null
  /** 当前组织 ID（SaaS 多组织，可切换） */
  currentOrgId: string | null
  status: AuthStatus
  error: string | null
}

interface AuthActions {
  /** OAuth 回调处理：用 code 换 token + user */
  handleOAuthCallback: (code: string, provider: string) => Promise<void>
  /** 切换组织：更新 currentOrgId（权限刷新由调用方触发 permissionStore.fetchPermissions） */
  switchOrg: (orgId: string) => Promise<void>
  /** 登出 */
  logout: () => void
  /** 清除 error */
  clearError: () => void
}

export type AuthStore = AuthState & AuthActions

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string } }
    message?: string
  }
  if (axiosErr.response?.data?.message) return axiosErr.response.data.message
  if (axiosErr.message) return axiosErr.message
  return '认证失败'
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentOrgId: null,
      status: 'idle',
      error: null,

      handleOAuthCallback: async (code, provider) => {
        set({ status: 'loading', error: null })
        try {
          const res = await apiClient.post<{ token: string; user: SaaSUser }>(
            '/auth/oauth/callback',
            { code, provider },
          )
          const { token, user } = res.data
          setToken(token)
          set({
            user,
            token,
            currentOrgId: user.orgId,
            status: 'authenticated',
            error: null,
          })
        } catch (err) {
          setToken(null)
          set({
            user: null,
            token: null,
            currentOrgId: null,
            status: 'error',
            error: extractErrorMessage(err),
          })
        }
      },

      switchOrg: async (orgId) => {
        set({ currentOrgId: orgId })
        // 权限刷新由调用方（组件层）触发 permissionStore.fetchPermissions(orgId)
      },

      logout: () => {
        setToken(null)
        set({
          user: null,
          token: null,
          currentOrgId: null,
          status: 'idle',
          error: null,
        })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'saas-auth',
      partialize: (state) => ({ token: state.token, user: state.user, currentOrgId: state.currentOrgId }),
    },
  ),
)
