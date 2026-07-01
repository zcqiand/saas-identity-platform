import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { TenantLayout } from '../features/tenant/TenantLayout'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import SsoCallback from '../pages/SsoCallback'
import Users from '../pages/Users'
import Orgs from '../pages/Orgs'
import Audit from '../pages/Audit'

// 路由配置数组（导出供测试用 createMemoryRouter 复用）。
// ch39：/:tenantId/* 嵌套子路由，根路径重定向到默认租户 acme。
// ch40：Login/SsoCallback 接入真实 SSO 实现。
// ch41：users/orgs/audit 子路由接入真实组件（填充 ch39 占位）。
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
      { path: 'users', element: <Users /> },
      { path: 'org', element: <Orgs /> },
      { path: 'audit', element: <Audit /> },
    ],
  },
  { path: '*', element: <Navigate to="/acme/dashboard" replace /> },
]

export const router = createBrowserRouter(routes)
