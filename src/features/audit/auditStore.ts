import { create } from 'zustand'
import type { AuditLog, AuditQuery } from '../../types/user'
import { apiClient } from '../../api/client'

interface AuditState {
  list: AuditLog[]
  total: number
  loading: boolean
  error: string | null
}

interface AuditActions {
  fetchAuditLogs: (query: AuditQuery) => Promise<void>
  clearError: () => void
}

export type AuditStore = AuditState & AuditActions

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
  if (axiosErr.response?.data?.message) return axiosErr.response.data.message
  if (axiosErr.message) return axiosErr.message
  return '操作失败'
}

export const useAuditStore = create<AuditStore>()((set) => ({
  list: [],
  total: 0,
  loading: false,
  error: null,

  fetchAuditLogs: async (query) => {
    set({ loading: true, error: null })
    try {
      const params: Record<string, string> = {
        page: String(query.page),
        pageSize: String(query.pageSize),
      }
      if (query.action) params.action = query.action
      if (query.operator) params.operator = query.operator
      if (query.ip) params.ip = query.ip
      const res = await apiClient.get<{ items: AuditLog[]; total: number }>('/audit-logs', {
        params,
      })
      set({ list: res.data.items, total: res.data.total, loading: false, error: null })
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) })
    }
  },

  clearError: () => set({ error: null }),
}))
