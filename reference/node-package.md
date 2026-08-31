---
sidebarTitle: "package.yaml"
title: "package.yaml"
---

The envelope around a folder of nodes, and what the marketplace lists.

<div className="ref-source">
Generated from <code>nodes/_schema/package.schema.json</code>, the same file the node
linter validates against.
</div>

## Example

```yaml package.yaml
name: airtable
displayName: Airtable
description: Read and write records in Airtable bases.
version: 1.0.0
category: storage
requires:
  credential: [bearer]
  transport: [json]
  paginate: [cursor]
```

## Fields

<ResponseField name="name" type="string" post={["required"]}>
The package id, unique in the marketplace.
</ResponseField>

<ResponseField name="displayName" type="string" post={["required"]}>
The package's name as the marketplace shows it.
</ResponseField>

<ResponseField name="description" type="string">
One line saying what the package is for, used as the listing's subtitle.
</ResponseField>

<ResponseField name="version" type="string" post={["required"]}>
The package version. A newer fingerprint is what an install takes.
</ResponseField>

<ResponseField name="category" type="`ai` · `storage` · `ingest` · `communication` · `cloud` · `flow` · `media` · `search` · `productivity`">
Where the package sits in the marketplace.
</ResponseField>

<ResponseField name="logoUrl" type="string">
The logo shown on the listing.
</ResponseField>

<ResponseField name="features" type="string[]">
What the package offers, listed on its marketplace page.
</ResponseField>

<ResponseField name="allowedHosts" type="string[]">
Every host any node in this package may reach, and part of the package's content hash.
</ResponseField>

<ResponseField name="requires" type="object">
Platform capabilities every node here needs. Publishing refuses where a universe cannot satisfy them.
</ResponseField>

<ResponseField name="publisher" type="string">
Who publishes the package.
</ResponseField>

## Next steps

<Card title="Building a node" icon="boxes" href="/nodes/overview" horizontal>
The guides behind these fields.
</Card>

<Card title="Troubleshooting" icon="wrench" href="/nodes/troubleshooting" horizontal>
When a node does not do what you wrote.
</Card>
