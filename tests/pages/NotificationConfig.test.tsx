import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import NotificationConfigPage from '../../src/pages/NotificationConfig'
import { resetApiClient, setToken } from '../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  resetApiClient()
  setToken('mock-token')
})

describe('NotificationConfigPage', () => {
  it('mount 后渲染页面标题', async () => {
    render(<NotificationConfigPage />)
    await waitFor(() => expect(screen.getByText('消息通知')).toBeInTheDocument())
  })

  it('mount 后拉取配置数据并渲染通知渠道', async () => {
    render(<NotificationConfigPage />)
    await waitFor(() => expect(screen.getByText('消息通知')).toBeInTheDocument())
    expect(screen.getByText('邮件通知')).toBeInTheDocument()
    expect(screen.getByText('短信通知')).toBeInTheDocument()
    expect(screen.getByText('站内信')).toBeInTheDocument()
  })

  it('渲染通知触发条件', async () => {
    render(<NotificationConfigPage />)
    await waitFor(() => expect(screen.getByText('消息通知')).toBeInTheDocument())
    expect(screen.getByText('登录通知')).toBeInTheDocument()
    expect(screen.getByText('密码变更')).toBeInTheDocument()
    expect(screen.getByText('安全告警')).toBeInTheDocument()
    expect(screen.getByText('系统通知')).toBeInTheDocument()
  })
})
