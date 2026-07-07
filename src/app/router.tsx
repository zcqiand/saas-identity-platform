import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { TenantLayout } from '../features/tenant/TenantLayout'
import { PlatformLayout } from './layouts/PlatformLayout'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import SsoCallback from '../pages/SsoCallback'
import Users from '../pages/Users'
import Orgs from '../pages/Orgs'
import Audit from '../pages/Audit'
import Roles from '../pages/Roles'
import PlatformTenants from '../pages/PlatformTenants'
import PlatformConfig from '../pages/PlatformConfig'
import TenantDetail from '../pages/TenantDetail'
import { AppList } from '../features/apps/AppList'
import { MenuList } from '../features/apps/MenuList'
import { MenuPermissions } from '../features/rbac/MenuPermissions'
import { PositionList } from '../features/positions/PositionList'
import { UserGroupList } from '../features/userGroups/UserGroupList'
import { PermissionGroupList } from '../features/permissionGroups/PermissionGroupList'
import LoginMethods from '../pages/LoginMethods'
import TokenConfig from '../pages/TokenConfig'
import ApiKeyList from '../features/apiKeys/ApiKeyList'
import LoginSecurity from '../pages/LoginSecurity'
import PasswordPolicy from '../pages/PasswordPolicy'
import RiskControl from '../pages/RiskControl'
import NotificationConfig from '../pages/NotificationConfig'
import OpenPlatform from '../pages/OpenPlatform'

export const routes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  { path: '/sso-callback', element: <SsoCallback /> },
  { path: '/', element: <Navigate to="/acme/dashboard" replace /> },
  // —— 租户布局：包含认证授权、安全控制（租户级）——
  {
    path: '/:tenantId',
    element: <TenantLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'users', element: <Users /> },
      { path: 'org', element: <Orgs /> },
      { path: 'roles', element: <Roles /> },
      { path: 'menu-permissions', element: <MenuPermissions /> },
      { path: 'positions', element: <PositionList /> },
      { path: 'user-groups', element: <UserGroupList /> },
      { path: 'permission-groups', element: <PermissionGroupList /> },
      { path: 'audit', element: <Audit /> },
      // 认证授权
      { path: 'login-methods', element: <LoginMethods /> },
      { path: 'token-config', element: <TokenConfig /> },
      { path: 'api-keys', element: <ApiKeyList /> },
      // 安全控制
      { path: 'login-security', element: <LoginSecurity /> },
      { path: 'password-policy', element: <PasswordPolicy /> },
      { path: 'risk-control', element: <RiskControl /> },
      // 平台运营
      { path: 'notification-config', element: <NotificationConfig /> },
    ],
  },
  // —— 平台布局（平台级全局配置）——
  { path: '/platform/config', element: <PlatformLayout><PlatformConfig /></PlatformLayout> },
  { path: '/platform/tenants', element: <PlatformLayout><PlatformTenants /></PlatformLayout> },
  { path: '/platform/tenants/:tenantId', element: <PlatformLayout><TenantDetail /></PlatformLayout> },
  { path: '/platform/apps', element: <PlatformLayout><AppList /></PlatformLayout> },
  { path: '/platform/apps/:appId/menus', element: <PlatformLayout><MenuList /></PlatformLayout> },
  { path: '/platform/open-platform', element: <PlatformLayout><OpenPlatform /></PlatformLayout> },
  { path: '/platform', element: <PlatformLayout><PlatformConfig /></PlatformLayout> },
  { path: '*', element: <Navigate to="/acme/dashboard" replace /> },
]

export const router = createBrowserRouter(routes)
