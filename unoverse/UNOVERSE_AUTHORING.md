# Unoverse: Authoring Components & Templates (the complete guide)

> **Status**: 🟢 Guide (June 2026). The single source of truth for *writing definitions*.
> **Audience**: anyone creating or reviewing `apps/unoverse/design/**` definitions.
> **Companions**: [`UNOVERSE_STATE_MODEL.md`](./UNOVERSE_STATE_MODEL.md) (where state lives),
> [`UNOVERSE_LAYERS.md`](./UNOVERSE_LAYERS.md) (how state organizes UI: `layouts/` + `states/` + `components/`),
> [`UNOVERSE_CONFORMANCE.md`](./UNOVERSE_CONFORMANCE.md) (how these rules are **enforced**: the
> editor JSON Schema + guard tests), [`UNOVERSE_SPEC.md`](./UNOVERSE_SPEC.md) (rendering), and the
> SDK's `FRAMEWORK.md` (the laws the engine obeys).
>
> **One line:** a definition is **React without the framework**: state is data, the renderer
> redraws on every change, and a tiny control-flow vocab decides what shows. You build **any**
> UI in `design/` data and **never edit the SDK**.
>
> **Use this doc two ways:** read §1–§8 to *build*; run §9 (the **conformance checklist**) to
> *audit* an existing component or template.

---

## 1. The mental model: design like React

