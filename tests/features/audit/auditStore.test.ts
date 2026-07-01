import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../msw/server'
import { useAuditStore } from '../../../src/features/audit/auditStore'
import { resetApiClient, setToken } from '../../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  useAuditStore.setState({ list: [], total: 0, loading: false, error: null })
  resetApiClient()
  setToken('mock-token')
})

describe('auditStore', () => {
  it('初始状态', () => {
    const s = useAuditStore.getState()
    expect(s.list).toEqual([])
    expect(s.total).toBe(0)
    expect(s.loading).toBe(false)
  })

  it('fetchAuditLogs 成功填充 list/total', async () => {
    await useAuditStore.getState().fetchAuditLogs({ page: 1, pageSize: 20 })
    const s = useAuditStore.getState()
    expect(s.list.length).toBeGreaterThan(0)
    expect(s.total).toBeGreaterThan(0)
    expect(s.loading).toBe(false)
  })

  it('fetchAuditLogs 按 timestamp 倒序', async () => {
    await useAuditStore.getState().fetchAuditLogs({ page: 1, pageSize: 50 })
    const ts = useAuditStore.getState().list.map((l) => l.timestamp)
    const sorted = [...ts].sort().reverse()
    expect(ts).toEqual(sorted)
  })

  it('fetchAuditLogs action 筛选', async () => {
    await useAuditStore.getState().fetchAuditLogs({ page: 1, pageSize: 50, action: 'login' })
    const s = useAuditStore.getState()
    expect(s.list.every((l) => l.action === 'login')).toBe(true)
  })

  it('fetchAuditLogs operator 筛选', async () => {
    await useAuditStore.getState().fetchAuditLogs({ page: 1, pageSize: 50, operator: 'admin' })
    const s = useAuditStore.getState()
    expect(s.list.every((l) => l.operator.includes('admin'))).toBe(true)
  })

  it('fetchAuditLogs ip 筛选', async () => {
    await useAuditStore.getState().fetchAuditLogs({ page: 1, pageSize: 50, ip: '192.168' })
    const s = useAuditStore.getState()
    expect(s.list.every((l) => l.ip.includes('192.168'))).toBe(true)
  })

  it('fetchAuditLogs 网络错误后 error', async () => {
    server.use(http.get('*/audit-logs', () => HttpResponse.error()))
    await useAuditStore.getState().fetchAuditLogs({ page: 1, pageSize: 20 })
    expect(useAuditStore.getState().error).toBeTruthy()
  })

  it('clearError', async () => {
    server.use(http.get('*/audit-logs', () => HttpResponse.error()))
    await useAuditStore.getState().fetchAuditLogs({ page: 1, pageSize: 20 })
    expect(useAuditStore.getState().error).toBeTruthy()
    useAuditStore.getState().clearError()
    expect(useAuditStore.getState().error).toBeNull()
  })
})
