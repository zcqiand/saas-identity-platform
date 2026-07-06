import { create } from 'zustand'
import type { AuditLog } from '../../types/user'
import { apiClient } from '../../api/client'

export type AuditTab = 'all' | 'login' | 'operation' | 'security'

interface AuditState {
  list: AuditLog[]
  total: number
  loading: boolean
  error: string | null
}

interface AuditActions {
  fetchAuditLogs: (opts: {
    page: number
    pageSize: number
    action?: string
    operator?: string
    ip?: string
    startDate?: string
    endDate?: string
    type?: AuditTab
  }) => Promise<void>
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

  fetchAuditLogs: async (opts) => {
    set({ loading: true, error: null })
    try {
      const params: Record<string, string> = {
        page: String(opts.page),
        pageSize: String(opts.pageSize),
      }
      if (opts.action) params.action = opts.action
      if (opts.operator) params.operator = opts.operator
      if (opts.ip) params.ip = opts.ip
      if (opts.startDate) params.startDate = opts.startDate
      if (opts.endDate) params.endDate = opts.endDate
      if (opts.type && opts.type !== 'all') params.type = opts.type

      const res = await apiClient.get<{ items: AuditLog[]; total: number }>('/audit-logs', { params })
      set({ list: res.data.items, total: res.data.total, loading: false, error: null })
    } catch (err) {
      set({ loading: false, error: extractErrorMessage(err) })
    }
  },

  clearError: () => set({ error: null }),
}))
