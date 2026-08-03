---
sidebarTitle: "Update Unoverse"
title: "Update Unoverse"
---

Keep everything current when new versions are released. There are three things that
update, and each has one command.

## The three updates

| What | Command | What moves |
| --- | --- | --- |
| **The CLI, and a running local universe** | `unoverse update` | The `unoverse` tool itself, plus: run inside a universe, the authoring skill and the platform images: services already running move to the new images. It never boots a stopped universe. |
| **A stopped local universe** | `unoverse start --pull` | Refreshes to the latest images, then starts. |
| **A deployed universe** | `unoverse deploy` | The server pulls the latest images and restarts. |

Your own work is outside all three: what you publish from **Studio** lives in the
universe's database and rides along untouched, and marketplace content updates per
item, from the marketplace.

## Steps

### 1. Update, from inside your universe

```bash
unoverse update
```

One command: the CLI itself (the universe folder carries no tooling, so this updates
every command everywhere), the authoring skill, and: if your universe is running
its platform images. A stopped universe takes the new images on `unoverse start --pull`.

### 2. Update your server

```bash
unoverse deploy
```

The server pulls the latest images and restarts.

### 3. Verify

```bash
unoverse check
```

One pass covers it: services running, health endpoints, database schema, and the
environment diagnosis.

---

## Onboarding Complete!

For detailed node development, see the [Node Documentation](/nodes/overview).
