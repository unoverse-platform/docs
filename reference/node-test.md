---
sidebarTitle: "test.yaml"
title: "test.yaml"
---

The fixture behind Load sample on the studio Nodes screen.

<div className="ref-source">
Generated from <code>schemas/nodes/test.schema.json</code>, the same file the node
linter validates against.
</div>

## Example

```yaml test.yaml
testData:
  config:
    baseId: appXXXXXXXXXXXXXX
    tableId: Companies
    maxRecords: 25
  inputs:
    input: {}
  expect:
    records: "return Array.isArray(output.records)"
```

## Fields

<ResponseField name="testData" type="object" post={["required"]}>
Realistic input for one run, so the sample exercises the node rather than proving it parses.
</ResponseField>

## Next steps

<Card title="Building a node" icon="boxes" href="/nodes/overview" horizontal>
The guides behind these fields.
</Card>

<Card title="Troubleshooting" icon="wrench" href="/nodes/troubleshooting" horizontal>
When a node does not do what you wrote.
</Card>
