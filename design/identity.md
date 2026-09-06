---
sidebarTitle: "Identity"
title: "Identity"
---

Identity is who an organisation is, written down once so every Agent, every extraction and
every piece of writing uses the same words: what the business does, what its brand stands
for, why it exists, and its story.

A new project ships the four documents with their instructions written and their values
empty. [Quick start](/design/quick-start) creates the project.

## Four documents

Each document is a folder under `design/<project>/identity/`, with a `manifest.yaml` and the
document itself.

| Document | Holds | Where it goes when published |
|---|---|---|
| `organisation` | The name, what the business does, its units, and the words it uses | The grounding every run reads first. It never appears on the map |
| `brand` | The brand name, what it stands for, its promise, and its voice as rules and examples | A row on **spatial**, found by meaning |
| `purpose` | Why the business exists, and its goals as a tree | A row on **spatial** |
| `story` | Where it came from, what it is now, and where it is going | A row on **spatial** |

## The shape

A document declares its fields the way a component declares props. Each prop carries a
`description`, which is the brief a writer follows, and a `default`, which is the value.
The default is the document. `maxLength` and `maxItems` are the limits.

```yaml brand.yaml
unoverse: "1.0"
type: identity
name: brand
category: Identity
props:
  promise:
    type: string
    input: true
    description: >-
      What people can expect from the brand, in one or two sentences, drawn from the
      promises the site makes on its home and about pages. Written to the customer.
    maxLength: 400
    default: ""
  rules:
    type: array
    input: true
    description: >-
      Three to six rules the site's copy visibly follows, each as 'Do this' or 'Never that'.
    maxItems: 6
    default: []
```

The manifest carries `title`, `description`, `whenToUse`, `category` and `version`, the same
keys as every other definition. [Manifest](/reference/manifest) lists them.

## Fill it

The values come from the organisation's own publications: its website, its annual and
quarterly reports, its press releases, its official profiles. Third-party articles and
reviews are not sources. A field the sources do not answer stays empty.

Your agent does the research and writes the defaults. The `unoverse-create` skill carries
the rules, and `unoverse update` installs it. Only `default` values change; the briefs and
the manifests stay as shipped.

Fill `organisation` first. Its `what` and `vocabulary` ground every extraction and every
Agent that runs as this project, so the actual lines of work and the actual product names
matter more than prose.

## Publish it

Publishing the project puts the four documents where they work.

- `organisation` becomes the grounding. Every extraction and every Agent that runs as this
  project reads its `what` and `vocabulary` before anything else.
- `brand`, `purpose` and `story` are listed in the **Identity** tab of **Studio** with the
  same **Available** switch every asset has. Switched on, each is a row on **spatial**, with
  its words on the row, so an Agent finds the purpose the way it finds a product and can
  quote it.
- The **Organisation** document has a **Grounding** switch instead. Off, the project grounds
  on nothing.

## Read it in a node

Every node's Handlebars string can name the identity, the same way it names a prompt block.
A whole document renders as labelled text. A field renders as its value.

```yaml
instructions: |-
  {{identity.organisation}}

  Write in the brand's voice:
  {{#each identity.brand.rules}}- {{this}}
  {{/each}}
  Our promise: {{identity.brand.promise}}
```

`{{identity}}` renders all four documents. The project a run works as decides whose
identity this is, so one node serves every project.
[Handlebars and expressions](/nodes/expressions) lists the other roots.

## Next steps

<Card title="Handlebars and expressions" icon="braces" href="/nodes/expressions" horizontal>
Every root a node can read, and how to shape a value on the way into a call.
</Card>

<Card title="Validate and ship" icon="rocket" href="/design/validate-and-ship" horizontal>
Lint the project and publish it, so the identity reaches the grounding and the map.
</Card>
