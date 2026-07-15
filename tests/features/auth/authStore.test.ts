import { describe, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../msw/server'
import { useAuthStore } from '../../../src/features/auth/authStore'
import { resetApiClient } from '../../../src/api/client'
import { fnTest } from '../../fn'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({ user: null, token: null, currentOrgId: null, status: 'idle', error: null })
  resetApiClient()
})

describe('authStore (SaaS 版)', () => {
  fnTest(["M01.F03.I01"], '初始状态: user=null, token=null, currentOrgId=null, status=idle', () => {
    const s = useAuthStore.getState()
    expect(s.user).toBeNull()
    expect(s.token).toBeNull()
    expect(s.currentOrgId).toBeNull()
    expect(s.status).toBe('idle')
    expect(s.error).toBeNull()
  })

  fnTest(["M01.F03.I01"], 'handleOAuthCallback 成功后设置 user/token/currentOrgId', async () => {
    await useAuthStore.getState().handleOAuthCallback('mock-auth-code', 'sso')
    const s = useAuthStore.getState()
    expect(s.status).toBe('authenticated')
    expect(s.user?.username).toBe('admin@acme')
    expect(s.token).toBeTruthy()
    expect(s.currentOrgId).toBe('org-acme')
    expect(s.error).toBeNull()
  })

  fnTest(["M01.F03.I01"], 'handleOAuthCallback 失败后 status=error', async () => {
    server.use(
      http.post('*/auth/oauth/callback', () =>
        HttpResponse.json({ message: '授权码无效' }, { status: 401 }),
      ),
    )
    await useAuthStore.getState().handleOAuthCallback('bad-code', 'sso')
    const s = useAuthStore.getState()
    expect(s.status).toBe('error')
    expect(s.error).toBeTruthy()
    expect(s.user).toBeNull()
  })

  fnTest(["M01.F03.I01"], 'switchOrg 切换组织后 currentOrgId 更新', async () => {
    await useAuthStore.getState().handleOAuthCallback('mock-auth-code', 'sso')
    expect(useAuthStore.getState().currentOrgId).toBe('org-acme')
    await useAuthStore.getState().switchOrg('org-globex')
    expect(useAuthStore.getState().currentOrgId).toBe('org-globex')
  })

  fnTest(["M01.F03.I01"], 'logout 清空所有状态', async () => {
    await useAuthStore.getState().handleOAuthCallback('mock-auth-code', 'sso')
    useAuthStore.getState().logout()
    const s = useAuthStore.getState()
    expect(s.user).toBeNull()
    expect(s.token).toBeNull()
    expect(s.currentOrgId).toBeNull()
    expect(s.status).toBe('idle')
    expect(s.error).toBeNull()
  })

  fnTest(["M01.F03.I01"], 'handleOAuthCallback 成功后 token 同步到 apiClient', async () => {
    await useAuthStore.getState().handleOAuthCallback('mock-auth-code', 'sso')
    server.use(
      http.get('*/auth/echo', ({ request }) => {
        return HttpResponse.json({ authorization: request.headers.get('Authorization') })
      }),
    )
    const { apiClient } = await import('../../../src/api/client')
    const res = await apiClient.get('/auth/echo')
    expect(res.data.authorization).toBe(`Bearer ${useAuthStore.getState().token}`)
  })

  fnTest(["M01.F03.I01"], 'persist: token/user 持久化到 localStorage', async () => {
    await useAuthStore.getState().handleOAuthCallback('mock-auth-code', 'sso')
    const persisted = JSON.parse(localStorage.getItem('saas-auth') || '{}')
    expect(persisted.state.token).toBeTruthy()
    expect(persisted.state.user.username).toBe('admin@acme')
  })

  fnTest(["M01.F03.I01"], 'clearError 清除 error', async () => {
    server.use(
      http.post('*/auth/oauth/callback', () =>
        HttpResponse.json({ message: '失败' }, { status: 401 }),
      ),
    )
    await useAuthStore.getState().handleOAuthCallback('bad', 'sso')
    expect(useAuthStore.getState().error).toBeTruthy()
    useAuthStore.getState().clearError()
    expect(useAuthStore.getState().error).toBeNull()
  })
})
