import { useEffect, useState, useCallback } from 'react'
import { useAuditStore, type AuditTab } from './auditStore'
import type { AuditLog, AuditAction } from '../../types/user'

const PAGE_SIZE = 20

const ACTION_LABELS: Record<AuditAction, string> = {
  login: '登录',
  logout: '登出',
  create: '新建',
  update: '更新',
  delete: '删除',
  permission_change: '权限变更',
}

const TABS: { key: AuditTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'login', label: '登录日志' },
  { key: 'operation', label: '操作日志' },
  { key: 'security', label: '安全日志' },
]

function formatDate(d: string) {
  return d.slice(0, 10)
}

function toCsvLine(log: AuditLog): string {
  const vals = [
    log.timestamp,
    ACTION_LABELS[log.action] ?? log.action,
    log.operator,
    log.ip,
    log.detail,
    log.resource,
    log.resourceId,
  ]
  return vals.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
}

export function AuditLogList() {
  const { list, total, loading, error, fetchAuditLogs } = useAuditStore()

  const [tab, setTab] = useState<AuditTab>('all')
  const [page] = useState(1)
  const [operator, setOperator] = useState('')
  const [ip, setIp] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const doFetch = useCallback(
    (t: AuditTab, op: string, ipVal: string, start: string, end: string) => {
      fetchAuditLogs({
        page: 1,
        pageSize: PAGE_SIZE,
        type: t,
        operator: op || undefined,
        ip: ipVal || undefined,
        startDate: start || undefined,
        endDate: end || undefined,
      })
    },
    [fetchAuditLogs],
  )

  // 首次 + tab 切换触发 fetch
  useEffect(() => {
    doFetch(tab, operator, ip, startDate, endDate)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const handleFilter = () => doFetch(tab, operator, ip, startDate, endDate)

  const handleReset = () => {
    setOperator('')
    setIp('')
    setStartDate('')
    setEndDate('')
    setTab('all')
  }

  const handleExportCsv = () => {
    if (list.length === 0) return
    const header = '时间,操作类型,操作人,IP,详情,资源类型,资源ID'
    const rows = list.map(toCsvLine).join('\n')
    const bom = '﻿'
    const blob = new Blob([bom + header + '\n' + rows], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${formatDate(new Date().toISOString())}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">审计日志</h2>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-white rounded px-2 py-1.5 w-fit shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key)
              doFetch(t.key, operator, ip, startDate, endDate)
            }}
            className={`px-4 py-1.5 rounded text-sm transition-colors ${
              tab === t.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 过滤器工具栏 */}
      <div className="flex items-center gap-2 bg-white p-3 rounded shadow-sm flex-wrap">
        <span className="text-sm text-gray-500">日期</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-2 py-1.5 text-sm"
        />
        <span className="text-gray-400">至</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded px-2 py-1.5 text-sm"
        />
        <div className="w-px h-5 bg-gray-300" />
        <input
          placeholder="操作人"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          className="border rounded px-3 py-1.5 text-sm w-32"
        />
        <input
          placeholder="IP 地址"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          className="border rounded px-3 py-1.5 text-sm w-32"
        />
        <button
          onClick={handleFilter}
          className="px-4 py-1.5 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
        >
          筛选
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-1.5 border rounded text-sm text-gray-600 hover:bg-gray-50"
        >
          重置
        </button>
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleExportCsv}
            disabled={list.length === 0}
            className="px-4 py-1.5 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50 disabled:opacity-40"
          >
            导出 CSV
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
      )}

      {/* 表头 */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="flex items-center px-3 py-2 bg-gray-50 text-xs text-gray-500 font-medium border-b">
          <span className="w-44">时间</span>
          <span className="w-24">操作类型</span>
          <span className="w-32">操作人</span>
          <span className="w-28">IP</span>
          <span className="flex-1">详情</span>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">加载中...</div>
        ) : list.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">暂无数据</div>
        ) : (
          list.map((log) => {
            const isLogin = log.action === 'login' || log.action === 'logout'
            const isSecurity = log.action === 'permission_change'
            const badgeCls = isLogin
              ? 'bg-blue-50 text-blue-600'
              : isSecurity
              ? 'bg-orange-50 text-orange-600'
              : 'bg-gray-100 text-gray-600'
            return (
              <div
                key={log.id}
                className="flex items-center px-3 py-2 text-xs border-b border-gray-50 last:border-0 hover:bg-gray-50"
              >
                <span className="w-44 text-gray-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('zh-CN')}
                </span>
                <span className="w-24">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${badgeCls}`}>
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                </span>
                <span className="w-32 truncate">{log.operator}</span>
                <span className="w-28 font-mono text-gray-400">{log.ip}</span>
                <span className="flex-1 truncate text-gray-600">{log.detail}</span>
              </div>
            )
          })
        )}
      </div>

      {/* 分页信息 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>共 {total} 条，当前页 {list.length} 条</span>
        <span>第 {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))} 页</span>
      </div>
    </div>
  )
}

export default AuditLogList
