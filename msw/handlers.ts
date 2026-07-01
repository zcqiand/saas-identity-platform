import { http, HttpResponse } from 'msw'
import {
  listTenants,
  findTenant,
  type MockTenant,
  insertUser,
  findUserById,
  updateUserRecord,
  deleteUserRecord,
  queryUsers,
  getOrgTree,
  findOrgNode,
  queryAuditLogs,
} from './db'
import { signJwt, verifyJwt } from './jwt'
import type { Role } from '../src/features/rbac/types'
import type { UserCreateInput, UserUpdateInput, User } from '../src/types/user'

// MSW handler 注册表。
// ch39：/tenants GET 列表 + /tenants/:id GET 单个。
// ch40：追加 SSO 授权服务器 + auth/permissions + auth/me（只增不改）。
export const handlers = [
  // —— ch39：租户 ——
  http.get('*/tenants', () => {
    return HttpResponse.json(listTenants())
  }),

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
      { id: 'role-admin', name: 'admin', permissions: ['user:read', 'user:create', 'user:delete', 'org:read', 'org:write'] },
    ]
    const globexRoles: Role[] = [
      { id: 'role-viewer', name: 'viewer', permissions: ['user:read', 'org:read'] },
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

  // —— ch41：audit-logs 审计日志 ——
  http.get('*/audit-logs', ({ request }) => {
    const url = new URL(request.url)
    const result = queryAuditLogs({
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '20'),
      action: url.searchParams.get('action') ?? undefined,
      operator: url.searchParams.get('operator') ?? undefined,
      ip: url.searchParams.get('ip') ?? undefined,
    })
    return HttpResponse.json(result)
  }),

  // —— ch42：web-vitals 上报接收（mock）——
  http.post('*/vitals', () => {
    // 接收 web-vitals 上报，mock 层仅返回 204
    return new HttpResponse(null, { status: 204 })
  }),
]
