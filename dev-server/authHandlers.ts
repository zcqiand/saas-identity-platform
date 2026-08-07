/**
 * dev-server/authHandlers.ts
 *
 * 把 msw/handlers.ts 里 4 条 auth 端点抽成纯函数（Web Fetch Request/Response 语义），
 * 同时供 MSW（浏览器端 mock）和 Hono dev server（dev 真实后端）复用。
 *
 * 用途：让 lab 5173 跨源请求能命中 saas 5175 上的真实端口（5176），而不是 saas 自己的
 *       Service Worker MSW（Service Worker 跨 origin 不可见）。
 *
 * 契约不变：M01.F04 SSO 授权码流的 4 端点（ch40）。
 *
 * Phase 5b：tenantId 替代 orgId 作为权限路由参数；tenant-lab 走 rolesByTenant。
 */

import { rolesByTenant } from '../msw/db'
import { signJwt } from '../msw/jwt'
import { queryMenus } from '../msw/db'
import type { Role } from '../src/features/rbac/types'

// ===== 1. GET /sso/authorize =====
export function handleSsoAuthorize(req: Request): Response {
  const url = new URL(req.url)
  const clientId = url.searchParams.get('client_id')
  const redirectUri = url.searchParams.get('redirect_uri')
  const state = url.searchParams.get('state')
  if (!clientId || !redirectUri) {
    return json({ message: '缺少 client_id 或 redirect_uri' }, 400)
  }
  const code = `mock-auth-code-${Date.now()}`
  const callbackUrl = `${redirectUri}?code=${code}&state=${state ?? ''}`
  return new Response(null, { status: 302, headers: { Location: callbackUrl } })
}

// ===== 2. POST /auth/oauth/callback =====
export async function handleOAuthCallback(req: Request): Promise<Response> {
  const body = (await req.json()) as {
    code: string
    clientId?: string
    provider?: string
  }
  if (!body.code || body.code === 'bad-code') {
    return json({ message: '无效授权码' }, 401)
  }
  // lab 集成：clientId 命中 lab 应用 → 返回 lab 租户身份（机构=租户，1:1）
  if (body.clientId === 'lab-management') {
    const labAdmin = rolesByTenant('tenant-lab').find((r) => r.name === 'labadmin')
    const labToken = signJwt({
      sub: 'u-lab-admin',
      username: 'labadmin',
      departmentId: 'org-lab-root',
      tenantId: 'tenant-lab',
      appId: 'app-lab',
      roles: ['labadmin'],
      permissions: labAdmin?.permissions ?? [],
    })
    return json({
      token: labToken,
      user: {
        id: 'u-lab-admin',
        username: 'labadmin',
        displayName: '实验室管理员',
        departmentId: 'org-lab-root',
        tenantId: 'tenant-lab',
      },
    })
  }
  // mock 默认用户：保持 ch40 既有行为
  const token = signJwt({
    sub: 'u-001',
    username: 'admin@acme',
    departmentId: 'org-acme',
    tenantId: 'acme',
    roles: ['admin'],
    permissions: ['user:read', 'user:create', 'user:delete', 'org:read', 'org:write'],
  })
  return json({
    token,
    user: {
      id: 'u-001',
      username: 'admin@acme',
      displayName: 'SaaS 管理员',
      departmentId: 'org-acme',
      tenantId: 'acme',
    },
  })
}

// ===== 3. GET /auth/permissions =====
export function handleAuthPermissions(req: Request): Response {
  const auth = req.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return json({ message: '未授权' }, 401)
  }
  const url = new URL(req.url)
  const tenantId = url.searchParams.get('tenantId') ?? 'acme'

  // lab 集成：机构=租户=根组织 org-lab-root
  if (tenantId === 'tenant-lab') {
    const labRoles = rolesByTenant('tenant-lab')
    const labPerms = Array.from(new Set(labRoles.flatMap((r) => r.permissions)))
    return json({ roles: labRoles, permissions: labPerms })
  }

  const acmeRoles: Role[] = [
    {
      id: 'role-admin',
      name: 'admin',
      permissions: [
        'user:read',
        'user:create',
        'user:update',
        'user:delete',
        'org:read',
        'org:write',
      ],
      menuPermissions: [],
    },
  ]
  const roles = acmeRoles
  const permissions = roles.flatMap((r) => r.permissions)
  return json({ roles, permissions })
}

// ===== 4. GET /menus?appId=app-lab =====
export function handleGetMenus(req: Request): Response {
  const url = new URL(req.url)
  const appId = url.searchParams.get('appId')
  if (!appId) return json({ message: 'appId 必填' }, 400)
  return json(queryMenus(appId))
}

// ===== helper =====
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}