// @ts-expect-error msw 2.x 的 browser 子路径导出在 moduleResolution: bundler 下
// 触发 TS2303 "circular definition of setupWorker"（package.json 的 module-sync
// conditions 与 tsconfig 默认 conditions 不匹配）。运行时通过 vite/node 完全正常，
// 只是 tsc 类型跟踪失败。详见 docs/adr/ 待登记（本仓铁律"先小红再大绿"留作 ADR 候选）。
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 浏览器环境下的 MSW worker 实例（dev server 使用）。
export const worker = setupWorker(...handlers)
