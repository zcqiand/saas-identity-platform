import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import type { NotificationConfig } from "../types/security";

// 静态扫描锚点(每个 ID 一行, ENTRY_RE 才能逐个扫到; 表达式 data-fn={ternary} 扫不到)
// @entry M06.F05.I02
// @entry M06.F05.I03
// @entry M06.F05.I04
// @entry M06.F05.I05
// @entry M06.F05.I06
// @entry M06.F05.I07
// @entry M06.F05.I08

const NOTIFY_LABELS: Record<string, string> = {
  login: "登录通知",
  password_change: "密码变更",
  security_alert: "安全告警",
  system: "系统通知",
};

export default function NotificationConfigPage() {
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [, setSaving] = useState(false);

  useEffect(() => {
    apiClient
      .get<NotificationConfig>("/notification-config")
      .then((r) => setConfig(r.data));
  }, []);

  const update = async (patch: Partial<NotificationConfig>) => {
    setSaving(true);
    try {
      const { data } = await apiClient.put<NotificationConfig>(
        "/notification-config",
        patch,
      );
      setConfig(data);
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <div className="p-8 text-gray-400">加载中...</div>;

  const toggleNotify = (type: string) => {
    const current = config.notifyOn as string[];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    update({ notifyOn: next as NotificationConfig["notifyOn"] });
  };

  return (
    <div data-fn="M06.F05.I01" className="space-y-6">
      <h2 className="text-2xl font-bold">消息通知</h2>
      <div className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">通知渠道</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              key: "emailEnabled",
              label: "邮件通知",
              icon: "✉️",
              desc: "发送至绑定邮箱",
            },
            { key: "smsEnabled", label: "短信通知", icon: "📱", desc: "发送至绑定手机" },
            { key: "inAppEnabled", label: "站内信", icon: "🔔", desc: "平台内消息通知" },
          ].map(({ key, label, icon, desc }) => (
            <div
              key={key}
              data-fn={
                key === "emailEnabled"
                  ? "M06.F05.I02"
                  : key === "smsEnabled"
                    ? "M06.F05.I03"
                    : "M06.F05.I04"
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
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config[key as keyof NotificationConfig] as boolean}
                  onChange={(e) => update({ [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded shadow p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">
          通知触发条件
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(NOTIFY_LABELS).map(([key, label]) => (
            <div
              key={key}
              data-fn={
                key === "login"
                  ? "M06.F05.I05"
                  : key === "password_change"
                    ? "M06.F05.I06"
                    : key === "security_alert"
                      ? "M06.F05.I07"
                      : "M06.F05.I08"
              }
              className="flex items-center justify-between p-3 border rounded"
            >
              <span className="font-medium text-sm">{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notifyOn.includes(
                    key as "login" | "password_change" | "security_alert" | "system",
                  )}
                  onChange={() => toggleNotify(key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
