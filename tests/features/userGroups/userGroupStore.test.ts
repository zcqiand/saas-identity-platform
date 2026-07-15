import { describe, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../msw/server'
import { useUserGroupStore } from '../../../src/features/userGroups/userGroupStore'
import { resetApiClient } from '../../../src/api/client'
import { fnTest } from '../../fn'

const FIDS = ["M03.F03.I05"] as const

beforeEach(() => {
  localStorage.clear()
  useUserGroupStore.setState({ list: [], loading: false, error: null })
  resetApiClient()
})

describe('userGroupStore 状态流转', () => {
  fnTest([...FIDS], '初始状态', () => {
    const s = useUserGroupStore.getState()
    expect(s.list).toEqual([])
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'fetchUserGroups 成功后 list 填充', async () => {
    await useUserGroupStore.getState().fetchUserGroups()
    const s = useUserGroupStore.getState()
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'fetchUserGroups 网络错误后 error 填充', async () => {
    server.use(http.get('*/user-groups', () => HttpResponse.error()))
    await useUserGroupStore.getState().fetchUserGroups()
    const s = useUserGroupStore.getState()
    expect(s.loading).toBe(false)
    expect(s.error).toBeTruthy()
  })

  fnTest([...FIDS], 'createUserGroup 成功后 list 头部追加', async () => {
    await useUserGroupStore.getState().fetchUserGroups()
    const before = useUserGroupStore.getState().list.length
    await useUserGroupStore.getState().createUserGroup({ name: '新用户组' })
    const s = useUserGroupStore.getState()
    expect(s.list.length).toBe(before + 1)
    expect(s.list[0].name).toBe('新用户组')
  })

  fnTest([...FIDS], 'updateUserGroup 成功后对应项更新', async () => {
    await useUserGroupStore.getState().fetchUserGroups()
    const target = useUserGroupStore.getState().list[0]
    if (!target) return
    await useUserGroupStore.getState().updateUserGroup(target.id, { name: '已改名用户组' })
    const updated = useUserGroupStore.getState().list.find((g) => g.id === target.id)
    expect(updated?.name).toBe('已改名用户组')
  })

  fnTest([...FIDS], 'deleteUserGroup 成功后对应项移除', async () => {
    await useUserGroupStore.getState().fetchUserGroups()
    const target = useUserGroupStore.getState().list[0]
    if (!target) return
    await useUserGroupStore.getState().deleteUserGroup(target.id)
    expect(useUserGroupStore.getState().list.find((g) => g.id === target.id)).toBeUndefined()
  })
})
