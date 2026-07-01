import { type HttpHandler } from 'msw'

// MSW handler 注册表。
// 脚手架阶段为空数组；ch39/ch40 TDD 时在此追加 handler（只增不改）。
export const handlers: HttpHandler[] = []
