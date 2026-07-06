import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuditLogList } from '../../../src/features/audit/AuditLogList'
import { useAuditStore } from '../../../src/features/audit/auditStore'
import { resetApiClient } from '../../../src/api/client'

beforeEach(() => {
  localStorage.clear()
  useAuditStore.setState({ list: [], total: 0, loading: false, error: null })
  resetApiClient()
})

describe('AuditLogList', () => {
  it('mount 后渲染日志列表', async () => {
    render(<AuditLogList />)
    await waitFor(() => expect(screen.getByText('审计日志')).toBeInTheDocument())
    await waitFor(() => expect(useAuditStore.getState().list.length).toBeGreaterThan(0))
  })

  it('Tab 切换到登录日志', async () => {
    const user = userEvent.setup()
    render(<AuditLogList />)
    await waitFor(() => expect(screen.getByText('全部日志').closest('button')).toBeDefined())
    await user.click(screen.getByRole('button', { name: '登录日志' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '登录日志' })).toBeInTheDocument())
  })

  it('操作人筛选', async () => {
    const user = userEvent.setup()
    render(<AuditLogList />)
    await waitFor(() => expect(screen.getByText(/^共/)).toBeInTheDocument())
    await user.type(screen.getByPlaceholderText(/操作人/), 'admin')
    await user.click(screen.getByRole('button', { name: '筛选' }))
    await waitFor(() => {
      expect(screen.getByText(/^共/)).toBeInTheDocument()
    })
  })

  it('IP 筛选', async () => {
    const user = userEvent.setup()
    render(<AuditLogList />)
    await waitFor(() => expect(screen.getByPlaceholderText(/IP 地址/)).toBeInTheDocument())
    await user.type(screen.getByPlaceholderText(/IP/), '192.168')
    await user.click(screen.getByRole('button', { name: '筛选' }))
    await waitFor(() => expect(screen.getByPlaceholderText(/IP 地址/)).toBeInTheDocument())
  })

  it('重置按钮存在', async () => {
    render(<AuditLogList />)
    await waitFor(() => expect(screen.getByRole('button', { name: '重置' })).toBeInTheDocument())
  })

  it('导出 CSV 按钮存在', async () => {
    render(<AuditLogList />)
    await waitFor(() => expect(screen.getByRole('button', { name: '导出 CSV' })).toBeInTheDocument())
  })
})
