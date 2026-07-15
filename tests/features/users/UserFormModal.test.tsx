import { describe, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserFormModal } from '../../../src/features/users/UserFormModal'
import type { User } from '../../../src/types/user'
import { fnTest } from '../../fn'

const FIDS = ["M02.F02.I05","M02.F02.I06"] as const

const editUser: User = {
  id: 'u-edit',
  username: 'edit@acme',
  displayName: '原用户',
  email: 'edit@acme.com',
  orgId: 'org-acme',
  roles: ['member'],
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('UserFormModal', () => {
  fnTest([...FIDS], 'create 模式: 标题"新建用户"，表单空', () => {
    render(<UserFormModal open mode="create" onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('新建用户')).toBeInTheDocument()
    expect((screen.getByLabelText(/用户名/) as HTMLInputElement).value).toBe('')
  })

  fnTest([...FIDS], 'edit 模式: 填充 initialValues', () => {
    render(<UserFormModal open mode="edit" initialValues={editUser} onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('编辑用户')).toBeInTheDocument()
    expect((screen.getByLabelText(/用户名/) as HTMLInputElement).value).toBe('edit@acme')
    expect((screen.getByLabelText(/显示名/) as HTMLInputElement).value).toBe('原用户')
  })

  fnTest([...FIDS], 'create 提交触发 onSubmit（无 orgTree 时 orgId 为文本框）', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<UserFormModal open mode="create" onSubmit={onSubmit} onCancel={() => {}} />)
    await user.type(screen.getByLabelText(/用户名/), 'new@acme')
    await user.type(screen.getByLabelText(/显示名/), '新建用户')
    await user.type(screen.getByLabelText(/邮箱/), 'new@acme.com')
    // 无 orgTree prop 时降级为文本框
    await user.type(screen.getByLabelText(/组织/), 'org-acme')
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'new@acme',
        displayName: '新建用户',
        email: 'new@acme.com',
        orgId: 'org-acme',
        roles: ['member'],
      }),
    )
  })

  fnTest([...FIDS], 'create 提交触发 onSubmit（有 orgTree 时 orgId 为下拉）', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const mockOrgTree = {
      id: 'org-root',
      name: 'ACME 集团',
      children: [
        { id: 'org-acme', name: 'ACME 总部' },
        { id: 'org-tech', name: '技术部' },
      ],
    }
    render(<UserFormModal open mode="create" onSubmit={onSubmit} onCancel={() => {}} orgTree={mockOrgTree} />)
    await user.type(screen.getByLabelText(/用户名/), 'new@acme')
    await user.type(screen.getByLabelText(/显示名/), '新建用户')
    await user.type(screen.getByLabelText(/邮箱/), 'new@acme.com')
    await user.selectOptions(screen.getByLabelText(/组织/), 'org-acme')
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'new@acme',
        orgId: 'org-acme',
        roles: ['member'],
      }),
    )
  })

  fnTest([...FIDS], 'edit 提交含 id', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<UserFormModal open mode="edit" initialValues={editUser} onSubmit={onSubmit} onCancel={() => {}} />)
    const nameInput = screen.getByLabelText(/显示名/) as HTMLInputElement
    await user.clear(nameInput)
    await user.type(nameInput, '已改名')
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u-edit', displayName: '已改名' }),
    )
  })

  fnTest([...FIDS], '必填校验', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<UserFormModal open mode="create" onSubmit={onSubmit} onCancel={() => {}} />)
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => {
      expect(screen.getByText(/请输入用户名/)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  fnTest([...FIDS], '点取消触发 onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<UserFormModal open mode="create" onSubmit={() => {}} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  fnTest([...FIDS], 'loading 禁用保存', () => {
    render(<UserFormModal open mode="create" loading onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /保存中/ })).toBeDisabled()
  })
})
