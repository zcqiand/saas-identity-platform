import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../app/router'
import { useAuthStore } from '../features/auth/authStore'
import { usePermissionStore } from '../features/rbac/permissionStore'
import { resetApiClient, setToken } from '../api/client'
import { clearTheme } from '../features/tenant/theme'
import { useTenantStore } from '../features/tenant/tenantStore'

/**
 * E2E 冒烟测试：验证核心业务链路不报错。
 * 登录态 → 业务页面渲染 → 权限守卫生效 → 审计日志可访问
 */
function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({ user: null, token: null, currentOrgId: null, status: 'idle', error: null })
  usePermissionStore.setState({ roles: [], permissions: [], loading: false, error: null })
  useTenantStore.setState({ current: null, list: [], loading: false, error: null })
  resetApiClient()
  clearTheme()
})

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('E2E 冒烟测试', () => {
  it('未登录访问 /acme/dashboard 仍渲染租户布局（无权限守卫层）', async () => {
    renderAt('/acme/dashboard')
    // TenantLayout 拉取租户配置后渲染 dashboard（用独特文本避免与侧边栏 NavLink 冲突）
    await waitFor(() => {
      expect(screen.getByText('租户概览与待办事项')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('登录后访问各业务页面不报错', async () => {
    useAuthStore.setState({
      user: { id: 'u-001', username: 'admin', displayName: '管理员', orgId: 'org-acme' },
      token: 'mock-token',
      currentOrgId: 'org-acme',
      status: 'authenticated',
      error: null,
    })
    setToken('mock-token')
    usePermissionStore.setState({
      permissions: ['user:read', 'user:create', 'user:delete'],
      roles: [],
      loading: false,
      error: null,
    })

    // dashboard
    const { unmount: u1 } = renderAt('/acme/dashboard')
    await waitFor(() => expect(screen.getByText('租户概览与待办事项')).toBeInTheDocument(), { timeout: 3000 })
    u1()

    // users（用新增用户按钮判断页面已加载，需 user:create 权限）
    const { unmount: u2 } = renderAt('/acme/users')
    await waitFor(() => expect(screen.getByRole('button', { name: '新增用户' })).toBeInTheDocument(), { timeout: 3000 })
    u2()

    // orgs
    const { unmount: u3 } = renderAt('/acme/org')
    await waitFor(() => expect(screen.getByText('组织架构')).toBeInTheDocument(), { timeout: 3000 })
    u3()

    // audit
    const { unmount: u4 } = renderAt('/acme/audit')
    await waitFor(() => expect(screen.getByRole('heading', { name: '审计日志' })).toBeInTheDocument(), { timeout: 3000 })
    u4()
  })

  it('权限验证：viewer 角色无 user:create 权限', async () => {
    useAuthStore.setState({
      user: { id: 'u-002', username: 'viewer', displayName: '查看者', orgId: 'org-acme' },
      token: 'mock-token',
      currentOrgId: 'org-acme',
      status: 'authenticated',
      error: null,
    })
    setToken('mock-token')
    usePermissionStore.setState({
      permissions: ['user:read'],
      roles: [],
      loading: false,
      error: null,
    })

    renderAt('/acme/users')
    await waitFor(() => expect(screen.getByRole('button', { name: '搜索' })).toBeInTheDocument(), { timeout: 3000 })
    // viewer 无新增权限
    expect(screen.queryByRole('button', { name: '新增用户' })).not.toBeInTheDocument()
  })

  it('租户切换：acme → globex 路径均可达', async () => {
    renderAt('/globex/dashboard')
    await waitFor(() => {
      expect(screen.getByText('GLOBEX')).toBeInTheDocument()
    })
  })
})
