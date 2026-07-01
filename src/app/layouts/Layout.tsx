import { type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { TenantConfig } from '../../types/tenant'

interface NavItem {
  to: string
  label: string
  end?: boolean
}

const navItems: NavItem[] = [
  { to: 'dashboard', label: '仪表盘', end: true },
  { to: 'users', label: '用户管理' },
  { to: 'org', label: '组织管理' },
  { to: 'audit', label: '审计日志' },
]

interface LayoutProps {
  tenant: TenantConfig
  children?: ReactNode
}

export function Layout({ tenant, children }: LayoutProps) {
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
        <nav className="flex-1 p-2 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm transition-colors ${
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
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
    </div>
  )
}
