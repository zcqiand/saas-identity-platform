import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./app/router";
import { setToken } from "./api/client";
import { usePermissionStore } from "./features/rbac/permissionStore";

/**
 * 应用启动时初始化 demo 权限。
 * dev 环境：模拟已登录用户，加载 org-acme 的权限集（admin 角色）。
 * 生产环境由真实 SSO 登录流程接管。
 */
function InitPermissions() {
  const fetchPermissions = usePermissionStore((s) => s.fetchPermissions);
  const permissions = usePermissionStore((s) => s.permissions);

  useEffect(() => {
    if (permissions.length > 0) return;
    // 模拟登录：设置 mock token + 拉取权限
    const demoToken = "dev-mock-token";
    setToken(demoToken);
    fetchPermissions("org-acme");
  }, [fetchPermissions, permissions]);

  return null;
}

export default function App() {
  return (
    <>
      <InitPermissions />
      <RouterProvider router={router} />
    </>
  );
}