You are writing a **declarative view that reacts to state**, exactly like a React component:
the vocabulary is JSON instead of JSX, and there is **no state machine, no transitions, no
lifecycle** to manage. The renderer is stateless: it throws the tree away and rebuilds it from
the current data on every change. You describe *what the UI looks like for a given state*,
never *how to move between states* (that's just `setValue` writing a field, then a redraw).

| React | Unoverse definition |
|---|---|
| `useState` | a field in the component's data slice (`view`, `step`) |
| `setState(...)` | `action: { "type": "setValue", "values": [...] }` |
| re-render on change | the store notifies → the renderer **redraws the whole tree** |
| `{cond && <X/>}` | **`visibleWhen`** |
| `switch (x) { case … }` | the **`Switch`** node (`on` + `cases`) |
| `items.map(...)` | **`Each`** (`template` + literal `items: []`, or `bind.items` for workflow-fed lists) |
| `<Button/>` (a shared component) | a **`Ref`** to an atom |
| extracting `<StepX/>` to a file | `{ "$include": "step-x" }` |
| a conditional `className` | **`style.when`** |

---

## 2. Anatomy of a definition

Every component, template, and atom is one JSON file with the same envelope:

```jsonc
{
  "unoverse": "1.0",
  "kind": "component",          // "component" | "template" | "atom"
  "name": "Card",               // display name (independent of the filename)
  "category": "Content",        // grouping in the palette
  "description": "…",           // what it is
  "whenToUse": "…",             // selection text: lives in manifest.json when discoverable (envelope form only for flat, manifest-less components)
  "props": { /* see §3 */ },
  "root": { /* the primitive tree: the UI */ }
}
```

- **`root`** is a tree of nodes. Every node has a `type` from the **closed set** (§8) plus
  `style`, `bind`, `children`, `visibleWhen`, `action`, etc.
- **`name`** is independent of the filename; lookup is **case-insensitive by filename**.
- **File placement** (the filesystem *is* the registry, so there is no index to update):

  | Kind | Lives in | Form |
  |---|---|---|
  | component (design system) | `design/marketplace/components/<name>/<name>.json` + optional `manifest.json` (discovery) + `layouts/` (one file per state that owns an arrangement) + optional `components/` (shapes 2+ layouts share) | flat `design/marketplace/components/<name>.json` for a simple one-layout card; **generic + org-neutral: any org can use it**. Addressed `unoverse://components/<name>` |
  | component (org) | `design/orgs/<org>/components/<name>/`: same anatomy; **org-private** (the client's own microapp). Addressed `unoverse://components/<org>/<name>`; the server injects `org` from the folder. Names unique within the org; never shadow a design-system name (lint-enforced); two orgs may share a name | the client's finders/pages, never a restyle of a shared component (that's the theme's job) |
  | template | `design/orgs/<org>/templates/<name>/`, **manifest-only**: `manifest.json` IS the envelope; it declares the template tree in `states:`; root = `layouts/<manifest.layout>.json` (+ `states/` for the base's contained substate files, + `components/`) | org-scoped; no `<name>.json` |
  | atom | `design/marketplace/atoms/<name>.json` | shared partials, **authoring-time only**: the server always expands them before serving (never served, never enumerable, no Studio view) |

### The state tree: the root declares the machine (State Model v2)

A stateful component's root file carries a `state.view` TREE, not a flat discriminant.
The tree is the spine of the whole definition (`UNOVERSE_STATE_MODEL.md` §5 rule 1;
file anatomy in `UNOVERSE_LAYERS.md` §3):

```yaml
# product-card.yaml (the sab pilot, as shipped)
state:
  view:                    # the PUBLIC axis
    initial: products
    states:
      products: {}                        # same-name default: draws layouts/products
      detail:
        layout: product                   # declared ONLY because the filename differs
        on: step
        initial: detail
        states:                           # PRIVATE substates (the steps)
          detail: { layout: product-detail }
          apply:  { layout: product-apply }
```

- **Each state owns its layout(s); `layout:` is OPTIONAL.** A state with no
  declaration draws the layout of its own name; `{}` is a complete state. Write
  `layout:` only when the filename differs.
- **Top level = the public menu; nesting = privacy.** Templates react only to the
  top-level names; a nested step never moves the page. Promote a step to the top
  level only when templates must rearrange for it (the rearrange rule, LAYERS §2).
- **The root still composes a `Switch` on `view`** whose cases `$include` the state
  layouts (guard-enforced); the server compiles the tree into the served projections
  (`publicStates`, `initialView`, `stateTree`).
- **The `states/` folder role changed per tier** (LAYERS §3): at the COMPONENT tier
  the v1 `states/` folder is absorbed by the tree (a private substate is a tree entry
  owning a layout, not a sibling file). At the TEMPLATE tier `states/` still holds
  the files for the base arrangement's contained substates (a welcome hero), which
  the manifest's `states:` tree declares and the compiler contains (§8).

- **Tier rules.** An org pack is `design/orgs/<org>/{templates, styles, components}`. Component
  names are **unique within a tier**: two orgs may ship the same name (each addressed by
  its org URI), but an org may never shadow a design-system name (that collision is a
  lint error, per UNOVERSE_COMPONENT_ORGS.md). Both address forms are first-class: the bare URI
  (`unoverse://components/<name>`) is the canonical address for a design-system component,
  the org URI (`unoverse://components/<org>/<name>`) for an org component. A bare ref
  still resolves an org component while its name is unique across orgs; once two orgs
  carry it, the bare ref errors loudly, listing the qualified candidates.
  Direction: org definitions may reference design-system ones;
  **design-system definitions never reference org ones** (lint-enforced, including template
  preview lists). An org component is never a restyle of a shared one. That's the theme's job.

---

## 3. Props & `bind`: the data contract

> **The discipline (July 2026): components are CONTAINED MICROAPPS.** A component is a
> light, self-contained app. Everything it shows has exactly ONE of three homes, and
> anything else is **slop**:
>
> 1. **Hardcoded content.** Copy, titles, option lists, images are LITERALS in the
>    layout (`value` on Text, `items` on Each, `src`/`alt` on Image). Never props,
>    **never the `state` block.**
> 2. **`state` block, SCALAR internal view-state ONLY**: the mutable keys the
>    component's own actions write (`step`, `phase`, `progressPct`, `questionLabel`),
>    with their initial values. It is **NOT a content home**: an **array** (a finder's
>    `products`), an **object**, a **URL** (`heroImage`), or any **workflow-fed data**
>    sitting in `state` is slop. Move it out (→ #1 or #3). Merged into the render scope
>    beneath the live slice. The ONE object the rule admits is a well-formed
>    `state.view` TREE (§2): the server compiles it to the scalar initial the render
>    scope reads.
> 3. **`props` (`input: true`)** is the EXTERNAL contract: the workflow-fed data a run
>    streams in (a finder's matched `products`, the user's real accounts), each with a
>    mock `default` for preview. A component with no workflow feed has an empty/absent
>    props block.
>
> The **arrival state is the tree's declared `initial`** (STATE_MODEL §5 rule 3): the
> host honors it whenever it has a matching state, and only scans its own declared
> order when it does not. Nobody sends a state.
> *Legacy note:* pre-tree components declared an arrival `defaultState` in the
> component manifest (or `state.defaultState`); the loader still reads it for flat
> components that have not migrated, but new authoring declares the tree `initial`.
>
> The audit is mechanical: static content → hardcode in the layout; a **scalar** the
> component mutates → `state`; data the workflow feeds → `props` (`input: true`); the
> arrival state → the tree's **`initial`**. **An array / object / URL in `state` is the
> tell for #1 or #3 slop.** (PlanFinder went from ~60 props to ZERO props + a lean
> scalar `state`.)

`props` declares every field the UI reads, with a `type` and a **`default`** (the mock value
the workbench renders):

```jsonc
"props": {
  "accounts": { "type": "array", "input": true, "default": [ /* mock rows for preview */ ] }
}
```

- **Every prop is `input: true`**: the external workflow feed, nothing else. Static content is
  hardcoded in the layout; view-state initials live in the `state` block; the arrival
  state is the tree's `initial`. (A *flat, manifest-less* card streamed with simple
  fields may still declare them as `input: true` props, since its whole surface IS the feed.)
- **`default`** is the mock value Studio renders: realistic content, not empty strings.

A node reads a prop with **`bind`** (`targetProp → dataField`):

```jsonc
{ "type": "Text",   "bind": { "value": "title" } }
{ "type": "Image",  "bind": { "src": "image", "alt": "title" } }
{ "type": "Button", "bind": { "label": "callToAction" } }
{ "type": "Each",   "bind": { "items": "accounts" }, "template": { /* per-row */ } }
{ "type": "Icon",   "bind": { "name": "iconField" } }   // or literal "icon": "expand"
```

---

## 3a. Spatial discovery: the OPTIONAL component `manifest.json`

A basic component needs **no manifest**: a workflow **streams** it in (path **D**),
it renders, it's done. Add a `manifest.json` to the component folder **only when the
component should be discoverable in Spatial** (indexed into the 3D knowledge map,
ranked against user intent by findIntent). The manifest's **presence IS the
capability**: there is no flag inside it, and nothing else grants it.

> **What "discoverable" means, precisely (native MCP, see `UNOVERSE_MCP_TEMPLATE_PROTOCOL.md`
> §0.1 paths B/C).** A discoverable component is published as a standard **MCP app**: it
> registers a tool whose `_meta.ui.resourceUri` is a `ui://` shell that renders this
> component. When findIntent surfaces it, the LLM does an ordinary `tools/call`, the result
> carries the UI, and **the SDK renders the card into the chat**: *no workflow, no
> `COMPONENT_INIT` emit, no "the LLM renders a component."* This is **additive to** streaming,
> not a replacement: a self-contained component (path **B**) carries its own data in its
> `state` block; a **node-hydrated** card (path **C**) is a shell a spatial data node fills.
> A component being *streamed by a workflow* (path **D**, e.g. AIResponse) is unchanged and
> remains the standard runtime paint path. The manifest here is what turns a plain component
> into a path-B app; a path-C card is a normal component whose data arrives from a node.

The manifest carries only discovery meta:

```jsonc
// design/marketplace/components/planfinder/manifest.json
{
  "title": "Plan Finder",                       // display name (falls back to the def name)
  "description": "A guided plan-finder quiz: a few eligibility and preference questions ending in a best-fit plan recommendation.",
  "whenToUse": "Find the right plan for me: which plan should I get, what plan is best for my needs, am I eligible? A few quick questions end in one personalised best-fit recommendation with the reasons why it fits.",
  "category": "Input",
  "version": "1.0.0"
}
```

- **`description`** is what it IS: the listing subtitle, **one short line (≤120 chars,
  guard-enforced)**. No "use when…" inside it; detail belongs in `whenToUse`.
- **`whenToUse`** is the **selection text** findIntent ranks against the user's OWN
  message, so write it **utterance-shaped**, in the words the user would actually say
  ("Find the right card for me: which card should I get…"), never selector-shaped
  dev framing ("Pick when the user asks to…", guard-rejected). When present it
  replaces `description` in the embedded text. Full contract:
  `packages/docs/nodes/node-discoverability.md` (the templates/skills section
  applies to components verbatim).
- The manifest is the **single home** for this meta: the envelope must not
  duplicate `description`/`whenToUse` (guard-enforced). The server merges the
  manifest over the def, so every consumer reads one shape.
- Exposure is **two toggles, both off by default**: the manifest makes the Studio
  "Spatial" toggle appear on the component (Level 1: workbench eligibility); the
  Content Engine then opts it onto a specific workflow's map (Level 2: presence),
  where it's indexed and trained like any skill or template.

---

## 3b. Briefs: components an AI fills (July 2026, LOCKED)

A **brief** tells an AI what should fill a bound element. It sits **on the node that
renders what it describes**, next to the `bind` it governs, never in the manifest,
never a separate file, never a prompt anywhere else:

```jsonc
{ "type": "Text",
  "brief": { "description": "Name the day in the guest's OWN emotional language.",
             "maxLength": 60 },
  "bind": { "value": "headline" } }

{ "type": "Each",
  "brief": { "description": "Order as the day is lived. Variety of kind over similarity.",
             "minItems": 3, "maxItems": 5 },
  "bind": { "items": "sections" },
  "template": { "$include": "components/story-section" } }   // its binds = the item shape
```

- **Vocabulary = JSON Schema's own words** (`description`, `maxLength`, `minItems`,
  `maxItems`): the brief IS the schema fragment it compiles to. String shorthand = just
  the description. A brief on an unbound node (a face/partial root) = composition
  context (ordering, refinement rules). Shape is closed and lint-enforced.
- **The pipeline is 100% native MCP** (deep spec: `UNOVERSE_MCP_TEMPLATE_PROTOCOL.md`
  §Briefed components): the server compiles briefs → the app tool's `inputSchema` (with
  a recipe description: "the page IS your answer: search spatial, fill from results,
  call"); the server **referees** every call (invalid/empty args → an instructive
  result, no render, and the retry loop self-corrects) and **mirrors** every success (the
  result returns the page as rendered, so refinements are surgical).
