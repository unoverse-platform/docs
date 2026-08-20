---
sidebarTitle: "Styles & Tokens"
title: "Styles & Tokens"
---

**LAW 1: definitions own ZERO style values. Token names only.**

The SDK renderer owns no styles either: it only *resolves* token names against the theme served live from the platform (`unoverse://theme/<name>`, an MCP resource, never baked into a bundle). A color change is a refresh, not a release.

---

## The law

```yaml
# ❌ NEVER: raw values in a definition
style: { padding: 12px, color: "#4F46E5", fontSize: 1.25rem }

# ✅ ALWAYS: token names
style: { padding: "4", color: text.primary, font: headline.sm }
```

- No `px` / `rem` / `em` / `#hex` anywhere in any component, atom, or template definition. Studio's publish lint scans for exactly this and blocks ([08](/design/validate-and-ship)).
- Sizes use the **space scale** (`"width": "8"` = 2rem, Tailwind-style: step N = N × 0.25rem), and only **real steps**: `0 1 1.5 2 3 4 5 6 7 8 10 12 16 20 24 28 40 50 75 90 100 120 140 160 180 200` (+ `full`/`auto`). An invented step (`"26"`, `"3.5"`) is NOT rounded: it falls through as broken CSS and the element silently reverts to auto sizing. Studio's publish lint rejects off-scale values.
- **Page widths have NAMES** (`semantic/layout.yaml`): `compact` 30rem · `narrow` 35rem · `reading` 40rem · `page` 45rem · `wide` 50rem. They are aliases onto the same scale, so `maxWidth`/`hideBelow`/`stackBelow` read as what they are (`"maxWidth": "reading"`, not `"160"`). **The rule, so one value never gets two spellings:** a PAGE-level cap uses a name; an ELEMENT's own size (an image tile's height, a card's max) stays a scale step. An image tile is not a page.
- ❌ No invented component-named tokens (`cardMin`, `wizardWidth`): use the generic scale steps. If the scale genuinely lacks a step, extend the scale in `styles/`, don't smuggle a value into a definition.

## Style KEYS are closed too: the cross-platform contract

It's not just values: the set of style **keys** (`padding`, `direction`, `radius`, `hover`, …) is a closed vocabulary, exactly the neutral intents the SDK style interpreter maps, and the contract every renderer (web today; iOS, Android, React Native, Flutter as they land) implements. An unknown key is ignored by **every** renderer, so it is always a typo (`colour`) or a web-ism that would never port (`backdropFilter`, `gridTemplateColumns`).

Both the schema (editor squiggle) and Studio's publish lint (error) enforce the key set, including inside `hover`/`active` and `when[].apply`. If a design genuinely needs an intent the vocabulary lacks, that's a platform conversation (a new key every renderer must implement): never a definition-side workaround.

**Why so strict:** brand and dark-mode swaps must touch `styles/` only. One raw hex in one definition breaks that guarantee for the whole org.

---

## The grid: `columns` + `span`

Equal splits need nothing but a column count. Two children in a two-column grid are halves; four in a four-column grid are quarters.

```yaml
style: { columns: "2", gap: "4" }   # two halves
style: { columns: "4", gap: "4" }   # four quarters
```

**`span` is for UNEQUAL splits.** Put a 12-column grid on the container and let each child say how many columns it covers. 6 is a half, 4 a third, 3 a quarter.

```yaml
type: Box
style: { columns: "12", gap: "4" }
children:
  - { type: Box, style: { span: "8" } }   # two thirds
  - { type: Box, style: { span: "4" } }   # one third
```

Use the grid rather than percentage widths in a flex row. A grid subtracts its own gaps from the columns, so spans can never overflow; `"width": "50%"` twice plus a gap always does.

### Stacking is automatic

A spanning child gives up its span and takes the whole row once the grid runs out of space, so four quarter-width cards become four full-width cards, stacked. Nothing to author.

The threshold is `grid.stackBelow` in `semantic/grid.yaml` (starter: `space.120`, 30rem). Override it for the whole org there, or for one grid inline:

```yaml
style: { columns: "12", stackBelow: "160" }   # hold the shape until 40rem
```

**It measures the grid, not the browser window.** A component reacts to the space it was actually given, so the same component stacks correctly in a 360px rail and lays out wide in a full panel, on any device. This is the same container-query mechanism as `hideBelow` / `hideAbove`, and it is why there are no device breakpoints anywhere in `design/`.

## A shared look belongs in an atom, not in every component

