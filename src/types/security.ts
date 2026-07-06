// 安全配置类型定义

// —— 权限组（权限模板）——
export interface PermissionGroup {
  id: string
  name: string
  description?: string
  /** 包含的权限码列表 */
  permissions: string[]
  /** 关联菜单 ID 列表 */
  menuIds: string[]
  sort: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface PermissionGroupCreateInput {
  name: string
  description?: string
  permissions?: string[]
  menuIds?: string[]
  sort?: number
  enabled?: boolean
}

// —— 登录认证方式配置 ——
// 13/14/15/16/17/18 登录方式
export interface LoginMethod {
  id: string
  /** 登录方式标识 */
  method: 'password' | 'email_code' | 'sms_code' | 'totp' | 'sso' | 'oauth2'
  name: string
  description?: string
  enabled: boolean
  /** 排序 */
  sort: number
}

export interface SsoProvider {
  id: string
  name: string
  type: 'oidc' | 'saml'
  clientId?: string
  issuerUrl?: string
  enabled: boolean
}

export interface OAuth2Provider {
  id: string
  name: string
  provider: 'google' | 'github' | 'wechat' | 'dingtalk' | 'feishu'
  clientId?: string
  enabled: boolean
}

// —— Token 管理（22）——
export interface TokenConfig {
  id: string
  /** JWT 访问令牌有效期（秒） */
  accessTokenTtl: number
  /** Refresh Token 有效期（秒） */
  refreshTokenTtl: number
  /** 是否开启 token 续期 */
  refreshTokenEnabled: boolean
  /** 是否开启 token 主动失效（登出后） */
  tokenRevocationEnabled: boolean
}

// —— API Key 管理（24）——
export interface ApiKey {
  id: string
  name: string
  /** 密钥前缀，完整密钥只在创建时返回一次 */
  keyPrefix: string
  scopes: string[]
  expiresAt?: string
  enabled: boolean
  createdAt: string
  lastUsedAt?: string
}

export interface ApiKeyCreateInput {
  name: string
  scopes?: string[]
  expiresAt?: string
}

// —— 登录安全（26） ——
export interface LoginSecurity {
  id: string
  /** IP 白名单（CIDR 格式） */
  ipWhitelist: string[]
  /** IP 黑名单 */
  ipBlacklist: string[]
  /** 是否启用地区限制 */
  regionRestrictionEnabled: boolean
  /** 允许地区列表 */
  allowedRegions: string[]
  /** 是否启用登录失败锁定 */
  failedAttemptLockEnabled: boolean
  /** 锁定阈值（次） */
  lockThreshold: number
  /** 锁定时长（秒） */
  lockDuration: number
}

// —— 密码策略（27） ——
export interface PasswordPolicy {
  id: string
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireDigit: boolean
  requireSpecial: boolean
  /** 密码过期天数，0 表示永不过期 */
  expireDays: number
  /** 历史密码数量（不可重复使用） */
  historyCount: number
  /** 是否启用 */
  enabled: boolean
}

// —— 风险控制（28） ——
export interface RiskControl {
  id: string
  /** 异常登录检测 */
  anomalyDetectionEnabled: boolean
  /** 异地登录告警 */
  crossRegionAlertEnabled: boolean
  /** 设备指纹识别 */
  deviceFingerprintEnabled: boolean
  /** 风险评分阈值（0-100） */
  riskScoreThreshold: number
}

// —— 消息通知（29） ——
export interface NotificationConfig {
  id: string
  emailEnabled: boolean
  smsEnabled: boolean
  inAppEnabled: boolean
  /** 通知触发类型 */
  notifyOn: ('login' | 'password_change' | 'security_alert' | 'system')[]
}

// —— 开放平台（30） ——
export interface OpenPlatformConfig {
  id: string
  /** 是否开放 API */
  apiEnabled: boolean
  /** 是否开启 Webhook */
  webhookEnabled: boolean
  /** 是否开启 SDK 下载 */
  sdkEnabled: boolean
  /** 开放范围 */
  openScopes: string[]
  /** 回调地址白名单 */
  callbackWhitelist: string[]
}
