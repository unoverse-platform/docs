---
sidebarTitle: "Apps"
title: "Apps"
---

An app is the surface your interfaces arrive into: a chat layout, a voice screen, a
dashboard. It arranges templates and slots, and decides how the screen rearranges around
whatever arrives.

An app owns nothing. Conversation and interface data live in the store, so apps are
swappable mid-conversation.

The folder grammar is the same as every other artifact, and
[Essentials](/design/essentials) covers it. This page is what makes an app an app.

## A complete app

A chat that holds the conversation, and gives a mounted grid the rest of the screen when
cards arrive.

<CodeGroup>

```yaml acme-chat.yaml
unoverse: "1.0"
type: app
name: acme-chat
states:
  standard:                  # first declared = the base
    layout: layouts/standard
  products:
    layout: layouts/products
    preview: [ product-card, product-card, product-card ]
```

```yaml layouts/standard.yaml
# The base: the conversation, whole screen.
type: Box
style:
  direction: row
  width: full
  height: full
  overflow: hidden
children:
  - $include: components/core
```

```yaml layouts/products.yaml
# The conversation, beside a mounted template taking all remaining space.
type: Box
style:
  direction: row
  width: full
  height: full
  overflow: hidden
children:
  - $include: components/core
  - type: Template
    name: products           # the state entry this place belongs to
    template: grid-page      # what it holds
    appWidth: flex           # all remaining space, beside the core's own width
```

```yaml manifest.yaml
type: app
name: acme-chat
description: The Acme assistant for questions about products and orders.
whenToUse: Ask Acme a question, or get help with an order.
category: Assistant
binding:
  workflow: wf-acme-chat
  trigger: inputtrigger1
  autoTrigger: false
inputSchema:
  type: object
  properties:
    message:
      type: string
      description: The user's request
```

</CodeGroup>

Three things carry the model:

- **The envelope is the tree, and the manifest is the face.** States and their layouts say
  what the app is. `whenToUse`, `binding` and `inputSchema` say how the outside finds and
  calls it.
- **The binding belongs to the app.** The composer sends through the app's own workflow,
  and the states react to whatever comes back.
- **The app enters `products` because the grid holds cards.** It releases back to
  `standard` when the grid empties, and nothing writes a flag to make either happen.

## The tree

```yaml
states:
  main:                      # the base, always first
    layout: layouts/main
    states:
      welcome:               # contained: exists only inside main
        layout: layouts/main-welcome
  focus:                     # the ladder, in priority order
    layout: layouts/focus
  grid:
    layout: layouts/grid
  page:
    layout: layouts/page
```

Every state names its own drawing as a path relative to the app folder. Nothing is assumed
from the state's name, `layouts/` is only the conventional home, and subfolders are fine
for a complicated app.

**Top-level order is the priority ladder.** The base comes first, then the reaction states
in the order they should win. [State](/design/state) covers the walk that uses it.

**Nesting is containment.** `welcome` exists only inside `main`. The compiler strips a
declared base substate out of every other arrangement, so no hand-written guard has to
police it, and the first substate declared is the landing default.

**The shell is not declared.** The conversation timeline is `main`'s own content, drawn
beside the rail and the page and under focus. Declaring a state contains it, so declare
only what should exist in the base alone.

### States or moods

The rearrange rule sorts these too.

> **If an interface makes the app rearrange, it is a top-level state. If the app already
> knows and would not move, it is a mood nested in the base.**

A welcome hero on an empty conversation is a mood. A voice layout's call phases are moods.
Put them on the ladder and you break it twice: they outrank real reactions, and they draw
inside them.

## Width

> **The app is always the active state's layout total. Nothing else, ever.**

Widths are declared with `appWidth` on a panel inside a layout, normally a named size from
your `styles/semantic/app-sizes.yaml`, so the whole project stays on one scale.

```yaml
# components/core.yaml: the conversation column, always open
type: Box
appWidth: chat
```

