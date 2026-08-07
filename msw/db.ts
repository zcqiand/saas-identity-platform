// Mock 内存数据库：仅 mock 层使用，测试间隔离由 tests/setup.ts 的 resetMockDb 保证。
//
// Phase 5b：单一真理源自 @saas/identity-platform-shared/seeds —— 默认值由 shared
// 提供，CRUD 仍在本文件维护以便 handlers/store 增删。本文件负责：
//   1. 初始化时把 shared seeds 拷贝到内存可写副本
//   2. 提供与原 React 仓一致的函数 export 名字（findTenant/insertTenant/...
//      findUserById/.../findOrgNode/.../listApps/.../listPositions/... 等）
//   3. 兼容 shared v0.3.0 的字段重命名：orgId → departmentId
//
// 重要：DEFAULT_ORG_TREE 改为扁平 Department[]（shared v0.3.0 移除嵌套树），
// 但仍以 OrgNode 别名 + 旧 getOrgTree()/findOrgNode() 等函数保留 React 仓
// 既有调用方 API（递归遍历扁平数组）。

import {
  TENANTS,
  USERS,
  DEPARTMENTS,
  AUDIT_LOGS,
  ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
  USER_GROUPS,
  APPS,
  APP_MENUS,
  POSITIONS,
  LOGIN_METHODS,
  SSO_PROVIDERS,
  OAUTH2_PROVIDERS,
  API_KEYS,
  TOKEN_CONFIG,
  LOGIN_SECURITY,
  PASSWORD_POLICY,
  RISK_CONTROL,
  NOTIFICATION_CONFIG,
  OPEN_PLATFORM_CONFIG,
  rolesByTenant as sharedRolesByTenant,
} from "@saas/identity-platform-shared/seeds";
import {
  TenantSchema,
  DepartmentSchema,
  AuditLogSchema,
  RoleSchema,
  PermissionGroupSchema,
  UserGroupSchema,
  AppSchema,
  MenuSchema,
  PositionSchema,
  LoginMethodEntrySchema,
  SsoProviderSchema,
  OAuth2ProviderSchema,
  ApiKeySchema,
  TokenConfigSchema,
  LoginSecuritySchema,
  PasswordPolicySchema,
  RiskControlSchema,
  NotificationConfigSchema,
  OpenPlatformConfigSchema,
} from "@saas/identity-platform-shared/schemas";
import type {
  Department as SharedDepartment,
  AuditLog as SharedAuditLog,
  App as SharedApp,
  Menu as SharedMenu,
  Position as SharedPosition,
  UserGroup as SharedUserGroup,
  PermissionGroup as SharedPermissionGroup,
  LoginMethodEntry as SharedLoginMethodEntry,
  SsoProvider as SharedSsoProvider,
  OAuth2Provider as SharedOAuth2Provider,
  ApiKey as SharedApiKey,
  TokenConfig as SharedTokenConfig,
  LoginSecurity as SharedLoginSecurity,
  PasswordPolicy as SharedPasswordPolicy,
  RiskControl as SharedRiskControl,
  NotificationConfig as SharedNotificationConfig,
  OpenPlatformConfig as SharedOpenPlatformConfig,
} from "@saas/identity-platform-shared/schemas";
import type { User } from "../src/types/user";
import type { Role } from "../src/features/rbac/types";

// ──────────────────────────────────────────────────────────────────────
// 类型：保持与原 db.ts 同名（同构），供既有 handlers/UI 直接使用
// ──────────────────────────────────────────────────────────────────────

type Tenant = (typeof TENANTS)[number];

/** 旧名 MockTenant 别名（兼容原 React msw/handlers.ts 的 `MockTenant` 类型 import） */
export type MockTenant = Tenant;
type AuditLog = SharedAuditLog;
type App = SharedApp;
type Menu = SharedMenu;
type Position = SharedPosition;
type UserGroup = SharedUserGroup;
type PermissionGroup = SharedPermissionGroup;
type LoginMethod = SharedLoginMethodEntry;
type SsoProvider = SharedSsoProvider;
type OAuth2Provider = SharedOAuth2Provider;
type ApiKey = SharedApiKey;
type TokenConfig = SharedTokenConfig;
type LoginSecurity = SharedLoginSecurity;
type PasswordPolicy = SharedPasswordPolicy;
type RiskControl = SharedRiskControl;
type NotificationConfig = SharedNotificationConfig;
type OpenPlatformConfig = SharedOpenPlatformConfig;

