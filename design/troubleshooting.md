---
sidebarTitle: "Troubleshooting"
title: "Troubleshooting"
---

The mistakes that recur, with the cause behind each one. Debug in **studio**'s DevTools
order: the stream log, then the state inspector, then the definition
([studio](/design/studio)). See the data before editing anything.

## Rendering

| Symptom | Cause | Fix |
|---|---|---|
| Renders blank, or shows defaults while data clearly streams | A `bind` does not match the streamed field name, or the prop has no default so partial data blanks it | Check the stream log for the actual delivered keys, align the `bind`, and give every prop a default |
| Definition edits do nothing | The change touched the node contract, its props or discovery meta, so the published node is still the old one | Publish again with `unoverse deploy studio`, then re-check |
| An element is missing entirely | A primitive typo, or an invented primitive | The schema should have flagged it, so wire the schema ([Quick start](/design/quick-start)) and compose from the closed set |
| A style is silently ignored | A raw value such as `12px`, or a token name that does not exist in your semantic set | Token names only. Check `design/<project>/styles/semantic/` for the real name |
| Right in one theme, broken in another | The definition references a base palette entry, or the theme is missing a token | Reference semantic names only, and run the theme-contract guard |

## State and interactivity

| Symptom | Cause | Fix |
|---|---|---|
| `visibleWhen` never fires | The key was written to one bucket and read from another, or the names do not match | Open the state inspector, find where the key actually landed, and align the action with the read ([State](/design/state)) |
| Two views both visible, or both hidden | Several `visibleWhen` conditions, hand-negated, that have drifted apart | One `Switch` on one discriminant |
| A wizard step never changes | The case content self-guards with a stale condition, or the button writes a value no case matches | Remove the self-guard, and check the exact string values in the inspector |
| A focus surface will not close | The ✕ is not resetting the interface's own state, or it writes app state instead | The expanded state carries its own ✕, writing `state` back on its own slice. The walk re-runs and the app drops to its base ([State](/design/state)) |
| Thinking dots never stop | The turn's completion never arrived on the stream, which is a delivery problem rather than your definition | Verify in the stream log and report it. Never gate the indicator on component text as a workaround |
| A voice app is stuck in one phase | Branching on raw booleans instead of `callState`, or reading it from the wrong scope | `Switch` on the single `callState` value in app scope ([State](/design/state)) |
| A `Switch` draws nothing until something is clicked | Its discriminant has no starting value, so no case matches | Give the axis a starting value in the definition that owns it, never in one that embeds it |

## Templates and apps

| Symptom | Cause | Fix |
|---|---|---|
| A panel shows a stale interface | The slot selects with no `where`, and a bare `from: all` is oldest-first | Select on the public state, with `limit: 1`, so the most recent write wins ([Apps](/design/apps)) |
| A template holds nothing | Nothing was delivered into it, or the delivery confirmed empty and cleared it | Check the stream log for the delivery. An empty template collapsing is correct behaviour ([Templates](/design/templates)) |
| A card arrives but the template does not rearrange | The card's state name and the template's state names do not match | Use the standard `grid` and `page` names on both sides, because reactions are name-matches |
| A copywriter part stays blank | The linked component carries no brief, so there is nothing to write to | Put a `brief` on the element that binds the field ([Components](/design/components)) |
| An Agent never picks your app | `whenToUse` is layout-first, selector-shaped or missing | Rewrite it outcome-first, in the words a user would say ([Apps](/design/apps)) |
| A component is squashed or stretched | The app is imposing a size on it | Delete the app rule. A component declares its own size |

## Pipeline

| Symptom | Cause | Fix |
|---|---|---|
| A new definition is rejected at boot | Invalid YAML, or an envelope the schema rejects | The editor squiggle names the line. Wire the schema ([Quick start](/design/quick-start)) if you have not |
| It renders in **studio** but you cannot find it on the **canvas** | Components are not in the node library, and reach a workflow by clipboard | Select it in **studio**, click **Copy for Canvas**, and paste on the canvas ([studio](/design/studio)) |
| No state pills in **studio**'s switcher | The definition declares no state tree, and the viewer renders the served tree rather than scanning layouts | Declare the top-level `states:` tree. The pills appear automatically, in tree order |

**Stuck beyond this?** Re-read the concept page behind it. Most persistent bugs are
misunderstandings of the model, such as the wrong bucket, an app owning what an interface
owns, or logic that belongs in a workflow, rather than typos.
