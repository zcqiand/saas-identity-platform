import { http, HttpResponse } from 'msw'
import { listTenants, findTenant, type MockTenant } from './db'

// MSW handler 注册表。
// ch39：追加 /tenants GET 列表 + /tenants/:id GET 单个（只增不改）。
export const handlers = [
  http.get('*/tenants', () => {
    return HttpResponse.json(listTenants())
  }),

  http.get('*/tenants/:id', ({ params }) => {
    const tenant = findTenant(String(params.id))
    if (!tenant) {
      return HttpResponse.json({ message: '租户不存在' }, { status: 404 })
    }
    return HttpResponse.json(tenant as MockTenant)
  }),
]