- **Four channels, one loop:** description instructs · schema constrains · error result
  corrects · success result reflects. No composer service, no server-side model, no
  skills framework, no prompt side-channels.
- Pairs with the **single-face permanent component** (one named face, `default` → the
  same face, no `inline`, no ✕) for continuously-enriched pages, e.g. a travel-plan
  page a conversation keeps growing.
- **Two doors, one engine** (August 2026): the same compiled briefs also serve a
  Component node's MCP service port on the canvas (`getSchema`/`read`/`fill`), so a
  WORKFLOW agent can hydrate the page mid-run. Spec + the termination contract that door
  still owes: `UNOVERSE_MCP_TEMPLATE_PROTOCOL.md` §The workflow door.

---

## 3c. Lifecycle handlers: a component brings its own JavaScript (July 2026, DESIGN, not yet built)

A brief lets an **AI** fill a component. A **lifecycle handler** lets **code** fill it. A
component may carry a small server-side script, co-located in its own folder, that the
platform runs at defined moments in the component's life. Use it when the data comes from
an **API or computation**, not from an AI or the workflow (e.g. "when this restaurant card
loads, fetch its live details from Google Maps").

**The mental model: browser & page.** The platform has **one universal component node**
that renders every component (`nodes/components/src/lib`, where `synthesize` builds a node def
per design component, `DesignComponentExecutor` runs them all; the only per-component variance
is DATA). That node is a **browser**; a component is a **page**. Most pages are just
content (the design JSON). Some pages also carry a **script**, and the browser runs whatever
script the page brought, **without being rebuilt per page**. The handler is that script:
it travels *with* the component, so **any** universal node, on **any** server, can run it.
Nothing is baked into the node.

**Convention: one file per lifecycle, the filename names it; the manifest authorizes it.**
The manifest **opts in** to the lifecycles a component runs (auditable: you can list every
component that executes code); each lifecycle's code lives in a sibling file named for it:

```jsonc
// manifest.json
{ …, "defaultState": "list", "lifecycle": ["onStart"] }   // authorizes onStart
```
```
design/orgs/<org>/components/restaurant-card/
   restaurant-card.json      # the UI (data)
   manifest.json            # declares "lifecycle": ["onStart"]  ← the opt-in
   onstart.js               # the code: filename = the lifecycle
```

A stray `onstart.js` with **no** manifest opt-in does nothing: code runs only when the
manifest said it runs. The file's **default export** is the handler; it returns a
partial-props object **merged into the component instance** (streamed to the client as
`COMPONENT_DATA`, the same path everything else uses). **The code is self-contained**: the
external call lives right in the handler; only the **secret** comes from `ctx` (never
hardcode a key in this shared folder):

```js
// onstart.js: the call is HERE; the key comes from server config via ctx.env
export default async function onStart(ctx) {
  const key = ctx.env("SEARCHAPI_KEY");                    // secret: server config, NOT in the file
  const res = await fetch(`https://www.searchapi.io/api/v1/search?engine=google_maps&q=${encodeURIComponent(ctx.props.title)}&api_key=${key}`);
  const place = (await res.json()).local_results?.[0] ?? {};
  return { rating: place.rating, reviews: place.reviews, openState: place.open_state,
           hours: place.hours, address: place.address, contactPhone: place.phone, website: place.website };
}
```

> The handler holds its own logic by design. Later it may also **delegate** to platform
> machinery via `ctx` (e.g. `ctx.callNode(type, config)` to reuse an existing node, or run
> a workflow), useful when non-coders should wire what runs. For now, prefer the code
> right here.

**`onStart` fires when the instance is CREATED.** Server-side at `COMPONENT_INIT`,
before/as the component streams to the client. So it needs **no SDK change and no client
signal**: the client simply receives an already-enriched (or progressively-enriched)
component. The key stays server-side; the client never calls the API.

**`onEnterView` fires when the instance ENTERS A NAMED LAYOUT.** A card and its detail
view are **one instance** in the state-selected model: a CourseCard in the grid and the
same card expanded to its `course` layout differ only by which layout is active. Nothing
re-renders on that switch, so `onStart` is the wrong moment for anything a detail view
needs: hydrating at creation would fetch a body copy for **every** card in a grid to
render twelve thumbnails. `onEnterView` fetches only what a person actually opened.

Because the layout switch happens on the client, this phase is the one that needs a
signal, and that signal is an **event, not a command** (the invariants below). Declare
it in the long form, naming the layouts that wake it:

```yaml manifest.yaml
lifecycle:
  - phase: onEnterView
    layouts: [ course ]        # ONLY this view fires it; the grid layouts never do
    handler: getDetail         # a PLATFORM-READY handler: this component ships no code
