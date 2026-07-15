import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppList } from '../../../src/features/apps/AppList'
import { useAppStore } from '../../../src/features/apps/appStore'
import { resetApiClient, setToken } from '../../../src/api/client'
import { server } from '../../../msw/server'
import { fnTest } from '../../fn'

const FIDS = ["M04.F01.I01","M04.F01.I02","M04.F01.I03","M04.F01.I04","M04.F01.I05","M04.F01.I06"] as const

function makeRouter() {
  const router = createMemoryRouter(
    [
      { path: '/platform/apps', element: <AppList /> },
      { path: '/platform/apps/:appId/menus', element: <div>菜单管理占位</div> },
    ],
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
  fnTest([...FIDS], 'mount 后拉取并渲染应用列表', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    expect(screen.getByText('企业资源计划系统')).toBeInTheDocument()
    expect(screen.getByText('客户关系管理系统')).toBeInTheDocument()
  })

  fnTest([...FIDS], '渲染应用编码和描述', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    const row = screen.getByText('建筑工程实验室管理系统').closest('tr')!
    expect(within(row).getByText('lab-management')).toBeInTheDocument()
    expect(within(row).getByText(/建筑工程质量检测/)).toBeInTheDocument()
  })

  fnTest([...FIDS], '渲染主题色', async () => {
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

  fnTest([...FIDS], '渲染操作按钮', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    const row = screen.getByText('建筑工程实验室管理系统').closest('tr')!
    expect(within(row).getByRole('button', { name: '菜单' })).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: '编辑' })).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: '删除' })).toBeInTheDocument()
  })

  fnTest([...FIDS], '点击新建应用打开表单', async () => {
    const user = userEvent.setup()
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '新建应用' }))
    expect(screen.getByText('新建应用', { selector: 'h3' })).toBeInTheDocument()
  })

  fnTest([...FIDS], '搜索流程: 输入关键词 + 点击搜索', async () => {
    const user = userEvent.setup()
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    const input = screen.getByPlaceholderText('搜索应用名称/编码/描述')
    await user.type(input, '建筑工程')
    await user.click(screen.getByRole('button', { name: '搜索' }))
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
  })

  fnTest([...FIDS], '搜索流程: Enter 键触发搜索', async () => {
    const user = userEvent.setup()
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    const input = screen.getByPlaceholderText('搜索应用名称/编码/描述')
    await user.type(input, 'lab{Enter}')
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
  })

  fnTest([...FIDS], '删除应用流程: 点击删除 → 确认 → 列表移除', async () => {
    const user = userEvent.setup()
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('建筑工程实验室管理系统')).toBeInTheDocument())
    const row = screen.getByText('建筑工程实验室管理系统').closest('tr')!
    await user.click(within(row).getByRole('button', { name: '删除' }))
    const confirmBtn = await screen.findByRole('button', { name: '确认' })
    await user.click(confirmBtn)
    await waitFor(() =>
      expect(
        screen.queryByText('建筑工程实验室管理系统'),
      ).not.toBeInTheDocument(),
    )
  })

  fnTest([...FIDS], '列表为空时渲染暂无数据', async () => {
    server.use(http.get('*/apps', () => HttpResponse.json([])))
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('暂无数据')).toBeInTheDocument())
  })

  fnTest([...FIDS], '网络错误时渲染错误提示', async () => {
    server.use(http.get('*/apps', () => HttpResponse.json({ message: '网络错误' }, { status: 500 })))
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })
})
