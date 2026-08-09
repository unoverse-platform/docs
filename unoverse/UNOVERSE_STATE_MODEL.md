# Unoverse: The SDUI State Model

> **Status**: 🎯 State Model v2, DECIDED 2026-08-08. The doctrine below is the law; the
> runtime lands next (see §8 for the build list). Until §8 completes, the as-built SDK
> surface (§9) still implements the v1 mechanics it describes, and the v1 terms it uses
> (name-sync, `defaultState`) are called out as legacy where they appear.
> **Companion to**: [`UNOVERSE_SPEC.md`](./UNOVERSE_SPEC.md) (rendering),
> [`UNOVERSE_MCP_TEMPLATE_PROTOCOL.md`](./UNOVERSE_MCP_TEMPLATE_PROTOCOL.md) (transport),
> [`UNOVERSE_LAYERS.md`](./UNOVERSE_LAYERS.md) (how states organize files).
>
> **One line:** a component is a small state machine whose states own their layouts; a
> streamed component is a spawned actor; the template subscribes to its public state and
> reacts by name. Data fills, state selects, one direction, at every tier.

---

## 0. Grounding: this is the standard model, in standard words

The model below is not invented here. It is the orthodox stack of modern UI engineering,
and every concept has public documentation we defer to rather than restate:

- **UI = f(state), declarative rendering.** The view is a projection of state, never the
  other way round. See React's docs, especially
  [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure):
  single source of truth, avoid redundant state, derive rather than store.
- **One discriminant, not flag soup.** A mode is one field whose value names the state
  (`status: 'loading' | 'error' | 'loaded'`), never a set of independent booleans. This
  is the discriminated-union doctrine ("make impossible states impossible").
