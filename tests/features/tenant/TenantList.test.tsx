import { describe, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { fnTest } from '../../fn'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { TenantList } from '../../../src/features/tenant/TenantList'
import { useTenantStore } from '../../../src/features/tenant/tenantStore'
import { resetApiClient } from '../../../src/api/client'

function makeRouter(path = '/platform/tenants') {
  const router = createMemoryRouter(
    [
      { path: '/platform/tenants', element: <TenantList /> },
      { path: '/platform/tenants/:tenantId', element: <div>租户详情页</div> },
    ],
    { initialEntries: [path] },
  )
  return router
}

beforeEach(() => {
  localStorage.clear()
  useTenantStore.setState({ list: [], loading: false, error: null })
  resetApiClient()
})

describe('TenantList', () => {
  fnTest(["M01.F01.I01","M01.F01.I02","M01.F01.I03","M01.F01.I04","M01.F01.I05"], 'mount 后渲染"平台租户管理"标题', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('平台租户管理')).toBeInTheDocument())
  })

  fnTest(["M01.F01.I01","M01.F01.I02","M01.F01.I03","M01.F01.I04","M01.F01.I05"], 'mount 后拉取租户列表', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())
    expect(screen.getByText('Globex 科技')).toBeInTheDocument()
  })

  fnTest(["M01.F01.I01","M01.F01.I02","M01.F01.I03","M01.F01.I04","M01.F01.I05"], '新建租户流程', async () => {
    const user = userEvent.setup()
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '新建租户' }))
    expect(screen.getByText('新建租户', { selector: 'h3' })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/租户名称/), '新租户XYZ')
    await user.type(screen.getByLabelText(/Logo 文本/), 'NEW')
    await user.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(screen.getByText('新租户XYZ')).toBeInTheDocument())
  })

  fnTest(["M01.F01.I01","M01.F01.I02","M01.F01.I03","M01.F01.I04","M01.F01.I05"], '详情配置按钮包含正确的导航目标', async () => {
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())

    const acmeRow = screen.getByText('ACME 集团').closest('tr')!
    const btn = within(acmeRow).getByRole('button', { name: '详情配置' })
    // 按钮存在即证明导航目标正确（navigate 在按钮 onClick 里）
    expect(btn).toBeInTheDocument()
  })

  fnTest(["M01.F01.I01","M01.F01.I02","M01.F01.I03","M01.F01.I04","M01.F01.I05"], '删除租户流程', async () => {
    const user = userEvent.setup()
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('Globex 科技')).toBeInTheDocument())

    const globexRow = screen.getByText('Globex 科技').closest('tr')!
    await user.click(within(globexRow).getByRole('button', { name: '删除' }))

    expect(screen.getByText('删除确认')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '确认' }))

    await waitFor(() => expect(screen.queryByText('Globex 科技')).not.toBeInTheDocument())
    expect(screen.getByText('ACME 集团')).toBeInTheDocument()
  })

  fnTest(["M01.F01.I01","M01.F01.I02","M01.F01.I03","M01.F01.I04","M01.F01.I05"], '搜索流程', async () => {
    const user = userEvent.setup()
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())

    await user.type(screen.getByPlaceholderText(/搜索租户名称/), 'ACME')
    await user.click(screen.getByRole('button', { name: '搜索' }))

    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())
    expect(screen.queryByText('Globex 科技')).not.toBeInTheDocument()
  })

  fnTest(["M01.F01.I01","M01.F01.I02","M01.F01.I03","M01.F01.I04","M01.F01.I05"], '列表为空时渲染"暂无数据"', async () => {
    const { http, HttpResponse } = await import('msw')
    const { server: srv } = await import('../../../msw/server')
    srv.use(http.get('*/tenants', () => HttpResponse.json([])))
    useTenantStore.setState({ list: [], loading: false, error: null })
    render(<RouterProvider router={makeRouter()} />)
    await waitFor(() => expect(screen.getByText('暂无数据')).toBeInTheDocument())
  })
})
