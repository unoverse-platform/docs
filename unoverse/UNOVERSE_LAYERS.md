# Unoverse: The Layers Model (states own layouts)

> **Status**: 🎯 State Model v2, DECIDED 2026-08-08. This doc is how the state model
> organizes FILES; the machine itself (the six rules: public/private, arrival, the
> priority ladder, inline fallback) lives in
> [`UNOVERSE_STATE_MODEL.md`](./UNOVERSE_STATE_MODEL.md) §5. The sab pilot
> (`product-card` + `sab-chat-layout`) is the proving ground; anatomy details bend
> there first, then here.
> **Companion to**: [`UNOVERSE_AUTHORING.md`](./UNOVERSE_AUTHORING.md) (writing
> definitions), [`UNOVERSE_CONFORMANCE.md`](./UNOVERSE_CONFORMANCE.md) (the guards).
>
> **One line:** a definition is a state tree; each state owns the layout that draws
> it; the tree is the spine of the file layout, and the filesystem stays the registry.

---

## 1. The principle: the state tree is the spine

Stop thinking of a definition as a fixed tree with bits toggled on and off (a soup of
`visibleWhen` booleans coordinated by hand). Think of it as a **state machine whose
states own drawings**:

- one discriminant per axis, its value names the active state
  (`view: products | product`, `step: income | summary`)
- each state owns the layout that draws it
- changing the value redraws; nothing is toggled

**One value = one active state = one drawing.** There is one question per surface,
"which state?", answered by one value, instead of many independent on/off flags. This
is the discriminated-union doctrine (STATE_MODEL §0) applied to files.

### States nest: the same primitive all the way down

A template has states; a template state's layout holds components; a component has
states; a component state's layout holds its content. Every node owns its own
discriminant. A thing can also carry several orthogonal axes (a widget with `view`
and, inside one state, `step`), each its own Switch.

### State selects the drawing; data fills it

Switching states never touches data. Data arrives the standard way (`COMPONENT_DATA`,
props, template state) and whichever layout is active binds it. One dataset, many
projections: the same course as a rail card or a full page. Data itself chooses
nothing (STATE_MODEL §7: DATA → STATE → UI, one direction).

---

## 2. Public vs private: the one placement decision

The top level of the `view` axis is the component's **public menu**: what templates
and hosts can see, place at spawn, and react to. Everything nested below is
**private**: invisible outside the component. The boundary is structural (where a
state sits in the tree), not a judgment call. The old VIEW test (three questions) and
the `<face>-<step>` filename convention are superseded by this one rule, and the
rearrange rule survives as its guide:

> **If the template must rearrange to show it, make it a PUBLIC state.
> If the template wouldn't move, NEST it privately.**

The corollary from STATE_MODEL §5 rule 6, because it bites: an ignored public state
does not stay put, it falls inline. A step that must never move the page (an apply
form inside a detail page, a comment bar docked in a memo) belongs in the nest, not
on the menu.

And the third question survives from v1 unchanged: **"does it collect input?"** Then
it is neither a public nor a private state of the component. A composer, an edit
form, a picker is TEMPLATE CHROME: one input tool, owned by the template; a card's
Edit stages its data into it. Never an `edit` face on a component. (Learned twice on
docreview.)

Direction is locked with it: components stream into the template and the TEMPLATE
REACTS TO COMPONENTS, never the reverse (post-spawn; the spawn-time placement scan is
STATE_MODEL §5 rule 3).

---

## 3. The structure: the root declares the tree

A rich thing (a component or template that actually has states) is organized as:

```
<thing>/
  <thing>.yaml     ROOT: declares the state tree; carries any always-on shell
  manifest.yaml    templates only (the app: binding, stateOrder, preview)
  layouts/         the DRAWINGS: one file per state that owns an arrangement
  components/      OPTIONAL: shapes shared by 2+ layouts; each lives ONCE
```

The root's `state:` block IS the design, readable top to bottom:

```yaml
# product-card.yaml (the sab pilot, as shipped)
state:
  view:
    initial: products
    states:
      products: {}                # same-name convention: draws layouts/products
      detail:
        layout: product           # declared ONLY because the filename differs
        on: step
        initial: detail
        states:
          detail: { layout: product-detail }
          apply:  { layout: product-apply }
```

