import { describe, it, expect } from 'vitest'
import { handlers } from '../msw/handlers'
import { server } from '../msw/server'
import { resetMockDb, listTenants, findTenant } from '../msw/db'

describe('scaffold smoke', () => {
  it('MSW server 实例可创建且 handlers 数组可读', () => {
    expect(server).toBeDefined()
    expect(Array.isArray(handlers)).toBe(true)
  })

  it('mock 租户库默认含 acme 与 globex 两个租户', () => {
    resetMockDb()
    const tenants = listTenants()
    expect(tenants).toHaveLength(2)
    expect(tenants.map((t) => t.id).sort()).toEqual(['acme', 'globex'])
  })

  it('findTenant 按 id 查找租户', () => {
    resetMockDb()
    const acme = findTenant('acme')
    expect(acme).toBeDefined()
    expect(acme?.name).toBe('ACME 集团')
    expect(acme?.theme.primary).toBe('#2563eb')
  })

  it('findTenant 不存在返回 undefined', () => {
    resetMockDb()
    expect(findTenant('nonexistent')).toBeUndefined()
  })
})
