---
sidebarTitle: "Restart & Rebuild"
title: "Runbook: Restart & Rebuild"
---

What needs a restart, and what does not.

## Nothing you author needs one

| You changed | Do |
|---|---|
| A node, component, app, skill or block, pushed to your org's Git repo | Nothing. It is live when the universe's sync applies the commit |
| Something installed from the marketplace | Nothing. It is live when the install finishes |
| The platform images | Update them, below |

## Update the platform images

```bash
# On a server
unoverse deploy

# On this machine
unoverse start --pull
```

Both pull the latest images and restart the services.

## Restart a service

```bash
docker compose restart unoverse
```

The workflow engine runs inside the unoverse container, so that one restart covers it.

## Full teardown and start

When things are truly stuck:

```bash
unoverse stop
unoverse start
```

## Verify

```bash
unoverse check
```

Services, schema and environment. To count the nodes the platform loaded, from inside the
container, since `:4106` is Docker-internal:

```bash
docker compose exec -T unoverse node -e \
  "fetch('http://127.0.0.1:4106/nodes').then(r=>r.json()).then(d=>console.log((d.nodes||[]).length)).catch(()=>console.log(0))"
```

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| A pushed node or component is not in **canvas** | The sync has not applied the commit, or hit a lint error | Check the org's **Source** tab History, then press **Sync now** |
| A component renders its old version | The browser cached it | Hard-refresh |
| `nodes: 0` | unoverse did not load its packages | `unoverse logs unoverse` |

## Related

- [core.md](/runbooks/core): Initial deployment
- [test.md](/runbooks/test): Full health check
