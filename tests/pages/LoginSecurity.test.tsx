import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { server } from '../../msw/server'
import LoginSecurityPage from '../../src/pages/LoginSecurity'
import { resetApiClient, setToken } from '../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  resetApiClient()
  setToken('mock-token')
})

describe('LoginSecurityPage', () => {
  it('mount 后渲染页面标题', async () => {
    render(<LoginSecurityPage />)
    await waitFor(() => expect(screen.getByText('登录安全')).toBeInTheDocument())
  })

  it('渲染登录安全相关配置项', async () => {
    render(<LoginSecurityPage />)
    await waitFor(() => expect(screen.getByText('登录安全')).toBeInTheDocument())
    expect(screen.getByText('启用登录失败锁定')).toBeInTheDocument()
    expect(screen.getByText('启用地区限制')).toBeInTheDocument()
  })

  it('显示加载状态', async () => {
    render(<LoginSecurityPage />)
    expect(screen.getByText(/加载中/)).toBeInTheDocument()
  })
})
