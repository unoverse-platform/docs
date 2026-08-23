---
sidebarTitle: "Overview"
title: "Reference"
---

Every field you can write, generated from the schemas the platform validates against.

These pages are built from those schema files at release time, so they cannot describe a
field the platform does not accept, and they cannot fall behind one it does.

## What is here

| | You write | Validated by |
|---|---|---|
| **Design** | `design/<org>/components/`, `apps/` | `design/_schema/unoverse.schema.json` |
| **Nodes** | `nodes/<name>/` | the eight schemas in `nodes/_schema/` |

## Not here yet

| | Why |
|---|---|
| Styles and tokens | Your `styles/` YAML has no schema. Nothing validates a colour or a scale step, so there is no contract to generate from |
| Workflows | `workflow.schema.json` and `layout.schema.json` describe documents the canvas writes, not files you author |
| The wire envelope | `stream-1.0` is the transport contract, and matters to someone porting an SDK rather than to someone building on one |

## Where the guides are

This tab is the field list. The explanations live in
[Design](/design/overview) for components and [Nodes](/nodes/overview) for integrations.
Reach for a guide to learn the model, and for these pages to check a name.

## Next steps

<Card title="Primitives" icon="box" href="/reference/primitives" horizontal>
The 18 elements a definition composes from.
</Card>

<Card title="node.yaml" icon="boxes" href="/reference/node-envelope" horizontal>
What a node is, and how it is discovered.
</Card>
