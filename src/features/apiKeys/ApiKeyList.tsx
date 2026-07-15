import { useEffect, useState } from "react";
import { useApiKeyStore } from "./apiKeyStore";
import { ConfirmModal } from "../../components/ConfirmModal";
import type { ApiKey } from "../../types/security";

interface FormModalProps {
  open: boolean;
  initial?: ApiKey;
  onSubmit: (v: Partial<ApiKey>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}
function FormModal({ open, initial, onSubmit, onCancel, loading }: FormModalProps) {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setScopes(initial?.scopes?.join(", ") ?? "read, write");
      setExpiresAt(initial?.expiresAt ?? "");
      setEnabled(initial?.enabled ?? true);
    }
  }, [open, initial]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[440px] p-6">
        <h3 className="text-lg font-bold mb-4">新建 API Key</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">名称 *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Scopes（逗号分隔）</label>
            <input
              value={scopes}
              onChange={(e) => setScopes(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm font-mono text-xs"
              placeholder="read, write"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">过期时间</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ak-enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="ak-enabled" className="text-sm">
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
                name,
                scopes: scopes
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                expiresAt: expiresAt || undefined,
                enabled,
              })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "创建中..." : "创建"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ApiKeyList() {
  const { list, loading, error, fetchApiKeys, createApiKey, updateApiKey, deleteApiKey } =
    useApiKeyStore();
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleSubmit = async (values: Partial<ApiKey>) => {
    setSubmitting(true);
    try {
      await createApiKey(values);
      setFormOpen(false);
      fetchApiKeys();
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteApiKey(deleteTarget.id);
      setDeleteTarget(null);
      fetchApiKeys();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div data-fn="M04.F02.I01" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">API Key 管理</h2>
        <button
          data-fn="M04.F02.I02"
          onClick={() => setFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          新建 API Key
        </button>
      </div>
      {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">名称</th>
              <th className="px-4 py-2 text-left">密钥前缀</th>
              <th className="px-4 py-2 text-left">Scopes</th>
              <th className="px-4 py-2 text-left">最后使用</th>
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
            {list.map((k) => (
              <tr key={k.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{k.name}</td>
                <td className="px-4 py-2 font-mono text-xs">{k.keyPrefix}***</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {k.scopes.map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2 text-xs text-gray-400">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs ${k.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}
                  >
                    {k.enabled ? "启用" : "禁用"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    data-fn="M04.F02.I03"
                    onClick={() => updateApiKey(k.id, { enabled: !k.enabled })}
                    className="px-2 py-1 text-blue-600 hover:underline"
                  >
                    {k.enabled ? "禁用" : "启用"}
                  </button>
                  <button
                    data-fn="M04.F02.I04"
                    onClick={() => setDeleteTarget(k)}
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
        initial={undefined}
        onSubmit={handleSubmit}
        onCancel={() => setFormOpen(false)}
        loading={submitting}
      />
      <ConfirmModal
        open={deleteTarget !== null}
        title="删除确认"
        message={`确定删除 API Key「${deleteTarget?.name ?? ""}」？此操作不可撤销。`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
export default ApiKeyList;
