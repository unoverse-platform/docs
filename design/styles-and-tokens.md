---
sidebarTitle: "Styles and tokens"
title: "Styles and tokens"
---

Your brand lives in `styles/`, as the values every definition resolves against. A
definition never holds a colour, a size or a typeface. It names a token, and the theme
decides what that name means.

The SDK owns no styles either. It resolves token names against the theme your platform
serves live, at `unoverse://theme/<name>`, so a colour change is a refresh rather than a
release.

## The law

**A definition owns zero style values.** Token names only.

```yaml
# Never: raw values in a definition
style:
  padding: 12px
  color: "#4F46E5"
  fontSize: 1.25rem

# Always: token names
style:
  padding: "4"
  color: text.primary
  font: headline.sm
```

Three rules follow from it:

- **No `px`, `rem`, `em` or `#hex`** in any component, atom, template or app. The deploy
  lint scans for exactly this and blocks ([Validate and ship](/design/validate-and-ship)).
- **Sizes use the space scale.** Step N is N × 0.25rem, so `width: "8"` is 2rem. Only real
  steps exist, and an invented one such as `"26"` is not rounded: it falls through as
  broken CSS and the element silently reverts to auto sizing. [Scales](/reference/scales)
  lists every step.
- **Never invent a component-named token** such as `cardMin` or `wizardWidth`. If the
  scale genuinely lacks a step, extend the scale in `styles/` rather than smuggling a
  value into a definition.

**Page widths have names**, in `semantic/layout.yaml`: `compact`, `narrow`, `reading`,
`page` and `wide`. They are aliases onto the same scale, so a cap reads as what it is.
Use a name for a page-level cap on `maxWidth`, `hideBelow` or `stackBelow`, and a scale
step for an element's own size. An image tile is not a page.

Brand and dark-mode swaps must touch `styles/` alone, and one raw hex in one definition
breaks that guarantee for the whole project.

## Style keys

The set of style keys is closed too. `padding`, `direction`, `radius`, `hover` and the
rest are the neutral intents the SDK interprets, and the contract every renderer
implements: web today, and iOS, Android and Flutter as those SDKs land.

An unknown key is ignored by every renderer, so it is always a typo such as `colour`, or a
web-ism that would never port, such as `backdropFilter` or `gridTemplateColumns`. The
schema squiggles it as you type and the deploy lint errors on it, including inside `hover`,
`active` and `when[].apply`.

A design that genuinely needs an intent the vocabulary lacks is a platform conversation,
because every renderer has to implement it. It is never a definition-side workaround.

## Layout

Equal splits need nothing but a column count. Two children in a two-column grid are halves,
and four in a four-column grid are quarters.

```yaml
style:
  columns: "2"
  gap: "4"
```

**`span` is for unequal splits.** Put a twelve-column grid on the container and let each
child say how many columns it covers, so 6 is a half, 4 a third and 3 a quarter:

```yaml
type: Box
style:
  columns: "12"
  gap: "4"
children:
  - type: Box
    style:
      span: "8"          # two thirds
  - type: Box
    style:
      span: "4"          # one third
```

Use the grid rather than percentage widths in a flex row. A grid subtracts its own gaps
from the columns, so spans can never overflow, while `width: 50%` twice plus a gap always
does.

**Stacking is automatic.** A spanning child gives up its span and takes the whole row once
the grid runs out of space, so four quarter-width cards become four full-width cards,
stacked. The threshold is `grid.stackBelow` in `semantic/grid.yaml`, and one grid can
override it inline with `stackBelow`.

It measures the grid, not the browser window. A component reacts to the space it was
actually given, so the same component stacks correctly in a narrow rail and lays out wide
in a full panel, on any device. That is the same mechanism as `hideBelow` and `hideAbove`,
and it is why there are no device breakpoints anywhere in `design/`.

## Atoms

A token stops a value being repeated. An **atom** stops a combination of them being
repeated. If several components draw the same card, the card's style is written once and
composed with `Ref`:

```yaml
# design/marketplace/atoms/card.yaml: the shape, once
name: card
root:
  type: Box
  style:
    direction: column
    gap: "1"
    padding: "4"
    background: surface.base
    border: subtle
    radius: md
```

```yaml
# any definition: compose it, and layer on what is local to this use
type: Ref
ref: card
style:
  span: "3"
```

**The `Ref`'s own style merges over the atom's**, so a definition keeps the shared look
and still overrides one thing, a tighter padding or no border, without forking the atom.
The atom is the look, and the `Ref` is this instance's exceptions. Reach for a new atom
the moment a second component needs the same combination, and never copy the block.

A `Ref` also composes a whole flat component, which is how a shared piece of interface
travels rather than a shared look. What it inlines reads the host's data, because an
embedded piece has no slice of its own, so the piece's starting values come with it. The
host's own values win on any key it declares, and the piece's public state never travels,
because arriving somewhere is the host's decision.

## The token layers

