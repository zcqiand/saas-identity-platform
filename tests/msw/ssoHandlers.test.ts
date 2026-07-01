import { describe, it, expect } from 'vitest'

const API_BASE = 'http://localhost/api'
const SSO_BASE = 'http://localhost/sso'

describe('MSW SSO + auth handlers', () => {
  it('GET /sso/authorize 返回 302 重定向到 callback 含 code', async () => {
    const res = await fetch(
      `${SSO_BASE}/authorize?client_id=saas-demo-client&redirect_uri=http://localhost:5173/sso-callback&response_type=code&state=xyz`,
      { redirect: 'manual' },
    )
    expect(res.status).toBe(302)
    const location = res.headers.get('location')
    expect(location).toBeTruthy()
    expect(location).toContain('/sso-callback')
    expect(location).toContain('code=')
    expect(location).toContain('state=xyz')
  })

  it('GET /sso/authorize 缺 client_id 返回 400', async () => {
    const res = await fetch(`${SSO_BASE}/authorize?redirect_uri=x&response_type=code&state=x`)
    expect(res.status).toBe(400)
  })

  it('POST /sso/oauth/callback 返回 token + user', async () => {
    const res = await fetch(`${API_BASE}/auth/oauth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'mock-auth-code', provider: 'sso' }),
    })
    expect(res.ok).toBe(true)
    const data = await res.json()
    expect(data.token).toBeTruthy()
    expect(data.token.split('.')).toHaveLength(3)
    expect(data.user.id).toBeTruthy()
    expect(data.user.username).toBeTruthy()
    expect(data.user.orgId).toBeTruthy()
  })

  it('POST /sso/oauth/callback 无效 code 返回 401', async () => {
    const res = await fetch(`${API_BASE}/auth/oauth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '', provider: 'sso' }),
    })
    expect(res.status).toBe(401)
  })

  it('GET /auth/permissions?orgId=org-acme 返回该组织的权限集', async () => {
    const res = await fetch(`${API_BASE}/auth/permissions?orgId=org-acme`, {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(res.ok).toBe(true)
    const data = await res.json()
    expect(data.roles).toBeInstanceOf(Array)
    expect(data.permissions).toBeInstanceOf(Array)
    expect(data.permissions.length).toBeGreaterThan(0)
  })

  it('GET /auth/permissions 不同 orgId 返回不同权限', async () => {
    const res1 = await fetch(`${API_BASE}/auth/permissions?orgId=org-acme`, {
      headers: { Authorization: 'Bearer t' },
    })
    const data1 = await res1.json()
    const res2 = await fetch(`${API_BASE}/auth/permissions?orgId=org-globex`, {
      headers: { Authorization: 'Bearer t' },
    })
    const data2 = await res2.json()
    // 两个组织权限集应不同
    expect(data1.permissions).not.toEqual(data2.permissions)
  })

  it('GET /auth/me 携带有效 token 返回 user', async () => {
    // 先拿 token
    const loginRes = await fetch(`${API_BASE}/auth/oauth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'mock-auth-code', provider: 'sso' }),
    })
    const { token } = await loginRes.json()
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.ok).toBe(true)
    const data = await res.json()
    expect(data.user).toBeTruthy()
  })

  it('GET /auth/me 无 token 返回 401', async () => {
    const res = await fetch(`${API_BASE}/auth/me`)
    expect(res.status).toBe(401)
  })
})
