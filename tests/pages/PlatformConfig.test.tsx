import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { resetApiClient } from '../../src/api/client'
import PlatformConfigPage from '../../src/pages/PlatformConfig'

beforeEach(() => {
  localStorage.clear()
  resetApiClient()
})

describe('PlatformConfigPage', () => {
  it('mount 后渲染页面标题', () => {
    render(<PlatformConfigPage />)
    expect(screen.getByText('平台配置')).toBeInTheDocument()
  })

  it('渲染平台信息', () => {
    render(<PlatformConfigPage />)
    expect(screen.getByText('平台名称')).toBeInTheDocument()
    expect(screen.getByText('SaaS IAM 统一身份管理平台')).toBeInTheDocument()
    expect(screen.getByText('版本')).toBeInTheDocument()
    expect(screen.getByText(/v1.0-001/)).toBeInTheDocument()
    expect(screen.getByText('功能模块')).toBeInTheDocument()
  })

  it('渲染功能模块列表', () => {
    render(<PlatformConfigPage />)
    expect(screen.getByText(/多租户/)).toBeInTheDocument()
    expect(screen.getByText(/RBAC/)).toBeInTheDocument()
    expect(screen.getByText(/SSO/)).toBeInTheDocument()
    expect(screen.getByText(/审计日志/)).toBeInTheDocument()
    expect(screen.getByText(/应用管理/)).toBeInTheDocument()
    expect(screen.getByText(/菜单管理/)).toBeInTheDocument()
  })
})
