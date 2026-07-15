import { describe, expect } from 'vitest'
import { fnTest } from '../fn'

const API_BASE = 'http://localhost/api'

describe('MSW tenant handlers', () => {
  fnTest(["M01.F01.I01","M01.F01.I08"], 'GET /tenants 返回租户列表', async () => {
    const res = await fetch(`${API_BASE}/tenants`)
    expect(res.ok).toBe(true)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThanOrEqual(2)
    const ids = data.map((t: { id: string }) => t.id).sort()
    expect(ids).toContain('acme')
    expect(ids).toContain('globex')
  })

  fnTest(["M01.F01.I01","M01.F01.I08"], 'GET /tenants/:id 返回单个租户含 theme/config', async () => {
    const res = await fetch(`${API_BASE}/tenants/acme`)
    expect(res.ok).toBe(true)
    const data = await res.json()
    expect(data.id).toBe('acme')
    expect(data.name).toBe('ACME 集团')
    expect(data.theme.primary).toBe('#2563eb')
    expect(data.theme.logoText).toBe('ACME')
    expect(data.config.features).toContain('sso')
  })

  fnTest(["M01.F01.I01","M01.F01.I08"], 'GET /tenants/:id 不存在返回 404', async () => {
    const res = await fetch(`${API_BASE}/tenants/nonexistent`)
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.message).toBeTruthy()
  })
})
