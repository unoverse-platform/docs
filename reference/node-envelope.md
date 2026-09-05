---
sidebarTitle: "node.yaml"
title: "node.yaml"
---

One file per node, naming what it is and how an Agent finds it.

<div className="ref-source">
Generated from <code>schemas/nodes/node.schema.json</code>, the same file the node
linter validates against.
</div>

## Example

```yaml node.yaml
type: AirtableFetch
kind: PromiseNode
name: Airtable Fetch
category: Storage & Data
color: "#FCB400"
description: Read records from an Airtable table, with
  filters, views and paging
whenToUse: >
  Pick to READ rows out of an Airtable table: filtered,
  sorted, and paged past the first hundred.

auth:
  required: false

capabilities:
  cacheable: true
```

## Fields

<ResponseField name="type" type="nodeType" post={["required"]}>
The node's identity. A saved workflow stores it, so renaming it orphans every workflow that placed the node.
</ResponseField>

<ResponseField name="kind" type="`PromiseNode` · `CallbackNode`" post={["required"]}>
How the node runs. `PromiseNode` settles once; `CallbackNode` emits as it goes and settles later. The last call's transport decides it, and lint checks the declaration.
</ResponseField>

<ResponseField name="name" type="string" post={["required"]}>
The node's id, unique in its package. Used everywhere it is referenced.
</ResponseField>

<ResponseField name="description" type="string" post={["required"]}>
One line saying what the node does, shown in the node library.
</ResponseField>

<ResponseField name="category" type="nodeCategory" post={["required"]}>
The job's domain, used in the library and in discovery ranking. Name the work, never the implementation.
</ResponseField>

<ResponseField name="whenToUse" type="whenToUse" post={["required"]}>
The text an Agent's search is ranked against, so this is what decides whether the node is ever chosen. Write the words a person would actually say, outcome first, and disqualify by property rather than by naming a sibling. Getting it wrong fails silently: the node still works, it is just never picked. Full rules: [Node discoverability](/nodes/node-discoverability).
</ResponseField>

<ResponseField name="color" type="string">
The node's accent colour on the canvas.
</ResponseField>

<ResponseField name="logoUrl" type="string">
The service's logo, shown on the node and in the marketplace.
</ResponseField>

<ResponseField name="template" type="`service` · `mini` · `memory` · `uiComponent` · `printComponent` · `harness`">
A starter configuration, prefilled when someone drops the node onto a canvas.
</ResponseField>

<ResponseField name="allowedHosts" type="string[]">
Every host this node may reach. No entry, no network.
</ResponseField>

<ResponseField name="visibility" type="`public` · `internal`">
Whether the node appears in the library, or is reachable only by another node.
</ResponseField>

<ResponseField name="capabilities" type="object">
Platform features this node needs. Publishing refuses where a universe cannot satisfy them.
</ResponseField>

<ResponseField name="interface" type="interface.schema.json">
Points at `interface.yaml`, or declares the wiring surface inline.
</ResponseField>

<ResponseField name="config" type="config.schema.json">
Points at `config.yaml`, or declares the settings form inline.
</ResponseField>

<ResponseField name="api" type="api.schema.json">
Points at the `api/` folder, or declares the calls inline.
</ResponseField>

<ResponseField name="test" type="test.schema.json">
Points at `test.yaml`, or declares the fixture inline.
</ResponseField>

<ResponseField name="auth" type="object" post={["required"]}>
Who may set this node off. The node author's floor, which a workflow builder can tighten and never loosen.
</ResponseField>

## Next steps

<Card title="Building a node" icon="boxes" href="/nodes/overview" horizontal>
The guides behind these fields.
</Card>

<Card title="Troubleshooting" icon="wrench" href="/nodes/troubleshooting" horizontal>
When a node does not do what you wrote.
</Card>
