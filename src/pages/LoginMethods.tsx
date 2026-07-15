import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import type { LoginMethod, SsoProvider, OAuth2Provider } from "../types/security";

export default function LoginMethods() {
  const [methods, setMethods] = useState<LoginMethod[]>([]);
  const [ssoProviders, setSsoProviders] = useState<SsoProvider[]>([]);
  const [oauth2Providers, setOauth2Providers] = useState<OAuth2Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get<LoginMethod[]>("/login-methods"),
      apiClient.get<SsoProvider[]>("/sso-providers"),
      apiClient.get<OAuth2Provider[]>("/oauth2-providers"),
    ])
      .then(([m, s, o]) => {
        setMethods(m.data);
        setSsoProviders(s.data);
        setOauth2Providers(o.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleMethod = async (id: string, enabled: boolean) => {
    setSaving(true);
    try {
      await apiClient.put(`/login-methods/${id}`, { enabled });
      setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, enabled } : m)));
    } finally {
      setSaving(false);
    }
  };

  const updateSso = async (id: string, patch: Partial<SsoProvider>) => {
    setSaving(true);
    try {
      const { data } = await apiClient.put<SsoProvider>(`/sso-providers/${id}`, patch);
      setSsoProviders((prev) => prev.map((p) => (p.id === id ? data : p)));
    } finally {
      setSaving(false);
    }
  };

  const updateOAuth = async (id: string, patch: Partial<OAuth2Provider>) => {
    setSaving(true);
    try {
      const { data } = await apiClient.put<OAuth2Provider>(
        `/oauth2-providers/${id}`,
        patch,
      );
      setOauth2Providers((prev) => prev.map((p) => (p.id === id ? data : p)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-fn="M06.F02.I01" className="space-y-6">
      <h2 className="text-2xl font-bold">登录认证配置</h2>

      {/* 登录方式 */}
      <section className="bg-white rounded shadow p-6 space-y-3">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">登录方式</h3>
        {loading && <p className="text-gray-400">加载中...</p>}
        <div className="space-y-2">
          {methods.map((m) => (
            <div
              key={m.id}
              data-fn="M06.F02.I02"
              className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-sm">{m.name}</p>
                <p className="text-xs text-gray-400">{m.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={m.enabled}
                  onChange={(e) => toggleMethod(m.id, e.target.checked)}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* SSO 提供商 */}
      <section className="bg-white rounded shadow p-6 space-y-3">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">
          单点登录（SSO）
        </h3>
        <div className="space-y-3">
          {ssoProviders.map((p) => (
            <div
              key={p.id}
              data-fn="M06.F02.I03"
              className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-sm">
                  {p.name} <span className="text-xs text-gray-400 ml-1">({p.type})</span>
                </p>
                <p className="text-xs text-gray-400 font-mono">
                  {p.issuerUrl ?? "未配置"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) => updateSso(p.id, { enabled: e.target.checked })}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* OAuth2 提供商 */}
      <section className="bg-white rounded shadow p-6 space-y-3">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">
          OAuth2 登录
        </h3>
        <div className="space-y-3">
          {oauth2Providers.map((p) => (
            <div
              key={p.id}
              data-fn="M06.F02.I04"
              className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-gray-400">Provider: {p.provider}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) => updateOAuth(p.id, { enabled: e.target.checked })}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
