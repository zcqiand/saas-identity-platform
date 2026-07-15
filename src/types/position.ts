// 岗位管理类型定义

export interface Position {
  id: string;
  name: string;
  code: string;
  description?: string;
  sort: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PositionMember {
  id: string;
  positionId: string;
  userId: string;
  userName: string;
  displayName: string;
  joinedAt: string;
}

export interface PositionCreateInput {
  name: string;
  code: string;
  description?: string;
  sort?: number;
  enabled?: boolean;
}
