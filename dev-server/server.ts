/**
 * dev-server/server.ts
 *
 * dev-only 真后端：把 ch40 4 条 auth 端点落到 Node 端口（默认 5176），
 * 让 lab 5173 跨源请求能命中 saas 5175 之外的另一台进程。
 *
 * 启动：npm run dev:api
 * 配合：saas/vite.config.ts 的 server.proxy['/api'] → :5176，
 *       跨源场景下 lab 直接打 http://localhost:5175/api/...
 *
 * 端口：默认 5176（saas 5175 + lab 5173 已占）
 * CORS：放行 lab 5173 + saas 5175
 */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import {
  handleSsoAuthorize,
  handleOAuthCallback,
  handleAuthPermissions,
  handleGetMenus,
} from './authHandlers'

const app = new Hono()

// CORS：默认 dev 自调用（lab 5173 + saas 5175）。
// 生产端通过 SAAS_ALLOWED_ORIGINS 环境变量追加 react-lab.xiangru.uk；
// supervisord.conf / Dockerfile 传 env，参考 deploy/supervisord.conf。
const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5175']
const PROD_ORIGINS = (process.env.SAAS_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const ALLOWED_ORIGINS = [...DEV_ORIGINS, ...PROD_ORIGINS]
app.use(
  '*',
  cors({
    origin: ALLOWED_ORIGINS,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
)

// ch40 4 条 auth 端点
app.get('/sso/authorize', (c) => handleSsoAuthorize(c.req.raw))
app.post('/auth/oauth/callback', (c) => handleOAuthCallback(c.req.raw))
app.get('/auth/permissions', (c) => handleAuthPermissions(c.req.raw))
app.get('/menus', (c) => handleGetMenus(c.req.raw))

// health
app.get('/health', (c) => c.json({ ok: true }))

const PORT = Number(process.env.SAAS_API_PORT ?? 5176)
serve({ fetch: app.fetch, port: PORT }, (info) => {
  // eslint-disable-next-line no-console
  console.log(`[saas dev-api] listening on http://localhost:${info.port}`)
  // eslint-disable-next-line no-console
  console.log(`[saas dev-api] CORS allowed: ${ALLOWED_ORIGINS.join(', ')}`)
})
