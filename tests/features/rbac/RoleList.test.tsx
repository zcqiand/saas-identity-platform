import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoleList } from '../../../src/features/rbac/RoleList'
import { useRoleStore } from '../../../src/features/rbac/roleStore'
import { resetApiClient, setToken } from '../../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  useRoleStore.setState({ list: [], loading: false, error: null })
  resetApiClient()
  setToken('mock-token')
})

describe('RoleList', () => {
  it('mount 后渲染"角色管理"标题', async () => {
    render(<RoleList />)
    await waitFor(() => expect(screen.getByText('角色管理')).toBeInTheDocument())
  })

  it('mount 后拉取角色列表', async () => {
    render(<RoleList />)
    await waitFor(() => expect(screen.getByText('admin')).toBeInTheDocument())
    expect(screen.getByText('viewer')).toBeInTheDocument()
  })

  it('新建角色流程', async () => {
    const user = userEvent.setup()
    render(<RoleList />)
    await waitFor(() => expect(screen.getByText('admin')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '新建角色' }))
    expect(screen.getByText('新建角色', { selector: 'h3' })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/角色名称/), '审计员')
    await user.click(screen.getByLabelText('user:read'))
    await user.click(screen.getByLabelText('audit:read'))
    await user.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(screen.getByText('审计员')).toBeInTheDocument())
  })

  it('编辑角色流程', async () => {
    const user = userEvent.setup()
    render(<RoleList />)
    await waitFor(() => expect(screen.getByText('admin')).toBeInTheDocument())

    const adminRow = screen.getByText('admin').closest('tr')!
    await user.click(within(adminRow).getByRole('button', { name: '编辑' }))

    expect(screen.getByText('编辑角色', { selector: 'h3' })).toBeInTheDocument()
    const nameInput = screen.getByLabelText(/角色名称/) as HTMLInputElement
    await user.clear(nameInput)
    await user.type(nameInput, '超级管理员')
    await user.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(screen.getByText('超级管理员')).toBeInTheDocument())
  })

  it('删除角色流程', async () => {
    const user = userEvent.setup()
    render(<RoleList />)
    await waitFor(() => expect(screen.getByText('viewer')).toBeInTheDocument())

    const viewerRow = screen.getByText('viewer').closest('tr')!
    await user.click(within(viewerRow).getByRole('button', { name: '删除' }))

    expect(screen.getByText('删除确认')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '确认' }))

    await waitFor(() => expect(screen.queryByText('viewer')).not.toBeInTheDocument())
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('列表为空时渲染"暂无数据"', async () => {
    const { http, HttpResponse } = await import('msw')
    const { server: srv } = await import('../../../msw/server')
    srv.use(http.get('*/roles', () => HttpResponse.json([])))
    useRoleStore.setState({ list: [], loading: false, error: null })
    render(<RoleList />)
    await waitFor(() => expect(screen.getByText('暂无数据')).toBeInTheDocument())
  })
})
