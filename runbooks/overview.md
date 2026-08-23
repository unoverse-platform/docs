---
sidebarTitle: "Overview"
title: "Runbooks"
---

Running a universe is three phases. `unoverse deploy` drives the first two, and these runbooks cover the third:

1. **Provision**: your ground (`infra/digitalocean` or `infra/aws`) creates the VM, load balancer, TLS certificate, firewall, Postgres, and Redis, and renders the complete production configuration.
2. **Deploy**: the platform is installed onto what was built, migrations included.
3. **Operate**: database, hardening, health, restarts: the runbooks below.

---

## Provision (Terraform, driven by the CLI)

```bash
unoverse deploy
```

The first run has no server yet, so it asks which cloud, connects your cloud account,
completes `terraform.tfvars`, plans, and applies what you approve. Terraform is still the
interface underneath, and a platform team can drive it directly instead
(`cd infra/digitalocean && terraform init && terraform apply`); deploy then picks up from
the applied ground.

Everything infrastructure is the ground's job and never a runbook's: TLS (DO managed Let's Encrypt / AWS ACM at the load balancer, no proxy software on the VM), DNS records, the cloud firewall (SSH and Dozzle admin-IP-only), Postgres (fresh, adopted, or BYO, see [database](/runbooks/database)), and Redis (always provisioned, TLS).

### Sizes

`size` in terraform.tfvars scales the box and the stores, never the topology (all sizes are single-VM). When multi-VM Active-Active arrives it will scale the app tier only: UMAP stays one shared service (`UMAP_SERVICE_URL`), because spatial coordinates are only comparable through the same trained model instance.

| Size | Guide |
| --- | --- |
| `small` | POC / first deployment |
| `medium` | Growing usage |
| `large` | Heavy usage |

### External Dependencies

| Component      | Requirement                 | Notes                                                                |
| -------------- | --------------------------- | -------------------------------------------------------------------- |
| **PostgreSQL** | 14+                         | Terraform-provisioned by default; adopt or BYO via terraform.tfvars  |
| **Redis**      | 7+                          | Always Terraform-provisioned (managed, TLS)                          |
| **Domain**     | DNS A records               | `api.<domain>` → the load balancer IP (Terraform prints it; can create the records too) |
| **TLS**        | The ground's load balancer  | DO managed Let's Encrypt / AWS ACM; on-prem brings its own terminator (443 → :4105, idle ≥ 3600s) |

### Supported Platforms

- **Cloud grounds:** DigitalOcean (`infra/digitalocean`), AWS (`infra/aws`)
- **On-prem:** any Ubuntu 22.04+ / Debian 12 VM, you own firewall and TLS, then Deploy and Operate are identical

---

## Deploy (the CLI)

```bash
# Everything: provision if needed, then install, database, verify
unoverse deploy

# Re-run first-time setup on its own, if you ever need to
unoverse deploy init

# When a universe graduates from POC: deliberate, never a default
unoverse deploy harden   # SSH keys-only, fail2ban, auto security updates
```

Each phase of `init` stays available on its own for re-runs: `deploy db`, `deploy test`.

The CLI reads the deploy target from your ground's rendered configuration and generates a temporary Ansible inventory on every run, so there is no inventory file to maintain.

Your own work (nodes, design, prompts) never rides a deploy: it arrives via Studio publish (over the API, live immediately) or the Marketplace (per item, database-driven).

---

## Operate (the runbooks)

| Runbook                                                                                                              | Description                                                                      | Command                     |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------- |
| [core](/runbooks/core)                                                                                              | Deploy core app services                                                         | `unoverse deploy init` / `deploy` |
| [database](/runbooks/database)                                                                                      | Database modes, tables, relocation                                               | `unoverse deploy db`        |
| [harden](/runbooks/harden)                                                                                          | Security hardening                                                               | `unoverse deploy harden`    |
| [test](/runbooks/test)                                                                                              | Verify connectivity and health                                                   | `unoverse deploy test`      |
| [restart-rebuild](/runbooks/restart-rebuild)                                                                        | Restart & rebuild decision table                                                 |  |
| [Architecture Diagrams](https://unoverse-platform.github.io/starter/docs/runbooks/architecture-diagrams/index.html) | Interactive system architecture diagrams ([local](./architecture-diagrams/index.html)) |  |

**Logs** need no runbook: Dozzle runs by default at `http://<VM_IP>:8080` (admin-IP-only via the cloud firewall), streams straight from the Docker socket, and stores nothing. Log growth is capped by `json-file` rotation (10 MB × 3 per service) in `docker-compose.yml`. Enterprise ships logs to its own SIEM by pointing the Docker logging driver there instead.

---

## Environment: One File You Write, One You Don't

**`.env` is yours**: local development only. Copy `.env.example`, set localhost Postgres, Redis, your OpenAI key, and your OIDC values (or `AUTH_ENABLED=false`). Docker compose reads it automatically. Gitignored.

**Production configuration is not a file you touch.** Your terraform.tfvars is the single input; everything downstream is machine-managed:

```
terraform.tfvars  ──apply──▶  ground (VM, LB+TLS, firewall, Postgres, Redis)
                                 │
                                 └─▶  rendered env  ──unoverse deploy──▶  /opt/gravity/.env on the server
```

The production env is never a file in your universe. Every deploy renders it from the applied ground (`terraform output -raw env_production`), ships it, and deletes it. Two things are worth knowing, and only two:

- **Your ground holds the master `CREDENTIAL_ENCRYPTION_KEY`.** Terraform generates it and keeps it in state, so back up your Terraform state alongside your database. A database backup is unreadable without that key, and no backup can bring it back.
- **There is nothing to edit.** To change any production value, edit `terraform.tfvars` and run `unoverse deploy <cloud>` again. It re-renders in full.

**How `DOMAIN` drives **canvas** URLs:**
When `DOMAIN=yourdomain.com` is set, `docker-compose.yml` automatically derives:

- `VITE_API_URL=https://api.yourdomain.com`
- `VITE_SERVER_WS_URL=wss://api.yourdomain.com`

When `DOMAIN` is unset (local dev), set `API_URL=http://localhost:4105` in `.env`, **canvas** calls the platform's public listener (unoverse `:4105`) directly.

---

## Prerequisites

- Terraform 1.5+ and your cloud CLI (doctl or aws) on your machine
- Ansible installed locally (`pip install ansible`)
- DOCR token for pulling images (from your unoverse admin)
