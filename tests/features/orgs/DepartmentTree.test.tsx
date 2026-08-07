import { describe, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DepartmentTree } from '../../../src/features/orgs/DepartmentTree'
import { useDepartmentStore } from '../../../src/features/orgs/departmentStore'
import { resetApiClient, setToken } from '../../../src/api/client'
import { fnTest } from '../../fn'
import type { Department } from '@saas/identity-platform-shared/schemas'

const FIDS = ["M02.F01.I01","M02.F01.I02","M02.F01.I03","M02.F01.I04","M02.F01.I05","M02.F01.I06"] as const

// Phase 5b：扁平 Department[]（parentId 自引用，children 字段已不存在）。
// 测试 fixture 与共享种子对齐：2 个根（acme / tenant-lab）+ acme 下面挂 3 级子节点。
const MOCK_DEPARTMENTS: Department[] = [
  { id: 'org-acme', tenantId: 'acme', name: 'ACME 集团', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'org-tech', tenantId: 'acme', name: '技术部', parentId: 'org-acme', sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'org-fe', tenantId: 'acme', name: '前端组', parentId: 'org-tech', sort: 1, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'org-sales', tenantId: 'acme', name: '销售部', parentId: 'org-acme', sort: 2, enabled: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'org-lab-root', tenantId: 'tenant-lab', name: '示例建筑工程检测实验室', parentId: null, sort: 1, enabled: true, createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
]

beforeEach(() => {
  localStorage.clear()
  // 覆盖 fetchDepartmentTree 让组件挂载时不发请求，直接用本地 fixture
  useDepartmentStore.setState({
    tree: MOCK_DEPARTMENTS,
    loading: false,
    error: null,
    fetchDepartmentTree: async () => {
      useDepartmentStore.setState({ tree: MOCK_DEPARTMENTS })
    },
    createDepartmentNode: async (name, parentId) => {
      const newNode: Department = {
        id: `org-new-${Math.random().toString(36).slice(2, 6)}`,
        tenantId: 'acme',
        name,
        parentId,
        sort: 99,
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      useDepartmentStore.setState({ tree: [...MOCK_DEPARTMENTS, newNode] })
    },
    updateDepartmentNode: async (id, name) => {
      useDepartmentStore.setState({
        tree: MOCK_DEPARTMENTS.map((d) => (d.id === id ? { ...d, name } : d)),
      })
    },
    deleteDepartmentNode: async (id) => {
      useDepartmentStore.setState({
        tree: MOCK_DEPARTMENTS.filter((d) => d.id !== id),
      })
    },
  })
  resetApiClient()
  setToken('mock-token')
})

describe('DepartmentTree', () => {
  fnTest([...FIDS], '拉取并渲染根节点', async () => {
    render(<DepartmentTree />)
    expect(await screen.findByText('ACME 集团')).toBeInTheDocument()
    expect(screen.getByText('示例建筑工程检测实验室')).toBeInTheDocument()
  })

  fnTest([...FIDS], '默认展开根节点，显示一级子节点', async () => {
    render(<DepartmentTree />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())
    // 一级子节点应可见
    expect(screen.getByText('技术部')).toBeInTheDocument()
    expect(screen.getByText('销售部')).toBeInTheDocument()
  })

  fnTest([...FIDS], '点击节点切换展开/折叠', async () => {
    const user = userEvent.setup()
    render(<DepartmentTree />)
    await waitFor(() => expect(screen.getByText('技术部')).toBeInTheDocument())
    // 初始：技术部折叠
    expect(screen.queryByText('前端组')).not.toBeInTheDocument()
    // 点技术部展开 → 前端组可见
    await user.click(screen.getByText('技术部'))
    await waitFor(() => expect(screen.getByText('前端组')).toBeInTheDocument())
    // 再点技术部折叠 → 前端组消失
    await user.click(screen.getByText('技术部'))
    await waitFor(() => expect(screen.queryByText('前端组')).not.toBeInTheDocument())
  })

  fnTest([...FIDS], '递归渲染深层节点', async () => {
    const user = userEvent.setup()
    render(<DepartmentTree />)
    await waitFor(() => expect(screen.getByText('技术部')).toBeInTheDocument())
    // Phase 5b：auto-expand 只展开 root + level-1；深层节点需手动点技术部
    await user.click(screen.getByText('技术部'))
    await waitFor(() => expect(screen.getByText('前端组')).toBeInTheDocument())
  })

  fnTest([...FIDS], '叶子节点（无 children）不显示展开图标', async () => {
    render(<DepartmentTree />)
    await waitFor(() => expect(screen.getByText('销售部')).toBeInTheDocument())
    const sales = await waitFor(() => screen.getByText('销售部'))
    expect(sales.closest('[data-org-node]')?.querySelector('[data-expand-icon]')).toBeNull()
  })

  fnTest([...FIDS], '支持 onSelect 回调', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<DepartmentTree onSelect={onSelect} />)
    await waitFor(() => expect(screen.getByText('技术部')).toBeInTheDocument())
    await user.click(screen.getByText('技术部'))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'org-tech', name: '技术部' }))
  })

  // —— ch43：组织架构维护（只增不改）——
  fnTest([...FIDS], '新增根部门按钮存在', async () => {
    render(<DepartmentTree />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: '新增根部门' })).toBeInTheDocument()
  })

  fnTest([...FIDS], 'hover 节点显示操作按钮', async () => {
    const user = userEvent.setup()
    render(<DepartmentTree />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())
    const rootRow = screen.getByText('ACME 集团').closest('[data-org-node]') as HTMLElement
    await user.hover(within(rootRow).getByText('ACME 集团'))
    // 根节点行内渲染了"添加子部门"按钮（在 DOM 中存在，非 visibility）
    expect(within(rootRow).getAllByText('+子部门').length).toBeGreaterThan(0)
  })

  fnTest([...FIDS], '新增子部门流程', async () => {
    const user = userEvent.setup()
    render(<DepartmentTree />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())

    const rootRow = screen.getByText('ACME 集团').closest('[data-org-node]') as HTMLElement
    await user.hover(within(rootRow).getByText('ACME 集团'))
    await user.click(within(rootRow).getAllByText('+子部门')[0])

    await waitFor(() => expect(screen.getByText('新增子部门')).toBeInTheDocument())
    await user.type(screen.getByRole('textbox'), '新部门XYZ')
    await user.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(screen.getByText('新部门XYZ')).toBeInTheDocument())
  })

  fnTest([...FIDS], '编辑节点流程', async () => {
    const user = userEvent.setup()
    render(<DepartmentTree />)
    await waitFor(() => expect(screen.getByText('技术部')).toBeInTheDocument())

    const techRow = screen.getByText('技术部').closest('[data-org-node]') as HTMLElement
    await user.hover(within(techRow).getByText('技术部'))
    await user.click(within(techRow).getByText('编辑'))

    await waitFor(() => expect(screen.getByText('编辑部门')).toBeInTheDocument())
    const nameInput = screen.getByRole('textbox') as HTMLInputElement
    await user.clear(nameInput)
    await user.type(nameInput, '技术研发部')
    await user.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(screen.getByText('技术研发部')).toBeInTheDocument())
  })

  fnTest([...FIDS], '删除节点流程', async () => {
    const user = userEvent.setup()
    render(<DepartmentTree />)
    await waitFor(() => expect(screen.getByText('销售部')).toBeInTheDocument())

    const salesNode = screen.getByText('销售部').closest('[data-org-node]') as HTMLElement
    await user.hover(within(salesNode).getByText('销售部'))
    await user.click(within(salesNode).getByText('删除'))

    await waitFor(() => expect(screen.getByText('删除确认')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '确认' }))

    await waitFor(() => expect(screen.queryByText('销售部')).not.toBeInTheDocument())
  })
})