---
sidebarTitle: "Test Connectivity"
title: "Runbook: Test Connectivity"
---

Verify all services are running and accessible.

## Overview

This runbook validates:

- Docker is running
- All containers are healthy
- Internal ports are open
- Health endpoints respond
- External access works (once DNS points api.&lt;domain&gt; at the load balancer)

## Prerequisites

- [ ] Core services deployed ([core.md](/runbooks/core))
- [ ] Database configured ([database.md](/runbooks/database))

## Steps

### 1. Run Connectivity Test

```bash
unoverse deploy test
```

### 2. Manual Verification (Optional)

```bash
# SSH to VM
ssh root@<VM_IP>

# Check containers
docker compose ps

# Check logs
docker compose logs --tail=50 unoverse
docker compose logs --tail=50 canvas
```

## Expected Output

```
============================================
PLATFORM HEALTH CHECK
============================================
Host: universe-prod (203.0.113.10)

── Infrastructure ──
Docker: OK

Containers:
  unoverse   Up 2 hours
  memory     Up 2 hours
  canvas     Up 2 hours
  umap       Up 2 hours

Restarting: NONE

── Ports ──
  - Canvas (3001): OK
  - Unoverse (4105): OK
  - Engine (4101): OK
  - Memory (4104): OK

── External Dependencies ──
Redis: REACHABLE
Database: REACHABLE

── Health Endpoints ──
  - Unoverse: OK
  - Engine: OK
  - Memory: OK

── UMAP (Docker DNS) ──
Unoverse → umap:5001: OK

── API Endpoints (read) ──
  - GET /api/workflows: 200
  - GET /api/nodes: 200

── API Write Test ──
  - POST /workflows (engine): 201

── Prompt Blocks (internal :4106) ──
  blocks=12

── Node catalogue ──
nodes=97

── Recent Errors in Logs ──
(none)

── Public Domain ──
Domain: example.org
  - https://api.example.org/health: 200
============================================
```

> **Note:** The domain check reads `DOMAIN=` from `/opt/gravity/.env`. If set to `example.com` or empty, domain checks are skipped.

## Service Health Endpoints

| Service      | URL                            | Expected |
| ------------ | ------------------------------ | -------- |
| Unoverse     | `http://localhost:4105/health` | 200 OK   |
| Workflow engine (in-process on unoverse) | `http://localhost:4101/health` | 200 OK   |
| Memory       | `http://localhost:4104/health` | 200 OK   |
| UMAP         | `http://umap:5001/health`, from inside the Docker network only | 200 OK   |

> unoverse serves `/health` on its public port `:4105` (host-reachable); it has no `/ready` endpoint. Its internal runtime port `:4106` is never published, so there is nothing to health-check from the host. `:4101` is the workflow engine surface, it runs in-process inside the unoverse container.

## Troubleshooting

| Issue                     | Cause               | Fix                                         |
| ------------------------- | ------------------- | ------------------------------------------- |
| Container not running     | Crashed on startup  | Check logs: `docker compose logs <service>` |
| Health check failed       | Missing env vars    | Verify `.env` at `/opt/gravity/.env`        |
| Port closed               | Service not started | Restart: `docker compose restart <service>` |
| Database connection error | Wrong DATABASE_URL  | Re-run [database.md](/runbooks/database)   |

## Quick Commands

```bash
# Restart all services
docker compose restart

# Restart one service
docker compose restart unoverse

# View logs
docker compose logs -f unoverse

# Check resource usage
docker stats
```

## Local Development Verification

Locally, the whole checklist is one command:

```bash
unoverse check
```

It checks that every service is up, that the database schema is current, and that the environment is complete.

## Next Steps

If all tests pass, your deployment is complete!

For ongoing operations, **upgrades** are `unoverse deploy`, which pulls the latest images
and restarts.
