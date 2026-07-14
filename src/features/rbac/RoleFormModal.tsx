import { useEffect, useState, type FormEvent } from 'react'
import type { RoleCreateInput, MenuPermission } from './types'
import { ALL_PERMISSIONS } from './types'
import { useAppStore } from '../apps/appStore'

export interface RoleFormValues {
  name: string
  permissions: string[]
  menuPermissions: MenuPermission[]
}

interface RoleFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: Partial<RoleCreateInput & { id: string; menuPermissions: MenuPermission[] }>
  onSubmit: (values: RoleFormValues) => void
  onCancel: () => void
  loading?: boolean
}

export function RoleFormModal({
  open,
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: RoleFormModalProps) {
  const [name, setName] = useState('')
  const [permissions, setPermissions] = useState<string[]>([])
  const [menuAppId, setMenuAppId] = useState<string>('')
  const [checkedMenus, setCheckedMenus] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { apps, currentAppMenus, fetchApps, fetchMenus } = useAppStore()

  useEffect(() => {
    if (open) {
      setName(initialValues?.name ?? '')
      setPermissions(initialValues?.permissions ?? [])
      setMenuAppId('')
      setCheckedMenus(new Set())
      setErrors({})
      fetchApps()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues])

  useEffect(() => {
    if (menuAppId) {
      fetchMenus(menuAppId)
    }
  }, [menuAppId, fetchMenus])

  // Sync checkedMenus when initialValues changes (edit mode)
  useEffect(() => {
    if (open && mode === 'edit' && initialValues?.menuPermissions) {
      const checked = new Set<string>()
      for (const mp of initialValues.menuPermissions) {
        if (mp.actions.length > 0) {
          checked.add(mp.menuId)
        }
      }
      setCheckedMenus(checked)
    }
  }, [open, mode, initialValues])  

  if (!open) return null

  const title = mode === 'create' ? '新建角色' : '编辑角色'

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = '请输入角色名称'
    if (permissions.length === 0) next.permissions = '请至少选择一个权限'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const menuPermissions: MenuPermission[] = []
    for (const menuId of checkedMenus) {
      menuPermissions.push({ menuId, actions: ['view', 'create', 'update', 'delete'] })
    }
    onSubmit({ name: name.trim(), permissions, menuPermissions })
  }

  const togglePermission = (p: string) => {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => p !== x) : [...prev, p],
    )
  }

  const toggleMenu = (menuId: string) => {
    setCheckedMenus((prev) => {
      const next = new Set(prev)
      if (next.has(menuId)) {
        next.delete(menuId)
      } else {
        next.add(menuId)
      }
      return next
    })
  }

  const topMenus = currentAppMenus.filter((m) => m.parentId === null)
  const getChildren = (parentId: string) => currentAppMenus.filter((m) => m.parentId === parentId)

  const isMenuChecked = (menuId: string) => checkedMenus.has(menuId)

  const toggleMenuAll = (menuId: string) => {
    setCheckedMenus((prev) => {
      const next = new Set(prev)
      const descendants = getAllDescendantIds(menuId, currentAppMenus)
      const allIds = [menuId, ...descendants]
      const allChecked = allIds.every((id) => prev.has(id))
      if (allChecked) {
        for (const id of allIds) next.delete(id)
      } else {
        for (const id of allIds) next.add(id)
      }
      return next
    })
  }

  const isMenuAllChecked = (menuId: string) => {
    const descendants = getAllDescendantIds(menuId, currentAppMenus)
    return [menuId, ...descendants].every((id) => checkedMenus.has(id))
  }

  const isMenuIndeterminate = (menuId: string) => {
    const descendants = getAllDescendantIds(menuId, currentAppMenus)
    const allIds = [menuId, ...descendants]
    const checkedCount = allIds.filter((id) => checkedMenus.has(id)).length
    return checkedCount > 0 && checkedCount < allIds.length
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl w-[640px] max-w-[95vw] max-h-[90vh] flex flex-col"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          {/* 角色名称 */}
          <div>
            <label htmlFor="role-name" className="block text-sm mb-1 font-medium">
              角色名称
            </label>
            <input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* 资源权限 */}
          <div>
            <label className="block text-sm mb-2 font-medium">资源权限</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={permissions.includes(p)}
                    onChange={() => togglePermission(p)}
                    className="rounded"
                  />
                  <span className="font-mono text-xs text-gray-700">{p}</span>
                </label>
              ))}
            </div>
            {errors.permissions && (
              <p className="text-red-600 text-xs mt-1">{errors.permissions}</p>
            )}
          </div>

          {/* 菜单权限 */}
          <div>
            <label className="block text-sm mb-2 font-medium">菜单权限</label>
            {apps.length === 0 ? (
              <p className="text-xs text-gray-400">暂无可用应用，请先在平台创建应用</p>
            ) : (
              <>
                <select
                  value={menuAppId}
                  onChange={(e) => setMenuAppId(e.target.value)}
                  className="border rounded px-3 py-1.5 text-sm w-full mb-2"
                >
                  <option value="">选择应用以配置菜单权限</option>
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>

                {menuAppId && currentAppMenus.length === 0 && (
                  <p className="text-xs text-gray-400 py-2">该应用暂无菜单</p>
                )}

                {menuAppId && currentAppMenus.length > 0 && (
                  <div className="border rounded p-2 max-h-48 overflow-y-auto bg-gray-50">
                    <table className="w-full text-sm">
                      <tbody>
                        {topMenus.map((menu) => (
                          <MenuPermEditRow
                            key={menu.id}
                            menu={menu}
                            getChildren={getChildren}
                            isMenuChecked={isMenuChecked}
                            isMenuAllChecked={isMenuAllChecked}
                            isMenuIndeterminate={isMenuIndeterminate}
                            toggleMenu={toggleMenu}
                            toggleMenuAll={toggleMenuAll}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {menuAppId && checkedMenus.size > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    已选 {checkedMenus.size} 个菜单（包含子菜单）
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="px-6 py-3 flex justify-end gap-2 border-t border-gray-200 flex-shrink-0">
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

function getAllDescendantIds(
  parentId: string,
  allMenus: { id: string; parentId: string | null }[],
): string[] {
  const children = allMenus.filter((m) => m.parentId === parentId)
  return children.flatMap((c) => [c.id, ...getAllDescendantIds(c.id, allMenus)])
}

interface MenuPermEditRowProps {
  menu: { id: string; name: string; parentId: string | null }
  getChildren: (parentId: string) => { id: string; name: string; parentId: string | null }[]
  isMenuChecked: (menuId: string) => boolean
  isMenuAllChecked: (menuId: string) => boolean
  isMenuIndeterminate: (menuId: string) => boolean
  toggleMenu: (menuId: string) => void
  toggleMenuAll: (menuId: string) => void
}

function MenuPermEditRow({
  menu,
  getChildren,
  isMenuChecked,
  isMenuAllChecked,
  isMenuIndeterminate,
  toggleMenu,
  toggleMenuAll,
}: MenuPermEditRowProps) {
  const children = getChildren(menu.id)
  const allChecked = isMenuAllChecked(menu.id)
  const indeterminate = isMenuIndeterminate(menu.id)

  return (
    <>
      <tr>
        <td className="py-1 flex items-center gap-2">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => { if (el) el.indeterminate = indeterminate }}
            onChange={() => toggleMenuAll(menu.id)}
            className="rounded"
          />
          <span className={`text-sm ${children.length > 0 ? 'font-medium' : 'text-gray-700'}`}>
            {menu.name}
          </span>
        </td>
      </tr>
      {children.map((child) => (
        <tr key={child.id}>
          <td className="py-1 pl-8 flex items-center gap-2">
            <input
              type="checkbox"
              checked={isMenuChecked(child.id)}
              onChange={() => toggleMenu(child.id)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">{child.name}</span>
          </td>
        </tr>
      ))}
    </>
  )
}

export default RoleFormModal
