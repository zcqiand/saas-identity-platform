import { describe, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../msw/server'
import { useDepartmentStore } from '../../../src/features/orgs/departmentStore'
import { resetApiClient } from '../../../src/api/client'
import { fnTest } from '../../fn'

const FIDS = ["M02.F01.I02","M02.F01.I03","M02.F01.I04","M02.F01.I05","M02.F01.I06","M02.F01.I07","M02.F01.I09"] as const

beforeEach(() => {
  localStorage.clear()
  useDepartmentStore.setState({ tree: null, loading: false, error: null })
  resetApiClient()
})

describe('departmentStore 状态流转', () => {
  fnTest([...FIDS], '初始状态', () => {
    const s = useDepartmentStore.getState()
    expect(s.tree).toBeNull()
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'fetchDepartmentTree 成功后 tree 填充', async () => {
    await useDepartmentStore.getState().fetchDepartmentTree()
    const s = useDepartmentStore.getState()
    expect(s.tree).not.toBeNull()
    // v0.3.0：/orgs 返回扁平 Department[]（原 OrgNode 单根树已下线）
    expect(Array.isArray(s.tree)).toBe(true)
    expect(s.tree?.find((d) => d.id === 'org-acme')?.name).toBe('ACME 集团总部')
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'fetchDepartmentTree 网络错误后 error 填充', async () => {
    server.use(http.get('*/orgs', () => HttpResponse.error()))
    await useDepartmentStore.getState().fetchDepartmentTree()
    const s = useDepartmentStore.getState()
    expect(s.loading).toBe(false)
    expect(s.error).toBeTruthy()
  })

  fnTest([...FIDS], 'createDepartmentNode 成功后重新拉取树', async () => {
    await useDepartmentStore.getState().fetchDepartmentTree()
    await useDepartmentStore.getState().createDepartmentNode('新部门', 'org-acme')
    const s = useDepartmentStore.getState()
    expect(s.tree).not.toBeNull()
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'createDepartmentNode 父节点不存在时 error 填充', async () => {
    server.use(http.post('*/orgs', () => HttpResponse.json({ message: '父节点不存在' }, { status: 404 })))
    await useDepartmentStore.getState().createDepartmentNode('新部门', 'nonexistent')
    const s = useDepartmentStore.getState()
    expect(s.error).toBeTruthy()
  })

  fnTest([...FIDS], 'updateDepartmentNode 成功后树更新', async () => {
    await useDepartmentStore.getState().fetchDepartmentTree()
    await useDepartmentStore.getState().updateDepartmentNode('org-acme', 'ACME 集团总部')
    const s = useDepartmentStore.getState()
    expect(s.error).toBeNull()
  })

  fnTest([...FIDS], 'updateDepartmentNode 节点不存在时 error 填充', async () => {
    server.use(http.put('*/orgs/nonexistent', () => HttpResponse.json({ message: '节点不存在' }, { status: 404 })))
    await useDepartmentStore.getState().updateDepartmentNode('nonexistent', '改名')
    const s = useDepartmentStore.getState()
    expect(s.error).toBeTruthy()
  })

  fnTest([...FIDS], 'deleteDepartmentNode 成功后树更新', async () => {
    await useDepartmentStore.getState().fetchDepartmentTree()
    await useDepartmentStore.getState().createDepartmentNode('待删除部门', 'org-acme')
    const created = useDepartmentStore.getState().tree?.find((d) => d.name === '待删除部门')
    expect(created).toBeDefined()
    await useDepartmentStore.getState().deleteDepartmentNode(created!.id)
    const s = useDepartmentStore.getState()
    expect(s.error).toBeNull()
    expect(s.tree?.some((d) => d.id === created!.id)).toBe(false)
  })

  fnTest([...FIDS], 'deleteDepartmentNode 节点不存在时 error 填充', async () => {
    server.use(http.delete('*/orgs/nonexistent', () => HttpResponse.json({ message: '节点不存在' }, { status: 404 })))
    await useDepartmentStore.getState().deleteDepartmentNode('nonexistent')
    const s = useDepartmentStore.getState()
    expect(s.error).toBeTruthy()
  })

  fnTest([...FIDS], 'clearError 清除 error', async () => {
    server.use(http.get('*/orgs', () => HttpResponse.error()))
    await useDepartmentStore.getState().fetchDepartmentTree()
    expect(useDepartmentStore.getState().error).toBeTruthy()
    useDepartmentStore.getState().clearError()
    expect(useDepartmentStore.getState().error).toBeNull()
  })
})