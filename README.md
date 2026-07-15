# SaaS 多租户身份平台

[《React从入门到项目实践》](https://www.amazon.com/dp/B0H5DGZM5B) 案例二：SaaS 多租户身份平台配套可运行工程。

## 快速开始

```bash
npm install
npm test        # 全量测试（无 Key/无 Docker/无网可跑）
npm run dev     # 本地开发
npm run build   # 生产构建
```

### Mock 用户

| 用户名 | 密码 | 角色 | 权限 |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | admin | 全部权限 |
| `operator` | `op123` | operator | 受限权限 |

## 功能特性

- **多租户架构**：TenantContext + tenantStore，租户切换器 + 独立主题色配置
- **统一认证（SSO/OAuth2）**：MSW 模拟 OAuth 授权服务器，多 Provider 支持
- **RBAC 权限管理**：角色 CRUD + 权限矩阵 MenuPermissions + 权限组/岗位/用户组
- **用户与组织管理**：用户 CRUD + 递归组织树 + 审计日志分页
- **虚拟滚动**：react-window 定高虚拟窗口，审计日志超 100 项仅渲染可视区域
- **API Keys 与应用**：ApiKey 管理 + 应用菜单配置
- **监控与可观测性**：Sentry（DSN 留空 no-op）+ Web Vitals 采集上报
- **平台级配置**：登录方式/登录安全/通知配置/开放平台/密码策略/平台配置/风控等

## 技术栈

| 技术 | 版本 |
| :--- | :--- |
| React | 19 |
| TypeScript | 5.6 |
| Vite | 6 |
| Tailwind CSS | 4 |
| React Router | 7 |
| Zustand | 5 |
| Vitest | 2 |
| MSW | 2 |
| axios | 1.x |
| react-window | 1.8 |
| @sentry/react | 8 |
| Node | 20 LTS |

> 依赖版本与 `version-lock.json` 的 `version_lock` 一致，不引入 lock 外的库。

## 配套书籍及章节映射

购买电子书籍：[《React从入门到项目实践》](https://www.amazon.com/dp/B0H5DGZM5B)

| 章 | 主题 | 对应源文件 |
| :--- | :--- | :--- |
| ch39 | SaaS 多租户架构 | `src/types/tenant.ts`、`src/features/tenant/TenantContext.tsx`、`src/features/tenant/tenantStore.ts` |
| ch40 | 统一认证与 RBAC | `src/features/sso/ssoRedirect.ts`、`src/features/rbac/roleStore.ts`、`src/features/auth/authStore.ts`、`msw/handlers.ts`、`msw/jwt.ts` |
| ch41 | 用户管理与审计 | `src/features/users/userStore.ts`、`src/features/orgs/OrgTree.tsx`、`src/components/VirtualList.tsx`、`msw/db.ts` |
| ch42 | 全栈部署与监控 | `src/monitoring/sentry.ts`、`src/monitoring/web-vitals.ts`、`deploy/nginx.conf`、`Dockerfile`、`.github/workflows/ci.yml` |

## 快速链接

- [功能清单.md](docs/functions/function-tree.md) — 功能名称、描述与验收标准
- [CLAUDE.md](CLAUDE.md) — 开发约定与编码规范
