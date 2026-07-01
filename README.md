# saas-identity-platform

《React从入门到项目实践》案例二：**SaaS 多租户身份平台**配套可运行工程。`git clone` 后即可跑：

```bash
npm install
npm test
```

默认 MSW mock 后端 + 前端模拟 JWT + 模拟 OAuth2 授权服务器，无需任何 Key/Docker/网络。

## 技术栈（钉死于项目 `version-lock.json`）

- React 19 + TypeScript 5.6
- Vite 6 + Tailwind CSS 4
- React Router 7
- 状态管理：Zustand 5
- 测试：Vitest 2 + React Testing Library + jsdom + @vitest/coverage-v8
- mock：MSW 2（拦截所有 HTTP + OAuth2 授权端点）
- HTTP：axios 1.x
- 虚拟滚动：react-window 1.8（ch41）
- 监控：@sentry/react 8 + web-vitals 4（ch42）
- Node 20 LTS，npm

## 运行

```bash
npm install              # 安装依赖
npm test                 # 全量测试（无 Key/无 Docker/无网可跑）
npm run test:coverage    # 测试 + 覆盖率报告
npm run dev              # 本地开发（http://localhost:5173）
npm run build            # 生产构建（tsc -b + vite build）
npm run preview          # 预览构建产物
```

## mock-friendly 验收

- `npm install && npm test` 在无 Key、无 Docker、无网下全绿。
- 所有后端 API（`/tenants/*`、`/auth/*`、`/sso/*`、`/users/*`、`/orgs`、`/audit-logs`）由 MSW handler 拦截。
- OAuth2 授权服务器（`/sso/authorize`、`/sso/oauth/callback`）由 MSW 模拟。
- JWT 在 mock 层签发/校验，密钥写死，非生产凭证。
- Sentry DSN 留空时 init no-op，不引入真实 Key。
- web-vitals 上报到 `/api/vitals`，由 MSW 拦截。

## 测试策略与覆盖率

### 测试分层

| 层级 | 目录 | 说明 |
|------|------|------|
| 单元测试 | `tests/types/`、`tests/msw/`、`tests/components/`、`tests/features/*/` | 类型契约、MSW handler、组件、store 隔离测试 |
| 集成测试 | `tests/integration/` | SaaS 全链路：多租户切换 + SSO 登录 + 权限守卫 + 用户管理 |
| E2E 冒烟 | `src/test/` | 登录→业务页面→权限验证→租户切换 端到端 |
| 监控测试 | `tests/monitoring/` | Sentry DSN 空 no-op + web-vitals 采集 |

### 覆盖率

```bash
npm run test:coverage
```

阈值（`vitest.config.ts`）：Lines/Statements/Functions 80%，Branches 75%。

## 构建与部署

### 本地构建

```bash
npm run build       # tsc -b + vite build，产物在 dist/
npm run preview     # 本地预览生产包
```

### Docker 部署

```bash
docker build -t saas-identity-platform .
docker run -p 8080:80 saas-identity-platform
# 访问 http://localhost:8080
```

- 多阶段构建：Stage 1 `node:20-alpine` 构建，Stage 2 `nginx:alpine` 托管
- `deploy/nginx.conf`：SPA `try_files` fallback + `/api/` 反向代理 `backend:8080` + 静态资源缓存 + gzip

### CI（GitHub Actions）

- `.github/workflows/ci.yml`：
  - `test` job：`npm ci` → `npm test` → `npm run test:coverage` → `npm run build`
  - `docker-build` job：构建 Docker 镜像验证部署配置

## 监控接入

### Sentry 错误监控

```typescript
// src/monitoring/sentry.ts
// DSN 从 import.meta.env.VITE_SENTRY_DSN 读取
// 留空时 no-op，不引入真实 Key
initSentry()
captureError(new Error('something went wrong'))
```

### Web Vitals 性能采集

```typescript
// src/monitoring/web-vitals.ts
// 采集 LCP/CLS/INP/FCP/TTFB，sendBeacon 上报到 /api/vitals
reportWebVitals()
```

`main.tsx` 调用 `initMonitoring()` 集成两者。

### Lighthouse 审计

```bash
npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

目标分：Performance > 90，Accessibility > 90，Best Practices > 90，SEO > 90。

## 章节映射

> 书稿每个代码块可据此定位到本仓真实文件。ch39-42 全部完成。

| 章 | 主题 | 对应模块 / 源文件 |
|----|------|------------------|
| 第39章 | SaaS 多租户架构 | `src/types/tenant.ts`、`src/features/tenant/TenantContext.tsx`、`src/features/tenant/tenantStore.ts`、`src/features/tenant/TenantLayout.tsx`、`src/features/tenant/TenantSwitcher.tsx`、`src/features/tenant/theme.ts`、`src/app/router.tsx`、`src/app/layouts/Layout.tsx` |
| 第40章 | 统一认证与 RBAC | `src/features/sso/ssoRedirect.ts`、`src/features/sso/SsoCallback.tsx`、`src/features/rbac/types.ts`、`src/features/rbac/permissionStore.ts`、`src/features/rbac/PermissionGuard.tsx`、`src/features/auth/authStore.ts`、`src/api/client.ts`、`msw/jwt.ts`、`msw/handlers.ts`（/sso/* + /auth/* 部分） |
| 第41章 | 用户管理与审计 | `src/types/user.ts`、`src/features/users/userStore.ts`、`src/features/users/UserList.tsx`、`src/features/users/UserFormModal.tsx`、`src/features/orgs/OrgTree.tsx`、`src/features/audit/auditStore.ts`、`src/features/audit/AuditLogList.tsx`、`src/components/VirtualList.tsx`、`src/components/ConfirmModal.tsx`、`msw/db.ts`（userTable/orgTree/auditLogTable）、`msw/handlers.ts`（/users + /orgs + /audit-logs 部分） |
| 第42章 | 全栈部署与监控 | `src/monitoring/sentry.ts`、`src/monitoring/web-vitals.ts`、`src/monitoring/index.ts`、`src/test/e2e-smoke.test.tsx`、`tests/integration/saasFlow.test.tsx`、`deploy/nginx.conf`、`Dockerfile`、`.github/workflows/ci.yml`、`src/main.tsx`（initMonitoring） |

## 版本

- 当前状态：**tagged**（ch39-42 全部完成，tag `v1.0-001`）
- 仓内开发约定：见 `CLAUDE.md`
