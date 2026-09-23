---
sidebarTitle: "State"
title: "State"
---

Make a card expand into a full page, a wizard walk its steps, or a panel slide out beside
the conversation, without wiring any of it. An interface's state decides the face it
wears, and where on screen it is shown.

## Where state lives

| | Holds | Written by |
|---|---|---|
| **Conversation** | The turns, each turn's status, the voice transcript | The stream. Never you |
| **Interface** | One slice each: its data, its `state`, its private keys | The stream, and its own `setValue` |
| **App** | The app's own chrome: its draft, its panels | The workflow, and `setAppValue`. Never an interface |

All three are render state, rebuilt from the stream on reload. The Agent's memory is a
separate layer on the server.

An interface's public state lives under the key `state`, and it is the only thing about
that interface the outside world sees. (`view` and `defaultState` are legacy spellings the
platform still reads.)

## Faces and places

An interface writes its own `state`. The state picks which of its own layouts draws, and
it may name the place the interface is shown in:

```yaml
states:
  grid:
    layout: layouts/grid
    place: rail            # the tile sits in the app's rail
  page:
    layout: layouts/page
    place: main            # opened, it moves to the main panel
```

A card writing `state: page` moves to `main` and draws its page; its ✕ writes `grid` and
it goes back to the rail. Nothing was wired to make that happen, and the app reads none of
it: an app is a layout with places, and the screen fills them ([Apps](/design/apps)).

`chat` is the conversation, and every app has it. A state naming no place, or a place the
app does not declare, shows in the conversation.

**Nothing writes another thing's state.** An interface writes its own and nothing else's,
and the app never writes a component's: not to open it, not to close it. A card's own ✕
writes its state back, which is why there is no close logic anywhere.

**One instance, one place.** An interface is in exactly one place at a time. It is never
drawn twice, and there is no trick for hiding a second copy.

**A step never moves it.** Only a top-level state names a place. A step nested inside a
state changes what the interface draws, never where it sits.

## Showing

Nothing is shown as a side effect. A search returns data and draws nothing. Three things
change the screen:

1. **The model shows a list.** The screen becomes that list: an interface already on
   screen stays as it is, a new one appears where its state says, and anything on screen
   and not named steps aside. An empty list clears the screen; no list changes nothing.
2. **The model calls a task.** The task opens where its state says. In a place that holds
   one, what was there steps aside.
3. **The guest taps.** The interface writes its own state, and if that state names another
   place, the interface moves there.

**Stepping aside** puts the interface in the state its design gives the conversation (a
comparison's chip, whose state names `chat`), or takes it off the screen if it has none. A
page that steps aside is let go, and the next call to its task builds a new one.

The screen is one document per conversation, held by the server, so every view of the
conversation, including one that joins late or reloads, draws the same screen.

## Arrival and lifetime

An interface arrives in its first declared state, in the place that state names.

The opt-out from being replaced is `lifetime: conversation` in the manifest, for a
durable surface such as a cart or a composed page. The platform keys it by the
conversation rather than the turn, so a repeat arrival merges into the same slice instead
of replacing it. It stays until it is replaced, closes itself, or the app swaps. An app
swap is the hard boundary, and a new shell starts a new screen.

## Writing state

Two writes exist, and everything else is a native MCP call.

**`setValue`** writes the interface's own slice: its answers, its `step`, its `state`.

```yaml
action:
  type: setValue
  values:
    - key: subject
      value: "{{value}}"
    - key: step
      value: route
```

**`setAppValue`** writes the app's own chrome, such as a disclosure panel or a composer
draft. A component may write it too, because chrome drawn through `Ref` has no slice of its
own.

Sending a message is `tools/call`, and answering a waiting wizard is an elicitation. You
never build transport.

### State you cannot write

Three things are managed for you. Project them, and never simulate them.

| | You read | Never |
|---|---|---|
| Conversation and lifecycle | The derived `isStreaming` and `isEmpty` flags | Simulate them. A stuck flag is a delivery bug to report |
| Voice | `callState`, projected by the SDK's voice service | Wire audio |
| Host chrome | The embedding host's own props | Put it in the store |

An app binds the voice service by declaring `service: voice` in its manifest.

## Modelling a state tree

Three habits keep a tree honest.

**A state's layout is its shell.** The shell stays on while that state is active, and only
its nested substates are choices inside it. You never write a root for a tree, because the
compiler builds the `Switch` on `state` from the declaration, and a case never re-guards
the discriminant the tree already selected.

**Most "states" are data.** Seven wizard questions sharing one arrangement are one state
whose data changes, never seven files. The `step` value selects what the layout binds, and
only a genuinely different arrangement earns a file. Input is neither a state nor a step,
because a composer or edit form is the app's one input tool.

**The writer of a value owns where it lives.** Before nesting anything, ask what writes the
discriminant:

| Written by | It belongs to |
|---|---|
| The interface's own buttons | Private substates on its own axis, named by your design |
| A service projecting a value, such as `callState` | Substates named for those values |
| Conversation facts the app derives, such as "is it empty" | The app, as a condition-guarded mood. Interfaces react |

Borrowing another field's values leaks machinery into your design, so never model a derived
mood as component substates.

<div className="ref-source">
The model is not a house invention. One discriminant per axis is the discriminated-union
doctrine, which exists to make impossible states impossible. Nested states with a first
declared entry are <a href="https://statecharts.dev/" target="_blank" rel="noopener">statecharts</a>.
A streamed interface is a spawned <a href="https://stately.ai/docs/actors" target="_blank" rel="noopener">actor</a>
that owns its state and publishes it, and the app subscribes. Deriving rather than storing
is React's own <a href="https://react.dev/learn/choosing-the-state-structure" target="_blank" rel="noopener">Choosing the State Structure</a>.
</div>

## Next steps

<Card title="Templates" icon="layout-grid" href="/design/templates" horizontal>
The arrangements that hold many interfaces in one page.
</Card>

<Card title="Apps" icon="layout-template" href="/design/apps" horizontal>
The layout and the places your interfaces are shown in.
</Card>
