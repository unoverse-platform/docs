---
sidebarTitle: "State"
title: "State"
---

**Components write themselves. Templates react by name, in declared order. Inline is the universal default.**

Think statecharts plus the actor model: a component is a small state machine whose states own their layouts ([statecharts.dev](https://statecharts.dev/)); a streamed component is a **spawned actor** that owns its state and publishes it ([Stately actors](https://stately.ai/docs/actors)); the template subscribes to the public state and reacts by name. Data fills, state selects, one direction, at every tier. This is the most important doc in the pack: every interactive behavior is built from it.

---

## The three buckets

| Bucket | Holds | Written by |
|---|---|---|
| **Conversation** | the timeline of turns, each turn's status (streaming/complete), the voice transcript | 🔒 **the stream** (and the voice service): never by you |
| **Component state** | one slice per component: its streamed data, its **`view`** (the public state), and its private keys (`step`, …) | streamed `COMPONENT_DATA` + the component's own `setValue` actions |
| **Template state** | the template's **own** things only: its `draft`, its panels (`openPanel`) | the workflow (`TEMPLATE_DATA`) + `setTemplateValue`, never a component |

All three live in the client's in-memory store, rebuilt from the stream on reload. They are render state; the agent's conversation memory lives on the server: a different layer.

**The `view` field.** A component's public state lives in its slice under the key **`view`**. It holds the CURRENT state, and it is the only thing about the component the outside world ever sees. *Legacy:* the old spelling `defaultState` is still read as an alias during migration; new authoring writes `view`.

---

## The reaction contract

The contract is six rules (canon: `UNOVERSE_STATE_MODEL.md` §5). Learn them once; every moment in every app is these rules replaying.

### 1. A component is data + a state tree; each state owns its layout

The component declares its states, and every state names the drawing that shows it:

```yaml
# product-card.yaml (design/sab/components/product-card, as shipped)
state:
  view:                      # the PUBLIC axis
    initial: products
    states:
      products: {}                          # the rail card; no layout key needed
      detail:                               # the full page
        layout: product                     # declared only because the filename differs
        on: step
        initial: detail
        states:                             # PRIVATE substates (the steps)
          detail: { layout: product-detail }
          apply:  { layout: product-apply }
```

- **Top-level states of the `view` axis are PUBLIC**: the component's entire interface. Everything nested below is **PRIVATE**: invisible to templates, invisible to senders. Here the public menu is `products · detail`; `step` and its states do not exist outside the card.
- **`layout:` is optional.** A state with no declaration draws the layout of its own name; `{}` is a complete state. Write `layout:` only when the filename differs.
- **The shell vs the steps.** A state's own layout is its SHELL: always on while the state is active, never a choice. Its nested substates are the STEPS: the only choices inside it, addressed by state name. One step, or none, is not a choice.

This one placement decision replaces judgment calls, guided by the rearrange rule: **if the template must rearrange to show it, make it a public state; if the template wouldn't move, nest it privately.** Privacy is the default; promotion is deliberate.

### 2. Arrival: nobody sends a state; the host places the actor

A streamed component is a spawned actor. The data is just facts; the placement is the host's, in two steps:

1. The component's **declared initial** stands whenever the host can honor it: a card whose initial is `products`, arriving into a template with a `products` state, starts there.
2. Only when the host has no state for that initial does the **scan** run: the template walks its own states in declared order (rule 4's same list) and takes the first name the component's public menu also has.
3. No overlap at all: the component wakes in its own initial chain and renders inline in the flow.

Spawn-time placement is orthodox actor practice (the parent supplies input at spawn). Everything after is forbidden: **the template never writes a component's state post-spawn.** Not to promote it, not to retract it, not to close it.

### 3. Runtime: the component drives; the template reacts by name

After spawn, `view` changes exactly two ways, both the same write into the component's own slice: a user interaction (`setValue { view: "detail" }`), or the component's own chrome (its expanded state carries its own ✕ that sets `view` back). Whenever `view` changes, every hosting template asks one question:

> **"Do I have a state with that name?"**

Match: the template enters its own state of that name and that state's layout draws. No match: rule 6. Name-match is the DEFAULT convention (a template state named `detail` reacts to a component view named `detail`, zero ceremony); an explicit `reactsTo: <otherName>` on a template state is the rare escape hatch for vocabulary mismatches.

### 4. The template tree: declared order is the priority ladder

A template declares its own state tree in its manifest, and one declaration answers everything:

```yaml
# manifest.yaml (design/sab/templates/sab-chat-layout, as shipped)
states:
  main:                 # the base arrangement, always first
    states:
      welcome: {}       # contained substate; first = the landing default
  focus: {}             # the reaction ladder, in priority order
  products: {}
  detail: {}
```

A template is in exactly ONE state at a time, so when hosted components sit in different views, the template walks its top-level list top-down and enters the first of its states that ANY hosted component currently matches. One card in `focus` and seven in `products`: `focus` is higher, the template enters `focus`; whether the seven still show is the focus layout's own business. Ties (two components in the same view): most recent write wins.

The ladder is **derived** from the tree: the top level minus the base, in declared order. No word is special: `focus` outranks `products` because of list position, nothing else. The template's own condition-guarded moods (a welcome hero on an empty conversation) are private substates of its base, never ladder entries: the template does not rearrange between them.

The template's active state is **derived, never stored**: a pure function of the snapshots of the components it hosts. Nothing writes a focus flag anywhere.

### 5. A delivery CLEARS the claims below it. Your hand does not.

When a component ARRIVES into a higher-ranked state, every hosted component sitting in a lower-ranked state releases its claim and retracts to inline. Releasing the higher state then lands on the BASE arrangement, never on a stale lower one: closing a finder returns to the conversation, it does not resurrect the rail that was open before the finder took over.

The guest's own navigation clears nothing. Tapping a rail card to open its detail page enters `detail` without touching the rail's claims, so closing that page returns to the rail it opened from. Priority decides what SHOWS in both cases; this decides only what is thrown away.

The two are the same walk with one question added: did a delivery put the winner there, or did you? Durable `lifetime: "conversation"` slices opt out (below). No special close logic exists anywhere.

### 6. Unmatched view = inline. Always.

No state, a view the template has no state for, or a template with no reaction states at all: the component renders inline in the conversation flow. **One instance → one placeholder**: while its view matches a template state, the instance *lifts out of the flow into that state's slot* (never painted twice, no `hideBelow` tricks to hide a flow copy); losing the match releases it back. Close = the instance switches its own view back and the walk re-runs.

The authoring corollary, because it bites: an ignored public state does not "stay put", it FALLS INLINE. A step that must never move the page belongs nested under rule 1's privacy, not on the public menu.

---

## Two lifetimes, one store

CONVERSATION state (the turns + each instance's *data*) is durable and append-only: the stream owns it, nothing ever clears it. CHAT state (each instance's active *view*, the template's chrome) is the present interaction. **A new user turn advances the conversation, so the chat layer resets: every instance returns to its declared initial chain**, slots empty, the template derives its base state. A component with an inline-suited initial returns to it in its turn's history; a **surface-only component** (no inline-suited state, a placed initial) simply retires: visible only while placed, invisible after. **The explicit opt-out: `"lifetime": "conversation"` in the component's manifest** marks a *durable, conversation-scoped surface* (a cart, an itinerary, a composed page): the platform keys its instance by the **conversation instead of the turn** (every re-call hydrates the *same* slice, a repeated arrival merges, never re-places), the new-turn reset skips it, and rule 5's cancellation skips it. It stays on screen until it's replaced, closes itself, or **a new template loads: the template swap is the hard refresh boundary; every surface, durable included, retires when the shell changes.** Default is `"turn"`.

---

## How a layout reacts: selectors

Inside a template state's layout, the slot that renders the placed component selects by the **view**, never by component type, never by id:

```yaml
type: ComponentSlot
select: { from: all, where: { field: view, eq: focus }, limit: 1 }
```

- "Which component?" is intrinsic: the one whose view matches. Conflicts: most recent wins (`limit: 1`).
- **Many instances are fine.** A source can create many instances (three products → three cards); the rule is per instance. The template decides how a slot lays its occupants out: a flow list, one focus (`limit: 1`), a rail/grid.
- **State is local; the view is the interface.** A component's private keys (`step`, `phase`) never cross to the template: selectors read `view` only.
- For template **chrome** (not slots), the same fact is projected into scope as **`surfacedView`**: the name of the active reaction state's view, `""` when everything is inline, so a header button reacts by name: `visibleWhen { "field": "surfacedView", "in": ["", "products"] }`.

**The two global rules: the only protocol-level behavior:**

1. **`template` swaps the shell** (the one reserved name): the whole surface re-renders; conversation, components, and data stay in the store, and the new template reacts through *its own* tree.
2. **Inline is the universal default** (rule 6).

### State names are open: the template decides what they mean

`focus` isn't hardcoded anywhere. A component can declare **any** public names, and a template reacts to exactly the names in its own tree; a template without a matching state renders the component inline. New names ship with zero protocol change. (Convention: keep names consistent per org; `focused` in one component and `focus` in another silently fragments the vocabulary, which is what `reactsTo` exists to patch, rarely.)

---

## The two writes

- **`setValue`** → the component's **own slice**: its answers, its `step`, its `view`. This is the only thing a component ever writes.
- **`setTemplateValue`** → template state: **only for what is genuinely the template's own** (a disclosure panel, the composer draft). ❌ A component chaining `setTemplateValue` to open a surface is the deprecated bridge: the linter flags it; the template tree reacts by name instead.

```yaml
# a wizard option: record the answer + advance: one setValue, own slice
action:
  type: setValue
  values:
    - { key: subject, value: "{{value}}" }
    - { key: step, value: route }
```

Anything that is not one of these two routes to the **server as a native MCP call** ([02](/design/sdui-and-mcp-apps)): sending a message is `tools/call`; answering a waiting wizard is an elicitation. You never build transport.

---

## The four moves: one condition vocabulary

All reactivity is `eq` / `ne` / `in` / truthy applied four ways:

| Move | Use when | Example |
|---|---|---|
| **`visibleWhen`** | a small thing appears/disappears | `{ "field": "isLookingUp", "eq": true }` |
| **`Switch`** | a whole view swaps (public states, wizard steps) | `"on": "view", "cases": { … }` |
| **`Each`** | repeat: a literal `items: []` list or a bound array | see [03](/design/components) |
| **`style.when`** | the same element restyles by state | `[{ "field": "deltaPositive", "eq": true, "apply": { "color": "status.success" } }]` |

✅ Mutually exclusive views belong in **one `Switch`**; a case never re-guards its own discriminant. Name **one field per axis** (`view`, `step`, `callState`): never boolean soup. This is the discriminated-union doctrine ("make impossible states impossible"; see React's [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)).

### The tree enumerates: viewable, served, ordered

Because the root DECLARES the state tree, everything downstream is a projection: **Studio** shows one pill per public state with the active state's steps beneath ([07](/design/studio)), and the **served manifest** lists the public menu for any MCP caller (`publicStates`, `initialView`). Add a state to the tree and it appears everywhere. No fixture, no drift.

---

## Locked state: managed FOR you, read-only to you

1. **Conversation & lifecycle**: written only by the stream. "Is it thinking" is the derived `isStreaming`/`isEmpty` flags; project them, never simulate them (a stuck flag is a stream-delivery bug to report, not to patch in a definition).
2. **Voice**: the SDK's voice service owns the audio natively and, as a producer, projects **`callState`** (`idle · active · speaking · listening`) into the template's scope; a voice template branches its phases on that one field. The transcript rides the conversation. A template binds the service by declaring `service: "voice"` in its manifest. You never wire audio.
3. **Native host chrome**: ephemeral toggles that belong to the embedding host live in the host's own state, passed as `props`; never in the store, never a new primitive.

### The decision table

| The state is… | It goes in… | Written by |
|---|---|---|
| a component's data, answers, or view state (incl. `view`) | the component's own slice | stream + its own `setValue` |
| the template's own chrome (panels, draft) | template state | `setTemplateValue` |
| "which state is the template in" | **nowhere: derived** by the ladder walk |  |
| conversation flow / streaming status | 🔒 conversation (derived flags) | the stream only |
| voice call phase / transcript | 🔒 projected by the voice service | the service (you read it) |
| host-screen-only chrome | 🔒 the native host, as `props` | the channel |

---

## Migration notes (legacy, pre-v2)

- **`defaultState`** as the slice key and manifest arrival key is the legacy spelling of `view` / the tree's `initial`; still read as an alias.
- **Name-sync** (the active layout being the layout NAMED after the latest surfaced view) was the v1 mechanism. It survives only as the same-name DEFAULT convention: a state with no `layout:` draws the layout of its own name. The mechanism is now the tree + the ladder.
- **Authored `stateOrder`** in a template manifest is the legacy form for templates without a `states:` tree; the ladder is now derived from the tree.
- The **`TEMPLATE_DATA { defaultState }` bridge** (a sender seeding a component's state) is dead: arrival has one owner, the host's placement (rule 2).

---

**Next:** [05. Templates (MCP Apps)](/design/templates).
