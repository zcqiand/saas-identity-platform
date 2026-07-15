// 应用管理 & 菜单管理类型定义

export interface MenuItem {
  id: string;
  /** 菜单名称 */
  name: string;
  /** 路由路径（相对应用） */
  path: string;
  /** 菜单图标（可选） */
  icon?: string;
  /** 排序序号 */
  sort: number;
  /** 所属应用 ID */
  appId: string;
  /** 上级菜单 ID（顶级为 null） */
  parentId: string | null;
  /** 是否启用 */
  enabled: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

export interface App {
  id: string;
  /** 应用名称 */
  name: string;
  /** 应用编码（唯一） */
  code: string;
  /** 应用描述 */
  description?: string;
  /** 主题色 */
  theme: string;
  /** 排序号 */
  sort: number;
  /** 是否启用 */
  enabled: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

export interface AppWithMenus extends App {
  menus: MenuItem[];
}

export interface AppCreateInput {
  name: string;
  code: string;
  description?: string;
  theme?: string;
  sort?: number;
  enabled?: boolean;
}

export interface MenuCreateInput {
  name: string;
  path: string;
  appId: string;
  parentId?: string | null;
  icon?: string;
  sort?: number;
  enabled?: boolean;
}

export interface MenuUpdateInput {
  name?: string;
  path?: string;
  parentId?: string | null;
  icon?: string;
  sort?: number;
  enabled?: boolean;
}