<Tree>
  <Tree.Folder name={<><b>base</b> <span className="tree-note">raw scales: the only place raw values exist</span></>} defaultOpen>
    <Tree.File name={<><b>color.yaml</b> <span className="tree-note">palettes</span></>} />
    <Tree.File name={<><b>spacing.yaml</b> <span className="tree-note">the space scale</span></>} />
    <Tree.File name={<><b>typography.yaml</b> <span className="tree-note">font scales</span></>} />
    <Tree.File name={<><b>radius.yaml</b> <span className="tree-note">and shadow, border, motion</span></>} />
  </Tree.Folder>
  <Tree.Folder name={<><b>semantic</b> <span className="tree-note">named meanings, built from base</span></>} defaultOpen>
    <Tree.File name={<><b>text-styles.yaml</b> <span className="tree-note">headline.lg, body.sm, named by role</span></>} />
    <Tree.File name={<><b>layout.yaml</b> <span className="tree-note">page widths by name</span></>} />
    <Tree.File name={<><b>grid.yaml</b> <span className="tree-note">when a columns grid stacks</span></>} />
    <Tree.File name={<><b>app-sizes.yaml</b> <span className="tree-note">chat, rail, panel</span></>} />
    <Tree.File name={<><b>prose.yaml</b> <span className="tree-note">and fonts, icons, skeleton, keyframes, root</span></>} />
  </Tree.Folder>
  <Tree.Folder name={<><b>themes</b> <span className="tree-note">brand and dark-mode swaps</span></>} defaultOpen>
    <Tree.File name="light.yaml" />
    <Tree.File name="dark.yaml" />
  </Tree.Folder>
</Tree>

| Layer | Answers | Definitions may reference it? |
|---|---|---|
| **base** | What values exist | No, never directly |
| **semantic** | What things mean, such as `text.primary` and the space steps | Yes. This is your vocabulary |
| **themes** | What this brand or mode maps them to | No. Selected at runtime, not referenced |

Definitions speak semantic. Themes remap semantic onto base per brand or mode, and a
theme-contract guard keeps the names consistent, so every theme satisfies every definition.

Each project gets its own complete copy of this set, which is why two projects can take
different looks from the same design-system component without either one forking it.
`unoverse create` scaffolds the set, so rebranding is editing values rather than inventing
structure.

### Standard app sizes

`semantic/app-sizes.yaml` holds the named widths an app's `appWidth` references
([Apps](/design/apps)). The starter set:

| Name | Starter value | Meant for |
|---|---|---|
| `chat` | `min(100vw, 680px)` | The core conversational surface, a panel that is always open |
| `chat-slim` | `min(100vw, 480px)` | The narrow chat used when a panel is open beside it |
| `rail` | `min(100vw, 360px)` | A narrow stacked-cards slide-out |
| `panel` | `min(100vw, 600px)` | A full detail or form slide-out |

Every size carries a viewport ceiling, so it is the full designed width on desktop and
never wider than the screen on a phone. Names are optional, since raw CSS in `appWidth` is
valid, but a name keeps every app in the project on one scale and makes retuning a single
edit. These values are raw host-facing CSS on purpose: they size the app's outer panel,
which the embedding page applies, and they are never inner styles.

## Typography

All type edits happen in your project's `styles/`. See the whole system live in
**studio**'s Styles screen: every role as a specimen, with your overrides marked and
everything else inherited from the design-system foundation.

<Frame caption="Typography in studio: each role as a live specimen. A pencil marks an override; the rest is inherited.">
  <img src="/images/design/design-system-styles.png" alt="studio's Styles screen showing typography roles as live specimens, each with its resolved family, size, weight and line height" />
</Frame>

There are three places to edit, and which one you want depends on what you are changing.

**To change a typeface, override a family token** in `styles/base/typography.yaml`. There
are four, and most rebrands touch exactly one:

| Token | Sets |
|---|---|
| `font.family.display` | Every heading. The one token a rebrand usually edits |
| `font.family.sans` | Body copy, and everything not otherwise named |
| `font.family.prose` | Long-form headings. Defaults to the display face, so override it when your display face cannot carry a page of copy |
| `font.family.mono` | Code |

**To load a webfont, list its stylesheet** in `styles/semantic/fonts.yaml`. The SDK injects
one `<link>` per URL, so declaring the family and loading the file are two halves of one
edit:

```yaml
fonts:
  stylesheets:
    $value: [ "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" ]
```

**To retune sizes, weights and spacing, edit the composed roles** in
`styles/semantic/text-styles.yaml`. A definition writes a role, and the role composes
family, size, weight, line-height and letter-spacing from the base scale, so retuning the
role retunes every use of it:

```yaml
# a definition asks for a role
style:
  font: headline.md
```

```yaml
# and the role composes the primitives, in semantic/text-styles.yaml
headline:
  md:
    $value:
      fontFamily: "{font.family.display}"
      fontSize: "{font.size.headline.md}"
      fontWeight: "{font.weight.semibold}"
      lineHeight: "{font.lineHeight.headline}"
```

A family, size or weight value never appears in a definition, because `font: <role>` is the
whole typographic vocabulary a definition has. The generic `size` and `lineHeight` keys
keep the flat `xs` to `5xl` scale for the rare case that is not a role.

## Next steps

<Card title="Lifecycle hooks" icon="refresh-cw" href="/design/lifecycle-hooks" horizontal>
A component that fetches its own data.
</Card>

<Card title="Scales" icon="ruler" href="/reference/scales" horizontal>
Every space step, page width and app size, with what it resolves to.
</Card>
