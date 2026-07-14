import { useEffect, useState, type FormEvent } from 'react'
import type { User, UserRole, UserStatus, OrgNode } from '../../types/user'

export interface UserFormValues {
  id?: string
  username: string
  displayName: string
  email: string
  orgId: string
  roles: UserRole[]
  status: UserStatus
}

interface UserFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: Partial<User>
  /** 组织树数据，用于渲染 orgId 下拉选项；不提供时降级为文本框 */
  orgTree?: OrgNode
  onSubmit: (values: UserFormValues) => void
  onCancel: () => void
  loading?: boolean
}

/** 将组织树扁平化为 {id, name, depth} 列表 */
function flattenTree(node: OrgNode, depth = 0): Array<{ id: string; name: string; depth: number }> {
  const result = [{ id: node.id, name: node.name, depth }]
  if (node.children) {
    for (const child of node.children) {
      result.push(...flattenTree(child, depth + 1))
    }
  }
  return result
}

/** 用户表单弹窗：create/edit 复用，orgId 有下拉（orgTree）和文本（fallback）两种模式 */
export function UserFormModal({
  open,
  mode,
  initialValues,
  orgTree,
  onSubmit,
  onCancel,
  loading = false,
}: UserFormModalProps) {
  const [username, setUsername] = useState(initialValues?.username ?? '')
  const [displayName, setDisplayName] = useState(initialValues?.displayName ?? '')
  const [email, setEmail] = useState(initialValues?.email ?? '')
  const [orgId, setOrgId] = useState(initialValues?.orgId ?? '')
  const [roles, setRoles] = useState<UserRole[]>(
    (initialValues?.roles as UserRole[]) ?? ['member'],
  )
  const [status, setStatus] = useState<UserStatus>(initialValues?.status ?? 'active')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setUsername(initialValues?.username ?? '')
      setDisplayName(initialValues?.displayName ?? '')
      setEmail(initialValues?.email ?? '')
      setOrgId(initialValues?.orgId ?? '')
      setRoles((initialValues?.roles as UserRole[]) ?? ['member'])
      setStatus(initialValues?.status ?? 'active')
      setErrors({})
    }
     
  }, [open, initialValues])

  if (!open) return null

  const title = mode === 'create' ? '新建用户' : '编辑用户'

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!username.trim()) next.username = '请输入用户名'
    if (!displayName.trim()) next.displayName = '请输入显示名'
    if (!email.trim()) next.email = '请输入邮箱'
    if (!orgId.trim()) next.orgId = '请选择组织'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      ...(mode === 'edit' && initialValues?.id ? { id: initialValues.id } : {}),
      username: username.trim(),
      displayName: displayName.trim(),
      email: email.trim(),
      orgId: orgId.trim(),
      roles,
      status,
    })
  }

  const toggleRole = (role: UserRole) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )
  }

  const orgOptions = orgTree ? flattenTree(orgTree) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-[480px] max-w-[90vw]">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div>
            <label htmlFor="user-username" className="block text-sm mb-1 font-medium">用户名</label>
            <input
              id="user-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={mode === 'edit'}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
          </div>
          <div>
            <label htmlFor="user-display-name" className="block text-sm mb-1 font-medium">显示名</label>
            <input
              id="user-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.displayName && <p className="text-red-600 text-xs mt-1">{errors.displayName}</p>}
          </div>
          <div>
            <label htmlFor="user-email" className="block text-sm mb-1 font-medium">邮箱</label>
            <input
              id="user-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="user-org-id" className="block text-sm mb-1 font-medium">组织</label>
            {orgOptions ? (
              <select
                id="user-org-id"
                value={orgId}
                onChange={(e) => {
                  setOrgId(e.target.value)
                  if (errors.orgId) setErrors((prev) => ({ ...prev, orgId: '' }))
                }}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择组织</option>
                {orgOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {'　'.repeat(opt.depth)}{opt.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="user-org-id"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                placeholder="输入组织 ID"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {errors.orgId && <p className="text-red-600 text-xs mt-1">{errors.orgId}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">角色</label>
            <div className="flex gap-2">
              {(['admin', 'manager', 'member', 'viewer'] as UserRole[]).map((r) => (
                <label key={r} className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={roles.includes(r)} onChange={() => toggleRole(r)} />
                  {r}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">活跃</option>
              <option value="disabled">禁用</option>
              <option value="pending">待激活</option>
            </select>
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

export default UserFormModal
