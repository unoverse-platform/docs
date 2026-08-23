---
sidebarTitle: "config.yaml"
title: "config.yaml"
---

The settings form someone fills in on the canvas.

<div className="ref-source">
Generated from <code>nodes/_schema/config.schema.json</code>, the same file the node
linter validates against.
</div>

## Example

```yaml config.yaml
configSchema:
  type: object
  required: [baseId, tableId]
  properties:
    baseId:
      type: string
      title: Base ID
      description: Airtable Base ID, starts with 'app'
      default: ""
      "ui:field": template
    tableId:
      type: string
      title: Table Name or ID
      description: Table name, or a table ID starting with 'tbl'
      default: ""
      "ui:field": template
```

## Fields

<ResponseField name="configSchema" type="object" post={["required"]}>
The settings form, as JSON Schema. Every field someone fills in on the canvas.
</ResponseField>

<ResponseField name="ui:order" type="string[]">
The order fields appear in the form. Anything unlisted follows, in declaration order.
</ResponseField>

## Next steps

<Card title="Building a node" icon="boxes" href="/nodes/overview" horizontal>
The guides behind these fields.
</Card>

<Card title="Troubleshooting" icon="wrench" href="/nodes/troubleshooting" horizontal>
When a node does not do what you wrote.
</Card>
