import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../msw/server'
import { useRoleStore } from '../../../src/features/rbac/roleStore'
import { resetApiClient } from '../../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  useRoleStore.setState({ list: [], loading: false, error: null })
  resetApiClient()
})

describe('roleStore 状态流转', () => {
  it('初始状态', () => {
    const s = useRoleStore.getState()
    expect(s.list).toEqual([])
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  it('fetchRoles 成功后 list 填充', async () => {
    await useRoleStore.getState().fetchRoles()
    const s = useRoleStore.getState()
    expect(s.list.length).toBeGreaterThanOrEqual(2)
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  it('fetchRoles 网络错误后 error 填充', async () => {
    server.use(http.get('*/roles', () => HttpResponse.error()))
    await useRoleStore.getState().fetchRoles()
    const s = useRoleStore.getState()
    expect(s.loading).toBe(false)
    expect(s.error).toBeTruthy()
    expect(s.list).toEqual([])
  })

  it('createRole 成功后新角色添加到 list 头部', async () => {
    await useRoleStore.getState().createRole({
      name: '新角色',
      permissions: ['user:read'],
    })
    const s = useRoleStore.getState()
    expect(s.list[0].name).toBe('新角色')
    expect(s.list[0].permissions).toEqual(['user:read'])
    expect(s.error).toBeNull()
  })

  it('createRole 网络错误后 error 填充', async () => {
    server.use(http.post('*/roles', () => HttpResponse.error()))
    await useRoleStore.getState().createRole({ name: '新角色', permissions: ['user:read'] })
    const s = useRoleStore.getState()
    expect(s.error).toBeTruthy()
  })

  it('updateRole 成功后对应项更新', async () => {
    await useRoleStore.getState().fetchRoles()
    const roleId = useRoleStore.getState().list[0].id
    await useRoleStore.getState().updateRole(roleId, { name: '已改名角色' })
    const s = useRoleStore.getState()
    const updated = s.list.find((r) => r.id === roleId)
    expect(updated?.name).toBe('已改名角色')
    expect(s.error).toBeNull()
  })

  it('updateRole 网络错误后 error 填充', async () => {
    server.use(http.put('*/roles/role-admin', () => HttpResponse.error()))
    await useRoleStore.getState().updateRole('role-admin', { name: '改名' })
    const s = useRoleStore.getState()
    expect(s.error).toBeTruthy()
  })

  it('deleteRole 成功后对应项移除', async () => {
    await useRoleStore.getState().fetchRoles()
    const roleId = useRoleStore.getState().list[0].id
    await useRoleStore.getState().deleteRole(roleId)
    const s = useRoleStore.getState()
    expect(s.list.find((r) => r.id === roleId)).toBeUndefined()
    expect(s.error).toBeNull()
  })

  it('deleteRole 网络错误后 error 填充', async () => {
    server.use(http.delete('*/roles/role-admin', () => HttpResponse.error()))
    await useRoleStore.getState().deleteRole('role-admin')
    const s = useRoleStore.getState()
    expect(s.error).toBeTruthy()
  })

  it('clearError 清除 error', async () => {
    server.use(http.get('*/roles', () => HttpResponse.error()))
    await useRoleStore.getState().fetchRoles()
    expect(useRoleStore.getState().error).toBeTruthy()
    useRoleStore.getState().clearError()
    expect(useRoleStore.getState().error).toBeNull()
  })
})
