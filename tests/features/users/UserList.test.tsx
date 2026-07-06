import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserList } from '../../../src/features/users/UserList'
import { useUserStore } from '../../../src/features/users/userStore'
import { usePermissionStore } from '../../../src/features/rbac/permissionStore'
import { resetApiClient, setToken } from '../../../src/api/client'

const API_BASE = 'http://localhost/api'

async function seed(names: string[]) {
  for (const name of names) {
    await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `${name}@acme`,
        displayName: name,
        email: `${name}@acme.com`,
        orgId: 'org-acme',
        roles: ['member'],
      }),
    })
  }
}

beforeEach(() => {
  localStorage.clear()
  useUserStore.setState({ list: [], total: 0, loading: false, error: null })
  usePermissionStore.setState({ roles: [], permissions: [], loading: false, error: null })
  resetApiClient()
  setToken('mock-token')
})

describe('UserList', () => {
  it('mount 后拉取并渲染列表', async () => {
    await seed(['张三', '李四'])
    render(<UserList />)
    await waitFor(() => expect(screen.getByText('张三')).toBeInTheDocument())
    expect(screen.getByText('李四')).toBeInTheDocument()
  })

  it('有 user:create 权限时渲染"新增用户"按钮', async () => {
    usePermissionStore.setState({ permissions: ['user:create', 'user:read'] })
    await seed(['甲'])
    render(<UserList />)
    await waitFor(() => expect(screen.getByText('甲')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: '新增用户' })).toBeInTheDocument()
  })

  it('无 user:create 权限时不渲染"新增用户"按钮', async () => {
    usePermissionStore.setState({ permissions: ['user:read'] })
    await seed(['甲'])
    render(<UserList />)
    await waitFor(() => expect(screen.getByText('甲')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: '新增用户' })).not.toBeInTheDocument()
  })

  it('新增用户流程', async () => {
    const user = userEvent.setup()
    usePermissionStore.setState({ permissions: ['user:create', 'user:read'] })
    await seed(['已有'])
    render(<UserList />)
    await waitFor(() => expect(screen.getByText('已有')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '新增用户' }))
    expect(screen.getByText('新建用户')).toBeInTheDocument()
    await user.type(screen.getByLabelText(/用户名/), 'new@acme')
    await user.type(screen.getByLabelText(/显示名/), '新用户XYZ')
    await user.type(screen.getByLabelText(/邮箱/), 'new@acme.com')
    await user.selectOptions(screen.getByLabelText(/组织/), 'org-acme')
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => expect(screen.getByText('新用户XYZ')).toBeInTheDocument())
  })

  it('编辑用户流程', async () => {
    const user = userEvent.setup()
    usePermissionStore.setState({ permissions: ['user:update', 'user:read'] })
    await seed(['待编辑'])
    render(<UserList />)
    await waitFor(() => expect(screen.getByText('待编辑')).toBeInTheDocument())
    const row = screen.getByText('待编辑').closest('tr')!
    await user.click(within(row).getByRole('button', { name: '编辑' }))
    expect(screen.getByText('编辑用户')).toBeInTheDocument()
    const nameInput = screen.getByLabelText(/显示名/) as HTMLInputElement
    await user.clear(nameInput)
    await user.type(nameInput, '已编辑XYZ')
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => expect(screen.getByText('已编辑XYZ')).toBeInTheDocument())
  })

  it('删除用户流程', async () => {
    const user = userEvent.setup()
    usePermissionStore.setState({ permissions: ['user:delete', 'user:read'] })
    await seed(['待删除', '保留'])
    render(<UserList />)
    await waitFor(() => expect(screen.getByText('待删除')).toBeInTheDocument())
    const row = screen.getByText('待删除').closest('tr')!
    await user.click(within(row).getByRole('button', { name: '删除' }))
    expect(screen.getByText('删除确认')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '确认' }))
    await waitFor(() => expect(screen.queryByText('待删除')).not.toBeInTheDocument())
    expect(screen.getByText('保留')).toBeInTheDocument()
  })

  it('无 user:delete 权限时不渲染删除按钮', async () => {
    usePermissionStore.setState({ permissions: ['user:read'] })
    await seed(['甲'])
    render(<UserList />)
    await waitFor(() => expect(screen.getByText('甲')).toBeInTheDocument())
    const row = screen.getByText('甲').closest('tr')!
    expect(within(row).queryByRole('button', { name: '删除' })).not.toBeInTheDocument()
  })

  it('搜索流程', async () => {
    const user = userEvent.setup()
    await seed(['匹配XYZ', '不匹配ABC'])
    render(<UserList />)
    await waitFor(() => expect(screen.getByText('不匹配ABC')).toBeInTheDocument())
    await user.type(screen.getByPlaceholderText(/搜索/), 'XYZ')
    await user.click(screen.getByRole('button', { name: '搜索' }))
    await waitFor(() => expect(screen.queryByText('不匹配ABC')).not.toBeInTheDocument())
    expect(screen.getByText('匹配XYZ')).toBeInTheDocument()
  })

  it('角色筛选流程', async () => {
    const user = userEvent.setup()
    await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'a@acme', displayName: '管理员', email: 'a@acme.com', orgId: 'org-acme', roles: ['admin'] }),
    })
    await seed(['普通成员'])
    render(<UserList />)
    await waitFor(() => expect(screen.getByText('普通成员')).toBeInTheDocument())
    await user.selectOptions(screen.getByLabelText(/角色筛选/), 'admin')
    await waitFor(() => expect(screen.getByText('管理员')).toBeInTheDocument())
    expect(screen.queryByText('普通成员')).not.toBeInTheDocument()
  })
})