If several components draw the same card, the card's style is written once, in an atom, and composed by `Ref`. Repeating `background` + `border` + `radius` + `padding` in ten definitions is the same duplication LAW 1 exists to prevent, one level up: a token stops a value being repeated, an atom stops a *combination* of them being repeated.

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
# any component: compose it, and layer on what is local to this use
{ type: Ref, ref: card, style: { span: "3" }, children: [ … ] }
```

**The `Ref`'s own `style` merges OVER the atom's**, so a component keeps the shared look and still overrides one thing (a tighter padding, no border) without forking the atom. That is the cascade: **atom = the look, `Ref` = this instance's exceptions.** Reach for a new atom the moment a second component needs the same combination; never copy the block.

---

## The token layers

```
design/<project>/styles/
├── base/        # raw scales: the only place raw values EXIST
│   ├── color.yaml        # palettes
│   ├── spacing.yaml      # the space scale (the closed step set: see LAW above)
│   ├── typography.yaml   # font scales
│   └── radius.yaml / shadow.yaml / border.yaml / motion.yaml
├── semantic/    # named meanings, built FROM base
│   ├── text-styles.yaml  # headline.lg, body.sm… (referenced via "font")
│   ├── fonts.yaml / icons.yaml
│   ├── layout.yaml       # PAGE WIDTHS by name: compact · reading · page · wide
│   ├── grid.yaml         # grid.stackBelow: when a columns grid stacks
│   ├── app-sizes.yaml    # STANDARD APP SIZES: chat · rail · panel (see below)
│   └── prose.yaml / skeleton.yaml / keyframes.yaml / root.yaml
└── themes/      # brand / dark-mode swaps
    ├── light.yaml
    └── dark.yaml
```

| Layer | Answers | Definitions may reference? |
|---|---|---|
| **base** | "what values exist" | ❌ never directly |
| **semantic** | "what things mean" (`text.primary`, `surface.base`, space steps) | ✅ this is your vocabulary |
| **themes** | "what this brand/mode maps them to" | ❌ selected at runtime, not referenced |

Definitions speak **semantic**. Themes remap semantic → base per brand or mode; a theme-contract guard keeps token names consistent so every theme satisfies every definition.

### Standard app sizes (`semantic/app-sizes.yaml`)

The named width blocks a template's `appWidth` can reference ([05: Sizing](/design/templates)). The starter set:

| Name | Starter value | Meant for |
|---|---|---|
| `chat` | `min(100vw, 680px)` | the core conversational surface: a panel that is always open |
| `chat-slim` | `min(100vw, 480px)` | the narrow chat used when a voice panel/focus surface is open beside it |
| `rail` | `min(100vw, 360px)` | a narrow stacked-cards slide-out |
| `panel` | `min(100vw, 600px)` | a full detail/form slide-out |

Every size carries a **viewport ceiling** (`min(100vw, …)`): the full designed width on desktop, never wider than the screen on mobile. (Panels side-by-side can still exceed a phone's width together: the dedicated mobile layout pass will decide stacking/overlay behavior; the ceiling keeps each panel individually safe until then.)

Names are **optional**: raw CSS in `appWidth` is always valid, but prefer them: every template in the org stays on the same scale, and retuning a size is one edit here. Add org-specific names freely (the linter validates that any name a template uses is declared). Unlike every other token home these values are raw host-facing CSS on purpose: they size the app's outer panel, which the embedding page applies, they are never inner styles.

---

## Org scoping

- **Components live in TWO tiers.** The design system (the installed marketplace package: generic, universal: cards, charts, media) is shared by every org and references token *names* only. An **org component** (`design/<project>/components/`: the client's own microapp: their finder, their page) is **org-private**: it belongs to that client and is served under their org. Names are unique within a tier, and an org never shadows a design-system name (lint-enforced), so a bare reference resolves the design system or a uniquely-named org component; two orgs sharing a name each address theirs as `<org>/<name>`.
- **Atoms are universal and authoring-time only**: `design/marketplace/atoms/`, one copy; the server expands every `Ref` before serving (atoms are never served or enumerable).
- **Templates and styles are org-scoped**: `design/<project>/`. Each org gets its own complete token set and templates. There are **no overlays**: if two orgs need different looks from the *same* universal component, that difference is 100% in their `styles/`. A component only becomes an org component when it IS the client's product, not to restyle a shared one.

Starting a new org: copy the neutral baseline and re-token it

```bash
# Studio: New Project: the scaffold includes a complete copy of the default token set
```

(Every project starts from the same default set, so rebranding is editing values, never inventing structure.)

---

## Styling checklist

- [ ] Zero raw values in any definition (linter enforces)
- [ ] Only **semantic** token names referenced (`text.primary`, not a palette entry)
- [ ] No component-named tokens invented
- [ ] New brand/mode = a new `themes/` file, zero definition edits
- [ ] Theme keeps the full token contract (guard test)
- [ ] Multi-column layout uses `columns` (+ `span` when unequal), never percentage widths in a flex row
- [ ] A look two components share lives in an atom, composed by `Ref`, not copied

---

**Next:** [06b, **Lifecycle Hooks**](/design/lifecycle-hooks), a component that fetches its own data.
