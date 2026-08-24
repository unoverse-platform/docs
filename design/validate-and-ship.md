---
sidebarTitle: "Validate and ship"
title: "Validate and ship"
---

**Three enforcement layers catch mistakes for you; one checklist covers what only you can judge.**

The lint runs automatically when you publish, and nothing with errors ships. Errors block. Warnings flag a judgment call, such as an untyped global slot. Hints suggest a nicety. Every message cites the page that owns the rule.

---

## Layer 1: the schema, as you type

`design/_schema/unoverse.schema.json` validates every definition in your editor (wiring in [Quick start](/design/quick-start)). Structural, zero false positives. It catches:

- missing envelope fields (`unoverse`, `kind`, `name`, `root`; components also need `category`: discovery meta lives in the **manifest**)
- an unknown primitive `type` (the closed set is encoded)
- broken primitives: `Switch` without `cases`, `Each` without `app` + a list (literal `items` or `bind.items`), `Ref` without `ref`, `ComponentSlot` without `select`
- illegal conditions: only `eq` / `ne` / `in` / truthy exist; `and`/`or`/arithmetic are rejected by design (derive in the node, [Components](/design/components))

It validates two shapes: **envelope** files, which carry the `unoverse` field, and **bare node** partials in `layouts/`, `components/` and atoms.


---

## Layer 2: the lint, at publish

The same rules the platform's guard tests enforce in CI, run before anything leaves your machine:

| Rule | Enforces | Level |
|---|---|---|
| **tokens** | LAW 1: no raw `px`/`rem`/`em`/`#hex` in any definition (`styles/` exempt, it IS the value layer) | error |
| **closed set** | only the frozen primitive vocabulary; `Switch`/`Each`/`Ref`/`ComponentSlot` carry their required fields | error |
| **style keys** | only the portable style vocabulary: the cross-platform contract; typos and web-isms rejected (incl. inside `hover`/`when.apply`) ([Styles and tokens](/design/styles-and-tokens)) | error |
| **conditions** | only `eq`/`ne`/`in`/truthy: no `and`/`or`/arithmetic; `style.when` entries carry `field` + `apply` | error |
| **self-guard** | a `Switch` case never re-checks its own discriminant ([Components](/design/components)) | error |
| **resolution** | every `$include` path and `Ref` atom actually exists | error |
| **tiers** | component names unique within a home, and an org component never shadows a design-system name (two orgs may share a name; each is addressed `<org>/<name>`); design-system definitions never reference org components (incl. app preview lists) | error |
| **space scale** | dimension values are real scale steps: an invented step is silently broken CSS ([Styles and tokens](/design/styles-and-tokens)) | error |
| **microapp: three homes** | all `props` are `input: true`; the `state` block is SCALAR view-state only (arrays/objects/URLs = slop) ([Components](/design/components)) | error |
| **microapp: state tree** | a tree component's root switches on the public axis (`view`; legacy alias `defaultState`); every state resolves a layout (same-name default) and the tree declares an `initial` | error |
| **manifests** | discovery meta correct (`description` ≤120, `whenToUse` utterance-shaped, no envelope duplicates); an app manifest declares its `states:` tree (base first) and resolves its base `layout`; every reachable public state appears in some hosting app's declared order | error |
| **reaction contract** | flags the deprecated bridge: a component writing its view into app state, or a top-level envelope `defaultState` ([State](/design/state)) | warn |
| **global slots** | `from: "all"` with no `where` and no `type`; a reaction slot selects on the public axis (`view`) ([Apps](/design/apps)) | warn |
| **state switcher** | a definition with a `Switch` on an owned key but no declared state tree: Studio's switcher renders the tree, not the layouts ([studio](/design/studio)) | hint |

The platform's own CI additionally runs the **theme-contract** and **discoverability-meta** guards, and the SDK build enforces the **closed set** at the renderer level: you can't drift past them even if a rule were missed at publish.

---

## Layer 3: your judgment

What no linter can decide. Audit every artifact against this before calling it done.

**Structure**
- [ ] Structure is **earned**: flat if it can be; `components/`/`layouts/` only when the shape demands them 
- [ ] Few shallow discriminants, not boolean soup; same-shape states collapsed into one data-driven state
- [ ] No self-guarding states; mutually exclusive views in ONE `Switch`

**Data**
- [ ] Every `bind` has a prop/state key **with a default**
- [ ] Derived values computed in the node, sent as plain fields: no logic simulated in the definition

**State ([State](/design/state))**
- [ ] Reaction contract respected: apps react by name via their declared tree, slots select on `view`; `setAppValue` writes chrome keys only, never `defaultState` (the deprecated focus bridge)
- [ ] Locked state respected: lifecycle from derived flags, voice via `callState`, host chrome via `props`

**Apps ([Apps](/design/apps))**
- [ ] No component-type rules in slots; reaction slots select by `where` on the public axis; components own their size and states
- [ ] Manifest binds the workflow; `whenToUse` outcome-first, disqualifies by property

**Style ([Styles and tokens](/design/styles-and-tokens))**
- [ ] Semantic tokens only; no invented component-named tokens

---

## Ship

Publishing runs from the terminal. Design assets never deploy through the core platform.

1. **Preview in mock.** Prop defaults and the state picker: exercise every state.
2. **Preview in live.** Stream real data through it and watch the stream log stay clean. The
   preview runs the production path, so this is the release test.
3. **Publish.**

```bash
unoverse login
unoverse deploy studio
```

`login` is a one-time browser sign-in to the universe you are publishing to, and publishing
is a specific permission on your account. `deploy studio` runs Layer 2 first and stops on any
error, so nothing broken leaves your machine. What lands is live in every canvas at once.

## Next steps

<Card title="Troubleshooting" icon="wrench" href="/design/troubleshooting" horizontal>
Symptom, cause and fix for the mistakes that recur.
</Card>

<Card title="Reference" icon="book-marked" href="/reference/overview" horizontal>
Every field the lint checks, generated from the schemas.
</Card>
