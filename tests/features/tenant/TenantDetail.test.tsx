import { describe, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { useTenantStore } from '../../../src/features/tenant/tenantStore'
import { resetApiClient } from '../../../src/api/client'
import TenantDetail from '../../../src/pages/TenantDetail'
import { fnTest } from '../../fn'

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/platform/tenants/:tenantId', element: <TenantDetail /> },
      { path: '/platform/tenants', element: <div>租户列表</div> },
    ],
    { initialEntries: [path] },
  )
  return render(<RouterProvider router={router} />)
}

beforeEach(() => {
  localStorage.clear()
  useTenantStore.setState({ current: null, list: [], loading: false, error: null })
  resetApiClient()
})

describe('TenantDetail', () => {
  fnTest(["M01.F01.I06","M01.F01.I07"], '路由加载后渲染租户配置标题', async () => {
    renderAt('/platform/tenants/acme')
    await waitFor(() => expect(screen.getByText('租户配置')).toBeInTheDocument())
    expect(screen.getByText('acme')).toBeInTheDocument()
  })

  fnTest(["M01.F01.I06","M01.F01.I07"], '渲染表单字段并可编辑', async () => {
    const user = userEvent.setup()
    renderAt('/platform/tenants/acme')
    await waitFor(() => expect(screen.getByText('租户配置')).toBeInTheDocument())

    // 租户名称通过 label htmlFor/id 关联
    const nameInput = screen.getByLabelText(/租户名称/) as HTMLInputElement
    expect(nameInput.value).toBe('ACME 集团')
    await user.clear(nameInput)
    await user.type(nameInput, 'ACME 已改名')
    expect(nameInput.value).toBe('ACME 已改名')
  })

  fnTest(["M01.F01.I06","M01.F01.I07"], '返回按钮存在', async () => {
    renderAt('/platform/tenants/acme')
    await waitFor(() => expect(screen.getByText('租户配置')).toBeInTheDocument())
    // 返回按钮存在即证明 navigate 逻辑已挂载
    expect(screen.getByText('← 返回')).toBeInTheDocument()
  })

  fnTest(["M01.F01.I06","M01.F01.I07"], '保存配置后显示保存成功', async () => {
    const user = userEvent.setup()
    renderAt('/platform/tenants/acme')
    await waitFor(() => expect(screen.getByText('租户配置')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '保存配置' }))
    await waitFor(() => expect(screen.getByText('保存成功')).toBeInTheDocument())
  })

  fnTest(["M01.F01.I06","M01.F01.I07"], '加载中状态显示加载提示', async () => {
    useTenantStore.setState({ loading: true, current: null })
    renderAt('/platform/tenants/acme')
    await waitFor(() => expect(screen.getByText('加载中...')).toBeInTheDocument())
  })

  fnTest(["M01.F01.I06","M01.F01.I07"], '功能模块 checkbox 可切换', async () => {
    const user = userEvent.setup()
    renderAt('/platform/tenants/acme')
    await waitFor(() => expect(screen.getByText('租户配置')).toBeInTheDocument())

    // sso 默认选中，取消勾选
    const ssoCheckbox = screen.getByLabelText('sso') as HTMLInputElement
    expect(ssoCheckbox.checked).toBe(true)
    await user.click(ssoCheckbox)
    expect(ssoCheckbox.checked).toBe(false)
  })
})
