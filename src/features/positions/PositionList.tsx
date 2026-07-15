import { useEffect, useState } from "react";
import { usePositionStore } from "./positionStore";
import { ConfirmModal } from "../../components/ConfirmModal";
import type { Position } from "../../types/position";

interface FormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: Position;
  onSubmit: (v: Position) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

function FormModal({ open, mode, initial, onSubmit, onCancel, loading }: FormModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [sort, setSort] = useState(99);
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setCode(initial?.code ?? "");
      setDesc(initial?.description ?? "");
      setSort(initial?.sort ?? 99);
      setEnabled(initial?.enabled ?? true);
    }
  }, [open, initial]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[440px] p-6">
        <h3 className="text-lg font-bold mb-4">
          {mode === "create" ? "新建岗位" : "编辑岗位"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">岗位名称 *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">岗位编码 *</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              disabled={mode === "edit"}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">描述</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">排序号</label>
            <input
              type="number"
              value={sort}
              onChange={(e) => setSort(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pos-enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="pos-enabled" className="text-sm">
              启用
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded text-sm"
            disabled={loading}
          >
            取消
          </button>
          <button
            onClick={() =>
              onSubmit({
                id: initial?.id ?? "",
                name,
                code,
                description: desc,
                sort,
                enabled,
                createdAt: initial?.createdAt ?? "",
                updatedAt: "",
              })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PositionList() {
  const {
    list,
    loading,
    error,
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition,
  } = usePositionStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Position | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const handleSubmit = async (values: Position) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        await updatePosition(editTarget.id, values);
      } else {
        await createPosition(values);
      }
      setFormOpen(false);
      setEditTarget(null);
      fetchPositions();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePosition(deleteTarget.id);
      setDeleteTarget(null);
      fetchPositions();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div data-fn="M02.F03.I01" className="space-y-4">
      <span data-fn="M02.F03.I02" style={{ display: "none" }} aria-hidden="true" />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">岗位管理</h2>
        <button
          data-fn="M02.F03.I03"
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          新建岗位
        </button>
      </div>
      {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">岗位名称</th>
              <th className="px-4 py-2 text-left">编码</th>
              <th className="px-4 py-2 text-left">描述</th>
              <th className="px-4 py-2 text-center">排序</th>
              <th className="px-4 py-2 text-center">状态</th>
              <th className="px-4 py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  加载中...
                </td>
              </tr>
            )}
            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
            {list.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 font-mono text-xs">{p.code}</td>
                <td className="px-4 py-2 text-gray-500">{p.description ?? "-"}</td>
                <td className="px-4 py-2 text-center">{p.sort}</td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs ${p.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}
                  >
                    {p.enabled ? "启用" : "禁用"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    data-fn="M02.F03.I04"
                    onClick={() => {
                      setEditTarget(p);
                      setFormOpen(true);
                    }}
                    className="px-2 py-1 text-blue-600 hover:underline"
                  >
                    编辑
                  </button>
                  <button
                    data-fn="M02.F03.I05"
                    onClick={() => setDeleteTarget(p)}
                    className="px-2 py-1 text-red-600 hover:underline"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FormModal
        open={formOpen}
        mode={editTarget ? "edit" : "create"}
        initial={editTarget ?? undefined}
        onSubmit={handleSubmit}
        onCancel={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        loading={submitting}
      />
      <ConfirmModal
        open={deleteTarget !== null}
        title="删除确认"
        message={`确定删除岗位「${deleteTarget?.name ?? ""}」？`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default PositionList;
