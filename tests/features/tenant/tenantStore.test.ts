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
    const ids = s.list.map((t) => t.id).sort()
    expect(ids).toContain('acme')
    expect(ids).toContain('globex')
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

  // —— ch43：平台租户管理（只增不改）——
  it('createTenant 成功后新租户添加到 list 头部', async () => {
    await useTenantStore.getState().createTenant({
      name: '新租户',
      theme: { primary: '#ff0000', sidebar: '#000000', logoText: 'NEW' },
      config: { maxUsers: 50 },
    })
    const s = useTenantStore.getState()
    expect(s.list[0].name).toBe('新租户')
    expect(s.list[0].theme.primary).toBe('#ff0000')
    expect(s.error).toBeNull()
  })

  it('createTenant 网络错误后 error 填充', async () => {
    server.use(http.post('*/tenants', () => HttpResponse.error()))
    await useTenantStore.getState().createTenant({
      name: '新租户',
      theme: { primary: '#ff0000', sidebar: '#000000', logoText: 'NEW' },
    })
    const s = useTenantStore.getState()
    expect(s.error).toBeTruthy()
  })

  it('updateTenant 成功后 list 中对应项更新', async () => {
    await useTenantStore.getState().updateTenant('acme', {
      name: 'ACME 已改名',
      config: { maxUsers: 200 },
    })
    const s = useTenantStore.getState()
    const acme = s.list.find((t) => t.id === 'acme')
    expect(acme?.name).toBe('ACME 已改名')
    expect(acme?.config?.maxUsers).toBe(200)
    expect(s.error).toBeNull()
  })

  it('updateTenant 网络错误后 error 填充', async () => {
    server.use(http.put('*/tenants/acme', () => HttpResponse.error()))
    await useTenantStore.getState().updateTenant('acme', { name: '改名' })
    const s = useTenantStore.getState()
    expect(s.error).toBeTruthy()
  })

  it('deleteTenant 成功后 list 中对应项移除', async () => {
    await useTenantStore.getState().deleteTenant('globex')
    const s = useTenantStore.getState()
    expect(s.list.find((t) => t.id === 'globex')).toBeUndefined()
    expect(s.error).toBeNull()
  })

  it('deleteTenant 网络错误后 error 填充', async () => {
    server.use(http.delete('*/tenants/acme', () => HttpResponse.error()))
    await useTenantStore.getState().deleteTenant('acme')
    const s = useTenantStore.getState()
    expect(s.error).toBeTruthy()
  })
})
