# Baru EMR brand baseline

The default light theme now uses the initial Baru EMR visual system:

- **Deep navy** (`#102a33`) for navigation and primary text
- **Clinical teal** (`#147d86`) for primary actions and links
- **Soft blue-green neutrals** for surfaces, fields, and separators

The palette is defined in `interface/themes/oe-styles/style_light.scss` so it
is compiled consistently for the standard, compact, and RTL light theme
variants. Site-specific logos should be added under
`sites/default/images/logos/`; OpenEMR's `LogoService` will prefer those
over the built-in assets without requiring template changes.

Before production rollout, replace the provisional "EMR Health" name and
palette with the approved company name, logo assets, and accessibility-tested
contrast values.

## Preview

Open `custom/branding/preview.html` directly in a browser to review the
branded dashboard and the intended check-in → rooming → clinical note →
checkout workflow without requiring PHP, Node, or a database.

The preview uses the local `custom/branding/logo.png` asset so the logo loads
reliably from both `file://` previews and HTTP deployments. The OpenEMR site
override copies remain under `sites/default/images/logos/`.

The preview language selector supports English, Arabic, and Sorani Kurdish,
including right-to-left layout switching. OpenEMR's database already includes
Arabic (`ar`) and Kurdish (`ku`) language options for patient preferences. The
full application UI still needs translated language-pack strings imported
through OpenEMR's language tools; selecting a patient language alone does not
translate every application label.

The preview tables now translate their headers, visit types, statuses, and task
labels in Arabic and Kurdish. It also remembers the selected language locally
and shows whether the browser is online or offline. `custom/branding/sw.js`
caches the preview shell for offline reopening when the preview is served from
an HTTP origin (service workers do not run from `file://` URLs).

This offline mode is a local demonstration only. Real OpenEMR data cannot be
stored safely in a static browser page. Production offline clinical work needs
an authenticated local data store, an encrypted device policy, conflict
resolution, audit logging, and a server synchronization API.

The supplied Baru logo is installed as a site override in:

- `sites/default/images/logos/core/login/primary/logo.png`
- `sites/default/images/logos/core/menu/primary/logo.png`
- `sites/default/images/logos/portal/primary/logo.png`

## Deployment

The production compose file starts OpenEMR with MariaDB and persistent
volumes. For a customized deployment, build the repository as the application
image instead of using the upstream `openemr/openemr:8.3.0` image, then run
the compose stack on a VPS or a hosting service that supports Docker Compose.
Expose HTTPS through the host's reverse proxy, keep the database and `sites`
volumes persistent, and set strong values for `MYSQL_ROOT_PASSWORD`, `OE_USER`,
and `OE_PASS` through the host's secret manager.

The exact Baru deployment command depends on what Baru provides (Docker
Compose, a container registry, or Git-based PHP hosting). The repository is
ready for the Docker path, but deployment cannot be executed until the Baru
project URL, deployment method, and credentials are available.

### Current domain check

`https://baru-healthservices.com` currently serves a Cloudflare Pages/Nuxt
site and identifies its deployment as
`b89ee690.baru-website.pages.dev`. It does not expose an OpenEMR route and
returns `404` for `/openemr/` and OpenEMR health endpoints. Cloudflare Pages
can host the static preview, but it cannot run OpenEMR's PHP application and
MariaDB database.

To make the EMR the main application at this domain, provision a VPS or
managed container service, point `baru-healthservices.com` to it, run
`docker/baru/docker-compose.yml` with persistent volumes and secrets, and
allow the included Caddy edge service to terminate HTTPS and proxy internally
to OpenEMR. This replaces the current root website only after DNS is changed;
keep the existing Cloudflare Pages project available as a rollback target.

This repository now includes an automated deployment path:

1. Provision a Docker host and point `baru-healthservices.com` to it.
2. On the host, create `/opt/baru-openemr/.env` from
   `docker/baru/.env.example` with unique secrets.
3. Add GitHub production secrets `BARU_DEPLOY_HOST`, `BARU_DEPLOY_USER`,
   `BARU_DEPLOY_SSH_KEY`, and optionally `BARU_DEPLOY_PATH`.
4. Run **Actions → Deploy Baru EMR**, or push the configured paths to `main`.

The workflow uses `scripts/deploy-baru-emr.sh`, builds
`docker/baru/Dockerfile`, preserves Docker volumes, puts Caddy in front for
HTTP/2, compression, keep-alive connections, and automatic certificates, and
fails unless the public OpenEMR readiness endpoint responds successfully.
`scripts/backup-baru-emr.sh` creates a database dump and sites archive for
scheduled host backups.
