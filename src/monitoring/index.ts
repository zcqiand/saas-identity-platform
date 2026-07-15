import { initSentry } from "./sentry";
import { reportWebVitals } from "./web-vitals";

/**
 * 监控集成入口：在 main.tsx 调用。
 * - Sentry：DSN 为空时 no-op
 * - Web Vitals：采集 LCP/CLS/INP/FCP/TTFB 并发送到 /api/vitals（MSW 拦截）
 */
export function initMonitoring(): void {
  initSentry();
  // Web Vitals 在浏览器环境采集，jsdom 测试环境会 no-op
  if (typeof window !== "undefined") {
    reportWebVitals();
  }
}

export { initSentry, isSentryEnabled, captureError } from "./sentry";
export { reportWebVitals } from "./web-vitals";
