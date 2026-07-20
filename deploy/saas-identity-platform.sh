#!/bin/sh
# Usage: saas-identity-platform.sh <DOCKER_USERNAME> <DOCKER_PASSWORD>
#
# 由 .github/workflows/ci.yml 的 deploy job 远程调用：
#   ssh deploy@vps -- cd /home/deploy/saas-identity-platform
#                    && sh saas-identity-platform.sh $DOCKER_USERNAME $DOCKER_PASSWORD
#
# 前置：deploy 用户需在 docker 组中（sudo usermod -aG docker deploy），
# 才能免 sudo 跑 docker 命令。
#
# 容器绑到 127.0.0.1:8080，仅本机可见；VPS 上 nginx 仍然守着 80/443 用
# proxy_pass http://127.0.0.1:8080 把流量转进来；HTTPS 证书、域名等都还在 nginx。

set -eu

USERNAME="${1:-}"
PASSWORD="${2:-}"
IMAGE="${USERNAME}/saas-identity-platform:latest"

if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
  echo "Usage: $0 <DOCKER_USERNAME> <DOCKER_PASSWORD>" >&2
  exit 2
fi

echo "→ docker login"
printf '%s' "$PASSWORD" | docker login -u "$USERNAME" --password-stdin

echo "→ docker pull ${IMAGE}"
docker pull "$IMAGE"

echo "→ docker stop & rm saas-identity-platform"
docker stop saas-identity-platform 2>/dev/null || true
docker rm   saas-identity-platform 2>/dev/null || true

echo "→ docker run"
docker run -d \
  --name saas-identity-platform \
  --restart unless-stopped \
  -p "127.0.0.1:8080:80" \
  "$IMAGE"

echo "→ docker image prune"
docker image prune -f

echo "→ docker ps"
docker ps --filter name=saas-identity-platform

echo "→ deploy done at $(date -u)"