`layout:` is optional and `{}` is a complete state: no declaration means the state
draws the layout of its own name (STATE_MODEL §5 rule 1). A state's own layout is
its SHELL (always on while active, never a choice); its substates are the STEPS,
the only choices inside it, addressed by their state names.

- **`layouts/`** = pure arrangements, no state logic inside. A layout is referenced
  by a state's declaration and by nothing else; it is never addressable on its own.
- **Same-name convention.** A state named `products` owns `layouts/products` unless
  it declares otherwise. The filename is a READABILITY convention now, not the wire
  contract: the state VALUE is the contract, so a layout can be reused by two states,
  and one state can own variant layouts, neither of which the v1 filename rule
  allowed.
- **`components/`** = a shape earns a file here only when 2+ layouts reuse it. A
  shape used once stays inline in its layout (extraction is earned, §4).
- The v1 `states/` folder (thin state files at the component tier) is absorbed by the
  tree: a private substate is a tree entry owning a layout, not a sibling file
  convention.
- **The TEMPLATE tier declares the same tree**: a `states:` block in the manifest
  (built at the checkpoint, 2026-08-08). Top-level order is the priority ladder
  (base first, then reaction states; `stateOrder` is DERIVED, no longer authored);
  nesting is containment, ENFORCED BY COMPILATION: a declared base substate
  (welcome) is stripped from every non-base arrangement, so no hand-written guard
  ever polices it. A substate's file keeps its own condition (`visibleWhen:
  isEmpty`); the first declared substate is the viewer's landing default. Note the
  SHELL distinction: the conversation timeline is the base's own content drawn in
  every arrangement, so it is NOT declared as a substate. Declaring a state
  contains it.

### Variants: one state, several arrangements

```yaml
focused:
  layouts: { horizontal: focused-h, vertical: focused-v }
```

Variants bind the SAME fields and differ only in arrangement; anything that changes
meaning or bound data is a second state (lint-enforced). The component picks its
variant by the space it finds itself in (container queries); templates influence it
only by controlling the container. Container queries (`hideBelow`/`hideAbove`) also
remain for fine adjustments INSIDE one layout; they never pick the state.

---

## 4. The guardrails: what earns a file

> **A new layout file is earned only by a different arrangement (or a different set
> of bound fields). Same arrangement + same fields, different values → ONE state,
> data-driven, not a new file.** The discriminant then selects the data, not a
> layout.

Its corollaries, all surviving v1:

- **A layout never guards itself.** The tree owns "which state is active". A layout
  must not re-check the discriminant that selected it; that double-guard is the
  fighting-components-on/off smell the model removes.
- **The root is the design; don't scatter identity.** Open the root and you see what
  the thing is: the tree names its states in order. A design's few defining states
  and their always-on shell stay legible in the root; extraction serves reuse and
  repetition, never fragmentation.
- Most "states" turn out to be data. Seven wizard questions sharing one shape are ONE
  state whose data changes (§6), not seven.

---

## 5. Dumb shells vs rich things

| Kind | Example | Has a state tree? |
|---|---|---|
| **Dumb shell**: a bare mount point | a passthrough template (one `ComponentSlot`) | ❌ one file, nothing to organize |
| **Rich thing**: owns states | a stateful widget · a chat template | ✅ yes |

The richness lives in one place and is portable: a stateful component carries its
tree wherever it streams. Dropped in a dumb shell it IS the surface; streamed into a
rich template, that template's own states frame it (or don't, and it rides inline).
The component owns its states; the template owns whether and how to react to the
public ones.

### 5a. Sizing: the component owns it

A dumb template has no size opinion; it responds to whatever the component's active
state reports. **Size is a property of the active state**: `inline` is a small card,
`focused` is a full panel. A rich template frames on top but still responds, never
force-fills. Same law as the SDK boundary: don't make the container force the size.

### 5b. Cap the height, scroll inside: a full-panel best practice

A full-panel layout can hold unbounded content. When content exceeds the space the
host gives it, the layout must not grow forever or spill and clip. Give the layout a
bounded height (`height: full` / `flex: 1` + `minHeight: 0`), pin the chrome (header,
stepper, footer), and make only the content region `overflow: auto`:

```jsonc
{ "type": "Box", "style": { "height": "full", "minHeight": "0", "direction": "column" },
  "children": [
    { /* header: pinned, natural height */ },
    { /* content region */
      "style": { "flex": "1", "minHeight": "0", "overflow": "auto" },
      "children": [ /* the long body */ ] }
  ] }
