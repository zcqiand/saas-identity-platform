import { useEffect, useState, type FormEvent } from 'react'

interface OrgNodeFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  /** mode=create 时：新建节点的父节点 id；mode=edit 时：当前节点 id */
  nodeId?: string
  initialName?: string
  onSubmit: (name: string, nodeId?: string) => void
  onCancel: () => void
  loading?: boolean
}

export function OrgNodeFormModal({
  open,
  mode,
  nodeId,
  initialName = '',
  onSubmit,
  onCancel,
  loading = false,
}: OrgNodeFormModalProps) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName(initialName)
      setError('')
    }
     
  }, [open, initialName])

  if (!open) return null

  const title = mode === 'create' ? '新增组织节点' : '编辑组织节点'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('请输入节点名称')
      return
    }
    onSubmit(name.trim(), nodeId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl w-[400px] max-w-[90vw]"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <label htmlFor="org-node-name" className="block text-sm mb-1 font-medium">
            节点名称
          </label>
          <input
            id="org-node-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
            autoFocus
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
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

export default OrgNodeFormModal
