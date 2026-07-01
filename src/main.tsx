import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initMonitoring } from './monitoring'
import './index.css'

// ch42：监控初始化（Sentry DSN 空 no-op，web-vitals 采集）
initMonitoring()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
