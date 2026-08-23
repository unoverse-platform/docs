---
sidebarTitle: "Coming from React"
title: "Coming from React"
---

Every instinct you already have has a home here. It is just data now.

The state model is not a house invention. One discriminant per axis is the
discriminated-union doctrine. Nested states with an `initial` at every level are
[statecharts](https://statecharts.dev/). A streamed component is a spawned
[actor](https://stately.ai/docs/actors) that owns its state and publishes it. Deriving
rather than storing is React's own
[Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure).

## The translation table

| Your reflex | The move here | More |
|---|---|---|
| `useState(false)` for a toggle | A key you name, written into the component's own slice with `setValue`, read by `visibleWhen` | [State](/design/state) |
| `{isOpen && <Panel/>}` | `visibleWhen: { field: openPanel, eq: faq }`, or a bare field name for truthy | [State](/design/state) |
| A ternary between two views | `Switch` on one discriminant, with `cases` | [State](/design/state) |
| `status: 'loading' \| 'loaded'` | The state tree: one `view` axis, top-level states public, nested states private | [Components](/design/components) |
| An XState machine | The same shape without the transition machinery. No guards, no actions, no event objects | [State](/design/state) |
| Spawning a child actor | A streamed component. The host places it once and never writes into it again | [State](/design/state) |
| `items.map(item => <Row/>)` | `Each` with `bind: { items: items }` and an `app` subtree | [Components](/design/components) |
| `onClick={() => setStep("confirm")}` | `action: { type: setValue, values: [{ key: step, value: confirm }] }` | [State](/design/state) |
| A shared `<Button/>` | An atom, composed with `Ref`. `props` remaps fields, `with` passes literals | [Components](/design/components) |
| Splitting a big component up | `$include` of a sibling file, but extraction is earned rather than automatic | [Components](/design/components) |
| CSS, styled-components, Tailwind | Semantic token names only. The values live in `design/<org>/styles/` | [Styles and tokens](/design/styles-and-tokens) |
| `className="hover:shadow-md"` | `style: { hover: { shadow: md } }` | [Styles and tokens](/design/styles-and-tokens) |
| Conditional classNames | `style.when`, a list of conditions each applying its own style patch | [State](/design/state) |
| `const total = items.reduce(…)` | Computed in the workflow node and streamed in as a plain field | [Components](/design/components) |
| `fetch()`, axios, your own socket | Never. The SDK owns the one MCP path | [How it works](/design/sdui-and-mcp-apps) |
| A store for "is the AI typing" | Handed to you as derived flags. Project them, never simulate them | [State](/design/state) |
| Managing the mic or call state | Handed to you as `callState`. Branch a `Switch` on it | [State](/design/state) |
| Reaching for a widget library | Compose the closed primitive set instead | [How it works](/design/sdui-and-mcp-apps) |

## The three habit-breakers

Almost all early confusion is one of these.

**No expressions.** You cannot compute, concatenate or compare beyond `eq`, `ne`, `in` and
truthy. A value you are missing is one the workflow node sends. This constrains you for about
an hour, and then it is the feature: a definition stays verifiable, portable, and safe for an
AI to write.

**No invented vocabulary.** Primitives are closed, style keys are closed, and style values
are token names. An unknown style key renders nowhere on any platform, so it is always a typo
or a web-ism that would not port. When you hit the wall, the answer is composition or a new
token.

**No plumbing.** State transport, streaming, voice, reconnection and turn identity all sit
inside the SDK. You write what things look like and which keys they read.

## Next steps

<Card title="Components" icon="square-dashed" href="/design/components" horizontal>
States, layouts, and everything a component can show.
</Card>

<Card title="State" icon="workflow" href="/design/state" horizontal>
How a component and the app around it stay in step.
</Card>
