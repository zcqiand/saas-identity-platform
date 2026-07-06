import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../../msw/server'
import RiskControlPage from '../../src/pages/RiskControl'
import { resetApiClient, setToken } from '../../src/api/client'
import type { RiskControl } from '../../src/types/security'

const MOCK_CONFIG: RiskControl = {
  id: 'rc-001',
  anomalyDetectionEnabled: true,
  crossRegionAlertEnabled: true,
  deviceFingerprintEnabled: true,
  riskScoreThreshold: 70,
}

beforeEach(() => {
  localStorage.clear()
  resetApiClient()
  setToken('mock-token')
})

describe('RiskControlPage', () => {
  it('mount 后渲染页面标题', async () => {
    render(<RiskControlPage />)
    await waitFor(() => expect(screen.getByText('风险控制')).toBeInTheDocument())
  })

  it('mount 后拉取配置数据并渲染风控项', async () => {
    render(<RiskControlPage />)
    await waitFor(() => expect(screen.getByText('风险控制')).toBeInTheDocument())
    expect(screen.getByText('异常登录检测')).toBeInTheDocument()
    expect(screen.getByText('异地登录告警')).toBeInTheDocument()
    expect(screen.getByText('设备指纹识别')).toBeInTheDocument()
    expect(screen.getByText('风险评分阈值')).toBeInTheDocument()
  })

  it('渲染风险评分阈值数值', async () => {
    render(<RiskControlPage />)
    await waitFor(() => expect(screen.getByText('风险控制')).toBeInTheDocument())
    expect(screen.getByText('70')).toBeInTheDocument()
  })

  it('配置加载前显示加载中', async () => {
    server.use(http.get('*/risk-control', () => HttpResponse.json(MOCK_CONFIG)))
    render(<RiskControlPage />)
    expect(screen.getByText(/加载中/)).toBeInTheDocument()
  })
})
