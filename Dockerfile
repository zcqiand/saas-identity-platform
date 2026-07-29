# 多阶段构建：先构建 SPA + Hono API，再用 nginx + node + supervisord serve
#
# 运行栈（容器内）：supervisord 同时拉
#   - nginx 80   ：serve SPA + 反代 /api/ → 127.0.0.1:5176
#   - node 5176  ：saas 真后端（dev-server/ 的 4 条 auth 端点 + /health）
#
# ch42 部署升级：原来是 nginx-alpine 只 serve SPA；现在 dev-only Hono
# 提升到 prod，让 react-lab.xiangru.uk 的 auth 跨域真端点可调。

# —— Stage 1: build ——
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# SPA build（vite build → dist/）
RUN npm run build
# Hono API build（esbuild bundle dev-server/server.ts → dist-server/）
RUN npm run build:api

# —— Stage 2: serve ——
# alpine 体积小，自带 apk；debian-bookworm-slim 没自带 supervisor。
FROM alpine:3.20 AS serve
RUN apk add --no-cache nginx nodejs supervisor

# SPA + 反代 /api/
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# supervisord 拉 nginx + node
COPY deploy/supervisord.conf /etc/supervisord.conf

# SPA 静态产物
COPY --from=build /app/dist /var/www/frontend

# Hono server.js + 必需的 prod deps（Hono 是 external，不进 bundle）
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/dist-server /app/dist-server

EXPOSE 80 5176

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
