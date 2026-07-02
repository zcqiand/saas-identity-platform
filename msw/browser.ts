import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 浏览器环境下的 MSW worker 实例（dev server 使用）。
// Node 测试环境见 server.ts。handlers 与 Node 端共用同一份（只增不改）。
export const worker = setupWorker(...handlers)
