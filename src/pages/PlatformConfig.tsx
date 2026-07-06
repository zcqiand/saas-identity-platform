export default function PlatformConfig() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">平台配置</h2>

      {/* 平台信息只读展示 */}
      <section className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">平台信息</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <dt className="text-gray-500">平台名称</dt>
          <dd className="font-medium">SaaS IAM 统一身份管理平台</dd>
          <dt className="text-gray-500">版本</dt>
          <dd className="font-mono text-xs">v1.0-001</dd>
          <dt className="text-gray-500">功能模块</dt>
          <dd>多租户 / RBAC / SSO / 审计日志 / 应用管理 / 菜单管理</dd>
        </dl>
      </section>
    </div>
  )
}