```

**Platform-ready handlers: config instead of a copied file.** Some handlers are the same
in every project, so the platform ships them by name and a component just points at one.
`getDetail` is the first: *fill this card with its own full record.* It reads the
instance's `universal_id`, dereferences it against the dictionary, and merges the
editorial fields (bodyCopy, needs, callToAction, …) into the instance.

That is the whole point of the phase, and the rule it enforces: **full authored copy never
travels through a model.** The card carries an id; the **platform** resolves it. A model's
only role is choosing the item; it never reads, carries, or retypes the content. A
component needing something bespoke still ships its own file (RestaurantCard's Google
lookup above); the common case now carries no code at all.

**Both spellings are valid.** `lifecycle: [ onStart ]` is shorthand for
`{ phase: onStart }` with a co-located `onstart.js`. Use the long form when you need
`layouts:` or `handler:`. Lint and a conformance guard check both halves agree: an
unknown phase, an unknown handler name, `layouts:` on a phase that has no view, a handler
file nothing opted into, or an opt-in that resolves to neither a file nor a platform
handler are all **errors**, never silent no-ops.

**The invariants for a client-signalled phase.** `onEnterView` is driven by the client
saying *"instance X entered layout `course`"*, and the platform treats that as news, not
instruction:

1. the **server** picks the handler, from the component's own manifest, layout-scoped;
2. inputs are **re-derived** server-side: its own copy of the instance props, never the
   client's claim;
3. the instance is **validated**: it must belong to the calling session;
4. the phase fires **once** per instance and layout, so re-opening a view costs nothing;
5. failure is **closed**: an unknown instance or a foreign session runs nothing;
6. the reply carries **no data**: enrichment returns on the instance's own stream, as the
   same props merge `onStart` uses.

**How the one shared node runs the right script (the phonebook).** At boot the platform
already walks every component folder to synthesize nodes (`loadComponentDefs`). At that
same moment it records each component's handler on its `RuntimeComponentMeta`, a
`name → handlers` table. The universal executor already holds that meta at run time (it's
how it knows the prop names); when a lifecycle fires it looks up **this** component's
handler by identity and runs it. **One node, one phonebook, the right script by name**:
the sharing works *because* the per-component part is data-with-a-code-reference, riding
the exact channel prop names already ride.

**`ctx`: the bounded sandbox.** The handler gets only what it's allowed: `ctx.props`
(the instance's current data), `ctx.instanceId`, and safe verbs like `ctx.callNode(type,
config)` (run a workflow node, credentials resolved server-side), NOT raw run-of-the-box
access. "Bring anything it wants" means anything *within* this sandbox, like a page's
script runs in the browser sandbox, not on the machine.

**Security (deep spec: `UNOVERSE_MCP_TEMPLATE_PROTOCOL.md` §onEnter/lifecycle invariants).**
- Handler code is **trusted-author** (same trust as a node), never injected by an end
  user or the AI. One file per component, one narrow entry point each.
- The **caller** decides *what* runs (server resolves the lifecycle → handler from the
  component's own record), never the client. A future *per-view* lifecycle that reacts to
  a client "view opened" signal MUST treat that signal as an **event, not a command**
  (server picks the handler, re-derives inputs from its own instance record, validates the
  instance against the authed session, and rate-limits). See the protocol's six binding
  invariants.
- Handler **output is shaped** (only the props it returns), never a raw upstream response
  or anything carrying a secret.

**Extensible by design.** `onStart` and `onEnterView` ship today; the shape generalizes.
Future lifecycles are more fire points named the same way: `onexit`, `onrefresh` (the
re-pull `onEnterView` deliberately does not do), each added to the platform's phase set
and then to a manifest's `lifecycle` array. A component implements only the lifecycles it
needs; absence = no handler, zero cost. Authors add **handlers**, never fire points: the
phase set is platform-owned precisely so nothing can invent a moment to run code. The design folder was
data-only until this feature. Lifecycle handlers are the **one sanctioned code carve-out**
(like atoms), enforced by conformance: a lifecycle file must be **named for a known
lifecycle** AND **opted into by the manifest's `lifecycle` array**. An un-opted file, or
one named for an unknown lifecycle, is a lint error (no silent/surprise code execution).

---

## 4. Your first component (walkthrough)

A focusable card that expands inline → focused. File: `design/marketplace/components/mywidget/mywidget.json`.

```jsonc
{
  "unoverse": "1.0",
  "kind": "component",
  "name": "MyWidget",
  "category": "Content",
  "description": "A card that expands from a compact row to a focused panel.",
  "whenToUse": "Show a single item that can expand in place to reveal detail.",
  "props": {
    "title":        { "type": "string", "default": "My widget" },
    "detail":       { "type": "string", "default": "The expanded detail goes here." },
    "focusable":    { "type": "boolean", "default": true }
  },
  "state": {
    "view": {
      "initial": "inline",
      "states": { "inline": {}, "focused": {} }
    }
  },
  "root": {
    "type": "Switch",
    "on": "view",
    "cases": {
      "inline": {
        "type": "Button",
        "visibleWhen": "focusable",
        "action": { "type": "setValue", "values": [{ "key": "view", "value": "focused" }] },
        "style": { "direction": "row", "align": "center", "gap": "3", "padding": "4", "radius": "lg", "border": "subtle" },
        "children": [{ "type": "Text", "bind": { "value": "title" }, "style": { "font": "body.md", "weight": "semibold", "color": "text.primary" } }]
      },
      "focused": {
        "type": "Box",
        "style": { "direction": "column", "gap": "3", "padding": "5", "radius": "lg", "background": "surface.base", "shadow": "lg" },
        "children": [
          { "type": "Text", "bind": { "value": "title" },  "style": { "font": "headline.sm", "color": "text.primary" } },
          { "type": "Text", "bind": { "value": "detail" }, "style": { "font": "body.md", "color": "text.secondary" } },
          {
            "type": "Ref", "ref": "close-button",
            "action": { "type": "setValue", "values": [{ "key": "view", "value": "inline" }] }
          }
        ]
      }
    }
  }
}
```

That's a complete, stateful component. The `state.view` tree declares the two states it
can be in and which one it arrives in; the `Switch` draws whichever is current; `setValue`
moves between them and the renderer redraws. Both names are PUBLIC (top level of the tree),
so a template may rearrange for either. Drop the folder in `design/marketplace/components/` and it's
discoverable immediately (no registration).

---

## 5. Composition: atoms (`Ref`), `$include`, `Each`

**Atoms (`Ref`)** are shared partials in `design/marketplace/atoms/` (e.g. `button`, `account-row`,
`section-header`, `close-button`). Atoms are **authoring-time only**: the server always
expands a `Ref` before serving, so channels only ever receive fully-expanded primitive
trees (atoms are never served, never enumerable, and have no Studio view). A `Ref` inlines
an atom and **remaps its fields** via `props` (the atom's bind field ← your data field).
It may also override `visibleWhen`, `action`, or `style`:

```jsonc
// atom design/marketplace/atoms/account-row.json binds label/sub/meta…
{ "type": "Ref", "ref": "account-row",
  "props": { "label": "name", "sub": "accountNumber", "meta": "bankName" },
  "action": { "type": "setValue", "values": [{ "key": "step", "value": "amount" }] } }
