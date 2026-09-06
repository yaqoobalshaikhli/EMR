# Baru EMR deployment runbook

This runbook assumes an Ubuntu/Debian VPS with a public IPv4 address and SSH
access. Do not paste passwords or private SSH keys into Git, chat, or `.env`
files committed to the repository.

## 1. Prepare the host

```sh
ssh root@YOUR_SERVER_IP
apt-get update
apt-get install -y ca-certificates curl git ufw
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

Create a non-root deployment user and add its public key:

```sh
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
install -m 600 -o deploy -g deploy /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
```

## 2. Upload and configure

From the repository checkout, create the destination and upload the environment
template first:

```sh
export DEPLOY_HOST=YOUR_SERVER_IP
export DEPLOY_USER=deploy
export DEPLOY_PATH=/opt/baru-openemr
export DEPLOY_DOMAIN=baru-healthservices.com
ssh "$DEPLOY_USER@$DEPLOY_HOST" "sudo mkdir -p '$DEPLOY_PATH' && sudo chown -R '$DEPLOY_USER':'$DEPLOY_USER' '$DEPLOY_PATH'"
scp docker/baru/.env.example "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/.env.example"
```

Before the first upload, create the host-only environment file:

```sh
ssh deploy@YOUR_SERVER_IP
sudo mkdir -p /opt/baru-openemr
sudo cp /opt/baru-openemr/docker/baru/.env.example /opt/baru-openemr/.env
sudo nano /opt/baru-openemr/.env
sudo chown deploy:deploy /opt/baru-openemr/.env
chmod 600 /opt/baru-openemr/.env
```

Set unique random values for `MYSQL_ROOT_PASSWORD`, `MYSQL_PASS`, and
`OE_PASS`. Keep `DEPLOY_DOMAIN=baru-healthservices.com`. Then run:

```sh
exit
./scripts/deploy-baru-emr.sh
ssh deploy@YOUR_SERVER_IP
cd /opt/baru-openemr
docker compose -f docker/baru/docker-compose.yml --env-file .env up -d --build
docker compose -f docker/baru/docker-compose.yml --env-file .env ps
curl --fail --silent --show-error https://baru-healthservices.com/meta/health/readyz
```

The first boot can take several minutes while MariaDB initializes and
OpenEMR creates its site database.

## 3. Switch DNS

At the DNS provider, replace the existing root-domain records with:

| Record | Name | Value |
|---|---|---|
| A | `@` | `YOUR_SERVER_PUBLIC_IPV4` |
| CNAME | `www` | `baru-healthservices.com` |

If Cloudflare is used, leave the proxy enabled after confirming the origin
works. Caddy obtains and renews the origin certificate automatically; ensure
ports 80 and 443 remain reachable for certificate issuance and renewal.

## 4. Backups and rollback

Run a backup before upgrades and schedule it with root's cron:

```sh
cd /opt/baru-openemr
BACKUP_DIR=/var/backups/baru-openemr ./scripts/backup-baru-emr.sh
```

Keep the existing Cloudflare Pages deployment available until the EMR has
passed login, patient registration, appointment, encounter signing, billing,
Arabic, and Kurdish acceptance checks. To roll back, point the root DNS record
back to the previous Pages target and wait for DNS propagation.

## GitHub Actions alternative

Instead of running the upload command locally, add these **GitHub production
secrets**: `BARU_DEPLOY_HOST`, `BARU_DEPLOY_USER`, `BARU_DEPLOY_SSH_KEY`, and
optionally `BARU_DEPLOY_PATH`. Run **Actions → Deploy Baru EMR**. The workflow
does not contain or print the database secrets; those remain in the host's
`.env`.
