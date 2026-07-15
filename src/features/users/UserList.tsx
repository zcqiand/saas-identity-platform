import { useEffect, useState } from "react";
import { useUserStore } from "./userStore";
import { useOrgStore } from "../orgs/orgStore";
import { UserFormModal, type UserFormValues } from "./UserFormModal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PermissionGuard } from "../rbac/PermissionGuard";
import type { User, UserRole, UserQuery } from "../../types/user";

const PAGE_SIZE = 10;

export function UserList() {
  const { list, total, loading, error, fetchUsers, createUser, updateUser, deleteUser } =
    useUserStore();
  const { tree: orgTree, fetchOrgTree } = useOrgStore();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const buildQuery = (p: number): UserQuery => ({
    page: p,
    pageSize: PAGE_SIZE,
    keyword: keyword || undefined,
    role: role || undefined,
  });

  useEffect(() => {
    fetchUsers(buildQuery(page));
    fetchOrgTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(buildQuery(1));
  };

  const handleRoleChange = (value: UserRole | "") => {
    setRole(value);
    setPage(1);
    fetchUsers({
      page: 1,
      pageSize: PAGE_SIZE,
      keyword: keyword || undefined,
      role: value || undefined,
    });
  };

  const openCreate = () => {
    setFormMode("create");
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    setFormMode("edit");
    setEditing(user);
    setFormOpen(true);
  };

  const handleSubmit = async (values: UserFormValues) => {
    setSubmitting(true);
    try {
      if (formMode === "create") {
        await createUser({
          username: values.username,
          displayName: values.displayName,
          email: values.email,
          orgId: values.orgId,
          roles: values.roles,
          status: values.status,
        });
      } else if (values.id) {
        await updateUser(values.id, {
          displayName: values.displayName,
          email: values.email,
          orgId: values.orgId,
          roles: values.roles,
          status: values.status,
        });
      }
      setFormOpen(false);
      await fetchUsers(buildQuery(page));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await fetchUsers(buildQuery(page));
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div data-fn="M02.F02.I01" className="space-y-4">
      <span data-fn="M02.F02.I02" style={{ display: "none" }} aria-hidden="true" />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">用户管理</h2>
        <PermissionGuard permission="user:create">
          <button
            data-fn="M02.F02.I05"
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            新增用户
          </button>
        </PermissionGuard>
      </div>

      <div className="flex items-center gap-2 bg-white p-3 rounded shadow-sm">
        <input
          data-fn="M02.F02.I03"
          placeholder="搜索用户名/显示名/邮箱"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border rounded px-3 py-1.5 text-sm flex-1"
        />
        <label className="text-sm text-gray-600 flex items-center gap-1">
          角色筛选
          <select
            data-fn="M02.F02.I04"
            value={role}
            onChange={(e) => handleRoleChange(e.target.value as UserRole | "")}
            className="border rounded px-2 py-1.5 text-sm"
          >
            <option value="">全部</option>
            <option value="admin">admin</option>
            <option value="manager">manager</option>
            <option value="member">member</option>
            <option value="viewer">viewer</option>
          </select>
        </label>
        <button
          data-fn="M02.F02.I03"
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
              <th className="px-4 py-2 text-left">用户名</th>
              <th className="px-4 py-2 text-left">显示名</th>
              <th className="px-4 py-2 text-left">邮箱</th>
              <th className="px-4 py-2 text-left">组织</th>
              <th className="px-4 py-2 text-left">角色</th>
              <th className="px-4 py-2 text-left">状态</th>
              <th className="px-4 py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  加载中...
                </td>
              </tr>
            )}
            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
            {list.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.displayName}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.orgId}</td>
                <td className="px-4 py-2">{u.roles.join(",")}</td>
                <td className="px-4 py-2">{u.status}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <PermissionGuard permission="user:update">
                    <button
                      data-fn="M02.F02.I06"
                      onClick={() => openEdit(u)}
                      className="px-2 py-1 text-blue-600 hover:underline"
                    >
                      编辑
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permission="user:delete">
                    <button
                      data-fn="M02.F02.I07"
                      onClick={() => setDeleteTarget(u)}
                      className="px-2 py-1 text-red-600 hover:underline"
                    >
                      删除
                    </button>
                  </PermissionGuard>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>共 {total} 条</span>
        <div className="space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            上一页
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>

      <UserFormModal
        open={formOpen}
        mode={formMode}
        initialValues={editing ?? undefined}
        orgTree={orgTree ?? undefined}
        onSubmit={handleSubmit}
        onCancel={() => setFormOpen(false)}
        loading={submitting}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="删除确认"
        message={`确定删除用户「${deleteTarget?.displayName ?? ""}」？此操作不可撤销。`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default UserList;
