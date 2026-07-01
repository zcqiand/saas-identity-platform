// Mock 内存数据库：仅 mock 层使用，测试间隔离由 tests/setup.ts 的 resetMockDb 保证。
// ch39：租户数据；ch40 追加用户/组织/权限数据；ch41 追加 userTable/orgTree/auditLogTable（只增）。

import type { User, OrgNode, AuditLog } from '../src/types/user'

/** 通用重置入口 */
export function resetMockDb() {
  resetTenants()
  resetUsers()
  resetOrgs()
  resetAuditLogs()
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

// —— ch41：用户表 ——
let users: User[] = []

function resetUsers() {
  users = []
}

function genId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function now(): string {
  return new Date().toISOString()
}

export function insertUser(
  input: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<User, 'id'>>,
): User {
  const user: User = {
    ...input,
    id: input.id ?? genId('u'),
    status: input.status ?? 'active',
    createdAt: now(),
    updatedAt: now(),
  }
  users.push(user)
  return user
}

export function findUserById(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

export function updateUserRecord(id: string, patch: Partial<User>): User | undefined {
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return undefined
  const updated = { ...users[idx], ...patch, id, updatedAt: now() }
  users[idx] = updated
  return updated
}

export function deleteUserRecord(id: string): boolean {
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return false
  users.splice(idx, 1)
  return true
}

export function queryUsers(opts: {
  page: number
  pageSize: number
  keyword?: string
  role?: string
  status?: string
  orgId?: string
}): { items: User[]; total: number; page: number; pageSize: number } {
  let filtered = [...users]
  if (opts.keyword) {
    const kw = opts.keyword.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.username.toLowerCase().includes(kw) ||
        u.displayName.toLowerCase().includes(kw) ||
        u.email.toLowerCase().includes(kw),
    )
  }
  if (opts.role) {
    filtered = filtered.filter((u) => u.roles.includes(opts.role as User['roles'][number]))
  }
  if (opts.status) {
    filtered = filtered.filter((u) => u.status === opts.status)
  }
  if (opts.orgId) {
    filtered = filtered.filter((u) => u.orgId === opts.orgId)
  }
  filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  const total = filtered.length
  const start = (opts.page - 1) * opts.pageSize
  return {
    items: filtered.slice(start, start + opts.pageSize),
    total,
    page: opts.page,
    pageSize: opts.pageSize,
  }
}

// —— ch41：组织树（固定 mock） ——
const DEFAULT_ORG_TREE: OrgNode = {
  id: 'org-root',
  name: 'ACME 集团',
  children: [
    {
      id: 'org-acme',
      name: 'ACME 总部',
      children: [
        { id: 'org-tech', name: '技术部', children: [{ id: 'org-fe', name: '前端组' }] },
        { id: 'org-sales', name: '销售部' },
      ],
    },
    {
      id: 'org-globex',
      name: 'Globex 分部',
      children: [{ id: 'org-globex-tech', name: 'Globex 技术部' }],
    },
  ],
}

let orgTree: OrgNode = DEFAULT_ORG_TREE

function resetOrgs() {
  orgTree = DEFAULT_ORG_TREE
}

/** 查找指定 id 的子树 */
export function findOrgNode(id: string): OrgNode | undefined {
  const search = (node: OrgNode): OrgNode | undefined => {
    if (node.id === id) return node
    if (node.children) {
      for (const child of node.children) {
        const found = search(child)
        if (found) return found
      }
    }
    return undefined
  }
  return search(orgTree)
}

export function getOrgTree(): OrgNode {
  return orgTree
}

// —— ch41：审计日志表 ——
const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    action: 'login',
    operator: 'admin@acme',
    resource: 'auth',
    resourceId: 'u-001',
    ip: '192.168.1.1',
    detail: '管理员登录',
    timestamp: '2026-01-01T10:00:00Z',
  },
  {
    id: 'log-002',
    action: 'create',
    operator: 'admin@acme',
    resource: 'user',
    resourceId: 'u-002',
    ip: '192.168.1.1',
    detail: '新建用户 technician@acme',
    timestamp: '2026-01-01T11:00:00Z',
  },
  {
    id: 'log-003',
    action: 'login',
    operator: 'technician@acme',
    resource: 'auth',
    resourceId: 'u-002',
    ip: '10.0.0.5',
    detail: '检测员登录',
    timestamp: '2026-01-01T12:00:00Z',
  },
  {
    id: 'log-004',
    action: 'permission_change',
    operator: 'admin@acme',
    resource: 'role',
    resourceId: 'role-viewer',
    ip: '192.168.1.1',
    detail: '修改 viewer 角色权限',
    timestamp: '2026-01-01T13:00:00Z',
  },
  {
    id: 'log-005',
    action: 'delete',
    operator: 'admin@globex',
    resource: 'user',
    resourceId: 'u-003',
    ip: '10.0.0.9',
    detail: '删除用户',
    timestamp: '2026-01-01T14:00:00Z',
  },
]

let auditLogs: AuditLog[] = [...DEFAULT_AUDIT_LOGS]

function resetAuditLogs() {
  auditLogs = [...DEFAULT_AUDIT_LOGS]
}

export function queryAuditLogs(opts: {
  page: number
  pageSize: number
  action?: string
  operator?: string
  ip?: string
}): { items: AuditLog[]; total: number; page: number; pageSize: number } {
  let filtered = [...auditLogs]
  if (opts.action) {
    filtered = filtered.filter((l) => l.action === opts.action)
  }
  if (opts.operator) {
    const op = opts.operator.toLowerCase()
    filtered = filtered.filter((l) => l.operator.toLowerCase().includes(op))
  }
  if (opts.ip) {
    filtered = filtered.filter((l) => l.ip.includes(opts.ip!))
  }
  // 倒序
  filtered.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
  const total = filtered.length
  const start = (opts.page - 1) * opts.pageSize
  return {
    items: filtered.slice(start, start + opts.pageSize),
    total,
    page: opts.page,
    pageSize: opts.pageSize,
  }
}
