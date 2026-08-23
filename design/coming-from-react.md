---
sidebarTitle: "Coming from React"
title: "Coming from React"
---

**Every instinct you have has a home here: it's just data now.**

SDUI feels alien for about a day, because your framework reflexes reach for code. This table is the mapping. The reason it must be data: one definition renders through **every** platform's SDK, web today; iOS, Android, React Native and Flutter as those SDKs land. Anything you could only express in code would fork per platform; data can't fork.

And the state model is not a house invention: it is the orthodox stack you already know, as data. One discriminant per axis is the discriminated-union doctrine ("make impossible states impossible"); nested states with an `initial` at every level are [statecharts](https://statecharts.dev/); a streamed component is a spawned [actor](https://stately.ai/docs/actors) that owns its state and publishes it; and "derive, don't store" is React's own [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure). If anything, this is *more* React-like than most React codebases.

---

## The translation table

| Your reflex | The Unoverse move | Doc |
|---|---|---|
| `useState(false)` for a toggle | A **dev-named key** the component writes into its own slice (`setValue`), read by `visibleWhen`. Template chrome (panels, draft) uses `setTemplateValue` | [04](/design/state) |
| `{isOpen && <Panel/>}` conditional render | `visibleWhen: { field: "openPanel", eq: "faq" }` (bare field name = truthy test) | [04](/design/state) |
| `switch`/ternary between views | `Switch` `on` one discriminant with `cases` | [04](/design/state) |
| `status: 'loading' \| 'loaded'` discriminated union | the **state tree**: one `view` axis, top-level states public, nested states private, each state owning its layout | [03](/design/components) |
| An XState machine with nested states | the same shape, minus the transition machinery: no guards, no actions, no event objects; transitions are plain `setValue` writes | [04](/design/state) |
| Spawning a child actor / `useActor` | a streamed component: the host places it at spawn, subscribes to its public `view`, and never writes into it afterwards | [04](/design/state) |
| `items.map(item => <Row/>)` | `Each` with `bind: { items: "items" }` + a `template` | [03](/design/components) |
| `onClick={() => setStep("confirm")}` | `action: { type: "setValue", values: [{ key: "step", value: "confirm" }] }` | [04](/design/state) |
| A shared `<Button/>` component | An **atom** in `design/marketplace/atoms/`, used via `Ref`: `props` remaps fields, `with` passes literals | [03](/design/components) |
| Splitting a big component into files | `$include` of `layouts/`/`components/` siblings: but extraction is **earned**, not default | [03](/design/components) |
| CSS / styled-components / Tailwind values | **Semantic token names** only: `"padding": "lg"`, `"color": "text.primary"`. The values live in `design/<project>/styles/` | [06](/design/styles-and-tokens) |
| `className="hover:shadow-md"` | `style: { hover: { "shadow": "md" } }` | [06](/design/styles-and-tokens) |
| Conditional classNames by state | `style.when: [{ field: "deltaPositive", eq: true, apply: { "color": "status.success" } }]` | [04](/design/state) |
| `const total = items.reduce(…)` in render | **Computed in the workflow node**, streamed as a plain field. Definitions have no expressions: by design | [03](/design/components) |
| `fetch()` / axios / your own WebSocket | Never. The SDK owns the one MCP path (`tools/call`, elicitation, `/stream`) | [02](/design/sdui-and-mcp-apps) |
| A context/store for "is the AI typing" | Locked: derived flags (`isStreaming`, `isEmpty`) are handed to you; project them | [04](/design/state) |
| Managing the mic / audio / call state | Locked: the SDK voice service owns audio; you branch a `Switch` on the projected `callState` | [04](/design/state) |
| A new widget library / npm UI package | No. Compose the **closed primitive set**: bars are `Box`+`Each`, an accordion is `visibleWhen` | [02](/design/sdui-and-mcp-apps) |

---

## The three habit-breakers

Most confusion is one of these three, so name them up front:

1. **No expressions.** You cannot compute, concatenate, or compare beyond `eq`/`ne`/`in`/truthy. If you're missing a value, the workflow node sends it. This feels limiting for an hour and then becomes the feature: definitions stay verifiable, portable, and safe for an AI to write.
2. **No invented vocabulary.** Primitives are closed. Style **keys** are closed (the cross-platform contract: an invented key renders nowhere). Style **values** are token names. The linter and schema hold all three lines; when you hit a wall, the answer is composition or a token, not a new word.
3. **No plumbing.** State transport, streaming, voice, reconnection, turn identity: all locked inside the SDK and the MCP standard. You write what things look like and which keys they read; everything that moves data is someone else's (solved) problem.

---

**Why it's worth it:** the same file you write in [01. Quick Start](/design/quick-start) is the file a Flutter user renders natively. There is no "port to mobile" project later: that's the entire bet of the platform.

**Next:** [03, Components](/design/components).
