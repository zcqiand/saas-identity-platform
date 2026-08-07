// ch39 SaaS 多租户类型定义 — 单一真理源自 @saas/identity-platform-shared/schemas
//
// Phase 5b 迁移：原本地 ThemeConfig / TenantConfig / TenantCreateInput 等类型
// 全部 re-export 自 shared 的 zod schema 推导类型。shared Tenant.theme 接受
// 两种形态：字符串（TenantThemeEnum）或嵌套对象（TenantThemeObjectSchema）。
// 本仓消费路径主要用嵌套对象形态（applyTheme 写入 CSS 变量），提供
// ThemeConfig 本地类型用于书写体验。

import type { Tenant } from "@saas/identity-platform-shared/schemas";
import {
  isTenantThemeObject,
  type TenantThemeObjectSchema,
} from "@saas/identity-platform-shared/schemas";

/** 主题配置：通过 CSS 变量注入 document.documentElement */
export type ThemeConfig = {
  /** 主色（按钮/链接/高亮） */
  primary: string;
  /** 侧边栏背景色 */
  sidebar: string;
  /** Logo 文本 */
  logoText: string;
};

/** 租户配置 */
export interface TenantConfig {
  id: string;
  name: string;
  theme: ThemeConfig | string;
  /** 启用的功能模块（如 sso/audit/rbac） */
  features: string[];
  /** 可选：最大用户数等业务配置 */
  config?: {
    maxUsers?: number;
    [key: string]: unknown;
  };
}

/** 租户 store 状态 */
export interface TenantState {
  /** 当前租户 */
  current: TenantConfig | null;
  /** 租户列表 */
  list: TenantConfig[];
  loading: boolean;
  error: string | null;
}

/** 租户创建/更新输入 */
export interface TenantCreateInput {
  name: string;
  theme: ThemeConfig;
  config?: { features?: string[]; maxUsers?: number };
}

/** 从 shared Tenant 转成本地 TenantConfig（用 type guard 取嵌套主题对象） */
export function toTenantConfig(tenant: Tenant): TenantConfig {
  const themeObject = isTenantThemeObject(tenant.theme)
    ? (tenant.theme as unknown as TenantThemeConfig)
    : null;
  const cfg = (tenant.config ?? {}) as { features?: string[]; maxUsers?: number };
  return {
    id: tenant.id,
    name: tenant.name,
    theme: themeObject ?? { primary: "", sidebar: "", logoText: "" },
    features: cfg.features ?? [],
    config: cfg,
  };
}

type TenantThemeConfig = {
  primary: string;
  sidebar: string;
  logoText: string;
};

// 静默使用 type-only 导入以保持模块自洽
export type { Tenant };
// 显式 type guard re-export（消费方需要）
export { isTenantThemeObject };
// 静默使用 TenantThemeObjectSchema 类型（type-only）
export type _TenantThemeObjectSchema = typeof TenantThemeObjectSchema;