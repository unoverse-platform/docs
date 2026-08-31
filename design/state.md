---
sidebarTitle: "State"
title: "State"
---

Make a card expand into a full page, a wizard walk its steps, or a panel slide out beside
the conversation, without wiring any of it. Everything on screen reacts to one thing: the
state an interface is in.

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

## The one question

An interface writes its own `state`. Everything holding it then asks one question:

> **Do I have a state with that name?**

A template asks it and draws that state's shape. An app asks it and draws that state's
layout. A match activates, and no match means the interface renders inline in the
conversation.

That is the whole reaction contract, and it runs at every scale. A card writing
`state: page` opens the `page` state of whatever holds it, and nothing was wired to make
that happen.

**Nothing writes another thing's state.** An interface writes its own and nothing else's,
and the app never writes a component's: not to promote it, not to retract it, not to close
it. A card's own ✕ writes its state back, which is why there is no close logic anywhere.

**One instance, one place.** While an interface's state matches, it lifts out of the flow
into that place. It is never drawn twice, and there is no trick for hiding a second copy.
Losing the match releases it back inline.

## Arrival and lifetime

An interface arrives as data, and where it lands is the host's decision.

Its first declared state stands whenever the host has a state of that name. A card
declaring `grid` first, arriving into an app with a `grid` state, starts there. Only when
the host has no such state does the scan run: the host walks its own states in declared
order and takes the first name the interface also declares. With no overlap at all, the
interface wakes in its own first state, inline.

**A new turn resets the screen.** Every instance returns to its first state, places empty,
and the app derives its base state again. An interface whose first state suits the flow
stays in that turn's history. One with no inline face retires: visible while placed,
invisible afterwards.

The opt-out is `lifetime: conversation` in the manifest, for a durable surface such as a
cart or a composed page. The platform keys it by the conversation rather than the turn, so
a repeat arrival merges into the same slice instead of replacing it. It survives the reset
and cancellation, and stays until it is replaced, closes itself, or the app swaps. An app
swap is the hard boundary, and a new shell retires every surface, durable ones included.

## Priority

An app is in exactly one state at a time, and its tree declares the order:

```yaml
states:
  main:                    # the base arrangement, always first
    layout: layouts/main
    states:
      welcome:             # contained: exists only inside main
        layout: layouts/main-welcome
  focus:                   # the ladder, in priority order
    layout: layouts/focus
  grid:
    layout: layouts/grid
  page:
    layout: layouts/page
```

The app walks its top-level list top-down and enters the first of its states that any
hosted interface matches. One card in `focus` and seven in `grid` means the app enters
`focus`. Ties go to the most recent write. No word is special, and `focus` outranks `grid`
by list position alone.

The active state is **derived, never stored**. It is a function of what the app currently
holds, so nothing writes a focus flag anywhere.

**A delivery clears the claims below it. Your own navigation does not.** When an interface
arrives into a higher-ranked state, interfaces sitting in lower ones release and retract to
inline, so releasing the higher state lands on the base rather than a stale lower one.
Closing a finder returns you to the conversation instead of resurrecting the rail that was
open beforehand. Tapping a rail card into its page enters `page` without touching the
rail's claims, so closing that page returns you to the rail you opened it from.

Both are the same walk, with one question added: did a delivery put the winner there, or
did you?

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

A place selects what it holds by state, never by component type and never by id:

```yaml
type: ComponentSlot
select:
  from: all
  where:
    field: state
    eq: focus
  limit: 1
```

Which interface lands there follows from the match, and the most recent write wins a tie.
Many instances are fine, and the rule holds per instance: three products means three cards,
and the app decides whether that place is a flow list, one focus or a rail. Private keys
never cross, and a selector reads `state` only.

App chrome reads the same fact as `surfacedView`, the name of the active reaction state, or
empty when everything is inline. A header button reacts by name without needing a slot.

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
The arrangements that hold your interfaces and react to their states.
</Card>

<Card title="Apps" icon="layout-template" href="/design/apps" horizontal>
The shell your templates and components render inside.
</Card>
