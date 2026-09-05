---
sidebarTitle: "Core Services"
title: "Runbook: Core Services"
---

Deploy the core unoverse services to a VM.

## Services Deployed

| Service | Port | Description |
| ---------------- | ---- | ----------------------------------- |
| **unoverse** | 4105 | Platform runtime: workflow engine (in-process), node plane, `/api`, native MCP (`/mcp`), data plane |
| **memory** | 4104 | Evidence-based user memory |
| **canvas** | 3001 | Web UI |

> **unoverse has three listeners.** `:4105` is the public port (JWT-gated: `/api/*`, MCP defs, workbench, `/plugins` management, `/health`). `:4106` is the internal node runtime (`/execute`, `/nodes`, `/skills`, `/health`), it lives on the Docker network only and is deliberately never published or proxied; network isolation is the trust boundary. `:4101` is the workflow engine surface (internal; other containers reach it as `http://unoverse:4101`).

## VM Requirements

Sized by `size` in terraform.tfvars (`small` | `medium` | `large`). All sizes are single-VM: the size scales the box and the stores, never the topology.

## Prerequisites

- [ ] Terraform ground applied (VM, load balancer + TLS, firewall, Postgres, Redis: see the [overview](/runbooks/overview))
- [ ] DOCR token in your terraform.tfvars (from your unoverse admin)

## Steps

### 1. Provision

Your applied ground IS the configuration: there is nothing to write:

```bash
unoverse deploy
```

It asks which cloud, completes `terraform.tfvars`, and applies the plan you approve.
A platform team can drive Terraform directly instead
(`cd infra/digitalocean && terraform apply`), and deploy picks up from the applied ground.

> **Do not set `ansible_become_password` or `ansible_become_flags`** for cloud VMs. Their default users already have passwordless sudo configured by the cloud provider.

### 2. Run Core Platform Installation

The same `unoverse deploy` continues straight into this once the ground is up. It knows a
server it has not set up yet, and runs the first-time install by itself; there is no
separate command for it.

One command, three phases: installs Docker, pulls DOCR images, and starts every service (unoverse, memory, **canvas**, umap, Dozzle); sets up the database; and verifies connectivity. Hardening is a deliberate follow-up (`unoverse deploy harden`, [harden](/runbooks/harden)) when a universe graduates from POC. The CLI reads the deploy target from your ground's rendered configuration and generates a temporary Ansible inventory on every run, so there is no inventory file to maintain.

Every deploy after the first is just:

```bash
unoverse deploy
```

### 3. Verify (re-run any time)

```bash
unoverse deploy test
```

## Expected Output

```
============================================
UNOVERSE PLATFORM DEPLOYED
============================================
Host: universe-prod (203.0.113.10)

Service Health:
  - Unoverse (:4105):  OK
  - Engine   (:4101):  OK
  - Memory   (:4104):  OK

Access URLs:
  - Canvas:    http://203.0.113.10:3001
  - API:       http://203.0.113.10:4105
  - Memory:    http://203.0.113.10:4104/dashboard
============================================
```

> **Memory dashboard is internal-only.** Access via SSH tunnel: `ssh -L 4104:localhost:4104 root@<VM_IP>` then open `http://localhost:4104/dashboard`. It is never exposed through the load balancer.

## Troubleshooting

| Issue | Cause | Fix |
| ------------------- | ---------------- | ---------------------------------------------- |
| DOCR login failed | Invalid token | Get a new DOCR token from your unoverse admin |
| Service unhealthy | Missing env vars | Check `/opt/gravity/.env` on the VM (placed there by deploy) |
| Port already in use | Previous install | Run `docker compose down` first |

## Next Steps

- [database.md](/runbooks/database) - Configure database connection
- Your own nodes, design, and prompts arrive through `unoverse deploy studio` or the marketplace, never through this deploy
