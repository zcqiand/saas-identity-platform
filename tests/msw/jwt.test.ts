import { describe, it, expect } from 'vitest'
import { signJwt, verifyJwt } from '../../msw/jwt'

describe('mock JWT 工具', () => {
  it('signJwt 生成三段式 token', () => {
    const token = signJwt({
      sub: 'u-001',
      username: 'admin@acme',
      orgId: 'org-acme',
      roles: ['admin'],
      permissions: ['user:read'],
    })
    expect(token.split('.')).toHaveLength(3)
  })

  it('verifyJwt 校验有效 token 返回 payload', () => {
    const token = signJwt({
      sub: 'u-001',
      username: 'admin@acme',
      orgId: 'org-acme',
      roles: ['admin'],
      permissions: ['user:read', 'user:create'],
    })
    const payload = verifyJwt(token)
    expect(payload).not.toBeNull()
    expect(payload?.sub).toBe('u-001')
    expect(payload?.orgId).toBe('org-acme')
    expect(payload?.roles).toContain('admin')
    expect(payload?.permissions).toContain('user:create')
  })

  it('verifyJwt 拒绝篡改 token', () => {
    const token = signJwt({
      sub: 'u-001',
      username: 'admin',
      orgId: 'o',
      roles: [],
      permissions: [],
    })
    expect(verifyJwt(token.slice(0, -4) + 'AAAA')).toBeNull()
  })

  it('verifyJwt 拒绝过期 token', () => {
    const token = signJwt(
      { sub: 'u-001', username: 'admin', orgId: 'o', roles: [], permissions: [] },
      -10,
    )
    expect(verifyJwt(token)).toBeNull()
  })
})
