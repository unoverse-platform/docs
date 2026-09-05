# Playbook: templates

**Read first:** [Templates](https://docs.unoverse.ai/design/templates.md): the three words,
the director, and how an app places one. Everything in the component playbook applies.

**Exemplars:** `grid-page` and `email-digest` in the base set at
[marketplace/definitions](https://github.com/unoverse-platform/marketplace/tree/main/definitions).

## The rules that bite

1. **A template arranges sections a delivery fills.** A component presents one thing; a
   template arranges many. If it presents one thing, it is a component.
2. **One folder grammar.** `<name>.yaml` is `type: template` plus `states:`, each state
   naming its layout path, first is the base. `manifest.yaml` is discovery meta only.
   `components/` holds the template's own parts as flat files with no manifest.
3. **Every section is one of three words.** `static:` is placed as designed.
   `copywriter:` is written into through its briefs, so the part must carry them.
   `director:` is decided from what streams in. The Templates page defines each.
4. **Never name a component in a director section.** The delivery decides what arrives.
   A base-set template carries no client words.
5. **`pick` is the one cap word.** Machine-enforced. Any other cap spelling is retired and
   a lint error.
6. **Never author the wire primitives.** No slot, select or where in a template: the three
   words compile to them at serve time.
7. **Standard state names `grid` and `page`.** Every card declares both, so any card matches
   any template with no mapping.
8. **Meta is ranked.** [Node discoverability](https://docs.unoverse.ai/nodes/node-discoverability.md).

## Workflow

1. Read the Templates page and one exemplar.
2. Write the envelope and states, then one layout per state using the three words.
3. Put template-only parts in `components/`, flat, unprefixed.
4. Write the manifest: description, `whenToUse`, category, version. Nothing else. Quote
   any string holding a colon.
5. `unoverse lint`, preview in **studio** at several widths, `unoverse deploy studio`.

## Done means

- Every section is one of the three words, and no component is named under a director
- No client words, no retired spellings
- Copywriter sections link parts that carry briefs
