---
sidebarTitle: "Quick start"
title: "Quick start"
---

Build a price card, see it render in **studio**, and publish it to your universe.

You need **studio** running. [Studio](/onboarding/studio) covers the install.

## Make your org

Your work lives in an org, and one org is one Git repo. `unoverse create` asks for the
org's name, suggesting the folder's, and that name travels with everything the org
publishes.

```bash
mkdir acme && cd acme
unoverse create
```

Choose **Studio** at the prompt and give the org a name. The folder becomes the org's repo,
with a first commit, and the org's folders sit at its root:

<Tree>
  <Tree.Folder name="acme" defaultOpen>
    <Tree.File name={<><b>unoverse.yaml</b> <span className="tree-note">org: acme, the org's name</span></>} />
    <Tree.Folder name={<><b>styles</b> <span className="tree-note">colour, type, spacing</span></>} defaultOpen />
    <Tree.Folder name={<><b>identity</b> <span className="tree-note">who the organisation is</span></>} defaultOpen />
    <Tree.Folder name={<><b>.github/workflows</b> <span className="tree-note">a pull-request check that runs unoverse lint</span></>} defaultOpen />
  </Tree.Folder>
</Tree>

That is the baseline. Add `components/`, `apps/`, `skills/`, `blocks/` and `nodes/` as you
need them. Worked examples live in the public demo org repo,
[acme](https://github.com/unoverse-orgs/acme), to read and copy.

## Write the definition

Create `components/pricecard/pricecard.yaml` in your org repo. The file name is the component's
name, and the lint enforces the match.

```yaml
unoverse: "1.0"
type: component
name: pricecard
category: Commerce
props:
  title:
    type: string
    input: true
    default: Pro Plan
  price:
    type: string
    input: true
    default: $29/month
  description:
    type: string
    input: true
    default: Everything in Basic, plus priority support.
root:
  type: Box
  style:
    width: full
    direction: column
    gap: "3"
    padding: "6"
    background: surface.base
    border: subtle
    radius: lg
  children:
    - type: Text
      bind: { value: title }
      style: { font: headline.sm, weight: semibold, color: text.primary }
    - type: Text
      bind: { value: price }
      style: { font: headline.lg, color: text.primary }
    - type: Text
      bind: { value: description }
      visibleWhen: description
      style: { font: body.md, color: text.secondary }
```

Reading it top to bottom:

| Part | What it does |
|---|---|
| `unoverse` `type` `name` | The envelope. It marks the file as a component definition |
| `category` | The job's domain. The rest of the discovery meta lives in the manifest |
| `props` | Every field a workflow can fill. `input: true` marks a field as workflow-fed |
| `default` | The value **studio** previews from, so make each one realistic content |
| `root` | The layout, composed only from the closed primitive set |
| `bind` | Maps a primitive's target to a field: `{ value: title }`, `{ src: image }` |
| `visibleWhen` | A bare field name is a truthy test, so the row hides when the field is empty |
| `style` | Token names only. Never `12px`, never `#fff` |

## Add the manifest

A `manifest.yaml` beside the definition is how an Agent finds the component. A flat file
you only place yourself can skip it; anything an Agent should find carries one:

```yaml
description: A card showing a product name, price and short description.
whenToUse: Show a single product or plan with its price.
```

The definition says what the component is. The manifest says when to reach for it, and
that split never blurs: discovery meta lives here and nowhere else.

## Catch mistakes as you type

The schema at `design/_schema/unoverse.schema.json` marks an unknown primitive, a missing
`whenToUse` or an illegal condition while you are still in the file. Wire it once through
the YAML extension in `.vscode/settings.json`:

```jsonc
{
  "yaml.schemas": {
    "./design/_schema/unoverse.schema.json": [
      "**/design/**/components/**/*.yaml",
      "**/design/**/apps/**/*.yaml",
      "**/design/**/atoms/*.yaml"
    ]
  }
}
```

The schema file stays JSON because it is the schema, not a definition.

## See it

```bash
unoverse studio
```

Open **Components** and find **pricecard**. It renders from the prop defaults with no
backend involved, which is why the defaults matter. Open the code view and the definition
sits beside the live preview: edit, save, and the preview follows.

A component with a state tree gets one pill per public state, taken straight from the tree.
This card has none, so it shows none.

## Ship it

Commit and push to your org repo. Every universe connected to the repo pulls it
([Environments](/architecture/environments)). Until your universe runs a release with the Git sync, you can still
send it to your own universe from the terminal:

```bash
unoverse login
unoverse deploy studio
```

Lint runs first and blocks on any error, so nothing broken reaches a universe. Once it
lands, your card is a node any workflow can use: open it in **studio**, click **Copy for
Canvas**, and paste it onto a workflow with `Cmd+V`.

Edits to a component that already shipped apply live, and so does a brand new one: no
restart.

## Next steps

<Card title="Components" icon="square-dashed" href="/design/components" horizontal>
States, layouts, and everything a component can show.
</Card>

<Card title="Primitives" icon="box" href="/reference/primitives" horizontal>
Every element a definition composes from.
</Card>
