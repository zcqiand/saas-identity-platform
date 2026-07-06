import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { UserGroupList } from '../../../src/features/userGroups/UserGroupList'
import { useUserGroupStore } from '../../../src/features/userGroups/userGroupStore'
import { resetApiClient, setToken } from '../../../src/api/client'
import { server } from '../../../msw/server'

beforeEach(() => {
  localStorage.clear()
  useUserGroupStore.setState({ list: [], loading: false, error: null })
  resetApiClient()
  setToken('mock-token')
})

describe('UserGroupList', () => {
  it('mount 后拉取并渲染用户组列表', async () => {
    render(<UserGroupList />)
    await waitFor(() => expect(screen.getByText('华东区销售团队')).toBeInTheDocument())
    expect(screen.getByText('研发一组')).toBeInTheDocument()
    expect(screen.getByText('新员工培训组')).toBeInTheDocument()
  })

  it('渲染用户组描述', async () => {
    render(<UserGroupList />)
    await waitFor(() => expect(screen.getByText('华东区销售团队')).toBeInTheDocument())
    expect(screen.getByText('负责华东区域销售')).toBeInTheDocument()
  })

  it('渲染成员数', async () => {
    render(<UserGroupList />)
    await waitFor(() => expect(screen.getByText('华东区销售团队')).toBeInTheDocument())
    const row = screen.getByText('华东区销售团队').closest('tr')!
    expect(within(row).getByText('12')).toBeInTheDocument()
  })

  it('渲染启用/禁用状态', async () => {
    render(<UserGroupList />)
    await waitFor(() => expect(screen.getByText('华东区销售团队')).toBeInTheDocument())
    expect(within(screen.getByText('华东区销售团队').closest('tr')!).getByText('启用')).toBeInTheDocument()
    expect(within(screen.getByText('新员工培训组').closest('tr')!).getByText('禁用')).toBeInTheDocument()
  })

  it('点击新建用户组打开表单', async () => {
    const user = userEvent.setup()
    render(<UserGroupList />)
    await waitFor(() => expect(screen.getByText('华东区销售团队')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '新建用户组' }))
    expect(screen.getByText('新建用户组', { selector: 'h3' })).toBeInTheDocument()
  })

  it('列表为空时渲染"暂无数据"', async () => {
    server.use(http.get('*/user-groups', () => HttpResponse.json([])))
    render(<UserGroupList />)
    await waitFor(() => expect(screen.getByText('暂无数据')).toBeInTheDocument())
  })

  it('网络错误时渲染错误提示', async () => {
    server.use(http.get('*/user-groups', () => HttpResponse.json({ message: '网络错误' }, { status: 500 })))
    render(<UserGroupList />)
    await waitFor(() => expect(screen.getByText(/网络错误/i)).toBeInTheDocument())
  })
})
