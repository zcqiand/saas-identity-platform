interface BuildAuthorizeUrlOptions {
  ssoBaseUrl?: string
  clientId?: string
  redirectUri?: string
  state: string
}

/**
 * 构造 OAuth2 /authorize URL。
 * 默认从 import.meta.env 读取 ssoBaseUrl/clientId，redirectUri 用当前 origin + /sso-callback。
 */
export function buildAuthorizeUrl(options: BuildAuthorizeUrlOptions): string {
  const ssoBaseUrl = options.ssoBaseUrl ?? import.meta.env.VITE_SSO_BASE_URL ?? '/sso'
  const clientId = options.clientId ?? import.meta.env.VITE_SSO_CLIENT_ID ?? 'saas-demo-client'
  const redirectUri =
    options.redirectUri ?? `${window.location.origin}/sso-callback`
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state: options.state,
  })
  return `${ssoBaseUrl}/authorize?${params.toString()}`
}

/**
 * 跳转到 SSO 授权服务器。
 * 设置 window.location.href 触发浏览器跳转。
 */
export function redirectToSso(options: BuildAuthorizeUrlOptions): void {
  const url = buildAuthorizeUrl(options)
  window.location.href = url
}

/** 生成随机 state（防 CSRF） */
export function generateState(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
