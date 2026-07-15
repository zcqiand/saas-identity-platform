import { describe, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildAuthorizeUrl, redirectToSso } from '../../../src/features/sso/ssoRedirect'
import { fnTest } from '../../fn'

const originalLocation = window.location

beforeEach(() => {
  // mock window.location
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '', origin: 'http://localhost:5173' },
  })
})

afterEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  })
})

describe('ssoRedirect', () => {
  fnTest(["M01.F04.I01","M01.F04.I02"], 'buildAuthorizeUrl 构造含 client_id/redirect_uri/state 的 authorize URL', () => {
    const url = buildAuthorizeUrl({
      ssoBaseUrl: 'http://sso.example.com',
      clientId: 'saas-demo-client',
      redirectUri: 'http://localhost:5173/sso-callback',
      state: 'random-state-123',
    })
    expect(url).toContain('http://sso.example.com/authorize')
    expect(url).toContain('client_id=saas-demo-client')
    expect(url).toContain('redirect_uri=')
    expect(url).toContain('state=random-state-123')
    expect(url).toContain('response_type=code')
  })

  fnTest(["M01.F04.I01","M01.F04.I02"], 'buildAuthorizeUrl 用默认 env 变量', () => {
    const url = buildAuthorizeUrl({
      state: 'state-abc',
    })
    // 默认从 import.meta.env 读取
    expect(url).toContain('/authorize')
    expect(url).toContain('state=state-abc')
  })

  fnTest(["M01.F04.I01","M01.F04.I02"], 'redirectToSso 设置 window.location.href', () => {
    const assignSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '', origin: 'http://localhost:5173', assign: assignSpy },
    })
    redirectToSso({ state: 'xyz' })
    expect(window.location.href).toContain('/authorize')
    expect(window.location.href).toContain('state=xyz')
  })
})
