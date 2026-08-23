---
sidebarTitle: "Deployment"
title: "Deployment"
---

Deploy Unoverse to production VMs.

## Overview

Production deployment uses `unoverse deploy`, which reads your ground's rendered configuration and runs Ansible playbooks to install and configure services on your VM.

## Prerequisites

- **Ansible installed locally** (`pip install ansible`). This is the one thing the CLI does
  not install for you, and the check lands late in a first deploy, so do it up front.
- Terraform and your cloud CLI are handled: `unoverse deploy` installs Terraform when it is
  missing, and offers to install `doctl`.

## The cloud API token

Deploying creates infrastructure in **your** cloud account: server, load balancer,
DNS, Postgres, Redis. That takes one credential, asked for once, when `unoverse
deploy` first runs:

- Generate it at [cloud.digitalocean.com/account/api/tokens](https://cloud.digitalocean.com/account/api/tokens)
- Scope: **Full Access** (Read Only cannot create infrastructure)
- It stays on your machine and is never shared

(The registry token you pasted at `unoverse create` is different and already
done: your Unoverse admin issued it, and it only pulls platform images.)

## Quick Deploy (Single VM)

```bash
unoverse deploy
```

That is the whole thing. With no server yet it asks which cloud, connects your cloud
account, completes the Terraform inputs, and shows you the plan in plain English with a
monthly estimate. Creating billable infrastructure is still your own explicit act: the
plan's yes is the gate, `d` prints the full technical plan, and the saved plan is what
runs. Then it installs the platform on what was built, migrations included.

Every deploy after that is the same command, and it does the same comparison: any pending
ground changes are planned and applied first, then the latest images ship.

## What the Rendered Configuration Contains

You never write it (Terraform renders it; deploy places it on the server), but for the curious it is the same format as `.env`, plus:

```bash
# Deploy target (where to SSH)
DEPLOY_HOST=134.209.x.x
DEPLOY_USER=root          # Azure: azureuser, AWS: ubuntu

# Production Redis (instead of local)
REDIS_HOST=your-managed-redis.com
REDIS_PORT=25061
REDIS_PASSWORD=your-password
REDIS_TLS=true

# Domain (TLS terminates at your ground's load balancer)
DOMAIN=yourdomain.com
```

Everything else (DATABASE_URL, Auth0, OpenAI) stays the same as your local `.env`.

## Runbooks

For detailed step-by-step guides, see the [Runbooks](/runbooks/overview):

| Runbook                                             | Description                    |
| --------------------------------------------------- | ------------------------------ |
| [core](/runbooks/core)                   | Deploy core app services       |
| [database](/runbooks/database)           | Set up database tables         |
| [harden](/runbooks/harden)               | Security hardening             |
| [test](/runbooks/test)                   | Verify connectivity and health |

## Deploying Your Own Work

Content does not ride `unoverse deploy` (that moves platform images only). Your work reaches the server three ways:

- **Studio publish**: publishes straight to the universe over the API. It lands in the universe's database and needs no deploy, no restart.
- **Marketplace items**: installed per item from Studio's Marketplace tab; database-driven, no restart.

## Start on a Test Domain, Swap Later

The domain is a Terraform input, not a commitment. Deploy today under any domain you control (even a delegated subdomain like `acme-poc.yourcompany.com`) and move to the real one when it exists. Nothing in the universe's data references the hostname.

The swap:

1. Change `domain` in `terraform.tfvars`, then `terraform apply`. A new certificate and DNS records are created; the VM, database, Redis, and everything in them are untouched.
2. Redeploy: delete `.env.production` at the repo root and run `unoverse deploy`, it re-renders from the applied ground.
3. Update your IdP: add the new origins and callback URLs in Auth0 or Cognito. This is the only manual step, and the one people forget.

Swap before handing URLs to real users: browser sessions and shared links reference the old hostname, and that is the entire cost of the move.

Working with no domain at all also gets you surprisingly far: `http://IP:3001` and `http://IP:4105` prove a deployment is healthy. You just cannot log in until HTTPS exists, because OIDC providers refuse plain-IP redirect flows.

## Challenge Complete

Your platform is deployed to production.
