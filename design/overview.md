---
sidebarTitle: "Overview"
title: "Design"
---

Design the interfaces your Agents speak through: cards, forms, documents and whole apps.
You write each one once, in YAML, and every channel renders it natively.

You never write React, SwiftUI or Compose. A definition is data, so the same file draws a
card on your website, in your iOS app, in ChatGPT and in Claude.

## What you author

Four kinds of file, all YAML, all under `design/<your-org>/`.

| | What it is | Where it lives |
|---|---|---|
| **Component** | One piece of interface an Agent can send into a conversation: a card showing a booking, a form, a chart | `components/<name>/` |
| **App** | A whole surface with its own layouts and states, opened by an Agent instead of placed in the flow | `apps/<name>/` |
| **Atom** | A shape two components share, composed in rather than copied: a button, a badge, a card frame | `design/marketplace/atoms/` |
| **Styles** | Your brand: the colour, type and spacing values every definition resolves against | `styles/` |

An atom is authoring-time only. The server expands it before it is served, so nothing
downstream has to know it existed.

## How it reaches a person

Your universe serves each definition to whichever client asked for it, over MCP. That
client's SDK draws it with the device's own native controls, and the SDK knows nothing about
your feature: it resolves token names and moves state keys.

A workflow node fills it with data. One `Component` node serves every definition you write,
so a new component is renderable the moment you save it.

Publishing a change is live everywhere on the next refresh. There is no rebuild and no app
store release, because nothing about your interface was compiled into a client.

## The rules that never bend

Four constraints shape everything on the pages that follow. They are the reason a definition
is portable at all.

**Primitives are a closed set.** `Box`, `Text`, `Each`, `Switch` and a dozen more. You
compose a chart from `Box` and `Each`; you never add a primitive. Anything a client would
have to special-case cannot travel.

**No raw values.** Never a pixel, never a hex colour, only token names. A rebrand edits
`styles/` and touches no definition.

**No expressions.** A definition cannot compute, concatenate or compare beyond equality and
truthiness. Totals and formatting are done in the node and arrive as plain fields.

**A component owns its own state.** It writes only its own slice, and the app hosting it
reacts by name. Nothing reaches into a component after it is placed.

## Next steps

<Card title="Quick start" icon="rocket" href="/design/quick-start" horizontal>
Build a component and watch it render in **studio**.
</Card>

<Card title="Coming from React" icon="repeat" href="/design/coming-from-react" horizontal>
Every framework reflex, and what it becomes here.
</Card>
