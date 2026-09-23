---
sidebarTitle: "Apps"
title: "Apps"
---

An app is the surface your interfaces are shown in: a chat layout, a voice screen, a
dashboard. It is a layout with named places, and the screen fills those places.

An app owns nothing. Conversation and interface data live in the store, so apps are
swappable mid-conversation. It never decides what is shown or where: the model shows
things, an interface's state says where it goes, and the app only draws the places.

The folder grammar is the same as every other artifact, and
[Essentials](/design/essentials) covers it. This page is what makes an app an app.

## A complete app

A chat that holds the conversation, with a rail beside it for a set of cards and a main
panel laid over the rail for the one thing opened.

<CodeGroup>

```yaml acme-chat.yaml
unoverse: "1.0"
type: app
name: acme-chat
states:
  main:                      # an app with places has ONE state
    layout: layouts/main
```

```yaml layouts/main.yaml
# The conversation, and beside it the places the screen fills.
type: Box
style:
  direction: row
  width: full
  height: full
  overflow: hidden
children:
  - $include: components/core
  - type: Box
    style:
      flex: 1
      minWidth: 0
      height: full
      position: relative
    children:
      - type: Place
        name: rail             # a set of cards
        holds: many
        appWidth: flex
        frame:
          type: Box
          style:
            height: full
            overflow: auto
          children:
            - type: ComponentSlot
      - type: Place
        name: main             # the one thing opened, over the rail
        holds: one
        appWidth: flex
        frame:
          type: Box
          style:
            position: absolute
            inset: "0"
            overflow: auto
            background: surface.base
          children:
            - type: ComponentSlot
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

Four things carry the model:

- **The envelope is the tree, and the manifest is the face.** The one state and its layout
  say what the app is. `whenToUse`, `binding` and `inputSchema` say how the outside finds
  and calls it.
- **The manifest is the single home of the app's meta and its binding.** Its Available
  switch lives in the Tasks lane ([Tasks](/design/tasks)); switched on, the app is a task
  on the map, an Agent with an interface in front.
- **The binding belongs to the app.** The composer sends through the app's own workflow.
- **The places open and close as the screen fills them.** A card whose `grid` state names
  `rail` lands in the rail; tapped, it writes `page`, which names `main`, and moves there.
  An empty place draws nothing, frame included, and nothing writes a flag to make any of
  it happen.

## Places

A `Place` is a named spot in the layout where interfaces are shown.

| Key | Meaning |
|---|---|
| `name` | The place's name. Interfaces name it in their states' `place:` |
| `holds` | `one` shows the newest interface shown into it, and a new one replaces it. `many` shows the set the last show named, in its order |
| `appWidth` | The place's width, as for any panel (see Width) |
| `frame` | Optional chrome around what it holds. Its `ComponentSlot` is where each interface draws |

How places sit against each other is the layout's business. Lay `main` over the `rail` and
an opened card covers the cards, and closing it shows them again. Lay a `focus` over
everything for a guided flow.

**The conversation is also a place, named `chat`,** and every app has it. An interface
shown into `chat` renders in the conversation under the turn that showed it, and anything
whose state names no place lands there.

**An app declares every place its project's interfaces name.** Otherwise those interfaces
land in the conversation, which a voice app does not draw. The lint refuses it, naming
the missing place.

### Where an interface goes

The first of these that speaks wins:

1. **The model's show names a place.**
2. **The interface's current state names one**, with `place:` in the component
   ([State](/design/state)).
3. Otherwise, `chat`.

The model sets the screen with a list: what it names stays or appears, and what is on
screen and not named steps aside, to its chip in the conversation or off the screen.
Calling a task shows it. A search never draws anything. [State](/design/state) covers the
rule.

### Welcome and other moods

A welcome hero on an empty conversation, or a voice layout's call phases, are moods of
the one layout, drawn with `visibleWhen` on the conversation's derived flags or the
projected `callState`. They are never states.

## Width

> **The app is always the total of its open places. Nothing else, ever.**

Widths are declared with `appWidth` on a panel inside a layout, normally a named size from
your `styles/semantic/app-sizes.yaml`, so the whole project stays on one scale.

```yaml
# components/core.yaml: the conversation column, always open
type: Box
appWidth: chat
```

So the width is one of a small known set by construction. With every place empty the app
is the core alone; with the rail open it is core plus rail, and the host animates between
the totals. Nothing inside resizes.

The rules, all enforced by lint:

| Rule | Why |
|---|---|
| A bare name must exist in your app sizes | Raw CSS is valid too. A name is simply easier to retune |
| `flex` is the SDK's own word, never a token | It means "fill the space remaining beside whatever core is open", on a slot and on a mounted template alike. A token named `flex` hard-codes one core's width and is short beside every other core: a 680px chat token left a 200px gap beside a 480px voice core |
| One declaration per panel | The panel's `appWidth` sizes its box and grows the app, so its frame declares no width |
| Never on a layout root | The root is the arrangement, and panels inside it carry the widths |
| Never `visibleWhen`-guarded | A panel that comes and goes is a place, which opens and closes as the screen fills it |
| An overlay declares nothing | A surface over the core never changes the app's size |

Give every layout root `overflow: hidden`, so a panel mid-slide clips at the edge rather
than scrolling.

## Three primitives only apps use

**`Timeline`** renders the conversation, which is the place `chat`. You supply the user
and assistant turn subtrees, and the stream fills them.

**`Place`** is a place the screen fills (see Places above).

**`ComponentSlot`** is where each interface draws inside a place's `frame`. It takes no
selector: the screen has already decided what the place holds. A slot holding one
occupant gives it the frame's full height automatically, while a place holding many keeps
its instances content-sized.

A slot that claims interfaces by state (`select.where` on `state`) is the retired
arrangement, and the lint refuses it in an app with places.

Never size or restyle a component from the app. A component owns its states and its size,
and the app owns only the framing.

## Voice

Declare `service: voice` in the manifest and the channel instantiates the native service,
which projects `callState` into scope. The call phases branch inside the layout, as moods.

Lay the places beside the call core, so the call never leaves the screen. Interfaces are
placed exactly as in chat. Audio is never wired in a definition.

## How an Agent finds your app

Nothing selects your app by name. An Agent describes the job, and the platform returns a
handful of candidates ranked on their meta, so `whenToUse` decides whether your app is ever
chosen. Getting it wrong fails silently: the app works, and is simply never picked.

| Field | Its one job | Enforced |
|---|---|---|
| `title` | The thing itself. No project prefix, no mechanism | Warning if missing, because it leads the ranked text |
| `description` | What it is: the listing subtitle, one line, 20 to 120 characters | Error at both bounds |
| `whenToUse` | The words a user would say, outcome first | Error if too short, selector-shaped or mechanism-led |
| `category` | The job's domain, never the implementation | Warning |

The ranked text is `<title>. <whenToUse> <description>`, so a missing title puts the folder
slug in front of the ranker.

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
