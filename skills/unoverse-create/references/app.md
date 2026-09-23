# Playbook: apps

**Read first:** [Apps](https://docs.unoverse.ai/design/apps.md), then
[State](https://docs.unoverse.ai/design/state.md). Fields:
[manifest](https://docs.unoverse.ai/reference/manifest.md),
[scales](https://docs.unoverse.ai/reference/scales.md) for app sizes.

Apps are always a project's own; none ship in the base set. Your exemplar is any app already
in the workspace, and the anatomy on the Apps page.

## The rules that bite

1. **An app is a layout with places.** It has ONE state, and its layout declares each
   `Place` (`name`, `holds: one | many`, `appWidth`, an optional `frame` with a bare
   `ComponentSlot`). It never matches state names, never orders states, and never decides
   what is shown. The screen fills the places; an empty place draws nothing.
2. **Declare every place your project's interfaces name.** A component's state says where
   it goes (`place: rail`, `place: main`); an app missing that place sends it into the
   conversation, which a voice app does not draw. `chat`, the conversation, every app has.
   The lint refuses a missing place by name.
3. **No slot claims by state.** A `ComponentSlot` with `select.where` on `state` is the
   retired ladder and a lint error in an app with places, as is a second app state.
4. **Moods are not states.** A welcome hero on an empty conversation, a call's phases:
   `visibleWhen` in the one layout.
5. **Each layout owns its widths.** `appWidth` is a named size from the project's app
   sizes, once per panel or place, never on a layout root, never guarded. Nothing in the
   manifest sizes the app, and the manifest carries no `layout:`.
6. **Input tools are app chrome.** A composer, a form, a picker never arrive as a
   component state.
7. **Meta is ranked.** A home or fallback app never lists its siblings' jobs.
   [Node discoverability](https://docs.unoverse.ai/nodes/node-discoverability.md).

## Workflow

1. Read the Apps page and any app in the workspace.
2. Write the envelope: one state, one layout.
3. Write the layout: the core (conversation or call), then the places, laid out against
   each other. Shared chrome goes once in `components/`.
4. Write the manifest: description, `whenToUse`, category, input schema, and the binding
   to the workflow it owns. Without a real binding the app is not done.
5. `unoverse lint`, preview in **studio**, `unoverse deploy studio`.

## Things that go wrong

| Symptom | Cause |
|---|---|
| A card shows in the conversation instead of the rail | Its state's `place:` names a place this app does not declare, or it names none |
| A voice call shows nothing when a card is opened | The voice app is missing the place that state names |
| An opened card never leaves the rail | Its `page` state names no place, or names the same one as `grid` |
| Lint rejects a width | Raw CSS, a guard on it, or a width on a layout root |
