import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../msw/server'
import { useTenantStore } from '../../../src/features/tenant/tenantStore'
import { resetApiClient } from '../../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  useTenantStore.setState({ current: null, list: [], loading: false, error: null })
  resetApiClient()
})

describe('tenantStore 状态流转', () => {
  it('初始状态: current=null, list=[], loading=false', () => {
    const s = useTenantStore.getState()
    expect(s.current).toBeNull()
    expect(s.list).toEqual([])
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  it('fetchTenants 成功后 list 填充', async () => {
    await useTenantStore.getState().fetchTenants()
    const s = useTenantStore.getState()
    expect(s.list.length).toBeGreaterThanOrEqual(2)
    expect(s.list.map((t) => t.id).sort()).toEqual(['acme', 'globex'])
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  it('fetchTenants 网络错误后 error 填充', async () => {
    server.use(http.get('*/tenants', () => HttpResponse.error()))
    await useTenantStore.getState().fetchTenants()
    const s = useTenantStore.getState()
    expect(s.loading).toBe(false)
    expect(s.error).toBeTruthy()
    expect(s.list).toEqual([])
  })

  it('fetchTenant(id) 成功后 current 填充', async () => {
    await useTenantStore.getState().fetchTenant('acme')
    const s = useTenantStore.getState()
    expect(s.current).not.toBeNull()
    expect(s.current?.id).toBe('acme')
    expect(s.current?.theme.primary).toBe('#2563eb')
    expect(s.loading).toBe(false)
  })

  it('fetchTenant(id) 不存在时 error 填充', async () => {
    await useTenantStore.getState().fetchTenant('nonexistent')
    const s = useTenantStore.getState()
    expect(s.current).toBeNull()
    expect(s.error).toBeTruthy()
  })

  it('clearError 清除 error', async () => {
    await useTenantStore.getState().fetchTenant('nonexistent')
    expect(useTenantStore.getState().error).toBeTruthy()
    useTenantStore.getState().clearError()
    expect(useTenantStore.getState().error).toBeNull()
  })
})