```

**`Ref.with` passes LITERALS into an atom** (`props` stays the field-remap map; different job):

```jsonc
{ "type": "Ref", "ref": "button",
  "with": { "label": "Learn more", "icon": "arrowRight" },
  "action": { /* … */ } }
```

Semantics of `with`: a bind entry whose field is a `with` key becomes a **hardcoded
attribute**; a **truthy** `with` key satisfies (drops) a matching `visibleWhen` guard, while
an unprovided key leaves the guard in place so that piece stays hidden; `{{key}}`-style
bindings take the literal value.

**`$include`** splits a big definition into sibling files (same folder). The included file is a
**bare node** (no envelope). Use it to give each *view* its own file:

```jsonc
{ "$include": "step-source" }   // ← design/marketplace/components/<name>/step-source.json
```

**`Each`** repeats a subtree over a bound array; each item is the data scope for one copy:

```jsonc
{ "type": "Each", "bind": { "items": "beneficiaries" },
  "template": { "type": "Ref", "ref": "account-row", "props": { "label": "name" } } }
```

**Rule of thumb:** shared look → **atom**; whole alternate view → **`$include` + `Switch`**;
repeated item → **`Each`**.

---

## 6. Where state lives (the 3 buckets)

A "state" is just field values in one of three buckets (full detail:
[`UNOVERSE_STATE_MODEL.md`](./UNOVERSE_STATE_MODEL.md)):

| Bucket | Holds | Write with |
|---|---|---|
| **Component state** | one slice per component, carrying data **and** its view-state: the public `view` (legacy alias `defaultState`) + private keys (`step`) | `setValue` (or streamed `COMPONENT_DATA`) |
| **Template state** | the template's bag: `draft` + dev-named keys (`openPanel`) | `setTemplateValue` |
| **Conversation** | the turn timeline; `isStreaming`/`isEmpty` are **derived**, not stored | the stream |

You pick the key **and** the bucket. The SDK hardcodes no UI concept.

---

## 7. The four moves (reacting to state)

**One predicate, three uses.** `visibleWhen`, `Switch`, and `style.when` evaluate the same
**`Condition`**: pick one of `eq` / `ne` / `in`, or, with none, a truthy test. It is a small
declarative layer, **not** a language: no `and`/`or`/arithmetic.

### a. `visibleWhen`: a *small* thing appears/disappears
```jsonc
"visibleWhen": "focusable"                                  // truthy (empty array = empty)
"visibleWhen": { "field": "status", "eq": "error" }
"visibleWhen": { "field": "step", "in": ["recipient", "amount", "review"] }
```

### b. `Switch`: a *whole view* swaps (wizard / inline↔focused)
```jsonc
{ "type": "Switch", "on": "step",
  "cases": {
    "source":    { "$include": "step-source" },
    "amount":    { "$include": "step-amount" },
    "default":   { "$include": "step-source" }
  } }
