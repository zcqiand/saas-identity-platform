import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { apiClient } from '../api/client'
import type { PasswordPolicy } from '../types/security'

interface FieldProps {
  label: string
  desc?: string
  children: ReactNode
}

/** 策略项布局：左 label+desc，右 children。提到模块顶层以满足 react/no-unstable-nested-components。 */
function Field({ label, desc, children }: FieldProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {desc && <p className="text-xs text-gray-400">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

export default function PasswordPolicyPage() {
  const [config, setConfig] = useState<PasswordPolicy | null>(null)
  const [, setSaving] = useState(false)

  useEffect(() => { apiClient.get<PasswordPolicy>('/password-policy').then((r) => setConfig(r.data)) }, [])

  const update = async (patch: Partial<PasswordPolicy>) => {
    setSaving(true)
    try { const { data } = await apiClient.put<PasswordPolicy>('/password-policy', patch); setConfig(data) }
    finally { setSaving(false) }
  }

  if (!config) return <div className="p-8 text-gray-400">加载中...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">密码策略</h2>
      <div className="bg-white rounded shadow p-6 space-y-3">
        <Field label="启用密码策略" desc="强制执行以下密码规则">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={config.enabled} onChange={(e) => update({ enabled: e.target.checked })} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </Field>
        <Field label="最小密码长度">
          <input type="number" min={6} max={32} value={config.minLength} onBlur={() => update({ minLength: config.minLength })} onChange={(e) => setConfig({ ...config, minLength: Number(e.target.value) })} className="border rounded px-3 py-1.5 w-20 text-center" />
        </Field>
        <Field label="必须包含大写字母">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={config.requireUppercase} onChange={(e) => update({ requireUppercase: e.target.checked })} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </Field>
        <Field label="必须包含小写字母">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={config.requireLowercase} onChange={(e) => update({ requireLowercase: e.target.checked })} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </Field>
        <Field label="必须包含数字">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={config.requireDigit} onChange={(e) => update({ requireDigit: e.target.checked })} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </Field>
        <Field label="必须包含特殊字符">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={config.requireSpecial} onChange={(e) => update({ requireSpecial: e.target.checked })} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </Field>
        <Field label="密码过期天数" desc="0 表示永不过期">
          <input type="number" min={0} value={config.expireDays} onBlur={() => update({ expireDays: config.expireDays })} onChange={(e) => setConfig({ ...config, expireDays: Number(e.target.value) })} className="border rounded px-3 py-1.5 w-24 text-center" />
        </Field>
        <Field label="历史密码数量" desc="不可重复使用的最近密码个数">
          <input type="number" min={0} max={10} value={config.historyCount} onBlur={() => update({ historyCount: config.historyCount })} onChange={(e) => setConfig({ ...config, historyCount: Number(e.target.value) })} className="border rounded px-3 py-1.5 w-20 text-center" />
        </Field>
      </div>
    </div>
  )
}
