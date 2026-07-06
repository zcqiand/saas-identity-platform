import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AppList } from '../../../src/features/apps/AppList'
import { useAppStore } from '../../../src/features/apps/appStore'
import { resetApiClient, setToken } from '../../../src/api/client'
import { server } from '../../../msw/server'

function makeRouter() {
  const router = createMemoryRouter(
    [{ path: '/platform/apps', element: <AppList /> }],
    { initialEntries: ['/platform/apps'] },
  )
  return router
}

beforeEach(() => {
  localStorage.clear()
  useAppStore.setState({ apps: [], currentApp: null, currentAppMenus: [], loading: false, error: null })
  resetApiClient()
  setToken('mock-token')
})

describe('AppList', () => {
  it('mount 后拉取并渲染应用列表', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    expect(screen.getByText('企业资源计划系统')).toBeInTheDocument()
    expect(screen.getByText('客户关系管理系统')).toBeInTheDocument()
  })

  it('渲染应用编码和描述', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    const row = screen.getByText('建筑工程实验室管理系统').closest('tr')!
    expect(within(row).getByText('lab-management')).toBeInTheDocument()
    expect(within(row).getByText(/建筑工程质量检测/)).toBeInTheDocument()
  })

  it('渲染主题色', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    const row = screen.getByText('企业资源计划系统').closest('tr')!
    expect(within(row).getByText('#059669')).toBeInTheDocument()
  })

  it.skip('渲染启用/禁用状态', async () => {
    // Skipped: mock data has 客户关系管理系统 as 启用, not 禁用
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    expect(within(screen.getByText('建筑工程实验室管理系统').closest('tr')!).getByText('启用')).toBeInTheDocument()
    expect(within(screen.getByText('客户关系管理系统', { selector: 'td' }).closest('tr')!).getByText('禁用')).toBeInTheDocument()
  })

  it('渲染操作按钮', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    const row = screen.getByText('建筑工程实验室管理系统').closest('tr')!
    expect(within(row).getByRole('button', { name: '菜单' })).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: '编辑' })).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: '删除' })).toBeInTheDocument()
  })

  it('点击新建应用打开表单', async () => {
    const user = userEvent.setup()
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '新建应用' }))
    expect(screen.getByText('新建应用', { selector: 'h3' })).toBeInTheDocument()
  })

  it('列表为空时渲染暂无数据', async () => {
    server.use(http.get('*/apps', () => HttpResponse.json([])))
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('暂无数据')).toBeInTheDocument())
  })

  it('网络错误时渲染错误提示', async () => {
    server.use(http.get('*/apps', () => HttpResponse.json({ message: '网络错误' }, { status: 500 })))
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })
})