/** 通用重置入口 */
export function resetMockDb() {
  resetTenants()
  resetUsers()
  resetDepartments()
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

// ──────────────────────────────────────────────────────────────────────
// Tenants
// ──────────────────────────────────────────────────────────────────────

export interface TenantCreateInput {
  name: string;
  theme: { primary: string; sidebar: string; logoText: string };
  config?: { features?: string[]; maxUsers?: number };
}

let tenants: Tenant[] = TENANTS.map((t) => TenantSchema.parse(t) as unknown as Tenant)

function resetTenants() {
  tenants = TENANTS.map((t) => TenantSchema.parse(t) as unknown as Tenant)
}

export function listTenants(): Tenant[] {
  return tenants.map((t) => structuredClone(t))
}

export function findTenant(id: string): Tenant | undefined {
  return tenants.find((t) => t.id === id)
}

export function insertTenant(input: TenantCreateInput): Tenant {
  const tenant: Tenant = {
    id: genId('tenant'),
    name: input.name,
    theme: input.theme,
    config: input.config ?? { features: [], maxUsers: 100 },
  } as unknown as Tenant
  tenants.push(tenant)
  return structuredClone(tenant)
}

export function updateTenantRecord(
  id: string,
  patch: Partial<TenantCreateInput>,
): Tenant | undefined {
  const idx = tenants.findIndex((t) => t.id === id)
  if (idx === -1) return undefined
  const updated: Tenant = {
    ...tenants[idx],
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.theme !== undefined ? { theme: patch.theme } : {}),
    ...(patch.config !== undefined ? { config: patch.config } : {}),
  } as unknown as Tenant
  tenants[idx] = updated
  return structuredClone(updated)
}

export function deleteTenantRecord(id: string): boolean {
  const idx = tenants.findIndex((t) => t.id === id)
  if (idx === -1) return false
  tenants.splice(idx, 1)
  return true
}

export function queryTenants(opts?: { keyword?: string }): Tenant[] {
  if (!opts?.keyword) return listTenants()
  const kw = opts.keyword.toLowerCase()
  return tenants.filter((t) => t.name.toLowerCase().includes(kw)).map((t) => structuredClone(t))
}

// ──────────────────────────────────────────────────────────────────────
// Users（v0.3.0：orgId → departmentId）
// ──────────────────────────────────────────────────────────────────────

// v0.3.0：shared USERS seed 已对齐本地 User 类型（orgId→departmentId 改名 + 字段对齐）。
// 若 seed 与 schema 不一致，由 vitest schema 测试保证。本处直接断言。
let users: User[] = USERS as unknown as User[]

function resetUsers() {
  users = USERS as unknown as User[]
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
    ...(input as User),
    id: input.id ?? genId('u'),
    status: input.status ?? 'active',
    createdAt: now(),
    updatedAt: now(),
    // shared v0.3.0 起 User.departmentId/tenantId 字段；tenantId required 时由 caller 显式传
    tenantId: (input as { tenantId?: string }).tenantId ?? "acme",
    enabled: (input as { enabled?: boolean }).enabled ?? true,
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
  departmentId?: string
}): { items: User[]; total: number; page: number; pageSize: number } {
  let filtered: User[] = [...users] as User[]
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
  if (opts.departmentId) {
    filtered = filtered.filter((u) => u.departmentId === opts.departmentId)
  }
  filtered.sort((a, b) => {
    const ac = a.createdAt ?? "";
    const bc = b.createdAt ?? "";
    return ac < bc ? 1 : ac > bc ? -1 : 0;
  })
  const total = filtered.length
  const start = (opts.page - 1) * opts.pageSize
  return {
    items: filtered.slice(start, start + opts.pageSize),
    total,
    page: opts.page,
    pageSize: opts.pageSize,
  }
}

// ──────────────────────────────────────────────────────────────────────
// Departments（v0.3.0：原 OrgNode 单棵树 → 扁平 Department[]）
// ──────────────────────────────────────────────────────────────────────

type Department = SharedDepartment;

let departments: Department[] = DEPARTMENTS.map((d) => DepartmentSchema.parse(d) as Department)

function resetDepartments() {
  departments = DEPARTMENTS.map((d) => DepartmentSchema.parse(d) as Department)
}

/** 列出全部部门 */
export function listDepartments(): Department[] {
  return departments.map((d) => structuredClone(d))
}

