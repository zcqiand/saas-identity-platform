import { useEffect, useState } from 'react'
import { usePermissionGroupStore } from './permissionGroupStore'
import { ConfirmModal } from '../../components/ConfirmModal'
import type { PermissionGroup } from '../../types/security'

interface FormModalProps {
  open: boolean; mode: 'create' | 'edit'; initial?: PermissionGroup
  onSubmit: (v: Partial<PermissionGroup>) => Promise<void>; onCancel: () => void; loading: boolean
}
function FormModal({ open, mode, initial, onSubmit, onCancel, loading }: FormModalProps) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [perms, setPerms] = useState('')
  const [sort, setSort] = useState(99)
  const [enabled, setEnabled] = useState(true)
  useEffect(() => {
    if (open) {
      setName(initial?.name ?? ''); setDesc(initial?.description ?? '')
      setPerms(initial?.permissions?.join(', ') ?? '')
      setSort(initial?.sort ?? 99); setEnabled(initial?.enabled ?? true)
    }
  }, [open, initial])
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] p-6">
        <h3 className="text-lg font-bold mb-4">{mode === 'create' ? '新建权限组' : '编辑权限组'}</h3>
        <div className="space-y-3">
          <div><label className="block text-sm mb-1">权限组名称 *</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm mb-1">描述</label><input value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm mb-1">权限码（逗号分隔）</label><input value={perms} onChange={(e) => setPerms(e.target.value)} className="w-full border rounded px-3 py-2 text-sm font-mono text-xs" placeholder="user:read, role:write" /></div>
          <div><label className="block text-sm mb-1">排序号</label><input type="number" value={sort} onChange={(e) => setSort(Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="pg-enabled" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="rounded" /><label htmlFor="pg-enabled" className="text-sm">启用</label></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 border rounded text-sm" disabled={loading}>取消</button>
          <button onClick={() => onSubmit({ name, description: desc, permissions: perms.split(',').map((p) => p.trim()).filter(Boolean), sort, enabled })} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50" disabled={loading}>{loading ? '保存中...' : '保存'}</button>
        </div>
      </div>
    </div>
  )
}

export function PermissionGroupList() {
  const { list, loading, error, fetchPermissionGroups, createPermissionGroup, updatePermissionGroup, deletePermissionGroup } = usePermissionGroupStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PermissionGroup | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PermissionGroup | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchPermissionGroups() }, [fetchPermissionGroups])

  const handleSubmit = async (values: Partial<PermissionGroup>) => {
    setSubmitting(true)
    try {
      if (editTarget) { await updatePermissionGroup(editTarget.id, values) } else { await createPermissionGroup(values) }
      setFormOpen(false); setEditTarget(null); fetchPermissionGroups()
    } finally { setSubmitting(false) }
  }
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try { await deletePermissionGroup(deleteTarget.id); setDeleteTarget(null); fetchPermissionGroups() }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">权限组</h2>
        <button onClick={() => { setEditTarget(null); setFormOpen(true) }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">新建权限组</button>
      </div>
      {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-2 text-left">权限组名称</th><th className="px-4 py-2 text-left">描述</th><th className="px-4 py-2 text-left">权限数</th><th className="px-4 py-2 text-center">状态</th><th className="px-4 py-2 text-right">操作</th></tr></thead>
          <tbody>
            {loading && list.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">加载中...</td></tr>}
            {!loading && list.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">暂无数据</td></tr>}
            {list.map((g) => (
              <tr key={g.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{g.name}</td>
                <td className="px-4 py-2 text-gray-500">{g.description ?? '-'}</td>
                <td className="px-4 py-2"><div className="flex flex-wrap gap-1">{g.permissions.slice(0, 3).map((p) => <span key={p} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-mono">{p}</span>)}</div></td>
                <td className="px-4 py-2 text-center"><span className={`inline-block px-2 py-0.5 rounded text-xs ${g.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{g.enabled ? '启用' : '禁用'}</span></td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button onClick={() => { setEditTarget(g); setFormOpen(true) }} className="px-2 py-1 text-blue-600 hover:underline">编辑</button>
                  <button onClick={() => setDeleteTarget(g)} className="px-2 py-1 text-red-600 hover:underline">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FormModal open={formOpen} mode={editTarget ? 'edit' : 'create'} initial={editTarget ?? undefined} onSubmit={handleSubmit} onCancel={() => { setFormOpen(false); setEditTarget(null) }} loading={submitting} />
      <ConfirmModal open={deleteTarget !== null} title="删除确认" message={`确定删除权限组「${deleteTarget?.name ?? ''}」？`} loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
export default PermissionGroupList
