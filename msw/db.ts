// Mock 内存数据库：仅 mock 层使用，测试间隔离由 tests/setup.ts 的 resetMockDb 保证。
// ch39：租户数据；ch40 追加用户/组织/权限数据；ch41 追加 userTable/orgTree/auditLogTable（只增）。
// ch43：追加平台租户管理、角色管理数据（只增不改）。

import type { User, OrgNode, AuditLog } from '../src/types/user'
import type { Role } from '../src/features/rbac/types'

/** 通用重置入口 */
export function resetMockDb() {
  resetTenants()
  resetUsers()
  resetOrgs()
  resetAuditLogs()
  resetRoles()
  resetApps()
  resetMenus()
  resetPositions()
  resetUserGroups()
  resetPermissionGroups()
  resetLoginMethods()
  resetSsoProviders()
  resetOAuth2Providers()
  resetTokenConfig()
  resetApiKeys()
  resetLoginSecurity()
  resetPasswordPolicy()
  resetRiskControl()
  resetNotificationConfig()
  resetOpenPlatformConfig()
}

// —— ch39/ch43：租户表（12 个） ——
export interface MockTenant {
  id: string
  name: string
  theme: {
    primary: string
    sidebar: string
    logoText: string
  }
  config?: {
    features?: string[]
    maxUsers?: number
    [key: string]: unknown
  }
}

