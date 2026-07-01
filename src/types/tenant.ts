// ch39 SaaS 多租户类型定义

/** 主题配置：通过 CSS 变量注入 document.documentElement */
export interface ThemeConfig {
  /** 主色（按钮/链接/高亮） */
  primary: string
  /** 侧边栏背景色 */
  sidebar: string
  /** Logo 文本 */
  logoText: string
}

/** 租户配置 */
export interface TenantConfig {
  id: string
  name: string
  theme: ThemeConfig
  /** 启用的功能模块（如 sso/audit/rbac） */
  features: string[]
  /** 可选：最大用户数等业务配置 */
  config?: {
    maxUsers?: number
    [key: string]: unknown
  }
}

/** 租户 store 状态 */
export interface TenantState {
  /** 当前租户 */
  current: TenantConfig | null
  /** 租户列表 */
  list: TenantConfig[]
  loading: boolean
  error: string | null
}