```
The branch for `data.step` renders; else `cases.default`; else nothing. Mutually exclusive in
**one place**, safer than repeating `visibleWhen` on every sibling.

### c. `Each`: repeat over data (see §5).

### d. `style.when`: the *same* element restyles by state (no cloning)
```jsonc
{ "type": "Box",
  "style": { "background": "surface.sunken",
             "when": [{ "field": "active", "eq": true, "apply": { "background": "status.success" } }] } }
```
The data-driven generalization of `style.disabled`; matching variants merge `apply` over the
base (later wins).

### Worked example: the stepper, before & after
Old: **two Boxes per dot** (one `eq`, one `ne`) just to swap a colour: six near-identical
blocks for three dots. New: one element + `style.when`, and ideally **make the dots data** so
the node sends `steps: [{ label, active }]` and you `Each` over them:

```jsonc
{ "type": "Each", "bind": { "items": "steps" },
  "template": { "type": "Box",
    "style": { "background": "surface.sunken",
               "when": [{ "field": "active", "eq": true, "apply": { "background": "status.success" } }] },
    "children": [{ "type": "Text", "bind": { "value": "label" } }] } }
```
Six hand-written blocks → one templated dot.

---

## 8. Your first template

A template is a **state machine over a layout shell**: its manifest declares a tree of
states, each state owns the arrangement that draws it, and hosted components move it
between states by name (STATE_MODEL §5). Two template-only primitives place content:

- **`ComponentSlot`** pulls streamed components out of the store. A **reaction
  surface** selects by the component's PUBLIC state, claiming exactly ONE view:
  ```jsonc
  { "type": "ComponentSlot",
    "select": { "from": "all", "where": { "field": "view", "eq": "products" } },
    "fallback": { "type": "Skeleton", "variant": "card" } }          // when zero matches
  ```
  A surface selects on the public axis (`view`; lint warns on any other field: a
  component's internal keys are private) and claims one view with a string `eq`
  (lint errors on `ne`/`in`/bare selects: they make the template's active state
  ambiguous). Ties go to the most recent write (`limit: 1` law). Per-turn slots
  inside a `Timeline` need no `where`: they render whatever that turn streamed.
  *Legacy note:* v1 taught type-pinned global slots (`select.type`); reaction
  surfaces select by STATE now, never by a named component type.
- **`Timeline`** renders the conversation; you supply the **`user`** and **`assistant`** turn
  subtrees (each turn's `ComponentSlot` is scoped to that turn). Per-turn scope fields:
  `text`, `time`, `streaming`, `empty`, `active`, plus anything in `assistantData`/`userData`:
  ```jsonc
  { "type": "Timeline",
    "assistantData": { "avatarUrl": "https://…", "thinkingText": "Thinking…" },
    "user":      { "$include": "user-turn" },
    "assistant": { "$include": "assistant-turn" } }
  ```

**The app manifest** (in the template folder) declares the template tree, binds the app
to a workflow, and describes it. The sab pilot, as shipped:

```yaml
# design/sab/templates/sab-chat-layout/manifest.yaml
name: sab-chat-layout
description: The SAB customer-support chat, with a route to live support.
whenToUse: "Ask SAB a banking question or get general help…"   # SELECTION text: below
category: Assistant
version: 1.0.0
defaultState: template        # APP-LEVEL load state (protocol §4b), NOT the component axis
# THE TEMPLATE TREE (STATE_MODEL v2): one declaration, everything follows.
states:
  main:                       # the base arrangement (named for `layout:` below)
    states:
      welcome: {}             # contained substate; first declared = the landing default
  focus: {}                   # the reaction ladder, in priority order
  products: {}
  detail: {}
