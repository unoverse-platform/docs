---
sidebarTitle: "Troubleshooting"
title: "Troubleshooting"
---

**Symptom → cause → fix.** Debug in **studio**'s DevTools order: stream log → state inspector → definition ([studio](/design/studio)). See the data before editing anything.

---

## Rendering

| Symptom | Cause | Fix |
|---|---|---|
| Component renders blank / shows defaults while data clearly streams | a `bind` doesn't match the streamed field name, or the prop has no default so partial data blanks it | check the **stream log** for the actual `COMPONENT_DATA` keys; align `bind`; give every prop a default |
| Definition edits do nothing | the change touched the component's **node** contract (props or discovery meta), so the published node is still the old one | publish again with `unoverse deploy studio`, then re-check |
| Unknown type / element missing entirely | primitive typo, or an invented primitive | schema should have flagged it: wire the schema ([Quick start](/design/quick-start)); compose from the closed set ([How it works](/design/sdui-and-mcp-apps)) |
| Style silently ignored | raw value (`12px`, `#fff`) or a token name that doesn't exist in the org's semantic set | tokens only; check `design/<project>/styles/semantic/` for the real name; the deploy lint catches raw values (`unoverse deploy studio`) |
| Looks right in one theme, broken in another | definition references a **base** palette entry, or the theme is missing a token | reference **semantic** names only; run the theme-contract guard |

## State & interactivity

| Symptom | Cause | Fix |
|---|---|---|
| `visibleWhen` never fires | key written to the wrong **bucket** (set with `setValue`, read from app state: or vice versa), or a key-name mismatch | open the **state inspector**; find where the key actually landed; align action and read ([State](/design/state) decision table) |
| Two views both visible / both hidden | N `visibleWhen`s with hand-negated conditions drifting apart | one `Switch` on one discriminant |
| Wizard step never changes | the case content self-guards with a stale condition, or the button writes a value no case matches | remove self-guards; check the exact string values in the inspector |
| Focus surface won't close | the component's ✕ isn't resetting ITS OWN state (or writes app state: the deprecated bridge) | the expanded state carries its own ✕: `setValue { view: "<its initial>" }` on the component's slice; the ladder walk re-runs and the app drops back ([State](/design/state)) |
| Thinking dots never stop bouncing | the turn's `WORKFLOW_COMPLETED` never arrived on the stream: a delivery problem, not your definition | verify in the stream log, then report it; ❌ never gate the indicator on component text as a workaround |
| Voice app stuck in one phase | branching on raw booleans instead of `callState`, or reading it from the wrong scope | `Switch` on the single `callState` value in app scope ([State](/design/state)) |

## Apps & selection

| Symptom | Cause | Fix |
|---|---|---|
| A focus panel shows the wrong / a stale component | the slot selects with no `where` (bare `from: "all"` is oldest-first) | select on the public axis: `where: { field: "view", eq: "focus" }, limit: 1`, most recent state-write wins ([Apps](/design/apps)) |
| The AI never picks your component/app | `whenToUse` is layout-first or missing | rewrite outcome-first in the user's vocabulary ([Apps](/design/apps)) |
| A wide component gets squashed / a card gets stretched | app is imposing sizes on components | delete the app rule; the component declares its own size in its definition |
| App swap loses the conversation | app is holding data it shouldn't: state lives in the store, apps own nothing | move the data to the proper bucket; apps only project |

## Pipeline

| Symptom | Cause | Fix |
|---|---|---|
| New definition rejected at boot | invalid YAML, or an envelope the schema rejects | the editor squiggle names the line. Wire the schema ([Quick start](/design/quick-start)) if you have not |
| Component renders in **studio** but you cannot find it on the **canvas** | components are not in the node library. They reach a workflow by clipboard | in **studio**, select it and click **Copy for Canvas**, then paste on the canvas with `Cmd+V` ([studio](/design/studio)) |
| Mock states don't appear in **studio**'s switcher | the definition declares no state tree: the viewer renders the served tree and never scans layouts; flat definitions list nothing | declare the `state.view` tree (component) or the manifest `states:` tree (app); pills appear automatically, in tree order ([studio](/design/studio)) |

---

**Stuck beyond this?** Re-read the relevant concept doc: most persistent bugs are model misunderstandings (wrong bucket, app owning what a component owns, logic in the definition), not typos.
