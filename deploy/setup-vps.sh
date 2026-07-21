#!/bin/sh
# setup-vps.sh — VPS 一次性 bootstrap（Ubuntu/Debian）
#
# 用法：
#   sudo sh deploy/setup-vps.sh react-id.example.com
#
# 这个脚本干这些事：
#   1. apt 装 nginx、docker（如未装）
#   2. 创建 deploy 用户（key-only SSH、无密码登录）
#   3. 加 deploy 进 docker 组（不需要 sudo 跑 docker 命令）
#   4. 装 /home/deploy/saas-identity-platform/ 目录
#   5. 渲染 deploy/nginx-vps.conf.example → /etc/nginx/sites-available/$DOMAIN
#   6. 启用 sites-enabled symlink；删 Ubuntu 默认页避免 default_server 冲突
#   7. nginx -t && reload
#
# 你**还要做**的（不在脚本里：
#   a) 把 .crt / .key 放到 /etc/nginx/ssl/your-cert.{crt,key}
#   b) ssh-copy-id -i ~/.ssh/id_ed25519_gh-deploy.pub deploy@VPS  ← 装 deploy 用户的 SSH key
#      （在本地跑，VPS 上 authorized_keys 写好）
#   c) GitHub Secrets 加：
#        DOCKER_USERNAME / DOCKER_PASSWORD / VPS_HOST / VPS_USER / VPS_SSH_KEY
#
# 注意：脚本里 `cert` / `ssh key` 这些**私钥完全不接触**——它们只在 VPS 本地文件系统。

set -eu

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then
  echo "Usage: $0 <your-domain.example.com>" >&2
  exit 1
fi

log() { printf '→ %s\n' "$*"; }

# ── 1. 系统包 ─────────────────────────────────────
if ! command -v nginx >/dev/null 2>&1; then
  log "install nginx"
  apt-get update
  apt-get install -y nginx
fi
if ! command -v docker >/dev/null 2>&1; then
  log "install docker.io"
  apt-get install -y docker.io
fi

# ── 2. deploy 用户（无密码、SSH key only） ─────────
if ! id deploy >/dev/null 2>&1; then
  log "create deploy user"
  adduser --disabled-password --gecos "" --shell /bin/bash deploy
fi
log "ensure deploy in docker group"
usermod -aG docker deploy
# sudoers 限权（deploy 用户能免 sudo reload nginx — CI 之后可触发）
cat > /etc/sudoers.d/deploy-nginx <<'SUDO'
deploy ALL=(root) NOPASSWD: /usr/sbin/nginx -s reload
SUDO
chmod 440 /etc/sudoers.d/deploy-nginx

# ── 3. 部署目录 ────────────────────────────────────
log "create /home/deploy/saas-identity-platform/"
sudo -u deploy mkdir -p /home/deploy/saas-identity-platform

# cert 目录占位
mkdir -p /etc/nginx/ssl
chmod 700 /etc/nginx/ssl

# ── 4. 渲染 nginx vhost template ───────────────────
# 这份脚本要被 `cd deploy && sudo sh setup-vps.sh` 跑才找得到 template，
# 但实际更可能从 GitHub 拉 nginx-vps.conf 后再跑。
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE="${SCRIPT_DIR}/nginx-vps.conf.example"
if [ ! -f "$TEMPLATE" ]; then
  echo "Missing template: $TEMPLATE" >&2
  echo "Either run this from the deploy/ directory or git checkout first." >&2
  exit 2
fi

TARGET="/etc/nginx/sites-available/${DOMAIN}"
log "render → $TARGET"
sed "s/YOUR_DOMAIN/${DOMAIN}/g" "$TEMPLATE" > "$TARGET"

# ── 5. 启用 + 解决 default_server 冲突 ───────────────
log "enable site, drop sites-enabled/default"
ln -sf "$TARGET" "/etc/nginx/sites-enabled/${DOMAIN}"
rm -f /etc/nginx/sites-enabled/default

# ── 6. nginx 检查 + reload ─────────────────────────
log "nginx -t"
nginx -t
log "reload"
systemctl reload nginx

log "VPS 配置完成"
log "剩下手工："
log "  1) /etc/nginx/ssl/your-cert.{crt,key}  ← fullchain + privkey"
log "  2) ssh-copy-id -i ~/.ssh/id_ed25519_gh-deploy.pub deploy@$(hostname -I | awk '{print $1}')"
log "  3) GitHub Secrets: DOCKER_USERNAME / DOCKER_PASSWORD / VPS_HOST / VPS_USER / VPS_SSH_KEY"
