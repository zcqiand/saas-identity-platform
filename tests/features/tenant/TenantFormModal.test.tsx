import { describe, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TenantFormModal } from '../../../src/features/tenant/TenantFormModal'
import type { TenantConfig } from '../../../src/types/tenant'
import { fnTest } from '../../fn'

const editTenant: TenantConfig = {
  id: 'tenant-edit',
  name: '原租户',
  theme: { primary: '#2563eb', sidebar: '#1e293b', logoText: 'OLD' },
  features: ['sso', 'rbac'],
  config: { maxUsers: 50 },
}

describe('TenantFormModal', () => {
  fnTest(["M01.F01.I03"], 'create 模式: 标题"新建租户"，表单空', () => {
    render(<TenantFormModal open mode="create" onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('新建租户')).toBeInTheDocument()
    expect((screen.getByLabelText(/租户名称/) as HTMLInputElement).value).toBe('')
  })

  fnTest(["M01.F01.I03"], 'edit 模式: 填充 initialValues', () => {
    render(<TenantFormModal open mode="edit" initialValues={editTenant} onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('编辑租户')).toBeInTheDocument()
    expect((screen.getByLabelText(/租户名称/) as HTMLInputElement).value).toBe('原租户')
    expect((screen.getByLabelText(/Logo 文本/) as HTMLInputElement).value).toBe('OLD')
  })

  fnTest(["M01.F01.I03"], 'create 提交触发 onSubmit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TenantFormModal open mode="create" onSubmit={onSubmit} onCancel={() => {}} />)
    await user.type(screen.getByLabelText(/租户名称/), '新租户ABC')
    await user.type(screen.getByLabelText(/Logo 文本/), 'NEW')
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '新租户ABC',
        theme: expect.objectContaining({ logoText: 'NEW' }),
      }),
    )
  })

  fnTest(["M01.F01.I03"], 'edit 提交含完整 theme 和 config', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TenantFormModal open mode="edit" initialValues={editTenant} onSubmit={onSubmit} onCancel={() => {}} />)
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '原租户',
        theme: expect.objectContaining({ primary: '#2563eb', sidebar: '#1e293b', logoText: 'OLD' }),
        config: expect.objectContaining({ maxUsers: 50 }),
      }),
    )
  })

  fnTest(["M01.F01.I03"], '必填校验: name 为空提示错误', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TenantFormModal open mode="create" onSubmit={onSubmit} onCancel={() => {}} />)
    await user.type(screen.getByLabelText(/Logo 文本/), 'NEW')
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => {
      expect(screen.getByText(/请输入租户名称/)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  fnTest(["M01.F01.I03"], '点取消触发 onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<TenantFormModal open mode="create" onSubmit={() => {}} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  fnTest(["M01.F01.I03"], 'loading 禁用保存', () => {
    render(<TenantFormModal open mode="create" loading onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /保存中/ })).toBeDisabled()
  })

  fnTest(["M01.F01.I03"], '功能模块 checkbox 可切换', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TenantFormModal open mode="create" onSubmit={onSubmit} onCancel={() => {}} />)
    await user.type(screen.getByLabelText(/租户名称/), '功能测试')
    await user.type(screen.getByLabelText(/Logo 文本/), 'TEST')
    await user.click(screen.getByLabelText('sso'))
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({ features: ['sso'] }),
      }),
    )
  })
})
