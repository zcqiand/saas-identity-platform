import { useEffect, useState } from 'react'
import { apiClient } from '../../api/client'
import type { OrgNode } from '../../types/user'

interface OrgTreeProps {
  onSelect?: (node: OrgNode) => void
}

/** 递归渲染单个组织节点 */
function TreeNode({
  node,
  depth,
  expandedSet,
  toggleExpand,
  onSelect,
}: {
  node: OrgNode
  depth: number
  expandedSet: Set<string>
  toggleExpand: (id: string) => void
  onSelect?: (node: OrgNode) => void
}) {
  const hasChildren = !!node.children?.length
  const isExpanded = expandedSet.has(node.id)

  const handleClick = () => {
    if (hasChildren) {
      toggleExpand(node.id)
    }
    onSelect?.(node)
  }

  return (
    <li data-org-node={node.id} className="select-none">
      <div
        className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <span data-expand-icon className="text-gray-400 text-xs w-3">
            {isExpanded ? '▼' : '▶'}
          </span>
        ) : (
          <span className="w-3" />
        )}
        <span className="text-sm">{node.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <ul>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedSet={expandedSet}
              toggleExpand={toggleExpand}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function OrgTree({ onSelect }: OrgTreeProps) {
  const [tree, setTree] = useState<OrgNode | null>(null)
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set(['org-root']))

  useEffect(() => {
    apiClient.get<OrgNode>('/orgs').then((res) => {
      setTree(res.data)
      // 默认展开根节点 + 一级子节点
      const initial = new Set<string>(['org-root'])
      if (res.data.children) {
        for (const child of res.data.children) {
          initial.add(child.id)
        }
      }
      setExpandedSet(initial)
    })
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (!tree) {
    return (
      <div className="text-gray-400 text-sm p-4">加载组织架构...</div>
    )
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">组织架构</h3>
      <ul>
        <TreeNode
          node={tree}
          depth={0}
          expandedSet={expandedSet}
          toggleExpand={toggleExpand}
          onSelect={onSelect}
        />
      </ul>
    </div>
  )
}

export default OrgTree
