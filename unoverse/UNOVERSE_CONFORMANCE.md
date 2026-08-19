# Unoverse Conformance (how the rules are enforced)

> **Status**: 🟢 Live end-to-end (July 2026): schema + guards + the `./unoverse lint` CLI.
> **Audience**: anyone authoring `rx/**` definitions, or maintaining the guards.
> **Companions**: [`UNOVERSE_AUTHORING.md`](./UNOVERSE_AUTHORING.md) (the rules),
> [`UNOVERSE_LAYERS.md`](./UNOVERSE_LAYERS.md) (layouts/states/components), [`UNOVERSE_STATE_MODEL.md`](./UNOVERSE_STATE_MODEL.md) (§5 = the six rules).
>
> **One line:** the framework has a lot of prose rules; we turn the *machine-checkable* ones into
> **editor-/build-failing guards** so a new dev is caught early, and we're honest that the
> **judgment** ones can't be a guard.

---

## 1. The principle: prose rule → machine guard

Every rule that can be checked mechanically should be a guard, not tribal knowledge. But a guard
that **false-positives is worse than none**. One wrong red squiggle and people disable it and
stop trusting the suite. So the bar is: **zero false positives on valid definitions**, and only
**hard-fail the unambiguous rules**. Everything judgment-y is a warning/hint or a human's call.

Four layers, by *when* they catch you:

| Layer | When | Catches | Where |
|---|---|---|---|
| **JSON Schema** | **as you type** (editor) | shape rules: vocabulary, envelope, primitive completeness, condition form, style keys | `rx/_schema/unoverse.schema.json` |
| **`./unoverse lint`** | **before deploy** (CLI, no deps, ships in the starter) | everything below, with doc-cited messages; 0 errors required | `packages/base/src/lint/rx/` (face: `scripts/lib/lint.mjs`) |
| **Guard tests** | on `npm test` / CI | the same rules server-side, on the **composed** tree | `server/tests/rx/*.test.ts` |
| **SDK closed-set** | on SDK build | the primitive set + the feature-free state machine are frozen | `unoverse/react/test/closed-set.test.mjs`, `core/test/state-model.test.mjs` |

---

## 2. The JSON Schema (editor guidance)

**File:** `apps/unoverse/rx/_schema/unoverse.schema.json` · **Wired in:** `.vscode/settings.json`.

Inline, before you ever run anything: autocomplete of the 16 primitives; errors on an invalid
`type`; a broken `Switch` (no `on`/`cases`), `Each` (needs `template` + literal `items: []` or
`bind.items`), `Ref` (no `ref`), `ComponentSlot` (no `select`); a bad condition
(`and`/`or`/arithmetic: only `eq`/`ne`/`in`/truthy); an **unknown style key** (the closed
cross-platform vocabulary, incl. inside `hover` and `when[].apply`).

- **One schema, two shapes.** A file with `unoverse` validates as an **envelope**; a bare-node
  partial (`layouts/`, `states/`, `components/`, `$include` siblings) validates as a **node**.
- **Envelope meta is minimal.** A component requires `category` only; `description`/`whenToUse`
  live in the **manifest** when the component is discoverable (never duplicated).
- **Structural, never textual** on data positions: `bind` / `props` / `action` values stay
  freeform, so a data value is never mistaken for a node type. Zero false positives is the bar.
  Re-run the lint sweep after any schema change.

---

## 3. `./unoverse lint` + the guard tests (one rule set, two homes)

The CLI (`./unoverse lint`; the rules live in `packages/base/src/lint/rx/`, the terminal
face in `scripts/lib/lint.mjs`) runs at authoring time and **mirrors** the server guards
(`server/tests/rx/*.test.ts`), which re-check on CI against the composed tree. The rules:

| Rule | Level | Guard twin |
|---|---|---|
| LAW 1: tokens only, no raw `px`/`rem`/`#hex` (`styles/` is the value layer) | error | `definition-tokens.test.ts` |
| Closed primitive set + required fields per primitive | error | schema + `closed-set` |
| Closed **style keys** + **space-scale steps** (an invented step = silently broken CSS) | error | none (lint-first) |
| `$include`/`Ref` resolution: everything composes | error | `…: fully expands` tests |
| **Component tiers**: names unique within a home, and an org component never shadows a
  design-system name (two orgs MAY share a name, each addressed `<org>/<name>`,
  per UNOVERSE_COMPONENT_ORGS.md); design-system definitions never reference
  org components (incl. template preview lists) | error | `component-tiers.test.ts` |
