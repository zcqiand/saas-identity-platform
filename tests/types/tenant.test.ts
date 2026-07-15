import { describe, expect } from 'vitest'
import type { TenantConfig, ThemeConfig, TenantState } from '../../src/types/tenant'
import { fnTest } from '../fn'

describe('types/tenant', () => {
  fnTest(["M01.F01.I11"], 'ThemeConfig 可构造', () => {
    const theme: ThemeConfig = {
      primary: '#2563eb',
      sidebar: '#1e293b',
      logoText: 'ACME',
    }
    expect(theme.primary).toBe('#2563eb')
    expect(theme.logoText).toBe('ACME')
  })

  fnTest(["M01.F01.I11"], 'TenantConfig 可构造', () => {
    const tenant: TenantConfig = {
      id: 'acme',
      name: 'ACME 集团',
      theme: { primary: '#2563eb', sidebar: '#1e293b', logoText: 'ACME' },
      features: ['sso', 'audit'],
    }
    expect(tenant.id).toBe('acme')
    expect(tenant.features).toContain('sso')
  })

  fnTest(["M01.F01.I11"], 'TenantState 可构造', () => {
    const state: TenantState = {
      current: null,
      list: [],
      loading: false,
      error: null,
    }
    expect(state.current).toBeNull()
    expect(state.list).toEqual([])
    expect(state.loading).toBe(false)
  })
})
