import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../msw/server'
import { resetMockDb } from '../../../msw/db'
import { useUserStore } from '../../../src/features/users/userStore'
import { resetApiClient, setToken } from '../../../src/api/client'

const API_BASE = 'http://localhost/api'

async function seed(n: number) {
  for (let i = 0; i < n; i++) {
    await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `u${i}@acme`,
        displayName: `用户${i}`,
        email: `u${i}@acme.com`,
        orgId: 'org-acme',
        roles: i % 2 === 0 ? ['admin'] : ['member'],
      }),
    })
  }
}

beforeEach(() => {
  resetMockDb()
  localStorage.clear()
  useUserStore.setState({ list: [], total: 0, loading: false, error: null })
  resetApiClient()
  setToken('mock-token')
})

describe('userStore', () => {
  it('初始状态', () => {
    const s = useUserStore.getState()
    expect(s.list).toEqual([])
    expect(s.total).toBe(0)
    expect(s.loading).toBe(false)
  })

  it('fetchUsers 成功填充 list/total', async () => {
    await seed(3)
    await useUserStore.getState().fetchUsers({ page: 1, pageSize: 10 })
    const s = useUserStore.getState()
    // 默认数据 + seed(3)，total >= 3；列表按 pageSize 分页
    expect(s.list.length).toBeGreaterThanOrEqual(3)
    expect(s.total).toBeGreaterThanOrEqual(3)
    expect(s.loading).toBe(false)
  })

  it('fetchUsers keyword 搜索', async () => {
    await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'x@acme', displayName: '特殊XYZ', email: 'x@acme.com', orgId: 'org-acme', roles: ['member'] }),
    })
    await seed(2)
    await useUserStore.getState().fetchUsers({ page: 1, pageSize: 10, keyword: 'XYZ' })
    expect(useUserStore.getState().list).toHaveLength(1)
  })

  it('fetchUsers role 筛选', async () => {
    await seed(4)
    await useUserStore.getState().fetchUsers({ page: 1, pageSize: 10, role: 'admin' })
    const s = useUserStore.getState()
    expect(s.list.every((u) => u.roles.includes('admin'))).toBe(true)
  })

  it('fetchUsers orgId 筛选', async () => {
    await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'g@g.com', displayName: 'G', email: 'g@g.com', orgId: 'org-globex', roles: ['member'] }),
    })
    await seed(2)
    await useUserStore.getState().fetchUsers({ page: 1, pageSize: 10, orgId: 'org-globex' })
    expect(useUserStore.getState().list.every((u) => u.orgId === 'org-globex')).toBe(true)
  })

  it('fetchUsers 网络错误后 error 填充', async () => {
    server.use(http.get('*/users', () => HttpResponse.error()))
    await useUserStore.getState().fetchUsers({ page: 1, pageSize: 10 })
    expect(useUserStore.getState().error).toBeTruthy()
  })

  it('createUser 成功追加 list', async () => {
    await useUserStore.getState().fetchUsers({ page: 1, pageSize: 10 })
    await useUserStore.getState().createUser({
      username: 'new@acme',
      displayName: '新建',
      email: 'new@acme.com',
      orgId: 'org-acme',
      roles: ['member'],
    })
    expect(useUserStore.getState().list.some((u) => u.username === 'new@acme')).toBe(true)
  })

  it('createUser 失败后 error', async () => {
    await useUserStore.getState().createUser({ username: '', displayName: '', email: '', orgId: '', roles: [] })
    expect(useUserStore.getState().error).toBeTruthy()
  })

  it('updateUser 成功同步 list', async () => {
    await seed(1)
    await useUserStore.getState().fetchUsers({ page: 1, pageSize: 10 })
    const target = useUserStore.getState().list[0]
    await useUserStore.getState().updateUser(target.id, { displayName: '已改名', status: 'disabled' })
    const updated = useUserStore.getState().list.find((u) => u.id === target.id)
    expect(updated?.displayName).toBe('已改名')
    expect(updated?.status).toBe('disabled')
  })

  it('deleteUser 成功移除', async () => {
    await seed(2)
    await useUserStore.getState().fetchUsers({ page: 1, pageSize: 10 })
    const target = useUserStore.getState().list[0]
    const totalBefore = useUserStore.getState().total
    await useUserStore.getState().deleteUser(target.id)
    expect(useUserStore.getState().list.some((u) => u.id === target.id)).toBe(false)
    expect(useUserStore.getState().total).toBe(totalBefore - 1)
  })

  it('clearError', async () => {
    server.use(http.get('*/users', () => HttpResponse.error()))
    await useUserStore.getState().fetchUsers({ page: 1, pageSize: 10 })
    expect(useUserStore.getState().error).toBeTruthy()
    useUserStore.getState().clearError()
    expect(useUserStore.getState().error).toBeNull()
  })
})
