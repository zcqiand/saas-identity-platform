import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PositionList } from '../../../src/features/positions/PositionList'
import { usePositionStore } from '../../../src/features/positions/positionStore'
import { resetApiClient, setToken } from '../../../src/api/client'
import { server } from '../../../msw/server'

beforeEach(() => {
  localStorage.clear()
  usePositionStore.setState({ list: [], loading: false, error: null })
  resetApiClient()
  setToken('mock-token')
})

describe('PositionList', () => {
  it('mount 后拉取并渲染岗位列表', async () => {
    render(<PositionList />)
    await waitFor(() => expect(screen.getByText('技术总监')).toBeInTheDocument())
    expect(screen.getByText('研发工程师')).toBeInTheDocument()
    expect(screen.getByText('数据分析师')).toBeInTheDocument()
  })

  it('渲染岗位编码', async () => {
    render(<PositionList />)
    await waitFor(() => expect(screen.getByText('技术总监')).toBeInTheDocument())
    const row = screen.getByText('技术总监').closest('tr')!
    expect(within(row).getByText('CTO')).toBeInTheDocument()
  })

  it('渲染岗位描述', async () => {
    render(<PositionList />)
    await waitFor(() => expect(screen.getByText('技术总监')).toBeInTheDocument())
    expect(screen.getByText('技术最高负责人')).toBeInTheDocument()
  })

  it('渲染排序号', async () => {
    render(<PositionList />)
    await waitFor(() => expect(screen.getByText('技术总监')).toBeInTheDocument())
    const row = screen.getByText('技术总监').closest('tr')!
    expect(within(row).getByText('1')).toBeInTheDocument()
  })

  it('渲染启用/禁用状态', async () => {
    render(<PositionList />)
    await waitFor(() => expect(screen.getByText('技术总监')).toBeInTheDocument())
    expect(within(screen.getByText('技术总监').closest('tr')!).getByText('启用')).toBeInTheDocument()
    expect(within(screen.getByText('数据分析师').closest('tr')!).getByText('禁用')).toBeInTheDocument()
  })

  it('渲染编辑和删除按钮', async () => {
    render(<PositionList />)
    await waitFor(() => expect(screen.getByText('技术总监')).toBeInTheDocument())
    const row = screen.getByText('技术总监').closest('tr')!
    expect(within(row).getByRole('button', { name: '编辑' })).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: '删除' })).toBeInTheDocument()
  })

  it('点击新建岗位打开表单', async () => {
    const user = userEvent.setup()
    render(<PositionList />)
    await waitFor(() => expect(screen.getByText('技术总监')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '新建岗位' }))
    const heading = await screen.findByText('新建岗位', { selector: 'h3' })
    expect(heading).toBeInTheDocument()
  })

  it('列表为空时渲染"暂无数据"', async () => {
    server.use(http.get('*/positions', () => HttpResponse.json([])))
    render(<PositionList />)
    await waitFor(() => expect(screen.getByText('暂无数据')).toBeInTheDocument())
  })

  it('网络错误时渲染错误提示', async () => {
    server.use(http.get('*/positions', () => HttpResponse.json({ message: '网络错误' }, { status: 500 })))
    render(<PositionList />)
    await waitFor(() => expect(screen.getByText(/网络错误/i)).toBeInTheDocument())
  })
})
