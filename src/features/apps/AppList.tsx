import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "./appStore";
import { ConfirmModal } from "../../components/ConfirmModal";
import type { App } from "../../types/app";

// App form modal component
interface AppFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: Partial<App>;
  onSubmit: (values: AppFormValues) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

interface AppFormValues {
  name: string;
  code: string;
  description: string;
  theme: string;
  sort: number;
  enabled: boolean;
}

function AppFormModal({
  open,
  mode,
  initial,
  onSubmit,
  onCancel,
  loading,
}: AppFormModalProps) {
  const [values, setValues] = useState<AppFormValues>({
    name: initial?.name ?? "",
    code: initial?.code ?? "",
    description: initial?.description ?? "",
    theme: initial?.theme ?? "#6366f1",
    sort: initial?.sort ?? 99,
    enabled: initial?.enabled ?? true,
  });

  useEffect(() => {
    if (open) {
      setValues({
        name: initial?.name ?? "",
        code: initial?.code ?? "",
        description: initial?.description ?? "",
        theme: initial?.theme ?? "#6366f1",
        sort: initial?.sort ?? 99,
        enabled: initial?.enabled ?? true,
      });
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-4">
          {mode === "create" ? "新建应用" : "编辑应用"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">应用名称 *</label>
            <input
              type="text"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">应用编码 *</label>
            <input
              type="text"
              value={values.code}
              onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
              required
              disabled={mode === "edit"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">主题色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={values.theme}
                onChange={(e) => setValues((v) => ({ ...v, theme: e.target.value }))}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={values.theme}
                onChange={(e) => setValues((v) => ({ ...v, theme: e.target.value }))}
                className="flex-1 border rounded px-3 py-2 text-sm font-mono"
              />
            </div>
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
              id="enabled"
              checked={values.enabled}
              onChange={(e) => setValues((v) => ({ ...v, enabled: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="enabled" className="text-sm">
              启用
            </label>
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
              {loading ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AppList() {
  const { apps, loading, error, fetchApps, createApp, updateApp, deleteApp } =
    useAppStore();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<App | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<App | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchApps(keyword.trim() || undefined);
  };

  const handleSubmit = async (values: AppFormValues) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        await updateApp(editTarget.id, values);
      } else {
        await createApp(values);
      }
      setFormOpen(false);
      setEditTarget(null);
      fetchApps(keyword.trim() || undefined);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (app: App) => {
    setEditTarget(app);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteApp(deleteTarget.id);
      setDeleteTarget(null);
      fetchApps(keyword.trim() || undefined);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div data-fn="M04.F01.I01" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">应用管理</h2>
        <button
          data-fn="M04.F01.I03"
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          新建应用
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white p-3 rounded shadow-sm">
        <input
          data-fn="M04.F01.I02"
          placeholder="搜索应用名称/编码/描述"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border rounded px-3 py-1.5 text-sm flex-1"
        />
        <button
          data-fn="M04.F01.I02"
          onClick={handleSearch}
          className="px-4 py-1.5 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
        >
          搜索
        </button>
      </div>

      {error && (
        <div role="alert" className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">应用名称</th>
              <th className="px-4 py-2 text-left">编码</th>
              <th className="px-4 py-2 text-left">描述</th>
              <th className="px-4 py-2 text-left">主题色</th>
              <th className="px-4 py-2 text-center">排序</th>
              <th className="px-4 py-2 text-center">状态</th>
              <th className="px-4 py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && apps.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  加载中...
                </td>
              </tr>
            )}
            {!loading && apps.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
            {apps.map((app) => (
              <tr key={app.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{app.name}</td>
                <td className="px-4 py-2 font-mono text-xs">{app.code}</td>
                <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                  {app.description ?? "-"}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded border"
                      style={{ background: app.theme }}
                    />
                    <span className="text-xs font-mono text-gray-500">{app.theme}</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-center">{app.sort}</td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs ${
                      app.enabled
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {app.enabled ? "启用" : "禁用"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    data-fn="M04.F01.I06"
                    onClick={() => navigate(`/platform/apps/${app.id}/menus`)}
                    className="px-2 py-1 text-green-600 hover:underline"
                  >
                    菜单
                  </button>
                  <button
                    data-fn="M04.F01.I04"
                    onClick={() => handleEdit(app)}
                    className="px-2 py-1 text-blue-600 hover:underline"
                  >
                    编辑
                  </button>
                  <button
                    data-fn="M04.F01.I05"
                    onClick={() => setDeleteTarget(app)}
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

      <AppFormModal
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
        message={`确定删除应用「${deleteTarget?.name ?? ""}」？该应用下的所有菜单也将被删除，此操作不可撤销。`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default AppList;
