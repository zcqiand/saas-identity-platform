import { type ReactNode } from 'react'
import { NavLink } from 'react-router'
import type { TenantConfig } from '../../types/tenant'

interface NavItem {
  to: string
  label: string
  end?: boolean
  group?: string
}

const navItems: NavItem[] = [
  // 基础
  { to: 'dashboard', label: '仪表盘', end: true, group: '基础' },
  // 身份管理
  { to: 'org', label: '组织管理', group: '身份管理' },
  { to: 'positions', label: '岗位管理', group: '身份管理' },
  { to: 'roles', label: '角色管理', group: '身份管理' },
  { to: 'permission-groups', label: '权限组别', group: '身份管理' },
  { to: 'menu-permissions', label: '菜单权限', group: '身份管理' },
  { to: 'user-groups', label: '用户组别', group: '身份管理' },
  { to: 'users', label: '用户管理', group: '身份管理' },
  // 认证授权
  { to: 'login-methods', label: '登录认证', group: '认证授权' },
  { to: 'token-config', label: 'Token 管理', group: '认证授权' },
  { to: 'api-keys', label: 'API Key', group: '认证授权' },
  // 安全控制
  { to: 'login-security', label: '登录安全', group: '安全控制' },
  { to: 'password-policy', label: '密码策略', group: '安全控制' },
  { to: 'risk-control', label: '风险控制', group: '安全控制' },
  // 平台运营
  { to: 'audit', label: '审计日志', group: '平台运营' },
  { to: 'notification-config', label: '消息通知', group: '平台运营' },
]

interface LayoutProps {
  tenant: TenantConfig
  children?: ReactNode
}

export function Layout({ tenant, children }: LayoutProps) {
  // Group items
  const groups: Record<string, NavItem[]> = {}
  for (const item of navItems) {
    const g = item.group ?? ''
    if (!groups[g]) groups[g] = []
    groups[g].push(item)
  }

  const orderedGroups = ['首页', '身份管理', '认证授权', '安全控制', '平台运营']

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--tenant-sidebar, #1e293b)' }}>
      <aside
        className="w-56 text-white flex flex-col"
        style={{ background: 'var(--tenant-sidebar, #1e293b)' }}
      >
        <div className="p-4 border-b border-white/10">
          <h1 className="text-base font-bold">{tenant.theme.logoText}</h1>
          <p className="text-xs text-white/60">{tenant.name}</p>
        </div>
        <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
          {orderedGroups.map((groupName) => {
            const items = groups[groupName] ?? []
            if (items.length === 0) return null
            return (
              <div key={groupName} className="mb-1">
                <div className="px-3 py-1 text-xs text-white/30 uppercase tracking-wider">{groupName}</div>
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `block px-3 py-1.5 rounded text-sm transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`
                    }
                    style={({ isActive }) =>
                      isActive ? { background: 'var(--tenant-primary, #2563eb)' } : undefined
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
    </div>
  )
}
