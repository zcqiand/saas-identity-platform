import { describe, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../msw/server'
import { usePermissionStore } from '../../../src/features/rbac/permissionStore'
import { resetApiClient, setToken } from '../../../src/api/client'
import { fnTest } from '../../fn'

const FIDS = ["M03.F01.I10"] as const

beforeEach(() => {
  localStorage.clear()
  usePermissionStore.setState({ roles: [], permissions: [], loading: false, error: null })
  resetApiClient()
})

describe('permissionStore', () => {
  fnTest([...FIDS], '初始状态: roles=[], permissions=[]', () => {
    const s = usePermissionStore.getState()
    expect(s.roles).toEqual([])
    expect(s.permissions).toEqual([])
    expect(s.loading).toBe(false)
  })

  fnTest([...FIDS], 'fetchPermissions(orgId) 拉取权限集', async () => {
    setToken('mock-token')
    await usePermissionStore.getState().fetchPermissions('org-acme')
    const s = usePermissionStore.getState()
    expect(s.roles.length).toBeGreaterThan(0)
    expect(s.permissions.length).toBeGreaterThan(0)
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'fetchPermissions 不同 orgId 返回不同权限', async () => {
    setToken('mock-token')
    await usePermissionStore.getState().fetchPermissions('org-acme')
    const acmePerms = usePermissionStore.getState().permissions
    await usePermissionStore.getState().fetchPermissions('org-globex')
    const globexPerms = usePermissionStore.getState().permissions
    expect(acmePerms).not.toEqual(globexPerms)
  })

  fnTest([...FIDS], 'fetchPermissions 网络错误后 error 填充', async () => {
    server.use(http.get('*/auth/permissions', () => HttpResponse.error()))
    setToken('mock-token')
    await usePermissionStore.getState().fetchPermissions('org-acme')
    const s = usePermissionStore.getState()
    expect(s.loading).toBe(false)
    expect(s.error).toBeTruthy()
  })

  fnTest([...FIDS], 'checkPermission 检查权限码', async () => {
    setToken('mock-token')
    await usePermissionStore.getState().fetchPermissions('org-acme')
    const store = usePermissionStore.getState()
    // acme 应有 user:read
    expect(store.checkPermission('user:read')).toBe(true)
    expect(store.checkPermission('nonexistent:perm')).toBe(false)
  })

  fnTest([...FIDS], 'clearPermissions 清空权限', async () => {
    setToken('mock-token')
    await usePermissionStore.getState().fetchPermissions('org-acme')
    expect(usePermissionStore.getState().permissions.length).toBeGreaterThan(0)
    usePermissionStore.getState().clearPermissions()
    expect(usePermissionStore.getState().permissions).toEqual([])
    expect(usePermissionStore.getState().roles).toEqual([])
  })

  fnTest([...FIDS], 'clearError 清除 error', async () => {
    server.use(http.get('*/auth/permissions', () => HttpResponse.error()))
    setToken('mock-token')
    await usePermissionStore.getState().fetchPermissions('org-acme')
    expect(usePermissionStore.getState().error).toBeTruthy()
    usePermissionStore.getState().clearError()
    expect(usePermissionStore.getState().error).toBeNull()
  })
})