/**
 * 查找指定 id 的部门（v0.3.0 前返回 OrgNode 嵌套子树；现按 id 精确匹配）。
 * 兼容旧调用方 `findOrgNode` 别名。
 */
export function findDepartment(id: string): Department | undefined {
  return departments.find((d) => d.id === id)
}

/** 别名：findOrgNode → findDepartment（兼容 React 原调用方） */
export function findOrgNode(id: string): Department | undefined {
  return findDepartment(id);
}

/**
 * 旧 `getOrgTree()` 在 v0.3.0 前返回 OrgNode 单根；现返回扁平 Department[]。
 * 兼容 React 原调用方，OrgTree.tsx 改写为遍历扁平数组。
 */
export function getOrgTree(): Department[] {
  return listDepartments()
}

/** 插入子部门 */
export function insertOrgNode(parentId: string, name: string): Department | undefined {
  const parent = findDepartment(parentId);
  if (!parent) return undefined;
  const child: Department = {
    id: `org-${Math.random().toString(36).slice(2, 8)}`,
    tenantId: parent.tenantId,
    name,
    parentId: parent.id,
    sort: 0,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  };
  departments.push(child);
  return child;
}

/** 更新部门名称 */
export function updateOrgNodeRecord(id: string, name: string): Department | undefined {
  const node = findDepartment(id);
  if (!node) return undefined;
  node.name = name;
  node.updatedAt = now();
  return node;
}

/** 删除部门（递归 SET NULL：子节点 parentId 变 null，独立为新根） */
export function deleteOrgNodeRecord(id: string): boolean {
  // 先把子节点 parentId 置 null（DB 语义 SET NULL）
  for (const d of departments) {
    if (d.parentId === id) {
      d.parentId = null;
      d.updatedAt = now();
    }
  }
  const idx = departments.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  departments.splice(idx, 1);
  return true;
}

// ──────────────────────────────────────────────────────────────────────
// Audit Logs
// ──────────────────────────────────────────────────────────────────────

let auditLogs: AuditLog[] = AUDIT_LOGS.map((a) => AuditLogSchema.parse(a) as AuditLog)

function resetAuditLogs() {
  auditLogs = AUDIT_LOGS.map((a) => AuditLogSchema.parse(a) as AuditLog)
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
    filtered = filtered.filter((l) => new Date(l.timestamp ?? new Date().toISOString()).getTime() >= start)
  }
  if (opts.endDate) {
    const end = new Date(opts.endDate).getTime() + 86400 * 1000
    filtered = filtered.filter((l) => new Date(l.timestamp ?? new Date().toISOString()).getTime() < end)
  }
  if (opts.type === 'login') {
    filtered = filtered.filter((l) => LOGIN_ACTIONS.has(l.action))
  } else if (opts.type === 'security') {
    filtered = filtered.filter((l) => SECURITY_ACTIONS.has(l.action))
  } else if (opts.type === 'operation') {
    filtered = filtered.filter((l) => OPERATION_ACTIONS.has(l.action))
  }
  filtered.sort((a, b) => ((a.timestamp ?? "") < (b.timestamp ?? "") ? 1 : -1))
  const total = filtered.length
  const start = (opts.page - 1) * opts.pageSize
  return {
    items: filtered.slice(start, start + opts.pageSize),
    total,
    page: opts.page,
    pageSize: opts.pageSize,
  }
}

// ──────────────────────────────────────────────────────────────────────
// Roles（v0.3.0 加 tenantId）
// ──────────────────────────────────────────────────────────────────────

export interface RoleCreateInput {
  name: string
  permissions: string[]
  menuPermissions?: { menuId: string; actions: string[] }[]
}

let roles: Role[] = ROLE_PERMISSIONS.map((r) => {
  const parsed = RoleSchema.parse(r);
  return {
    id: parsed.id,
    name: parsed.name,
    permissions: parsed.permissions as string[],
    menuPermissions: parsed.menuPermissions as { menuId: string; actions: string[] }[],
  };
})

function resetRoles() {
  roles = ROLE_PERMISSIONS.map((r) => {
    const parsed = RoleSchema.parse(r);
    return {
      id: parsed.id,
      name: parsed.name,
      permissions: parsed.permissions as string[],
      menuPermissions: parsed.menuPermissions as { menuId: string; actions: string[] }[],
    };
  })
}

