import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaginationBar } from '../../../src/components/app/pagination-bar'

describe('PaginationBar', () => {
  it('renders page indicator when total is omitted', () => {
    render(<PaginationBar page={2} totalPages={10} onPageChange={() => {}} />)
    expect(screen.getByText(/第 2 \/ 10 页/)).toBeInTheDocument()
  })

  it('renders total count + page indicator when total is given', () => {
    render(
      <PaginationBar page={1} totalPages={3} total={42} onPageChange={() => {}} />,
    )
    expect(screen.getByText(/共 42 条/)).toBeInTheDocument()
    expect(screen.getByText(/第 1 \/ 3 页/)).toBeInTheDocument()
  })

  it('prev button is disabled at page=1', () => {
    render(<PaginationBar page={1} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /上一页/ })).toBeDisabled()
  })

  it('next button is disabled at page=totalPages', () => {
    render(<PaginationBar page={3} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /下一页/ })).toBeDisabled()
  })

  it('clicking prev calls onPageChange with page-1', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <PaginationBar page={2} totalPages={5} onPageChange={onPageChange} />,
    )
    await user.click(screen.getByRole('button', { name: /上一页/ }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('clicking next calls onPageChange with page+1', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <PaginationBar page={4} totalPages={10} onPageChange={onPageChange} />,
    )
    await user.click(screen.getByRole('button', { name: /下一页/ }))
    expect(onPageChange).toHaveBeenCalledWith(5)
  })
})
