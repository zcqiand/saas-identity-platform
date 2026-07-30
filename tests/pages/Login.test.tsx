import { describe, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Login from '../../src/pages/Login'
import { fnTest } from '../fn'

const FIDS = ['M01.F04.I04'] as const

describe('Login 登录入口页', () => {
  fnTest([...FIDS], '挂载后渲染 data-fn="M01.F04.I04" 容器（ch40 SSO 实现前的占位入口）', () => {
    const { container } = render(<Login />)
    const root = container.querySelector('[data-fn="M01.F04.I04"]')
    expect(root).not.toBeNull()
  })

  fnTest([...FIDS], '渲染登录标题（"登录" 二字）', () => {
    render(<Login />)
    expect(screen.getByText('登录')).toBeInTheDocument()
  })

  fnTest([...FIDS], '渲染占位文案「SSO 登录待 ch40 实现」（ch39 占位阶段）', () => {
    render(<Login />)
    expect(screen.getByText(/SSO 登录待/)).toBeInTheDocument()
  })
})
