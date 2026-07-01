import { create } from 'zustand'
import type { TenantState } from '../../types/tenant'
import type { TenantConfig } from '../../types/tenant'
import { apiClient } from '../../api/client'

interface TenantActions {
  fetchTenants: () => Promise<void>
  fetchTenant: (id: string) => Promise<void>
  clearError: () => void
}

export type TenantStore = TenantState & TenantActions

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string } }
    message?: string
  }
  if (axiosErr.response?.data?.message) return axiosErr.response.data.message
  if (axiosErr.message) return axiosErr.message
  return '操作失败'
}

export const useTenantStore = create<TenantStore>()((set) => ({
  current: null,
  list: [],
  loading: false,
  error: null,

  fetchTenants: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiClient.get<TenantConfig[]>('/tenants')
      set({ list: res.data, loading: false, error: null })
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) })
    }
  },

  fetchTenant: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await apiClient.get<TenantConfig>(`/tenants/${id}`)
      set({ current: res.data, loading: false, error: null })
    } catch (err) {
      set({ current: null, loading: false, error: extractErrorMessage(err) })
    }
  },

  clearError: () => set({ error: null }),
}))
