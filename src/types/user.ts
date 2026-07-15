// ch41 用户/组织/审计类型定义

/** 用户角色 */
export type UserRole = "admin" | "manager" | "member" | "viewer";

/** 用户状态 */
export type UserStatus = "active" | "disabled" | "pending";

/** 用户 */
export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  orgId: string;
  roles: UserRole[];
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

/** 组织节点（树形） */
export interface OrgNode {
  id: string;
  name: string;
  /** 子组织 */
  children?: OrgNode[];
}

/** 审计操作类型 */
export type AuditAction =
  "login" | "logout" | "create" | "update" | "delete" | "permission_change";

/** 审计日志 */
export interface AuditLog {
  id: string;
  action: AuditAction;
  operator: string;
  resource: string;
  resourceId: string;
  ip: string;
  detail: string;
  timestamp: string;
}

/** 分页查询基础 */
interface PageQuery {
  page: number;
  pageSize: number;
}

/** 用户查询参数 */
export interface UserQuery extends PageQuery {
  keyword?: string;
  role?: UserRole;
  status?: UserStatus;
  orgId?: string;
}

/** 用户新建载荷 */
export interface UserCreateInput {
  username: string;
  displayName: string;
  email: string;
  orgId: string;
  roles: UserRole[];
  status?: UserStatus;
}

/** 用户更新载荷 */
export interface UserUpdateInput {
  displayName?: string;
  email?: string;
  orgId?: string;
  roles?: UserRole[];
  status?: UserStatus;
}

/** 审计日志查询参数 */
export interface AuditQuery extends PageQuery {
  action?: AuditAction;
  operator?: string;
  ip?: string;
}
