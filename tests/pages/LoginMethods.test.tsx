import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import LoginMethods from '../../src/pages/LoginMethods'
import { resetApiClient, setToken } from '../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  resetApiClient()
  setToken('mock-token')
})

describe('LoginMethods', () => {
  it('mount 后渲染页面标题', async () => {
    render(<LoginMethods />)
    await waitFor(() => expect(screen.getByText('登录认证配置')).toBeInTheDocument())
  })

  it('mount 后拉取登录方式数据并渲染', async () => {
    render(<LoginMethods />)
    await waitFor(() => expect(screen.getByText('用户名密码登录')).toBeInTheDocument())
    expect(screen.getByText('邮箱验证码登录')).toBeInTheDocument()
  })

  it('渲染 SSO 提供商', async () => {
    render(<LoginMethods />)
    await waitFor(() => expect(screen.getByText('企业 IDP')).toBeInTheDocument())
  })

  it('渲染 OAuth2 提供商', async () => {
    render(<LoginMethods />)
    await waitFor(() => expect(screen.getByText('Google')).toBeInTheDocument())
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })
})
