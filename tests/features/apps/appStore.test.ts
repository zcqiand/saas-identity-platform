import { describe, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../msw/server'
import { useAppStore } from '../../../src/features/apps/appStore'
import { resetApiClient } from '../../../src/api/client'
import { fnTest } from '../../fn'

const FIDS = ["M04.F01.I12"] as const

beforeEach(() => {
  localStorage.clear()
  useAppStore.setState({
    apps: [],
    currentApp: null,
    currentAppMenus: [],
    loading: false,
    error: null,
  })
  resetApiClient()
})

describe('appStore 状态流转', () => {
  fnTest([...FIDS], '初始状态', () => {
    const s = useAppStore.getState()
    expect(s.apps).toEqual([])
    expect(s.currentApp).toBeNull()
    expect(s.currentAppMenus).toEqual([])
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'fetchApps 成功后 apps 填充', async () => {
    await useAppStore.getState().fetchApps()
    const s = useAppStore.getState()
    expect(s.apps.length).toBeGreaterThanOrEqual(1)
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'fetchApps 带 keyword 走参数', async () => {
    await useAppStore.getState().fetchApps('lab')
    const s = useAppStore.getState()
    expect(s.loading).toBe(false)
  })

  fnTest([...FIDS], 'fetchApps 网络错误后 error 填充', async () => {
    server.use(http.get('*/apps', () => HttpResponse.error()))
    await useAppStore.getState().fetchApps()
    const s = useAppStore.getState()
    expect(s.loading).toBe(false)
    expect(s.error).toBeTruthy()
  })

  fnTest([...FIDS], 'fetchApp(id) 成功后 currentApp 填充', async () => {
    await useAppStore.getState().fetchApps()
    const first = useAppStore.getState().apps[0]
    if (!first) return
    await useAppStore.getState().fetchApp(first.id)
    expect(useAppStore.getState().currentApp?.id).toBe(first.id)
  })

  fnTest([...FIDS], 'createApp 成功后 apps 头部追加', async () => {
    await useAppStore.getState().fetchApps()
    const before = useAppStore.getState().apps.length
    await useAppStore.getState().createApp({ name: '测试新应用', code: 'tst-new' })
    const s = useAppStore.getState()
    expect(s.apps.length).toBe(before + 1)
    expect(s.apps[0].name).toBe('测试新应用')
  })

  fnTest([...FIDS], 'updateApp 成功后对应项更新', async () => {
    await useAppStore.getState().fetchApps()
    const target = useAppStore.getState().apps[0]
    if (!target) return
    await useAppStore.getState().updateApp(target.id, { name: '已改名应用' })
    const updated = useAppStore.getState().apps.find((a) => a.id === target.id)
    expect(updated?.name).toBe('已改名应用')
  })

  fnTest([...FIDS], 'deleteApp 成功后对应项移除', async () => {
    await useAppStore.getState().fetchApps()
    const target = useAppStore.getState().apps[0]
    if (!target) return
    await useAppStore.getState().deleteApp(target.id)
    expect(useAppStore.getState().apps.find((a) => a.id === target.id)).toBeUndefined()
  })

  fnTest([...FIDS], 'fetchMenus(appId) 成功后 currentAppMenus 填充', async () => {
    await useAppStore.getState().fetchApps()
    const app = useAppStore.getState().apps[0]
    if (!app) return
    await useAppStore.getState().fetchMenus(app.id)
    const s = useAppStore.getState()
    expect(Array.isArray(s.currentAppMenus)).toBe(true)
  })

  fnTest([...FIDS], 'createMenu 成功后 currentAppMenus 头部追加', async () => {
    await useAppStore.getState().fetchApps()
    const app = useAppStore.getState().apps[0]
    if (!app) return
    await useAppStore.getState().fetchMenus(app.id)
    const before = useAppStore.getState().currentAppMenus.length
    await useAppStore.getState().createMenu({
      appId: app.id,
      name: '新菜单',
      path: 'new-menu',
    })
    expect(useAppStore.getState().currentAppMenus.length).toBe(before + 1)
  })

  fnTest([...FIDS], 'clearError 清除 error', async () => {
    server.use(http.get('*/apps', () => HttpResponse.error()))
    await useAppStore.getState().fetchApps()
    expect(useAppStore.getState().error).toBeTruthy()
    useAppStore.getState().clearError()
    expect(useAppStore.getState().error).toBeNull()
  })
})
