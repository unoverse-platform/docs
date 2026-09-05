# Playbook: brand an org

**Read first:** [Styles and tokens](https://docs.unoverse.ai/design/styles-and-tokens.md).
Fields: [style keys](https://docs.unoverse.ai/reference/style-keys.md),
[scales](https://docs.unoverse.ai/reference/scales.md).

**Exemplar:** the foundation at
[marketplace/definitions/styles](https://github.com/unoverse-platform/marketplace/tree/main/definitions/styles).

## The diagnostic that matters most

If a rebrand seems to need a component edit, stop. The component has a hardcoded value,
and that is the bug. A brand changes tokens. It never changes components.

## The rules that bite

1. **Name a token to override it, omit it to inherit.** The theme is one flat registry:
   the foundation's `base/` and `semantic/`, then your org's over the top, then your
   theme file. Never copy a whole file to change one value; the untouched lines fork
   silently.
2. **Ingredients in `base/`, meaning in `themes/`.** `base/color.yaml` names what a colour
   IS (`ink`, `cobalt`), never where it is used. `themes/light.yaml` assigns roles to
   those names. A hex value in a theme file skipped a tier.
3. **A healthy pack redefines two files.** The foundation's `base/` holds border, color,
   motion, radius, shadow, spacing and typography. An org names `color` and `typography`
   and inherits the rest. A pack redefining spacing or radius is forking, not branding.
4. **The theme file does not cascade.** Only your own `themes/<name>.yaml` is read, so it
   must assign every role. Start it by copying the foundation's theme file, the one place
   copying is right.
5. **Take values from the live site's computed styles**, never from a screenshot by eye.
   Where you must invent, derive from an observed value and say so in the `$description`.

## An org is a folder

```
design/<org>/
  styles/
    base/color.yaml          brand ingredients
    base/typography.yaml     font families only
    themes/light.yaml        roles assigned to ingredients
    themes/dark.yaml
    semantic/*.yaml          deltas only
  components/                org-private components, optional
  apps/                      the org's apps, optional
```

There is no registry. The theme is served at `unoverse://theme/<org>/<name>` and an app
points at it.

## Cloning an org for a new client

1. Copy `design/<source>/` to `design/<new>/`.
2. Rename the apps: the folder and the id inside each envelope. App ids are org-qualified.
3. Component names stay. They are unique within an org, and the publish lint refuses one
   that shadows a base-set name.
4. Point every app at the new theme. A copied app still names the old org.
5. Done when a search for the old org name inside the new folder returns nothing, lint is
   clean, and the theme renders in **studio**.
