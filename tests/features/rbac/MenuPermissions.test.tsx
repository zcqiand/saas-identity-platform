import { describe, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MenuPermissions } from '../../../src/features/rbac/MenuPermissions'
import { useRoleStore } from '../../../src/features/rbac/roleStore'
import { useAppStore } from '../../../src/features/apps/appStore'
import { resetApiClient, setToken } from '../../../src/api/client'
import { fnTest } from '../../fn'

const FIDS = ["M03.F01.I07"] as const

beforeEach(() => {
  localStorage.clear()
  useRoleStore.setState({ list: [], loading: false, error: null })
  useAppStore.setState({
    apps: [],
    currentApp: null,
    currentAppMenus: [],
    loading: false,
    error: null,
  })
  resetApiClient()
  setToken('mock-token')
})

describe('MenuPermissions', () => {
  fnTest([...FIDS], 'mount 后渲染菜单权限页', async () => {
    render(<MenuPermissions />)
    await waitFor(() => expect(screen.getByText('菜单权限')).toBeInTheDocument())
  })

  fnTest([...FIDS], '渲染应用和角色下拉框', async () => {
    render(<MenuPermissions />)
    await waitFor(() => expect(screen.getByText('选择应用')).toBeInTheDocument())
    expect(screen.getByText('选择应用')).toBeInTheDocument()
    expect(screen.getByText('选择角色')).toBeInTheDocument()
  })
})
