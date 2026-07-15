import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { MenuList } from '../../../src/features/apps/MenuList'
import { useAppStore } from '../../../src/features/apps/appStore'
import { resetApiClient, setToken } from '../../../src/api/client'
import { server } from '../../../msw/server'
import { fnTest } from '../../fn'

const FIDS = ["M04.F01.I07","M04.F01.I08","M04.F01.I09","M04.F01.I10","M04.F01.I11","M04.F01.I12"] as const

function makeRouter(appId = 'app-lab') {
  const router = createMemoryRouter(
    [
      { path: '/platform/apps', element: <div>应用列表</div> },
      { path: '/platform/apps/:appId/menus', element: <MenuList /> },
    ],
    { initialEntries: [`/platform/apps/${appId}/menus`] },
  )
  return router
}

beforeEach(() => {
  localStorage.clear()
  useAppStore.setState({ apps: [], currentApp: null, currentAppMenus: [], loading: false, error: null })
  resetApiClient()
  setToken('mock-token')
})

describe('MenuList', () => {
  fnTest([...FIDS], 'mount 后拉取并渲染菜单列表', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('仪表盘')).toBeInTheDocument())
    expect(screen.getByText('合同管理')).toBeInTheDocument()
  })

  fnTest([...FIDS], '渲染菜单名称和路由路径', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('仪表盘')).toBeInTheDocument())
    const row = screen.getByText('仪表盘').closest('tr')!
    expect(within(row).getByText('dashboard')).toBeInTheDocument()
  })

  fnTest([...FIDS], '渲染启用/禁用状态', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('仪表盘')).toBeInTheDocument())
    const row = screen.getByText('仪表盘').closest('tr')!
    expect(within(row).getByText('启用')).toBeInTheDocument()
  })

  fnTest([...FIDS], '渲染操作按钮（子菜单、编辑、删除）', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('仪表盘')).toBeInTheDocument())
    const row = screen.getByText('仪表盘').closest('tr')!
    expect(within(row).getByRole('button', { name: '子菜单' })).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: '编辑' })).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: '删除' })).toBeInTheDocument()
  })

  fnTest([...FIDS], '渲染子菜单（带 └ 前缀）', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('仪表盘')).toBeInTheDocument())
    expect(screen.getByText('用户管理')).toBeInTheDocument()
    const childRow = screen.getByText('用户管理').closest('tr')!
    expect(within(childRow).getByText(/└/)).toBeInTheDocument()
  })

  fnTest([...FIDS], '点击新建菜单打开表单', async () => {
    const user = userEvent.setup()
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('仪表盘')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '新建菜单' }))
    const heading = await screen.findByText('新建菜单', { selector: 'h3' })
    expect(heading).toBeInTheDocument()
  })

  it.skip('新建菜单流程', async () => {
    const user = userEvent.setup()
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('仪表盘')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '新建菜单' }))
    await screen.findByText('新建菜单', { selector: 'h3' })
    const nameInput = await screen.findByRole('textbox', { name: /菜单名称/ })
    await user.type(nameInput, '新菜单XYZ')
    await user.type(screen.getByRole('textbox', { name: /路由路径/ }), 'new-menu')
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => expect(screen.getByText('新菜单XYZ')).toBeInTheDocument())
  })

  fnTest([...FIDS], '点击子菜单按钮设置 parentId', async () => {
    const user = userEvent.setup()
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('仪表盘')).toBeInTheDocument())
    const row = screen.getByText('仪表盘').closest('tr')!
    await user.click(within(row).getByRole('button', { name: '子菜单' }))
    expect(await screen.findByText('新建菜单', { selector: 'h3' })).toBeInTheDocument()
    expect(screen.getByText('（二级菜单）')).toBeInTheDocument()
  })

  it.skip('无 appId 时渲染提示', async () => {
    const router = createMemoryRouter(
      [{ path: '/platform/apps/:appId/menus', element: <MenuList /> }],
      { initialEntries: ['/platform/apps/%2Fmenus'] },
    )
    render(<RouterProvider router={router} />)
    expect(screen.getByText('请从应用管理进入菜单管理')).toBeInTheDocument()
  })

  fnTest([...FIDS], '列表为空时渲染"暂无菜单"', async () => {
    server.use(http.get('*/menus', () => HttpResponse.json([])))
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText(/暂无菜单/)).toBeInTheDocument())
  })
})
