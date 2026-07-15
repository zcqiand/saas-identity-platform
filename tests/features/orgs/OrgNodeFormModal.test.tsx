import { describe, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrgNodeFormModal } from '../../../src/features/orgs/OrgNodeFormModal'
import { fnTest } from '../../fn'

const FIDS = ["M02.F01.I08"] as const

describe('OrgNodeFormModal', () => {
  fnTest([...FIDS], 'create 模式: 标题"新增组织节点"', () => {
    render(<OrgNodeFormModal open mode="create" onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('新增组织节点')).toBeInTheDocument()
    expect((screen.getByLabelText(/节点名称/) as HTMLInputElement).value).toBe('')
  })

  fnTest([...FIDS], 'edit 模式: 填充 initialName', () => {
    render(
      <OrgNodeFormModal
        open
        mode="edit"
        nodeId="org-tech"
        initialName="技术部"
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    )
    expect(screen.getByText('编辑组织节点')).toBeInTheDocument()
    expect((screen.getByLabelText(/节点名称/) as HTMLInputElement).value).toBe('技术部')
  })

  fnTest([...FIDS], 'create 提交触发 onSubmit(name, parentId)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <OrgNodeFormModal
        open
        mode="create"
        nodeId="org-acme"
        onSubmit={onSubmit}
        onCancel={() => {}}
      />,
    )
    await user.type(screen.getByLabelText(/节点名称/), '新部门XYZ')
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(onSubmit).toHaveBeenCalledWith('新部门XYZ', 'org-acme')
  })

  fnTest([...FIDS], 'edit 提交触发 onSubmit(name)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <OrgNodeFormModal
        open
        mode="edit"
        nodeId="org-tech"
        initialName="技术部"
        onSubmit={onSubmit}
        onCancel={() => {}}
      />,
    )
    const nameInput = screen.getByLabelText(/节点名称/) as HTMLInputElement
    await user.clear(nameInput)
    await user.type(nameInput, '技术研发部')
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(onSubmit).toHaveBeenCalledWith('技术研发部', 'org-tech')
  })

  fnTest([...FIDS], '空名称校验', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<OrgNodeFormModal open mode="create" onSubmit={onSubmit} onCancel={() => {}} />)
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => expect(screen.getByText(/请输入节点名称/)).toBeInTheDocument())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  fnTest([...FIDS], '点取消触发 onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<OrgNodeFormModal open mode="create" onSubmit={() => {}} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  fnTest([...FIDS], 'loading 禁用保存', () => {
    render(<OrgNodeFormModal open mode="create" loading onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /保存中/ })).toBeDisabled()
  })
})