| A `Switch` case never re-guards its own discriminant | error | `self-guard.test.ts` |
| **Microapp three homes**: all `props` are `input: true`; the `state` block is **scalar
  view-state only** (an array/object/URL in `state` is slop); the ONE admitted object is a
  well-formed v2 `state.view` TREE | error | `microapp-structure.test.ts` |
| **The public axis at the root**: a component with a v2 `state.view` tree switches its
  root on **`view`**; a legacy component switches on `defaultState` (never both, never
  neither); cases `$include layouts/<state>`; the arrival state is declared (tree
  `initial`, or legacy `manifest.defaultState` / `state.defaultState`) | error | `microapp-structure.test.ts` |
| **The template tree**: the served ladder (`def.stateOrder`) ≡ the manifest tree's top
  level minus the base, in declared order; a declared base substate is CONTAINED by
  compilation (its subtree exists in the base arrangement and is stripped from every
  other layout, no hand guards); substates rank after the ladder, first = the viewer's
  landing default | error | `template-tree.test.ts` |
| **State Model v2 behavior**: the six rules as executable law over the portable core:
  the LADDER (declared order outranks recency), PRIVACY (an internal key never moves the
  template), the ALIAS (`view` wins over legacy `defaultState`; either satisfies a
  claim), the RETRACT law (every reset lands on the slice's declared initial, `inline`
  only as the legacy fallback), the RESTING RAIL (a pinned lower state takes over only
  by the guest's tap), CANCELLATION (`cancelBelow`: a higher state retracts every lower
  claim, so release lands on BASE), and PINNED (only a guest write displaces a pin) | error (CI) | `state-model-v2.test.ts` |
| **Reaction coverage**: a template claims every REACHABLE public state: from every
  claimed view, follow each hosted component's own `setValue` targets on the public
  axis; a target another org template claims must be claimed here too, or the click
  dead-ends (targets claimed nowhere = sanctioned self-close views, exempt) | error | `template-reaction-coverage.test.ts` |
| **Surfaces select on the public axis**: a reaction surface's `select.where` field is
  `view` (legacy alias `defaultState`), never a component's internal key (warn); and it
  claims exactly ONE view with a string `eq`; `ne`/`in`/bare selects are errors
  (`packages/base/src/lint/rx/walk.mjs`) | warn/error | none (lint-first) |
| **Deprecated bridge**: a component writing template state (`setTemplateValue` from a
  component = error; writing `defaultState` into template state = warn) | warn/error | none |
| Theme token contract across orgs | CI only | `theme-contract.test.ts` |

*Legacy twin:* templates without a `stateOrder`/tree keep the v1 recency semantics under
their own guard (`template-layout-sync.test.ts`) until they migrate.

---

## 4. What a guard can NOT check: be honest

Judgment calls stay in the docs + code review; a linter that pretends to check them trains
people to ignore warnings:

- **"structure is earned"**: flat if it can be; extract for reuse/repetition, don't scatter identity.
- **"few shallow discriminants, not boolean soup"** (authoring §9).
- **"derived values computed in the node"** (authoring §9).
- **"same-shape states should collapse to one data-driven state"**: heuristically detectable, humanly decided.
- **state-name consistency per org**: convention (`focused` vs `focus` fragments the selector vocabulary).

---

## 5. Maintenance: avoid drift

- **Name the rule.** Each check cites its doc section; when a rule changes, both move.
- **One source for each closed set.** Primitives: SDK `closed-set.test.mjs` + the schema enum.
  Style keys: the SDK style interpreter + schema + lint. Scale steps: read live from the orgs'
  `base/spacing.json`. Keep them equal or they disagree silently.
- **Lint and guards must agree.** The CLI mirrors `microapp-structure`/`self-guard`/
  `definition-tokens`; a rule added to one is added to the other in the same change.
- **Never trade a false positive for a catch.** The suite is only trusted while every valid
  file passes. Re-run `./unoverse lint` + `npm test` after any change.
