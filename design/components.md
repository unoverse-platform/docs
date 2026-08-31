---
sidebarTitle: "Components"
title: "Components"
---

A component presents one thing: a card showing a product, a form, a chart. Templates
arrange components, apps arrange templates, and an Agent can send a single component
straight into a conversation.

Folders, manifests and the toolchain work the same way for every artifact, and
[Essentials](/design/essentials) covers them. This page is what makes a component a
component.

## The anatomy

A complete component in four files: a product card that shows as a compact tile, and
opens into a full page.

<CodeGroup>

```yaml product-card.yaml
unoverse: "1.0"
type: component
name: product-card
category: Commerce
props:
  title:
    type: string
    input: true
    default: Trail Runner
  price:
    type: string
    input: true
    default: £89
  description:
    type: string
    input: true
    default: Lightweight, and ready for any terrain.
  primaryImage:
    type: string
    input: true
    default: /samples/shoe.jpg
states:
  grid:
    layout: layouts/grid
  page:
    layout: layouts/page
```

```yaml layouts/grid.yaml
# The whole tile is the control that opens the page.
type: Button
action:
  type: setValue
  values:
    - key: state
      value: page
style:
  width: full
  direction: column
  background: surface.base
  border: subtle
  radius: lg
  overflow: hidden
  cursor: pointer
  textAlign: start
children:
  - type: Image
    bind:
      src: primaryImage
      alt: title
    style:
      width: full
      height: "50"
      fit: cover
  - type: Box
    style:
      direction: column
      gap: "2"
      padding: "5"
    children:
      - type: Text
        bind:
          value: title
        style:
          font: headline.sm
          color: text.primary
      - type: Text
        bind:
          value: price
        style:
          font: title
          color: text.primary
```

```yaml layouts/page.yaml
type: Box
style:
  direction: column
  gap: "4"
  padding: "6"
  background: surface.base
children:
  - type: Button
    action:
      type: setValue
      values:
        - key: state
          value: grid
    style:
      align: start
      cursor: pointer
    children:
      - type: Text
        value: Back
        style:
          font: button
          color: action.primary
  - type: Image
    bind:
      src: primaryImage
      alt: title
    style:
      width: full
      radius: lg
  - type: Text
    bind:
      value: title
    style:
      font: headline.lg
      color: text.primary
  - type: Text
    bind:
      value: description
    style:
      font: body.md
      color: text.secondary
```

```yaml manifest.yaml
description: A product with its image, price and description.
whenToUse: Show one product, or a set the guest is browsing.
```

</CodeGroup>

Four things in those files carry the whole model:

- **The envelope declares the faces.** `grid` and `page` are the two states this card can
  be in. The first declared is where it arrives.
- **Every state names its layout.** `layout: layouts/grid` is a path, so nothing is
  assumed from the state's name.
- **The card opens itself.** The tile is a `Button` whose action writes `state: page` into
  the card's own data, and the page writes it back. Whatever holds the card reacts to
  those names.
- **Prop defaults are the preview.** **studio** draws the card from them before any
  workflow exists, so write realistic content.

A component that draws one thing needs none of this. One file with a `root:` tree, no
states and no manifest, is a complete component.

**Two tiers.** Your components live in `design/<org>/components/` and belong to that org
alone. The design system's are shared by every org. Yours may reference a design-system
component, never the reverse, and may never take a design-system name. Both are lint
errors.

## Where each thing lives

Everything a component shows has exactly one home, and the lint rejects anything in the
wrong one:

| What it is | Where it goes |
|---|---|
| Static content: copy, option lists, images | Hardcoded in the layout |
| Starting values of keys the component writes, such as `step` | The `values:` block, scalars only |
| Data a workflow streams in | `props`, marked `input: true` |

Declare in `props` every field a workflow can fill, and mark each one `input: true`. An
array, an object or a URL in `values:` is the tell for a mistake. That is content to
hardcode, or data to declare as a prop. Anything computed is computed in the workflow and
arrives as a plain field.

**Prop names are the data contract.** Source data fills a component by name, with no
mapping layer. A `bind` whose name the source does not carry renders the preview default
instead. That failure is quiet and specific: the title streams in while the image and
tagline stay on their mocks. Rename the prop to match the source field, and never add
glue.

A component fed by your content binds to a fixed set of field names.
[Interface data](/design/interface-data) lists them, and names which of them arrive with
the delivery and which are fetched when a detail state opens.

A component can also fetch its own data at a declared moment, such as a page hydrating
when it opens. [Lifecycle hooks](/design/lifecycle-hooks) is the one code carve-out.

## States

A component with more than one arrangement declares a state tree. Public states sit at the
top level, and private steps nest inside them:

```yaml
states:
  grid:
    layout: layouts/grid
  page:
    layout: layouts/page
    on: step                # the private axis
    states:
      detail:
        layout: layouts/step-detail
      apply:
        layout: layouts/step-apply
```

Two decisions are yours. **Which states are public**, since those are the component's
entire interface to the templates and app around it. And **what to call them**: `grid` for
the compact face and `page` for the full detail face are the standard names, so a card
using them matches any template, in any org, with no mapping.

One question settles the first decision:

> **If the screen must rearrange to show it, make it public. If nothing would move, nest it.**

The same product is a compact tile in `grid` and a full page in `page`. Both move the
screen, so both are public. Stepping from detail to apply inside that page moves nothing,
so it nests.

[State](/design/state) is the full model: what writes a state, how everything else reacts,
and how to model a tree well.

## Briefing descriptions

Describe what a field is, the same way you would document any parameter. The description
is a `brief`, and it sits on the element that renders the field:

```yaml
- type: Text
  brief:
    description: Name the day in the guest's own words, never a generic label.
    maxLength: 60
  bind:
    value: headline
```

Two things come from writing that description well:

- **Any Agent using the component knows what belongs in the field.**
- **unoverse can fill the field for you.** A copywriter Agent writes the content from your
  description, drawing on search results rather than inventing anything.

Constraints sit beside the description. Text takes `maxLength`. A list carries its brief on
the `Each`, with the count it should hold:

```yaml
- type: Each
  brief:
    description: The three moments this guest will remember.
    minItems: 3
    maxItems: 3
  bind:
    items: highlights
```

The platform compiles every brief into the component's tool schema, so there is no prompt
to maintain anywhere. Change a description or a count, and behaviour changes on the next
render.

## Next steps

<Card title="State" icon="workflow" href="/design/state" horizontal>
The full reaction contract between a component and whatever holds it.
</Card>

<Card title="manifest.yaml" icon="book-marked" href="/reference/manifest" horizontal>
Every field a component can declare, with its type.
</Card>
