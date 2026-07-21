import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initMonitoring } from "./monitoring";
import "./index.css";

// ch42：监控初始化（Sentry DSN 空 no-op，web-vitals 采集）
initMonitoring();

// 启动 MSW 浏览器 worker，拦截 /api/* 与 /auth/* 等请求（复用 tests/msw/handlers.ts）。
//
// 项目是 ch39-42 案例：把 MSW 当作「后端」，浏览器 Service Worker 拦截 fetch 后
// 用 handlers 返 mock 数据。这模式在 dev 与 prod build 都开，
// 用户上线时默认走这条；接真后端时通过 build-time 设 VITE_OFFLINE=0 关掉。
//
// 之前 `!import.meta.env.DEV` 检查让 prod 路径上 MSW 不起来——
// fetch 实际打到 VPS nginx、404 HTML 给前端、TypeError 在 useEffect 中 throw。
async function enableMockWorker() {
  if (import.meta.env.VITE_OFFLINE === "0") return;
  const { worker } = await import("../msw/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
  });
}

enableMockWorker().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
