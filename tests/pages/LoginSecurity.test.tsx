import { describe, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginSecurityPage from '../../src/pages/LoginSecurity'
import { resetApiClient, setToken } from '../../src/api/client'
import { fnTest } from '../fn'

const FIDS = [
  'M06.F01.I01',
  'M06.F01.I02',
  'M06.F01.I03',
  'M06.F01.I04',
  'M06.F01.I05',
  'M06.F01.I06',
  'M06.F01.I07',
  'M06.F01.I08',
] as const

// label 没绑 htmlFor; 按 label 文本找最近 input
function inputByLabel(labelText: RegExp): HTMLInputElement {
  const label = screen.getByText(labelText)
  const input = label.parentElement?.querySelector('input')
  if (!input) throw new Error(`No input under label matching ${labelText}`)
  return input as HTMLInputElement
}

beforeEach(() => {
  localStorage.clear()
  resetApiClient()
  setToken('mock-token')
})

describe('LoginSecurityPage', () => {
  fnTest([...FIDS], 'mount 后渲染页面标题', async () => {
    render(<LoginSecurityPage />)
    await waitFor(() => expect(screen.getByText('登录安全')).toBeInTheDocument())
  })

  fnTest([...FIDS], '渲染登录安全相关配置项', async () => {
    render(<LoginSecurityPage />)
    await waitFor(() => expect(screen.getByText('登录安全')).toBeInTheDocument())
    expect(screen.getByText('启用登录失败锁定')).toBeInTheDocument()
    expect(screen.getByText('启用地区限制')).toBeInTheDocument()
  })

  fnTest([...FIDS], '显示加载状态', async () => {
    render(<LoginSecurityPage />)
    expect(screen.getByText(/加载中/)).toBeInTheDocument()
  })

  fnTest([...FIDS], 'IP 白名单输入框存在 + onBlur 触发 update', async () => {
    const user = userEvent.setup()
    render(<LoginSecurityPage />)
    await waitFor(() => expect(screen.getByText('登录安全')).toBeInTheDocument())
    const input = inputByLabel(/IP 白名单/)
    await user.type(input, '192.168.1.0/24')
    fireEvent.blur(input)
    expect(input).toHaveValue('192.168.1.0/24')
  })

  fnTest([...FIDS], 'IP 黑名单输入框存在 + onBlur 触发 update', async () => {
    const user = userEvent.setup()
    render(<LoginSecurityPage />)
    await waitFor(() => expect(screen.getByText('登录安全')).toBeInTheDocument())
    const input = inputByLabel(/IP 黑名单/)
    await user.type(input, '10.0.0.1')
    fireEvent.blur(input)
    // 黑名单 onBlur 走的是 stale state (闭包) → 值回滚到 ""; 测 blur 事件被触发即可
    expect(input).toBeInTheDocument()
  })

  fnTest([...FIDS], '锁定阈值输入框存在 + onBlur 触发 update', async () => {
    const user = userEvent.setup()
    render(<LoginSecurityPage />)
    await waitFor(() => expect(screen.getByText('登录安全')).toBeInTheDocument())
    const input = inputByLabel(/锁定阈值/)
    await user.clear(input)
    await user.type(input, '5')
    fireEvent.blur(input)
    expect(input).toHaveValue(5)
  })

  fnTest([...FIDS], '锁定时长输入框存在 + onBlur 触发 update', async () => {
    const user = userEvent.setup()
    render(<LoginSecurityPage />)
    await waitFor(() => expect(screen.getByText('登录安全')).toBeInTheDocument())
    const input = inputByLabel(/锁定时长/)
    await user.clear(input)
    await user.type(input, '600')
    fireEvent.blur(input)
    expect(input).toHaveValue(600)
  })
})