preview:                      # PURE HINT per state: what to seed in mock/workbench views
  products: [ product-card, product-card, product-card ]
  detail: [ product-card ]
inputSchema:
  type: object
  properties:
    message: { type: string, description: The user's request }
binding: { workflow: wf-r4jzo7, trigger: inputtrigger9 }   # app owns its workflow + trigger
autoTrigger: false            # true = fire on load; false = wait for the user
expose: { openaiApps: false }
layout: main                  # the base arrangement = layouts/main
```

What the tree gives you, with nothing else authored:

- **The ladder is DERIVED**: `stateOrder` = the tree's top level minus the base, in
  declared order (`focus, products, detail` above). The template walks it top-down
  and enters the first state ANY hosted component's view matches; a higher state
  CANCELS the claims below it, so release lands on the base (STATE_MODEL §5 rule 5).
  An authored `stateOrder` remains only as the legacy form for templates without a
  tree.
- **Nesting is containment, compiled**: a declared base substate (`welcome`, its file
  in `states/welcome`) is STRIPPED from every non-base arrangement at compose time.
  No hand-written guard polices it; the substate file keeps its own condition
  (`visibleWhen: isEmpty`). The base's always-on content (the conversation timeline)
  is its SHELL, not a substate: declaring a state contains it.
- **Arrival**: the host honors an arriving component's declared `initial` whenever it
  has a state of that name, and scans its own declared order only when it does not.
- Each top-level state draws `layouts/<name>` by the same-name default, exactly like
  a component state.

**`defaultState` in the manifest is a DIFFERENT axis**: it is the app-level load state
the channel router branches on (`template` = swap the whole surface; `focus` = stream
into the current template and open in focus; see `UNOVERSE_MCP_TEMPLATE_PROTOCOL.md`
§4b). It is unrelated to the component `view` axis despite the shared word. The legacy
`type` + `fluidHeight` + `previewComponents` manifest fields are derived from or
superseded by `defaultState` + `preview`.

### Template discoverability: `whenToUse` (essential, like nodes)

Templates are added to spatial and discovered by intent (`findIntent`), exactly like MCP
tools and nodes. Discovery embeds `` `${title}. ${whenToUse || description} [${category}]` ``
which is the **same contract as the node catalog**, so the same writing rules apply
(`packages/docs/nodes/node-discoverability.md`):

- **`whenToUse` is the selection text**: when present it *replaces* `description` in the
  embedding. Write it **outcome-first in the user's vocabulary** ("Transfer or send money:
  pay a beneficiary or move funds…"), never mechanism-first ("Two-column split layout…" ranks
  near layout concepts, not near what users ask for, so the template becomes invisible).
- **`description` stays the human "what it is"** (the Content library list line).
- Disqualify by **property**, never by naming a sibling template.
- The manifest wins over the template def for every meta field; the reconcile warns for any
  enabled template missing `whenToUse`. Registry items embed their authored meta **AS-IS**
  (no LLM convert-to-need). Editing `whenToUse` changes the content hash → re-ingests on the
  next train.

---

## 9. Conformance checklist (use this to audit every definition)

Run each definition against these. A "no" is a finding to fix.

**Envelope & placement**
- [ ] Has `unoverse`, `kind`, `name`, `category`, `description`; components also have `whenToUse`.
- [ ] Lives in the right dir (`components`/`templates`/`atoms`); folder form when it uses `$include`.
- [ ] `whenToUse` is generic and selection-focused (no hardcoded agent/workflow names).

**Values (LAW 1: own zero values)**
- [ ] **No raw `px`/`rem`/`em`/`#hex` anywhere**: token names only (`"color": "text.primary"`,
      `"radius": "lg"`). Sizes use the **space scale** (`"width": "8"`, not `"2rem"`).
- [ ] No invented component-named tokens (`cardMin`, `tile`). Use a generic scale step.

**Data contract**
- [ ] Every `bind`ed field has a matching **prop with a `default`**.
- [ ] Workflow-fed fields are marked **`input: true`**; the rest are static content/config.

