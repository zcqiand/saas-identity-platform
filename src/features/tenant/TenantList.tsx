import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTenantStore } from './tenantStore'
import { TenantFormModal, type TenantFormValues } from './TenantFormModal'
import { ConfirmModal } from '../../components/ConfirmModal'
import type { TenantConfig } from '../../types/tenant'

export function TenantList() {
  const { list, loading, error, fetchTenants, createTenant, deleteTenant } = useTenantStore()
  const navigate = useNavigate()

  const [keyword, setKeyword] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TenantConfig | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchTenants(keyword.trim() || undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = () => {
    fetchTenants(keyword.trim() || undefined)
  }

  const handleSubmit = async (values: TenantFormValues) => {
    setSubmitting(true)
    try {
      await createTenant({
        name: values.name,
        theme: values.theme,
        config: values.config,
      })
      setFormOpen(false)
      fetchTenants(keyword.trim() || undefined)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteTenant(deleteTarget.id)
      setDeleteTarget(null)
      fetchTenants(keyword.trim() || undefined)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">平台租户管理</h2>
        <button
          onClick={() => setFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          新建租户
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white p-3 rounded shadow-sm">
        <input
          placeholder="搜索租户名称"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="border rounded px-3 py-1.5 text-sm flex-1"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-1.5 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
        >
          搜索
        </button>
      </div>

      {error && (
        <div role="alert" className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">租户名称</th>
              <th className="px-4 py-2 text-left">Logo</th>
              <th className="px-4 py-2 text-left">主题色</th>
              <th className="px-4 py-2 text-left">功能模块</th>
              <th className="px-4 py-2 text-left">最大用户数</th>
              <th className="px-4 py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  加载中...
                </td>
              </tr>
            )}
            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
            {list.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{t.name}</td>
                <td className="px-4 py-2">{t.theme.logoText}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded border"
                      style={{ background: t.theme.primary }}
                    />
                    <span className="text-xs font-mono text-gray-500">{t.theme.primary}</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-xs text-gray-600">
                  {((t.config?.features ?? t.features ?? []) as string[]).join(', ') || '-'}
                </td>
                <td className="px-4 py-2">{t.config?.maxUsers ?? '-'}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => navigate(`/platform/tenants/${t.id}`)}
                    className="px-2 py-1 text-blue-600 hover:underline"
                  >
                    详情配置
                  </button>
                  <button
                    onClick={() => setDeleteTarget(t)}
                    className="px-2 py-1 text-red-600 hover:underline"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TenantFormModal
        open={formOpen}
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => setFormOpen(false)}
        loading={submitting}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="删除确认"
        message={`确定删除租户「${deleteTarget?.name ?? ''}」？此操作不可撤销。`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default TenantList
