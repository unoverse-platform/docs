# Playbook: templates

**Read first:** [Templates](https://docs.unoverse.ai/design/templates.md): how a layout places
its parts, how a part's props decide what an Agent writes, and how an app places a template.
Everything in the component playbook applies.

**Exemplar:** `email-digest` in the base set at
[marketplace/definitions](https://github.com/unoverse-platform/marketplace/tree/main/definitions).

## The rules that bite

1. **A template is a component that holds components.** Same shape: external states that
   name where it shows (`focus`, `inline`), internal steps, props, and it can be a task.
   If it holds nothing, it is a component.
2. **A held component keeps its own state.** Hold one with a plain `Ref` to the org's
   component inside an `Each`; each item is its own instance, keyed by its id, and carries
   the component's own prop names. Its first state is its spot in the template; its detail
   is its own `page`, opened over the template. Never hold its fields in the template's `values:`, never give it a step of the
   template's, never react to its state. Not built yet: today a held component draws flat,
   so a set of things that each open goes into a place as top-level components.
   [State: inside a template](https://docs.unoverse.ai/design/state.md).
3. **One folder grammar.** `<name>.yaml` is `type: template` plus `states:`, each state
   naming its layout path, first is the base. `manifest.yaml` is the discovery meta, plus `binding: { workflow, trigger }` when a workflow works it.
   `components/` holds the template's own parts as flat files with no manifest.
4. **A layout places a part with a `Ref`.** `type: Ref` + `ref: components/<name>`, the
   same element that places anything else. The part's file name is its name on the page.
   `static:` and `director:` are retired and fail lint and load.
5. **`input` decides what an Agent writes.** In a placed part, a prop marked `input: true`
   is filled by an Agent or a workflow; `input: false` is drawn from its `default`. No
   layout element grants or withholds writing.
6. **Found things are hydrated refs.** A list of products, places or pictures is an array
   prop whose item fields all carry `hydrate:`, so each item is one `ref` the Agent picks
   and its words and picture arrive with the result. `maxItems` is the cap. A base-set
   template carries no client words.
7. **Never author the wire primitives.** No `ComponentSlot`, `select` or `where` in a
   template: a placed part compiles to them at serve time.
8. **Preview every part.** Each prop carries a realistic `preview:` (or `default:`), array
   props a list of mock items, so **studio** draws the arrangement finished.
9. **Every task has the same shape.** Steps, props (`input: true` or `false`), an input
   (the `binding`) and, when it hands answers back, an output (`outputs:` plus a button
   ending in `type: submit`). A presentation and a form differ only in the skill the Agent
   carries. [Tasks](https://docs.unoverse.ai/design/tasks.md).
10. **Meta is ranked.** [Node discoverability](https://docs.unoverse.ai/nodes/node-discoverability.md).

## Workflow

1. Read the Templates page and the exemplar.
2. Write the envelope and states, then one layout per state, placing parts with `Ref`.
3. Put template-only parts in `components/`, flat, unprefixed. Mark each prop `input: true`
   (an Agent writes it) or `input: false` (drawn as designed), and describe every one.
4. Write the manifest: title, description, `whenToUse`, category, version, and `binding`
   when a workflow works it. Nothing else. Quote any string holding a colon.
5. `unoverse lint`, preview in **studio** at several widths, then commit and push to your org repo: every universe pulls it. `unoverse deploy studio` still reaches your own universe until the org is connected to its repo.

## Done means

- Every part is placed with `type: Ref` + `ref: components/<name>`; no `static:` or `director:`
- No client words, no retired spellings
- Every prop in a placed part says `input: true` or `input: false`, and carries a description
