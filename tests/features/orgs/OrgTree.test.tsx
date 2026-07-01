import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrgTree } from '../../../src/features/orgs/OrgTree'
import { resetApiClient, setToken } from '../../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  resetApiClient()
  setToken('mock-token')
})

describe('OrgTree', () => {
  it('拉取并渲染根节点', async () => {
    render(<OrgTree />)
    expect(await screen.findByText('ACME 集团')).toBeInTheDocument()
  })

  it('默认展开根节点，显示一级子节点', async () => {
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('ACME 集团')).toBeInTheDocument())
    // 一级子节点应可见
    expect(screen.getByText('ACME 总部')).toBeInTheDocument()
    expect(screen.getByText('Globex 分部')).toBeInTheDocument()
  })

  it('点击节点切换展开/折叠', async () => {
    const user = userEvent.setup()
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('ACME 总部')).toBeInTheDocument())
    // ACME 总部 默认展开，显示"技术部"
    expect(screen.getByText('技术部')).toBeInTheDocument()
    // 点击 ACME 总部 折叠
    await user.click(screen.getByText('ACME 总部'))
    await waitFor(() => expect(screen.queryByText('技术部')).not.toBeInTheDocument())
    // 再点击展开
    await user.click(screen.getByText('ACME 总部'))
    await waitFor(() => expect(screen.getByText('技术部')).toBeInTheDocument())
  })

  it('递归渲染深层节点', async () => {
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('技术部')).toBeInTheDocument())
    // 技术部的子节点"前端组"——需先展开技术部
    const user = userEvent.setup()
    await user.click(screen.getByText('技术部'))
    await waitFor(() => expect(screen.getByText('前端组')).toBeInTheDocument())
  })

  it('叶子节点（无 children）不显示展开图标', async () => {
    render(<OrgTree />)
    await waitFor(() => expect(screen.getByText('ACME 总部')).toBeInTheDocument())
    // 销售部是 org-acme 的叶子子节点（默认展开，可见）
    const sales = screen.getByText('销售部')
    expect(sales.closest('[data-org-node]')?.querySelector('[data-expand-icon]')).toBeNull()
  })

  it('支持 onSelect 回调', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<OrgTree onSelect={onSelect} />)
    await waitFor(() => expect(screen.getByText('技术部')).toBeInTheDocument())
    await user.click(screen.getByText('技术部'))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'org-tech', name: '技术部' }))
  })
})
