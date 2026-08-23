---
sidebarTitle: "Scales"
title: "Scales"
---

Every dimension value a definition may use, and what each one resolves to. These are read
straight from the token files, so this page is what actually ships.

<div className="ref-source">
Generated from <code>definition-1.2.schema.json</code> and the token files, so it
cannot fall behind what ships.
</div>

```yaml
style: { padding: "6", gap: "3", width: "20" }   # steps
style: { maxWidth: reading }                     # a page width by name
appWidth: rail                                   # an app size by name
```

## The space scale

One scale serves spacing and element size alike, Tailwind-style: step N is N × 0.25rem.
Only these steps exist. An invented one such as `26` is not rounded, it falls through as
broken CSS and the element silently reverts to auto sizing.

| Name | Resolves to |
|---|---|
| `0` | `0` |
| `1` | `0.25rem` |
| `2` | `0.5rem` |
| `3` | `0.75rem` |
| `4` | `1rem` |
| `5` | `1.25rem` |
| `6` | `1.5rem` |
| `7` | `1.75rem` |
| `8` | `2rem` |
| `10` | `2.5rem` |
| `12` | `3rem` |
| `16` | `4rem` |
| `20` | `5rem` |
| `24` | `6rem` |
| `28` | `7rem` |
| `40` | `10rem` |
| `50` | `12.5rem` |
| `75` | `18.75rem` |
| `90` | `22.5rem` |
| `100` | `25rem` |
| `120` | `30rem` |
| `140` | `35rem` |
| `160` | `40rem` |
| `180` | `45rem` |
| `200` | `50rem` |
| `$type` | `undefined` |
| `1.5` | `0.375rem` |

## Page widths

Aliases onto the same scale, so a page-level cap reads as what it is. The rule that keeps
one value from having two spellings: a PAGE-level cap uses a name, an element's own size
stays a step.

| Name | Resolves to | |
|---|---|---|
| `compact` | `30rem` | 30rem / 480px — the narrowest a page column gets before it stacks. |
| `narrow` | `35rem` |  |
| `reading` | `40rem` | 40rem / 640px — a comfortable measure for a column of prose. |
| `page` | `45rem` | 45rem / 720px — the standard content container. |
| `wide` | `50rem` |  |

## App sizes

The named widths an app's `appWidth` references. Each carries a viewport ceiling, so a
panel is its designed width on a desktop and never wider than a phone.

| Name | Resolves to |
|---|---|
| `chat` | `min(100vw, 680px)` |
| `chat-slim` | `min(100vw, 480px)` |
| `rail` | `min(100vw, 360px)` |
| `panel` | `min(100vw, 600px)` |

## Next steps

<Card title="Style keys" icon="palette" href="/reference/style-keys" horizontal>
The keys these values go with.
</Card>

<Card title="Styles and tokens" icon="palette" href="/design/styles-and-tokens" horizontal>
The layers behind these, and how to retune them for a brand.
</Card>