**State & reactivity (the heart)**
- [ ] A stateful component declares a **`state.view` tree** (§2): public states at the top
      level, private steps nested, an `initial` at every level with substates.
- [ ] Each state **owns its layout**; `layout:` is written only when the filename differs
      from the state name (same-name is the default; `{}` is a complete state).
- [ ] A state is **public only if templates should rearrange for it**: an ignored public
      state falls inline (STATE_MODEL §5 rule 6); steps that never move the page nest.
- [ ] Other state is a **few shallow discriminants** (`step`), not a soup of booleans.
- [ ] **Whole-view swaps use `Switch`** (one place), **not** N siblings each with `visibleWhen eq`.
- [ ] **Conditional styling uses `style.when`**: **no element cloned** under opposite
      `eq`/`ne` `visibleWhen`s just to change a style.
- [ ] Conditions only **read** fields; nothing is **computed** in the template.
- [ ] Anything derived (is-active, totals, formatted values, chosen colour) is computed in the
      **node** and sent as a plain field.

**Composition**
- [ ] Repeated UI uses **`Each`** over data (not hand-written N times).
- [ ] Shared look is an **atom** via `Ref` (not copy-pasted).
- [ ] Alternate views are **`$include` files** selected by `Switch`.

**Briefs (AI-filled components, §3b)**
- [ ] Every brief sits **on the node that renders what it describes**, next to its `bind`,
      never in the manifest, never a separate file.
- [ ] Brief keys are JSON Schema's own (`description` / `maxLength` / `minItems` /
      `maxItems`); length/count constraints are **numbers**, not prose.
- [ ] Composition rules (ordering, variety, refinement behavior) live on the **Each** or
      the **face root**, not repeated per field.
- [ ] No prompt for filling the component exists anywhere else (no skill, no agent
      instruction, no workflow prompt): the compiled schema is the only instruction home.

**Sizing (focused / rich layers)**
- [ ] A focused/full-panel layer **caps its height and scrolls its body only**: bounded height
      (`height: full`/`flex: 1` + `minHeight: 0`), chrome pinned, content region `overflow: auto`
      (scrollbar only when needed). Never let content overflow the frame and clip
      (`UNOVERSE_LAYERS.md` §4b).

**Templates only**
- [ ] Uses `ComponentSlot`/`Timeline` for streamed components + conversation (doesn't hardcode them).
- [ ] The manifest declares a **`states:` tree** (§8): base first, reaction states in
      priority order; the ladder is derived, never authored alongside the tree.
- [ ] Every reaction surface selects on the **public axis** (`select.where` field `view`)
      and claims exactly ONE view with a string `eq`: never a component's internal key,
      never `ne`/`in`/bare, never a type-pinned global slot.
- [ ] Condition-guarded moods of the base (a welcome hero) are **contained substates** of
      the base in the tree, with their files in `states/`, never ladder entries.
- [ ] The manifest has a `binding` (`workflow` + `trigger`), an app-level `defaultState`
      (the load state, protocol §4b), and an `autoTrigger` that matches it.

**SDK boundary**
- [ ] Required **zero SDK changes**. If you thought you needed a new primitive/style key,
      re-check §7 + the SDK `FRAMEWORK.md` gates. It's almost always data.

---

## 10. The vocabulary (closed set)

Structural: `Box` / `Stack` / `Row` / `Column` · `Each` · **`Switch`** · `ComponentSlot` / `Timeline`.
Leaves: `Text` · `Image` · `Button` · `Input` · `Markdown` · `Skeleton` · `Icon`.
Authoring helpers (expanded server-side): `Ref` (atom) · `$include` (sibling file).
Conditions (shared by `visibleWhen` / `Switch` / `style.when`): `eq` · `ne` · **`in`** · truthy.

`Switch`, `in`, and `style.when` are recent additions (June 2026), conservative sugar over the
existing redraw model. *How state works did not change*; these just let stateful widgets be
authored cleanly. Adding to this set is an SDK change gated by build-failing guard tests.

---

## 11. Tokens: where values live

`design/orgs/<org>/styles/` is the only place raw values exist (each org's style set is complete
and self-contained; `design/orgs/default/styles` is the default token set and the starter you copy
for a new org): `base/` (raw scales: color, spacing, radius, shadow, border, motion,
typography) → `semantic/` + `themes/` (named meanings components use: `text.primary`,
`surface.base`, `action.primary`, `space` steps, `headline.sm`). A brand or dark-mode change is
a theme swap with **zero definition changes**. Need a value with no token? **Add/scale a
token** in your org's `styles/` and reference it, never inline it.

---

## 12. Seeing your states (workbench)

Because the root DECLARES the tree, the workbench state switcher renders the served
`stateTree` projection and nothing else (`UNOVERSE_LAYERS.md` §8): **states live ON
TOP** (one button per public state in the sub-navigation); selecting one reveals **its
steps beneath, by step name** (never layout filenames, those are plumbing). The shell
is not listed (it is always on), and one drawing is not a choice: a single-layout
state shows nothing below. Picking a state writes the public axis (`view`) through the
same generic `setValue` path a component's own chrome uses; picking a step writes the
state's declared `on` key. Mock data comes from prop `default`s. No fixture file, no
`visibleWhen` archaeology, no Switch-scanning: add a state to the tree and it appears
everywhere (workbench + the served `publicStates`/`stateTree`/`manifest.states`
projections) with nothing to register.
