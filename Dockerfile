# 多阶段构建：先构建前端产物，再用 nginx serve
# ch42：部署配置，生产用 nginx 托管 SPA + API 反向代理

# —— Stage 1: build ——
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# —— Stage 2: serve ——
FROM nginx:alpine AS serve

# 拷贝全栈 nginx 配置
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# 拷贝构建产物
COPY --from=build /app/dist /var/www/frontend

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1
