import { useEffect, useState } from "react";
import { useRoleStore } from "./roleStore";
import { RoleFormModal, type RoleFormValues } from "./RoleFormModal";
import { ConfirmModal } from "../../components/ConfirmModal";
import type { Role } from "./types";

export function RoleList() {
  const { list, loading, error, fetchRoles, createRole, updateRole, deleteRole } =
    useRoleStore();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setFormMode("create");
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setFormMode("edit");
    setEditing(role);
    setFormOpen(true);
  };

  const handleSubmit = async (values: RoleFormValues) => {
    setSubmitting(true);
    try {
      if (formMode === "create") {
        await createRole({
          name: values.name,
          permissions: values.permissions,
          menuPermissions: values.menuPermissions,
        });
      } else if (editing) {
        await updateRole(editing.id, {
          name: values.name,
          permissions: values.permissions,
          menuPermissions: values.menuPermissions,
        });
      }
      setFormOpen(false);
      await fetchRoles();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRole(deleteTarget.id);
      setDeleteTarget(null);
      await fetchRoles();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div data-fn="M03.F01.I01" className="space-y-4">
      <span data-fn="M03.F01.I02" style={{ display: "none" }} aria-hidden="true" />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">角色管理</h2>
        <button
          data-fn="M03.F01.I03"
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          新建角色
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
              <th className="px-4 py-2 text-left">角色名称</th>
              <th className="px-4 py-2 text-center">资源权限</th>
              <th className="px-4 py-2 text-center">菜单权限</th>
              <th className="px-4 py-2 text-left">权限列表</th>
              <th className="px-4 py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  加载中...
                </td>
              </tr>
            )}
            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
            {list.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{r.name}</td>
                <td className="px-4 py-2 text-center">{r.permissions.length}</td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs ${
                      (r.menuPermissions ?? []).length > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {(r.menuPermissions ?? []).length}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {r.permissions.slice(0, 4).map((p) => (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-mono"
                      >
                        {p}
                      </span>
                    ))}
                    {r.permissions.length > 4 && (
                      <span className="text-xs text-gray-400">
                        +{r.permissions.length - 4}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    data-fn="M03.F01.I04"
                    onClick={() => openEdit(r)}
                    className="px-2 py-1 text-blue-600 hover:underline"
                  >
                    编辑
                  </button>
                  <button
                    data-fn="M03.F01.I05"
                    onClick={() => setDeleteTarget(r)}
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

      <RoleFormModal
        open={formOpen}
        mode={formMode}
        initialValues={editing ?? undefined}
        onSubmit={handleSubmit}
        onCancel={() => setFormOpen(false)}
        loading={submitting}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="删除确认"
        message={`确定删除角色「${deleteTarget?.name ?? ""}」？此操作不可撤销。`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default RoleList;
