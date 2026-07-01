import { useEffect, type ReactNode } from 'react'
import { useParams, Outlet } from 'react-router-dom'
import { TenantProvider } from './TenantContext'
import { useTenantStore } from './tenantStore'
import { applyTheme, clearTheme } from './theme'
import { Layout } from '../../app/layouts/Layout'

interface TenantLayoutProps {
  children?: ReactNode
}

/**
 * 租户布局：从 useParams 取 tenantId → 拉取租户配置 → 应用主题 → 包 TenantProvider → 渲染 Layout。
 * children 模式用于嵌套 TenantSwitcher 等测试场景；默认渲染 Outlet 作为布局路由父级。
 */
export function TenantLayout({ children }: TenantLayoutProps = {}) {
  const { tenantId } = useParams<{ tenantId: string }>()
  const { current, loading, error, fetchTenant } = useTenantStore()

  useEffect(() => {
    if (tenantId) {
      fetchTenant(tenantId)
    }
    return () => {
      // 离开租户时清除主题
      clearTheme()
    }
  }, [tenantId, fetchTenant])

  useEffect(() => {
    if (current) {
      applyTheme(current.theme)
    }
  }, [current])

  if (loading && !current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载租户配置...</p>
      </div>
    )
  }

  if (error && !current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">错误：{error}</p>
        </div>
      </div>
    )
  }

  if (!current) {
    return null
  }

  return (
    <TenantProvider tenant={current}>
      <Layout tenant={current}>{children ?? <Outlet />}</Layout>
    </TenantProvider>
  )
}
