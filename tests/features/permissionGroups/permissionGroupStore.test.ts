import { describe, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../msw/server'
import { usePermissionGroupStore } from '../../../src/features/permissionGroups/permissionGroupStore'
import { resetApiClient } from '../../../src/api/client'
import { fnTest } from '../../fn'

const FIDS = ["M03.F02.I05"] as const

beforeEach(() => {
  localStorage.clear()
  usePermissionGroupStore.setState({ list: [], loading: false, error: null })
  resetApiClient()
})

describe('permissionGroupStore 状态流转', () => {
  fnTest([...FIDS], '初始状态', () => {
    const s = usePermissionGroupStore.getState()
    expect(s.list).toEqual([])
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'fetchPermissionGroups 成功后 list 填充', async () => {
    await usePermissionGroupStore.getState().fetchPermissionGroups()
    const s = usePermissionGroupStore.getState()
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'fetchPermissionGroups 网络错误后 error 填充', async () => {
    server.use(http.get('*/permission-groups', () => HttpResponse.error()))
    await usePermissionGroupStore.getState().fetchPermissionGroups()
    const s = usePermissionGroupStore.getState()
    expect(s.loading).toBe(false)
    expect(s.error).toBeTruthy()
  })

  fnTest([...FIDS], 'createPermissionGroup 成功后 list 头部追加', async () => {
    await usePermissionGroupStore.getState().fetchPermissionGroups()
    const before = usePermissionGroupStore.getState().list.length
    await usePermissionGroupStore.getState().createPermissionGroup({ name: '新权限组' })
    const s = usePermissionGroupStore.getState()
    expect(s.list.length).toBe(before + 1)
    expect(s.list[0].name).toBe('新权限组')
  })

  fnTest([...FIDS], 'updatePermissionGroup 成功后对应项更新', async () => {
    await usePermissionGroupStore.getState().fetchPermissionGroups()
    const target = usePermissionGroupStore.getState().list[0]
    if (!target) return
    await usePermissionGroupStore.getState().updatePermissionGroup(target.id, {
      name: '已改名权限组',
    })
    const updated = usePermissionGroupStore.getState().list.find((g) => g.id === target.id)
    expect(updated?.name).toBe('已改名权限组')
  })

  fnTest([...FIDS], 'deletePermissionGroup 成功后对应项移除', async () => {
    await usePermissionGroupStore.getState().fetchPermissionGroups()
    const target = usePermissionGroupStore.getState().list[0]
    if (!target) return
    await usePermissionGroupStore.getState().deletePermissionGroup(target.id)
    expect(usePermissionGroupStore.getState().list.find((g) => g.id === target.id)).toBeUndefined()
  })
})
