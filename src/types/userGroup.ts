// 用户组类型定义 — 单一真理源自 @saas/identity-platform-shared/schemas

import type { UserGroup } from "@saas/identity-platform-shared/schemas";

/** 用户组（向后兼容别名 = shared UserGroup） */
export type { UserGroup };

/** 用户组成员（业务侧中间表，shared 未导出） */
export interface UserGroupMember {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  displayName: string;
  joinedAt: string;
}

/** 用户组创建输入 */
export interface UserGroupCreateInput {
  name: string;
  description?: string;
  enabled?: boolean;
}