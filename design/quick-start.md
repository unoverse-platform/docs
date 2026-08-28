---
sidebarTitle: "Quick start"
title: "Quick start"
---

Build a price card, see it render in **studio**, and publish it to your universe.

You need **studio** running. [Studio](/onboarding/studio) covers the install.

## Make a project

Your work lives in an org. The folder you run in becomes its name, and that name travels
with everything the org publishes.

```bash
mkdir acme && cd acme
unoverse create
```

Choose **Studio** at the prompt. You get three folders, and your org sits inside `design/`:

<Tree>
  <Tree.Folder name="acme" defaultOpen>
    <Tree.Folder name="design" defaultOpen>
      <Tree.Folder name={<><b>acme</b> <span className="tree-note">your org</span></>} defaultOpen>
        <Tree.File name={<><b>components</b> <span className="tree-note">one piece of interface</span></>} />
        <Tree.File name={<><b>apps</b> <span className="tree-note">whole surfaces</span></>} />
        <Tree.File name={<><b>styles</b> <span className="tree-note">colour, type, spacing</span></>} />
      </Tree.Folder>
    </Tree.Folder>
    <Tree.Folder name={<><b>prompts</b> <span className="tree-note">skills and prompt blocks</span></>} defaultOpen />
    <Tree.Folder name={<><b>nodes</b> <span className="tree-note">your own integrations</span></>} defaultOpen />
  </Tree.Folder>
</Tree>

A worked example lands in each, so no folder starts empty.

## Write the definition

Create `design/acme/components/pricecard/pricecard.yaml`. The file name is the component's
name, and the lint enforces the match.

```yaml
unoverse: "1.0"
type: component
name: pricecard
category: Commerce
description: A card showing a product name, price and short description.
whenToUse: Show a single product or plan with its price.
props:
  title: { type: string, default: Pro Plan, input: true }
  price: { type: string, default: $29/month, input: true }
  description:
    type: string
    default: Everything in Basic, plus priority support.
    input: true
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
| `unoverse` `kind` `name` | The envelope. It marks the file as a component definition |
| `whenToUse` | How an Agent finds your component. Write the words a user would say |
| `props` | Every field a workflow can fill. `input: true` marks a field as workflow-fed |
| `default` | The value **studio** previews from, so make each one realistic content |
| `root` | The layout, composed only from the closed primitive set |
| `bind` | Maps a primitive's target to a field: `{ value: title }`, `{ src: image }` |
| `visibleWhen` | A bare field name is a truthy test, so the row hides when the field is empty |
| `style` | Token names only. Never `12px`, never `#fff` |

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

```bash
unoverse login
unoverse deploy studio
```

Lint runs first and blocks on any error, so nothing broken reaches a universe. Once it
lands, your card is a node any workflow can use: open it in **studio**, click **Copy for
Canvas**, and paste it onto a workflow with `Cmd+V`.

Edits to a component that already shipped apply live. Publishing a brand new component adds
it to the set the platform loads at boot.

## Next steps

<Card title="Components" icon="square-dashed" href="/design/components" horizontal>
States, layouts, and everything a component can show.
</Card>

<Card title="Primitives" icon="box" href="/reference/primitives" horizontal>
Every element a definition composes from.
</Card>
