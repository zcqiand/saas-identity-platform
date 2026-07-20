import { describe, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrgTree } from '../../../src/features/orgs/OrgTree'
import { useOrgStore } from '../../../src/features/orgs/orgStore'
import { resetApiClient, setToken } from '../../../src/api/client'
import { fnTest } from '../../fn'

const FIDS = ["M02.F01.I01","M02.F01.I02","M02.F01.I03","M02.F01.I04","M02.F01.I05","M02.F01.I06"] as const

beforeEach(() => {
  localStorage.clear()
  useOrgStore.setState({ tree: null, loading: false, error: null })
  resetApiClient()
  setToken('mock-token')
})

describe('OrgTree', () => {
  fnTest([...FIDS], '拉取并渲染根节点', async () => {
    render(<OrgTree />)
    expect(await screen.findByText('ACME 集团')).toBeInTheDocument()
  })

  fnTest([...FIDS], '默认展开根节点，显示一级子节点', async () => {
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())
    // 一级子节点应可见
    expect(screen.getByText('ACME 总部')).toBeInTheDocument()
    expect(screen.getByText('Globex 分部')).toBeInTheDocument()
  })

  fnTest([...FIDS], '点击节点切换展开/折叠', async () => {
    const user = userEvent.setup()
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('ACME 总部')).toBeInTheDocument())
    // ACME 总部 默认展开，显示"技术部"。
    // 用 waitFor 而不是同步 getByText：
    //   tree populated 之后 OrgTree 会在 useEffect 里展开一级子节点，触发额外渲染，
    //   同步断言可能在二级子节点挂载前就执行，产生 race。
    await waitFor(() => expect(screen.getByText('技术部')).toBeInTheDocument())
    // 点击 ACME 总部 折叠
    await user.click(screen.getByText('ACME 总部'))
    await waitFor(() => expect(screen.queryByText('技术部')).not.toBeInTheDocument())
    // 再点击展开
    await user.click(screen.getByText('ACME 总部'))
    await waitFor(() => expect(screen.getByText('技术部')).toBeInTheDocument())
  })

  fnTest([...FIDS], '递归渲染深层节点', async () => {
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('技术部')).toBeInTheDocument())
    // 技术部的子节点"前端组"——需先展开技术部
    const user = userEvent.setup()
    await user.click(screen.getByText('技术部'))
    await waitFor(() => expect(screen.getByText('前端组')).toBeInTheDocument())
  })

  fnTest([...FIDS], '叶子节点（无 children）不显示展开图标', async () => {
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('ACME 总部')).toBeInTheDocument())
    // 销售部是 org-acme 的叶子子节点（默认展开，可见）
    const sales = screen.getByText('销售部')
    expect(sales.closest('[data-org-node]')?.querySelector('[data-expand-icon]')).toBeNull()
  })

  fnTest([...FIDS], '支持 onSelect 回调', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<OrgTree onSelect={onSelect} />)
    await waitFor(() => expect(screen.getByText('技术部')).toBeInTheDocument())
    await user.click(screen.getByText('技术部'))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'org-tech', name: '技术部' }))
  })

  // —— ch43：组织架构维护（只增不改）——
  fnTest([...FIDS], '新增根部门按钮存在', async () => {
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: '新增根部门' })).toBeInTheDocument()
  })

  fnTest([...FIDS], 'hover 节点显示操作按钮', async () => {
    const user = userEvent.setup()
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())
    const rootRow = screen.getByText('ACME 集团').closest('[data-org-node]') as HTMLElement
    await user.hover(within(rootRow).getByText('ACME 集团'))
    // 根节点行内渲染了"添加子部门"按钮（在 DOM 中存在，非 visibility）
    expect(within(rootRow).getAllByText('+子部门').length).toBeGreaterThan(0)
  })

  fnTest([...FIDS], '新增子部门流程', async () => {
    const user = userEvent.setup()
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())

    const rootRow = screen.getByText('ACME 集团').closest('[data-org-node]') as HTMLElement
    await user.hover(within(rootRow).getByText('ACME 集团'))
    await user.click(within(rootRow).getAllByText('+子部门')[0])

    expect(screen.getByText('新增子部门')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox'), '新部门XYZ')
    await user.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(screen.getByText('新部门XYZ')).toBeInTheDocument())
  })

  fnTest([...FIDS], '编辑节点流程', async () => {
    const user = userEvent.setup()
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('技术部')).toBeInTheDocument())

    const techRow = screen.getByText('技术部').closest('[data-org-node]') as HTMLElement
    await user.hover(within(techRow).getByText('技术部'))
    await user.click(within(techRow).getByText('编辑'))

    expect(screen.getByText('编辑部门')).toBeInTheDocument()
    const nameInput = screen.getByRole('textbox') as HTMLInputElement
    await user.clear(nameInput)
    await user.type(nameInput, '技术研发部')
    await user.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(screen.getByText('技术研发部')).toBeInTheDocument())
  })

  fnTest([...FIDS], '删除节点流程', async () => {
    const user = userEvent.setup()
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('销售部')).toBeInTheDocument())

    const salesRow = screen.getByText('销售部').closest('[data-org-node]') as HTMLElement
    await user.hover(within(salesRow).getByText('销售部'))
    await user.click(within(salesRow).getByText('删除'))

    expect(screen.getByText('删除确认')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '确认' }))

    await waitFor(() => expect(screen.queryByText('销售部')).not.toBeInTheDocument())
  })
})
