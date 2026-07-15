import { describe, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TenantProvider, useTenant } from '../../../src/features/tenant/TenantContext'
import type { TenantConfig } from '../../../src/types/tenant'
import { fnTest } from '../../fn'

const mockTenant: TenantConfig = {
  id: 'acme',
  name: 'ACME 集团',
  theme: { primary: '#2563eb', sidebar: '#1e293b', logoText: 'ACME' },
  features: ['sso', 'audit'],
}

function TenantConsumer() {
  const { tenant, loading, error } = useTenant()
  if (loading) return <div>加载中</div>
  if (error) return <div>错误：{error}</div>
  if (!tenant) return <div>无租户</div>
  return (
    <div>
      <span>租户ID：{tenant.id}</span>
      <span>租户名：{tenant.name}</span>
      <span>主题色：{tenant.theme.primary}</span>
      <span>功能：{tenant.features.join(',')}</span>
    </div>
  )
}

describe('TenantContext', () => {
  fnTest(["M01.F01.I08"], 'TenantProvider 提供 tenant 给子组件', () => {
    render(
      <TenantProvider tenant={mockTenant}>
        <TenantConsumer />
      </TenantProvider>,
    )
    expect(screen.getByText('租户ID：acme')).toBeInTheDocument()
    expect(screen.getByText('租户名：ACME 集团')).toBeInTheDocument()
    expect(screen.getByText('主题色：#2563eb')).toBeInTheDocument()
    expect(screen.getByText('功能：sso,audit')).toBeInTheDocument()
  })

  fnTest(["M01.F01.I08"], 'TenantProvider tenant=null 时子组件收到 null', () => {
    render(
      <TenantProvider tenant={null}>
        <TenantConsumer />
      </TenantProvider>,
    )
    expect(screen.getByText('无租户')).toBeInTheDocument()
  })

  fnTest(["M01.F01.I08"], 'useTenant 在 Provider 外抛错', () => {
    // 抑制 console.error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TenantConsumer />)).toThrow(/TenantProvider/i)
    spy.mockRestore()
  })
})
