import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAppStore } from './appStore'
import { ConfirmModal } from '../../components/ConfirmModal'
import type { MenuItem } from '../../types/app'

interface MenuFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  appId: string
  parentId?: string | null
  initial?: Partial<MenuItem>
  onSubmit: (values: MenuFormValues) => Promise<void>
  onCancel: () => void
  loading: boolean
}

interface MenuFormValues {
  name: string
  path: string
  icon: string
  sort: number
  enabled: boolean
}

function MenuFormModal({ open, mode, parentId, initial, onSubmit, onCancel, loading }: MenuFormModalProps) {
  const [values, setValues] = useState<MenuFormValues>({
    name: initial?.name ?? '',
    path: initial?.path ?? '',
    icon: initial?.icon ?? '',
    sort: initial?.sort ?? 99,
    enabled: initial?.enabled ?? true,
  })

  useEffect(() => {
    if (open) {
      setValues({
        name: initial?.name ?? '',
        path: initial?.path ?? '',
        icon: initial?.icon ?? '',
        sort: initial?.sort ?? 99,
        enabled: initial?.enabled ?? true,
      })
    }
  }, [open, initial])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-4">
          {mode === 'create' ? '新建菜单' : '编辑菜单'}
          {parentId && <span className="text-sm font-normal text-gray-500 ml-2">（二级菜单）</span>}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">菜单名称 *</label>
            <input
              type="text"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">路由路径 *</label>
            <input
              type="text"
              value={values.path}
              onChange={(e) => setValues((v) => ({ ...v, path: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
              required
              placeholder="如: dashboard、users、settings/users"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">图标</label>
            <input
              type="text"
              value={values.icon}
              onChange={(e) => setValues((v) => ({ ...v, icon: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="可选，如: Dashboard、Users"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">排序号</label>
            <input
              type="number"
              value={values.sort}
              onChange={(e) => setValues((v) => ({ ...v, sort: Number(e.target.value) }))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="menu-enabled"
              checked={values.enabled}
              onChange={(e) => setValues((v) => ({ ...v, enabled: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="menu-enabled" className="text-sm">启用</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function MenuList() {
  const { appId } = useParams<{ appId: string }>()
  const navigate = useNavigate()
  const { apps, currentAppMenus, loading, error, fetchApps, fetchMenus, createMenu, updateMenu, deleteMenu } = useAppStore()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  useEffect(() => {
    if (appId) {
      fetchMenus(appId)
    }
  }, [appId, fetchMenus])

  const currentApp = apps.find((a) => a.id === appId)

  // Build tree structure for display
  const topLevelMenus = currentAppMenus.filter((m) => m.parentId === null)
  const getChildren = (parentId: string) => currentAppMenus.filter((m) => m.parentId === parentId)

  const handleSubmit = async (values: MenuFormValues) => {
    if (!appId) return
    setSubmitting(true)
    try {
      if (editTarget) {
        await updateMenu(editTarget.id, values)
      } else {
        await createMenu({
          ...values,
          appId,
          parentId: parentId ?? null,
        })
      }
      setFormOpen(false)
      setEditTarget(null)
      setParentId(null)
      fetchMenus(appId)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (menu: MenuItem) => {
    setEditTarget(menu)
    setParentId(menu.parentId)
    setFormOpen(true)
  }

  const handleAddChild = (parentMenuId: string) => {
    setEditTarget(null)
    setParentId(parentMenuId)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget || !appId) return
    setDeleting(true)
    try {
      await deleteMenu(deleteTarget.id)
      setDeleteTarget(null)
      fetchMenus(appId)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/platform/apps')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← 返回
          </button>
          <h2 className="text-2xl font-bold">
            {currentApp?.name ?? '菜单管理'}
            <span className="text-sm font-normal text-gray-500 ml-2">菜单列表</span>
          </h2>
        </div>
        {appId && (
          <button
            onClick={() => { setEditTarget(null); setParentId(null); setFormOpen(true) }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            新建菜单
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {!appId ? (
        <div className="text-gray-500 p-8 text-center">请从应用管理进入菜单管理</div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">菜单名称</th>
                <th className="px-4 py-2 text-left">路由路径</th>
                <th className="px-4 py-2 text-left">图标</th>
                <th className="px-4 py-2 text-center">排序</th>
                <th className="px-4 py-2 text-center">状态</th>
                <th className="px-4 py-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading && currentAppMenus.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    加载中...
                  </td>
                </tr>
              )}
              {!loading && currentAppMenus.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    暂无菜单，请点击"新建菜单"添加
                  </td>
                </tr>
              )}
              {topLevelMenus.map((menu) => (
                <>
                  <tr key={menu.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{menu.name}</td>
                    <td className="px-4 py-2 font-mono text-xs">{menu.path}</td>
                    <td className="px-4 py-2 text-gray-500">{menu.icon ?? '-'}</td>
                    <td className="px-4 py-2 text-center">{menu.sort}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          menu.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {menu.enabled ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleAddChild(menu.id)}
                        className="px-2 py-1 text-green-600 hover:underline"
                      >
                        子菜单
                      </button>
                      <button
                        onClick={() => handleEdit(menu)}
                        className="px-2 py-1 text-blue-600 hover:underline"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => setDeleteTarget(menu)}
                        className="px-2 py-1 text-red-600 hover:underline"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                  {getChildren(menu.id).map((child) => (
                    <tr key={child.id} className="border-t bg-gray-50 hover:bg-gray-100">
                      <td className="px-4 py-2 pl-10 text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="text-gray-400">└</span>
                          {child.name}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-gray-500">{child.path}</td>
                      <td className="px-4 py-2 text-gray-400">{child.icon ?? '-'}</td>
                      <td className="px-4 py-2 text-center text-gray-500">{child.sort}</td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            child.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {child.enabled ? '启用' : '禁用'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(child)}
                          className="px-2 py-1 text-blue-600 hover:underline"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => setDeleteTarget(child)}
                          className="px-2 py-1 text-red-600 hover:underline"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MenuFormModal
        open={formOpen}
        mode={editTarget ? 'edit' : 'create'}
        appId={appId ?? ''}
        parentId={parentId}
        initial={editTarget ?? undefined}
        onSubmit={handleSubmit}
        onCancel={() => { setFormOpen(false); setEditTarget(null); setParentId(null) }}
        loading={submitting}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="删除确认"
        message={`确定删除菜单「${deleteTarget?.name ?? ''}」？${getChildren(deleteTarget?.id ?? '').length > 0 ? '其子菜单也将被删除，' : ''}此操作不可撤销。`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default MenuList