const DEFAULT_TENANTS: MockTenant[] = [
  {
    id: 'acme',
    name: 'ACME 集团',
    theme: { primary: '#2563eb', sidebar: '#1e293b', logoText: 'ACME' },
    config: { features: ['sso', 'audit', 'rbac'], maxUsers: 200 },
  },
  {
    id: 'globex',
    name: 'Globex 科技',
    theme: { primary: '#059669', sidebar: '#064e3b', logoText: 'GLOBEX' },
    config: { features: ['sso', 'rbac'], maxUsers: 100 },
  },
  {
    id: 'initech',
    name: 'Initech 工程',
    theme: { primary: '#7c3aed', sidebar: '#2e1065', logoText: 'INITECH' },
    config: { features: ['sso', 'audit', 'rbac'], maxUsers: 50 },
  },
  {
    id: 'umbrella',
    name: 'Umbrella 生物',
    theme: { primary: '#dc2626', sidebar: '#450a0a', logoText: 'UMBRELLA' },
    config: { features: ['audit', 'rbac'], maxUsers: 80 },
  },
  {
    id: 'tyrell',
    name: 'Tyrell 未来',
    theme: { primary: '#0891b2', sidebar: '#0c4a6e', logoText: 'TYRELL' },
    config: { features: ['sso', 'rbac'], maxUsers: 150 },
  },
  {
    id: 'massive',
    name: 'Massive 动态',
    theme: { primary: '#ea580c', sidebar: '#431407', logoText: 'MASSIVE' },
    config: { features: ['sso', 'audit'], maxUsers: 60 },
  },
  {
    id: 'weyland',
    name: 'Weyland 航天',
    theme: { primary: '#65a30d', sidebar: '#1a2e05', logoText: 'WEYLAND' },
    config: { features: ['sso', 'audit', 'rbac'], maxUsers: 300 },
  },
  {
    id: 'cyberdyne',
    name: 'Cyberdyne 系统',
    theme: { primary: '#0f766e', sidebar: '#134e4a', logoText: 'CYBERDYNE' },
    config: { features: ['rbac'], maxUsers: 120 },
  },
  {
    id: 'buy',
    name: 'Buy n Large',
    theme: { primary: '#f59e0b', sidebar: '#451a03', logoText: 'BnL' },
    config: { features: ['sso', 'audit', 'rbac'], maxUsers: 500 },
  },
  {
    id: 'no',
    name: 'Noosphinx 媒体',
    theme: { primary: '#6366f1', sidebar: '#1e1b4b', logoText: 'NOO' },
    config: { features: ['sso', 'rbac'], maxUsers: 75 },
  },
  {
    id: 'olympus',
    name: 'Olympus 影像',
    theme: { primary: '#be185d', sidebar: '#500724', logoText: 'OLYMPUS' },
    config: { features: ['audit', 'rbac'], maxUsers: 90 },
  },
  {
    id: 'axiom',
    name: 'Axiom 航运',
    theme: { primary: '#2563eb', sidebar: '#1e3a5f', logoText: 'AXIOM' },
    config: { features: ['sso', 'audit', 'rbac'], maxUsers: 250 },
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

// —— ch41/ch43：用户表（18 个） ——
const DEFAULT_USERS: User[] = [
  // ACME
  { id: 'u-001', username: 'admin@acme', displayName: 'SaaS 管理员', email: 'admin@acme.com', orgId: 'org-acme', roles: ['admin'], status: 'active', createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z' },
  { id: 'u-002', username: 'technician@acme', displayName: '张检测', email: 'tech@acme.com', orgId: 'org-tech', roles: ['member'], status: 'active', createdAt: '2026-01-02T09:00:00Z', updatedAt: '2026-01-02T09:00:00Z' },
  { id: 'u-003', username: 'alice.chen@acme', displayName: '陈艾丽丝', email: 'alice@acme.com', orgId: 'org-fe', roles: ['admin'], status: 'active', createdAt: '2026-01-03T10:00:00Z', updatedAt: '2026-01-03T10:00:00Z' },
  { id: 'u-004', username: 'bob.wang@acme', displayName: '王大力', email: 'bob@acme.com', orgId: 'org-fe', roles: ['member'], status: 'active', createdAt: '2026-01-04T11:00:00Z', updatedAt: '2026-01-04T11:00:00Z' },
  { id: 'u-005', username: 'carol.li@acme', displayName: '李佳慧', email: 'carol@acme.com', orgId: 'org-sales', roles: ['manager'], status: 'active', createdAt: '2026-01-05T12:00:00Z', updatedAt: '2026-01-05T12:00:00Z' },
  { id: 'u-006', username: 'david.zhang@acme', displayName: '张明', email: 'david@acme.com', orgId: 'org-acme', roles: ['viewer'], status: 'pending', createdAt: '2026-01-06T13:00:00Z', updatedAt: '2026-01-06T13:00:00Z' },
  // GLOBEX
  { id: 'u-007', username: 'manager@globex', displayName: 'Globex 经理', email: 'manager@globex.com', orgId: 'org-globex', roles: ['manager'], status: 'active', createdAt: '2026-01-02T08:00:00Z', updatedAt: '2026-01-02T08:00:00Z' },
  { id: 'u-008', username: 'guest@globex', displayName: '访客账户', email: 'guest@globex.com', orgId: 'org-globex', roles: ['viewer'], status: 'disabled', createdAt: '2026-01-03T09:00:00Z', updatedAt: '2026-01-03T09:00:00Z' },
  { id: 'u-009', username: 'eva.liu@globex', displayName: '刘伊娃', email: 'eva@globex.com', orgId: 'org-globex-tech', roles: ['admin'], status: 'active', createdAt: '2026-01-04T10:00:00Z', updatedAt: '2026-01-04T10:00:00Z' },
  // INITECH
  { id: 'u-010', username: 'admin@initech', displayName: 'Initech 管理员', email: 'admin@initech.com', orgId: 'org-acme', roles: ['admin'], status: 'active', createdAt: '2026-01-02T08:30:00Z', updatedAt: '2026-01-02T08:30:00Z' },
  { id: 'u-011', username: 'frank.gao@initech', displayName: '高福', email: 'frank@initech.com', orgId: 'org-acme', roles: ['member'], status: 'active', createdAt: '2026-01-03T09:30:00Z', updatedAt: '2026-01-03T09:30:00Z' },
  // UMBRELLA
  { id: 'u-012', username: 'admin@umbrella', displayName: 'Umbrella 管理员', email: 'admin@umbrella.com', orgId: 'org-acme', roles: ['admin'], status: 'active', createdAt: '2026-01-02T09:00:00Z', updatedAt: '2026-01-02T09:00:00Z' },
  { id: 'u-013', username: 'researcher@umbrella', displayName: '研究员A', email: 'researcher@umbrella.com', orgId: 'org-acme', roles: ['member'], status: 'active', createdAt: '2026-01-02T10:00:00Z', updatedAt: '2026-01-02T10:00:00Z' },
  // WEYLAND
  { id: 'u-014', username: 'admin@weyland', displayName: 'Weyland 管理员', email: 'admin@weyland.com', orgId: 'org-acme', roles: ['admin'], status: 'active', createdAt: '2026-01-03T08:00:00Z', updatedAt: '2026-01-03T08:00:00Z' },
  // CYBERDYNE
  { id: 'u-015', username: 'ops@cyberdyne', displayName: 'Cyberdyne 运维', email: 'ops@cyberdyne.com', orgId: 'org-acme', roles: ['member'], status: 'active', createdAt: '2026-01-04T08:00:00Z', updatedAt: '2026-01-04T08:00:00Z' },
  // BUY
  { id: 'u-016', username: 'super@buy', displayName: 'Buy n Large 超管', email: 'super@buy.com', orgId: 'org-acme', roles: ['admin'], status: 'active', createdAt: '2026-01-04T09:00:00Z', updatedAt: '2026-01-04T09:00:00Z' },
  // NO
  { id: 'u-017', username: 'elena@no', displayName: '诺媒体编辑', email: 'elena@no.com', orgId: 'org-acme', roles: ['member'], status: 'active', createdAt: '2026-01-05T10:00:00Z', updatedAt: '2026-01-05T10:00:00Z' },
  // AXIOM
  { id: 'u-018', username: 'admin@axiom', displayName: 'Axiom 管理员', email: 'admin@axiom.com', orgId: 'org-acme', roles: ['admin'], status: 'active', createdAt: '2026-01-05T11:00:00Z', updatedAt: '2026-01-05T11:00:00Z' },
]

let users: User[] = [...DEFAULT_USERS]

function resetUsers() {
  users = [...DEFAULT_USERS]
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

/** 插入子节点到指定父节点下 */
export function insertOrgNode(parentId: string, name: string): OrgNode | undefined {
  const parent = findOrgNode(parentId)
  if (!parent) return undefined
  const child: OrgNode = {
    id: `org-${Math.random().toString(36).slice(2, 8)}`,
    name,
  }
  if (!parent.children) parent.children = []
  parent.children.push(child)
  return child
}

/** 递归查找父节点 */
function findParentOf(targetId: string, node: OrgNode): OrgNode | undefined {
  if (node.children) {
    for (const child of node.children) {
      if (child.id === targetId) return node
      const found = findParentOf(targetId, child)
      if (found) return found
    }
  }
  return undefined
}

/** 更新节点名称 */
export function updateOrgNodeRecord(id: string, name: string): OrgNode | undefined {
  const node = findOrgNode(id)
  if (!node) return undefined
  node.name = name
  return node
}

/** 删除节点（递归删子树） */
export function deleteOrgNodeRecord(id: string): boolean {
  const parent = findParentOf(id, orgTree)
  if (!parent || !parent.children) return false
  const idx = parent.children.findIndex((c) => c.id === id)
  if (idx === -1) return false
  parent.children.splice(idx, 1)
  return true
}

// —— ch41/ch43：审计日志表（20 条） ——
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
    detail: '删除用户 guest@globex',
    timestamp: '2026-01-01T14:00:00Z',
  },
  {
    id: 'log-006',
    action: 'update',
    operator: 'admin@globex',
    resource: 'user',
    resourceId: 'u-004',
    ip: '10.0.0.9',
    detail: '更新用户 manager@globex 角色为 manager',
    timestamp: '2026-01-02T09:15:00Z',
  },
  {
    id: 'log-007',
    action: 'login',
    operator: 'manager@initech',
    resource: 'auth',
    resourceId: 'u-005',
    ip: '172.16.0.8',
    detail: '经理登录',
    timestamp: '2026-01-02T10:30:00Z',
  },
  {
    id: 'log-008',
    action: 'create',
    operator: 'admin@umbrella',
    resource: 'user',
    resourceId: 'u-006',
    ip: '10.20.30.1',
    detail: '新建用户 researcher@umbrella',
    timestamp: '2026-01-02T14:22:00Z',
  },
  {
    id: 'log-009',
    action: 'permission_change',
    operator: 'admin@umbrella',
    resource: 'role',
    resourceId: 'role-researcher',
    ip: '10.20.30.1',
    detail: '新建 researcher 角色并授权',
    timestamp: '2026-01-02T15:05:00Z',
  },
  {
    id: 'log-010',
    action: 'login',
    operator: 'viewer@tyrell',
    resource: 'auth',
    resourceId: 'u-007',
    ip: '192.168.50.1',
    detail: '只读用户登录',
    timestamp: '2026-01-03T08:00:00Z',
  },
  {
    id: 'log-011',
    action: 'update',
    operator: 'admin@massive',
    resource: 'user',
    resourceId: 'u-008',
    ip: '172.20.0.15',
    detail: '禁用违规用户 spam@massive',
    timestamp: '2026-01-03T11:40:00Z',
  },
  {
    id: 'log-012',
    action: 'login',
    operator: 'admin@weyland',
    resource: 'auth',
    resourceId: 'u-009',
    ip: '10.100.0.1',
    detail: 'Weyland 管理员登录',
    timestamp: '2026-01-03T13:20:00Z',
  },
  {
    id: 'log-013',
    action: 'create',
    operator: 'admin@weyland',
    resource: 'user',
    resourceId: 'u-010',
    ip: '10.100.0.1',
    detail: '批量导入 20 名航天工程师',
    timestamp: '2026-01-03T14:00:00Z',
  },
  {
    id: 'log-014',
    action: 'permission_change',
    operator: 'admin@cyberdyne',
    resource: 'role',
    resourceId: 'role-ops',
    ip: '172.30.0.5',
    detail: '更新 ops 角色权限，移除 user:delete',
    timestamp: '2026-01-04T09:00:00Z',
  },
  {
    id: 'log-015',
    action: 'logout',
    operator: 'technician@acme',
    resource: 'auth',
    resourceId: 'u-002',
    ip: '10.0.0.5',
    detail: '检测员登出',
    timestamp: '2026-01-04T17:30:00Z',
  },
  {
    id: 'log-016',
    action: 'create',
    operator: 'admin@buy',
    resource: 'user',
    resourceId: 'u-011',
    ip: '10.50.0.20',
    detail: '新建超级管理员 super@buy',
    timestamp: '2026-01-04T09:00:00Z',
  },
  {
    id: 'log-017',
    action: 'update',
    operator: 'admin@no',
    resource: 'user',
    resourceId: 'u-012',
    ip: '172.18.0.99',
    detail: '更新媒体编辑 elena@no 的组织归属',
    timestamp: '2026-01-05T10:15:00Z',
  },
  {
    id: 'log-018',
    action: 'login',
    operator: 'admin@axiom',
    resource: 'auth',
    resourceId: 'u-013',
    ip: '10.80.0.1',
    detail: '航运平台管理员登录',
    timestamp: '2026-01-05T11:00:00Z',
  },
  {
    id: 'log-019',
    action: 'permission_change',
    operator: 'admin@axiom',
    resource: 'role',
    resourceId: 'role-fleet',
    ip: '10.80.0.1',
    detail: '新建 fleet-manager 角色授权船队管理权限',
    timestamp: '2026-01-05T11:30:00Z',
  },
  {
    id: 'log-020',
    action: 'delete',
    operator: 'admin@initech',
    resource: 'user',
    resourceId: 'u-014',
    ip: '172.16.0.8',
    detail: '删除离职员工 ex@initech',
    timestamp: '2026-01-05T16:45:00Z',
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
  startDate?: string
  endDate?: string
  type?: 'login' | 'security' | 'operation'
}): { items: AuditLog[]; total: number; page: number; pageSize: number } {
  const LOGIN_ACTIONS = new Set(['login', 'logout'])
  const SECURITY_ACTIONS = new Set(['permission_change'])
  const OPERATION_ACTIONS = new Set(['create', 'update', 'delete'])

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
  if (opts.startDate) {
    const start = new Date(opts.startDate).getTime()
    filtered = filtered.filter((l) => new Date(l.timestamp).getTime() >= start)
  }
  if (opts.endDate) {
    // endDate 当日包含，使用次日 00:00:00 之前
    const end = new Date(opts.endDate).getTime() + 86400 * 1000
    filtered = filtered.filter((l) => new Date(l.timestamp).getTime() < end)
  }
  if (opts.type === 'login') {
    filtered = filtered.filter((l) => LOGIN_ACTIONS.has(l.action))
  } else if (opts.type === 'security') {
    filtered = filtered.filter((l) => SECURITY_ACTIONS.has(l.action))
  } else if (opts.type === 'operation') {
    filtered = filtered.filter((l) => OPERATION_ACTIONS.has(l.action))
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

// —— ch43：平台租户管理（只增不改）——
export interface TenantCreateInput {
  name: string
  theme: { primary: string; sidebar: string; logoText: string }
  config?: { features?: string[]; maxUsers?: number }
}

export function insertTenant(input: TenantCreateInput): MockTenant {
  const tenant: MockTenant = {
    id: genId('tenant'),
    name: input.name,
    theme: input.theme,
    config: input.config ?? { features: [], maxUsers: 100 },
  }
  tenants.push(tenant)
  return tenant
}

export function updateTenantRecord(
  id: string,
  patch: Partial<TenantCreateInput>,
): MockTenant | undefined {
  const idx = tenants.findIndex((t) => t.id === id)
  if (idx === -1) return undefined
  const updated: MockTenant = {
    ...tenants[idx],
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.theme !== undefined ? { theme: patch.theme } : {}),
    ...(patch.config !== undefined ? { config: patch.config } : {}),
  }
  tenants[idx] = updated
  return updated
}

export function deleteTenantRecord(id: string): boolean {
  const idx = tenants.findIndex((t) => t.id === id)
  if (idx === -1) return false
  tenants.splice(idx, 1)
  return true
}

export function queryTenants(opts?: { keyword?: string }): MockTenant[] {
  if (!opts?.keyword) return [...tenants]
  const kw = opts.keyword.toLowerCase()
  return tenants.filter((t) => t.name.toLowerCase().includes(kw))
}

// —— ch43/ch44：角色管理（8 个，含菜单权限）——
export interface RoleCreateInput {
  name: string
  permissions: string[]
  menuPermissions?: { menuId: string; actions: string[] }[]
}

const DEFAULT_ROLES: Role[] = [
  {
    id: 'role-admin',
    name: 'admin',
    permissions: ['user:read', 'user:create', 'user:update', 'user:delete', 'org:read', 'org:write', 'audit:read'],
    menuPermissions: [
      { menuId: 'm-lab-01', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-02', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-03', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-04', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-05', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-06', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-07', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-08', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-09', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-10', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-11', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-12', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-13', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-14', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-15', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-16', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-17', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-18', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-19', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-20', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-settings', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-21', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-22', actions: ['view', 'create', 'update', 'delete'] },
    ],
  },
  {
    id: 'role-viewer',
    name: 'viewer',
    permissions: ['user:read', 'org:read'],
    menuPermissions: [
      { menuId: 'm-lab-01', actions: ['view'] },
      { menuId: 'm-lab-02', actions: ['view'] },
      { menuId: 'm-lab-03', actions: ['view'] },
      { menuId: 'm-lab-06', actions: ['view'] },
      { menuId: 'm-lab-07', actions: ['view'] },
      { menuId: 'm-lab-10', actions: ['view'] },
    ],
  },
  {
    id: 'role-manager',
    name: 'manager',
    permissions: ['user:read', 'user:create', 'user:update', 'org:read', 'org:write'],
    menuPermissions: [
      { menuId: 'm-lab-01', actions: ['view'] },
      { menuId: 'm-lab-02', actions: ['view', 'create', 'update'] },
      { menuId: 'm-lab-03', actions: ['view', 'create', 'update'] },
      { menuId: 'm-lab-04', actions: ['view', 'create', 'update'] },
      { menuId: 'm-lab-05', actions: ['view', 'create', 'update'] },
      { menuId: 'm-lab-06', actions: ['view', 'create', 'update'] },
      { menuId: 'm-lab-07', actions: ['view'] },
      { menuId: 'm-lab-08', actions: ['view', 'create', 'update'] },
      { menuId: 'm-lab-09', actions: ['view'] },
      { menuId: 'm-lab-10', actions: ['view'] },
      { menuId: 'm-lab-11', actions: ['view'] },
    ],
  },
  {
    id: 'role-auditor',
    name: 'auditor',
    permissions: ['user:read', 'org:read', 'audit:read'],
    menuPermissions: [
      { menuId: 'm-lab-01', actions: ['view'] },
      { menuId: 'm-lab-06', actions: ['view'] },
      { menuId: 'm-lab-07', actions: ['view'] },
      { menuId: 'm-lab-10', actions: ['view'] },
    ],
  },
  {
    id: 'role-operator',
    name: 'operator',
    permissions: ['user:read', 'user:update', 'org:read'],
    menuPermissions: [
      { menuId: 'm-lab-03', actions: ['view', 'create', 'update'] },
      { menuId: 'm-lab-05', actions: ['view', 'create', 'update'] },
    ],
  },
  {
    id: 'role-member',
    name: 'member',
    permissions: ['user:read', 'org:read'],
    menuPermissions: [
      { menuId: 'm-lab-01', actions: ['view'] },
      { menuId: 'm-lab-05', actions: ['view', 'create', 'update'] },
    ],
  },
  {
    id: 'role-helpdesk',
    name: 'helpdesk',
    permissions: ['user:read', 'user:update'],
    menuPermissions: [
      { menuId: 'm-lab-21', actions: ['view', 'update'] },
    ],
  },
  {
    id: 'role-owner',
    name: 'owner',
    permissions: ['user:read', 'user:create', 'user:update', 'user:delete', 'org:read', 'org:write', 'audit:read'],
    menuPermissions: [
      { menuId: 'm-lab-01', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-02', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-03', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-04', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-05', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-06', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-07', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-08', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-09', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-10', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-11', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-12', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-13', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-14', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-15', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-16', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-17', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-18', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-19', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-20', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-settings', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-21', actions: ['view', 'create', 'update', 'delete'] },
      { menuId: 'm-lab-22', actions: ['view', 'create', 'update', 'delete'] },
    ],
  },
]

let roles: Role[] = [...DEFAULT_ROLES]

function resetRoles() {
  roles = [...DEFAULT_ROLES]
}

export function listRoles(): Role[] {
  return [...roles]
}

export function findRoleById(id: string): Role | undefined {
  return roles.find((r) => r.id === id)
}

export function insertRole(input: RoleCreateInput): Role {
  const role: Role = {
    id: genId('role'),
    name: input.name,
    permissions: input.permissions,
    menuPermissions: (input.menuPermissions ?? []) as Role['menuPermissions'],
  }
  roles.push(role)
  return role
}

export function updateRoleRecord(id: string, patch: Partial<RoleCreateInput>): Role | undefined {
  const idx = roles.findIndex((r) => r.id === id)
  if (idx === -1) return undefined
  const updated: Role = {
    ...roles[idx],
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.permissions !== undefined ? { permissions: patch.permissions } : {}),
    ...(patch.menuPermissions !== undefined ? { menuPermissions: patch.menuPermissions as Role['menuPermissions'] } : {}),
  }
  roles[idx] = updated
  return updated
}

export function deleteRoleRecord(id: string): boolean {
  const idx = roles.findIndex((r) => r.id === id)
  if (idx === -1) return false
  roles.splice(idx, 1)
  return true
}

// —— ch44：应用管理与菜单管理（只增不改）——

export interface MockApp {
  id: string
  name: string
  code: string
  description?: string
  theme: string
  sort: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface MockMenu {
  id: string
  name: string
  path: string
  appId: string
  parentId: string | null
  icon?: string
  sort: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

// 建筑工程实验室管理系统菜单（参考 lab-management-system/src/app/router.tsx）
const LAB_LAB_MENUS: MockMenu[] = [
  // 业务管理（流程线）
  { id: 'm-lab-01', name: '仪表盘', path: 'dashboard', appId: 'app-lab', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-02', name: '合同管理', path: 'contracts', appId: 'app-lab', parentId: null, sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-03', name: '收样管理', path: 'receipts', appId: 'app-lab', parentId: null, sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-04', name: '任务安排', path: 'task-assignment', appId: 'app-lab', parentId: null, sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-05', name: '数据录入', path: 'data-entry', appId: 'app-lab', parentId: null, sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-06', name: '报告审核', path: 'report-review', appId: 'app-lab', parentId: null, sort: 6, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-07', name: '报告批准', path: 'report-approve', appId: 'app-lab', parentId: null, sort: 7, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-08', name: '报告发放', path: 'report-issue', appId: 'app-lab', parentId: null, sort: 8, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-09', name: '报告归档', path: 'report-archive', appId: 'app-lab', parentId: null, sort: 9, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-10', name: '统计报表', path: 'summary', appId: 'app-lab', parentId: null, sort: 10, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  // 基础管理
  { id: 'm-lab-11', name: '机构信息', path: 'org-info', appId: 'app-lab', parentId: null, sort: 11, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-12', name: '报告分类', path: 'report-categories', appId: 'app-lab', parentId: null, sort: 12, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-13', name: '检测参数', path: 'test-parameters', appId: 'app-lab', parentId: null, sort: 13, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-14', name: '检测标准', path: 'test-standards', appId: 'app-lab', parentId: null, sort: 14, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-15', name: '技术要求', path: 'technical-requirements', appId: 'app-lab', parentId: null, sort: 15, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-16', name: '型号管理', path: 'models', appId: 'app-lab', parentId: null, sort: 16, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-17', name: '规格管理', path: 'specifications', appId: 'app-lab', parentId: null, sort: 17, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-18', name: '等级管理', path: 'grades', appId: 'app-lab', parentId: null, sort: 18, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-19', name: '牌号管理', path: 'brands', appId: 'app-lab', parentId: null, sort: 19, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-20', name: '报告模板', path: 'report-templates', appId: 'app-lab', parentId: null, sort: 20, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  // 设置子菜单
  { id: 'm-lab-21', name: '用户管理', path: 'users', appId: 'app-lab', parentId: 'm-lab-settings', sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-22', name: '角色管理', path: 'roles', appId: 'app-lab', parentId: 'm-lab-settings', sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'm-lab-settings', name: '设置', path: 'settings', appId: 'app-lab', parentId: null, sort: 21, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
]

// 11 个应用：建筑工程实验室管理 + 10 个补充
const DEFAULT_APPS: MockApp[] = [
  // 1. 建筑工程实验室管理系统
  {
    id: 'app-lab',
    name: '建筑工程实验室管理系统',
    code: 'lab-management',
    description: '建筑工程质量检测实验室信息化管理系统',
    theme: '#2563eb',
    sort: 1,
    enabled: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  // 2. 企业资源计划系统
  {
    id: 'app-erp',
    name: '企业资源计划系统',
    code: 'erp',
    description: '企业核心资源计划与管理平台',
    theme: '#059669',
    sort: 2,
    enabled: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  // 3. 客户关系管理系统
  {
    id: 'app-crm',
    name: '客户关系管理系统',
    code: 'crm',
    description: '客户全生命周期管理平台',
    theme: '#7c3aed',
    sort: 3,
    enabled: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  // 4. 人力资源管理系统
  {
    id: 'app-hr',
    name: '人力资源管理系统',
    code: 'hr',
    description: '企业人力资源管理数字化平台',
    theme: '#dc2626',
    sort: 4,
    enabled: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  // 5. 财务管理系统
  {
    id: 'app-finance',
    name: '财务管理系统',
    code: 'finance',
    description: '企业财务报表与资金管理平台',
    theme: '#0891b2',
    sort: 5,
    enabled: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  // 6. 供应链管理系统
  {
    id: 'app-scm',
    name: '供应链管理系统',
    code: 'scm',
    description: '采购、仓储与物流一体化管理',
    theme: '#ea580c',
    sort: 6,
    enabled: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  // 7. 项目管理系统
  {
    id: 'app-pm',
    name: '项目管理系统',
    code: 'pm',
    description: '企业级项目全生命周期管理',
    theme: '#65a30d',
    sort: 7,
    enabled: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  // 8. 知识管理系统
  {
    id: 'app-kms',
    name: '知识管理系统',
    code: 'kms',
    description: '企业知识沉淀与共享平台',
    theme: '#0f766e',
    sort: 8,
    enabled: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  // 9. 协同办公系统
  {
    id: 'app-oa',
    name: '协同办公系统',
    code: 'oa',
    description: '企业内部审批与协同办公平台',
    theme: '#f59e0b',
    sort: 9,
    enabled: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  // 10. 设备管理系统
  {
    id: 'app-device',
    name: '设备管理系统',
    code: 'device',
    description: '企业生产设备全生命周期管理',
    theme: '#6366f1',
    sort: 10,
    enabled: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  // 11. 质量管理系统
  {
    id: 'app-qms',
    name: '质量管理系统',
    code: 'qms',
    description: '企业质量管理体系与合规管理',
    theme: '#be185d',
    sort: 11,
    enabled: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

// 10 个补充应用的菜单数据（占位菜单）
const DEFAULT_MENU_TEMPLATES: Record<string, MockMenu[]> = {
  'app-erp': [
    { id: 'm-erp-01', name: '仪表盘', path: 'dashboard', appId: 'app-erp', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-erp-02', name: '采购管理', path: 'purchase', appId: 'app-erp', parentId: null, sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-erp-03', name: '销售管理', path: 'sales', appId: 'app-erp', parentId: null, sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-erp-04', name: '库存管理', path: 'inventory', appId: 'app-erp', parentId: null, sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-erp-05', name: '生产计划', path: 'production', appId: 'app-erp', parentId: null, sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-erp-06', name: '财务管理', path: 'finance', appId: 'app-erp', parentId: null, sort: 6, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-erp-settings', name: '系统设置', path: 'settings', appId: 'app-erp', parentId: null, sort: 7, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  ],
  'app-crm': [
    { id: 'm-crm-01', name: '仪表盘', path: 'dashboard', appId: 'app-crm', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-crm-02', name: '客户列表', path: 'customers', appId: 'app-crm', parentId: null, sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-crm-03', name: '商机管理', path: 'opportunities', appId: 'app-crm', parentId: null, sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-crm-04', name: '销售漏斗', path: 'funnel', appId: 'app-crm', parentId: null, sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-crm-05', name: '合同管理', path: 'contracts', appId: 'app-crm', parentId: null, sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-crm-06', name: '统计分析', path: 'analytics', appId: 'app-crm', parentId: null, sort: 6, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-crm-settings', name: '系统设置', path: 'settings', appId: 'app-crm', parentId: null, sort: 7, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  ],
  'app-hr': [
    { id: 'm-hr-01', name: '仪表盘', path: 'dashboard', appId: 'app-hr', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-hr-02', name: '组织架构', path: 'org', appId: 'app-hr', parentId: null, sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-hr-03', name: '员工管理', path: 'employees', appId: 'app-hr', parentId: null, sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-hr-04', name: '招聘管理', path: 'recruitment', appId: 'app-hr', parentId: null, sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-hr-05', name: '考勤管理', path: 'attendance', appId: 'app-hr', parentId: null, sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-hr-06', name: '薪酬管理', path: 'payroll', appId: 'app-hr', parentId: null, sort: 6, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-hr-07', name: '绩效管理', path: 'performance', appId: 'app-hr', parentId: null, sort: 7, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-hr-settings', name: '系统设置', path: 'settings', appId: 'app-hr', parentId: null, sort: 8, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  ],
  'app-finance': [
    { id: 'm-finance-01', name: '仪表盘', path: 'dashboard', appId: 'app-finance', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-finance-02', name: '总账管理', path: 'ledger', appId: 'app-finance', parentId: null, sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-finance-03', name: '应收应付', path: 'ar-ap', appId: 'app-finance', parentId: null, sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-finance-04', name: '费用报销', path: 'expense', appId: 'app-finance', parentId: null, sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-finance-05', name: '财务报表', path: 'reports', appId: 'app-finance', parentId: null, sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-finance-06', name: '预算管理', path: 'budget', appId: 'app-finance', parentId: null, sort: 6, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-finance-settings', name: '系统设置', path: 'settings', appId: 'app-finance', parentId: null, sort: 7, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  ],
  'app-scm': [
    { id: 'm-scm-01', name: '仪表盘', path: 'dashboard', appId: 'app-scm', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-scm-02', name: '采购订单', path: 'purchase-orders', appId: 'app-scm', parentId: null, sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-scm-03', name: '供应商管理', path: 'suppliers', appId: 'app-scm', parentId: null, sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-scm-04', name: '仓储管理', path: 'warehouse', appId: 'app-scm', parentId: null, sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-scm-05', name: '物流配送', path: 'logistics', appId: 'app-scm', parentId: null, sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-scm-06', name: '供应链分析', path: 'analytics', appId: 'app-scm', parentId: null, sort: 6, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-scm-settings', name: '系统设置', path: 'settings', appId: 'app-scm', parentId: null, sort: 7, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  ],
  'app-pm': [
    { id: 'm-pm-01', name: '仪表盘', path: 'dashboard', appId: 'app-pm', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-pm-02', name: '项目列表', path: 'projects', appId: 'app-pm', parentId: null, sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-pm-03', name: '任务看板', path: 'tasks', appId: 'app-pm', parentId: null, sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-pm-04', name: '甘特图', path: 'gantt', appId: 'app-pm', parentId: null, sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-pm-05', name: '资源管理', path: 'resources', appId: 'app-pm', parentId: null, sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-pm-06', name: '风险管理', path: 'risks', appId: 'app-pm', parentId: null, sort: 6, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-pm-settings', name: '系统设置', path: 'settings', appId: 'app-pm', parentId: null, sort: 7, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  ],
  'app-kms': [
    { id: 'm-kms-01', name: '仪表盘', path: 'dashboard', appId: 'app-kms', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-kms-02', name: '知识库', path: 'repository', appId: 'app-kms', parentId: null, sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-kms-03', name: '文档管理', path: 'documents', appId: 'app-kms', parentId: null, sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-kms-04', name: '问答中心', path: 'qa', appId: 'app-kms', parentId: null, sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-kms-05', name: '知识地图', path: 'map', appId: 'app-kms', parentId: null, sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-kms-settings', name: '系统设置', path: 'settings', appId: 'app-kms', parentId: null, sort: 6, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  ],
  'app-oa': [
    { id: 'm-oa-01', name: '仪表盘', path: 'dashboard', appId: 'app-oa', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-oa-02', name: '请假申请', path: 'leave', appId: 'app-oa', parentId: null, sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-oa-03', name: '报销申请', path: 'expense', appId: 'app-oa', parentId: null, sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-oa-04', name: '公文流转', path: 'documents', appId: 'app-oa', parentId: null, sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-oa-05', name: '会议管理', path: 'meetings', appId: 'app-oa', parentId: null, sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-oa-06', name: '公告通知', path: 'announcements', appId: 'app-oa', parentId: null, sort: 6, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-oa-settings', name: '系统设置', path: 'settings', appId: 'app-oa', parentId: null, sort: 7, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  ],
  'app-device': [
    { id: 'm-device-01', name: '仪表盘', path: 'dashboard', appId: 'app-device', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-device-02', name: '设备台账', path: 'assets', appId: 'app-device', parentId: null, sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-device-03', name: '维护保养', path: 'maintenance', appId: 'app-device', parentId: null, sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-device-04', name: '故障报修', path: 'repair', appId: 'app-device', parentId: null, sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-device-05', name: '设备巡检', path: 'inspection', appId: 'app-device', parentId: null, sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-device-06', name: '统计分析', path: 'analytics', appId: 'app-device', parentId: null, sort: 6, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-device-settings', name: '系统设置', path: 'settings', appId: 'app-device', parentId: null, sort: 7, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  ],
  'app-qms': [
    { id: 'm-qms-01', name: '仪表盘', path: 'dashboard', appId: 'app-qms', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-qms-02', name: '质量标准', path: 'standards', appId: 'app-qms', parentId: null, sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-qms-03', name: '质量检测', path: 'inspection', appId: 'app-qms', parentId: null, sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-qms-04', name: '不合格品管理', path: 'nonconformance', appId: 'app-qms', parentId: null, sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-qms-05', name: '纠正预防', path: 'cap', appId: 'app-qms', parentId: null, sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-qms-06', name: '质量评审', path: 'audit', appId: 'app-qms', parentId: null, sort: 6, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-qms-07', name: '合规管理', path: 'compliance', appId: 'app-qms', parentId: null, sort: 7, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'm-qms-settings', name: '系统设置', path: 'settings', appId: 'app-qms', parentId: null, sort: 8, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  ],
}

let apps: MockApp[] = [...DEFAULT_APPS]
let menus: MockMenu[] = [...LAB_LAB_MENUS]

function resetApps() {
  apps = [...DEFAULT_APPS]
}

function resetMenus() {
  menus = [...LAB_LAB_MENUS]
  // 重建 lab 以外的菜单
  for (const appId of Object.keys(DEFAULT_MENU_TEMPLATES)) {
    const appMenus = DEFAULT_MENU_TEMPLATES[appId]
    if (appMenus) menus.push(...appMenus)
  }
}

export function listApps(): MockApp[] {
  return [...apps].sort((a, b) => a.sort - b.sort)
}

export function findApp(id: string): MockApp | undefined {
  return apps.find((a) => a.id === id)
}

export function insertApp(input: Omit<MockApp, 'id' | 'createdAt' | 'updatedAt'>): MockApp {
  const now = new Date().toISOString()
  const app: MockApp = {
    ...input,
    id: genId('app'),
    createdAt: now,
    updatedAt: now,
  }
  apps.push(app)
  return app
}

export function updateAppRecord(id: string, patch: Partial<MockApp>): MockApp | undefined {
  const idx = apps.findIndex((a) => a.id === id)
  if (idx === -1) return undefined
  apps[idx] = { ...apps[idx], ...patch, id, updatedAt: new Date().toISOString() }
  return apps[idx]
}

export function deleteAppRecord(id: string): boolean {
  const idx = apps.findIndex((a) => a.id === id)
  if (idx === -1) return false
  apps.splice(idx, 1)
  // 级联删除菜单
  menus = menus.filter((m) => m.appId !== id)
  return true
}

export function queryApps(opts?: { keyword?: string }): MockApp[] {
  if (!opts?.keyword) return listApps()
  const kw = opts.keyword.toLowerCase()
  return apps.filter(
    (a) =>
      a.name.toLowerCase().includes(kw) ||
      a.code.toLowerCase().includes(kw) ||
      (a.description ?? '').toLowerCase().includes(kw),
  ).sort((a, b) => a.sort - b.sort)
}

export function listMenus(appId?: string): MockMenu[] {
  if (appId) return menus.filter((m) => m.appId === appId).sort((a, b) => a.sort - b.sort)
  return [...menus].sort((a, b) => a.sort - b.sort)
}

export function findMenu(id: string): MockMenu | undefined {
  return menus.find((m) => m.id === id)
}

export function insertMenu(input: Omit<MockMenu, 'id' | 'createdAt' | 'updatedAt'>): MockMenu {
  const now = new Date().toISOString()
  const menu: MockMenu = {
    ...input,
    id: genId('m'),
    createdAt: now,
    updatedAt: now,
  }
  menus.push(menu)
  return menu
}

export function updateMenuRecord(id: string, patch: Partial<MockMenu>): MockMenu | undefined {
  const idx = menus.findIndex((m) => m.id === id)
  if (idx === -1) return undefined
  menus[idx] = { ...menus[idx], ...patch, id, updatedAt: new Date().toISOString() }
  return menus[idx]
}

export function deleteMenuRecord(id: string): boolean {
  const idx = menus.findIndex((m) => m.id === id)
  if (idx === -1) return false
  menus.splice(idx, 1)
  // 级联删除子菜单
  menus = menus.filter((m) => m.parentId !== id)
  return true
}

export function queryMenus(appId: string): MockMenu[] {
  return menus.filter((m) => m.appId === appId).sort((a, b) => a.sort - b.sort)
}

// ============================================================
// ch45：新模块 mock 数据（只增不改）
// ============================================================

// —— 岗位管理（7）——
export interface MockPosition {
  id: string
  name: string
  code: string
  description?: string
  sort: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

const DEFAULT_POSITIONS: MockPosition[] = [
  { id: 'pos-001', name: '技术总监', code: 'CTO', description: '技术最高负责人', sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'pos-002', name: '研发工程师', code: 'RD', description: '研发人员', sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'pos-003', name: '测试工程师', code: 'QA', description: '测试人员', sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'pos-004', name: '产品经理', code: 'PM', description: '产品规划与管理', sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'pos-005', name: 'UI设计师', code: 'UI', description: '界面设计', sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'pos-006', name: '运维工程师', code: 'OPS', description: '运维保障', sort: 6, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'pos-007', name: '数据分析师', code: 'DA', description: '数据分析', sort: 7, enabled: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
]

let positions: MockPosition[] = [...DEFAULT_POSITIONS]

function resetPositions() {
  positions = [...DEFAULT_POSITIONS]
}

export function listPositions(): MockPosition[] {
  return [...positions].sort((a, b) => a.sort - b.sort)
}

export function findPosition(id: string): MockPosition | undefined {
  return positions.find((p) => p.id === id)
}

export function insertPosition(input: Omit<MockPosition, 'id' | 'createdAt' | 'updatedAt'>): MockPosition {
  const now = new Date().toISOString()
  const p: MockPosition = { ...input, id: genId('pos'), createdAt: now, updatedAt: now }
  positions.push(p)
  return p
}

export function updatePositionRecord(id: string, patch: Partial<MockPosition>): MockPosition | undefined {
  const idx = positions.findIndex((p) => p.id === id)
  if (idx === -1) return undefined
  positions[idx] = { ...positions[idx], ...patch, id, updatedAt: new Date().toISOString() }
  return positions[idx]
}

export function deletePositionRecord(id: string): boolean {
  const idx = positions.findIndex((p) => p.id === id)
  if (idx === -1) return false
  positions.splice(idx, 1)
  return true
}

// —— 用户组（12）——
export interface MockUserGroup {
  id: string
  name: string
  description?: string
  memberCount: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

const DEFAULT_USER_GROUPS: MockUserGroup[] = [
  { id: 'ug-001', name: '华东区销售团队', description: '负责华东区域销售', memberCount: 12, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'ug-002', name: '研发一组', description: '核心研发团队', memberCount: 8, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'ug-003', name: '外包人员组', description: '外部合作人员', memberCount: 25, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'ug-004', name: '管理层', description: '公司管理层', memberCount: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'ug-005', name: '新员工培训组', description: '入职培训分组', memberCount: 30, enabled: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
]

let userGroups: MockUserGroup[] = [...DEFAULT_USER_GROUPS]

function resetUserGroups() {
  userGroups = [...DEFAULT_USER_GROUPS]
}

export function listUserGroups(): MockUserGroup[] {
  return [...userGroups]
}

export function insertUserGroup(input: Omit<MockUserGroup, 'id' | 'createdAt' | 'updatedAt' | 'memberCount'>): MockUserGroup {
  const now = new Date().toISOString()
  const g: MockUserGroup = { ...input, id: genId('ug'), memberCount: 0, createdAt: now, updatedAt: now }
  userGroups.push(g)
  return g
}

export function updateUserGroupRecord(id: string, patch: Partial<MockUserGroup>): MockUserGroup | undefined {
  const idx = userGroups.findIndex((g) => g.id === id)
  if (idx === -1) return undefined
  userGroups[idx] = { ...userGroups[idx], ...patch, id }
  return userGroups[idx]
}

export function deleteUserGroupRecord(id: string): boolean {
  const idx = userGroups.findIndex((g) => g.id === id)
  if (idx === -1) return false
  userGroups.splice(idx, 1)
  return true
}

// —— 权限组（10）——
export interface MockPermissionGroup {
  id: string
  name: string
  description?: string
  permissions: string[]
  menuIds: string[]
  sort: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

const DEFAULT_PERMISSION_GROUPS: MockPermissionGroup[] = [
  {
    id: 'pg-001', name: '超级管理员', description: '拥有所有权限',
    permissions: ['user:*', 'role:*', 'org:*', 'audit:*', 'app:*', 'menu:*', 'position:*', 'group:*'],
    menuIds: ['*'],
    sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'pg-002', name: '运营人员', description: '日常运营权限',
    permissions: ['user:read', 'user:update', 'role:read', 'org:read', 'audit:read'],
    menuIds: ['m-lab-01', 'm-lab-02', 'm-lab-03'],
    sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'pg-003', name: '访客', description: '只读权限',
    permissions: ['user:read', 'org:read'],
    menuIds: ['m-lab-01'],
    sort: 3, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'pg-004', name: '审计员', description: '安全审计权限',
    permissions: ['audit:read', 'user:read', 'org:read'],
    menuIds: ['m-lab-audit'],
    sort: 4, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'pg-005', name: '开发者', description: '研发人员权限',
    permissions: ['user:read', 'user:create', 'role:read', 'org:read', 'org:write'],
    menuIds: ['m-lab-01', 'm-lab-02', 'm-lab-03', 'm-lab-04', 'm-lab-05'],
    sort: 5, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  },
]

let permissionGroups: MockPermissionGroup[] = [...DEFAULT_PERMISSION_GROUPS]

function resetPermissionGroups() {
  permissionGroups = [...DEFAULT_PERMISSION_GROUPS]
}

export function listPermissionGroups(): MockPermissionGroup[] {
  return [...permissionGroups].sort((a, b) => a.sort - b.sort)
}

export function insertPermissionGroup(input: Omit<MockPermissionGroup, 'id' | 'createdAt' | 'updatedAt'>): MockPermissionGroup {
  const now = new Date().toISOString()
  const g: MockPermissionGroup = { ...input, id: genId('pg'), createdAt: now, updatedAt: now }
  permissionGroups.push(g)
  return g
}

export function updatePermissionGroupRecord(id: string, patch: Partial<MockPermissionGroup>): MockPermissionGroup | undefined {
  const idx = permissionGroups.findIndex((g) => g.id === id)
  if (idx === -1) return undefined
  permissionGroups[idx] = { ...permissionGroups[idx], ...patch, id, updatedAt: new Date().toISOString() }
  return permissionGroups[idx]
}

export function deletePermissionGroupRecord(id: string): boolean {
  const idx = permissionGroups.findIndex((g) => g.id === id)
  if (idx === -1) return false
  permissionGroups.splice(idx, 1)
  return true
}

// —— 登录方式配置（13-18）——
export interface MockLoginMethod {
  id: string
  method: string
  name: string
  description?: string
  enabled: boolean
  sort: number
}

const DEFAULT_LOGIN_METHODS: MockLoginMethod[] = [
  { id: 'lm-001', method: 'password', name: '用户名密码登录', description: '账号密码认证', enabled: true, sort: 1 },
  { id: 'lm-002', method: 'email_code', name: '邮箱验证码登录', description: '邮件发送一次性验证码', enabled: true, sort: 2 },
  { id: 'lm-003', method: 'sms_code', name: '手机验证码登录', description: '短信发送一次性验证码', enabled: false, sort: 3 },
  { id: 'lm-004', method: 'totp', name: '双因素认证（TOTP）', description: '基于时间的一次性密码', enabled: false, sort: 4 },
  { id: 'lm-005', method: 'sso', name: '单点登录（SSO）', description: '企业 SSO 统一认证', enabled: true, sort: 5 },
  { id: 'lm-006', method: 'oauth2', name: 'OAuth2 登录', description: '第三方账号登录（Google/GitHub）', enabled: false, sort: 6 },
]

let loginMethods: MockLoginMethod[] = [...DEFAULT_LOGIN_METHODS]

function resetLoginMethods() {
  loginMethods = [...DEFAULT_LOGIN_METHODS]
}

export function listLoginMethods(): MockLoginMethod[] {
  return [...loginMethods].sort((a, b) => a.sort - b.sort)
}

export function updateLoginMethod(id: string, patch: Partial<MockLoginMethod>): MockLoginMethod | undefined {
  const idx = loginMethods.findIndex((m) => m.id === id)
  if (idx === -1) return undefined
  loginMethods[idx] = { ...loginMethods[idx], ...patch }
  return loginMethods[idx]
}

// —— SSO / OAuth2 提供商（17/18）——
export interface MockSsoProvider {
  id: string; name: string; type: string; clientId?: string; issuerUrl?: string; enabled: boolean
}
export interface MockOAuth2Provider {
  id: string; name: string; provider: string; clientId?: string; enabled: boolean
}

const DEFAULT_SSO_PROVIDERS: MockSsoProvider[] = [
  { id: 'sso-001', name: '企业 IDP', type: 'oidc', clientId: 'client-oidc-001', issuerUrl: 'https://idp.example.com', enabled: true },
]
const DEFAULT_OAUTH2_PROVIDERS: MockOAuth2Provider[] = [
  { id: 'oauth-001', name: 'Google', provider: 'google', clientId: 'google-client-id', enabled: false },
  { id: 'oauth-002', name: 'GitHub', provider: 'github', clientId: 'github-client-id', enabled: true },
  { id: 'oauth-003', name: '微信', provider: 'wechat', clientId: 'wechat-client-id', enabled: false },
]

let ssoProviders: MockSsoProvider[] = [...DEFAULT_SSO_PROVIDERS]
let oauth2Providers: MockOAuth2Provider[] = [...DEFAULT_OAUTH2_PROVIDERS]

function resetSsoProviders() { ssoProviders = [...DEFAULT_SSO_PROVIDERS] }
function resetOAuth2Providers() { oauth2Providers = [...DEFAULT_OAUTH2_PROVIDERS] }

export function listSsoProviders(): MockSsoProvider[] { return [...ssoProviders] }
export function listOAuth2Providers(): MockOAuth2Provider[] { return [...oauth2Providers] }

export function updateSsoProvider(id: string, patch: Partial<MockSsoProvider>): MockSsoProvider | undefined {
  const idx = ssoProviders.findIndex((p) => p.id === id)
  if (idx === -1) return undefined
  ssoProviders[idx] = { ...ssoProviders[idx], ...patch }
  return ssoProviders[idx]
}

export function updateOAuth2Provider(id: string, patch: Partial<MockOAuth2Provider>): MockOAuth2Provider | undefined {
  const idx = oauth2Providers.findIndex((p) => p.id === id)
  if (idx === -1) return undefined
  oauth2Providers[idx] = { ...oauth2Providers[idx], ...patch }
  return oauth2Providers[idx]
}

// —— Token 配置（22）——
export interface MockTokenConfig {
  id: string; accessTokenTtl: number; refreshTokenTtl: number; refreshTokenEnabled: boolean; tokenRevocationEnabled: boolean
}

const DEFAULT_TOKEN_CONFIG: MockTokenConfig = {
  id: 'tc-001',
  accessTokenTtl: 3600,
  refreshTokenTtl: 604800,
  refreshTokenEnabled: true,
  tokenRevocationEnabled: true,
}
let tokenConfig: MockTokenConfig = { ...DEFAULT_TOKEN_CONFIG }

export function getTokenConfig(): MockTokenConfig { return { ...tokenConfig } }
export function updateTokenConfig(patch: Partial<MockTokenConfig>): MockTokenConfig {
  tokenConfig = { ...tokenConfig, ...patch }
  return tokenConfig
}
function resetTokenConfig() { tokenConfig = { ...DEFAULT_TOKEN_CONFIG } }

// —— API Key（24）——
export interface MockApiKey {
  id: string; name: string; keyPrefix: string; scopes: string[]; expiresAt?: string; enabled: boolean; createdAt: string; lastUsedAt?: string
}

const DEFAULT_API_KEYS: MockApiKey[] = [
  { id: 'ak-001', name: '内部服务 Key', keyPrefix: 'sk_live_a1b2', scopes: ['read', 'write'], enabled: true, createdAt: '2026-01-01T00:00:00Z', lastUsedAt: '2026-07-01T10:00:00Z' },
  { id: 'ak-002', name: '合作伙伴 Key', keyPrefix: 'sk_live_c3d4', scopes: ['read'], enabled: true, createdAt: '2026-01-15T00:00:00Z' },
  { id: 'ak-003', name: '测试 Key', keyPrefix: 'sk_test_e5f6', scopes: ['read', 'write'], enabled: false, createdAt: '2026-03-01T00:00:00Z' },
]

let apiKeys: MockApiKey[] = [...DEFAULT_API_KEYS]

function resetApiKeys() { apiKeys = [...DEFAULT_API_KEYS] }

export function listApiKeys(): MockApiKey[] { return [...apiKeys] }

export function createApiKey(input: Omit<MockApiKey, 'id' | 'keyPrefix' | 'createdAt'>): MockApiKey {
  const key: MockApiKey = {
    ...input,
    id: genId('ak'),
    keyPrefix: `sk_live_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  }
  apiKeys.push(key)
  return key
}

export function updateApiKeyRecord(id: string, patch: Partial<MockApiKey>): MockApiKey | undefined {
  const idx = apiKeys.findIndex((k) => k.id === id)
  if (idx === -1) return undefined
  apiKeys[idx] = { ...apiKeys[idx], ...patch }
  return apiKeys[idx]
}

export function deleteApiKeyRecord(id: string): boolean {
  const idx = apiKeys.findIndex((k) => k.id === id)
  if (idx === -1) return false
  apiKeys.splice(idx, 1)
  return true
}

// —— 登录安全（26）——
export interface MockLoginSecurity {
  id: string; ipWhitelist: string[]; ipBlacklist: string[]; regionRestrictionEnabled: boolean; allowedRegions: string[]
  failedAttemptLockEnabled: boolean; lockThreshold: number; lockDuration: number
}

const DEFAULT_LOGIN_SECURITY: MockLoginSecurity = {
  id: 'ls-001',
  ipWhitelist: [],
  ipBlacklist: ['10.0.0.0/8'],
  regionRestrictionEnabled: false,
  allowedRegions: ['CN', 'HK', 'TW'],
  failedAttemptLockEnabled: true,
  lockThreshold: 5,
  lockDuration: 300,
}
let loginSecurity: MockLoginSecurity = { ...DEFAULT_LOGIN_SECURITY }

export function getLoginSecurity(): MockLoginSecurity { return { ...loginSecurity } }
export function updateLoginSecurity(patch: Partial<MockLoginSecurity>): MockLoginSecurity {
  loginSecurity = { ...loginSecurity, ...patch }
  return loginSecurity
}
function resetLoginSecurity() { loginSecurity = { ...DEFAULT_LOGIN_SECURITY } }

// —— 密码策略（27）——
export interface MockPasswordPolicy {
  id: string; minLength: number; requireUppercase: boolean; requireLowercase: boolean
  requireDigit: boolean; requireSpecial: boolean; expireDays: number; historyCount: number; enabled: boolean
}

const DEFAULT_PASSWORD_POLICY: MockPasswordPolicy = {
  id: 'pp-001',
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: true,
  expireDays: 90,
  historyCount: 5,
  enabled: true,
}
let passwordPolicy: MockPasswordPolicy = { ...DEFAULT_PASSWORD_POLICY }

export function getPasswordPolicy(): MockPasswordPolicy { return { ...passwordPolicy } }
export function updatePasswordPolicy(patch: Partial<MockPasswordPolicy>): MockPasswordPolicy {
  passwordPolicy = { ...passwordPolicy, ...patch }
  return passwordPolicy
}
function resetPasswordPolicy() { passwordPolicy = { ...DEFAULT_PASSWORD_POLICY } }

// —— 风险控制（28）——
export interface MockRiskControl {
  id: string; anomalyDetectionEnabled: boolean; crossRegionAlertEnabled: boolean
  deviceFingerprintEnabled: boolean; riskScoreThreshold: number
}

const DEFAULT_RISK_CONTROL: MockRiskControl = {
  id: 'rc-001',
  anomalyDetectionEnabled: true,
  crossRegionAlertEnabled: true,
  deviceFingerprintEnabled: true,
  riskScoreThreshold: 70,
}
let riskControl: MockRiskControl = { ...DEFAULT_RISK_CONTROL }

export function getRiskControl(): MockRiskControl { return { ...riskControl } }
export function updateRiskControl(patch: Partial<MockRiskControl>): MockRiskControl {
  riskControl = { ...riskControl, ...patch }
  return riskControl
}
function resetRiskControl() { riskControl = { ...DEFAULT_RISK_CONTROL } }

// —— 消息通知（29）——
export interface MockNotificationConfig {
  id: string; emailEnabled: boolean; smsEnabled: boolean; inAppEnabled: boolean; notifyOn: string[]
}

const DEFAULT_NOTIFICATION_CONFIG: MockNotificationConfig = {
  id: 'nc-001',
  emailEnabled: true,
  smsEnabled: false,
  inAppEnabled: true,
  notifyOn: ['login', 'password_change', 'security_alert'],
}
let notificationConfig: MockNotificationConfig = { ...DEFAULT_NOTIFICATION_CONFIG }

export function getNotificationConfig(): MockNotificationConfig { return { ...notificationConfig } }
export function updateNotificationConfig(patch: Partial<MockNotificationConfig>): MockNotificationConfig {
  notificationConfig = { ...notificationConfig, ...patch }
  return notificationConfig
}
function resetNotificationConfig() { notificationConfig = { ...DEFAULT_NOTIFICATION_CONFIG } }

// —— 开放平台（30）——
export interface MockOpenPlatformConfig {
  id: string; apiEnabled: boolean; webhookEnabled: boolean; sdkEnabled: boolean; openScopes: string[]; callbackWhitelist: string[]
}

const DEFAULT_OPEN_PLATFORM_CONFIG: MockOpenPlatformConfig = {
  id: 'op-001',
  apiEnabled: true,
  webhookEnabled: true,
  sdkEnabled: true,
  openScopes: ['user:read', 'role:read', 'org:read'],
  callbackWhitelist: ['https://example.com/callback'],
}
let openPlatformConfig: MockOpenPlatformConfig = { ...DEFAULT_OPEN_PLATFORM_CONFIG }

export function getOpenPlatformConfig(): MockOpenPlatformConfig { return { ...openPlatformConfig } }
export function updateOpenPlatformConfig(patch: Partial<MockOpenPlatformConfig>): MockOpenPlatformConfig {
  openPlatformConfig = { ...openPlatformConfig, ...patch }
  return openPlatformConfig
}
function resetOpenPlatformConfig() { openPlatformConfig = { ...DEFAULT_OPEN_PLATFORM_CONFIG } }

// 模块加载时初始化 mock 数据（供测试隔离使用）
resetMockDb()
