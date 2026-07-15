import { onLCP, onCLS, onINP, onFCP, onTTFB, type Metric } from "web-vitals";

type VitalName = "LCP" | "CLS" | "INP" | "FCP" | "TTFB";

/** 上报回调：默认发送到 /api/vitals（MSW 拦截），可自定义 */
type ReportCallback = (name: VitalName, metric: Metric) => void;

const defaultReport: ReportCallback = (name, metric) => {
  // 发送到 /api/vitals，由 MSW 拦截（mock）或后端接收（生产）
  const body = JSON.stringify({
    name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    timestamp: Date.now(),
  });
  // 使用 sendBeacon 避免阻塞页面（不可用时降级 fetch）
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/vitals", body);
  } else {
    fetch("/api/vitals", { method: "POST", body, keepalive: true }).catch(() => {});
  }
};

/**
 * 采集 Web Vitals 指标（LCP/CLS/INP/FCP/TTFB）并发送。
 * @param customReport 可选自定义上报回调（测试用）
 * @returns cleanup 函数，取消所有监听
 */
export function reportWebVitals(customReport?: ReportCallback): () => void {
  const report = customReport ?? defaultReport;
  const cleanups: Array<() => void> = [];

  const wrap = (fn: (cb: (metric: Metric) => void) => void, name: VitalName) => {
    let cancelled = false;
    fn((metric) => {
      if (!cancelled) report(name, metric);
    });
    return () => {
      cancelled = true;
    };
  };

  cleanups.push(wrap(onLCP, "LCP"));
  cleanups.push(wrap(onCLS, "CLS"));
  cleanups.push(wrap(onINP, "INP"));
  cleanups.push(wrap(onFCP, "FCP"));
  cleanups.push(wrap(onTTFB, "TTFB"));

  return () => cleanups.forEach((c) => c());
}
