---
sidebarTitle: "How it works"
title: "How it works"
---

A definition is data, so it can travel. That one property is where every rule in this
section comes from.

## What you write, and what draws it

You author YAML definitions and token files. Nothing you write is compiled, bundled or
shipped inside a client.

Each client has an SDK that draws your definition with that platform's own native controls.
The SDK hardcodes no feature, no style and no UI concept. It resolves token names and moves
state keys, and that is the whole of it.

Between the two sits your universe, which serves each definition over MCP as a resource with
a `unoverse://` address. Clients subscribe to those resources, so an update notification is
how a change reaches a running app. The same mechanism serves themes, at
`unoverse://theme/<name>`.

| What this buys you | How you feel it |
|---|---|
| No release cycle | Edit a definition or a token, and every channel updates on refresh |
| One definition, every platform | The same file draws on web today, and natively on iOS, Android and Flutter as those SDKs land |
| Agents can drive interface | Because UI is data, a workflow can select it, fill it and update it while it runs |
| A rebrand is a data change | Every visual value is a token, so a theme swap touches `styles/` alone |

## The closed primitive set

Definitions compose from these and nothing else. Adding to the set is a change to every SDK,
so a guard test fails the build on any attempt.

| Group | Primitives |
|---|---|
| Structure | `Box` `Stack` `Row` `Column` `Each` `Switch` `ComponentSlot` `Timeline` |
| Leaves | `Text` `Image` `Button` `Input` `Markdown` `Skeleton` `Icon` |
| Helpers | `Ref` to use an atom, `$include` to pull in a sibling file |
| Conditions | `eq` `ne` `in`, and a bare field name for truthy |

The instinct this frustrates is reaching for a `Chart`, an `Accordion` or a `Carousel`.
Compose them instead: bars are `Box` inside `Each`, and an accordion is `visibleWhen` on a
key you named. Something genuinely uncomposable is a platform conversation, not a definition
you write around.

## One interaction path

The SDK owns every message that moves. You never build transport.

| What happens | How it travels |
|---|---|
| A user sends a message | `tools/call` on the app's trigger tool, fire and forget |
| A form or wizard answers | A native MCP elicitation, resolving the call the Agent is waiting on |
| Results come back | The component stream, never the call result |
| UI state arrives | Run-scoped messages on the MCP `/stream` |

A host must never hand-roll its own send, its own state push or its own message shape. Every
consumer shares the one path: **studio**, a native app, an external MCP client. A channel
that needs something the path does not do is a gap to raise.

Voice is the one exception, and it is not yours to wire. Audio frames travel a separate SDK
socket because binary audio cannot ride the same lane. [State](/design/state) covers what
that projects into your scope.

## How a component reaches a conversation

Four routes, and every one ends the same way: the SDK draws your definition. Which route
delivered it tells you where the data came from, and nothing else.

| Route | Where the data comes from | Workflow involved |
|---|---|---|
| A workflow-bound app | The workflow the app names in its manifest | Yes |
| A streamed component | The running workflow, emitting into the conversation mid-run | Yes |
| A self-contained component app | The component itself, which carries its own data | No |
| A node-hydrated component | A **spatial** data node that fills a card shell it points at | No |

The last two are discovered rather than pushed. A component is never a callable thing in its
own right. What an Agent discovers is an ordinary MCP app, and an ordinary `tools/call`
returns a result carrying the interface.

How a component is **shown** is a separate question from how it arrived, and the answer is
the same for all four. The component owns a public state; the app hosting it reacts to that
state by name. [State](/design/state) is that contract in full.

## Each org is its own endpoint

An org is a self-contained connector, so a client can hold one org without seeing the rest.

```
https://api.<domain>/mcp          every org
https://api.<domain>/mcp/<org>    that org alone
```

Exactly one app in an org sets `default: true` in its manifest, marking the org's front
door. The endpoint tags that tool so a client knows which app to open first. Lint allows one
per org.

MCP is pull-based, so nothing opens on connect. Our SDK reads the flag and opens the home app
immediately; a foreign host such as ChatGPT surfaces it when the user first engages.

## Studio is not a harness

**studio** is another MCP client. It subscribes to the same resources, receives the same
component stream, and runs the same renderers as production.

So hot reload is not a development trick, it is the resource subscription that live-updates
production too. And a component that works in **studio** works in production, because there
is no second path for it to work differently on.

## Next steps

<Card title="Coming from React" icon="repeat" href="/design/coming-from-react" horizontal>
Every framework reflex, and what it becomes here.
</Card>

<Card title="Components" icon="square-dashed" href="/design/components" horizontal>
States, layouts, and everything a component can show.
</Card>
