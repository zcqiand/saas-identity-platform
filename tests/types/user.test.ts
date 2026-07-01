import { describe, it, expect } from 'vitest'
import type {
  User,
  UserRole,
  UserStatus,
  OrgNode,
  AuditLog,
  AuditAction,
  UserQuery,
  AuditQuery,
} from '../../src/types/user'

describe('types/user', () => {
  it('UserUserRole/UserStatus 联合类型', () => {
    const roles: UserRole[] = ['admin', 'manager', 'member', 'viewer']
    const statuses: UserStatus[] = ['active', 'disabled', 'pending']
    expect(roles).toHaveLength(4)
    expect(statuses).toHaveLength(3)
  })

  it('User 类型可构造', () => {
    const user: User = {
      id: 'u-001',
      username: 'admin@acme',
      displayName: '管理员',
      email: 'admin@acme.com',
      orgId: 'org-acme',
      roles: ['admin'],
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(user.id).toBe('u-001')
    expect(user.roles).toContain('admin')
    expect(user.status).toBe('active')
  })

  it('OrgNode 树形结构可构造', () => {
    const org: OrgNode = {
      id: 'org-root',
      name: 'ACME 集团',
      children: [
        {
          id: 'org-tech',
          name: '技术部',
          children: [{ id: 'org-fe', name: '前端组' }],
        },
        { id: 'org-sales', name: '销售部' },
      ],
    }
    expect(org.children).toHaveLength(2)
    expect(org.children?.[0].children?.[0].name).toBe('前端组')
  })

  it('AuditAction 联合类型', () => {
    const actions: AuditAction[] = [
      'login',
      'logout',
      'create',
      'update',
      'delete',
      'permission_change',
    ]
    expect(actions).toHaveLength(6)
  })

  it('AuditLog 类型可构造', () => {
    const log: AuditLog = {
      id: 'log-001',
      action: 'login',
      operator: 'admin@acme',
      resource: 'auth',
      resourceId: 'u-001',
      ip: '192.168.1.1',
      detail: '用户登录',
      timestamp: '2026-01-01T00:00:00Z',
    }
    expect(log.action).toBe('login')
    expect(log.ip).toBe('192.168.1.1')
  })

  it('UserQuery 含搜索/角色/状态/分页', () => {
    const q: UserQuery = {
      page: 1,
      pageSize: 20,
      keyword: 'admin',
      role: 'admin',
      status: 'active',
    }
    expect(q.keyword).toBe('admin')
    expect(q.role).toBe('admin')
  })

  it('AuditQuery 含操作类型/操作人/IP/分页', () => {
    const q: AuditQuery = {
      page: 1,
      pageSize: 20,
      action: 'login',
      operator: 'admin',
      ip: '192.168',
    }
    expect(q.action).toBe('login')
    expect(q.ip).toBe('192.168')
  })
})
