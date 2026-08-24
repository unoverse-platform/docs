# unoverse Design: Agent Rulebook

Condensed, non-negotiable rules for building unoverse components and apps. Full journey: [Overview](/design/overview) → [Quick start](/design/quick-start) → [Troubleshooting](/design/troubleshooting). Deep reference: [UNOVERSE_AUTHORING](/unoverse/UNOVERSE_AUTHORING), [UNOVERSE_STATE_MODEL](/unoverse/UNOVERSE_STATE_MODEL) (§5 = the six rules), [UNOVERSE_LAYERS](/unoverse/UNOVERSE_LAYERS), [UNOVERSE_CONFORMANCE](/unoverse/UNOVERSE_CONFORMANCE).

---

## 1. The architecture in one paragraph

UI is **data**: neutral YAML in `design/`, rendered natively per platform by a dumb, style-free SDK. Apps are **MCP Apps** (manifest = the envelope; sends = `tools/call`; answers = elicitations; state on the MCP `/stream`). Interaction follows the **reaction contract**: a component is a small state machine whose states own their layouts; it writes ONLY its own slice; apps are pure views that react by NAME in their declared priority order; **inline is the universal default**. You author data; you never touch the SDK, transport, or platform code.

## 2. The anatomy (both kinds share the folder grammar)

