# Playbook: apps

**Read first:** [Apps](https://docs.unoverse.ai/design/apps.md), then
[State](https://docs.unoverse.ai/design/state.md). Fields:
[manifest](https://docs.unoverse.ai/reference/manifest.md),
[scales](https://docs.unoverse.ai/reference/scales.md) for app sizes.

Apps are always a project's own; none ship in the base set. Your exemplar is any app already
in the workspace, and the anatomy on the Apps page.

## The rules that bite

1. **The component drives, the app reacts by name.** A component enters a public state;
   the app enters its own state of the same name and draws that layout. No match means
   the component renders inline. Nothing is wired, and after spawn the app never writes a
   component's state.
2. **The states tree is the priority ladder.** Base first, reaction states in order. The
   app is in one state at a time and takes the first its hosted components match. Never
   author an order separately: the tree is the order.
3. **Every state declares its layout as a path.** Base moods the app owns itself (a
   welcome hero on an empty conversation) nest inside the base and never enter the ladder.
4. **Each layout owns its widths.** `appWidth` is a named size from the project's app
   sizes, once per panel, never on a layout root, never guarded. Nothing in the manifest
   sizes the app.
5. **Surfaces select by `state`.** A reaction layout's slot selects `where: { field:
   state, eq: <name> }`, never by type or id. Input tools (a composer, a form, a picker)
   are app chrome and never arrive as a component state.
6. **Meta is ranked.** A home or fallback app never lists its siblings' jobs.
   [Node discoverability](https://docs.unoverse.ai/nodes/node-discoverability.md).

## Workflow

1. Read the Apps page and any app in the workspace.
2. Write the envelope with its states tree, base first.
3. Write one layout per state; shared chrome once in `components/`, included by each.
4. Write the manifest: description, `whenToUse`, category, input schema, and the binding
   to the workflow it owns. Without a real binding the app is not done.
5. `unoverse lint`, preview in **studio** with the state switcher, `unoverse deploy studio`.

## Things that go wrong

| Symptom | Cause |
|---|---|
| A card never lifts into the app | The app has no state of the name the card writes |
| The page jumps to a stale lower state | A higher state released; the base should have won. Check the tree order |
| Lint rejects a width | Raw CSS, a guard on it, or a width on a layout root |
