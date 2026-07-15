# CLAUDE.md — saas-identity-platform

> 入口，不是手册。L0 门强制上限 60 行。细节进 `docs/conventions/saas-book-conventions.md`。

## 1. 是什么

本仓是《React从入门到项目实践》案例二（SaaS 多租户身份平台）的可运行配套工程，覆盖 ch39-42。MSW mock 全覆盖（含 OAuth2 授权服务器模拟），无 Key / Docker / 网络依赖。**书稿代码块的 source of truth**——书与仓不一致以仓为准。

## 2. 禁止事项（项目铁律）

- **TDD**：先写失败测试 → 跑确认失败 → 实现 → 跑确认绿 → commit
- **版本钉死**：依赖必须落在 `version-lock.json` 的 `version_lock` 范围内；不引入 lock 外的库
- **tag 即放行**：全量回归绿后打 `v<MAJOR>.<MINOR>-<NNN>`（NNN=项目号）
- **mock-friendly**：`npm install && npm test` 在无 Key / Docker / 网络下全绿
- 不直接改 `docs/functions/function-tree.md`；走 `/tree-change` 提案由人批准
- 不先改代码后补功能清单；改功能与改功能清单必须同一个 commit
- 不删功能清单里的行来消除告警；废弃改状态，编号永不复用
- 不在本文件里堆细则

技术栈与版本钉死于 `version-lock.json` 的 `version_lock` + `package.json`。

## 3. 指向别处

- 编码约定 / 目录结构 / MSW handler 规则 → [docs/conventions/saas-book-conventions.md](docs/conventions/saas-book-conventions.md)
- shadcn/ui 底座使用 → `src/components/ui/`（shadcn 原语）+ `src/components/app/`（app 级复合）
- 通用 React 性能/UI 惯例 → [docs/conventions/react-perf.md](docs/conventions/react-perf.md) 与 [docs/conventions/app-ui.md](docs/conventions/app-ui.md)
- 门禁命令 → `.harness/stack.json`

## 4. 工作循环

1. `npm test` —— 「tag 即放行」的最低标准
2. `npm run build` —— tsc -b && vite build
3. `python ../../scripts/gate.py -p saas-identity-platform` —— suite 门禁（L0/L1/L2/L3/L4/L5）
4. exit 0 = 完成；非 0 回到第 1 步；exit 2 停下问人，不要自行改 `.harness/stack.json` 让门变松
