import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../msw/server'
import { resetMockDb } from '../msw/db'

// MSW 全局 server 生命周期：所有测试统一拦截后端请求与 OAuth2 授权服务器，无真实网络。
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
  resetMockDb()
})
afterAll(() => server.close())
