---
sidebarTitle: "Components"
title: "Components"
---

**A component is a light, self-contained app: its manifest is the contract, its state tree is the spine, and everything it shows has exactly one home.**

---

## The anatomy

```
design/marketplace/components/product-card/
├── product-card.yaml     # envelope: name, nodeSize, outputs, props, the STATE TREE, root
├── manifest.yaml         # the RENDER CONTRACT + discovery meta (see below)
├── layouts/              # the DRAWINGS: one file per state that owns an arrangement
│   ├── products.yaml     #   the rail card (state `products`, same-name default)
│   ├── product.yaml      #   the full page (the `detail` state's shell)
│   ├── product-detail.yaml  # a private step's drawing
│   └── product-apply.yaml   # a private step's drawing
└── components/           # component-local shared partials (only when 2+ layouts share a shape)
```

A **flat component** (a simple card, a chart) is the reduced form: just `<name>.yaml` with its `root`, one drawing, no manifest, no `layouts/`. Simplicity is the default; structure is **earned**.

**Components live in TWO tiers** (same anatomy in both):

| Tier | Home | Scope | URI |
|---|---|---|---|
| **Design system** | `design/marketplace/components/<name>/` | generic, org-neutral: any org can use it (cards, charts, markdown, media) | `unoverse://components/<name>` |
| **Org** | `design/<project>/components/<name>/` | **org-private**: that client's own components/microapps, usable and discoverable only inside that org's apps and conversations | `unoverse://components/<org>/<name>` |

Names are **unique within a tier**: two orgs may ship the same component name (each addressed by its org URI), but an org may never **shadow a design-system name** (that collision is a lint error). Both address forms are first-class: the bare URI is the canonical address for a design-system component, the org URI (`unoverse://components/<org>/<name>`) for an org component. A bare ref still resolves an org component while its name is unique across orgs; once two orgs carry the name, the bare ref is a loud resolver error naming the qualified candidates, never a guess (docs/unoverse/UNOVERSE_COMPONENT_ORGS.md). Direction rule: org things may reference design-system things; **design-system things never reference org things** (lint-enforced, including app preview lists).

- **Everything is kebab-case, and `name` IS the folder name** (`product-card`, `deal-page`, `form-field`): the folder, the `<name>.yaml` inside it, and the `name:` field all carry the same string. `name` is not a display label. The served URI is built from it, so a component named `InvestorApplication` in a folder named `investor-application` loads from disk, passes every other check, and then answers **"definition not found"** in Studio and every channel. Guard: `server/tests/design/definition-naming.test.ts`.
- **`components/` vs atoms:** a shape shared across *this component's* layouts → its own `components/` (`$include`). A shape shared across *many components* (a close button, a choice row) → a universal atom in `design/marketplace/atoms/` (`Ref`). Used once → inline it. Atoms are **authoring-time only**: the server always expands them before serving (channels only ever receive fully-expanded primitive trees; atoms are never served, never enumerable, and have no **studio** view). A `Ref`'s `props` remaps *fields*; its `with` passes *literals* into the atom: `{ type: Ref, ref: button, with: { label: Learn more, icon: arrowRight }, action: { … } }` hardcodes those attributes, and a truthy `with` key satisfies (drops) a matching `visibleWhen` guard, so unprovided pieces stay hidden.

---

## The manifest: the render contract

```yaml
# design/marketplace/components/product-card/manifest.yaml
title: Product Card
description: A compact product card, expandable to full product detail.   # what it IS, ≤120 chars
whenToUse: Show one product or service a customer could take…             # the USER's words: findIntent ranks on this
category: Finance
version: 1.0.0
```

