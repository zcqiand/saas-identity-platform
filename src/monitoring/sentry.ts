import * as Sentry from "@sentry/react";

let enabled = false;

/**
 * 初始化 Sentry。DSN 为空时 no-op，不引入真实 Key，保证 mock-friendly。
 * 生产环境在 main.tsx 调用 initSentry()，CI/测试环境 DSN 留空。
 *
 * 注意：Sentry.init 在非浏览器环境（jsdom）可能受限，用 try/catch 包裹保证不抛错。
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    enabled = false;
    return;
  }
  try {
    Sentry.init({
      dsn,
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: 1.0,
    });
    enabled = true;
  } catch {
    // 初始化失败（如非浏览器环境），降级为 no-op
    enabled = false;
  }
}

/** 是否已启用 Sentry */
export function isSentryEnabled(): boolean {
  return enabled;
}

/** 捕获错误并发送到 Sentry（未启用时 no-op） */
export function captureError(error: Error | string): void {
  if (!enabled) return;
  if (typeof error === "string") {
    Sentry.captureMessage(error);
  } else {
    Sentry.captureException(error);
  }
}
