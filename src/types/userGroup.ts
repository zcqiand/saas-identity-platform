// 用户组类型定义

export interface UserGroup {
  id: string
  name: string
  description?: string
  memberCount: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface UserGroupMember {
  id: string
  groupId: string
  userId: string
  userName: string
  displayName: string
  joinedAt: string
}

export interface UserGroupCreateInput {
  name: string
  description?: string
  enabled?: boolean
}
