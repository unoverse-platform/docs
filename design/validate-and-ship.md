---
sidebarTitle: "Validate & Ship"
title: "Validate & Ship"
---

**Three enforcement layers catch mistakes for you; one checklist covers what only you can judge.**

Validation lives in **studio**, because Studio is the only thing that publishes: the lint rules below run automatically when you publish, and nothing with errors ships. Errors block; warnings flag judgment calls (e.g. an untyped global slot); hints suggest niceties (a missing states fixture). Each message cites the doc that owns the rule.

---

## Layer 1: The JSON Schema (as you type)

`design/_schema/unoverse.schema.json` validates every definition in your editor (wiring in [01](/design/quick-start)). Structural, zero false positives. It catches:

- missing envelope fields (`unoverse`, `kind`, `name`, `root`; components also need `category`: discovery meta lives in the **manifest**)
- an unknown primitive `type` (the closed set is encoded)
- broken primitives: `Switch` without `cases`, `Each` without `app` + a list (literal `items` or `bind.items`), `Ref` without `ref`, `ComponentSlot` without `select`
- illegal conditions: only `eq` / `ne` / `in` / truthy exist; `and`/`or`/arithmetic are rejected by design (derive in the node, [03](/design/components))

It validates two shapes: **envelope** files (with the `unoverse` field) and **bare node** partials (`layouts/`, `components/`, atoms; legacy `states/`).

One-off sweep of everything from the CLI, if you want it (needs `ajv` and `yaml` once: `npm i -D ajv yaml` at the repo root; Studio runs the same schema as you type). Definitions are YAML; the schema file itself is JSON:

```bash
# from the repo root: validate every definition against the schema
node -e 'const A=require("ajv"),Y=require("yaml");const fs=require("fs"),p=require("path");
const v=new A({allErrors:true,strict:false}).compile(JSON.parse(fs.readFileSync("design/_schema/unoverse.schema.json")));
const w=d=>fs.existsSync(d)?fs.readdirSync(d).flatMap(f=>{const q=p.join(d,f);return fs.statSync(q).isDirectory()?w(q):(f.endsWith(".yaml")&&f!=="manifest.yaml"&&!f.endsWith(".states.yaml")?[q]:[])}):[];
let bad=0;for(const d of["design/marketplace/components","design/marketplace/atoms","design"])for(const f of w(d))if(!v(Y.parse(fs.readFileSync(f,"utf8")))){bad++;console.log("✗",f,v.errors[0].instancePath,v.errors[0].message)}
console.log(bad?bad+" invalid":"clean ✓")'
```

---

## Layer 2: The lint rules (Studio, at publish)

The same rules the platform's guard tests enforce in CI, run by Studio before anything publishes:

| Rule | Enforces | Level |
|---|---|---|
| **tokens** | LAW 1: no raw `px`/`rem`/`em`/`#hex` in any definition (`styles/` exempt, it IS the value layer) | error |
| **closed set** | only the frozen primitive vocabulary; `Switch`/`Each`/`Ref`/`ComponentSlot` carry their required fields | error |
| **style keys** | only the portable style vocabulary: the cross-platform contract; typos and web-isms rejected (incl. inside `hover`/`when.apply`) ([06](/design/styles-and-tokens)) | error |
| **conditions** | only `eq`/`ne`/`in`/truthy: no `and`/`or`/arithmetic; `style.when` entries carry `field` + `apply` | error |
| **self-guard** | a `Switch` case never re-checks its own discriminant ([03](/design/components)) | error |
| **resolution** | every `$include` path and `Ref` atom actually exists | error |
| **tiers** | component names unique within a home, and an org component never shadows a design-system name (two orgs may share a name; each is addressed `<org>/<name>`); design-system definitions never reference org components (incl. app preview lists) | error |
| **space scale** | dimension values are real scale steps: an invented step is silently broken CSS ([06](/design/styles-and-tokens)) | error |
| **microapp: three homes** | all `props` are `input: true`; the `state` block is SCALAR view-state only (arrays/objects/URLs = slop) ([03](/design/components)) | error |
| **microapp: state tree** | a tree component's root switches on the public axis (`view`; legacy alias `defaultState`); every state resolves a layout (same-name default) and the tree declares an `initial` | error |
| **manifests** | discovery meta correct (`description` ≤120, `whenToUse` utterance-shaped, no envelope duplicates); an app manifest declares its `states:` tree (base first) and resolves its base `layout`; every reachable public state appears in some hosting app's declared order | error |
| **reaction contract** | flags the deprecated bridge: a component writing its view into app state, or a top-level envelope `defaultState` ([04](/design/state)) | warn |
| **global slots** | `from: "all"` with no `where` and no `type`; a reaction slot selects on the public axis (`view`) ([05](/design/apps)) | warn |
| **state switcher** | a definition with a `Switch` on an owned key but no declared state tree: Studio's switcher renders the tree, not the layouts ([07](/design/studio)) | hint |

The platform's own CI additionally runs the **theme-contract** and **discoverability-meta** guards, and the SDK build enforces the **closed set** at the renderer level: you can't drift past them even if a rule were missed at publish.

---

## Layer 3: Your judgment (the conformance checklist)

What no linter can decide: audit every artifact against this before calling it done:

**Structure**
- [ ] Structure is **earned**: flat if it can be; `components/`/`layouts/` only when the shape demands them (apps never carry `states/`, retired 2026-08-22)
- [ ] Few shallow discriminants, not boolean soup; same-shape states collapsed into one data-driven state
- [ ] No self-guarding states; mutually exclusive views in ONE `Switch`

**Data**
- [ ] Every `bind` has a prop/state key **with a default**
- [ ] Derived values computed in the node, sent as plain fields: no logic simulated in the definition

**State ([04](/design/state))**
- [ ] Reaction contract respected: apps react by name via their declared tree, slots select on `view`; `setAppValue` writes chrome keys only, never `defaultState` (the deprecated focus bridge)
- [ ] Locked state respected: lifecycle from derived flags, voice via `callState`, host chrome via `props`

**Apps ([05](/design/apps))**
- [ ] No component-type rules in slots; reaction slots select by `where` on the public axis; components own their size and states
- [ ] Manifest binds the workflow; `whenToUse` outcome-first, disqualifies by property

**Style ([06](/design/styles-and-tokens))**
- [ ] Semantic tokens only; no invented component-named tokens

---

## Ship

Publishing happens in **studio** and nowhere else: assets never deploy through the core platform:

1. **Preview, mock**: prop defaults + the state picker; exercise every state fixture.
2. **Preview, live** ([07](/design/studio)): stream real data through it, watch the stream log stay clean. The preview runs the production path, so it is the release test.
3. **Publish**: Studio lints (Layer 2 blocks on any error) and publishes to your universe over the API, authenticated by your sign-in to that universe (publishing is a specific permission on your account). The item is live in every canvas immediately: no build, no restart, no deploy.

---

**Next:** [09, Troubleshooting](/design/troubleshooting).