- **The arrival state is the tree's `initial`** (below): the state the component wakes in when its host can honor it; otherwise the host's placement scan runs ([04](/design/state) rule 2).
- **`defaultState` in a manifest is TWO different things, and only one of them is legacy.** As the *arrival* declaration it is the pre-v2 spelling of the tree's `initial`: a component that declares a `state.view` tree has already said where it arrives, so the loader seeds the alias and then **drops it** rather than shipping two spellings on one slice. But when the component is loaded as an **MCP app** (`loadComponentApp`), the same key is the app's **load mode**, a different axis that happens to share the name, and it defaults to `focus` when absent. **Do not delete it from a manifest as "legacy cleanup"**: on a component that is also an app, removing it silently changes how the app loads. `product-card` keeps `defaultState: products` for exactly this reason.
- **`lifetime` (OPTIONAL) = how long the rendered instance survives.** Default `"turn"`: the universal reset, the instance returns to its initial chain on the next user turn ([04 §Two lifetimes](/design/state)). `"conversation"`: a **durable, conversation-scoped surface** (a cart, an itinerary, a composed page), the platform keys the instance by the *conversation* (every re-call hydrates the SAME slice: merge, never re-place), the new-turn reset skips it, and cancellation skips it; it stays on screen until replaced, self-closed, or a **new app loads** (the app swap is the hard refresh boundary). Closed set `turn | conversation`, lint-checked.
- **Manifest presence = spatially discoverable.** The discovery meta (`title`/`description`/`whenToUse`) lives here and ONLY here: never duplicated in the envelope. A component that's only ever streamed by a workflow, arrives inline, and needs no discovery can skip the manifest entirely.
- `whenToUse` is **utterance-shaped**: the words a user would say ("find the right product for me"), never selector-shaped dev framing ("use this when the user asks…").
- **Naming is discoverability** ([05 §Naming](/design/apps): canonical: `docs/nodes/node-discoverability.md`). **spatial** embeds `` `title. whenToUse||description [category]` `` and ranks it against the user's own words: `title` = the thing itself (no mechanism, no org prefix), `description` = one ≤120-char line of what it IS, `whenToUse`'s **opening words** carry the ranking, `category` = the job's domain. Disqualify by property, never by naming a sibling.
- **Name the component for the THING, not one rendering of it**: `course`, never `courseCard`. "Card" is a layout's name, not an identity.

---

## Three homes: everything the component shows

| What it is | Where it lives | Example |
|---|---|---|
| **Static content**: copy, titles, option lists, images | **hardcoded literals in the layout** (`value` on Text, `items` on Each, `src` on Image) | a wizard's question text, its hero image |
| **Internal view-state**: the SCALAR keys the component's own actions write | the **`state` block** (initial values) | `step`, `phase`, `progressPct`, `questionLabel` |
| **Workflow-fed data**: what a run streams in | **`props` with `input: true`** (the `default` is the preview mock) | a finder's matched `products`, the user's real accounts |

Anything else is **slop**, and the linter rejects it. The tell: **an array, object, or URL in the `state` block is never view-state**, it's content (→ hardcode) or data (→ `input: true` prop). A contained microapp usually has an *empty or absent* props block.

### Prop names are the data contract: use the writer's names, never invent

