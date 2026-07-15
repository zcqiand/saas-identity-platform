import { describe, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoleFormModal } from '../../../src/features/rbac/RoleFormModal'
import { fnTest } from '../../fn'

const FIDS = ["M03.F01.I03","M03.F01.I04","M03.F01.I06"] as const

const editRole = {
  id: 'role-edit',
  name: '原角色',
  permissions: ['user:read', 'org:read'],
}

describe('RoleFormModal', () => {
  fnTest([...FIDS], 'create 模式: 标题"新建角色"，表单空', () => {
    render(<RoleFormModal open mode="create" onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('新建角色')).toBeInTheDocument()
    expect((screen.getByLabelText(/角色名称/) as HTMLInputElement).value).toBe('')
  })

  fnTest([...FIDS], 'edit 模式: 填充 initialValues', () => {
    render(<RoleFormModal open mode="edit" initialValues={editRole} onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('编辑角色')).toBeInTheDocument()
    expect((screen.getByLabelText(/角色名称/) as HTMLInputElement).value).toBe('原角色')
  })

  fnTest([...FIDS], 'create 提交触发 onSubmit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<RoleFormModal open mode="create" onSubmit={onSubmit} onCancel={() => {}} />)
    await user.type(screen.getByLabelText(/角色名称/), '超级管理员')
    await user.click(screen.getByLabelText('user:read'))
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: '超级管理员', permissions: ['user:read'] }),
    )
  })

  fnTest([...FIDS], 'edit 提交含完整 permissions', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<RoleFormModal open mode="edit" initialValues={editRole} onSubmit={onSubmit} onCancel={() => {}} />)
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: '原角色', permissions: ['user:read', 'org:read'] }),
    )
  })

  fnTest([...FIDS], '必填校验: name 为空', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<RoleFormModal open mode="create" onSubmit={onSubmit} onCancel={() => {}} />)
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => {
      expect(screen.getByText(/请输入角色名称/)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  fnTest([...FIDS], '必填校验: 未选权限', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<RoleFormModal open mode="create" onSubmit={onSubmit} onCancel={() => {}} />)
    await user.type(screen.getByLabelText(/角色名称/), '新角色')
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => {
      expect(screen.getByText(/请至少选择一个权限/)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  fnTest([...FIDS], '点取消触发 onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<RoleFormModal open mode="create" onSubmit={() => {}} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  fnTest([...FIDS], 'loading 禁用保存', () => {
    render(<RoleFormModal open mode="create" loading onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /保存中/ })).toBeDisabled()
  })
})
