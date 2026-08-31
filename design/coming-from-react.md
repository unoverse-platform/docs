---
sidebarTitle: "Coming from React"
title: "Coming from React"
---

One law survives the move: `UI = f(state)`. It now applies at every scale, and everything
else you know becomes data.

## The concepts

Read these once. Each row is a thing you already understand, wearing its name here.

| In React | Here |
|---|---|
| A component and its props | An **interface**: a component plus the data it carries |
| `useState` inside a component | The interface's private state |
| A slot, an `Outlet`, `children` | A **template**: a place that holds interfaces and reacts to them |
| A component with `useQuery` feeding its children | A template with a `query`, fetching its own interfaces |
| React Query's `status` | The template's `loading / ready / empty`, projected for you |
| `key` | The interface's id, for its whole life |
| The router | Nothing. Opening a detail view is the interface writing its own state, and the template reacting to the name |
| A global store: Redux, Context | Nothing. All state lives in interfaces, and everything reacts locally |
| "Lift state up" | Never. Nothing writes another thing's state |

## The reflexes

Look these up while you write. Each row is a code habit and the move that replaces it.

| Your reflex | The move here | More |
|---|---|---|
| `useState(false)` for a toggle | A key you name, written into the interface's own state with `setValue`, read by `visibleWhen` | [State](/design/state) |
| `{isOpen && <Panel/>}` | `visibleWhen: { field: openPanel, eq: faq }`, or a bare field name for truthy | [State](/design/state) |
| A ternary between two views | `Switch` on one discriminant, with `cases` | [State](/design/state) |
| `useEffect` to fetch on mount or open | A declared lifecycle hook: `onStart`, or `onEnterView` for a detail view | [Lifecycle hooks](/design/lifecycle-hooks) |
| `items.map(item => <Row/>)` | `Each` with `bind: { items: items }` and a `template` subtree | [Components](/design/components) |
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
| Reaching for a widget library | Compose the closed primitive set instead | [Components](/design/components) |

## The four habit-breakers

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

**No reaching in.** An interface writes its own state and nothing else's. There is no
lifting state up, no prop drilling, no parent adjusting a child after it is placed. When
something must respond, it reacts to a state by name.

## The theory, if you want it

<div className="ref-source">
None of this is a house invention. One discriminant per axis is the discriminated-union
doctrine. Nested states with an <code>initial</code> at every level are
<a href="https://statecharts.dev/" target="_blank" rel="noopener">statecharts</a>. A
streamed interface is a spawned
<a href="https://stately.ai/docs/actors" target="_blank" rel="noopener">actor</a> that owns
its state and publishes it. Deriving rather than storing is React's own
<a href="https://react.dev/learn/choosing-the-state-structure" target="_blank" rel="noopener">Choosing the State Structure</a>.
</div>

## Next steps

<Card title="Components" icon="square-dashed" href="/design/components" horizontal>
States, layouts, and everything a component can show.
</Card>

<Card title="State" icon="workflow" href="/design/state" horizontal>
How an interface and the templates around it stay in step.
</Card>
