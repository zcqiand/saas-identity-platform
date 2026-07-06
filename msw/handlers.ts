import { http, HttpResponse } from 'msw'
import {
  findTenant,
  type MockTenant,
  insertTenant,
  updateTenantRecord,
  deleteTenantRecord,
  queryTenants,
  listRoles,
  insertRole,
  updateRoleRecord,
  deleteRoleRecord,
  insertUser,
  findUserById,
  updateUserRecord,
  deleteUserRecord,
  queryUsers,
  getOrgTree,
  findOrgNode,
  insertOrgNode,
  updateOrgNodeRecord,
  deleteOrgNodeRecord,
  queryAuditLogs,
  queryApps,
  insertApp,
  updateAppRecord,
  deleteAppRecord,
  findApp,
  queryMenus,
  insertMenu,
  updateMenuRecord,
  deleteMenuRecord,
  listPositions,
  insertPosition,
  updatePositionRecord,
  deletePositionRecord,
  listUserGroups,
  insertUserGroup,
  updateUserGroupRecord,
  deleteUserGroupRecord,
  listPermissionGroups,
  insertPermissionGroup,
  updatePermissionGroupRecord,
  deletePermissionGroupRecord,
  listLoginMethods,
  updateLoginMethod,
  listSsoProviders,
  updateSsoProvider,
  listOAuth2Providers,
  updateOAuth2Provider,
  getTokenConfig,
  updateTokenConfig,
  listApiKeys,
  createApiKey,
  updateApiKeyRecord,
  deleteApiKeyRecord,
  getLoginSecurity,
  updateLoginSecurity,
  getPasswordPolicy,
  updatePasswordPolicy,
  getRiskControl,
  updateRiskControl,
  getNotificationConfig,
  updateNotificationConfig,
  getOpenPlatformConfig,
  updateOpenPlatformConfig,
} from './db'
import { signJwt, verifyJwt } from './jwt'
import type { Role } from '../src/features/rbac/types'
import type { UserCreateInput, UserUpdateInput, User } from '../src/types/user'

