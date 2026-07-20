import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from '../../../src/components/app/page-header'

describe('PageHeader', () => {
  it('renders title in an h1', () => {
    render(<PageHeader title="用户管理" />)
    const h = screen.getByRole('heading', { level: 1, name: '用户管理' })
    expect(h).toBeInTheDocument()
  })

  it('renders description when given', () => {
    render(<PageHeader title="用户" description="平台所有用户列表" />)
    expect(screen.getByText('平台所有用户列表')).toBeInTheDocument()
  })

  it('omits description when not given', () => {
    const { container } = render(<PageHeader title="用户" />)
    // description 节点是 <p>; 不应该出现
    expect(container.querySelectorAll('p').length).toBe(0)
  })

  it('renders actions when given', () => {
    render(
      <PageHeader title="用户" actions={<button>新增用户</button>} />,
    )
    expect(screen.getByRole('button', { name: '新增用户' })).toBeInTheDocument()
  })

  it('omits actions wrapper when actions not given', () => {
    const { container } = render(<PageHeader title="用户" />)
    // actions 是 `<div flex items-center gap-2>`，未给不应该存在
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(0)
  })

  it('merges custom className with the default layout', () => {
    const { container } = render(
      <PageHeader title="x" className="my-custom" />,
    )
    const root = container.firstChild as HTMLElement
    expect(root.className).toMatch(/flex/)
    expect(root.className).toMatch(/my-custom/)
  })
})
