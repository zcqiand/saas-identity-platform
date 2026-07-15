# saas-identity-platform — 编码约定（书稿配套）

> CLAUDE.md 只声明铁律和指向别处。具体约定、目录结构、MSW 规则放这里。

## 1. 验收（最低门）

```bash
npm install      # 离线可用（首次需联网，之后 node_modules 已就绪）
npm test         # 必须全绿，无需 Key/Docker/网络
npm run build    # tsc -b && vite build，无错
```

## 2. 目录结构

```
src/
├── types/            # 业务实体类型（tenant.ts / user.ts / rbac.ts / app.ts）
├── app/              # 应用骨架（router.tsx / layouts/）
├── pages/            # 路由页面
├── api/              # HTTP 客户端封装（client.ts / endpoints）
├── features/         # 业务特性，每特性一目录（store / 组件 / hooks）
│   ├── tenant/       # 多租户（TenantContext / tenantStore / TenantLayout / TenantSwitcher / theme）
│   ├── sso/          # SSO 跳转与回调
│   ├── rbac/         # RBAC（roleStore / RoleList / RoleFormModal / MenuPermissions）
│   ├── permissionGroups/  # 权限组
│   ├── positions/    # 岗位
│   ├── userGroups/   # 用户组
│   ├── apiKeys/      # API Key
│   ├── apps/         # 应用
│   ├── auth/         # 认证 store
│   ├── users/        # 用户管理
│   ├── orgs/         # 组织管理
│   └── audit/        # 审计日志
├── components/       # 通用组件（app/ = 复合层；ui/ = shadcn 原语）
├── monitoring/       # Sentry + Web Vitals
└── main.tsx / App.tsx
msw/
├── handlers.ts       # MSW handler 注册表
├── jwt.ts            # mock JWT 签发/校验
├── db.ts             # mock 内存数据库
└── server.ts         # Node 端 server 实例
tests/
├── setup.ts          # vitest 全局 setup（MSW server 生命周期）
└── *.test.ts(x)      # 与 src/ 一一对应的测试
```

## 3. 编码约定

- 所有业务类型放在 `src/types/`
- 所有 HTTP 客户端封装在 `src/api/`
- 特性按 `src/features/` 组织；特性内部自己分 store / components / hooks
- JWT 在 mock 层签发/校验，非生产凭证
- 视觉一致性：业务页面迁移到 shadcn 底座时优先用 `src/components/ui/`（原语）与 `src/components/app/`（复合），设计 token 见 `src/index.css` 的 `--color-*` / `bg-primary` 等。原生 Tailwind 类（如 `bg-black/40`）允许但不在新页面引入。

## 4. UI 双轨过渡期（v1.3-000 起）

shadcn/ui 底座作为新增能力存在于 `src/components/ui/` 与 `src/components/app/`。
已上线业务页面（`src/features/`、`src/pages/`）暂用原生 Tailwind 类，**不做强制迁移**。
新增页面默认走 shadcn 原语。批量迁移发生时按模块逐个走 review，按 `.claude/skills/app-ui` 与 `docs/conventions/app-ui.md` 收敛。

## 5. 部署

- `Dockerfile` —— 多阶段构建
- `deploy/nginx.conf` —— SPA fallback + `/api/` 反向代理
