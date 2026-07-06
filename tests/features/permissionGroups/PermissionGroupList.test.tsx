import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PermissionGroupList } from '../../../src/features/permissionGroups/PermissionGroupList'
import { usePermissionGroupStore } from '../../../src/features/permissionGroups/permissionGroupStore'
import { resetApiClient, setToken } from '../../../src/api/client'
import { server } from '../../../msw/server'

beforeEach(() => {
  localStorage.clear()
  usePermissionGroupStore.setState({ list: [], loading: false, error: null })
  resetApiClient()
  setToken('mock-token')
})

describe('PermissionGroupList', () => {
  it('mount 后拉取并渲染权限组列表', async () => {
    render(<PermissionGroupList />)
    await waitFor(() => expect(screen.getByText('超级管理员')).toBeInTheDocument())
    expect(screen.getByText('运营人员')).toBeInTheDocument()
    expect(screen.getByText('访客')).toBeInTheDocument()
  })

  it('渲染权限组描述', async () => {
    render(<PermissionGroupList />)
    await waitFor(() => expect(screen.getByText('超级管理员')).toBeInTheDocument())
    expect(screen.getByText('拥有所有权限')).toBeInTheDocument()
  })

  it('渲染权限数', async () => {
    render(<PermissionGroupList />)
    await waitFor(() => expect(screen.getByText('超级管理员')).toBeInTheDocument())
    const row = screen.getByText('超级管理员').closest('tr')!
    expect(within(row).getByText('user:*')).toBeInTheDocument()
  })

  it('渲染启用状态', async () => {
    render(<PermissionGroupList />)
    await waitFor(() => expect(screen.getByText('超级管理员')).toBeInTheDocument())
    expect(within(screen.getByText('超级管理员').closest('tr')!).getByText('启用')).toBeInTheDocument()
  })

  it('渲染编辑和删除按钮', async () => {
    render(<PermissionGroupList />)
    await waitFor(() => expect(screen.getByText('超级管理员')).toBeInTheDocument())
    const row = screen.getByText('超级管理员').closest('tr')!
    expect(within(row).getByRole('button', { name: '编辑' })).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: '删除' })).toBeInTheDocument()
  })

  it('点击新建权限组打开表单', async () => {
    const user = userEvent.setup()
    render(<PermissionGroupList />)
    await waitFor(() => expect(screen.getByText('超级管理员')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '新建权限组' }))
    const heading = await screen.findByText('新建权限组', { selector: 'h3' })
    expect(heading).toBeInTheDocument()
  })

  it('列表为空时渲染"暂无数据"', async () => {
    server.use(http.get('*/permission-groups', () => HttpResponse.json([])))
    render(<PermissionGroupList />)
    await waitFor(() => expect(screen.getByText('暂无数据')).toBeInTheDocument())
  })

  it('网络错误时渲染错误提示', async () => {
    server.use(http.get('*/permission-groups', () => HttpResponse.json({ message: '网络错误' }, { status: 500 })))
    render(<PermissionGroupList />)
    await waitFor(() => expect(screen.getByText('网络错误')).toBeInTheDocument())
  })
})
