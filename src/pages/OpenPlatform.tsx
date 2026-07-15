import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import type { OpenPlatformConfig } from "../types/security";

// 静态扫描锚点(每个 ID 一行, 表达式 data-fn={ternary} 扫不到)
// @entry M06.F07.I02
// @entry M06.F07.I03
// @entry M06.F07.I04

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

/** iOS 风格开关。提到模块顶层以满足 react/no-unstable-nested-components。 */
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
    </label>
  );
}

export default function OpenPlatformPage() {
  const [config, setConfig] = useState<OpenPlatformConfig | null>(null);
  const [, setSaving] = useState(false);
  const [whitelist, setWhitelist] = useState("");

  useEffect(() => {
    apiClient.get<OpenPlatformConfig>("/open-platform-config").then((r) => {
      setConfig(r.data);
      setWhitelist(r.data.callbackWhitelist.join(", "));
    });
  }, []);

  const update = async (patch: Partial<OpenPlatformConfig>) => {
    setSaving(true);
    try {
      const { data } = await apiClient.put<OpenPlatformConfig>(
        "/open-platform-config",
        patch,
      );
      setConfig(data);
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <div className="p-8 text-gray-400">加载中...</div>;

  return (
    <div data-fn="M06.F07.I01" className="space-y-6">
      <h2 className="text-2xl font-bold">开放平台</h2>
      <div className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">能力开关</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              key: "apiEnabled",
              label: "OpenAPI",
              icon: "🔌",
              desc: "提供 REST API 接口",
            },
            { key: "webhookEnabled", label: "Webhook", icon: "🪝", desc: "事件主动推送" },
            {
              key: "sdkEnabled",
              label: "SDK 下载",
              icon: "📦",
              desc: "多语言客户端 SDK",
            },
          ].map(({ key, label, icon, desc }) => (
            <div
              key={key}
              data-fn={
                key === "apiEnabled"
                  ? "M06.F07.I02"
                  : key === "webhookEnabled"
                    ? "M06.F07.I03"
                    : "M06.F07.I04"
              }
              className="flex items-center justify-between p-4 border rounded"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
              <Toggle
                checked={config[key as keyof OpenPlatformConfig] as boolean}
                onChange={(v) => update({ [key]: v })}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">开放范围</h3>
        <div>
          <label className="block text-sm font-medium mb-2">
            允许调用的 Scope（逗号分隔）
          </label>
          <input
            data-fn="M06.F07.I05"
            value={config.openScopes.join(", ")}
            onChange={(e) =>
              setConfig({
                ...config,
                openScopes: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            onBlur={() => update({ openScopes: config.openScopes })}
            className="w-full border rounded px-3 py-2 text-sm font-mono"
            placeholder="user:read, role:read, org:read"
          />
          <p className="text-xs text-gray-400 mt-1">
            定义第三方应用可调用的 API 权限范围
          </p>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">
          回调地址白名单
        </h3>
        <div>
          <label className="block text-sm font-medium mb-2">
            允许的回调域名（逗号分隔）
          </label>
          <input
            data-fn="M06.F07.I06"
            value={whitelist}
            onChange={(e) => setWhitelist(e.target.value)}
            onBlur={() =>
              update({
                callbackWhitelist: whitelist
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="w-full border rounded px-3 py-2 text-sm font-mono"
            placeholder="https://example.com/callback"
          />
          <p className="text-xs text-gray-400 mt-1">仅允许列表中的域名接收 OAuth 回调</p>
        </div>
      </div>
    </div>
  );
}
