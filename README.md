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
- 所有后端 API（`/tenants/*`、`/auth/*`、`/sso/*`）由 MSW handler 拦截。
- OAuth2 授权服务器（`/sso/authorize`、`/sso/oauth/callback`）由 MSW 模拟。
- JWT 在 mock 层签发/校验，密钥写死，非生产凭证。

## 章节映射

> 书稿每个代码块可据此定位到本仓真实文件。ch39-40 已完成，ch41-42 待后续实现。

| 章 | 主题 | 对应模块 / 源文件 |
|----|------|------------------|
| 第39章 | SaaS 多租户架构 | `src/types/tenant.ts`、`src/features/tenant/TenantContext.tsx`、`src/features/tenant/tenantStore.ts`、`src/features/tenant/TenantLayout.tsx`、`src/features/tenant/TenantSwitcher.tsx`、`src/features/tenant/theme.ts`、`src/app/router.tsx`、`src/app/layouts/Layout.tsx` |
| 第40章 | 统一认证与 RBAC | `src/features/sso/ssoRedirect.ts`、`src/features/sso/SsoCallback.tsx`、`src/features/rbac/types.ts`、`src/features/rbac/permissionStore.ts`、`src/features/rbac/PermissionGuard.tsx`、`src/features/auth/authStore.ts`、`src/api/client.ts`、`msw/jwt.ts`、`msw/handlers.ts`（/sso/* + /auth/* 部分） |
| 第41章 | （待后续实现）用户/组织管理 + 虚拟滚动 | — |
| 第42章 | （待后续实现）测试策略与部署 | — |

## 版本

- 当前状态：**building**（ch39-40 已完成，ch41-42 待后续实现，未打 tag）
- 仓内开发约定：见 `CLAUDE.md`
