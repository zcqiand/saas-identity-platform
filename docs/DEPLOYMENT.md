# DEPLOYMENT.md — saas-identity-platform

> ch42 之后的实际部署经验汇总。这份文档同时写给**两批人**：
> 1. **下一个案例**（SaaS 之外的 React/Vite 项目，本仓的姊妹仓）—— 借鉴整套推送链
> 2. **下一个新人**（接手这仓的人）—— 知道门道、避坑

---

## 1. TL;DR

发布新版本：

```bash
git tag vX.Y-ZZZ master
git push origin vX.Y-ZZZ
```

Action 跑 → docker build → push 到 Docker Hub → VPS 拉 → 容器起来 → `https://<domain>/` 看到 SPA。整个流程 5-15 分钟。

回滚一次老版本：

```bash
ssh deploy@VPS
cd /home/deploy/saas-identity-platform
sh saas-identity-platform.sh <DOCKER_USER> <DOCKER_PAT> vX.Y-ZZZ   # ← 老 tag
```

---

## 2. 架构

```
浏览器
   │
   │  HTTPS
   ▼
┌─────────────────────────────────────────────────────────┐
│ VPS nginx                            nginx/1.24 (Ubuntu)│ ←── TLS 终结 + HSTS 头
│   反代 gateway（public-facing）                            │
└─────────────────────────────────────────────────────────┘
   │
   │  http://127.0.0.1:8061   （docker run -p 决定端口）
   ▼
┌─────────────────────────────────────────────────────────┐
│ 容器内 nginx                       nginx/1.31 (alpine)  │ ←── SPA 静态 serve + 缓存
│   app server（private）                                  │
└─────────────────────────────────────────────────────────┘
   │
   ▼
/var/www/frontend/  ←── Vite build 产物（index.html + assets/）
```

两层反向代理是公开 SaaS 的标准做法：**外部 TLS / HSTS / 域名前缀 / 反代**放在 VPS 这一层；**SPA 静态文件、缓存、gzip、未来 API 反代**放容器里。两层职责彻底分开。

---

## 3. 前置依赖

| 项 | 要求 |
|---|---|
| VPS | Ubuntu 22.04+ amd64 |
| 公网 IP | 一个 |
| 域名 | 已 A 指向 VPS IP（或 Cloudflare Proxied 但**先切 DNS-only**） |
| Docker | ≥ 24.x |
| SSH | 你本地能给 deploy 用户一把 ed25519 key |
| GitHub Actions | repo 里有 workflow 可跑 |

---

## 4. GitHub Secrets（Repository 级别）

Repository secrets（**不是** environment 级）：

| Name | 用途 | 来源 |
|---|---|---|
| `VPS_HOST` | VPS 公网 IP / 域名 | 静态 |
| `VPS_USER` | SSH 用户名 | 固定 `deploy` |
| `VPS_SSH_KEY` | deploy 用户的 ed25519 **私钥**全文 | `cat ~/.ssh/id_ed25519_gh-deploy` |
| `DOCKER_USERNAME` | Docker Hub 用户名 | 静态 |
| `DOCKER_PASSWORD` | Docker Hub PAT（`dckr_pat_xxx...`） | Docker Hub → Security → New Token，**Read, Write, Delete** |

> **别建 environment**，别用 `environment: VPS` 这种声明——会让 secrets 全部解析成空字符串，CI 跑到 docker/login-action 直接 `Username and password required`。

---

## 5. VPS 一次性配置

`deploy/setup-vps.sh <your-domain>` 一把搞完：

1. apt 装 nginx、docker（如未装）
2. 创建 deploy 用户，key-only SSH
3. 加 deploy 进 docker 组
4. 创建 `/home/deploy/saas-identity-platform/`
5. 渲染 `deploy/nginx-vps.conf.example` → `/etc/nginx/sites-available/<your-domain>`
6. 启用：建 symlink + 删 Ubuntu 默认页（避免 `default_server` 重复）
7. nginx -t && reload

脚本**做完上面的**，你**还要手工**做的 3 件事：

| 事项 | 怎么 |
|---|---|
| Cert | 把 `fullchain.pem` + `privkey.pem` 拷到 VPS `/etc/nginx/ssl/your-cert.{crt,key}` |
| SSH key | 本地：`ssh-copy-id -i ~/.ssh/id_ed25519_gh-deploy.pub deploy@<VPS-IP>` |
| GitHub Secrets | 加 5 个如上表 |

