import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { SsoCallback } from '../../../src/features/sso/SsoCallback'
import { useAuthStore } from '../../../src/features/auth/authStore'
import { resetApiClient } from '../../../src/api/client'

function renderWithCallbackUrl(search: string) {
  return render(
    <MemoryRouter initialEntries={[`/sso-callback${search}`]}>
      <Routes>
        <Route path="/sso-callback" element={<SsoCallback />} />
        <Route path="/acme/dashboard" element={<div>仪表盘</div>} />
        <Route path="/login" element={<div>登录失败页</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({ user: null, token: null, currentOrgId: null, status: 'idle', error: null })
  resetApiClient()
})

describe('SsoCallback', () => {
  it('从 URLSearchParams 取 code 并调 handleOAuthCallback', async () => {
    renderWithCallbackUrl('?code=mock-auth-code&state=xyz')
    await waitFor(() => {
      expect(useAuthStore.getState().status).toBe('authenticated')
    })
    expect(useAuthStore.getState().token).toBeTruthy()
  })

  it('成功后跳转到 dashboard', async () => {
    renderWithCallbackUrl('?code=mock-auth-code&state=xyz')
    await waitFor(() => {
      expect(screen.getByText('仪表盘')).toBeInTheDocument()
    })
  })

  it('URL 无 code 时跳登录页', async () => {
    renderWithCallbackUrl('?state=xyz')
    await waitFor(() => {
      expect(screen.getByText('登录失败页')).toBeInTheDocument()
    })
    expect(useAuthStore.getState().status).not.toBe('authenticated')
  })

  it('回调失败时跳登录页', async () => {
    renderWithCallbackUrl('?code=bad-code&state=xyz')
    await waitFor(() => {
      expect(screen.getByText('登录失败页')).toBeInTheDocument()
    })
  })

  it('处理中显示加载文案', () => {
    renderWithCallbackUrl('?code=mock-auth-code&state=xyz')
    expect(screen.getByText(/SSO 回调处理中/)).toBeInTheDocument()
  })
})
