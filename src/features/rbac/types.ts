// ch40 RBAC 类型定义

/** 权限码：资源:操作 */
export interface Permission {
  resource: string;
  action: string;
  /** 可选：限定组织/范围 */
  scope?: string;
}

/** 菜单权限项 */
export interface MenuPermission {
  menuId: string;
  actions: ("view" | "create" | "update" | "delete")[];
}

/** 角色 */
export interface Role {
  id: string;
  name: string;
  permissions: string[];
  /** 菜单权限列表 */
  menuPermissions: MenuPermission[];
}

/** 权限 store 状态 */
export interface PermissionState {
  roles: Role[];
  /** 当前用户权限码列表（如 ['user:read', 'user:create']） */
  permissions: string[];
  loading: boolean;
  error: string | null;
}

/** 角色创建输入 */
export interface RoleCreateInput {
  name: string;
  permissions: string[];
  menuPermissions?: MenuPermission[];
}

/** 角色 store 状态（ch43 新增） */
export interface RoleState {
  list: Role[];
  loading: boolean;
  error: string | null;
}

/** 角色 store actions */
export interface RoleActions {
  fetchRoles: () => Promise<void>;
  createRole: (input: RoleCreateInput) => Promise<void>;
  updateRole: (id: string, input: Partial<RoleCreateInput>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  clearError: () => void;
}

export type RoleStore = RoleState & RoleActions;

/** 所有可选权限码（ch43） */
export const ALL_PERMISSIONS = [
  "user:read",
  "user:create",
  "user:update",
  "user:delete",
  "org:read",
  "org:write",
  "audit:read",
] as const;
