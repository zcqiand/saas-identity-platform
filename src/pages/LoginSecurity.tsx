import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import type { LoginSecurity } from "../types/security";

export default function LoginSecurityPage() {
  const [config, setConfig] = useState<LoginSecurity | null>(null);
  const [, setSaving] = useState(false);
  const [whitelist, setWhitelist] = useState("");
  const [blacklist, setBlacklist] = useState("");

  useEffect(() => {
    apiClient.get<LoginSecurity>("/login-security").then((r) => {
      setConfig(r.data);
      setWhitelist(r.data.ipWhitelist.join(", "));
      setBlacklist(r.data.ipBlacklist.join(", "));
    });
  }, []);

  const update = async (patch: Partial<LoginSecurity>) => {
    setSaving(true);
    try {
      const { data } = await apiClient.put<LoginSecurity>("/login-security", patch);
      setConfig(data);
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <div className="p-8 text-gray-400">加载中...</div>;

  return (
    <div data-fn="M06.F01.I01" className="space-y-6">
      <h2 className="text-2xl font-bold">登录安全</h2>
      <div className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">
          IP 访问控制
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block mb-1 font-medium">IP 白名单（逗号分隔）</label>
            <input
              data-fn="M06.F01.I02"
              value={whitelist}
              onChange={(e) => setWhitelist(e.target.value)}
              onBlur={() =>
                update({
                  ipWhitelist: whitelist
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="w-full border rounded px-3 py-2 font-mono text-xs"
              placeholder="如: 192.168.1.0/24, 10.0.0.1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">IP 黑名单（逗号分隔）</label>
            <input
              data-fn="M06.F01.I03"
              value={blacklist}
              onChange={(e) => setBlacklist(e.target.value)}
              onBlur={() =>
                update({
                  ipBlacklist: blacklist
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="w-full border rounded px-3 py-2 font-mono text-xs"
              placeholder="如: 10.0.0.0/8"
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">
          登录失败锁定
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">启用登录失败锁定</p>
              <p className="text-xs text-gray-400">连续失败后自动锁定账户</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                data-fn="M06.F01.I04"
                type="checkbox"
                checked={config.failedAttemptLockEnabled}
                onChange={(e) => update({ failedAttemptLockEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {config.failedAttemptLockEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded">
                <label className="block text-xs text-gray-500 mb-1">锁定阈值（次）</label>
                <input
                  data-fn="M06.F01.I05"
                  type="number"
                  value={config.lockThreshold}
                  onChange={(e) =>
                    setConfig({ ...config, lockThreshold: Number(e.target.value) })
                  }
                  onBlur={() => update({ lockThreshold: config.lockThreshold })}
                  className="w-full border rounded px-3 py-1.5 text-center"
                />
              </div>
              <div className="p-3 border rounded">
                <label className="block text-xs text-gray-500 mb-1">锁定时长（秒）</label>
                <input
                  data-fn="M06.F01.I06"
                  type="number"
                  value={config.lockDuration}
                  onChange={(e) =>
                    setConfig({ ...config, lockDuration: Number(e.target.value) })
                  }
                  onBlur={() => update({ lockDuration: config.lockDuration })}
                  className="w-full border rounded px-3 py-1.5 text-center"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">地区限制</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">启用地区限制</p>
            <p className="text-xs text-gray-400">仅允许指定地区登录</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              data-fn="M06.F01.I07"
              type="checkbox"
              checked={config.regionRestrictionEnabled}
              onChange={(e) => update({ regionRestrictionEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {config.regionRestrictionEnabled && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              允许地区（ISO 代码，逗号分隔）
            </label>
            <input
              data-fn="M06.F01.I08"
              value={config.allowedRegions.join(", ")}
              onChange={(e) =>
                setConfig({
                  ...config,
                  allowedRegions: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              onBlur={() => update({ allowedRegions: config.allowedRegions })}
              className="w-full border rounded px-3 py-2 font-mono text-xs"
              placeholder="CN, HK, TW"
            />
          </div>
        )}
      </div>
    </div>
  );
}
