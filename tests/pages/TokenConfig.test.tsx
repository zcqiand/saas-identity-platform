import { describe, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TokenConfigPage from '../../src/pages/TokenConfig'
import { resetApiClient, setToken } from '../../src/api/client'
import { fnTest } from '../fn'

beforeEach(() => {
  localStorage.clear()
  resetApiClient()
  setToken('mock-token')
})

describe('TokenConfigPage', () => {
  fnTest(["M06.F04.I01","M06.F04.I02","M06.F04.I03","M06.F04.I04","M06.F04.I05"], 'mount 后渲染页面标题', async () => {
    render(<TokenConfigPage />)
    await waitFor(() => expect(screen.getByText('Token 管理')).toBeInTheDocument())
  })

  fnTest(["M06.F04.I01","M06.F04.I02","M06.F04.I03","M06.F04.I04","M06.F04.I05"], 'mount 后拉取配置数据并渲染 Token 配置项', async () => {
    render(<TokenConfigPage />)
    await waitFor(() => expect(screen.getByText('Token 管理')).toBeInTheDocument())
    expect(screen.getByText('访问令牌有效期')).toBeInTheDocument()
    expect(screen.getByText('Refresh Token 有效期')).toBeInTheDocument()
    expect(screen.getByText('开启 Refresh Token 续期')).toBeInTheDocument()
    expect(screen.getByText('开启 Token 主动失效')).toBeInTheDocument()
  })

  fnTest(["M06.F04.I01","M06.F04.I02","M06.F04.I03","M06.F04.I04","M06.F04.I05"], '渲染当前配置值', async () => {
    render(<TokenConfigPage />)
    await waitFor(() => expect(screen.getByText('Token 管理')).toBeInTheDocument())
    expect(screen.getByDisplayValue('3600')).toBeInTheDocument()
    expect(screen.getByDisplayValue('604800')).toBeInTheDocument()
  })
})
