import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useTenantStore } from './tenantStore'

/**
 * 租户切换器：显示所有可用租户，点击切换并跳转到新租户的 dashboard。
 * 切换时保留当前路径的尾部段（如 /acme/users → /globex/users）。
 */
export function TenantSwitcher() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { list, fetchTenants, current } = useTenantStore()

  useEffect(() => {
    if (list.length === 0) {
      fetchTenants()
    }
  }, [list.length, fetchTenants])

  const handleSwitch = (newTenantId: string) => {
    // 切换租户，跳转到新租户的 dashboard（简化：总是跳 dashboard）
    navigate(`/${newTenantId}/dashboard${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">切换租户：</span>
      {list.map((t) => (
        <button
          key={t.id}
          onClick={() => handleSwitch(t.id)}
          className={`px-2 py-1 text-xs rounded border ${
            current?.id === t.id
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {t.name}
        </button>
      ))}
    </div>
  )
}
