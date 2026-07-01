import type { ThemeConfig } from '../../types/tenant'

const THEME_VARS = {
  primary: '--tenant-primary',
  sidebar: '--tenant-sidebar',
  logoText: '--tenant-logo-text',
} as const

/**
 * 将主题配置写入 document.documentElement 的 CSS 变量。
 * 切换租户时调用 applyTheme(newTheme) 即可覆盖。
 */
export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement
  root.style.setProperty(THEME_VARS.primary, theme.primary)
  root.style.setProperty(THEME_VARS.sidebar, theme.sidebar)
  root.style.setProperty(THEME_VARS.logoText, theme.logoText)
}

/** 清除所有租户主题 CSS 变量（登出/切换时调用） */
export function clearTheme(): void {
  const root = document.documentElement
  root.style.removeProperty(THEME_VARS.primary)
  root.style.removeProperty(THEME_VARS.sidebar)
  root.style.removeProperty(THEME_VARS.logoText)
}
