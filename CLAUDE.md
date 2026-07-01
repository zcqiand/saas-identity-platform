# saas-identity-platform — 仓库工作约定（供 Claude Code）

本仓是《React从入门到项目实践》案例二（SaaS 多租户身份平台，ch39-42）的可运行配套案例仓，是书稿代码块的 **source of truth**。

## 铁律

- **只增不改**：扩充时不动现有模块签名/行为；新模块独立测试，CI 双跑（旧测试 + 新测试都绿）。
- **mock-friendly**：`npm install && npm test` 必须在无 Key、无 Docker、无网下全绿。
  - 所有后端 API + OAuth2 授权服务器均走 MSW handler 拦截。
  - SSO 跳转用 MSW 模拟 /authorize 与 /token 端点；OAuth 回调 code 由 mock 签发。
  - JWT 在前端 mock 层签发/校验（密钥写死，非真实凭证）。
  - 测试环境 `VITE_OFFLINE=1` 强制离线。
- **TDD**：每个模块先写失败测试 → 跑确认失败 → 实现 → 跑确认绿 → commit。
- **版本钉死**：依赖与 `output/xr-know-001/version-lock.json` 的 `version_lock` 一致；不引入 lock 外的库（ch41 计划引入 react-window，届时补 tech_stack 缺口说明）。
- **tag 即放行**：全量回归绿后打 `v<MAJOR>.<MINOR>-<NNN>`（NNN=项目号，本书为 001）。ch42 完成前不打 tag。

## 技术栈（钉死于 version-lock.json）

- React 19.x、TypeScript 5.6、Vite 6.x、React Router 7.x
- 状态管理：Zustand 5.x
- 样式：Tailwind CSS 4.x（`@tailwindcss/vite` 插件）
- 测试：Vitest 2.x + React Testing Library + jsdom + @vitest/coverage-v8
- mock：MSW 2.x（Node 端 `msw/node`，拦截所有 HTTP + OAuth2 授权服务器）
- HTTP：axios 1.x
- Node 20 LTS，npm

## 验收

```bash
npm install      # 离线可用（首次需联网，之后 node_modules 已就绪）
npm test         # 必须全绿，无需 Key/Docker/网络
npm run test:coverage  # 覆盖率达标（thresholds 80%/75%）
npm run build    # tsc -b && vite build，无错
```

## 目录约定

```
src/
├── types/            # 业务实体类型（tenant.ts 等）
├── app/              # 应用骨架（router.tsx / layouts/）
├── pages/            # 路由页面
├── api/              # HTTP 客户端封装
├── features/
│   ├── tenant/       # 多租户（TenantContext / tenantStore / TenantLayout / TenantSwitcher / theme）
│   ├── sso/          # SSO 跳转与回调
│   ├── rbac/         # RBAC（permissionStore / PermissionGuard / types）
│   └── auth/         # 认证 store（SaaS 版，多组织）
└── main.tsx / App.tsx
msw/
├── handlers.ts       # MSW handler 注册表（只增不改）
├── jwt.ts            # mock JWT 签发/校验
├── db.ts             # mock 内存数据
└── server.ts         # Node 端 server 实例
tests/
├── setup.ts          # vitest 全局 setup
└── *.test.ts(x)      # 与 src/ 一一对应的测试
```

## 章节进度

- ch39（SaaS 多租户架构）：已完成
- ch40（统一认证与 RBAC）：已完成
- ch41（用户/组织管理 + 虚拟滚动）：已完成
- ch42（全栈部署与监控）：已完成，已打 tag v1.0-001
