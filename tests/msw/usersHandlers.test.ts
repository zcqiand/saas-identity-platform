import { describe, it, expect } from 'vitest'

const API_BASE = 'http://localhost/api'

async function createUser(body: unknown) {
  return fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
async function listUsers(query?: string) {
  const url = query ? `${API_BASE}/users?${query}` : `${API_BASE}/users`
  return fetch(url)
}
async function getUser(id: string) {
  return fetch(`${API_BASE}/users/${id}`)
}
async function updateUser(id: string, body: unknown) {
  return fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
async function deleteUser(id: string) {
  return fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' })
}

describe('MSW users handlers', () => {
  it('GET /users 返回分页结构', async () => {
    await createUser({
      username: 'seed@acme',
      displayName: '种子',
      email: 's@acme.com',
      orgId: 'org-acme',
      roles: ['member'],
    })
    const res = await listUsers('page=1&pageSize=10')
    expect(res.ok).toBe(true)
    const data = await res.json()
    expect(data.items).toBeInstanceOf(Array)
    expect(typeof data.total).toBe('number')
    expect(data.page).toBe(1)
  })

  it('POST /users 创建成功返回 201', async () => {
    const res = await createUser({
      username: 'new@acme',
      displayName: '新建',
      email: 'n@acme.com',
      orgId: 'org-acme',
      roles: ['member'],
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.id).toBeTruthy()
    expect(data.username).toBe('new@acme')
  })

  it('POST /users 缺必填返回 400', async () => {
    const res = await createUser({ username: 'x' })
    expect(res.status).toBe(400)
  })

  it('GET /users/:id 返回单个用户', async () => {
    const created = await (await createUser({
      username: 'q@acme',
      displayName: '查询',
      email: 'q@acme.com',
      orgId: 'org-acme',
      roles: ['member'],
    })).json()
    const res = await getUser(created.id)
    expect(res.ok).toBe(true)
    expect((await res.json()).id).toBe(created.id)
  })

  it('PUT /users/:id 更新成功', async () => {
    const created = await (await createUser({
      username: 'u@acme',
      displayName: '原',
      email: 'u@acme.com',
      orgId: 'org-acme',
      roles: ['member'],
    })).json()
    const res = await updateUser(created.id, { displayName: '改后', status: 'disabled' })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.displayName).toBe('改后')
    expect(data.status).toBe('disabled')
  })

  it('DELETE /users/:id 删除成功 204', async () => {
    const created = await (await createUser({
      username: 'd@acme',
      displayName: '删',
      email: 'd@acme.com',
      orgId: 'org-acme',
      roles: ['member'],
    })).json()
    const res = await deleteUser(created.id)
    expect(res.status).toBe(204)
    expect((await getUser(created.id)).status).toBe(404)
  })

  it('GET /users 支持 keyword 搜索', async () => {
    await createUser({
      username: 'kw-admin@acme',
      displayName: '管理员XYZ',
      email: 'a@acme.com',
      orgId: 'org-acme',
      roles: ['admin'],
    })
    await createUser({
      username: 'kw-other@acme',
      displayName: '普通ABC',
      email: 'o@acme.com',
      orgId: 'org-acme',
      roles: ['member'],
    })
    const res = await listUsers('page=1&pageSize=50&keyword=XYZ')
    const data = await res.json()
    expect(data.items.every((u: { displayName: string }) => u.displayName.includes('XYZ'))).toBe(true)
  })

  it('GET /users 支持 role 筛选', async () => {
    await createUser({
      username: 'r1@acme',
      displayName: '管理员',
      email: 'r1@acme.com',
      orgId: 'org-acme',
      roles: ['admin'],
    })
    await createUser({
      username: 'r2@acme',
      displayName: '成员',
      email: 'r2@acme.com',
      orgId: 'org-acme',
      roles: ['member'],
    })
    const res = await listUsers('page=1&pageSize=50&role=admin')
    const data = await res.json()
    expect(data.items.every((u: { roles: string[] }) => u.roles.includes('admin'))).toBe(true)
  })

  it('GET /users 支持 orgId 筛选', async () => {
    await createUser({
      username: 'o1@acme',
      displayName: 'A组织',
      email: 'o1@acme.com',
      orgId: 'org-acme',
      roles: ['member'],
    })
    await createUser({
      username: 'o2@globex',
      displayName: 'G组织',
      email: 'o2@globex.com',
      orgId: 'org-globex',
      roles: ['member'],
    })
    const res = await listUsers('page=1&pageSize=50&orgId=org-globex')
    const data = await res.json()
    expect(data.items.every((u: { orgId: string }) => u.orgId === 'org-globex')).toBe(true)
  })
})

describe('MSW orgs handlers', () => {
  it('GET /orgs 返回组织树', async () => {
    const res = await fetch(`${API_BASE}/orgs`)
    expect(res.ok).toBe(true)
    const data = await res.json()
    expect(data.id).toBeTruthy()
    expect(data.name).toBeTruthy()
    expect(Array.isArray(data.children)).toBe(true)
  })

  it('GET /orgs?orgId=org-acme 返回指定组织子树', async () => {
    const res = await fetch(`${API_BASE}/orgs?orgId=org-acme`)
    expect(res.ok).toBe(true)
    const data = await res.json()
    expect(data.id).toBe('org-acme')
  })
})

describe('MSW audit-logs handlers', () => {
  it('GET /audit-logs 返回分页日志', async () => {
    const res = await fetch(`${API_BASE}/audit-logs?page=1&pageSize=20`)
    expect(res.ok).toBe(true)
    const data = await res.json()
    expect(data.items).toBeInstanceOf(Array)
    expect(typeof data.total).toBe('number')
    expect(data.page).toBe(1)
  })

  it('GET /audit-logs 支持 action 筛选', async () => {
    const res = await fetch(`${API_BASE}/audit-logs?page=1&pageSize=50&action=login`)
    const data = await res.json()
    expect(data.items.every((l: { action: string }) => l.action === 'login')).toBe(true)
  })

  it('GET /audit-logs 支持 operator 筛选', async () => {
    const res = await fetch(`${API_BASE}/audit-logs?page=1&pageSize=50&operator=admin`)
    const data = await res.json()
    expect(data.items.every((l: { operator: string }) => l.operator.includes('admin'))).toBe(true)
  })

  it('GET /audit-logs 按 timestamp 倒序', async () => {
    const res = await fetch(`${API_BASE}/audit-logs?page=1&pageSize=50`)
    const data = await res.json()
    const ts = data.items.map((l: { timestamp: string }) => l.timestamp)
    const sorted = [...ts].sort().reverse()
    expect(ts).toEqual(sorted)
  })
})
