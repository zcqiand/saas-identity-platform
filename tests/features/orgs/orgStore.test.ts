import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../msw/server'
import { useOrgStore } from '../../../src/features/orgs/orgStore'
import { resetApiClient } from '../../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  useOrgStore.setState({ tree: null, loading: false, error: null })
  resetApiClient()
})

describe('orgStore 状态流转', () => {
  it('初始状态', () => {
    const s = useOrgStore.getState()
    expect(s.tree).toBeNull()
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  it('fetchOrgTree 成功后 tree 填充', async () => {
    await useOrgStore.getState().fetchOrgTree()
    const s = useOrgStore.getState()
    expect(s.tree).not.toBeNull()
    expect(s.tree?.name).toBe('ACME 集团')
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  it('fetchOrgTree 网络错误后 error 填充', async () => {
    server.use(http.get('*/orgs', () => HttpResponse.error()))
    await useOrgStore.getState().fetchOrgTree()
    const s = useOrgStore.getState()
    expect(s.loading).toBe(false)
    expect(s.error).toBeTruthy()
  })

  it('createOrgNode 成功后重新拉取树', async () => {
    await useOrgStore.getState().fetchOrgTree()
    await useOrgStore.getState().createOrgNode('新部门', 'org-root')
    const s = useOrgStore.getState()
    expect(s.tree).not.toBeNull()
    expect(s.error).toBeNull()
  })

  it('createOrgNode 父节点不存在时 error 填充', async () => {
    server.use(http.post('*/orgs', () => HttpResponse.json({ message: '父节点不存在' }, { status: 404 })))
    await useOrgStore.getState().createOrgNode('新部门', 'nonexistent')
    const s = useOrgStore.getState()
    expect(s.error).toBeTruthy()
  })

  it('updateOrgNode 成功后树更新', async () => {
    await useOrgStore.getState().fetchOrgTree()
    await useOrgStore.getState().updateOrgNode('org-tech', '技术研发部')
    const s = useOrgStore.getState()
    expect(s.error).toBeNull()
  })

  it('updateOrgNode 节点不存在时 error 填充', async () => {
    server.use(http.put('*/orgs/nonexistent', () => HttpResponse.json({ message: '节点不存在' }, { status: 404 })))
    await useOrgStore.getState().updateOrgNode('nonexistent', '改名')
    const s = useOrgStore.getState()
    expect(s.error).toBeTruthy()
  })

  it('deleteOrgNode 成功后树更新', async () => {
    await useOrgStore.getState().fetchOrgTree()
    await useOrgStore.getState().deleteOrgNode('org-sales')
    const s = useOrgStore.getState()
    expect(s.error).toBeNull()
  })

  it('deleteOrgNode 节点不存在时 error 填充', async () => {
    server.use(http.delete('*/orgs/nonexistent', () => HttpResponse.json({ message: '节点不存在' }, { status: 404 })))
    await useOrgStore.getState().deleteOrgNode('nonexistent')
    const s = useOrgStore.getState()
    expect(s.error).toBeTruthy()
  })

  it('clearError 清除 error', async () => {
    server.use(http.get('*/orgs', () => HttpResponse.error()))
    await useOrgStore.getState().fetchOrgTree()
    expect(useOrgStore.getState().error).toBeTruthy()
    useOrgStore.getState().clearError()
    expect(useOrgStore.getState().error).toBeNull()
  })
})
