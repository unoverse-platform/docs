---
sidebarTitle: "test.yaml"
title: "test.yaml"
---

The fixture behind Load sample and `unoverse node test`.

<div className="ref-source">
Generated from <code>nodes/_schema/test.schema.json</code>, the same file the node
linter validates against.
</div>

## Example

```yaml test.yaml
testData:
  baseId: appXXXXXXXXXXXXXX
  tableId: Companies
  maxRecords: 25
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