export function listRoles(): Role[] {
  return roles.map((r) => ({ ...r, menuPermissions: [...r.menuPermissions] }))
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

/** lab 集成：按租户返回角色目录（lab 角色 tenantId='tenant-lab'） */
export function rolesByTenant(tenantId: string): Role[] {
  // shared 已经做了 tenantId 过滤
  const sharedRoles = sharedRolesByTenant(tenantId);
  return sharedRoles.map((r) => ({
    id: r.id,
    name: r.name,
    permissions: r.permissions,
    menuPermissions: r.menuPermissions,
  }));
}

// ──────────────────────────────────────────────────────────────────────
// Apps + Menus
// ──────────────────────────────────────────────────────────────────────

let apps: App[] = APPS.map((a) => AppSchema.parse(a) as App)
let menus: Menu[] = APP_MENUS.map((m) => MenuSchema.parse(m) as Menu)

function resetApps() {
  apps = APPS.map((a) => AppSchema.parse(a) as App)
}

function resetMenus() {
  menus = APP_MENUS.map((m) => MenuSchema.parse(m) as Menu)
}

export function listApps(): App[] {
  return [...apps].sort((a, b) => a.sort - b.sort)
}

export function findApp(id: string): App | undefined {
  return apps.find((a) => a.id === id)
}

export function insertApp(input: Omit<App, 'id' | 'createdAt' | 'updatedAt'>): App {
  const now = new Date().toISOString()
  const app: App = {
    ...input,
    id: genId('app'),
    createdAt: now,
    updatedAt: now,
  }
  apps.push(app)
  return app
}

export function updateAppRecord(id: string, patch: Partial<App>): App | undefined {
  const idx = apps.findIndex((a) => a.id === id)
  if (idx === -1) return undefined
  apps[idx] = { ...apps[idx], ...patch, id, updatedAt: new Date().toISOString() }
  return apps[idx]
}

export function deleteAppRecord(id: string): boolean {
  const idx = apps.findIndex((a) => a.id === id)
  if (idx === -1) return false
  apps.splice(idx, 1)
  menus = menus.filter((m) => m.appId !== id)
  return true
}

export function queryApps(opts?: { keyword?: string }): App[] {
  if (!opts?.keyword) return listApps()
  const kw = opts.keyword.toLowerCase()
  return apps.filter(
    (a) =>
      a.name.toLowerCase().includes(kw) ||
      a.code.toLowerCase().includes(kw) ||
      (a.description ?? '').toLowerCase().includes(kw),
  ).sort((a, b) => a.sort - b.sort)
}

export function listMenus(appId?: string): Menu[] {
  if (appId) return menus.filter((m) => m.appId === appId).sort((a, b) => a.sort - b.sort)
  return [...menus].sort((a, b) => a.sort - b.sort)
}

export function findMenu(id: string): Menu | undefined {
  return menus.find((m) => m.id === id)
}

export function insertMenu(input: Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>): Menu {
  const now = new Date().toISOString()
  const menu: Menu = {
    ...input,
    id: genId('m'),
    createdAt: now,
    updatedAt: now,
  }
  menus.push(menu)
  return menu
}

export function updateMenuRecord(id: string, patch: Partial<Menu>): Menu | undefined {
  const idx = menus.findIndex((m) => m.id === id)
  if (idx === -1) return undefined
  menus[idx] = { ...menus[idx], ...patch, id, updatedAt: new Date().toISOString() }
  return menus[idx]
}

export function deleteMenuRecord(id: string): boolean {
  const idx = menus.findIndex((m) => m.id === id)
  if (idx === -1) return false
  menus.splice(idx, 1)
  menus = menus.filter((m) => m.parentId !== id)
  return true
}

export function queryMenus(appId: string): Menu[] {
  return menus.filter((m) => m.appId === appId).sort((a, b) => a.sort - b.sort)
}

// ──────────────────────────────────────────────────────────────────────
// Positions
// ──────────────────────────────────────────────────────────────────────

let positions: Position[] = POSITIONS.map((p) => PositionSchema.parse(p) as Position)

function resetPositions() {
  positions = POSITIONS.map((p) => PositionSchema.parse(p) as Position)
}

export function listPositions(): Position[] {
  return [...positions].sort((a, b) => a.sort - b.sort)
}

export function findPosition(id: string): Position | undefined {
  return positions.find((p) => p.id === id)
}

export function insertPosition(input: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>): Position {
  const now = new Date().toISOString()
  const p: Position = { ...input, id: genId('pos'), createdAt: now, updatedAt: now }
  positions.push(p)
  return p
}

export function updatePositionRecord(id: string, patch: Partial<Position>): Position | undefined {
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

// ──────────────────────────────────────────────────────────────────────
// User Groups
// ──────────────────────────────────────────────────────────────────────

let userGroups: UserGroup[] = USER_GROUPS.map((g) => UserGroupSchema.parse(g) as UserGroup)

function resetUserGroups() {
  userGroups = USER_GROUPS.map((g) => UserGroupSchema.parse(g) as UserGroup)
}

export function listUserGroups(): UserGroup[] {
  return [...userGroups]
}

export function insertUserGroup(input: Omit<UserGroup, 'id' | 'createdAt' | 'updatedAt' | 'memberCount'>): UserGroup {
  const now = new Date().toISOString()
  const g: UserGroup = { ...input, id: genId('ug'), memberCount: 0, createdAt: now, updatedAt: now }
  userGroups.push(g)
  return g
}

export function updateUserGroupRecord(id: string, patch: Partial<UserGroup>): UserGroup | undefined {
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

// ──────────────────────────────────────────────────────────────────────
// Permission Groups
// ──────────────────────────────────────────────────────────────────────

let permissionGroups: PermissionGroup[] = PERMISSION_GROUPS.map((g) => PermissionGroupSchema.parse(g) as PermissionGroup)

function resetPermissionGroups() {
  permissionGroups = PERMISSION_GROUPS.map((g) => PermissionGroupSchema.parse(g) as PermissionGroup)
}

export function listPermissionGroups(): PermissionGroup[] {
  return [...permissionGroups].sort((a, b) => a.sort - b.sort)
}

export function insertPermissionGroup(input: Omit<PermissionGroup, 'id' | 'createdAt' | 'updatedAt'>): PermissionGroup {
  const now = new Date().toISOString()
  const g: PermissionGroup = { ...input, id: genId('pg'), createdAt: now, updatedAt: now }
  permissionGroups.push(g)
  return g
}

export function updatePermissionGroupRecord(id: string, patch: Partial<PermissionGroup>): PermissionGroup | undefined {
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

// ──────────────────────────────────────────────────────────────────────
// Login Methods / SSO / OAuth2
// ──────────────────────────────────────────────────────────────────────

let loginMethods: LoginMethod[] = LOGIN_METHODS.map((m) => LoginMethodEntrySchema.parse(m) as LoginMethod)

function resetLoginMethods() {
  loginMethods = LOGIN_METHODS.map((m) => LoginMethodEntrySchema.parse(m) as LoginMethod)
}

export function listLoginMethods(): LoginMethod[] {
  return [...loginMethods].sort((a, b) => a.sort - b.sort)
}

export function updateLoginMethod(id: string, patch: Partial<LoginMethod>): LoginMethod | undefined {
  const idx = loginMethods.findIndex((m) => m.id === id)
  if (idx === -1) return undefined
  loginMethods[idx] = { ...loginMethods[idx], ...patch }
  return loginMethods[idx]
}

let ssoProviders: SsoProvider[] = SSO_PROVIDERS.map((p) => SsoProviderSchema.parse(p) as SsoProvider)
let oauth2Providers: OAuth2Provider[] = OAUTH2_PROVIDERS.map((p) => OAuth2ProviderSchema.parse(p) as OAuth2Provider)

function resetSsoProviders() { ssoProviders = SSO_PROVIDERS.map((p) => SsoProviderSchema.parse(p) as SsoProvider) }
function resetOAuth2Providers() { oauth2Providers = OAUTH2_PROVIDERS.map((p) => OAuth2ProviderSchema.parse(p) as OAuth2Provider) }

export function listSsoProviders(): SsoProvider[] { return [...ssoProviders] }
export function listOAuth2Providers(): OAuth2Provider[] { return [...oauth2Providers] }

export function updateSsoProvider(id: string, patch: Partial<SsoProvider>): SsoProvider | undefined {
  const idx = ssoProviders.findIndex((p) => p.id === id)
  if (idx === -1) return undefined
  ssoProviders[idx] = { ...ssoProviders[idx], ...patch }
  return ssoProviders[idx]
}

export function updateOAuth2Provider(id: string, patch: Partial<OAuth2Provider>): OAuth2Provider | undefined {
  const idx = oauth2Providers.findIndex((p) => p.id === id)
  if (idx === -1) return undefined
  oauth2Providers[idx] = { ...oauth2Providers[idx], ...patch }
  return oauth2Providers[idx]
}

// ──────────────────────────────────────────────────────────────────────
// Token / API Key / Login Security / Password Policy / Risk / Notify / Open Platform
// ──────────────────────────────────────────────────────────────────────

let tokenConfig: TokenConfig = TokenConfigSchema.parse(TOKEN_CONFIG[0]) as TokenConfig

export function getTokenConfig(): TokenConfig { return structuredClone(tokenConfig) }
export function updateTokenConfig(patch: Partial<TokenConfig>): TokenConfig {
  tokenConfig = { ...tokenConfig, ...patch }
  return structuredClone(tokenConfig)
}
function resetTokenConfig() { tokenConfig = TokenConfigSchema.parse(TOKEN_CONFIG[0]) as TokenConfig }

let apiKeys: ApiKey[] = API_KEYS.map((k) => ApiKeySchema.parse(k) as ApiKey)

function resetApiKeys() { apiKeys = API_KEYS.map((k) => ApiKeySchema.parse(k) as ApiKey) }

export function listApiKeys(): ApiKey[] { return [...apiKeys] }

export function createApiKey(input: Omit<ApiKey, 'id' | 'keyPrefix' | 'createdAt'>): ApiKey {
  const key: ApiKey = {
    ...input,
    id: genId('ak'),
    keyPrefix: `sk_live_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  }
  apiKeys.push(key)
  return key
}

export function updateApiKeyRecord(id: string, patch: Partial<ApiKey>): ApiKey | undefined {
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

let loginSecurity: LoginSecurity = LoginSecuritySchema.parse(LOGIN_SECURITY[0]) as LoginSecurity

export function getLoginSecurity(): LoginSecurity { return structuredClone(loginSecurity) }
export function updateLoginSecurity(patch: Partial<LoginSecurity>): LoginSecurity {
  loginSecurity = { ...loginSecurity, ...patch }
  return structuredClone(loginSecurity)
}
function resetLoginSecurity() { loginSecurity = LoginSecuritySchema.parse(LOGIN_SECURITY[0]) as LoginSecurity }

let passwordPolicy: PasswordPolicy = PasswordPolicySchema.parse(PASSWORD_POLICY[0]) as PasswordPolicy

export function getPasswordPolicy(): PasswordPolicy { return structuredClone(passwordPolicy) }
export function updatePasswordPolicy(patch: Partial<PasswordPolicy>): PasswordPolicy {
  passwordPolicy = { ...passwordPolicy, ...patch }
  return structuredClone(passwordPolicy)
}
function resetPasswordPolicy() { passwordPolicy = PasswordPolicySchema.parse(PASSWORD_POLICY[0]) as PasswordPolicy }

let riskControl: RiskControl = RiskControlSchema.parse(RISK_CONTROL[0]) as RiskControl

export function getRiskControl(): RiskControl { return structuredClone(riskControl) }
export function updateRiskControl(patch: Partial<RiskControl>): RiskControl {
  riskControl = { ...riskControl, ...patch }
  return structuredClone(riskControl)
}
function resetRiskControl() { riskControl = RiskControlSchema.parse(RISK_CONTROL[0]) as RiskControl }

let notificationConfig: NotificationConfig = NotificationConfigSchema.parse(NOTIFICATION_CONFIG[0]) as NotificationConfig

export function getNotificationConfig(): NotificationConfig { return structuredClone(notificationConfig) }
export function updateNotificationConfig(patch: Partial<NotificationConfig>): NotificationConfig {
  notificationConfig = { ...notificationConfig, ...patch }
  return structuredClone(notificationConfig)
}
function resetNotificationConfig() { notificationConfig = NotificationConfigSchema.parse(NOTIFICATION_CONFIG[0]) as NotificationConfig }

let openPlatformConfig: OpenPlatformConfig = OpenPlatformConfigSchema.parse(OPEN_PLATFORM_CONFIG[0]) as OpenPlatformConfig

export function getOpenPlatformConfig(): OpenPlatformConfig { return structuredClone(openPlatformConfig) }
export function updateOpenPlatformConfig(patch: Partial<OpenPlatformConfig>): OpenPlatformConfig {
  openPlatformConfig = { ...openPlatformConfig, ...patch }
  return structuredClone(openPlatformConfig)
}
function resetOpenPlatformConfig() { openPlatformConfig = OpenPlatformConfigSchema.parse(OPEN_PLATFORM_CONFIG[0]) as OpenPlatformConfig }

// 模块加载时初始化 mock 数据（供测试隔离使用）
resetMockDb()