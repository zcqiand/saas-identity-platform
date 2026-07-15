import { describe, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import LoginSecurityPage from '../../src/pages/LoginSecurity'
import { resetApiClient, setToken } from '../../src/api/client'
import { fnTest } from '../fn'

beforeEach(() => {
  localStorage.clear()
  resetApiClient()
  setToken('mock-token')
})

describe('LoginSecurityPage', () => {
  fnTest(["M06.F01.I01","M06.F01.I04","M06.F01.I07"], 'mount 后渲染页面标题', async () => {
    render(<LoginSecurityPage />)
    await waitFor(() => expect(screen.getByText('登录安全')).toBeInTheDocument())
  })

  fnTest(["M06.F01.I01","M06.F01.I04","M06.F01.I07"], '渲染登录安全相关配置项', async () => {
    render(<LoginSecurityPage />)
    await waitFor(() => expect(screen.getByText('登录安全')).toBeInTheDocument())
    expect(screen.getByText('启用登录失败锁定')).toBeInTheDocument()
    expect(screen.getByText('启用地区限制')).toBeInTheDocument()
  })

  fnTest(["M06.F01.I01","M06.F01.I04","M06.F01.I07"], '显示加载状态', async () => {
    render(<LoginSecurityPage />)
    expect(screen.getByText(/加载中/)).toBeInTheDocument()
  })
})
