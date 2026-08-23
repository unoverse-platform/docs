---
sidebarTitle: "Apps"
title: "Apps"
---

**An app declares a STATE TREE in its manifest: top-level order is its priority ladder, nesting is containment, and each state owns the layout that draws it.**

Components render pieces; an **app** is the shell around them: the chat layout, the voice surface. It owns **nothing**: conversation and component data live in the store, so apps are swappable mid-conversation.

The connection between components and apps is **one rule**:

> **A component enters a public view → the app walks its declared states top-down and enters the first one any hosted component matches. That state's layout draws.**
> No match → the base arrangement, and the component renders inline. Nothing is stored, nothing is wired: names match, order decides.

---

## The anatomy: manifest-only

```
design/<project>/apps/acmechatlayout/
├── manifest.yaml        # THE ENVELOPE: everything about the app, incl. the state tree
├── layouts/             # the ARRANGEMENTS: one per state (same-name default)
│   ├── main.yaml        #   the base: the core chat alone
│   ├── products.yaml    #   a card entered "products" → core + the cards rail
│   └── detail.yaml      #   a card entered "detail"   → core + the pinned page
└── components/          # app-local partials (core, header, composer-bar, turns, …)
```

There is **no `<name>.yaml`**: the manifest is the single contract file. Same grammar as components ([Components](/design/components)): a component declares a `view` tree; an app declares a `states:` tree. Each layout is a complete arrangement: typically `{ "$include": "components/core" }` plus that state's slot, so shared chrome lives once in `components/` and every layout includes it.

```yaml
# manifest.yaml: the whole app in one file (design/sab/apps/sab-chat, as shipped)
name: sab-chat
description: The SAB customer-support chat, with a route to live support.
whenToUse: Ask SAB a banking question or get general help from customer support…   # utterance-shaped: selection text
category: Assistant
version: 1.0.0
defaultState: app                    # the app's LOAD state: "app" = the full surface

# THE APP TREE: one declaration, everything follows.
states:
  main:                 # the base arrangement, always first
    states:
      welcome: {}       # contained substate; first = the landing default
  focus: {}             # the reaction ladder, in priority order
  products: {}
  detail: {}

layout: main                              # the base layout's name
preview:
  products: [ product-card, product-card, product-card ]   # per-STATE mock: what Studio seeds
  detail: [ product-card ]
inputSchema:
  type: object
  properties:
    message: { type: string, description: "The user's request" }
binding: { workflow: wf-r4jzo7, trigger: inputtrigger9 }    # the app OWNS its workflow
autoTrigger: false
# a voice app adds: service: voice  (the channel instantiates the native service)
```

What the tree means, line by line:

- **Top-level order IS the priority ladder.** The base comes first; the rest are reaction states in priority order. When hosted components sit in different views, the app enters the FIRST of its states any component matches ([State](/design/state) rule 4). A higher state cancels the claims below it, so release always lands on the base. `stateOrder` is **derived** from this tree; it is no longer authored (*legacy:* an authored `stateOrder` list survives only for apps without a tree).
- **Nesting IS containment.** `welcome` exists only inside `main`: the compiler strips a declared base substate from every non-base arrangement, so no hand-written guard polices it. The substate's own file keeps its condition (`visibleWhen: isEmpty`); the first declared substate is the viewer's landing default.
- **The shell is not declared.** The conversation timeline is `main`'s own content, included by the shared chrome and legitimately drawn beside the rail, the page, and under focus. Declaring a state CONTAINS it: declare only what should exist in the base alone.
- **Each state owns its layout, same-name default.** `focus: {}` draws `layouts/focus`; write `layout:` only when the filename differs. An app with a single state is simply always in it.
- Reaction is by **name-match** with the hosted component's public views; `reactsTo: <otherName>` on a state is the rare escape hatch for vocabulary mismatches.

