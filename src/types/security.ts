// 安全配置类型定义 — 单一真理源自 @saas/identity-platform-shared/schemas

import type {
  PermissionGroup as SharedPermissionGroup,
  TokenConfig as SharedTokenConfig,
  LoginSecurity as SharedLoginSecurity,
  PasswordPolicy as SharedPasswordPolicy,
  RiskControl as SharedRiskControl,
  NotificationConfig as SharedNotificationConfig,
  OpenPlatformConfig as SharedOpenPlatformConfig,
  LoginMethodEntry as SharedLoginMethodEntry,
  SsoProvider as SharedSsoProvider,
  OAuth2Provider as SharedOAuth2Provider,
  ApiKey as SharedApiKey,
} from "@saas/identity-platform-shared/schemas";

// —— 权限组（权限模板）——
export type PermissionGroup = SharedPermissionGroup;

export interface PermissionGroupCreateInput {
  name: string;
  description?: string;
  permissions?: string[];
  menuIds?: string[];
  sort?: number;
  enabled?: boolean;
}

// —— 登录认证方式配置 ——
export type LoginMethod = SharedLoginMethodEntry;
export type SsoProvider = SharedSsoProvider;
export type OAuth2Provider = SharedOAuth2Provider;

// —— Token 管理（22）——
export type TokenConfig = SharedTokenConfig;

// —— API Key 管理（24）——
export type ApiKey = SharedApiKey;

export interface ApiKeyCreateInput {
  name: string;
  scopes?: string[];
  expiresAt?: string;
}

// —— 登录安全（26） ——
export type LoginSecurity = SharedLoginSecurity;

// —— 密码策略（27） ——
export type PasswordPolicy = SharedPasswordPolicy;

// —— 风险控制（28） ——
export type RiskControl = SharedRiskControl;

// —— 消息通知（29） ——
export type NotificationConfig = SharedNotificationConfig;

// —— 开放平台（30） ——
export type OpenPlatformConfig = SharedOpenPlatformConfig;