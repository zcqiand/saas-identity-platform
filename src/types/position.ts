// 岗位管理类型定义 — 单一真理源自 @saas/identity-platform-shared/schemas

import type { Position } from "@saas/identity-platform-shared/schemas";

/** 岗位（向后兼容别名 = shared Position） */
export type { Position };

/** 岗位成员（业务侧中间表，shared 未导出） */
export interface PositionMember {
  id: string;
  positionId: string;
  userId: string;
  userName: string;
  displayName: string;
  joinedAt: string;
}

/** 岗位创建输入 */
export interface PositionCreateInput {
  name: string;
  code: string;
  description?: string;
  sort?: number;
  enabled?: boolean;
}