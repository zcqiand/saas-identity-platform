// 应用管理 & 菜单管理类型定义 — 单一真理源自 @saas/identity-platform-shared/schemas

import type { App, Menu } from "@saas/identity-platform-shared/schemas";

/** 菜单项（向后兼容别名 = shared Menu） */
export type MenuItem = Menu;

/** 应用（向后兼容别名 = shared App） */
export type { App };

/** 应用+菜单组合 */
export interface AppWithMenus extends App {
  menus: MenuItem[];
}

/** 应用创建输入 */
export interface AppCreateInput {
  name: string;
  code: string;
  description?: string;
  theme?: string;
  sort?: number;
  enabled?: boolean;
}

/** 菜单创建输入 */
export interface MenuCreateInput {
  name: string;
  path: string;
  appId: string;
  parentId?: string | null;
  icon?: string;
  sort?: number;
  enabled?: boolean;
}

/** 菜单更新输入 */
export interface MenuUpdateInput {
  name?: string;
  path?: string;
  parentId?: string | null;
  icon?: string;
  sort?: number;
  enabled?: boolean;
}