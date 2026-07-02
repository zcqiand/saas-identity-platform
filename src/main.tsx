import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initMonitoring } from './monitoring'
import './index.css'

// ch42：监控初始化（Sentry DSN 空 no-op，web-vitals 采集）
initMonitoring()

// dev 环境启动 MSW 浏览器 worker，拦截 /api 与 /sso 请求（与测试侧 Node server 共用 handlers）。
// 生产构建中 import.meta.env.DEV 为 false，整段被静态消除，worker 代码不会进入产物。
async function enableMockWorker() {
  if (!import.meta.env.DEV) return
  if (import.meta.env.VITE_OFFLINE === '0') return
  const { worker } = await import('../msw/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })
}

enableMockWorker().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
