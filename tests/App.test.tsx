import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'

// vi.mock 的 factory 会被 hoist 到文件最顶，比 const 先跑。
// 因此 factory 引用的标识必须用 vi.hoisted 提前准备。
const { setTokenMock } = vi.hoisted(() => ({
  setTokenMock: vi.fn(),
}))

// RouterProvider 替换为返回 null —— 不渲染真实 router，避免对 router.location / .state 的硬依赖。
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    RouterProvider: () => null,
  }
})

// 拦截 api/client.setToken —— App.tsx 走的是相对路径，但 vitest 会按解析后的
// 文件去匹配 mock。为稳起见两条都列。
vi.mock('@/api/client', () => ({
  setToken: setTokenMock,
  getToken: () => null,
  apiClient: { get: vi.fn(), post: vi.fn() },
  resetApiClient: () => undefined,
}))
vi.mock('../src/api/client', () => ({
  setToken: setTokenMock,
  getToken: () => null,
  apiClient: { get: vi.fn(), post: vi.fn() },
  resetApiClient: () => undefined,
}))

import App from '../src/App'
import { usePermissionStore } from '../src/features/rbac/permissionStore'

beforeEach(() => {
  setTokenMock.mockClear()
  usePermissionStore.setState({
    roles: [],
    permissions: [],
    loading: false,
    error: null,
  })
  // 用 mock 替换 fetchPermissions，避免真打 /auth/permissions
  usePermissionStore.setState({
    fetchPermissions: vi.fn(async () => undefined),
  })
})

describe('App · InitPermissions', () => {
  it('empty permissions → setToken(dev-mock-token) + fetchPermissions(org-acme)', async () => {
    render(<App />)
    await waitFor(() => {
      expect(setTokenMock).toHaveBeenCalledWith('dev-mock-token')
    })
    expect(usePermissionStore.getState().fetchPermissions).toHaveBeenCalledWith(
      'org-acme',
    )
  })

  it('permissions already loaded → no setToken, no fetch', async () => {
    usePermissionStore.setState({ permissions: ['user:read'] })
    render(<App />)
    // 等一拍让 useEffect 跑过
    await new Promise((r) => setTimeout(r, 30))
    expect(setTokenMock).not.toHaveBeenCalled()
    expect(usePermissionStore.getState().fetchPermissions).not.toHaveBeenCalled()
  })
})