**States vs the base's moods: the rearrange rule.** *If a component causes the app to rearrange, it's a top-level state. If the app itself knows it and wouldn't move, it's a contained substate of the base.* Local moods (`welcome` on an empty conversation, a voice layout's call phases on `callState`) branch inside the base via the normal condition vocabulary ([State](/design/state)); listing them on the ladder is wrong twice: they'd outrank reactions, and they'd draw inside reaction states.

---

## Sizing: each layout owns its widths

> **The app is always the ACTIVE state's layout total: nothing else, ever.**

Widths are declared with the neutral `appWidth` key, normally a named org size from `styles/semantic/app-sizes.yaml` (`chat` · `chat-slim` · `rail` · `panel`: served on the theme, resolved by the SDK like any token). Two declaration points, both inside a layout:

```yaml
# components/core.yaml: the chat column: a panel, always open, exactly `chat` wide
type: Box
appWidth: chat

# layouts/products.yaml: the arrangement: core + the rail, whose slot declares ITS width
type: Box
style: { direction: row, width: full, height: full, overflow: hidden }
children:
  - { $include: components/core }
  - type: ComponentSlot
    appWidth: rail
    select: { from: all, where: { field: view, eq: products } }
    frame:
      type: Box
      style: { direction: column, overflow: auto }
      children:
        - { type: ComponentSlot }
```

So the width is one of a small known set by construction: the base layout is the core alone; a rail layout is core + rail; layouts can even use a different core (a slim call column beside a panel). The host animates between the totals; nothing inside ever resizes.

The rules (all lint-enforced):

- **Prefer a named size.** A bare name must exist in `styles/semantic/app-sizes.yaml`, or the lint names the ones that do. Raw CSS is accepted (`min(50vw, 760px)`), and `flex` takes whatever host space is left, but a name keeps the org on one scale and makes retuning a size one edit.
- **One declaration per panel.** The panel's `appWidth` sizes its box *and* grows the app: a panel (or its frame) never declares `width`/`flex` of its own.
- **Never on a layout root.** The root is the arrangement; panels inside it carry the widths.
- **Never `visibleWhen`-guarded.** A conditional arrangement is a *state* with its own layout: not a guarded pane.
- **An overlay declares nothing.** A surface rendered over the core (`inset: 0`) has no `appWidth` and needs no state of its own, it never changes the app's size.
- Give every layout root `overflow: hidden` so a panel mid-slide clips at the edge instead of scrolling.

---

## App-only primitives

- **`Timeline`**: renders the conversation (you supply the `user`/`assistant` turn subtrees; per-turn scope carries `text`, `streaming`, …). The conversation bucket is locked to the stream ([State](/design/state)).
- **`ComponentSlot`**: where components render. Two forms:

```yaml
# 1. the FLOW slot: components render inline in the conversation (the default home)
- type: ComponentSlot
  select: {}

# 2. a REACTION slot: renders whichever component put the app in this state
- type: ComponentSlot
  select: { from: all, where: { field: view, eq: detail }, limit: 1 }
  frame: { }    # the chrome the selected component renders inside
```

Rules that bite:
- ✅ Slots select on the **public axis** (`where { field: "view" }`; *legacy alias:* `defaultState`), ❌ never by component type, ❌ never by a component's private state key. Both are lint-flagged.
- ✅ **A state's layout surfaces its own view.** The layout a state owns must contain a slot selecting that state's view: the tree claims the instance; the slot renders it (guard-enforced).
- ✅ **A slot's single occupant fills the slot.** A `limit: 1` slot gives its occupant the frame's full height automatically, zero per-layout height styling. Multi-occupant slots (a rail) keep content-sized instances.
- ✅ **One instance → one placeholder.** While a component's view matches an app state, it renders in that state's slot: lifted out of the flow, never painted twice. Its own ✕ switches it back and it returns to the flow.
- ❌ Never size or restyle a component from the app: a component owns its states ([Components](/design/components)); the app owns only the framing.

**In-layout slots without a state of their own** are still normal: an overlay (e.g. a wizard in a focus overlay over the chat) lives inside the core, claims its view, and changes no width. Reach for a top-level state when the *arrangement* changes; keep an overlay in-core when only a layer appears.

**Rich layers cap their height and scroll inside** (header/footer pinned, `flex: 1` + `minHeight: 0` + `overflow: auto` body).

---

## Voice apps

Declare `"service": "voice"` in the manifest; the channel instantiates the native service, which projects **`callState`** into scope. The call phases (`layouts/idle … layouts/user-speaking`) are drawings of the base, branching inside its layouts: typically a wide core in the base and a slim core beside a card slot, both including the same files. Cards streaming in during a call are placed by the ladder exactly as in chat. Audio is never wired in a definition.

---

## Naming & discoverability: how the AI picks the app

> **Canonical guide: [Node discoverability](/nodes/node-discoverability)**, every rule there applies to
> apps and components verbatim, at *higher* stakes: apps are ranked against the
> **user's own words** (`findIntent`), not a planner's task query. Bad meta makes an
> entire app invisible. This section is the design-side summary.

**The formula.** **spatial** embeds exactly `` `title. whenToUse||description [category]` ``
and ranks it against what the user literally types/says. Three consequences:
- **`whenToUse` IS the selection text**: when present it *replaces* description in the ranking.
- **The opening words dominate the embedding.** Lead with the user's vocabulary for the
  job; mechanism/layout words up front ("Two-column split: streamed text…") sink the app.
- Meta embeds **as-is**: no LLM rewrite. Editing it changes the content hash → re-embeds
  on the next train.

**One job per field: never blend:**

| Field | Job | Rules |
|---|---|---|
| `title` / `name` | human display name | short, the thing itself ("Bank Transfer"): no org prefix, no mechanism |
| `description` | what it **IS** | ONE line, ≤120 chars: the listing subtitle; no "use when…" inside it |
| `whenToUse` | the **selection text** | utterance-shaped, outcome-first, the user's own words |
| `category` | the **job's domain** | Payments, Travel, Assistant…: never the implementation |

**`whenToUse` rules:**

| | Example |
|---|---|
| ✅ Utterance-shaped, outcome-first | "Transfer or send money: pay a beneficiary or move funds." |
| ❌ Selector-shaped (dev framing) | "Pick when the user asks to book.": words no user ever types |
| ✅ Disqualify by property | "Not for data-dense monitoring." |
| ❌ Disqualify by naming a sibling | "Don't use if AcmeDashboard exists.": dates, tangles, poaches |

**The generalist trap.** A fallback/home surface must NOT enumerate its siblings' jobs
("ask about cards, transfers…"): that vocabulary outranks the focused apps for *their*
queries. A fallback owns *general help, questions, reaching a person*, and cedes specific
jobs by property, naming none.

**Cross-artifact collisions.** Own the modality or the job: a voice surface claiming
"asks to talk / speak to someone" poaches live-support intents. Cede the neighbor by
property.

**Self-test before shipping:** write the sentence a real user would say for this app's
job: do its nouns/verbs appear in your `whenToUse`'s FIRST sentence? Is the description
one plain line about what it is? Does the category name the domain, not the build?

---

## App checklist

- [ ] Manifest-only: no `<name>.yaml`; the manifest declares the `states:` tree, base first, reactions in priority order; `layout` names the base layout
- [ ] One layout per state (same-name default), each surfacing its own view; shared chrome in `components/`, included by every layout
- [ ] Contained moods (welcome, call phases) nested under the base, never on the ladder; the timeline is base content, not a substate
- [ ] Widths: named app sizes only, on panels inside layouts, never raw CSS, never on a root, never `visibleWhen`-guarded
- [ ] `binding.workflow` + `binding.trigger` real (the app owns them); `preview` seeds each state's mock
- [ ] Flow slot generic (`select: {}`); reaction slots select on the public axis (`view`), never `type`
- [ ] `whenToUse` utterance-shaped; `description` ≤120 chars
- [ ] Preview in **studio**: state pills, then live ([studio](/design/studio)); publish passes lint with 0 errors

---

**Next:** [Styles and tokens](/design/styles-and-tokens).

## Next steps

<Card title="Styles and tokens" icon="palette" href="/design/styles-and-tokens" horizontal>
Your brand, as values every definition resolves against.
</Card>

<Card title="Studio" icon="layout-dashboard" href="/design/studio" horizontal>
Preview an app against mock state, then live.
</Card>