// MSW handler 注册表。
// ch39：/tenants GET 列表 + /tenants/:id GET 单个。
// ch40：追加 SSO 授权服务器 + auth/permissions + auth/me（只增不改）。
export const handlers = [
  // —— ch39：租户 ——
  http.get('*/tenants/:id', ({ params }) => {
    const tenant = findTenant(String(params.id))
    if (!tenant) {
      return HttpResponse.json({ message: '租户不存在' }, { status: 404 })
    }
    return HttpResponse.json(tenant as MockTenant)
  }),

  // —— ch40：SSO 授权服务器 ——
  http.get('*/sso/authorize', ({ request }) => {
    const url = new URL(request.url)
    const clientId = url.searchParams.get('client_id')
    const redirectUri = url.searchParams.get('redirect_uri')
    const state = url.searchParams.get('state')
    if (!clientId || !redirectUri) {
      return HttpResponse.json({ message: '缺少 client_id 或 redirect_uri' }, { status: 400 })
    }
    // mock 签发授权码
    const code = `mock-auth-code-${Date.now()}`
    const callbackUrl = `${redirectUri}?code=${code}&state=${state ?? ''}`
    return new HttpResponse(null, {
      status: 302,
      headers: { Location: callbackUrl },
    })
  }),

  // —— ch40：OAuth 回调换 token ——
  http.post('*/auth/oauth/callback', async ({ request }) => {
    const body = (await request.json()) as { code: string; provider?: string }
    if (!body.code || body.code === 'bad-code') {
      return HttpResponse.json({ message: '无效授权码' }, { status: 401 })
    }
    // mock 用户：固定返回 admin@acme
    const token = signJwt({
      sub: 'u-001',
      username: 'admin@acme',
      orgId: 'org-acme',
      roles: ['admin'],
      permissions: ['user:read', 'user:create', 'user:delete', 'org:read', 'org:write'],
    })
    return HttpResponse.json({
      token,
      user: {
        id: 'u-001',
        username: 'admin@acme',
        displayName: 'SaaS 管理员',
        orgId: 'org-acme',
      },
    })
  }),

  // —— ch40：按组织返回权限集 ——
  http.get('*/auth/permissions', ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ message: '未授权' }, { status: 401 })
    }
    const url = new URL(request.url)
    const orgId = url.searchParams.get('orgId') ?? 'org-acme'

    const acmeRoles: Role[] = [
      { id: 'role-admin', name: 'admin', permissions: ['user:read', 'user:create', 'user:update', 'user:delete', 'org:read', 'org:write'], menuPermissions: [] },
    ]
    const globexRoles: Role[] = [
      { id: 'role-viewer', name: 'viewer', permissions: ['user:read', 'org:read'], menuPermissions: [] },
    ]

    const roles = orgId === 'org-globex' ? globexRoles : acmeRoles
    const permissions = roles.flatMap((r) => r.permissions)
    return HttpResponse.json({ roles, permissions })
  }),

  // —— ch40：当前用户 ——
  http.get('*/auth/me', ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ message: '未授权' }, { status: 401 })
    }
    const token = auth.slice(7)
    const payload = verifyJwt(token)
    if (!payload) {
      return HttpResponse.json({ message: 'token 无效或已过期' }, { status: 401 })
    }
    return HttpResponse.json({
      user: {
        id: payload.sub,
        username: payload.username,
        displayName: 'SaaS 管理员',
        orgId: payload.orgId,
      },
    })
  }),

  // —— ch41：users CRUD ——
  http.get('*/users', ({ request }) => {
    const url = new URL(request.url)
    const result = queryUsers({
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '10'),
      keyword: url.searchParams.get('keyword') ?? undefined,
      role: url.searchParams.get('role') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      orgId: url.searchParams.get('orgId') ?? undefined,
    })
    return HttpResponse.json(result)
  }),

  http.post('*/users', async ({ request }) => {
    const body = (await request.json()) as Partial<UserCreateInput>
    if (!body.username || !body.displayName || !body.email || !body.orgId || !body.roles) {
      return HttpResponse.json({ message: 'username/displayName/email/orgId/roles 必填' }, { status: 400 })
    }
    const created = insertUser({
      username: body.username,
      displayName: body.displayName,
      email: body.email,
      orgId: body.orgId,
      roles: body.roles,
      status: body.status ?? 'active',
    })
    return HttpResponse.json(created as User, { status: 201 })
  }),

  http.get('*/users/:id', ({ params }) => {
    const found = findUserById(String(params.id))
    if (!found) return HttpResponse.json({ message: '用户不存在' }, { status: 404 })
    return HttpResponse.json(found)
  }),

  http.put('*/users/:id', async ({ params, request }) => {
    const id = String(params.id)
    const body = (await request.json()) as UserUpdateInput
    const updated = updateUserRecord(id, body)
    if (!updated) return HttpResponse.json({ message: '用户不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),

  http.delete('*/users/:id', ({ params }) => {
    const ok = deleteUserRecord(String(params.id))
    if (!ok) return HttpResponse.json({ message: '用户不存在' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  // —— ch41：orgs 组织树 ——
  http.get('*/orgs', ({ request }) => {
    const url = new URL(request.url)
    const orgId = url.searchParams.get('orgId')
    if (orgId) {
      const sub = findOrgNode(orgId)
      if (!sub) return HttpResponse.json({ message: '组织不存在' }, { status: 404 })
      return HttpResponse.json(sub)
    }
    return HttpResponse.json(getOrgTree())
  }),

  // —— ch43：orgs 组织树 CRUD ——
  http.post('*/orgs', async ({ request }) => {
    const body = (await request.json()) as { parentId: string; name: string }
    if (!body.parentId || !body.name) {
      return HttpResponse.json({ message: 'parentId 和 name 必填' }, { status: 400 })
    }
    const created = insertOrgNode(body.parentId, body.name)
    if (!created) return HttpResponse.json({ message: '父节点不存在' }, { status: 404 })
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('*/orgs/:id', async ({ params, request }) => {
    const body = (await request.json()) as { name: string }
    const updated = updateOrgNodeRecord(String(params.id), body.name)
    if (!updated) return HttpResponse.json({ message: '节点不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),

  http.delete('*/orgs/:id', ({ params }) => {
    const id = String(params.id)
    if (id === 'org-root') return HttpResponse.json({ message: '根节点不可删除' }, { status: 400 })
    const ok = deleteOrgNodeRecord(id)
    if (!ok) return HttpResponse.json({ message: '节点不存在' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  // —— ch41：audit-logs 审计日志（ch43 追加 type/startDate/endDate 过滤）——
  http.get('*/audit-logs', ({ request }) => {
    const url = new URL(request.url)
    const result = queryAuditLogs({
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '20'),
      action: url.searchParams.get('action') ?? undefined,
      operator: url.searchParams.get('operator') ?? undefined,
      ip: url.searchParams.get('ip') ?? undefined,
      startDate: url.searchParams.get('startDate') ?? undefined,
      endDate: url.searchParams.get('endDate') ?? undefined,
      type: (url.searchParams.get('type') ?? undefined) as 'login' | 'security' | 'operation' | undefined,
    })
    return HttpResponse.json(result)
  }),

  // —— ch42：web-vitals 上报接收（mock）——
  http.post('*/vitals', () => {
    // 接收 web-vitals 上报，mock 层仅返回 204
    return new HttpResponse(null, { status: 204 })
  }),

  // —— ch43：平台租户管理（只增不改）——
  http.get('*/tenants', ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword') ?? undefined
    return HttpResponse.json(queryTenants({ keyword }))
  }),

  http.post('*/tenants', async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      theme: { primary: string; sidebar: string; logoText: string }
      config?: { features?: string[]; maxUsers?: number }
    }
    if (!body.name || !body.theme) {
      return HttpResponse.json({ message: 'name 和 theme 必填' }, { status: 400 })
    }
    const created = insertTenant(body)
    return HttpResponse.json(created as MockTenant, { status: 201 })
  }),

  http.put('*/tenants/:id', async ({ params, request }) => {
    const id = String(params.id)
    const body = (await request.json()) as Partial<{
      name: string
      theme: { primary: string; sidebar: string; logoText: string }
      config: { features: string[]; maxUsers: number }
    }>
    const updated = updateTenantRecord(id, body)
    if (!updated) return HttpResponse.json({ message: '租户不存在' }, { status: 404 })
    return HttpResponse.json(updated as MockTenant)
  }),

  http.delete('*/tenants/:id', ({ params }) => {
    const ok = deleteTenantRecord(String(params.id))
    if (!ok) return HttpResponse.json({ message: '租户不存在' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  // —— ch43/ch44：角色管理（只增不改，含菜单权限）——
  http.get('*/roles', () => {
    return HttpResponse.json(listRoles())
  }),

  http.post('*/roles', async ({ request }) => {
    const body = (await request.json()) as { name: string; permissions: string[]; menuPermissions?: { menuId: string; actions: string[] }[] }
    if (!body.name || !body.permissions) {
      return HttpResponse.json({ message: 'name 和 permissions 必填' }, { status: 400 })
    }
    const created = insertRole(body)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('*/roles/:id', async ({ params, request }) => {
    const id = String(params.id)
    const body = (await request.json()) as Partial<{ name: string; permissions: string[]; menuPermissions: { menuId: string; actions: string[] }[] }>
    const updated = updateRoleRecord(id, body)
    if (!updated) return HttpResponse.json({ message: '角色不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),

  http.delete('*/roles/:id', ({ params }) => {
    const ok = deleteRoleRecord(String(params.id))
    if (!ok) return HttpResponse.json({ message: '角色不存在' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  // —— ch43：组织架构维护（只增不改）——
  http.post('*/orgs', async ({ request }) => {
    const body = (await request.json()) as { name: string; parentId?: string }
    if (!body.name) {
      return HttpResponse.json({ message: 'name 必填' }, { status: 400 })
    }
    const parentId = body.parentId ?? 'org-root'
    const created = insertOrgNode(parentId, body.name)
    if (!created) return HttpResponse.json({ message: '父节点不存在' }, { status: 404 })
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('*/orgs/:id', async ({ params, request }) => {
    const id = String(params.id)
    const body = (await request.json()) as { name: string }
    if (!body.name) {
      return HttpResponse.json({ message: 'name 必填' }, { status: 400 })
    }
    const updated = updateOrgNodeRecord(id, body.name)
    if (!updated) return HttpResponse.json({ message: '节点不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),

  http.delete('*/orgs/:id', ({ params }) => {
    const id = String(params.id)
    if (id === 'org-root') {
      return HttpResponse.json({ message: '根节点不可删除' }, { status: 400 })
    }
    const ok = deleteOrgNodeRecord(id)
    if (!ok) return HttpResponse.json({ message: '节点不存在' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  // —— ch44：应用管理 CRUD ——
  http.get('*/apps', ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword') ?? undefined
    return HttpResponse.json(queryApps({ keyword }))
  }),

  http.get('*/apps/:id', ({ params }) => {
    const app = findApp(String(params.id))
    if (!app) return HttpResponse.json({ message: '应用不存在' }, { status: 404 })
    return HttpResponse.json(app)
  }),

  http.post('*/apps', async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      code: string
      description?: string
      theme?: string
      sort?: number
      enabled?: boolean
    }
    if (!body.name || !body.code) {
      return HttpResponse.json({ message: 'name 和 code 必填' }, { status: 400 })
    }
    const created = insertApp({
      name: body.name,
      code: body.code,
      description: body.description,
      theme: body.theme ?? '#6366f1',
      sort: body.sort ?? 99,
      enabled: body.enabled ?? true,
    })
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('*/apps/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<{
      name: string
      code: string
      description: string
      theme: string
      sort: number
      enabled: boolean
    }>
    const updated = updateAppRecord(String(params.id), body)
    if (!updated) return HttpResponse.json({ message: '应用不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),

  http.delete('*/apps/:id', ({ params }) => {
    const ok = deleteAppRecord(String(params.id))
    if (!ok) return HttpResponse.json({ message: '应用不存在' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  // —— ch44：菜单管理 CRUD ——
  http.get('*/menus', ({ request }) => {
    const url = new URL(request.url)
    const appId = url.searchParams.get('appId')
    if (!appId) return HttpResponse.json({ message: 'appId 必填' }, { status: 400 })
    return HttpResponse.json(queryMenus(appId))
  }),

  http.get('*/menus/:id', ({ params, request }) => {
    const url = new URL(request.url)
    const appId = url.searchParams.get('appId')
    if (!appId) return HttpResponse.json({ message: 'appId 必填' }, { status: 400 })
    const appMenus = queryMenus(appId)
    const menu = appMenus.find((m) => m.id === String(params.id))
    if (!menu) return HttpResponse.json({ message: '菜单不存在' }, { status: 404 })
    return HttpResponse.json(menu)
  }),

  http.post('*/menus', async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      path: string
      appId: string
      parentId?: string | null
      icon?: string
      sort?: number
      enabled?: boolean
    }
    if (!body.name || !body.path || !body.appId) {
      return HttpResponse.json({ message: 'name、path 和 appId 必填' }, { status: 400 })
    }
    const created = insertMenu({
      name: body.name,
      path: body.path,
      appId: body.appId,
      parentId: body.parentId ?? null,
      icon: body.icon,
      sort: body.sort ?? 99,
      enabled: body.enabled ?? true,
    })
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('*/menus/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<{
      name: string
      path: string
      parentId: string | null
      icon: string
      sort: number
      enabled: boolean
    }>
    const updated = updateMenuRecord(String(params.id), body)
    if (!updated) return HttpResponse.json({ message: '菜单不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),

  http.delete('*/menus/:id', ({ params }) => {
    const ok = deleteMenuRecord(String(params.id))
    if (!ok) return HttpResponse.json({ message: '菜单不存在' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  // —— ch45：岗位管理（7）——
  http.get('*/positions', () => HttpResponse.json(listPositions())),
  http.post('*/positions', async ({ request }) => {
    const body = (await request.json()) as { name: string; code: string; description?: string; sort?: number; enabled?: boolean }
    if (!body.name || !body.code) return HttpResponse.json({ message: 'name 和 code 必填' }, { status: 400 })
    return HttpResponse.json(insertPosition({ name: body.name, code: body.code, description: body.description, sort: body.sort ?? 99, enabled: body.enabled ?? true }), { status: 201 })
  }),
  http.put('*/positions/:id', async ({ params, request }) => {
    const updated = updatePositionRecord(String(params.id), await request.json() as Record<string, unknown>)
    if (!updated) return HttpResponse.json({ message: '岗位不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),
  http.delete('*/positions/:id', ({ params }) => {
    if (!deletePositionRecord(String(params.id))) return HttpResponse.json({ message: '岗位不存在' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  // —— ch45：用户组（12）——
  http.get('*/user-groups', () => HttpResponse.json(listUserGroups())),
  http.post('*/user-groups', async ({ request }) => {
    const body = (await request.json()) as { name: string; description?: string; enabled?: boolean }
    if (!body.name) return HttpResponse.json({ message: 'name 必填' }, { status: 400 })
    return HttpResponse.json(insertUserGroup({ name: body.name, description: body.description, enabled: body.enabled ?? true }), { status: 201 })
  }),
  http.put('*/user-groups/:id', async ({ params, request }) => {
    const updated = updateUserGroupRecord(String(params.id), await request.json() as Record<string, unknown>)
    if (!updated) return HttpResponse.json({ message: '用户组不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),
  http.delete('*/user-groups/:id', ({ params }) => {
    if (!deleteUserGroupRecord(String(params.id))) return HttpResponse.json({ message: '用户组不存在' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  // —— ch45：权限组（10）——
  http.get('*/permission-groups', () => HttpResponse.json(listPermissionGroups())),
  http.post('*/permission-groups', async ({ request }) => {
    const body = (await request.json()) as { name: string; description?: string; permissions?: string[]; menuIds?: string[]; sort?: number; enabled?: boolean }
    if (!body.name) return HttpResponse.json({ message: 'name 必填' }, { status: 400 })
    return HttpResponse.json(insertPermissionGroup({ name: body.name, description: body.description, permissions: body.permissions ?? [], menuIds: body.menuIds ?? [], sort: body.sort ?? 99, enabled: body.enabled ?? true }), { status: 201 })
  }),
  http.put('*/permission-groups/:id', async ({ params, request }) => {
    const updated = updatePermissionGroupRecord(String(params.id), await request.json() as Record<string, unknown>)
    if (!updated) return HttpResponse.json({ message: '权限组不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),
  http.delete('*/permission-groups/:id', ({ params }) => {
    if (!deletePermissionGroupRecord(String(params.id))) return HttpResponse.json({ message: '权限组不存在' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  // —— ch45：登录方式（13-18）——
  http.get('*/login-methods', () => HttpResponse.json(listLoginMethods())),
  http.put('*/login-methods/:id', async ({ params, request }) => {
    const updated = updateLoginMethod(String(params.id), await request.json() as Record<string, unknown>)
    if (!updated) return HttpResponse.json({ message: '登录方式不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),

  // —— ch45：SSO / OAuth2 提供商（17/18）——
  http.get('*/sso-providers', () => HttpResponse.json(listSsoProviders())),
  http.put('*/sso-providers/:id', async ({ params, request }) => {
    const updated = updateSsoProvider(String(params.id), await request.json() as Record<string, unknown>)
    if (!updated) return HttpResponse.json({ message: 'SSO 提供商不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),
  http.get('*/oauth2-providers', () => HttpResponse.json(listOAuth2Providers())),
  http.put('*/oauth2-providers/:id', async ({ params, request }) => {
    const updated = updateOAuth2Provider(String(params.id), await request.json() as Record<string, unknown>)
    if (!updated) return HttpResponse.json({ message: 'OAuth2 提供商不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),

  // —— ch45：Token 配置（22）——
  http.get('*/token-config', () => HttpResponse.json(getTokenConfig())),
  http.put('*/token-config', async ({ request }) => {
    return HttpResponse.json(updateTokenConfig(await request.json() as Record<string, unknown>))
  }),

  // —— ch45：API Key（24）——
  http.get('*/api-keys', () => HttpResponse.json(listApiKeys())),
  http.post('*/api-keys', async ({ request }) => {
    const body = (await request.json()) as { name: string; scopes?: string[]; expiresAt?: string; enabled?: boolean }
    if (!body.name) return HttpResponse.json({ message: 'name 必填' }, { status: 400 })
    return HttpResponse.json(createApiKey({ name: body.name, scopes: body.scopes ?? ['read'], expiresAt: body.expiresAt, enabled: body.enabled ?? true }), { status: 201 })
  }),
  http.put('*/api-keys/:id', async ({ params, request }) => {
    const updated = updateApiKeyRecord(String(params.id), await request.json() as Record<string, unknown>)
    if (!updated) return HttpResponse.json({ message: 'API Key 不存在' }, { status: 404 })
    return HttpResponse.json(updated)
  }),
  http.delete('*/api-keys/:id', ({ params }) => {
    if (!deleteApiKeyRecord(String(params.id))) return HttpResponse.json({ message: 'API Key 不存在' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  // —— ch45：登录安全（26）——
  http.get('*/login-security', () => HttpResponse.json(getLoginSecurity())),
  http.put('*/login-security', async ({ request }) => {
    return HttpResponse.json(updateLoginSecurity(await request.json() as Record<string, unknown>))
  }),

  // —— ch45：密码策略（27）——
  http.get('*/password-policy', () => HttpResponse.json(getPasswordPolicy())),
  http.put('*/password-policy', async ({ request }) => {
    return HttpResponse.json(updatePasswordPolicy(await request.json() as Record<string, unknown>))
  }),

  // —— ch45：风险控制（28）——
  http.get('*/risk-control', () => HttpResponse.json(getRiskControl())),
  http.put('*/risk-control', async ({ request }) => {
    return HttpResponse.json(updateRiskControl(await request.json() as Record<string, unknown>))
  }),

  // —— ch45：消息通知（29）——
  http.get('*/notification-config', () => HttpResponse.json(getNotificationConfig())),
  http.put('*/notification-config', async ({ request }) => {
    return HttpResponse.json(updateNotificationConfig(await request.json() as Record<string, unknown>))
  }),

  // —— ch45：开放平台（30）——
  http.get('*/open-platform-config', () => HttpResponse.json(getOpenPlatformConfig())),
  http.put('*/open-platform-config', async ({ request }) => {
    return HttpResponse.json(updateOpenPlatformConfig(await request.json() as Record<string, unknown>))
  }),
]
