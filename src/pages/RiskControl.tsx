import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import type { RiskControl } from '../types/security'

export default function RiskControlPage() {
  const [config, setConfig] = useState<RiskControl | null>(null)
  const [, setSaving] = useState(false)

  useEffect(() => { apiClient.get<RiskControl>('/risk-control').then((r) => setConfig(r.data)) }, [])

  const update = async (patch: Partial<RiskControl>) => {
    setSaving(true)
    try { const { data } = await apiClient.put<RiskControl>('/risk-control', patch); setConfig(data) }
    finally { setSaving(false) }
  }

  if (!config) return <div className="p-8 text-gray-400">加载中...</div>

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">风险控制</h2>
      <div className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">检测与告警</h3>
        <div className="flex items-center justify-between p-3 border rounded">
          <div><p className="font-medium text-sm">异常登录检测</p><p className="text-xs text-gray-400">检测IP/设备/时间等异常模式</p></div>
          <Toggle checked={config.anomalyDetectionEnabled} onChange={(v) => update({ anomalyDetectionEnabled: v })} />
        </div>
        <div className="flex items-center justify-between p-3 border rounded">
          <div><p className="font-medium text-sm">异地登录告警</p><p className="text-xs text-gray-400">登录地点变化时发送告警</p></div>
          <Toggle checked={config.crossRegionAlertEnabled} onChange={(v) => update({ crossRegionAlertEnabled: v })} />
        </div>
        <div className="flex items-center justify-between p-3 border rounded">
          <div><p className="font-medium text-sm">设备指纹识别</p><p className="text-xs text-gray-400">基于设备特征识别可信设备</p></div>
          <Toggle checked={config.deviceFingerprintEnabled} onChange={(v) => update({ deviceFingerprintEnabled: v })} />
        </div>
        <div className="p-3 border rounded">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-sm">风险评分阈值</p>
            <span className="font-mono text-blue-600 text-lg">{config.riskScoreThreshold}</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">高于此分数的登录将被拦截或要求额外验证（0-100）</p>
          <input type="range" min={0} max={100} value={config.riskScoreThreshold} onChange={(e) => setConfig({ ...config, riskScoreThreshold: Number(e.target.value) })} onMouseUp={() => update({ riskScoreThreshold: config.riskScoreThreshold })} className="w-full" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>宽松(0)</span><span>严格(100)</span></div>
        </div>
      </div>
    </div>
  )
}
