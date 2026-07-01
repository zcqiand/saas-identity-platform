// ch40 RBAC 类型定义

/** 权限码：资源:操作 */
export interface Permission {
  resource: string
  action: string
  /** 可选：限定组织/范围 */
  scope?: string
}

/** 角色 */
export interface Role {
  id: string
  name: string
  permissions: string[]
}

/** 权限 store 状态 */
export interface PermissionState {
  roles: Role[]
  /** 当前用户权限码列表（如 ['user:read', 'user:create']） */
  permissions: string[]
  loading: boolean
  error: string | null
}