So the width is one of a small known set by construction. The base is the core alone, a
rail layout is core plus rail, and the host animates between the totals. Nothing inside
resizes.

The rules, all enforced by lint:

| Rule | Why |
|---|---|
| A bare name must exist in your app sizes | Raw CSS and `flex` are valid too. A name is simply easier to retune |
| One declaration per panel | The panel's `appWidth` sizes its box and grows the app, so its frame declares no width |
| Never on a layout root | The root is the arrangement, and panels inside it carry the widths |
| Never `visibleWhen`-guarded | A conditional arrangement is a state with its own layout, not a guarded pane |
| An overlay declares nothing | A surface over the core never changes the app's size |

Give every layout root `overflow: hidden`, so a panel mid-slide clips at the edge rather
than scrolling.

## Three primitives only apps use

**`Timeline`** renders the conversation. You supply the user and assistant turn subtrees,
and the stream fills them.

**`Template`** mounts a template. The place says what it holds and how wide it is, and may
wrap it in a `frame` for sizing:

```yaml
- type: Template
  name: products
  template: grid-page
  appWidth: flex
```

The place only places. Everything about how the template fills, including the director's
judgment, lives in the template itself ([Templates](/design/templates)). The place claims
what the template holds, so a held interface never renders twice, and an empty template
collapses, frame included.

**`ComponentSlot`** is where individual components render, in two forms:

```yaml
# the flow slot: components render inline, the default home
- type: ComponentSlot
  select: {}

# a reaction slot: renders whichever component put the app in this state
- type: ComponentSlot
  select:
    from: all
    where:
      field: state
      eq: page
    limit: 1
```

A state's layout must contain a slot selecting that state, and a guard enforces the pair.
A slot holding one occupant gives it the frame's full height automatically, while
multi-occupant slots such as a rail keep their instances content-sized.

Never size or restyle a component from the app. A component owns its states and its size,
and the app owns only the framing.

An overlay is still normal. A wizard floating over the chat lives inside the core, claims
its state, and changes no width. Reach for a top-level state when the arrangement changes,
and keep an overlay in-core when only a layer appears.

## Voice

Declare `service: voice` in the manifest and the channel instantiates the native service,
which projects `callState` into scope. The call phases branch inside the base layouts,
typically a wide core in the base and a slim one beside a card slot.

Cards streaming in during a call are placed by the ladder exactly as in chat. Audio is
never wired in a definition.

## How an Agent finds your app

`whenToUse` is the text an Agent's search is ranked against, so it decides whether the app
is ever chosen. Getting it wrong fails silently: the app works, and is simply never picked.

| Field | Its one job |
|---|---|
| `title` | The thing itself. No project prefix, no mechanism |
| `description` | What it is, one line under 120 characters |
| `whenToUse` | The words a user would say, outcome first |
| `category` | The job's domain, never the implementation |

The trap for a general-purpose app is listing its siblings' jobs, because that vocabulary
then outranks the focused apps for their own queries. A fallback owns general help and
reaching a person, and cedes specific jobs by property without naming anything.

[Node discoverability](/nodes/node-discoverability) is the full guide, and it applies to
apps verbatim.

### The front door

Each project is a self-contained connector, so a client can hold one without seeing the
rest:

```
https://api.<domain>/mcp              every project
https://api.<domain>/mcp/<project>    that project alone
```

Exactly one app sets `default: true` in its manifest, marking the front door. The endpoint
tags that tool so a client knows which app to open first, and the lint allows one per
project.

MCP is pull-based, so nothing opens on connect. Our SDK reads the flag and opens the home
app immediately, while a foreign host such as ChatGPT surfaces it when the user first
engages.

## Next steps

<Card title="Styles and tokens" icon="palette" href="/design/styles-and-tokens" horizontal>
Your brand, as values every definition resolves against.
</Card>

<Card title="manifest.yaml" icon="book-marked" href="/reference/manifest" horizontal>
Every field an app manifest takes, with its type.
</Card>
