import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Node 环境下的 MSW server 实例（vitest 使用）。
export const server = setupServer(...handlers)
