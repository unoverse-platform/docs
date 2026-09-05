# Playbook: components and atoms

**Read first:** [Components](https://docs.unoverse.ai/design/components.md), then
[State](https://docs.unoverse.ai/design/state.md). Fields:
[manifest](https://docs.unoverse.ai/reference/manifest.md),
[primitives](https://docs.unoverse.ai/reference/primitives.md),
[style keys](https://docs.unoverse.ai/reference/style-keys.md).

**Exemplar:** the base set at
[marketplace/definitions/components](https://github.com/unoverse-platform/marketplace/tree/main/definitions/components).
Copy the closest one's folder shape.

## The rules that bite

1. **A component is data plus a state tree.** Public states are the top level of
   `states:` and are the app's whole vocabulary. Steps nest privately. The gate before
   adding any public state: would a hosting app rearrange the page for it? No means it
   nests. [State](https://docs.unoverse.ai/design/state.md) has the model.
2. **Each state declares its layout as a path.** `layout: layouts/<file>`, always. No
   root unless it is real chrome: the compiler synthesises the state switch.
3. **Three homes for what it shows.** Static content is a literal in the layout. Starting
   values of keys it writes go in `values:`, scalars only. Workflow data is a prop with
   `input: true`. Prop names are the data contract: never invent one; use the writer
   vocabulary in [Interface data](https://docs.unoverse.ai/design/interface-data.md).
4. **Start flat.** A simple card is one file with a `root`. Structure is earned: a
   manifest when something discovers it, `layouts/` when states own arrangements.
5. **A field the AI fills carries a `brief`** on the element that renders it, beside its
   `bind`. Never in the manifest, never a separate file.
   [Components: briefing descriptions](https://docs.unoverse.ai/design/components.md).
6. **A component fetches its own data through lifecycle hooks**, declared in the manifest,
   never in code. [Lifecycle hooks](https://docs.unoverse.ai/design/lifecycle-hooks.md).
7. **Tokens only.** A raw value or an invented space step is a lint error.
   [Styles and tokens](https://docs.unoverse.ai/design/styles-and-tokens.md).
8. **Meta is ranked.** `whenToUse` in the user's own words, outcome first, disqualify by
   property, never name a sibling.
   [Node discoverability](https://docs.unoverse.ai/nodes/node-discoverability.md).

## Workflow

1. Read the exemplar and the two pages above.
2. Declare the state tree: public states on top, steps nested, each with its layout path.
3. Write the envelope, the manifest if it is discovered, the layouts.
4. `unoverse lint`, zero errors. Preview in **studio**: the state switcher reads your
   tree, and a non-initial public state previews full-bleed. If a step you meant as an
   in-place swap renders edge to edge, you promoted it. Nest it.
5. `unoverse deploy studio`.

## Things that go wrong

| Symptom | Cause |
|---|---|
| A bound field renders the mock in the preview and nothing live | The prop name is not one the source carries |
| A projected field renders nothing in the preview | Declare it as a prop with a preview default too |
| Lint says the root restates the tree | Delete the root; the switch is synthesised |
| A state you meant as a step previews full-bleed | It is public. Nest it under the state it belongs to |

[Troubleshooting](https://docs.unoverse.ai/design/troubleshooting.md) has the rest.
