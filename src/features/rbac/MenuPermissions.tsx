import { useEffect, useState, useCallback } from 'react'
import { useRoleStore } from './roleStore'
import { useAppStore } from '../apps/appStore'
import type { MenuPermission } from './types'

export function MenuPermissions() {
  const { list: roles, error, fetchRoles, updateRole } = useRoleStore()
  const { apps, currentAppMenus, fetchApps, fetchMenus } = useAppStore()

  const [selectedAppId, setSelectedAppId] = useState<string>('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [saving, setSaving] = useState(false)

  // Local permission state: roleId -> menuId -> actions[]
  const [permMap, setPermMap] = useState<Record<string, Record<string, string[]>>>({})

  useEffect(() => {
    fetchRoles()
    fetchApps()
  }, [fetchRoles, fetchApps])

  useEffect(() => {
    if (selectedAppId) {
      fetchMenus(selectedAppId)
    }
  }, [selectedAppId, fetchMenus])

  // Initialize permMap from roles when roles first load
  useEffect(() => {
    if (roles.length > 0) {
      setPermMap((prev) => {
        const next = { ...prev }
        for (const role of roles) {
          if (!next[role.id]) {
            next[role.id] = {}
            for (const mp of role.menuPermissions ?? []) {
              next[role.id][mp.menuId] = [...mp.actions]
            }
          }
        }
        return next
      })
    }
  }, [roles])  

  // When app changes, clear permMap entries for current role so stale menuIds don't persist
  useEffect(() => {
    if (selectedAppId && selectedRoleId) {
      setPermMap((prev) => {
        const rolePerms = { ...(prev[selectedRoleId] ?? {}) }
        // Keep only menuIds that exist in the new app
        const appMenuIds = new Set(currentAppMenus.map((m) => m.id))
        for (const menuId of Object.keys(rolePerms)) {
          if (!appMenuIds.has(menuId)) {
            delete rolePerms[menuId]
          }
        }
        return { ...prev, [selectedRoleId]: rolePerms }
      })
    }
  }, [selectedAppId, selectedRoleId, currentAppMenus])  

  // Helper: get child menu IDs for a given parent
  const getChildren = useCallback(
    (parentId: string) => currentAppMenus.filter((m) => m.parentId === parentId),
    [currentAppMenus],
  )

  // Helper: collect all descendant menu IDs (recursive)
  const getAllDescendants = useCallback(
    (parentId: string): string[] => {
      const children = getChildren(parentId)
      return children.flatMap((c) => [c.id, ...getAllDescendants(c.id)])
    },
    [getChildren],
  )

  const topMenus = currentAppMenus.filter((m) => m.parentId === null)

  const toggleAction = (roleId: string, menuId: string, action: string) => {
    setPermMap((prev) => {
      const rolePerms = { ...(prev[roleId] ?? {}), [menuId]: [...(prev[roleId]?.[menuId] ?? [])] }
      const menuPerms = rolePerms[menuId]
      rolePerms[menuId] = menuPerms.includes(action)
        ? menuPerms.filter((a) => a !== action)
        : [...menuPerms, action]
      return { ...prev, [roleId]: rolePerms }
    })
  }

  const isActionChecked = (roleId: string, menuId: string, action: string) => {
    return permMap[roleId]?.[menuId]?.includes(action) ?? false
  }

  const isMenuIndeterminate = (roleId: string, menuId: string) => {
    const actions = permMap[roleId]?.[menuId] ?? []
    return actions.length > 0 && actions.length < 4
  }

  const isMenuAllChecked = (roleId: string, menuId: string) => {
    const actions = permMap[roleId]?.[menuId] ?? []
    return actions.length === 4
  }

  const toggleMenuAll = (roleId: string, menuId: string) => {
    const allActions = ['view', 'create', 'update', 'delete'] as const
    const current = permMap[roleId]?.[menuId] ?? []
    const willCheck = current.length !== 4 // if not all checked, we will check all

    setPermMap((prev) => {
      const rolePerms = { ...(prev[roleId] ?? {}) }
      if (willCheck) {
        // Check this menu + all descendants
        const descendants = getAllDescendants(menuId)
        for (const mid of [menuId, ...descendants]) {
          rolePerms[mid] = [...allActions]
        }
      } else {
        // Uncheck this menu + all descendants
        const descendants = getAllDescendants(menuId)
        for (const mid of [menuId, ...descendants]) {
          rolePerms[mid] = []
        }
      }
      return { ...prev, [roleId]: rolePerms }
    })
  }

  const handleSave = async () => {
    if (!selectedRoleId) return
    setSaving(true)
    try {
      const menuPermissions: MenuPermission[] = []
      for (const menu of currentAppMenus) {
        const actions = permMap[selectedRoleId]?.[menu.id]
        if (actions && actions.length > 0) {
          menuPermissions.push({ menuId: menu.id, actions: actions as MenuPermission['actions'] })
        }
      }
      await updateRole(selectedRoleId, { menuPermissions })
      await fetchRoles()
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = selectedRoleId && currentAppMenus.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">菜单权限</h2>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存修改'}
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* 选择器 */}
      <div className="flex items-center gap-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block text-sm font-medium mb-1">选择应用</label>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm min-w-[200px]"
          >
            <option value="">请选择应用</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">选择角色</label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm min-w-[150px]"
          >
            <option value="">请选择角色</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedAppId && !selectedRoleId && (
        <div className="text-gray-400 text-center py-12">请先选择应用和角色</div>
      )}

      {selectedAppId && selectedRoleId && currentAppMenus.length === 0 && (
        <div className="text-gray-400 text-center py-12">该应用暂无菜单</div>
      )}

      {selectedAppId && selectedRoleId && currentAppMenus.length > 0 && (
        <div className="bg-white rounded shadow overflow-auto">
          <table className="text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left w-48">菜单</th>
                <th className="px-4 py-2 text-center w-16">全选</th>
                {roles
                  .filter((r) => r.id === selectedRoleId)
                  .map((r) => (
                    <th key={r.id} colSpan={5} className="px-2 py-2 text-center border-l border-gray-200">
                      {r.name}
                    </th>
                  ))}
              </tr>
              <tr className="text-xs text-gray-500 bg-gray-100">
                <th className="px-4 py-1 text-left" />
                <th className="px-4 py-1 text-center border-l border-gray-200">☑</th>
                {roles
                  .filter((r) => r.id === selectedRoleId)
                  .map((r) =>
                    ['查', '建', '改', '删'].map((l, i) => (
                      <th key={`${r.id}-${i}`} className="px-2 py-1 text-center w-10">
                        {l}
                      </th>
                    )),
                  )}
              </tr>
            </thead>
            <tbody>
              {topMenus.map((menu) => (
                <MenuPermRow
                  key={menu.id}
                  menu={menu}
                  getChildren={getChildren}
                  selectedRoleId={selectedRoleId}
                  isActionChecked={isActionChecked}
                  isMenuAllChecked={isMenuAllChecked}
                  isMenuIndeterminate={isMenuIndeterminate}
                  toggleMenuAll={toggleMenuAll}
                  toggleAction={toggleAction}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

interface MenuPermRowProps {
  menu: { id: string; name: string; path: string; parentId: string | null }
  getChildren: (parentId: string) => { id: string; name: string; path: string; parentId: string | null }[]
  selectedRoleId: string
  isActionChecked: (roleId: string, menuId: string, action: string) => boolean
  isMenuAllChecked: (roleId: string, menuId: string) => boolean
  isMenuIndeterminate: (roleId: string, menuId: string) => boolean
  toggleMenuAll: (roleId: string, menuId: string) => void
  toggleAction: (roleId: string, menuId: string, action: string) => void
}

function MenuPermRow({
  menu,
  getChildren,
  selectedRoleId,
  isActionChecked,
  isMenuAllChecked,
  isMenuIndeterminate,
  toggleMenuAll,
  toggleAction,
}: MenuPermRowProps) {
  const children = getChildren(menu.id)
  const actions: string[] = ['view', 'create', 'update', 'delete']
  const allChecked = isMenuAllChecked(selectedRoleId, menu.id)
  const indeterminate = isMenuIndeterminate(selectedRoleId, menu.id)

  return (
    <>
      <tr className="border-t bg-white hover:bg-gray-50">
        <td className="px-4 py-2 font-medium">
          <div className="flex items-center gap-1">
            {children.length > 0 && (
              <span className="text-gray-400 mr-1">▶</span>
            )}
            {menu.name}
          </div>
        </td>
        <td className="px-4 py-2 text-center">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => {
              if (el) el.indeterminate = indeterminate
            }}
            onChange={() => toggleMenuAll(selectedRoleId, menu.id)}
            className="rounded"
          />
        </td>
        {actions.map((action) => (
          <td key={action} className="px-2 py-2 text-center">
            <input
              type="checkbox"
              checked={isActionChecked(selectedRoleId, menu.id, action)}
              onChange={() => toggleAction(selectedRoleId, menu.id, action)}
              className="rounded"
            />
          </td>
        ))}
      </tr>
      {children.map((child) => (
        <tr key={child.id} className="border-t bg-gray-50 hover:bg-gray-100">
          <td className="px-4 py-2 pl-10 text-gray-600 text-sm">
            <span className="flex items-center gap-1">
              <span className="text-gray-400">└</span>
              {child.name}
            </span>
          </td>
          <td className="px-4 py-2 text-center">
            <input
              type="checkbox"
              checked={isMenuAllChecked(selectedRoleId, child.id)}
              ref={(el) => {
                if (el) el.indeterminate = isMenuIndeterminate(selectedRoleId, child.id)
              }}
              onChange={() => toggleMenuAll(selectedRoleId, child.id)}
              className="rounded"
            />
          </td>
          {actions.map((action) => (
            <td key={action} className="px-2 py-2 text-center">
              <input
                type="checkbox"
                checked={isActionChecked(selectedRoleId, child.id, action)}
                onChange={() => toggleAction(selectedRoleId, child.id, action)}
                className="rounded"
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default MenuPermissions
