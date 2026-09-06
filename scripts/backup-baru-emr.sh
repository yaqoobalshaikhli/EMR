#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_PATH:=/opt/baru-openemr}"
: "${BACKUP_DIR:=/var/backups/baru-openemr}"
: "${COMPOSE_PROJECT_NAME:=baru-openemr}"

mkdir -p "$BACKUP_DIR"
cd "$DEPLOY_PATH"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
docker compose --project-name "$COMPOSE_PROJECT_NAME" -f current/docker/baru/docker-compose.yml --env-file .env exec -T mysql \
  mariadb-dump --all-databases --single-transaction --quick --routines --events \
  > "$BACKUP_DIR/database-$timestamp.sql"
site_volume="$(docker volume ls --format '{{.Name}}' | awk -v prefix="${COMPOSE_PROJECT_NAME}_" '$0 == prefix "sitevolume" { print; exit }')"
test -n "$site_volume"
docker run --rm \
  -v "$site_volume:/data:ro" \
  -v "$BACKUP_DIR:/backup" \
  alpine:3.22 \
  tar -czf "/backup/sites-$timestamp.tar.gz" -C /data .
find "$BACKUP_DIR" -type f -mtime +14 -delete
echo "Backup created in $BACKUP_DIR"
