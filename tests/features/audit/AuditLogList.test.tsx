import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuditLogList } from '../../../src/features/audit/AuditLogList'
import { useAuditStore } from '../../../src/features/audit/auditStore'
import { resetApiClient, setToken } from '../../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  useAuditStore.setState({ list: [], total: 0, loading: false, error: null })
  resetApiClient()
  setToken('mock-token')
})

describe('AuditLogList', () => {
  it('mount 后拉取并渲染日志列表', async () => {
    render(<AuditLogList />)
    await waitFor(() => expect(screen.getByText(/审计日志/)).toBeInTheDocument())
    // mock 数据有 5 条，应渲染至少 1 条
    await waitFor(() => {
      expect(useAuditStore.getState().list.length).toBeGreaterThan(0)
    })
  })

  it('显示分页信息与总数', async () => {
    render(<AuditLogList />)
    await waitFor(() => expect(screen.getByText(/共\s*\d+\s*条/)).toBeInTheDocument())
  })

  it('action 筛选后列表刷新', async () => {
    const user = userEvent.setup()
    render(<AuditLogList />)
    await waitFor(() => expect(screen.getByText(/共\s*\d+\s*条/)).toBeInTheDocument())
    const beforeTotal = useAuditStore.getState().total
    await user.selectOptions(screen.getByLabelText(/操作类型/), 'login')
    await waitFor(() => {
      const after = useAuditStore.getState()
      expect(after.list.every((l) => l.action === 'login')).toBe(true)
    })
    expect(useAuditStore.getState().total).toBeLessThanOrEqual(beforeTotal)
  })

  it('operator 筛选', async () => {
    const user = userEvent.setup()
    render(<AuditLogList />)
    await waitFor(() => expect(screen.getByText(/共\s*\d+\s*条/)).toBeInTheDocument())
    await user.type(screen.getByPlaceholderText(/操作人/), 'admin')
    await user.click(screen.getByRole('button', { name: '筛选' }))
    await waitFor(() => {
      expect(
        useAuditStore.getState().list.every((l) => l.operator.includes('admin')),
      ).toBe(true)
    })
  })

  it('ip 筛选', async () => {
    const user = userEvent.setup()
    render(<AuditLogList />)
    await waitFor(() => expect(screen.getByText(/共\s*\d+\s*条/)).toBeInTheDocument())
    await user.type(screen.getByPlaceholderText(/IP/), '192.168')
    await user.click(screen.getByRole('button', { name: '筛选' }))
    await waitFor(() => {
      expect(
        useAuditStore.getState().list.every((l) => l.ip.includes('192.168')),
      ).toBe(true)
    })
  })

  it('使用虚拟滚动（大数据量时仅渲染可视行）', async () => {
    render(<AuditLogList />)
    await waitFor(() => expect(useAuditStore.getState().list.length).toBeGreaterThan(0))
    // 虚拟滚动容器存在
    const virtualContainer = document.querySelector('[data-virtual-item="true"]')
    expect(virtualContainer).not.toBeNull()
  })
})
