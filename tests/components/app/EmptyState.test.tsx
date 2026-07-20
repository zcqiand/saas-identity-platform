import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '../../../src/components/app/empty-state'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="暂无数据" />)
    expect(screen.getByText('暂无数据')).toBeInTheDocument()
  })

  it('renders description when given', () => {
    render(
      <EmptyState title="搜索无结果" description="换个关键词试试" />,
    )
    expect(screen.getByText('换个关键词试试')).toBeInTheDocument()
  })

  it('renders icon when given', () => {
    render(
      <EmptyState
        title="x"
        icon={<span data-testid="empty-icon">📭</span>}
      />,
    )
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument()
  })

  it('renders action when given', () => {
    render(
      <EmptyState
        title="x"
        action={<button>重试</button>}
      />,
    )
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(
      <EmptyState title="x" className="my-empty-class" />,
    )
    expect(container.firstChild).toHaveClass('my-empty-class')
  })
})
