import { useEffect, useState } from 'react'
import { useAuditStore } from './auditStore'
import { VirtualList } from '../../components/VirtualList'
import type { AuditAction, AuditQuery, AuditLog } from '../../types/user'

const PAGE_SIZE = 20

const ACTION_LABELS: Record<AuditAction, string> = {
  login: '登录',
  logout: '登出',
  create: '新建',
  update: '更新',
  delete: '删除',
  permission_change: '权限变更',
}

export function AuditLogList() {
  const { list, total, loading, error, fetchAuditLogs } = useAuditStore()

  const [page, setPage] = useState(1)
  const [action, setAction] = useState<AuditAction | ''>('')
  const [operator, setOperator] = useState('')
  const [ip, setIp] = useState('')

  const buildQuery = (p: number): AuditQuery => ({
    page: p,
    pageSize: PAGE_SIZE,
    action: action || undefined,
    operator: operator || undefined,
    ip: ip || undefined,
  })

  useEffect(() => {
    fetchAuditLogs(buildQuery(page))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleFilter = () => {
    setPage(1)
    fetchAuditLogs(buildQuery(1))
  }

  const handleActionChange = (value: AuditAction | '') => {
    setAction(value)
    setPage(1)
    const q: AuditQuery = {
      page: 1,
      pageSize: PAGE_SIZE,
      action: value || undefined,
      operator: operator || undefined,
      ip: ip || undefined,
    }
    fetchAuditLogs(q)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const renderItem = ({ item }: { item: AuditLog; index: number }) => (
    <div className="flex items-center text-xs px-2 py-1 border-b border-gray-100">
      <span className="w-32 text-gray-500">{new Date(item.timestamp).toLocaleString('zh-CN')}</span>
      <span className="w-20">
        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
          {ACTION_LABELS[item.action]}
        </span>
      </span>
      <span className="w-32 truncate">{item.operator}</span>
      <span className="w-24 text-gray-500">{item.ip}</span>
      <span className="flex-1 truncate text-gray-600">{item.detail}</span>
    </div>
  )

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">审计日志</h2>

      <div className="flex items-center gap-2 bg-white p-3 rounded shadow-sm flex-wrap">
        <label className="text-sm text-gray-600 flex items-center gap-1">
          操作类型
          <select
            value={action}
            onChange={(e) => handleActionChange(e.target.value as AuditAction | '')}
            className="border rounded px-2 py-1.5 text-sm"
          >
            <option value="">全部</option>
            <option value="login">登录</option>
            <option value="logout">登出</option>
            <option value="create">新建</option>
            <option value="update">更新</option>
            <option value="delete">删除</option>
            <option value="permission_change">权限变更</option>
          </select>
        </label>
        <input
          placeholder="操作人"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm w-32"
        />
        <input
          placeholder="IP 地址"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm w-32"
        />
        <button
          onClick={handleFilter}
          className="px-4 py-1.5 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
        >
          筛选
        </button>
      </div>

      {error && (
        <div role="alert" className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow">
        <div className="flex items-center text-xs px-2 py-2 border-b bg-gray-50 text-gray-600 font-medium">
          <span className="w-32">时间</span>
          <span className="w-20">操作</span>
          <span className="w-32">操作人</span>
          <span className="w-24">IP</span>
          <span className="flex-1">详情</span>
        </div>
        {loading && list.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">加载中...</div>
        ) : list.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">暂无数据</div>
        ) : (
          <VirtualList
            items={list}
            height={400}
            itemSize={36}
            width="100%"
            renderItem={renderItem}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>共 {total} 条</span>
        <div className="space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            上一页
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuditLogList
