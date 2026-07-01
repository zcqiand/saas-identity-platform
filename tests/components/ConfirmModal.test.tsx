import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmModal } from '../../src/components/ConfirmModal'

describe('ConfirmModal', () => {
  it('open=false 时不渲染', () => {
    render(
      <ConfirmModal open={false} title="删除确认" message="确定？" onConfirm={() => {}} onCancel={() => {}} />,
    )
    expect(screen.queryByText('删除确认')).not.toBeInTheDocument()
  })

  it('open=true 渲染 title 与 message', () => {
    render(
      <ConfirmModal open title="删除确认" message="确定删除该用户？" onConfirm={() => {}} onCancel={() => {}} />,
    )
    expect(screen.getByText('删除确认')).toBeInTheDocument()
    expect(screen.getByText('确定删除该用户？')).toBeInTheDocument()
  })

  it('点击确认触发 onConfirm', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ConfirmModal open title="x" message="y" onConfirm={onConfirm} onCancel={() => {}} />)
    await user.click(screen.getByRole('button', { name: '确认' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('点击取消触发 onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmModal open title="x" message="y" onConfirm={() => {}} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('loading 时确认按钮禁用且文本变化', () => {
    render(
      <ConfirmModal open title="x" message="y" confirmText="删除" loading onConfirm={() => {}} onCancel={() => {}} />,
    )
    expect(screen.getByRole('button', { name: /处理中/ })).toBeDisabled()
  })
})
