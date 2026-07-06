import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import OpenPlatformPage from '../../src/pages/OpenPlatform'
import { resetApiClient, setToken } from '../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  resetApiClient()
  setToken('mock-token')
})

describe('OpenPlatformPage', () => {
  it('mount 后渲染页面标题', async () => {
    render(<OpenPlatformPage />)
    await waitFor(() => expect(screen.getByText('开放平台')).toBeInTheDocument())
  })

  it('mount 后拉取配置数据并渲染能力开关', async () => {
    render(<OpenPlatformPage />)
    await waitFor(() => expect(screen.getByText('开放平台')).toBeInTheDocument())
    expect(screen.getByText('OpenAPI')).toBeInTheDocument()
    expect(screen.getByText('Webhook')).toBeInTheDocument()
    expect(screen.getByText('SDK 下载')).toBeInTheDocument()
  })

  it('渲染开放范围', async () => {
    render(<OpenPlatformPage />)
    await waitFor(() => expect(screen.getByText('开放平台')).toBeInTheDocument())
    expect(screen.getByDisplayValue('user:read, role:read, org:read')).toBeInTheDocument()
  })

  it('渲染回调地址白名单', async () => {
    render(<OpenPlatformPage />)
    await waitFor(() => expect(screen.getByText('开放平台')).toBeInTheDocument())
    expect(screen.getByDisplayValue('https://example.com/callback')).toBeInTheDocument()
  })
})
