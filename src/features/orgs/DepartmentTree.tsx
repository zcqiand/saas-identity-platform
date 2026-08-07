import { useEffect, useState } from "react";
import { useDepartmentStore } from "./departmentStore";
import { ConfirmModal } from "../../components/ConfirmModal";
import type { DepartmentNode } from "../../types/user";
import type { Department as SharedDepartment } from "@saas/identity-platform-shared/schemas";

// Phase 5b：扁平 Department[]（parentId 自引用）。
// 本组件遍历扁平数组，对每个 Department 递归找子节点并就地渲染。
// 数据层 seeds/departments.json 是扁平 DepartmentSchema；React 仓消费时按需
// 递归 transform 为 DepartmentNode 树。

interface TreeNodeProps {
  node: SharedDepartment;
  depth: number;
  expandedSet: Set<string>;
  onToggle: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (node: SharedDepartment) => void;
  onDelete: (node: SharedDepartment) => void;
  onSelect?: (node: SharedDepartment) => void;
  /** 是否根（用于「是否显示删除按钮」） */
  isRoot: boolean;
  /** 全部部门（递归找子节点用） */
  allDepartments: SharedDepartment[];
}

function TreeNode({
  node,
  depth,
  expandedSet,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
  onSelect,
  isRoot,
  allDepartments,
}: TreeNodeProps) {
  const children = allDepartments.filter((d) => d.parentId === node.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedSet.has(node.id);

  const handleClick = () => {
    if (hasChildren) onToggle(node.id);
    onSelect?.(node);
  };

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
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
          >
            {isExpanded ? "▼" : "▶"}
          </span>
        ) : (
          <span className="w-3" />
        )}
        <span className="flex-1 text-sm cursor-pointer" onClick={handleClick}>
          {node.name}
        </span>
        <span className="hidden group-hover:inline-flex gap-1 text-xs">
          <button
            data-fn="M02.F01.I04"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node.id);
            }}
            className="px-1 text-green-600 hover:underline"
            title="添加子部门"
          >
            +子部门
          </button>
          <button
            data-fn="M02.F01.I05"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            className="px-1 text-blue-600 hover:underline"
            title="编辑"
          >
            编辑
          </button>
          {!isRoot && (
            <button
              data-fn="M02.F01.I06"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node);
              }}
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
          {children.map((child) => (
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
              isRoot={false}
              allDepartments={allDepartments}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

interface DepartmentFormValues {
  name: string;
}

interface DepartmentFormModalProps {
  open: boolean;
  title: string;
  initialName?: string;
  onSubmit: (values: DepartmentFormValues) => void;
  onCancel: () => void;
  loading?: boolean;
}

function DepartmentFormModal({
  open,
  title,
  initialName = "",
  onSubmit,
  onCancel,
  loading,
}: DepartmentFormModalProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSubmit({ name: name.trim() });
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
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded border border-gray-300"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface DepartmentTreeProps {
  onSelect?: (node: DepartmentNode) => void;
}

export function DepartmentTree({ onSelect }: DepartmentTreeProps = {}) {
  const {
    tree,
    loading,
    error,
    fetchDepartmentTree,
    createDepartmentNode,
    updateDepartmentNode,
    deleteDepartmentNode,
  } = useDepartmentStore();

  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("新增部门");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formNodeId, setFormNodeId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SharedDepartment | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDepartmentTree();
  }, [fetchDepartmentTree]);

  // 初始化展开（所有根 + 一级子）
  useEffect(() => {
    if (!tree || tree.length === 0) return;
    const initial = new Set<string>();
    for (const d of tree) {
      if (d.parentId === null) initial.add(d.id);
    }
    for (const d of tree) {
      const parentId = d.parentId;
      if (parentId !== null && parentId !== undefined) {
        const root = tree.find((r) => r.id === parentId);
        if (root && root.parentId === null) initial.add(parentId);
      }
    }
    setExpandedSet(initial);
  }, [tree]);

  const toggleExpand = (id: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = (parentId: string) => {
    setFormMode("create");
    setFormParentId(parentId);
    setFormNodeId(null);
    setFormName("");
    setFormTitle("新增子部门");
    setFormOpen(true);
  };

  const openEdit = (node: SharedDepartment) => {
    setFormMode("edit");
    setFormNodeId(node.id);
    setFormParentId(null);
    setFormName(node.name);
    setFormTitle("编辑部门");
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: DepartmentFormValues) => {
    setSubmitting(true);
    try {
      if (formMode === "create" && formParentId) {
        await createDepartmentNode(values.name, formParentId);
      } else if (formMode === "edit" && formNodeId) {
        await updateDepartmentNode(formNodeId, values.name);
      }
      setFormOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDepartmentNode(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // 把 tree 通过 props drilling 传给递归组件
  const allDepartments = tree ?? [];
  const roots = (tree ?? []).filter((d) => d.parentId === null);

  if (loading && (!tree || tree.length === 0)) {
    return <div className="text-gray-400 text-sm p-4">加载组织架构...</div>;
  }

  return (
    <div data-fn="M02.F01.I01" className="space-y-4">
      <span data-fn="M02.F01.I02" style={{ display: "none" }} aria-hidden="true" />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">组织管理</h2>
        {roots.length > 0 && (
          <button
            data-fn="M02.F01.I03"
            onClick={() => openCreate(roots[0].id)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            新增根部门
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        {roots.length > 0 ? (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">组织架构</h3>
            <ul>
              {roots.map((root) => (
                <TreeNode
                  key={root.id}
                  node={root}
                  depth={0}
                  expandedSet={expandedSet}
                  onToggle={toggleExpand}
                  onAddChild={openCreate}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onSelect={onSelect as (node: SharedDepartment) => void}
                  isRoot={true}
                  allDepartments={allDepartments}
                />
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">暂无组织数据</div>
        )}
      </div>

      <DepartmentFormModal
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
            ? `确定删除部门「${deleteTarget.name}」？该部门的子部门将升级为根部门。此操作不可撤销。`
            : ""
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default DepartmentTree;