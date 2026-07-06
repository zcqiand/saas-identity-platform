import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TokenConfigPage from '../../src/pages/TokenConfig'
import { resetApiClient, setToken } from '../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  resetApiClient()
  setToken('mock-token')
})

describe('TokenConfigPage', () => {
  it('mount 后渲染页面标题', async () => {
    render(<TokenConfigPage />)
    await waitFor(() => expect(screen.getByText('Token 管理')).toBeInTheDocument())
  })

  it('mount 后拉取配置数据并渲染 Token 配置项', async () => {
    render(<TokenConfigPage />)
    await waitFor(() => expect(screen.getByText('Token 管理')).toBeInTheDocument())
    expect(screen.getByText('访问令牌有效期')).toBeInTheDocument()
    expect(screen.getByText('Refresh Token 有效期')).toBeInTheDocument()
    expect(screen.getByText('开启 Refresh Token 续期')).toBeInTheDocument()
    expect(screen.getByText('开启 Token 主动失效')).toBeInTheDocument()
  })

  it('渲染当前配置值', async () => {
    render(<TokenConfigPage />)
    await waitFor(() => expect(screen.getByText('Token 管理')).toBeInTheDocument())
    expect(screen.getByDisplayValue('3600')).toBeInTheDocument()
    expect(screen.getByDisplayValue('604800')).toBeInTheDocument()
  })
})
