import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../../../src/components/app/confirm-dialog'

describe('ConfirmDialog', () => {
  it('does not render body when open=false', () => {
    render(
      <ConfirmDialog
        open={false}
        onOpenChange={() => {}}
        title="删除确认"
        onConfirm={() => {}}
      />,
    )
    expect(screen.queryByText('删除确认')).not.toBeInTheDocument()
  })

  it('renders title and description when open=true', () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="删除确认"
        description="该操作不可恢复"
        onConfirm={() => {}}
      />,
    )
    expect(screen.getByText('删除确认')).toBeInTheDocument()
    expect(screen.getByText('该操作不可恢复')).toBeInTheDocument()
  })

  it('omits description node when description not given', () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="x"
        onConfirm={() => {}}
      />,
    )
    // description 走 AlertDialogDescription；不传则不渲染
    expect(screen.queryByText('该操作不可恢复')).not.toBeInTheDocument()
  })

  it('clicking confirm calls onConfirm', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="x"
        onConfirm={onConfirm}
      />,
    )
    await user.click(screen.getByRole('button', { name: '确认' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('clicking cancel triggers onOpenChange(false)', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="x"
        onConfirm={() => {}}
      />,
    )
    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('destructive applies destructive class to confirm button', () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="x"
        destructive
        onConfirm={() => {}}
      />,
    )
    const btn = screen.getByRole('button', { name: '确认' })
    expect(btn.className).toMatch(/bg-destructive|destructive/)
  })

  it('loading disables both buttons', () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="x"
        loading
        confirmText="处理中…"
        onConfirm={() => {}}
      />,
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
    buttons.forEach((b) => expect(b).toBeDisabled())
  })

  it('custom confirmText and cancelText are rendered', () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="x"
        confirmText="永久删除"
        cancelText="再想想"
        onConfirm={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: '永久删除' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '再想想' })).toBeInTheDocument()
  })
})
