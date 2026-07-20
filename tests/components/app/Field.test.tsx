import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Field } from '../../../src/components/app/field'

describe('Field', () => {
  it('renders label', () => {
    render(
      <Field label="用户名">
        <input data-testid="input" />
      </Field>,
    )
    expect(screen.getByText('用户名')).toBeInTheDocument()
  })

  it('shows required asterisk when required=true', () => {
    const { container } = render(
      <Field label="用户名" required>
        <input />
      </Field>,
    )
    // 星号包在 span.text-destructive 里
    expect(container.querySelector('.text-destructive')?.textContent).toMatch(/\*/)
  })

  it('shows error when error is given (priority over hint)', () => {
    render(
      <Field label="x" error="不能为空" hint="hint-text">
        <input />
      </Field>,
    )
    expect(screen.getByText('不能为空')).toBeInTheDocument()
    expect(screen.queryByText('hint-text')).not.toBeInTheDocument()
  })

  it('shows hint when hint is given and no error', () => {
    render(
      <Field label="x" hint="至少 8 位">
        <input />
      </Field>,
    )
    expect(screen.getByText('至少 8 位')).toBeInTheDocument()
  })

  it('renders no help text when neither error nor hint', () => {
    const { container } = render(
      <Field label="x">
        <input />
      </Field>,
    )
    // Field 内的 <p> 只可能在 error/hint 分支出现
    expect(container.querySelectorAll('p').length).toBe(0)
  })

  it('passes htmlFor down to the Label so it associates with control', () => {
    render(
      <Field label="邮箱" htmlFor="email">
        <input id="email" />
      </Field>,
    )
    const input = screen.getByLabelText('邮箱')
    expect(input).toBe(screen.getByLabelText('邮箱'))
  })

  it('merges custom className', () => {
    const { container } = render(
      <Field label="x" className="my-field-class">
        <input />
      </Field>,
    )
    expect(container.firstChild).toHaveClass('my-field-class')
  })
})
