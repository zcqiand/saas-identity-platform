import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TenantFormModal } from '../../../src/features/tenant/TenantFormModal'
import type { TenantConfig } from '../../../src/types/tenant'

const editTenant: TenantConfig = {
  id: 'tenant-edit',
  name: '原租户',
  theme: { primary: '#2563eb', sidebar: '#1e293b', logoText: 'OLD' },
  features: ['sso', 'rbac'],
  config: { maxUsers: 50 },
}

describe('TenantFormModal', () => {
  it('create 模式: 标题"新建租户"，表单空', () => {
    render(<TenantFormModal open mode="create" onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('新建租户')).toBeInTheDocument()
    expect((screen.getByLabelText(/租户名称/) as HTMLInputElement).value).toBe('')
  })

  it('edit 模式: 填充 initialValues', () => {
    render(<TenantFormModal open mode="edit" initialValues={editTenant} onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('编辑租户')).toBeInTheDocument()
    expect((screen.getByLabelText(/租户名称/) as HTMLInputElement).value).toBe('原租户')
    expect((screen.getByLabelText(/Logo 文本/) as HTMLInputElement).value).toBe('OLD')
  })

  it('create 提交触发 onSubmit', async () => {
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

  it('edit 提交含完整 theme 和 config', async () => {
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

  it('必填校验: name 为空提示错误', async () => {
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

  it('点取消触发 onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<TenantFormModal open mode="create" onSubmit={() => {}} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('loading 禁用保存', () => {
    render(<TenantFormModal open mode="create" loading onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /保存中/ })).toBeDisabled()
  })

  it('功能模块 checkbox 可切换', async () => {
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
