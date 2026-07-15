import { describe, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PermissionGuard } from '../../../src/features/rbac/PermissionGuard'
import { usePermissionStore } from '../../../src/features/rbac/permissionStore'
import { fnTest } from '../../fn'

const FIDS = ["M03.F01.I09"] as const

beforeEach(() => {
  usePermissionStore.setState({ roles: [], permissions: [], loading: false, error: null })
})

describe('PermissionGuard', () => {
  fnTest([...FIDS], '有权限时渲染 children', () => {
    usePermissionStore.setState({ permissions: ['user:create'] })
    render(
      <PermissionGuard permission="user:create">
        <button>新增用户</button>
      </PermissionGuard>,
    )
    expect(screen.getByText('新增用户')).toBeInTheDocument()
  })

  fnTest([...FIDS], '无权限时不渲染 children', () => {
    usePermissionStore.setState({ permissions: [] })
    render(
      <PermissionGuard permission="user:create">
        <button>新增用户</button>
      </PermissionGuard>,
    )
    expect(screen.queryByText('新增用户')).not.toBeInTheDocument()
  })

  fnTest([...FIDS], '无权限时渲染 fallback', () => {
    usePermissionStore.setState({ permissions: [] })
    render(
      <PermissionGuard permission="user:delete" fallback={<span>无权操作</span>}>
        <button>删除用户</button>
      </PermissionGuard>,
    )
    expect(screen.queryByText('删除用户')).not.toBeInTheDocument()
    expect(screen.getByText('无权操作')).toBeInTheDocument()
  })

  fnTest([...FIDS], '无权限且无 fallback 时渲染为空', () => {
    usePermissionStore.setState({ permissions: ['other:perm'] })
    const { container } = render(
      <PermissionGuard permission="user:delete">
        <button>删除用户</button>
      </PermissionGuard>,
    )
    expect(container.innerHTML).toBe('')
  })

  fnTest([...FIDS], '权限列表中任一匹配即渲染（anyOf 模式）', () => {
    usePermissionStore.setState({ permissions: ['user:read'] })
    render(
      <PermissionGuard permission={['user:read', 'user:create']}>
        <div>可见内容</div>
      </PermissionGuard>,
    )
    expect(screen.getByText('可见内容')).toBeInTheDocument()
  })
})