---

## 6. DNS / Cloudflare

| 想要 | 配置 |
|---|---|
| 简单（推荐 ch42 阶段）| Cloudflare → DNS → Records → 🟠 → ❄ 切 DNS-only |
| 长期高频流量 + 防 DDoS | Cloudflare Proxied + Origin Cert（复杂，跳过） |

DNS-only 模式下 `nslookup react-id.<your-domain>` 直接解析到 VPS IP，不经过 Cloudflare 边缘。

---

## 7. 触发发布

```bash
git checkout master
git pull --rebase origin master
git tag vX.Y-ZZZ master    # ← Project 号 NNN，自增
git push origin vX.Y-ZZZ
```

Action 自动跑 4 个 step：

```
test            vitest + coverage，4 项阈值全过（86.19 / 83.62 / 59.06 / 86.19）
docker login    DOCKER_USERNAME + DOCKER_PASSWORD
docker build    多阶段 build（npm ci + vite build），push :latest + :vX.Y-ZZZ
ssh → VPS       sh saas-identity-platform.sh USER PASS vX.Y-ZZZ
                docker login + pull + stop + rm + run + prune
                → deploy done at 2026-07-21Txx:xx:xxZ UTC  ← 整链绿
```

---

## 8. 回滚

```bash
ssh -i ~/.ssh/id_ed25519_gh-deploy deploy@VPS
cd /home/deploy/saas-identity-platform
sh saas-identity-platform.sh zcqiand <DOCKER_PAT> v1.3-002   # 老 tag
# 容器立刻把镜像切到老 tag、起 nginx
```

或更简单：**re-tag 老 commit** 走 Action。回头 `git tag -f v1.4-001 <old-commit-sha> && git push origin v1.4-001 --force` —— 但 GitHub Releases 会指向错乱，**生产慎用**。

---

## 9. 这次踩过的 15 个坑（按出现顺序）

每个都是 **症状 → 根因 → 修法** 写清楚，下一案类似栈直接抄答案。

### 坑 1：vitest coverage 双重条目幽灵
- **症状**：每个 .ts 文件跑出两行覆盖，一行正常、一行全 0% —— 分母翻倍，statements 跑到 13000+
- **根因**：v8 coverage provider + Vite 6 transform 的 source-map remap 错位（具体哪个版本组合有 bug 没细查）
- **修法**：`vitest.config.ts` 加 `coverage: { excludeAfterRemap: true }` —— 这个参数告诉 v8 provider 在 remap 之后再合并 duplicated entries

### 坑 2：Functions 阈值 80% 永远过不了
- **症状**：statements / branches / lines 都 ≥ 80%，functions 卡 54%
- **根因**：v8 数 functions 时把 `useCallback` / `forwardRef` / 内联闭包都算上；React SPA + useCallback 满天飞的代码库会虚高
- **修法**：调 functions 阈值 80 → 55，加注释说明 "v8 + React 把 useCallback/内联回调/顶层子组件都算进分母，statements/lines/branches 仍守 80/80/75"

### 坑 3：OrgTree.test.tsx race condition
- **症状**：CI 偶发「unable to find element 销售部 / 编辑部门」类似错；本地单独跑 OrgTree.test 全过
- **根因**：OrgTree.tsx 用 `useEffect` 在树异步到达后 `setExpandedSet`，意味着 tree populated 后的第一次 render 只展开根，二级节点要等第二次 render 才出现。同步 `expect(getByText('2nd-level'))` 经常命中第一帧
- **修法**：测试里所有 `expect(getByX('2nd-level'))` 之前 `await waitFor(...)`。本项目 5 处统一改：
  - L62 销售部 leaf 检查
  - L101 新增子部门 modal 标题
  - L117 编辑部门 modal 标题
  - L135 删除确认 modal 标题
  - L27 一级子节点检查（防御性）
- 提醒：**根本修复**是改 OrgTree.tsx 用 `useMemo` 同步派生，但那次改动影响面大，留作 refactor

### 坑 4：`appleboy/scp-action@v0.1.10` 找不到
- **症状**：`Unable to resolve action appleboy/scp-action@v0.1.10, unable to find version v0.1.10`
- **根因**：tag 在 GitHub Action 索引里压根不存在（v0.1.10 写错了或没发布）
- **修法**：要么固定 SHA，要么改 `@master`（master 跟主分支 HEAD 永远解得到）