- **Statecharts** for structure: nested states for private steps, parallel axes for
  orthogonal concerns, an `initial` at every level. See
  [statecharts.dev](https://statecharts.dev/) and the
  [Stately statechart docs](https://stately.ai/docs/state-machines-and-statecharts).
- **The actor model** for composition: an actor owns its state, publishes a snapshot,
  and observers subscribe and react. A parent may give a child its input at spawn; it
  never reaches into the child afterwards. See
  [Stately actor docs](https://stately.ai/docs/actors).

What is genuinely ours, and therefore documented here: the two-verb write API (§2), the
arrival scan (§5, rule 3), inline as the universal fallback (§5, rule 6), and the
priority ladder (§5, rule 5). Everything else is the standard model applied.

We deliberately borrow the statechart shape and vocabulary WITHOUT the transition
machinery: no guards, no actions, no event objects. Our transitions are plain data
writes through the two verbs. If you find yourself wiring per-component event machines,
you have overshot the borrow.

---

## 1. The principle (the why)

The SDK `core` is a **generic engine**. It knows about *messages* and *generic state
buckets*, never about features. The strings `faq`, `suggestions`, `voice`, `tab`,
`wizard`, and yes, `focus`, must not appear in `core`. The engine routes incoming data
into the right bucket; **templates and components project that state into UI**. All UX
lives in data (definitions), not in the engine.

This rule survives v2 untouched, and v2 strengthens it: even the priority of "focus"
over other reactions is data (the order of a list in the template's manifest), not a
protocol concept.

---

## 2. The state: three buckets, named by owner

| Bucket | Holds | Scoped / keyed by | Written by |
|---|---|---|---|
| **Conversation** | the timeline of turns (user + assistant); each assistant turn points at the components it produced; the turn's status (streaming / complete); the voice transcript | the conversation | the stream; the voice service (transcript) |
| **Component state** | one slice per component: its live data, its **view** (the public state), and its private state keys | the component's unique id (`chatId:nodeId`) | streamed `COMPONENT_DATA`, or locally via the `setValue` action |
| **Template state** | the active template's own bag: **draft** plus any keys the dev names (panels, suggestion data, voice call state) | the active template | the workflow; `setTemplateValue` actions; producer services |

### The whole write API: two generic actions

- **`setValue`** → write the dev's keys into a **component's own slice**
- **`setTemplateValue`** → write the dev's keys into **template state**

That is the entire surface. The SDK hardcodes no UI concept: `openPanel`, a tab, a
wizard step are all just keys the dev names, written via these two actions. Adding a
feature is data, never a new bucket, action, or `case` in `core`.

### The `view` field (renamed from `defaultState`, 2026-08-08)

The component's **public state** lives in its slice under the key **`view`**. The old
name `defaultState` was wrong twice over: the field holds the CURRENT state, not a
default, and the same word also names an unrelated app-level manifest field (the load
state, `UNOVERSE_MCP_TEMPLATE_PROTOCOL.md` §4b). During migration the SDK reads
`defaultState` as a legacy alias for `view`; new authoring writes `view`.

---

## 3. Derived, not stored: `lifecycle`

"Is the assistant thinking / streaming / done" is not a separate bucket. The
conversation already tracks each turn's status; `lifecycle` is read off the
conversation and projected as flags (`isStreaming`, …). It is a *view* of the
conversation, not its own state. (This is React's "derive, don't store" rule; the
template's own active state in §5 is derived by exactly the same principle.)

What flips a turn streaming → complete: that run's `WORKFLOW_STATE` message, arriving
on the MCP `/stream` lane. If `WORKFLOW_COMPLETED` never reaches the stream the turn
stays streaming and every derived flag stays true. That is a delivery gap at the MCP
engine, never a component bug; fix it there, never by gating UI on component text.

---

## 4. Services feed the state; they are not state

A **service** is a native capability the SDK provides as the sanctioned escape hatch
(`UNOVERSE_SPEC.md` §2e-1) for things that cannot be expressed as data. A service is a
**producer**: it does native I/O and writes its derived state into the normal buckets.
It is not a fourth kind of state.

**Voice** is the canonical service:

| Voice piece | Nature | Lands in |
|---|---|---|
| mic / speaker / WS audio frames | native I/O | the service (`useVoiceService`) |
| call state (connecting / speaking / muted) | UI state of the voice template | **template state**, as the derived `callState` value (`idle` · `active` · `agentSpeaking` · `userSpeaking`) |
| transcript (the words said) | conversation content | **conversation** |

The service is instantiated by the shared renderer (`StreamedUnoverseTemplate`), its
flat state written via `mergeTemplateState`, its actions (`startCall` / `endCall` /
`toggleMute`) answered in that same renderer. A template branches its call phases off
`callState` like any other discriminant. No voice name exists in `core`.

> **The rule services follow:** a service may own native I/O, but its state lives in
> the normal buckets. State that drives UI living only inside a service hook is the
> same leak as a feature name in `core`.

---

## 5. The state model: six rules

This section is the heart of v2. It supersedes the v1 reaction contract (the old §5a
and §5b of this document), the name-sync mechanism (the active layout being the layout
NAMED after the latest surfaced view), and the VIEW test (`UNOVERSE_LAYERS.md` old
§3b). What survives from v1 is noted inline; the file organization is
[`UNOVERSE_LAYERS.md`](./UNOVERSE_LAYERS.md).

### Rule 1. A component is data + states; each state owns its layout(s)

A component declares a state tree, and every state names the layout that draws it:

```yaml
# product-card.yaml (the sab pilot, as shipped)
state:
  view:                      # the public axis
    initial: products
    states:
      products: {}                          # the rail card, no layout key needed
      detail:                               # the full page
        layout: product                     # declared only because the filename differs
        on: step
        initial: detail
        states:                             # PRIVATE substates (the steps)
          detail: { layout: product-detail }
          apply:  { layout: product-apply }
```

Read top to bottom it answers, in order: what states exist, which are public, which
nest privately, and what draws each one. The state machine is the spine; a layout is a
projection a state owns. A layout is never addressable on its own, at any tier: the
only thing that ever selects a layout is the owner's own state.

**`layout:` is OPTIONAL: same-name is the default** (decided at the sab checkpoint,
2026-08-08). A state with no declaration draws the layout of its own name; `{}` is a
complete state. Write `layout:` only when the filename differs (a state renamed for
meaning keeping its historical files). Name states for what they MEAN (`detail`), not
for their drawing.

**The shell vs the steps.** A state's own layout is its SHELL: always on while the
state is active, never a choice. Its nested substates are the STEPS: the only
choices inside a state, addressed by their state names (the layout filenames are
plumbing). One step, or none, is not a choice: there is nothing to present.

**Multi-layout states (variants).** A state may own several layouts when one meaning
has several arrangements (horizontal / vertical):

```yaml
focused:
  layouts: { horizontal: focused-h, vertical: focused-v }
```

Variants must bind the SAME fields and differ only in arrangement; anything that
changes meaning or bound data is a second state, not a variant (lint-enforced). The
COMPONENT picks its variant (by the space it finds itself in, container queries);
the template never requests one. Templates influence arrangement only by controlling
the container, exactly like CSS.

**Naming.** The component is the THING, not one rendering of it: `course`, never
`courseCard`. "Card" is a layout's name, not an identity.

### Rule 2. Public states are the template's whole vocabulary

The top-level states of the `view` axis are **public**: they are the component's entire
interface to the outside. Everything nested below is **private**: not addressable by
templates, not addressable by senders, invisible in the snapshot. In the example above
the public menu is `inline · products · product`; `detail` and `apply` do not exist
outside the component.

This boundary is STRUCTURAL, decided by where a state sits in the tree. It replaces the
v1 VIEW test (three judgment questions) with one placement decision, and the old
rearrange rule remains as the guide for making it:

> **If the template must rearrange to show it, make it a public state.
> If the template wouldn't move, nest it privately.**

Promotion is the deliberate act; privacy is the default. When a private step one day
needs the template to react (an apply step becoming a full takeover), you promote it to
the public level and the reacting templates grow a matching state.

### Rule 3. Arrival: nobody sends a state; the host places the actor

A streamed component is a **spawned actor**. Three separate things exist at spawn:

1. **The data**: just facts. A course has no opinion about how it is shown.
2. **The placement**: the host template picks the starting face, in two steps.
   First, the component's **declared initial** stands whenever the host can honor it:
   a card whose initial is `products`, arriving into a template with a `products`
   state, starts in `products`. Only when the host has no state for that initial does
   the **scan** run: the template walks **its own states, in its declared order**
   (rule 5's same list) and takes the first name the component's public menu also
   has. That is how a component whose initial is `inline` still lands in a template's
   `focus` surface. (Refined during the sab pilot, 2026-08-08: a scan that ignored
   the initial placed every arriving card at the template's most prominent state.)
3. **The component's declared initials**: the fallback. No overlap between the
   template's states and the component's public menu, and the component wakes in its
   own `initial` chain (`inline` by convention) and renders inline in the flow.

Spawn-time placement by the host is orthodox actor practice (the parent supplies input
at spawn). What remains forbidden is everything after: **the template never writes a
component's state post-spawn.** Not to promote it, not to retract it, not to close it.

This collapses v1's three competing arrival emitters (manifest seed, tool-call seed,
and the deprecated `TEMPLATE_DATA { defaultState }` bridge) into one owner: the host's
scan.

### Rule 4. Runtime: the component drives; the template reacts by name

After spawn, the component's `view` changes exactly two ways, both the same write: a
user interaction (`setValue { view: "product" }`), or the component's own chrome (its
expanded face carries its own ✕ that sets `view` back; template chrome never writes a
component's slice). Whenever the `view` changes, every hosting template asks one
question:

> **"Do I have a state with that name?"**

Match: the template enters its own state of that name, that state's layout draws, its
slot renders the component. No match: rule 6. Name-match is the DEFAULT convention (a
template state named `product` reacts to a component view named `product`, zero
ceremony, exactly the old name-sync developer experience); an explicit mapping on the
template state (`reactsTo: someOtherName`) exists only as the escape hatch for
vocabulary mismatches, and is expected to be rare.

The template's own active state is **derived, never stored** (same law as §3): it is a
pure function of the snapshots of the components it hosts. `template` remains the one
reserved name at the protocol level (swap the whole shell, safe because the template
owns nothing).

### Rule 5. The template's declared order is its priority ladder

A template can be in ONE state at a time, so when its hosted components sit in
different views, the template's own **declared state order** decides. The template
walks its list top-down and enters the first of its states that ANY hosted component
currently matches:

```yaml
# template manifest: THE TEMPLATE TREE (one declaration, everything follows)
states:
  main:                 # the base arrangement
    states:
      welcome: {}       # contained substate; first = the landing default
  focus: {}             # the reaction ladder, in priority order
  products: {}
  detail: {}
```

The ladder (`stateOrder`) is DERIVED from the tree: the top level minus the base, in
declared order. An authored `stateOrder` remains only as the legacy form for
templates without a tree. The ladder lists REACTION states only: states components
can put the template in.
A template's own condition-guarded moods (a welcome hero on an empty conversation,
the conversation itself) are private substates of its base arrangement, guarded
inside it, never ladder entries: the template does not rearrange between them, so
by rule 2's own logic they are nested, not public. (Caught on the sab pilot: listing
them in the ladder let the welcome hero draw inside reaction states.)

One component in `focus` and seven in `products`: `focus` is higher, so the template
enters `focus`. The finder ARRIVED, so the seven release their claim (rule 4). When the
focused component sets itself back, the walk re-runs, finds nothing below, and lands on
the BASE. It does not land on the rail those seven used to hold.

A guest TAP is the other case. Tapping a rail card enters `detail` and clears nothing,
so closing the page returns to the rail. No special close logic; the same walk answers
every moment.

Ties (two components in the same view): most recent write wins, the surviving v1
`limit: 1` law. The pinned and guest-control laws survive as modifiers of this
derivation.

**THE SEVEN RULES (2026-08-09; rule 4 amended the same day).** Pure masking left a
stale rail waiting behind every focus surface, so rule 4 clears again. One principle,
priority, stated as the complete behavioral law:

1. Every component says what state it is in.
2. The template has a priority list; top wins. No word is special.
3. The screen always shows the highest state that has a component in it.
4. When a DELIVERY takes a higher state, the states below it are CLEARED. Every
   component sitting in a lower-ranked state releases its claim and retracts to
   inline. The guest's own navigation clears nothing. Tapping a rail card to open its
   page leaves the rail's claims intact, so closing the page has something to return
   to. Priority decides what SHOWS in both cases. This decides only what is thrown
   away. Durable `lifetime: "conversation"` slices opt out.
5. Arrivals REFRESH their state: a server arrival into state X retracts
   earlier-turn components sitting in X to inline (new cards replace the rail; a
   new wizard replaces the wizard). Same-turn siblings coexist; durable
   `lifetime: "conversation"` slices opt out. (`store.supersede`.)
6. When the top state clears, the ladder looks again. After a delivery cleared the
   rungs below, it finds nothing and lands on the BASE. Closing a focus surface never
   resurrects the rail that was open before it. After the guest's own navigation the
   claims below are intact. Closing a detail page returns to the rail it opened from.
7. Typing changes NOTHING by itself. The old new-turn reset (`beginExchange`, the
   "two lifetimes" chat-layer wipe) is deleted: only arrivals move the screen and
   only closings release it. A wizard mid-flow survives the guest's next message.

The declared-initial retract survives for the GUEST CLOSE (template-chrome ✕,
`closeSurfaces`) and the template swap. Those are closings, which rule 6 governs.

**No word is special.** `focus` outranks `products` because of list position, nothing
else. Rename it freely; the engine only matches names and walks the list. This is §1
applied: even priority is data.

### Rule 6. Unmatched view = inline. Always.

No state, a view the template has no state for, or a template with no reaction states
at all: the component renders inline in the conversation flow. Always, always, always.
The flow is the placeholder every component can fall back to; a matched template state
lifts the instance out of the flow into its slot (one instance, one placeholder, never
two paintings of the same actor), and losing the match releases it back.

**The authoring corollary:** only make a state public if templates should rearrange
for it. An ignored public state does not "stay put", it FALLS INLINE. If a component
mid-flow switches to a public view no host maps (an `apply` form promoted for no
reason), the surface collapses into the flow in front of the user. Steps that should
never move the page belong under rule 2's privacy, not on the public menu.

---

## 6. Persistence: ephemeral client state

All three buckets live in the client's in-memory store (`ComponentStore`). They are not
written to Redis. The state is rebuilt from the stream: reload the page and the store
starts empty and refills as the workflow re-emits.

- The **server** keeps the agent's conversation memory in Redis/DB, a different layer
  from this client render state. Do not conflate them.
- **Resumability** (survive a reload without re-running the workflow) is a future item.

| State | Where | Persisted? |
|---|---|---|
| SDUI render state (the three buckets) | client, in-memory `ComponentStore` | ❌ ephemeral, rebuilt from the stream |
| Agent / conversation memory | server, Redis/DB | ✅ yes |

### 6a. Size & eviction

The store only grows during a session; growth vectors are the timeline, the component
data map, and the transcript. Template state is replace/merge, O(1).

**The rule: hold at most the last `N` turns (default `N = 100`).** Over `N`: drop the
oldest turns and delete the component slices they point at (the timeline holds
pointers; evicting a turn must free its data or the map leaks). One number,
oldest-out-first, no LRU, no priorities. Keep template state strictly replace/merge;
the transcript rides the conversation and is evicted with it. Safe because the server
holds the real conversation memory; the client only needs recent history.

---

## 7. The model in one picture

```
   DATA ──────────► STATE ──────────► UI          one direction, both tiers
                                                  (data never picks a layout;
                                                   a layout never holds state)

   component tier                     template tier
   ┌──────────────────────────┐       ┌────────────────────────────────┐
   │ view axis (PUBLIC)       │       │ stateOrder (priority ladder)   │
   │   products ─ layout      │ snap- │   focus      ─ layout          │
   │   product  ─ layout      │─shot─►│   product    ─ layout          │
   │     └ detail (private)   │ name- │   products   ─ layout (slot)   │
   │     └ apply  (private)   │ match │   …                            │
   └──────────────────────────┘       └────────────────────────────────┘
        spawned actor                   subscriber; derived state;
        owns its state                  places at spawn, reacts after
```

The three buckets of §2 are unchanged underneath: the component's `view` and private
keys live in its slice, the template's own keys (draft, panels) in template state, and
the timeline in the conversation. Services sit outside and write in, as producers.

---

## 8. Runtime alignment: the v2 build list

The doctrine above is decided; this is what implements it (the concrete file map lives
in the migration plan, not here):

1. **One shared derivation.** The template's active state derives in exactly one place
   (`core/templates.ts`), by the rule-5 ladder walk. v1 shipped three copies of the
   "latest surfaced view wins" recency rule (active view, app width, Studio preview)
   and they diverged once already; the ladder replaces all three.
2. **Ordered claims.** The template's declared state order becomes a first-class
   ordered list (today's `stateOrder` promoted from picker hint to contract); layout
   filenames stop being claims.
3. **State-owns-layout resolution.** The active layout resolves from the state's
   declaration (same-name default), never from name identity with a view.
4. **`view` with legacy alias.** The slice key renames; `defaultState` stays readable
   during the sweep.
5. **Arrival scan, single owner.** Rule 3's host scan replaces the three v1 emitters.
6. **Retract to declared initials.** The hardcoded `"inline"` resets (guest
   close, chrome close) become "reset to the component's declared initial chain".
7. **Lint + guards move in lockstep** (`UNOVERSE_CONFORMANCE.md` §5): the
   case-name-equals-layout-filename rules die, the surfaces-select-on-the-public-axis
   rule survives renamed, reaction coverage becomes "every reachable public state
   appears in the template's declared order".

Until this list lands, the SDK below (§9) implements v1 semantics.

---

## 9. The as-built SDK surface (v1 mechanics, maps the model → the code)

> ⚠️ This section describes the SHIPPED surface, which still implements v1 name-sync.
> Items marked (†) are replaced by the §8 list.

### `ComponentStore` (`core/src/store.ts`): the single state

| Model bucket | Store API |
|---|---|
| **Conversation** | `addUserMessage` · `startResponse` · `completeResponse` · `getTimeline` / `getResponses` / `latestResponse` |
| **Component state** | `apply({COMPONENT_INIT\|COMPONENT_DATA})` (merge at `chatId:nodeId`) · `get(chatId,nodeId)` · `getType` |
| **Template state** | `getTemplateState` / `mergeTemplateState` plus `getDraft`/`setDraft` (the one named convenience) |
| **Lifecycle** (derived) | `getLifecycle`/`setLifecycle` |
| **Reactivity / size** | `subscribe`/`getVersion` · `new ComponentStore({maxTurns=100})` + internal `evict()` |

No feature-named member exists.

### Inbound wire messages (`core/src/connection.ts` → `applyServerMessage`)

| Message | Effect |
|---|---|
| `COMPONENT_INIT` | place pointer + seed data (or, if a template directive, `setActiveTemplate`) |
| `COMPONENT_DATA` / `OBJECT_DATA` | merge at `chatId:nodeId` |
| `WORKFLOW_STATE` | open/complete the turn + `lifecycle` + template selection |
| `TEMPLATE_DATA` | `mergeTemplateState(msg.data)` |
| `SESSION_READY` | stream-live signal |

**Turn identity (model semantic, every port implements this):** `conversationId` names
the CONVERSATION; `chatId` names ONE TURN and every component keys `chatId:nodeId`. The
channel mints a fresh `chatId` per outbound send, so each exchange is its own turn and
a re-run yields a NEW component instance instead of merging into the previous one.

**Turn-internal ordering (model semantic):** a turn's components order by latest server
activity, newest last; a data merge for an overtaken component moves its pointer back
to the end of its turn. The streaming hot path (component already last) stays a
data-only merge.

**Which lane:** every message above is run-scoped and arrives on the MCP `/stream`. The
SDK WS lane carries only audio + global cross-MCP state (two-lane split,
`UNOVERSE_MCP_TEMPLATE_PROTOCOL.md` §5b).

### Action verbs (`core/src/actions.ts` → `dispatchAction`)

Exactly two writes + a server route: `setValue` / `input` → the component's own slice;
`setTemplateValue` → template state; any other type → the server, as a native MCP call
(send = fire-and-forget `tools/call` on the trigger tool; submit-to-waiting-app =
native `elicitation`; typing = local `draft`). No bespoke REST; every host shares this
one SDK path.

### Template derivations (`core/templates.ts`): pure, portable, the ONE home

| Function | Derives | v2 |
|---|---|---|
| `resolveActiveLayout(def, store)` | active layout by name-sync (layout name = latest surfaced view) | † replaced by state-owns-layout |
| `resolveActiveView(def, store, validViews)` | the one active-view derivation, incl. the pinned/guest law | † recency core replaced by the rule-5 ladder; pinned/guest survive |
| `selectPointers(store, node)` | `ComponentSlot.select` → ordered pointers, newest first | survives (rule-5 tiebreak) |
| `collectSurfacedViews(tree)` | the views a layout's surfaces claim | † becomes the ordered claim list |
| `computeAppWidth(activeLayout, store, appSize)` | state-owned app width | width math survives; its private recency copy † dies |
| `propDefaults` / `formatRelative` / `cssWidth` | small neutral projections | survive |

Two guards freeze the portable core (`sdk-core-surface.test.ts`,
`sdk-core-portable.test.ts`: no React/web imports in `core/`); a platform port
translates `core/` and only `core/`.

### Rendering (`react/`)

- `UnoverseComponent` renders ONE component from either data source (`uri` + `data`
  with a local slice, or `store` + `chatId` + `nodeId`); no view injection either way.
  `StreamedUnoverseComponent` remains a deprecated alias.
- `StreamedUnoverseTemplate` roots template scope, routes `setTemplateValue`,
  instantiates the voice service for `service: "voice"` apps and answers its actions.
- `useVoiceService` is the native voice service; its call state flows into template
  state as a producer (§4).

---

## Sources

- [React: Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [statecharts.dev: the world of statecharts](https://statecharts.dev/)
- [Stately: state machines and statecharts](https://stately.ai/docs/state-machines-and-statecharts)
- [Stately: actors](https://stately.ai/docs/actors)
- [Make Impossible States Impossible (Richard Feldman)](https://www.youtube.com/watch?v=IcgmSRJHu_8)
- [Server-Driven UI: 2026 Guide to Architecture](https://www.weweb.io/blog/server-driven-ui-guide-architecture-examples)
- [Apollo: Server-Driven UI basics](https://www.apollographql.com/docs/graphos/schema-design/guides/sdui/basics)
- [Projections & Read Models in event-driven architecture](https://event-driven.io/en/projections_and_read_models_in_event_driven_architecture/)
