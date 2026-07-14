import { useEffect, useState, type FormEvent } from 'react'
import type { TenantCreateInput, ThemeConfig } from '../../types/tenant'

export interface TenantFormValues {
  name: string
  theme: ThemeConfig
  config?: { features?: string[]; maxUsers?: number }
}

interface TenantFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: Partial<TenantCreateInput & { id: string }>
  onSubmit: (values: TenantFormValues) => void
  onCancel: () => void
  loading?: boolean
}

const FEATURE_OPTIONS = ['sso', 'audit', 'rbac']

export function TenantFormModal({
  open,
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: TenantFormModalProps) {
  const [name, setName] = useState('')
  const [primary, setPrimary] = useState('#2563eb')
  const [sidebar, setSidebar] = useState('#1e293b')
  const [logoText, setLogoText] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [maxUsers, setMaxUsers] = useState(100)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setName(initialValues?.name ?? '')
      setPrimary(initialValues?.theme?.primary ?? '#2563eb')
      setSidebar(initialValues?.theme?.sidebar ?? '#1e293b')
      setLogoText(initialValues?.theme?.logoText ?? '')
      setFeatures(initialValues?.config?.features ?? [])
      setMaxUsers(initialValues?.config?.maxUsers ?? 100)
      setErrors({})
    }
     
  }, [open, initialValues])

  if (!open) return null

  const title = mode === 'create' ? '新建租户' : '编辑租户'

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = '请输入租户名称'
    if (!logoText.trim()) next.logoText = '请输入 Logo 文本'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      name: name.trim(),
      theme: { primary: primary.trim(), sidebar: sidebar.trim(), logoText: logoText.trim() },
      config: { features, maxUsers },
    })
  }

  const toggleFeature = (f: string) => {
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl w-[520px] max-w-[90vw]"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div>
            <label htmlFor="tenant-name" className="block text-sm mb-1 font-medium">
              租户名称
            </label>
            <input
              id="tenant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="tenant-logo-text" className="block text-sm mb-1 font-medium">
              Logo 文本
            </label>
            <input
              id="tenant-logo-text"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.logoText && (
              <p className="text-red-600 text-xs mt-1">{errors.logoText}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tenant-primary" className="block text-sm mb-1 font-medium">
                主色
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  className="w-10 h-10 border rounded cursor-pointer"
                />
                <input
                  id="tenant-primary"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  className="flex-1 border rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="tenant-sidebar" className="block text-sm mb-1 font-medium">
                侧边栏色
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={sidebar}
                  onChange={(e) => setSidebar(e.target.value)}
                  className="w-10 h-10 border rounded cursor-pointer"
                />
                <input
                  id="tenant-sidebar"
                  value={sidebar}
                  onChange={(e) => setSidebar(e.target.value)}
                  className="flex-1 border rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">功能模块</label>
            <div className="flex gap-4">
              {FEATURE_OPTIONS.map((f) => (
                <label key={f} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={features.includes(f)}
                    onChange={() => toggleFeature(f)}
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="tenant-max-users" className="block text-sm mb-1 font-medium">
              最大用户数
            </label>
            <input
              id="tenant-max-users"
              type="number"
              min={1}
              value={maxUsers}
              onChange={(e) => setMaxUsers(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="px-6 py-3 flex justify-end gap-2 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TenantFormModal
