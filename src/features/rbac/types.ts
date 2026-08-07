// ch40 RBAC 类型定义 — Phase 5b：loose types 兼容 shared strict types
// （shared Menu.parentId 是 nullable optional；shared Role.actions /
//  PermissionGroup.permissions 都是 enum union；本仓消费侧用 string[]）。
import type { Menu, Role as SharedRole, PermissionGroup as SharedPermissionGroup } from "@saas/identity-platform-shared/schemas";

/** 权限码：资源:操作 */
export interface Permission {
  resource: string;
  action: string;
  /** 可选：限定组织/范围 */
  scope?: string;
}

/** 菜单权限项（loose：actions 接受任意字符串，便于 mock 阶段自由组合） */
export interface MenuPermission {
  menuId: string;
  actions: string[];
}

/** 角色（loose：permissions/menuPermissions 接受任意字符串，便于 mock 阶段自由组合） */
export interface Role {
  id: string;
  name: string;
  permissions: string[];
  menuPermissions: MenuPermission[];
  [key: string]: unknown;
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

/** 内部 alias（避免 unused） */
export type _SharedMenu = Menu;
export type _SharedRole = SharedRole;
export type _SharedPermissionGroup = SharedPermissionGroup;