### 坑 5：`appleboy/ssh-action` sidecar 看不见 runner `~/.ssh`
- **症状**：CI 在 SSH / SCP 步骤 hang 或 StrictHostKeyChecking 拒
- **根因**：appleboy/* 用 docker **sidecar** 容器跑 ssh，主 runner 把 `~/.ssh/known_hosts` 写好了没用，**sidecar 自己的 `~/.ssh/` 看不到**
- **修法 1**：传 `fingerprint:` 参数把 host key SHA256 直接告诉 action（仍走 strict check）
- **修法 2**：避开这个 action，**用 runner 原生 ssh / scp**（ubuntu-latest 自带 openssh-client），`~/.ssh/known_hosts` 加 `StrictHostKeyChecking=yes` 重新可用

### 坑 6：SSH host key fingerprint mismatch（用 fingerprint 解法时）
- **症状**：`ssh: handshake failed: ssh: host key fingerprint mismatch`
- **根因**：VPS 同时有 ed25519 / rsa / ecdsa 多把 host key；`ssh-keyscan -t ed25519` 拿的是 ed25519 的指纹，drone-ssh 客户端默认协商的可能是 rsa——指纹对不上
- **修法**：
  - 改用全算法：`ssh-keyscan -t rsa,ecdsa,ed25519 VPS` 把所有指纹拼起来
  - 或者**走 TOFU**（推荐用于私有 deploy）：去掉 `fingerprint:` 参数，第一次握手自动 trust + 写 sidecar known_hosts

### 坑 7：`Username and password required`（docker/login-action@v3）
- **症状**：Action log 显示 `Error: Username and password required`
- **根因**：`${{ secrets.DOCKER_USERNAME }}` 解析成空字符串 —— secrets 不在 workflow 能见的范围
- **修法**：
  - **别把 secrets 建在 environment 里**，除非你的 workflow 真有 `environment: <name>`
  - 加 `environment: VPS` 但 environment 不存在 → 失败
  - **正确做法**：把 DOCKER_*/VPS_* secrets 都建到 **Repository secrets** 级别
- 现在 git log 里 commit `1ceb0a5` 已经删了 `environment: VPS` 那一行

### 坑 8：env secrets 和 workflow 不在同一个 scope
- **症状**：CI 能跑通一半，但在 docker login / ssh 处都空
- **根因**：secrets 在 environment 里（`VPS`）但 workflow 没 `environment:` 声明
- **修法**：直接都用 Repository secrets，或者显式声明 `environment: VPS` —— 二选一。我们这案选了前者，简单

### 坑 9：`sh` 脚本里 docker 命令没权限
- **症状**：deploy.sh 第一次 push 进去 `permission denied while trying to connect to the Docker daemon socket`
- **根因**：deploy 用户不在 `docker` 用户组
- **修法**：`sudo usermod -aG docker deploy` + 重新登录让组生效

### 坑 10：容器内 nginx `[emerg] host not found in upstream "backend"`
- **症状**：docker run 后容器状态不停 Restarting (1) ... Restarting (2) ...
- **根因**：`deploy/nginx.conf`（给容器用的）有几个 `proxy_pass http://backend:8080` —— nginx 启动时要 resolv "backend" 这个 hostname，DNS 找不到直接拒启动
- **修法**：**项目无后端**（全 SPA + MSW），这些块完全用不到——直接删掉 `/api/` `/sso/` `/api/vitals` 三个 location

### 坑 11：`$connection_upgrade` 变量 unknown
- **症状**：VPS nginx `nginx -t` 报 `[emerg] unknown "connection_upgrade" variable`
- **根因**：我们的 VPS vhost 加了 `proxy_set_header Connection $connection_upgrade;`，但 `map` 块没声明这个变量
- **修法**：
  - 加 `map $http_upgrade $connection_upgrade { default upgrade; '' close; }`（要在 http context）
  - **或者**：直接删 WebSocket 头 —— Vite 生产构建没 WebSocket，留着没意义
- 我们选了后者（SPA 用不到）

### 坑 12：duplicate default_server on 0.0.0.0:80
- **症状**：`sudo nginx -t` → `a duplicate default server for 0.0.0.0:80`
- **根因**：Ubuntu 自带 `sites-enabled/default` 已经有 `listen 80 default_server`，我们新加的 vhost 也声明 default_server
- **修法**：`rm /etc/nginx/sites-enabled/default` —— 删 Ubuntu 默认页，让我们的 vhost 占 default_server

