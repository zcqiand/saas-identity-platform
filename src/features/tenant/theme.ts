import type { ThemeConfig } from "../../types/tenant";
import { isTenantThemeString, type Tenant } from "@saas/identity-platform-shared/schemas";

const THEME_VARS = {
  primary: "--tenant-primary",
  sidebar: "--tenant-sidebar",
  logoText: "--tenant-logo-text",
} as const;

/** 默认主题（fallback：登出后或 theme 字段缺失） */
const DEFAULT_THEME: ThemeConfig = {
  primary: "#2563eb",
  sidebar: "#1e293b",
  logoText: "SaaS",
};

/**
 * 将主题配置写入 document.documentElement 的 CSS 变量。
 * 切换租户时调用 applyTheme(newTheme) 即可覆盖。
 */
export function applyTheme(theme: ThemeConfig | string): void {
  const root = document.documentElement;
  const resolved = resolveTheme(theme);
  root.style.setProperty(THEME_VARS.primary, resolved.primary);
  root.style.setProperty(THEME_VARS.sidebar, resolved.sidebar);
  root.style.setProperty(THEME_VARS.logoText, resolved.logoText);
}

/**
 * 从 Tenant.theme 解析为 ThemeConfig。shared Tenant.theme 接受两种形态：
 *   - 字符串：TenantThemeEnum 之一 → 查表得到 ThemeConfig
 *   - 嵌套对象（{primary, sidebar, logoText}）→ 直接使用
 */
export function resolveTheme(theme: Tenant["theme"] | ThemeConfig | string): ThemeConfig {
  if (typeof theme === "object" && theme !== null && "primary" in theme) {
    return theme as ThemeConfig;
  }
  if (isTenantThemeString(theme as Tenant["theme"])) {
    return THEME_FROM_ENUM[theme as string] ?? DEFAULT_THEME;
  }
  return DEFAULT_THEME;
}

/** 清除所有租户主题 CSS 变量（登出/切换时调用） */
export function clearTheme(): void {
  const root = document.documentElement;
  root.style.removeProperty(THEME_VARS.primary);
  root.style.removeProperty(THEME_VARS.sidebar);
  root.style.removeProperty(THEME_VARS.logoText);
}

/** 字符串枚举 → 嵌套主题对象映射（shared TenantThemeEnum 默认主题） */
const THEME_FROM_ENUM: Record<string, ThemeConfig> = {
  default: { primary: "#2563eb", sidebar: "#1e293b", logoText: "SaaS" },
  dark: { primary: "#0f172a", sidebar: "#020617", logoText: "SaaS" },
  light: { primary: "#f8fafc", sidebar: "#e2e8f0", logoText: "SaaS" },
  blue: { primary: "#2563eb", sidebar: "#1e293b", logoText: "SaaS" },
  green: { primary: "#059669", sidebar: "#064e3b", logoText: "SaaS" },
  red: { primary: "#dc2626", sidebar: "#450a0a", logoText: "SaaS" },
};