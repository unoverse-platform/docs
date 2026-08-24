---
sidebarTitle: "State"
title: "State"
---

Make a card expand to a full page, a wizard walk its steps, or a panel slide out beside the
conversation, without wiring any of it. A component writes only its own state, and the app
around it reacts to that by name.

If you know statecharts and the actor model you already know this. A component is a small state
machine whose states own their layouts. A streamed component is a spawned actor that publishes
its state, and the app subscribes.

## Three places state lives

| | Holds | Written by |
|---|---|---|
| **Conversation** | The turns, each turn's status, the voice transcript | The stream. Never you |
| **Component** | One slice per component: its data, its `view`, its private keys | The stream, and the component's own `setValue` |
| **App** | The app's own chrome: its draft, its panels | The workflow, and `setAppValue`. Never a component |

All three are render state, rebuilt from the stream on reload. The Agent's memory is a separate
layer on the server.

A component's public state lives under the key **`view`**, and it is the only thing about a
component the outside world sees.

## The six rules

### 1. Each state owns its layout

The component declares its states, and every state names the drawing that shows it. Top-level
states are public; anything nested is private. [Components](/design/components) covers the tree
and the rearrange rule that sorts them.

### 2. Nobody sends a state. The host places the actor

A streamed component arrives as data. Where it lands is the host's decision, in two steps.

The component's **first declared state** stands whenever the host has a state of that name. A
card declaring `products` first, arriving into an app with a `products` state, starts there.

Only when the host has no such state does the **scan** run. The app walks its own states in
declared order and takes the first name the component's public menu also has. With no overlap
at all, the component wakes in its own first state, inline.

After that, everything is forbidden. **The app never writes a component's state.** Not to
promote it, not to retract it, not to close it.

### 3. The component drives, the app reacts by name

Once it has landed, `view` changes exactly two ways, and both are the same write into the
component's own slice. Someone interacts, or the component's own chrome does it: its expanded
state carries a ✕ that sets `view` back.

Whenever `view` changes, every hosting app asks one question.

> **Do I have a state with that name?**

Match, and the app enters its own state of that name, and that state's layout draws. No match,
and rule 6 applies.

Name matching is the default and needs no ceremony. An explicit `reactsTo` on an app state is
the rare escape hatch for a vocabulary mismatch.

### 4. Declared order is the priority ladder

An app declares its own tree, and one declaration answers everything:

```yaml
states:
  main:                 # the base arrangement, always first
    states:
      welcome: {}       # contained: exists only inside main
  focus: {}             # the ladder, in priority order
  products: {}
  detail: {}
```

An app is in exactly one state at a time. When hosted components sit in different views, it
walks its top-level list top-down and enters the first of its states that **any** hosted
component matches. One card in `focus` and seven in `products` means the app enters `focus`.
Ties go to the most recent write.

No word is special. `focus` outranks `products` because of list position, and nothing else.

The app's active state is **derived, never stored**. It is a pure function of the components it
hosts, and nothing writes a focus flag anywhere.

### 5. A delivery clears the claims below it. Your hand does not

When a component **arrives** into a higher-ranked state, every component sitting in a lower one
releases its claim and retracts to inline. Releasing the higher state then lands on the base,
never on a stale lower one. Closing a finder returns you to the conversation, and does not
resurrect the rail that was open beforehand.

**Your own navigation clears nothing.** Tapping a rail card into its detail page enters
`detail` without touching the rail's claims. So closing that page returns you to the rail you
opened it from.

Both are the same walk with one question added: did a delivery put the winner there, or did
you? There is no close logic anywhere.

### 6. An unmatched view falls inline. Always

No state, a view the app has no state for, or an app with no reaction states at all, and the
component renders inline in the conversation.

**One instance, one place.** While its view matches an app state, the instance lifts out of the
flow into that state's slot. It is never painted twice, and there is no trick for hiding a
second copy. Losing the match releases it back.

## Two lifetimes

Conversation state is durable and append-only. Chat state, meaning each instance's active view
and the app's chrome, is the present interaction.

**A new turn resets the chat layer.** Every instance returns to its first state, slots
empty, and the app derives its base state. A component whose first state suits the flow returns
to it in that turn's history. A surface-only component simply retires: visible while placed,
invisible afterwards.

The opt-out is `lifetime: conversation` in the manifest, for a durable surface such as a cart or
a composed page. The platform keys it by the conversation rather than the turn, so a repeat
arrival merges into the same slice instead of replacing it. It survives the new-turn reset and
cancellation, and stays until it is replaced, closes itself, or the app swaps.

An app swap is the hard boundary. A new shell retires every surface, durable included.

## How a layout reacts

Inside an app state's layout, the slot selects by view. Never by component type, never by id.

```yaml
type: ComponentSlot
select: { from: all, where: { field: view, eq: focus }, limit: 1 }
```

Which component is intrinsic: the one whose view matches. Conflicts go to the most recent.

**Many instances are fine.** Three products means three cards, and the rule holds per instance.
The app decides how a slot lays its occupants out: a flow list, one focus, or a rail.

A component's private keys never cross, and selectors read `view` only.

For app chrome rather than slots, the same fact arrives as **`surfacedView`**: the name of the
active reaction state, or empty when everything is inline. So a header button reacts by name.

## The two writes

**`setValue`** writes the component's own slice: its answers, its `step`, its `view`. That is
the only thing a component ever writes.

**`setAppValue`** writes app state: a disclosure panel, the composer draft. A component may
write it too, because chrome drawn through `Ref` has no slice of its own. One direction still
holds, in that the button writes a key and whoever cares reacts.

```yaml
action:
  type: setValue
  values:
    - { key: subject, value: "{{value}}" }
    - { key: step, value: route }
```

Anything that is not one of these two is a native MCP call. Sending a message is `tools/call`,
and answering a waiting wizard is an elicitation. You never build transport.

## The four moves

All reactivity is `eq` / `ne` / `in` / truthy, applied four ways.

| Move | Use when |
|---|---|
| `visibleWhen` | A small thing appears or disappears |
| `Switch` | A whole view swaps: public states, wizard steps |
| `Each` | Repeat over a literal list or a bound array |
| `style.when` | The same element restyles by state |

Mutually exclusive views belong in **one** `Switch`. Name one field per axis: `view`, `step`,
`callState`. Never boolean soup. This is the discriminated-union doctrine, which exists to make
impossible states impossible.

## State you cannot write

Three things are managed for you. Project them, and never simulate them.

| | You read | Never |
|---|---|---|
| Conversation and lifecycle | The derived `isStreaming` and `isEmpty` flags | Simulate them. A stuck flag is a delivery bug to report |
| Voice | `callState`, projected by the SDK's voice service | Wire audio |
| Host chrome | The embedding host's own props | Put it in the store |

An app binds the voice service by declaring `service: voice` in its manifest.

## Next steps

<Card title="Apps" icon="layout-template" href="/design/apps" horizontal>
The shell your components render inside.
</Card>

<Card title="Primitives" icon="box" href="/reference/primitives" horizontal>
Every element, and what each one reads.
</Card>
