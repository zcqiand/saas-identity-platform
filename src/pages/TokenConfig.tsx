import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import type { TokenConfig } from "../types/security";

export default function TokenConfigPage() {
  const [config, setConfig] = useState<TokenConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get<TokenConfig>("/token-config").then((r) => setConfig(r.data));
  }, []);

  const update = async (patch: Partial<TokenConfig>) => {
    setSaving(true);
    try {
      const { data } = await apiClient.put<TokenConfig>("/token-config", patch);
      setConfig(data);
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <div className="p-8 text-gray-400">加载中...</div>;

  return (
    <div data-fn="M06.F04.I01" className="space-y-6">
      <h2 className="text-2xl font-bold">Token 管理</h2>
      <div className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">
          Token 配置
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium">访问令牌有效期</p>
              <p className="text-xs text-gray-400">单位：秒</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                data-fn="M06.F04.I02"
                type="number"
                value={config.accessTokenTtl}
                onChange={(e) =>
                  setConfig({ ...config, accessTokenTtl: Number(e.target.value) })
                }
                className="border rounded px-3 py-1.5 w-28 text-center"
              />
              <button
                data-fn="M06.F04.I02"
                onClick={() => update({ accessTokenTtl: config.accessTokenTtl })}
                disabled={saving}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium">Refresh Token 有效期</p>
              <p className="text-xs text-gray-400">单位：秒</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                data-fn="M06.F04.I03"
                type="number"
                value={config.refreshTokenTtl}
                onChange={(e) =>
                  setConfig({ ...config, refreshTokenTtl: Number(e.target.value) })
                }
                className="border rounded px-3 py-1.5 w-28 text-center"
              />
              <button
                data-fn="M06.F04.I03"
                onClick={() => update({ refreshTokenTtl: config.refreshTokenTtl })}
                disabled={saving}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded col-span-2">
            <div>
              <p className="font-medium">开启 Refresh Token 续期</p>
              <p className="text-xs text-gray-400">允许无感续期access token</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                data-fn="M06.F04.I04"
                type="checkbox"
                checked={config.refreshTokenEnabled}
                onChange={(e) => update({ refreshTokenEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3 border rounded col-span-2">
            <div>
              <p className="font-medium">开启 Token 主动失效</p>
              <p className="text-xs text-gray-400">登出后立即使 Refresh Token 失效</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                data-fn="M06.F04.I05"
                type="checkbox"
                checked={config.tokenRevocationEnabled}
                onChange={(e) => update({ tokenRevocationEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