```

`minHeight: 0` on both the column and the scroll region is the piece people forget;
without it a flex child refuses to shrink and the `overflow` never engages. Scroll
the body only, never the whole layout. This is the component's job, not the
template's (§5a): the component promises never to report more than fits.

---

## 6. Two layer flavors

Both are driven by a discriminant; pick by relationship:

| Flavor | When | How |
|---|---|---|
| **Exclusive**: one shows | wizard steps · products↔product | the tree (a `Switch` on the discriminant) |
| **Stacked**: one sits on top | a modal surface over a base | a `position: absolute` block, `visibleWhen` the discriminant value; base stays underneath |

**A STACKED reaction state is still a ladder entry** (learned live, 2026-08-08): a
template's fullscreen overlay (a finder taking over the screen) may draw as a
`states/<name>` slot inside the shared chrome instead of owning a layout, but it
MUST be declared at the tree's top level like any reaction state. Presence is not
activation: a reaction surface opens only while its state is the template's ACTIVE
state, so an undeclared stacked state can never open (the component falls inline).
The lint accepts either drawing for a declared reaction state: `layouts/<name>` (a
full arrangement) or `states/<name>` (a stacked overlay).

---

## 7. Worked examples

### The wizard: states are not files, arrangements are

A wizard's focused panel walks seven questions that all share one shape (heading +
choice rows). That is ONE state whose data changes per step, never seven files:

```yaml
state:
  view:
    initial: inline
    states:
      inline:  { layout: inline }
      focused:
        layout: focused          # shell: stepper + Switch on step
        initial: question
        states:
          question: { layout: question }   # binds the CURRENT step's data
          summary:  { layout: summary }
          result:   { layout: result }
```

The `step` value selects which data the `question` layout binds; only genuinely
different arrangements (`summary`, `result`) own files. No self-guarding, no
extraction reuse didn't earn.

### product-card + sab-chat-layout: the streamed contract

The §3 tree, hosted: `sab-chat-layout` declares `stateOrder: [focus, product,
products]`, reaction states only; its welcome/conversation moods are private
substates of the base arrangement, guarded inside it, never ladder entries. Eight
product cards stream in; each declares `initial: products` and the template has a
`products` state, so placement honors the initial and the rail draws. A user taps one open: that card sets
`view: product`, the ladder walk now finds `product` higher than `products`, the
template rearranges to the pinned page. Inside it the card flips `detail` ↔ `apply`
privately and the template never moves. The card's ✕ sets its view back; the walk
drops the template to `products` again. Every moment is the same two mechanisms:
name-match and the ladder.

---

## 8. The payoff: states enumerate for free

Because the root DECLARES the tree, everything downstream is a projection with no
hand-maintained fixture and no drift:

- **The workbench state switcher** reads the tree, and presents it by the law set at
  the sab checkpoint (2026-08-08): **states live ON TOP** (one button per public
  state in the sub-navigation); selecting one reveals **its steps beneath, by step
  name** (never layout filenames, which are plumbing). The shell is not listed (it
  is always on), and one drawing is not a choice: a single-layout state shows
  nothing below. No `visibleWhen` archaeology, no Switch-scanning. The viewer
  renders the declaration and nothing else.
- **Ordering** comes from tree order (and `stateOrder` at the template tier); no
  `order` fields, no `01-` prefixes.
- **The served manifest** (`loadAppManifest`) injects the same enumeration as
  `manifest.states` (name + how to activate it), so any MCP caller knows the public
  menu. Auto-derived, never hand-written: add a state and it appears everywhere.

This is the direct dividend of state-first organization: the definition declares its
states instead of hiding them in conditional soup, so a dumb viewer becomes a full
state inspector.

---

## 9. Why it fits the framework

No new rendering machinery: layouts compose with `$include` (`Ref` stays for global
`design/marketplace/atoms/` shapes needing per-use remapping), the tree compiles to the `Switch`
already in the vocabulary, and the three state buckets are unchanged underneath
(STATE_MODEL §2). What IS new is the derivation the runtime owes (STATE_MODEL §8:
the ordered ladder, state-owns-layout resolution, the arrival scan). Layers remain a
mental model + file convention, enforced by guards, and the engine stays generic:
UX is data.
