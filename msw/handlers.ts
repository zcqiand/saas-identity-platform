import { http, HttpResponse } from 'msw'
import { listTenants, findTenant, type MockTenant } from './db'
import { signJwt, verifyJwt } from './jwt'
import type { Role } from '../src/features/rbac/types'

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
    if (!body.code) {
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
]
