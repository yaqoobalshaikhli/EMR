#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?Set DEPLOY_HOST to the Docker host}"
: "${DEPLOY_USER:?Set DEPLOY_USER to the SSH user}"
: "${DEPLOY_PATH:=/opt/baru-openemr}"
: "${DEPLOY_DOMAIN:=baru-healthservices.com}"
: "${COMPOSE_PROJECT_NAME:=baru-openemr}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
archive="$(mktemp "${TMPDIR:-/tmp}/baru-openemr.XXXXXX.tar.gz")"
trap 'rm -f "$archive"' EXIT

tar --exclude='.git' --exclude='node_modules' --exclude='vendor' \
  --exclude='public/assets' --exclude='sites/*/documents' \
  --exclude='sites/*/config.php' --exclude='sites/*/sqlconf.php' \
  -czf "$archive" -C "$repo_root" .

ssh "$DEPLOY_USER@$DEPLOY_HOST" "mkdir -p '$DEPLOY_PATH'"
scp "$archive" "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/release.tar.gz"
ssh "$DEPLOY_USER@$DEPLOY_HOST" "set -eu
  release='$DEPLOY_PATH/releases/$(date -u +%Y%m%dT%H%M%SZ)'
  mkdir -p \"\$release\"
  tar -xzf '$DEPLOY_PATH/release.tar.gz' -C \"\$release\"
  rm -f '$DEPLOY_PATH/release.tar.gz'
  test -f '$DEPLOY_PATH/.env' || { echo 'Create .env from docker/baru/.env.example first.' >&2; exit 1; }
  ln -sfn \"\$release\" '$DEPLOY_PATH/current'
  docker compose --project-name '$COMPOSE_PROJECT_NAME' -f \"\$release/docker/baru/docker-compose.yml\" --env-file '$DEPLOY_PATH/.env' up -d --build
  docker compose --project-name '$COMPOSE_PROJECT_NAME' -f \"\$release/docker/baru/docker-compose.yml\" --env-file '$DEPLOY_PATH/.env' ps
  curl --fail --silent --show-error --retry 10 --retry-delay 3 --resolve '$DEPLOY_DOMAIN:443:127.0.0.1' \"https://$DEPLOY_DOMAIN/meta/health/readyz\" >/dev/null
  echo 'Deployment healthy at https://$DEPLOY_DOMAIN'
"
