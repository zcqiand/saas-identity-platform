import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../auth/authStore'

/**
 * SSO 回调页：从 useSearchParams 取 code → 调 authStore.handleOAuthCallback → 跳 dashboard。
 * 无 code 或失败时跳 /login。
 */
export function SsoCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { handleOAuthCallback, status, error } = useAuthStore()
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    const code = searchParams.get('code')

    if (!code) {
      navigate('/login', { replace: true })
      return
    }

    handleOAuthCallback(code, 'sso').then(() => {
      const authState = useAuthStore.getState()
      if (authState.status === 'authenticated') {
        navigate('/acme/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    })
  }, [handleOAuthCallback, navigate, searchParams])

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">SSO 回调处理中...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600">认证失败：{error}</p>
          <p className="text-gray-500 text-sm mt-2">正在跳转登录页...</p>
        </div>
      </div>
    )
  }

  return null
}

export default SsoCallback
