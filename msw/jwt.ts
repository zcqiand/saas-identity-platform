// Mock JWT 工具：仅用于 mock 层签发/校验，非生产凭证。
// 同案例一模式：三段式 token，固定 signature。
//
// Phase 5b：JWT payload 把 orgId 重命名为 departmentId；tenantId 字段保留
//（v0.3.0 起为必填维度：SaaS 用户 tenantId='acme'，lab 业务用户 tenantId='tenant-lab'）。

const MOCK_SECRET = 'saas-mock-secret-not-for-production'

function base64url(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(input: string): string {
  const pad = '='.repeat((4 - (input.length % 4)) % 4)
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

const MOCK_SIGNATURE = base64url(MOCK_SECRET + '::mock-hs256').slice(0, 32)

export interface JwtPayload {
  sub: string
  username: string
  /** 当前部门 ID（v0.3.0 起从 orgId 重命名为 departmentId） */
  departmentId: string
  /** 当前租户 ID（v0.3.0 起必填：acme / tenant-lab） */
  tenantId: string
  /** 登录来源应用 ID（可选） */
  appId?: string
  roles: string[]
  permissions: string[]
  exp: number
}

export function signJwt(
  payload: Omit<JwtPayload, 'exp'>,
  expiresInSec = 3600,
): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const fullPayload: JwtPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSec,
  }
  return [
    base64url(JSON.stringify(header)),
    base64url(JSON.stringify(fullPayload)),
    MOCK_SIGNATURE,
  ].join('.')
}

export function verifyJwt(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [, encodedPayload, signature] = parts
  if (signature !== MOCK_SIGNATURE) return null
  try {
    const payload = JSON.parse(base64urlDecode(encodedPayload)) as JwtPayload
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}