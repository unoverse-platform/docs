---
sidebarTitle: "interface.yaml"
title: "interface.yaml"
---

The node's wiring surface. Everything another node or an Agent can see.

<div className="ref-source">
Generated from <code>schemas/nodes/interface.schema.json</code>, the same file the node
linter validates against.
</div>

## Example

```yaml interface.yaml
inputs:
  - name: input
    type: object
    description: Trigger. Config may template from upstream.

outputs:
  - name: records
    type: array
    description: Each record as a plain object, plus its id
  - name: totalCount
    type: number
    description: How many came back after paging

credentials:
  - name: airtableCredential
    required: true
    displayName: Airtable
```

## Fields

<ResponseField name="inputs" type="object[]">
The connectors data arrives on.
</ResponseField>

<ResponseField name="outputs" type="object[]">
The connectors data leaves on. Their order is the order `events` must declare.
</ResponseField>

<ResponseField name="credentials" type="object[]">
The credential types this node needs, by name. The values are entered once in canvas and never live in your files.
</ResponseField>

<ResponseField name="serviceConnectors" type="object[]">
Service edges this node offers or consumes, and the methods on each.
</ResponseField>

## Next steps

<Card title="Building a node" icon="boxes" href="/nodes/overview" horizontal>
The guides behind these fields.
</Card>

<Card title="Troubleshooting" icon="wrench" href="/nodes/troubleshooting" horizontal>
When a node does not do what you wrote.
</Card>
