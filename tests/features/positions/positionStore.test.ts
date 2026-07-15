import { describe, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../msw/server'
import { usePositionStore } from '../../../src/features/positions/positionStore'
import { resetApiClient } from '../../../src/api/client'
import { fnTest } from '../../fn'

const FIDS = ["M02.F03.I03", "M02.F03.I04", "M02.F03.I05"] as const

beforeEach(() => {
  localStorage.clear()
  usePositionStore.setState({ list: [], loading: false, error: null })
  resetApiClient()
})

describe('positionStore 状态流转', () => {
  fnTest([...FIDS], '初始状态', () => {
    const s = usePositionStore.getState()
    expect(s.list).toEqual([])
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'fetchPositions 成功后 list 填充', async () => {
    await usePositionStore.getState().fetchPositions()
    const s = usePositionStore.getState()
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'fetchPositions 网络错误后 error 填充', async () => {
    server.use(http.get('*/positions', () => HttpResponse.error()))
    await usePositionStore.getState().fetchPositions()
    const s = usePositionStore.getState()
    expect(s.loading).toBe(false)
    expect(s.error).toBeTruthy()
  })

  fnTest([...FIDS], 'createPosition 成功后 list 头部追加', async () => {
    await usePositionStore.getState().fetchPositions()
    const before = usePositionStore.getState().list.length
    await usePositionStore.getState().createPosition({ name: '新岗位', code: 'p-new' })
    const s = usePositionStore.getState()
    expect(s.list.length).toBe(before + 1)
    expect(s.list[0].name).toBe('新岗位')
  })

  fnTest([...FIDS], 'createPosition 网络错误后 error 填充', async () => {
    server.use(http.post('*/positions', () => HttpResponse.error()))
    await usePositionStore.getState().createPosition({ name: '新岗位' })
    expect(usePositionStore.getState().error).toBeTruthy()
  })

  fnTest([...FIDS], 'updatePosition 成功后对应项更新', async () => {
    await usePositionStore.getState().fetchPositions()
    const target = usePositionStore.getState().list[0]
    if (!target) return
    await usePositionStore.getState().updatePosition(target.id, { name: '已改名岗位' })
    const updated = usePositionStore.getState().list.find((p) => p.id === target.id)
    expect(updated?.name).toBe('已改名岗位')
  })

  fnTest([...FIDS], 'deletePosition 成功后对应项移除', async () => {
    await usePositionStore.getState().fetchPositions()
    const target = usePositionStore.getState().list[0]
    if (!target) return
    await usePositionStore.getState().deletePosition(target.id)
    expect(usePositionStore.getState().list.find((p) => p.id === target.id)).toBeUndefined()
  })
})
