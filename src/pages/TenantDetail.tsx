import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useTenantStore } from "../features/tenant/tenantStore";

const FEATURE_OPTIONS = ["sso", "audit", "rbac"];

export default function TenantDetail() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { current, loading, error, fetchTenant, updateTenant, clearError } =
    useTenantStore();

  const [name, setName] = useState("");
  const [logoText, setLogoText] = useState("");
  const [primary, setPrimary] = useState("#2563eb");
  const [sidebar, setSidebar] = useState("#1e293b");
  const [features, setFeatures] = useState<string[]>([]);
  const [maxUsers, setMaxUsers] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (tenantId) fetchTenant(tenantId);
    return () => {
      clearError();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  useEffect(() => {
    if (current && current.id === tenantId) {
      setName(current.name);
      setLogoText(current.theme.logoText);
      setPrimary(current.theme.primary);
      setSidebar(current.theme.sidebar);
      setFeatures(current.features ?? current.config?.features ?? []);
      setMaxUsers(current.config?.maxUsers ?? 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const toggleFeature = (f: string) => {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  };

  const handleSave = async () => {
    if (!tenantId) return;
    setSubmitting(true);
    setSaved(false);
    try {
      await updateTenant(tenantId, {
        name,
        theme: { primary, sidebar, logoText },
        config: { features, maxUsers },
      });
      setSaved(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !current) {
    return <div className="text-gray-400 p-4">加载中...</div>;
  }

  if (error && !current) {
    return (
      <div className="space-y-4">
        <div role="alert" className="text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate("/platform/tenants")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← 返回租户列表
        </button>
      </div>
    );
  }

  return (
    <div data-fn="M01.F01.I06" className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/platform/tenants")}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← 返回
          </button>
          <h2 className="text-2xl font-bold">租户配置</h2>
          {current && (
            <span className="text-sm text-gray-400 font-mono">{current.id}</span>
          )}
        </div>
        {saved && <span className="text-green-600 text-sm">保存成功</span>}
      </div>

      {error && (
        <div role="alert" className="text-red-600 bg-red-50 p-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* 基础信息 */}
      <section className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">基本信息</h3>
        <div>
          <label htmlFor="td-name" className="block text-sm font-medium mb-1">
            租户名称
          </label>
          <input
            id="td-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="td-logo" className="block text-sm font-medium mb-1">
            Logo 文本
          </label>
          <input
            id="td-logo"
            value={logoText}
            onChange={(e) => setLogoText(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* 主题配置 */}
      <section className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">主题配置</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="td-primary" className="block text-sm font-medium mb-1">
              主色
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="w-10 h-10 border rounded cursor-pointer"
              />
              <input
                id="td-primary"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="td-sidebar" className="block text-sm font-medium mb-1">
              侧边栏色
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={sidebar}
                onChange={(e) => setSidebar(e.target.value)}
                className="w-10 h-10 border rounded cursor-pointer"
              />
              <input
                id="td-sidebar"
                value={sidebar}
                onChange={(e) => setSidebar(e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        {/* 主题预览 */}
        <div className="flex gap-2">
          <div
            className="w-8 h-8 rounded border"
            style={{ background: primary }}
            title="主色预览"
          />
          <div
            className="w-8 h-8 rounded border"
            style={{ background: sidebar }}
            title="侧边栏色预览"
          />
          <span className="text-xs text-gray-400 self-center">主题预览</span>
        </div>
      </section>

      {/* 功能与套餐 */}
      <section className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">
          功能与套餐
        </h3>
        <div>
          <label className="block text-sm font-medium mb-2">启用功能模块</label>
          <div className="flex gap-6">
            {FEATURE_OPTIONS.map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={features.includes(f)}
                  onChange={() => toggleFeature(f)}
                  className="rounded"
                />
                {f}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="td-max-users" className="block text-sm font-medium mb-1">
            最大用户数
          </label>
          <input
            id="td-max-users"
            type="number"
            min={1}
            value={maxUsers}
            onChange={(e) => setMaxUsers(Number(e.target.value))}
            className="w-48 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          data-fn="M01.F01.I07"
          onClick={handleSave}
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {submitting ? "保存中..." : "保存配置"}
        </button>
      </div>
    </div>
  );
}
