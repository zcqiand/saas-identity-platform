import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { TenantLayout } from '../features/tenant/TenantLayout'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import SsoCallback from '../pages/SsoCallback'

// 路由配置数组（导出供测试用 createMemoryRouter 复用）。
// ch39：/:tenantId/* 嵌套子路由，根路径重定向到默认租户 acme。
// ch40 将在受保护路由外层包裹 PermissionGuard，并替换 Login/SsoCallback 为真实实现。
export const routes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  { path: '/sso-callback', element: <SsoCallback /> },
  { path: '/', element: <Navigate to="/acme/dashboard" replace /> },
  {
    path: '/:tenantId',
    element: <TenantLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'users', element: <div>用户管理（待 ch41 实现）</div> },
      { path: 'org', element: <div>组织管理（待 ch41 实现）</div> },
      { path: 'audit', element: <div>审计日志（待 ch41 实现）</div> },
    ],
  },
  { path: '*', element: <Navigate to="/acme/dashboard" replace /> },
]

export const router = createBrowserRouter(routes)