How workflow data reaches a prop: the source object (a content row, a node's output) is
seeded into the component's state **as-is: by name, no projection, no mapping layer**.
Every `bind` looks its value up BY NAME; a name the source doesn't carry silently renders
the preview `default` instead (the classic tell: title/description stream correctly while
the image and tagline stay stuck on mocks). If a bind misses, **rename the component's
prop to the source's field name: never add mapping glue.**

For **content-attached cards** (a row with `metadata.app` hydrating your card), the field
vocabulary is the content writer's, and it is fixed:

| Prop name | What arrives |
|---|---|
| `title` | the row's title |
| `description` | short summary |
| `tagline` | one-line hook / category line |
| `bodyCopy` | long-form markdown body |
| `introParagraph` | intro paragraph |
| `primaryImage` | hero image URL |
| `images` | image URL array |
| `link` | labelled markdown link to the source page (render with `Markdown`) |
| `callToAction` | CTA label |

❌ `image`, `imageUrl`, `photo`, `subtitle`, `category`, `location`: inventions; the bind
misses and the mock leaks into production. The canonical row shape and the guard live in
`server/src/runtime/content-card-hydration.test.ts`: it walks every layout of every
attachable component and fails the build on a bind the row can't satisfy. Deep law:
`UNOVERSE_MCP_APP_PROTOCOL.md` §Content-attached cards.

```yaml
# productfinder.yaml (envelope): the state block is lean scalars only
state: { step: goals, phase: about, progressPct: 16%, questionLabel: Question 1 of 6 }
props:
  products:
    type: array
    input: true
    default: [ ]        # 3 mock products for preview
```

---

## The state tree: states own their layouts

A stateful component declares a **state tree** on the `view` axis, and every state names the drawing that shows it. This is the spine of the whole design (`design/sab/components/product-card`, as shipped):

```yaml
# product-card.yaml (envelope excerpt)
state:
  view:                      # the PUBLIC axis
    initial: products
    states:
      products: {}                          # same-name default: draws layouts/products
      detail:                               # the full page
        layout: product                     # declared only because the filename differs
        on: step
        initial: detail
        states:                             # PRIVATE substates (the steps)
          detail: { layout: product-detail }
          apply:  { layout: product-apply }
```

Read top to bottom it answers, in order: what states exist, which are public, which nest privately, and what draws each one. The rules:

- **Top-level states are PUBLIC**: the component's entire interface to apps and hosts. Everything nested below is **PRIVATE**: not addressable by apps, not addressable by senders, invisible in the snapshot. Here the public menu is `products · detail`; the `step` axis and its states do not exist outside the card.
- **The rearrange rule is how you place a state.** *If the app must rearrange to show it, make it a public state. If the app wouldn't move, nest it privately.* One piece of data walks horizontally across the public states: the same product is `products` (a rail card) and `detail` (a full page), same object, different ways of being shown, each needing the app to move. Steps that never move the page (`detail` ↔ `apply` inside the page) nest privately. Promotion is deliberate; privacy is the default. And remember the bite from [04](/design/state) rule 6: an ignored public state falls inline; a step promoted for no reason collapses the surface into the flow.
- **`layout:` is optional; same-name is the default.** A state with no declaration draws the layout of its own name; `{}` is a complete state. Write `layout:` only when the filename differs (a state renamed for meaning keeping its historical files, or a step drawing carrying its axis prefix, next bullet). The filename is a readability convention now, not the contract: the state VALUE is the contract, so a layout can be reused by two states. *Legacy:* v1 required filename = state name; that survives only as this default.
- **Naming the drawings: a part carries its owner.** An arrangement (a state's own layout) keeps the same-name default: `products.yaml`, `form.yaml`, `call.yaml`. A **substate's drawing is a part**, never served as an arrangement, and its filename is prefixed with the step's owner, the axis key: `step-register.yaml`, `callState-idle.yaml`, declared in the tree with `layout:` because the filename differs from the bare state name by design. The prefix keeps `layouts/` legible at a glance: unprefixed files are arrangements, prefixed files are the steps of the named axis. Exemplars: `course-application` (`step-*`), `voice-chat` (`callState-*`).
- **Who owns a mood: the DRIVER decides.** Before nesting substates anywhere, ask what WRITES the discriminant; the writer picks the mechanism, and there are only three:
 1. **The component's own buttons write it** (`setValue { step: … }`) → component substates on a private axis (`on: step`), names chosen by the design. Exemplar: `course-application`.
 2. **A service projects a NAMED value** (`callState: idle | speaking | …`) → component substates named for those values, with a preview prop so Studio can drive them. Exemplar: `voice-chat`.
 3. **It is DERIVED from conversation facts** (`isEmpty` / `hasMessages`) → **the app tier owns it**: a condition-guarded mood (the welcome-substate pattern), or condition-guarded drawings inside an embedded component reacting to the same facts. The app has the state; components just react. NEVER model a derived mood as component named substates, no field carries the design's names, and borrowing another field's values (`lifecycle`'s thinking/streaming) leaks machinery into the design. Exemplar: bpp `text-chat`.

 Mechanics that hold across cases 2 and 3: declare any projected field the component branches on as a prop with a preview default (Studio's bare preview supplies only prop defaults), and give a Ref-embedded component's root Switch a `default:` case (`view` is absent without a spawned slice).
- **The shell vs the steps.** A state's own layout is its SHELL: always on while the state is active, never a choice. Its nested substates are the STEPS: the only choices inside it, addressed by their **state names** (the layout filenames are plumbing). One step, or none, is not a choice. *Legacy:* what died with v1's `layouts/<face>-<step>` convention is the filename as the OWNERSHIP mechanism (a drawing selected by its name); ownership is carried by nesting in the tree, and the prefix survives purely as the naming convention above. Also dead: the v1 `states/` sibling folder + authored `stateOrder`: a private step is a tree entry owning a layout, not a sibling file convention.
- **Input is neither a state nor a step.** A composer or edit form is the app's ONE input tool, never a component state; a card's Edit stages its data into it.
- **A state is a state decision, never a width decision.** The same `view` write that moves the app also redraws the component. Container queries (`hideBelow`) are for fine adjustments *inside* a layout, never for picking one. A `hideBelow` threshold must be reachable by the card itself: keep it *below* the layout's own `maxWidth` (linted).
- The component's own buttons move it: the rail card's tap is `setValue { view: "detail" }`; the page carries its own ✕ that sets `view` back. **A component writes only its own slice**: how apps react is [04, State](/design/state).

### The root: a Switch on the public axis

The root projects the tree: a `Switch` on `view` (*legacy alias:* `defaultState`) whose cases include each public state's shell:

```yaml
root:
  type: Box
  style: { width: full, container: inline-size }
  children:
    - type: Switch
      on: view
      cases:
        products: { $include: layouts/products }
        detail:   { $include: layouts/product }
```

A private axis is its own `Switch` (on `step`) inside the shell it belongs to. A `Switch` on a *data* field (`kind`, a nested component's `tab`) is content selection, not a step: steps turn only on keys the component owns.

### Variants: one state, several arrangements

A state may own several layouts when one meaning has several arrangements:

```yaml
focused:
  layouts: { horizontal: focused-h, vertical: focused-v }
```

Variants bind the SAME fields and differ only in arrangement; anything that changes meaning or bound data is a second state, not a variant (lint-enforced). The COMPONENT picks its variant by the space it finds itself in (container queries); the app never requests one.

### Most "states" are data

Seven wizard questions sharing one shape (heading + choice rows) are ONE state whose data changes per step, never seven files. The `step` value selects which data the layout binds; only genuinely different arrangements (`summary`, `result`) earn files. Inside a step, an option list is **hardcoded** `items` on an `Each`; picking an option writes the answer + the next step in one `setValue`:

```yaml
type: Each
items:                                          # literal content
  - { value: start, label: Start my career }
app:
  type: Ref
  ref: choice-row
  action:
    type: setValue
    values:
      - { key: careerStage, value: "{{value}}" }
      - { key: step, value: situation }
      - { key: progressPct, value: 33% }
```

⚠️ **A state never guards itself**: the tree already selects it; a `visibleWhen` re-checking the same discriminant inside a case is an error.

---

## Briefed components: the design briefs the AI

A **brief** is metadata that tells an AI what should fill a bound element. It sits **on the node that renders what it describes**: next to the `bind` it governs, never in a separate file or the manifest:

```yaml
- type: Text
  brief:
    description: Name the day in the guest's OWN emotional language: never a generic label.
    maxLength: 60
  bind: { value: headline }
  style: { … }

- type: Each
  brief:
    description: Order as the day would be lived. Variety of kind over similarity.
    minItems: 3
    maxItems: 5
  bind: { items: sections }
  app: { $include: components/story-section }   # its binds define the item shape
```

- **Shape (linted, closed):** a string (just the description) or `{ description, maxLength }` on a bound element, `{ description, minItems, maxItems }` on an `Each`, **JSON Schema's own vocabulary**, because the brief IS the schema fragment it compiles to. A brief on a node with **no** bind (a shell or partial root) is *composition context*: rules about the whole, like ordering or refinement behavior.
- **What it becomes: this is MCP-native, no side-channel:** the platform compiles every brief into the component's **MCP tool schema** (each key passes through verbatim, `description`, `maxLength`, `minItems`, `maxItems` are native JSON Schema, the Each's app binds → the array's `items` schema). An agent that discovers the component sees a rich, *required* schema: so it must gather real content (**spatial** search) and hydrate the fields before it can render. The hydrated call's values flow back in as the component's state. **The schema IS the instruction channel**; there is no prompt to maintain anywhere else.
- **Grounding is part of the compiled contract:** fields are filled only from search results in the conversation, never invented. The compiler injects this law into every briefed schema.
- **The server referees and mirrors:** invalid/empty compositions are rejected with an instructive result before anything renders (the agent self-corrects and retries); a successful render returns *the page as the guest sees it* in the tool result, so the agent refines surgically on later turns ("more golf" knows which section to swap).
- **The single-state pattern pairs naturally:** a continuously-enriched page (one public state, no `inline`, no ✕) arrives in its slot, can never leave it, and each refinement turn merges new data into the same instance.
- Any number of briefed components can be live at once: each compiles to its own tool.

**Design edits the page; the page briefs the AI.** Changing a description or a length in the definition changes the agent's behavior on the next render: no prompt engineering, no redeploy.

---

## Component checklist

- [ ] Flat if it can be: structure (`layouts/`, a state tree, manifest) is earned
- [ ] Manifest = discovery meta only (no envelope duplicates); the tree's `initial` is the arrival
- [ ] The tree sorts every state by the rearrange rule: public = the app moves, private = nested; input is app chrome, never a state
- [ ] Root = `Switch on view` → each public state's shell; `layout:` written only where the filename differs
- [ ] Three homes respected: content hardcoded · `state` block scalar view-state only · `props` all `input: true`
- [ ] Publish from Studio passes lint with 0 errors: every rule above is enforced

---

**Next:** [04, State](/design/state), how components and apps interact.
