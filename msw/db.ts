// Mock 内存数据库：仅 mock 层使用，测试间隔离由 tests/setup.ts 的 resetMockDb 保证。
// ch39：租户数据；ch40 追加用户/组织/权限数据。

/** 通用重置入口，ch39 仅有 tenantStore，ch40 追加时扩展 */
export function resetMockDb() {
  // ch39：重置租户表（tenantStore 实现后填充）
  resetTenants()
}

// —— ch39：租户表 ——
export interface MockTenant {
  id: string
  name: string
  theme: {
    primary: string
    sidebar: string
    logoText: string
  }
  config: {
    features: string[]
    maxUsers: number
  }
}

const DEFAULT_TENANTS: MockTenant[] = [
  {
    id: 'acme',
    name: 'ACME 集团',
    theme: { primary: '#2563eb', sidebar: '#1e293b', logoText: 'ACME' },
    config: { features: ['sso', 'audit', 'rbac'], maxUsers: 100 },
  },
  {
    id: 'globex',
    name: 'Globex 科技',
    theme: { primary: '#059669', sidebar: '#064e3b', logoText: 'GLOBEX' },
    config: { features: ['sso', 'rbac'], maxUsers: 50 },
  },
]

let tenants: MockTenant[] = [...DEFAULT_TENANTS]

function resetTenants() {
  tenants = [...DEFAULT_TENANTS]
}

export function listTenants(): MockTenant[] {
  return [...tenants]
}

export function findTenant(id: string): MockTenant | undefined {
  return tenants.find((t) => t.id === id)
}