| | Component | App |
|---|---|---|
| Contract file | `manifest.yaml` = discovery meta (`title`/`description` ≤120/`whenToUse` utterance-shaped) + `lifetime?`/`lifecycle?`. Presence = discoverable; envelope never duplicates it. Arrival = the state tree's `initial` (manifest `defaultState` = the legacy ARRIVAL spelling, seeded then dropped once a tree exists, but the SAME key is the app-level LOAD MODE for a component app, defaulting to `focus`: never delete it as cleanup) | `manifest.yaml` = THE envelope: name/whenToUse/`defaultState` (load state)/`inputSchema`/**`states:` tree**/`binding{workflow,trigger}`/`layout` (the base)/`service?`, no `<name>.yaml` |
| Envelope | `<name>.yaml`: name/category/`nodeSize`/`outputs`/`props`/`state` (the **`view` tree**)/`root` | |
| State tree | `state.view` = the PUBLIC axis: top-level states = the component's whole interface; NESTED substates = PRIVATE steps (own axis, e.g. `on: step` + `initial`). Each state owns its layout(s); **`layout:` optional, same-name default, `{}` = complete state** (write `layout:` only when the filename differs). A state's own layout = its SHELL (always on); only its substates are choices | manifest `states:` tree: **top-level order IS the priority ladder** (base FIRST, then reaction states in priority order); **nesting IS containment** (compiler strips a base substate from non-base layouts; first substate = landing default); `stateOrder` is DERIVED, never authored (LEGACY: authored list for tree-less apps). The timeline is the base's SHELL content, NOT a substate (declaring contains it) |
| Root | `Switch on view` (LEGACY alias `defaultState`) → each public state's shell; a private axis = its own Switch inside its shell | one layout per state in `layouts/` (same-name default); each state's layout surfaces its own view |
| Layers | private steps live IN the tree (nested substates), not sibling files; the DEAD v1 forms: `states/` folder, authored `stateOrder`, filename-as-ownership (`<face>-<step>` selecting a drawing by its name). Naming convention: an arrangement is same-name (`call.yaml`, `form.yaml`); a substate's drawing is axis-prefixed + declared via `layout:` (`step-register`, `callState-idle`; exemplars `course-application`, `voice-chat`) | `states/` = drawings for the base's contained substates (welcome, call phases), each keeping its own condition; component-driven arrangements are top-level states (rearrange rule: component moves the app = top-level, app's own mood = nested under base) |
| Local partials | `components/` (earned: 2+ layouts share a shape); cross-component shapes = atoms in `design/marketplace/atoms/` (`Ref`; authoring-time only, the server expands before serving) | `components/` (header, composer-bar, turns) |
| Flat form | just `<name>.yaml` + `root`: one drawing, no manifest/layouts/tree. Structure is EARNED | |

Exemplars (as shipped): `design/sab/components/product-card` (component tree: `products {}` + `detail` with private steps) · `design/sab/apps/sab-chat/manifest.yaml` (app tree: `main>welcome` contained; ladder `focus/products/detail`).

**Two component tiers:** design system = the installed marketplace package (generic, org-neutral, any org); org = `design/<project>/components/` (**org-private**, that client's own, discoverable only in their apps). Names UNIQUE per tier: two orgs may ship the same name, but an org NEVER shadows a design-system name (lint error); org may reference design-system, design-system NEVER references org (lint). URIs: `unoverse://components/<org>/<name>` (org) · `unoverse://components/<name>` (design system; bare also resolves a uniquely-named org component, and errors listing candidates when two orgs share the name).

## 3. Three homes: everything a component shows (slop rule)

1. **Static content** → hardcoded LITERALS in the layout (`value`, literal `items: []` on Each, `src`). Never props, never `state`.
2. **`state` block** → **SCALAR internal view-state only** (`step`, `phase`, `progressPct`) with initial values. An **array/object/URL in `state` is slop**: the linter rejects it.
3. **`props`** → ONLY `input: true` workflow-fed data (a finder's matched `products`), `default` = the preview mock. Usually empty.

Arrival = the `view` tree's `initial` (LEGACY: manifest `defaultState`, still read as an alias).

**Prop names = the data contract.** Source data (content rows, node outputs) seeds component state **as-is, by name: no projection, no mapping**; a bind whose name the source doesn't carry silently renders the preview `default` (tell: title streams, image/tagline stay mock). Content-attached cards MUST use the writer vocabulary: `title` `tagline` `description` `bodyCopy` `introParagraph` `primaryImage` `images` `link` `callToAction`, never invent (`image`/`subtitle`/`category`/`location` are misses). Fix = rename the prop to the source field, never add glue. Walkthrough: [Components](/design/components) §Prop names.

**Naming = discoverability ([Apps](/design/apps) §Naming; canonical: [Node discoverability](/nodes/node-discoverability)):** **spatial** embeds `title. whenToUse||description [category]` against the USER'S OWN WORDS. title = the thing itself; description = what it IS, ≤120; whenToUse = utterance-shaped, outcome-first, opening words dominate; category = job domain. Disqualify by property, NEVER name a sibling; a fallback surface never enumerates siblings' jobs (generalist trap).

**Briefs (AI-fed components):** a `brief` sits ON the node that renders what it describes, `{ description, maxLength }` next to the bound element, `{ description, minItems, maxItems }` on the Each (JSON Schema's own words, the brief IS the schema fragment), plain-string context on a shell/partial root; NEVER in the manifest or a separate file. The platform compiles briefs into the component's **MCP tool schema** (keys pass through verbatim as native JSON Schema; Each app binds→items schema): the schema IS the instruction channel; grounding (fill only from **spatial** results, never invent) is injected by the compiler. Closed shape, lint-enforced ([Components](/design/components)).

**Lifecycle hooks (the ONE code carve-out):** a component may fetch its own data at a
platform fire point: `onStart` (instance created) or `onEnterView` (instance entered a
named STATE; the scope key is spelled `layouts: [...]` but its entries are STATE names,
e.g. product-card's `layouts: [ detail ]`). Declared in the manifest's `lifecycle` array;
nothing undeclared runs. **Full authored copy NEVER travels through a model**: a card
carries `universal_id` and the PLATFORM dereferences it: name the platform-ready
`handler: getDetail` (zero code) rather than making the AI read a record and retype it
into props. Bespoke needs DECLARE their calls in `<handler>.yaml` beside the manifest (filename = the HANDLER, lowercased: named for what it DOES, never for the phase)
(`calls:` = the list an `api/run.yaml` is, run by the same runtime → host allowlist,
credentials, retries, transports; `returns:` projects them to partial props). The manifest
MUST declare `allowedHosts` (lint error otherwise: no list, no network) and names its
`credentials` by type. `<phase>.js` is the LEGACY form, still running, never the one to
copy. A detail view's content is `onEnterView`, never `onStart`: hydrating at
creation fetches a body copy for every card in a grid. NOTHING TO WIRE UP: a component
changing its own view writes `view`, and that write IS the event the hook reacts
to (no signal to author, no action to chain). Fire points are platform-owned
(authors add handlers, never moments); lint errors on an unknown phase, an unknown handler
name, `layouts:` on a phase with no view, an un-opted handler file, or an opt-in that
resolves to nothing ([lifecycle hooks](/design/lifecycle-hooks)).

## 4. The reaction contract: the six rules (STATE_MODEL §5)

- **THE REARRANGE RULE (LAYERS §2), the sorting law for every public/private call:** *if the app must rearrange to show it → make it a PUBLIC state (top level of the `view` axis); if the app wouldn't move → NEST it privately.* One piece of data walks horizontally across the public states (`products` rail card / `detail` full page, same object); apps react only to public states, so anything they must react to MUST be public. Within-place variations (compact/rich, wizard steps) = private substates. Privacy is the default; promotion is deliberate. An `edit`/composer state on a component is ALWAYS wrong: input is the app's ONE tool, staged with the object's data.
- **Public = the interface; nested = invisible.** The **view** (slice key `view`; LEGACY alias `defaultState`) is the only thing an app sees. Private axes (`step`, `phase`) never cross. A **surface-only component** has no inline-suited state (its initial is a placed state): it renders ONLY while placed and retires invisibly when the conversation moves on (lint-recognized).
- **Lifetime (OPTIONAL manifest flag)**: `"lifetime": "conversation"` = a durable, conversation-scoped surface (cart / itinerary / composed page), keyed by the CONVERSATION (re-calls hydrate the SAME slice, merge not re-place), exempt from the new-turn reset AND from cancellation; it stays until replaced, self-closed, or a **app swap (the hard refresh boundary, a new shell retires every surface, durable included)**. Default `"turn"` = the universal reset. Values closed to `turn | conversation` (lint-checked).
- **ARRIVAL: nobody sends a state; the host places the actor.** The component's declared `initial` stands whenever the host has a state of that name; otherwise the host SCANS its own declared order and takes the first name the component's public menu also has; no overlap = the component wakes in its own initial chain, inline. Post-spawn the app NEVER writes a component's state: not to promote, retract, or close.
- **RUNTIME: the component drives; the app reacts by name.** A `view` write makes every hosting app ask "do I have a state with that name?" Name-match is the DEFAULT (zero ceremony); `reactsTo: <other>` on an app state is the rare vocabulary-mismatch escape hatch.
- **The LADDER: an app is in exactly ONE state, derived never stored.** The app walks its manifest tree's top level top-down and enters the first of its states ANY hosted component matches; ties = most recent write (`limit: 1`). No word is special: priority is list position. **A DELIVERY into a higher state CLEARS the claims below it**: components in lower-ranked states retract to inline, so release lands on the BASE, never a stale lower state. The guest's own navigation clears nothing, so tapping a rail card into `detail` and closing it returns to the rail. No close logic exists; the same walk answers every moment (`store.cancelBelow`, called only when the winner is not `byGuest`).
- **Each state owns its layout** (same-name default; `layout:` only when the filename differs). A state's own layout is its SHELL, always on; only nested substates are choices. A state's layout must surface its own view inside (guard). Slots never stack; panel combinations cannot exist.
- **A slot's single occupant FILLS the slot** (`limit: 1` → the SDK gives the instance the frame's full height; the layout's `height: "full"` resolves against it). NEVER per-layout `minHeight: full` hacks; rails (no limit) stay content-sized.
- A view changes two ways, both `setValue { view: … }` into **its own slice**: user interaction, or the component's own chrome (its page carries its own ✕ that sets it back). **UNMATCHED VIEW = INLINE, always**: an ignored public state does not stay put, it FALLS INLINE.
- **One instance → one placeholder.** While a view matches an app state, the instance **lifts out of the flow into that state's slot** (the SDK renders it in exactly one place: never both). No `hideBelow`/overlay trick to hide a flow copy. **Many instances** are fine: the app decides a slot's layout (flow list / one focus / rail) via `select`.
- Apps select via `ComponentSlot.select.where: { field: "view", eq: "<name>" }` (LEGACY alias `defaultState`; + `limit: 1`, most-recent-wins), **never `type`-pinned, never by id, never on a component's private state key** (all lint-flagged).
- `setAppValue` = the app's own chrome (panels, draft); a component may write it too (chrome drawn via `Ref` has no slice of its own). Deprecated bridge = writing `defaultState` to move the app to another surface: linted.
- Reserved behaviors: `app` swaps the shell; **inline is the universal default**. State names are otherwise OPEN: keep them consistent per org.

## 5. Non-negotiable style/structure rules

1. **Closed primitive set**: `Box Stack Row Column Each Switch ComponentSlot Timeline · Text Image Button Input Markdown Skeleton Icon · Ref $include`. Conditions: `eq ne in` truthy only. Compose; never invent.
2. **LAW 1: zero raw values**, no `px/rem/em/#hex`; **semantic** token names only; style KEYS are closed (no web-isms); dimension VALUES must be real space-scale steps (`0 1 1.5 2 3 4 5 6 7 8 10 12 16 20 24 28 40 50 75 90 100 120 140 160 180 200`, `full`, `auto`), an invented step is silently broken CSS. **Page widths use NAMES** (`compact`/`narrow`/`reading`/`page`/`wide`, `semantic/layout.yaml`) on `maxWidth`/`hideBelow`/`stackBelow`; an ELEMENT's own size stays a step. There are NO t-shirt spacing aliases: `gap: "4"`, never `gap: md`.
3. **Multi-column layout is the GRID, never percentage widths in a flex row** (a grid subtracts its own gaps, a flex row does not, so `width: 50%` twice + `gap` overflows). Equal splits = a column count alone (`columns: "2"` = halves, `"4"` = quarters, no child style). Unequal = `columns: "12"` + `span` on each child (6 = half, 4 = third, 3 = quarter). **Stacking is automatic**: a spanning child takes the full row once the grid is narrower than `grid.stackBelow` (`semantic/grid.yaml`, override per grid with `style.stackBelow`). It measures THE GRID, not the viewport: there are no device breakpoints in `design/` ([Styles and tokens](/design/styles-and-tokens)).
4. **A look two components share is an ATOM, not a copied style block.** A token stops a repeated value; an atom stops a repeated *combination* (`background` + `border` + `radius` + `padding` = a card). Compose with `Ref`; the `Ref`'s own `style` merges OVER the atom's, so an instance overrides one thing without forking. Second component needing the same block ⇒ make the atom. A `Ref` also composes a whole flat COMPONENT, and what it inlines reads the HOST's slice (an embedded piece has no slice of its own), so **the piece's `state` initials travel with it**: never re-declare an embedded piece's default on the host. The host wins on any key it declares; the piece's `view` never travels (arrival is the host's decision). Guard: `server/tests/design/ref-state-inheritance.test.ts`.
5. **Derived values in the node/workflow**: no arithmetic in definitions.
6. **A component owns its states and size; the app owns only the framing.** No component-type rules in apps.
7. **A Switch case never re-guards its own discriminant**; one discriminant per axis, no boolean soup.
8. **Never hand-roll transport**: the SDK's MCP path is the only one.
9. **Locked state is read-only**: conversation/lifecycle (project `isStreaming`/`isEmpty`), voice (`service: "voice"` in the manifest; branch on the projected `callState`), host chrome (host props).
10. **Icon quirk**: literal glyph = `icon: "phone"`; bound = `bind: { name: field }`. An atom's `bind` is field-lookup ONLY: `Ref props` remaps FIELDS, never carries literals. To pass a literal, use **`Ref with`**: `{ "type": "Ref", "ref": "button", "with": { "label": "Learn more", "icon": "arrowRight" }, "action": { … } }`, a bind whose field is a `with` key becomes a hardcoded attribute; a truthy `with` key drops a matching `visibleWhen` guard (unprovided key ⇒ the piece stays hidden); `{{key}}` bindings take the literal.
11. **Sizing in one sentence**: the app = the ACTIVE LAYOUT's total, nothing else, ever (core panel + that layout's surface panel). The core surface (chat column) = a panel that is ALWAYS open (`appWidth`); each state's panel declares its width on its surface; ONE state active ⇒ the width is always one of a small known set, bounded by construction: nothing can combine, overflow, squeeze, or clip. Host animates between known widths; the core never moves. Values = the org's STANDARD SIZES (`styles/semantic/app-sizes.yaml`: `chat`/`rail`/`panel`, theme-resolved like any token, lint-checked); a bare name MUST exist in app-sizes (lint error naming the known set), while raw CSS and `flex` stay valid. ONE declaration per panel (panel/frame never declares width/flex: lint error); an overlay (`inset: 0`, e.g. focus) declares NOTHING and needs no layout; appWidth NEVER on a layout root, NEVER visibleWhen-guarded (a conditional arrangement is a STATE with its own layout); manifest `width`/`focusWidth` are DEAD (lint error); never `maxWidth` in the tree to size the app; root gets `overflow: hidden` ([Apps](/design/apps)).

## 6. Workflow checklist

1. Read the matching journey doc ([Components](/design/components) component / [Apps](/design/apps) app / [Styles and tokens](/design/styles-and-tokens) styles); study the exemplars: `product-card` (component state tree), `sab-chat` (app tree), `productfinder`/`planfinder` (wizards).
2. Author to the anatomy in §2; put every shown thing in its ONE home (§3).
3. **Deploy from the terminal (`unoverse deploy studio`): lint 0 errors required**; it enforces §2, §5 with doc-cited messages. Justify any warning.
4. Preview in **studio**: mock (prop defaults + state picker + Inline/Focused toggle), then live. Debug order: stream log → state inspector → definition. Never edit on a guess.

## 7. Error → fix quick table

| Symptom | Fix |
|---|---|
| Blank image/icon after passing content into an atom | literals don't travel through `Ref props` (fields only): pass them via `Ref with` (§5.10) |
| Renders a field's NAME as text | bare field ref on an absent field: hardcode the literal, or object-form `visibleWhen` |
| Focus surface won't open | the surface must `select.where` on the state the component actually writes; check the state inspector |
| Focus won't close | the component's ✕ must `setValue { view: "<its initial>" }` on ITS OWN slice |
| Component invisible in an app | unknown state name + no matching surface = inline is where it went: check the flow slot exists |
| Card shows mock image/tagline while title streams | prop name isn't the source's field name (hydration is by-name, no mapping): rename to the writer vocabulary (§3) |
| Style ignored / element auto-sizes | raw value, unknown style key, or off-scale step: lint tells you which |
| Edit does nothing | node contract changed (props/structure) → redeploy (`unoverse deploy studio`) |
| AI never picks it | manifest `whenToUse` is selector-shaped or missing: write the user's words |

Full table: [Troubleshooting](/design/troubleshooting).
