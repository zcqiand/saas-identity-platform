// ch41 用户类型定义 — 单一真理源自 @saas/identity-platform-shared/schemas
//
// Phase 5b 迁移：原本地 User / DepartmentNode / AuditLog / UserRole / UserStatus 等类型
// 全部 re-export 自 shared 的 zod schema 推导类型。shared 在 v0.3.0 起把
// `orgId` 重命名为 `departmentId`，并把 tenants 13 → 2（acme / tenant-lab）。
//
// v0.4.0 命名收紧：原 `OrgNode` 别名（= shared `DepartmentNode`）已删除，
// 全部统一为 strict `DepartmentNode`。
//
// UserQuery / UserCreateInput / UserUpdateInput 保留本地（业务查询/写入形态
// 仍由 React 仓决定），字段名已迁移为 `departmentId`。

import type {
  User,
  DepartmentNode,
  AuditLog,
  RoleCode,
  UserStatus,
} from "@saas/identity-platform-shared/schemas";

/** 用户角色（向后兼容别名，shared 原生 RoleCode） */
export type UserRole = RoleCode;

/** 用户 */
export type { User, UserStatus };

/** 部门节点（树形，shared DepartmentNode 直出，不再有 OrgNode 别名） */
export type { DepartmentNode };

/** 审计日志 */
export type { AuditLog };

/** 审计操作类型（从 AuditLog.action 派生） */
export type AuditAction = AuditLog["action"];

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
  departmentId?: string;
}

/** 用户新建载荷 */
export interface UserCreateInput {
  username: string;
  displayName: string;
  email: string;
  departmentId?: string;
  roles: UserRole[];
  status?: UserStatus;
}

/** 用户更新载荷 */
export interface UserUpdateInput {
  displayName?: string;
  email?: string;
  departmentId?: string;
  roles?: UserRole[];
  status?: UserStatus;
}

/** 审计日志查询参数 */
export interface AuditQuery extends PageQuery {
  action?: AuditAction;
  operator?: string;
  ip?: string;
}