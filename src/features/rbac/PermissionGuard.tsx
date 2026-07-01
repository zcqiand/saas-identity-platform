import { type ReactNode } from 'react'
import { usePermissionStore } from './permissionStore'

interface PermissionGuardProps {
  /** 权限码或权限码数组（数组为 anyOf 模式，任一匹配即放行） */
  permission: string | string[]
  /** 有权限时渲染 */
  children: ReactNode
  /** 无权限时渲染的降级内容，默认 null */
  fallback?: ReactNode
}

/**
 * 权限守卫组件：根据当前用户权限条件渲染。
 *
 * 用法：
 *   <PermissionGuard permission="user:create">
 *     <Button>新增用户</Button>
 *   </PermissionGuard>
 *
 *   <PermissionGuard permission={['user:read', 'user:create']}>
 *     <Button>用户操作</Button>
 *   </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const permissions = usePermissionStore((s) => s.permissions)
  const has = Array.isArray(permission)
    ? permission.some((p) => permissions.includes(p))
    : permissions.includes(permission)
  return <>{has ? children : fallback}</>
}
