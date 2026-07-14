import { useEffect, useState } from 'react'
import { useOrgStore } from './orgStore'
import { ConfirmModal } from '../../components/ConfirmModal'
import type { OrgNode } from '../../types/user'

interface TreeNodeProps {
  node: OrgNode
  depth: number
  expandedSet: Set<string>
  onToggle: (id: string) => void
  onAddChild: (parentId: string) => void
  onEdit: (node: OrgNode) => void
  onDelete: (node: OrgNode) => void
  onSelect?: (node: OrgNode) => void
}

function TreeNode({ node, depth, expandedSet, onToggle, onAddChild, onEdit, onDelete, onSelect }: TreeNodeProps) {
  const hasChildren = !!node.children?.length
  const isExpanded = expandedSet.has(node.id)

  const handleClick = () => {
    if (hasChildren) onToggle(node.id)
    onSelect?.(node)
  }

  return (
    <li data-org-node={node.id} className="select-none">
      <div
        className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer group"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {hasChildren ? (
          <span
            data-expand-icon
            className="text-gray-400 text-xs w-3 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onToggle(node.id) }}
          >
            {isExpanded ? '▼' : '▶'}
          </span>
        ) : (
          <span className="w-3" />
        )}
        <span
          className="flex-1 text-sm cursor-pointer"
          onClick={handleClick}
        >
          {node.name}
        </span>
        <span className="hidden group-hover:inline-flex gap-1 text-xs">
          <button
            onClick={(e) => { e.stopPropagation(); onAddChild(node.id) }}
            className="px-1 text-green-600 hover:underline"
            title="添加子部门"
          >
            +子部门
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(node) }}
            className="px-1 text-blue-600 hover:underline"
            title="编辑"
          >
            编辑
          </button>
          {node.id !== 'org-root' && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(node) }}
              className="px-1 text-red-600 hover:underline"
              title="删除"
            >
              删除
            </button>
          )}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <ul>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedSet={expandedSet}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

interface OrgFormValues {
  name: string
}

interface OrgFormModalProps {
  open: boolean
  title: string
  initialName?: string
  onSubmit: (values: OrgFormValues) => void
  onCancel: () => void
  loading?: boolean
}

function OrgFormModal({ open, title, initialName = '', onSubmit, onCancel, loading }: OrgFormModalProps) {
  const [name, setName] = useState(initialName)

  useEffect(() => {
    if (open) setName(initialName)
  }, [open, initialName])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (name.trim()) onSubmit({ name: name.trim() })
        }}
        className="bg-white rounded-lg shadow-xl w-[400px]"
      >
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <label className="block text-sm font-medium mb-1">部门名称</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="px-6 py-3 flex justify-end gap-2 border-t">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded border border-gray-300">
            取消
          </button>
          <button type="submit" disabled={loading || !name.trim()} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}

interface OrgTreeProps {
  onSelect?: (node: OrgNode) => void
}

export function OrgTree({ onSelect }: OrgTreeProps = {}) {
  const { tree, loading, error, fetchOrgTree, createOrgNode, updateOrgNode, deleteOrgNode } = useOrgStore()

  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set(['org-root']))
  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('新增部门')
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formParentId, setFormParentId] = useState<string | null>(null)
  const [formNodeId, setFormNodeId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OrgNode | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchOrgTree() }, [fetchOrgTree])

  // 初始化展开状态（根 + 一级）
  useEffect(() => {
    if (!tree) return
    const initial = new Set<string>(['org-root'])
    tree.children?.forEach((c) => initial.add(c.id))
    setExpandedSet(initial)
  }, [tree])

  const toggleExpand = (id: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openCreate = (parentId: string) => {
    setFormMode('create')
    setFormParentId(parentId)
    setFormNodeId(null)
    setFormName('')
    setFormTitle('新增子部门')
    setFormOpen(true)
  }

  const openEdit = (node: OrgNode) => {
    setFormMode('edit')
    setFormNodeId(node.id)
    setFormParentId(null)
    setFormName(node.name)
    setFormTitle('编辑部门')
    setFormOpen(true)
  }

  const handleFormSubmit = async (values: OrgFormValues) => {
    setSubmitting(true)
    try {
      if (formMode === 'create' && formParentId) {
        await createOrgNode(values.name, formParentId)
      } else if (formMode === 'edit' && formNodeId) {
        await updateOrgNode(formNodeId, values.name)
      }
      setFormOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteOrgNode(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading && !tree) {
    return <div className="text-gray-400 text-sm p-4">加载组织架构...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">组织管理</h2>
        <button
          onClick={() => openCreate('org-root')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          新增根部门
        </button>
      </div>

      {error && (
        <div role="alert" className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        {tree ? (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">组织架构</h3>
            <ul>
              <TreeNode
                node={tree}
                depth={0}
                expandedSet={expandedSet}
                onToggle={toggleExpand}
                onAddChild={openCreate}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onSelect={onSelect}
              />
            </ul>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">暂无组织数据</div>
        )}
      </div>

      <OrgFormModal
        open={formOpen}
        title={formTitle}
        initialName={formName}
        onSubmit={handleFormSubmit}
        onCancel={() => setFormOpen(false)}
        loading={submitting}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="删除确认"
        message={
          deleteTarget
            ? `确定删除部门「${deleteTarget.name}」？${deleteTarget.children?.length ? '该部门有子部门，将一并删除。' : ''}此操作不可撤销。`
            : ''
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default OrgTree
