---
sidebarTitle: "The unoverse CLI"
title: "The unoverse CLI"
---

One CLI for everything: creating a project, launching **Studio**, and operating a
universe. It is the npm package `unoverse`: your universe folder carries **no tooling
at all**, just your content and a `docker-compose.yml`.

```bash Install it once
npm install -g unoverse
```

Run it from anywhere inside a universe folder and the operating commands appear; it
finds the universe the same way git finds a repo, by walking up from where you are.
Outside a universe, only the anywhere-commands are offered.

<Note>
There is no `./unoverse` any more. The universe used to ship its own copy of the CLI;
now one global binary does both halves, and `unoverse update` keeps it current.
</Note>

## Your first hour

The complete path to a running universe on your machine:

```bash
# LOCAL: run it on your machine
unoverse create          # choose "Universe": asks for your registry token,
                         # writes .env, sets up the database, pulls images
cd my-universe
unoverse start           # start every service
unoverse check           # green across the board? you're running
unoverse where           # your universe's addresses (Canvas, API, logs)
```

When you're ready for a server, one more:

```bash
unoverse deploy          # the whole journey, and the same command every time after
```

The first run has no server yet, so it asks which cloud, connects your cloud account,
prefills and completes the Terraform inputs, shows you the plan with a monthly estimate,
and builds it before shipping the platform onto it. Every run after that compares your
ground with reality, applies what changed, and deploys.

If anything misbehaves at any point: `unoverse check`. It runs the health check, the
schema check, and the environment diagnosis in one pass.

## Anywhere

| Command | What it does |
| --- | --- |
| `unoverse create` | Asks what you are building: a Studio project, a universe, or a client app, and sets it up. A universe is configured end to end here: token, `.env`, database. |
| `unoverse studio` | Launches **Studio**, downloading it on first run. |
| `unoverse where` | Prints your universe's addresses. |
| `unoverse update` | Updates the CLI itself (and refreshes the repo-local authoring skill when you are in a universe). |

## This universe

Available when you run the CLI anywhere inside a universe folder.

| Command | What it does |
| --- | --- |
| `unoverse start` | Starts all services, pulling any missing images. `start --pull` refreshes to the latest images first: this is how a local universe takes a platform update. |
| `unoverse stop` | Stops all services. |
| `unoverse check` | One health answer: containers and endpoints, database schema, and the deeper environment diagnosis. |
| `unoverse logs` | Opens the Dozzle log viewer. `unoverse logs <service>` streams one service's logs in the terminal. |
| `unoverse deploy` | Ships to your server: latest images, your work, migrations. |

<Note>
Commands that were separate ways to ask the same question are gone, not renamed:
`doctor`, `db-verify`, and `status` are all inside `check`; `db-setup` runs inside
`create` and `deploy`; `open` became `where`. Your own work, everything you build in
**Studio**, is never touched by any of them.
</Note>

## Deployment

`unoverse deploy` is the whole job: provisioning and shipping, first run and every run
after. The sub-commands below exist to re-run one piece on its own, and you should rarely
need them.

| Command | What it does |
| --- | --- |
| `unoverse deploy` | Everything. No server yet: picks the cloud, completes the Terraform inputs, plans, applies, then installs the platform. Server already there: applies any ground changes, pulls the latest images and restarts. |
| `unoverse deploy init` | Re-runs first-time setup on its own: install, database, verify. |
| `unoverse deploy db` | Re-runs database setup on the server. |
| `unoverse deploy test` | Runs a connectivity test against the deployed platform. |
| `unoverse deploy harden` | Security hardening, when a universe graduates from POC: SSH keys-only, fail2ban, automatic security updates. Never touches app ports or key-based root SSH, so future deploys and MCP clients keep working. |

`unoverse ground` still exists and prefills `terraform.tfvars` from your cloud CLI, but
`deploy` calls it for you. It is not a command you need to know about.

Ansible is the one prerequisite the CLI does not install for you (`doctl` and Terraform it
handles): `pip install ansible` if a deploy says it is missing.

TLS and the firewall are not CLI jobs: your ground's Terraform owns them (load balancer
certificate, cloud firewall). See [Deployment](/onboarding/deployment) and the
[Runbooks](/runbooks/overview).
