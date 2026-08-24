---
sidebarTitle: "Components"
title: "Components"
---

A component is one piece of interface an Agent can send into a conversation: a card showing a
booking, a form, a chart. The simplest is a single file. The most involved is a small app with
its own states and steps.

Every field named here is listed in full under [Reference](/reference/manifest). This page is
the model behind them.

## Start flat

A component that draws one thing is one file:

<Tree>
  <Tree.Folder name="price-card" defaultOpen>
    <Tree.File name={<><b>price-card.yaml</b> <span className="tree-note">the envelope: name, props, root</span></>} />
  </Tree.Folder>
</Tree>

Structure is earned, never assumed. Add a folder when the shape demands it:

<Tree>
  <Tree.Folder name="product-card" defaultOpen>
    <Tree.File name={<><b>product-card.yaml</b> <span className="tree-note">the envelope, and the state tree</span></>} />
    <Tree.File name={<><b>manifest.yaml</b> <span className="tree-note">discovery meta: how an Agent finds it</span></>} />
    <Tree.Folder name={<><b>layouts</b> <span className="tree-note">one file per state that owns an arrangement</span></>} defaultOpen>
      <Tree.File name={<><b>products.yaml</b> <span className="tree-note">the rail card</span></>} />
      <Tree.File name={<><b>product.yaml</b> <span className="tree-note">the full page</span></>} />
    </Tree.Folder>
    <Tree.Folder name={<><b>components</b> <span className="tree-note">partials, once two layouts share a shape</span></>} />
  </Tree.Folder>
</Tree>

**The name is the folder name.** `product-card` the folder, `product-card.yaml` the file, and
`name: product-card` inside it all carry the same string. The served address is built from it,
so a mismatch loads from disk, passes every other check, and then answers "definition not
found" everywhere.

## Two tiers

| | Where | Who can use it |
|---|---|---|
| **Design system** | `design/marketplace/components/` | Every org. Generic things: cards, charts, media |
| **Org** | `design/<org>/components/` | That org alone, in their apps and conversations |

An org component may reference a design-system one. Never the other way round, and an org may
never take a name the design system already uses. Both are lint errors.

## Where each thing lives

Everything a component shows has exactly one home, and the linter rejects anything in the
wrong one.

| What it is | Where it goes |
|---|---|
| Static content: copy, option lists, images | Hardcoded in the layout |
| The component's own view state: `step`, `phase` | The `state` block, scalars only |
| Data a workflow streams in | `props`, marked `input: true` |

The tell for a mistake is an array, an object or a URL in the `state` block. That is content
to hardcode, or data to declare as a prop.

### Prop names are the data contract

Source data seeds a component's state **by name, with no mapping layer**. Every `bind` looks
its value up by that name, and a name the source does not carry silently renders the preview
default instead.

That failure is quiet and specific: the title streams in correctly while the image and tagline
stay stuck on their mocks. When a bind misses, rename your prop to match the source field.
Never add glue.

For a card fed by a content row, the vocabulary is the writer's and it is fixed:

| Use | Never |
|---|---|
| `title` `tagline` `description` `bodyCopy` `introParagraph` | |
| `primaryImage` `images` `link` `callToAction` | `image` `imageUrl` `photo` `subtitle` `category` |

## States, and which ones are public

A component with more than one arrangement declares a state tree on the `view` axis:

```yaml
state:
  view:
    states:
      products: {}              # the rail card, and declared first, so this is arrival
      detail:                   # the full page
        layout: product         # only because the filename differs
        on: step
        states:                 # private steps, invisible outside
          detail: { layout: product-detail }
          apply:  { layout: product-apply }
```

**The first state declared is where the component arrives.** There is no `initial` key: two
spellings of one fact can disagree, and when they do nothing warns. The same holds one level
down, where the first substate under an `on` axis is where that axis starts.

**Top-level states are public.** They are the component's entire interface to the app around
it. Anything nested is private: not addressable, not visible in the snapshot. Here an app sees
`products` and `detail`, and knows nothing of `step`.

### The rearrange rule

One question sorts every state:

> **If the app must rearrange to show it, make it public. If the app would not move, nest it.**

The same product is a rail card in `products` and a full page in `detail`. Both make the app
move, so both are public. Stepping from detail to apply inside that page moves nothing, so it
nests.

Privacy is the default, and promotion has a bite. **An ignored public state does not stay
where it is, it falls inline.** So a step promoted for no reason collapses your surface into
the conversation flow.

### Layouts

A state draws the layout of its own name, so `layout:` is written only when the filename
differs. `{}` is a complete state.

A state's own layout is its **shell**: always on while that state is active, never a choice.
Its nested substates are the **steps**, and they are the only choices inside it. One step, or
none, is not a choice.

### Who owns a change of mood

Before nesting anything, ask what writes the discriminant. The writer picks the mechanism, and
there are only three.

| The discriminant is written by | It belongs to |
|---|---|
| The component's own buttons | Private substates on its own axis, names your design chooses |
| A service projecting a named value, like `callState` | Substates named for those values, with a preview prop so **studio** can drive them |
| Conversation facts the app derives, like "is it empty" | **The app**, as a condition-guarded mood. Components just react |

Never model a derived mood as component substates. No field carries your design's names, and
borrowing another field's values leaks machinery into the design.

### The root projects the tree

```yaml
root:
  type: Box
  children:
    - type: Switch
      on: view
      cases:
        products: { $include: layouts/products }
        detail:   { $include: layouts/product }
```

A private axis is its own `Switch`, inside the shell it belongs to. A `Switch` on a *data*
field is content selection, not a step: steps turn only on keys the component owns.

A case never re-guards its own discriminant. The tree already selected it.

### Most "states" are data

Seven wizard questions that share one shape are **one** state whose data changes, never seven
files. The `step` value selects what the layout binds. Only a genuinely different arrangement
earns a file.

Input is neither a state nor a step. A composer or edit form is the app's one input tool.

## Components an Agent fills

A **brief** tells an AI what should fill a bound element. It sits on the node that renders what
it describes, never in a separate file:

```yaml
- type: Text
  brief:
    description: Name the day in the guest's own words, never a generic label.
    maxLength: 60
  bind: { value: headline }
```

The platform compiles every brief into the component's MCP tool schema, using JSON Schema's own
vocabulary, so the schema *is* the instruction channel. There is no prompt to maintain
anywhere. An Agent that discovers the component meets a required schema, so it must gather
real content before it can render. The compiler adds the rule that fields are filled from
search results and never invented.

Change a description or a length, and the Agent behaves differently on the next render. No
prompt engineering, no redeploy.

## Next steps

<Card title="State" icon="workflow" href="/design/state" horizontal>
How a component and the app around it stay in step.
</Card>

<Card title="manifest.yaml" icon="book-marked" href="/reference/manifest" horizontal>
Every field, with its type and whether it is required.
</Card>