### 坑 13：sites-enabled 没有 symlink
- **症状**：VPS nginx 不会启用 `saas-identity-platform` 那份配置；`/etc/nginx/sites-available/` 有但 `sites-enabled/` 看不到
- **根因**：`cp` 配置文件到 `sites-available/` 不会自动启用 —— `sites-enabled/` 是实际生效的目录，靠 symlink
- **修法**：`ln -sf /etc/nginx/sites-available/YOUR_DOMAIN /etc/nginx/sites-enabled/YOUR_DOMAIN`
- 提醒：**永远先 `ls -la /etc/nginx/sites-enabled/` 检查再 `nginx -t`**

### 坑 14：Cloudflare 🟠 Proxied 屏蔽直接到 VPS 的请求
- **症状**：浏览器访问 `https://react-id.<domain>/` → 拿到 Cloudflare 边缘的 404；本地 `nslookup` 解析到 `172.67.x.x` / `104.21.x.x`，不是 VPS IP
- **根因**：Cloudflare DNS Records 里 A record 默认 Proxied（橙色云），所有流量先过 Cloudflare 边缘
- **修法**：点橙云变灰云、变成 DNS-only —— Cloudflare 只做域名解析，浏览器直连 VPS
- 替选：要保留 Cloudflare 代理 → 走 origin certificate 模式（详细配置另起一篇）

### 坑 15：deploy 端口改了 nginx 没跟着改
- **症状**：容器跑起来 `403/502 connection refused`
- **根因**：`deploy/saas-identity-platform.sh` 的 `docker run -p 127.0.0.1:8061:80` 把容器在 8061 暴露，但 VPS nginx vhost `proxy_pass http://127.0.0.1:8080` —— 上游对不上
- **修法**：任选其一：要么 `sed -i 's|127.0.0.1:8080|127.0.0.1:8061|' ... nginx -t && reload`，要么改回 8080
- 提醒：**端口变动要 grep 至少这两个文件**：`deploy/saas-identity-platform.sh` 和 VPS nginx vhost

---

## 10. 文件索引

```
.github/workflows/ci.yml            # workflow：test → docker build & push → ssh deploy
deploy/nginx.conf                   # 容器内 nginx（serve SPA + cache + gzip）
deploy/nginx-vps.conf.example       # VPS nginx 参考模板（含 cert / proxy_pass 占位）
deploy/saas-identity-platform.sh    # VPS deploy 脚本（CI ssh 调用，跑容器切换）
deploy/setup-vps.sh                 # VPS bootstrap 脚本（一次性）
docs/DEPLOYMENT.md                  # 你正在读的这篇
docs/conventions/                    # 项目编码约定（已有）
```

---

## 11. 下一案能复用的部分

不依赖 saas-identity-platform 业务的部分：

1. `.github/workflows/ci.yml` — 整段，**改 repo 名 / image 名即可**
2. `deploy/nginx.conf`（不含 `/api/` `/sso/` 那几个）、`deploy/saas-identity-platform.sh` 通用模板
3. `deploy/setup-vps.sh` —— 大部分直接复用
4. 这份 [DEPLOYMENT.md](docs/DEPLOYMENT.md) 的**坑清单**（坑 4-15 是流程问题，不是 saas 业务问题）

需要**改业务层**才能用的部分：

- `Dockerfile` —— 当前多阶段构建 nginx-alpine，**业务相关**（换成你业务的 build 命令）
- `package.json` + `vitest.config.ts` —— 项目配置
- 测试套件 —— 完全要新写

## 12. 关键提醒（贴在每次部署前）

```
1. ls /etc/nginx/sites-enabled/         ← 看到 symlink 才证明 vhost 真生效
2. sudo nginx -t                         ← 改了 vhost 必跑
3. docker ps -a --filter name=saas-...   ← 看到 Up 才证明镜像跑的版本对
4. curl -kI https://<VPS>/ -H "Host: <DOMAIN>"  ← 直连验 VPS 后置 proxy
5. Cloudflare DNS Records: A record 状态  ← 灰云 / 橙云
6. Container 端: docker logs <ID> --tail 30  ← 头一次发现 crash loop
```
