---
sidebarTitle: "credentials"
title: "credentials"
---

The shape of a credential, declared once per package. Never a value.

<div className="ref-source">
Generated from <code>schemas/nodes/credential.schema.json</code>, the same file the node
linter validates against.
</div>

## Example

```yaml credentials/<name>.yaml
name: airtableCredential
displayName: Airtable
description: Airtable Personal Access Token
documentationUrl: https://airtable.com/create/tokens

properties:
  - name: personalAccessToken
    displayName: Personal Access Token
    type: string
    required: true
    secret: true
    description: Your Airtable Personal Access Token
    placeholder: pat
```

## Fields

<ResponseField name="name" type="string" post={["required"]}>
The credential type's id, referenced by `interface.yaml`.
</ResponseField>

<ResponseField name="displayName" type="string" post={["required"]}>
The name on the form someone fills in. Write it for a person who has your service open in another tab.
</ResponseField>

<ResponseField name="description" type="string">
One line saying what the credential is for, shown above the form.
</ResponseField>

<ResponseField name="documentationUrl" type="string">
A link to where the key comes from, shown beside the form.
</ResponseField>

<ResponseField name="properties" type="object[]" post={["required"]}>
The fields on the form. Mark anything that grants access `secret: true`.
</ResponseField>

## Next steps

<Card title="Building a node" icon="boxes" href="/nodes/overview" horizontal>
The guides behind these fields.
</Card>

<Card title="Troubleshooting" icon="wrench" href="/nodes/troubleshooting" horizontal>
When a node does not do what you wrote.
</Card>
