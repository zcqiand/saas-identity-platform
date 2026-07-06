import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { ApiKeyList } from '../../../src/features/apiKeys/ApiKeyList'
import { useApiKeyStore } from '../../../src/features/apiKeys/apiKeyStore'
import { resetApiClient, setToken } from '../../../src/api/client'
import { server } from '../../../msw/server'

beforeEach(() => {
  localStorage.clear()
  useApiKeyStore.setState({ list: [], loading: false, error: null })
  resetApiClient()
  setToken('mock-token')
})

describe('ApiKeyList', () => {
  it('renders API key list on mount', async () => {
    render(<ApiKeyList />)
    await waitFor(() => expect(screen.getByText('内部服务 Key')).toBeInTheDocument())
    expect(screen.getByText('合作伙伴 Key')).toBeInTheDocument()
    expect(screen.getByText('测试 Key')).toBeInTheDocument()
  })

  it('renders key prefix', async () => {
    render(<ApiKeyList />)
    await waitFor(() => expect(screen.getByText('内部服务 Key')).toBeInTheDocument())
    expect(screen.getByText(/sk_live_a1b2/)).toBeInTheDocument()
  })

  it('renders enabled/disabled status', async () => {
    render(<ApiKeyList />)
    await waitFor(() => expect(screen.getByText('内部服务 Key')).toBeInTheDocument())
    expect(within(screen.getByText('内部服务 Key').closest('tr')!).getByText('启用')).toBeInTheDocument()
    expect(within(screen.getByText('测试 Key').closest('tr')!).getByText('禁用')).toBeInTheDocument()
  })

  it('renders scope tags', async () => {
    render(<ApiKeyList />)
    await waitFor(() => expect(screen.getByText('内部服务 Key')).toBeInTheDocument())
    const row = screen.getByText('内部服务 Key').closest('tr')!
    expect(within(row).getByText('read')).toBeInTheDocument()
    expect(within(row).getByText('write')).toBeInTheDocument()
  })

  it('renders action buttons', async () => {
    render(<ApiKeyList />)
    await waitFor(() => expect(screen.getByText('内部服务 Key')).toBeInTheDocument())
    const row = screen.getByText('内部服务 Key').closest('tr')!
    expect(within(row).getByRole('button', { name: '禁用' })).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: '删除' })).toBeInTheDocument()
  })

  it('toggles key enabled/disabled', async () => {
    const user = userEvent.setup()
    render(<ApiKeyList />)
    await waitFor(() => expect(screen.getByText('内部服务 Key')).toBeInTheDocument())
    const row = screen.getByText('内部服务 Key').closest('tr')!
    await user.click(within(row).getByRole('button', { name: '禁用' }))
    await waitFor(() => expect(within(screen.getByText('内部服务 Key').closest('tr')!).getByText('启用')).toBeInTheDocument())
  })

  it('opens delete confirmation dialog', async () => {
    const user = userEvent.setup()
    render(<ApiKeyList />)
    await waitFor(() => expect(screen.getByText('内部服务 Key')).toBeInTheDocument())
    const row = screen.getByText('内部服务 Key').closest('tr')!
    await user.click(within(row).getByRole('button', { name: '删除' }))
    expect(screen.getByText('删除确认')).toBeInTheDocument()
    expect(screen.getByText(/确定删除 API Key/)).toBeInTheDocument()
  })

  it('deletes key from list', async () => {
    const user = userEvent.setup()
    render(<ApiKeyList />)
    await waitFor(() => expect(screen.getByText('内部服务 Key')).toBeInTheDocument())
    const row = screen.getByText('内部服务 Key').closest('tr')!
    await user.click(within(row).getByRole('button', { name: '删除' }))
    await user.click(screen.getByRole('button', { name: '确认' }))
    await waitFor(() => expect(screen.queryByText('内部服务 Key')).not.toBeInTheDocument())
  })

  it('opens create API key modal', async () => {
    const user = userEvent.setup()
    render(<ApiKeyList />)
    await waitFor(() => expect(screen.getByText('内部服务 Key')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '新建 API Key' }))
    expect(screen.getByText('新建 API Key', { selector: 'h3' })).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    server.use(http.get('*/api-keys', () => HttpResponse.json([])))
    render(<ApiKeyList />)
    await waitFor(() => expect(screen.getByText('暂无数据')).toBeInTheDocument())
  })

  it('shows error alert on network failure', async () => {
    server.use(http.get('*/api-keys', () => HttpResponse.json({ message: 'network error' }, { status: 500 })))
    render(<ApiKeyList />)
    await waitFor(() => expect(screen.getByText(/操作失败|network error/i)).toBeInTheDocument())
  })
})
