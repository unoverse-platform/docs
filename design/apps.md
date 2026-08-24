---
sidebarTitle: "Apps"
title: "Apps"
---

Build the surface your components arrive into: a chat layout, a voice screen, a dashboard. The
app decides where a component sits, and how the page rearranges around it.

An app owns nothing. Conversation and component data live in the store, so apps are swappable
mid-conversation.

## One file

<Tree>
  <Tree.Folder name="acme-chat" defaultOpen>
    <Tree.File name={<><b>manifest.yaml</b> <span className="tree-note">the whole contract, including the state tree</span></>} />
    <Tree.Folder name={<><b>layouts</b> <span className="tree-note">one arrangement per state</span></>} defaultOpen>
      <Tree.File name={<><b>main.yaml</b> <span className="tree-note">the base: the conversation alone</span></>} />
      <Tree.File name={<><b>products.yaml</b> <span className="tree-note">core plus a rail of cards</span></>} />
      <Tree.File name={<><b>detail.yaml</b> <span className="tree-note">core plus a pinned page</span></>} />
    </Tree.Folder>
    <Tree.Folder name={<><b>components</b> <span className="tree-note">shared chrome: header, composer, turns</span></>} defaultOpen />
  </Tree.Folder>
</Tree>

There is no `<name>.yaml`. The manifest is the single contract file, and that is the one
difference from a component's folder.

Each layout is a complete arrangement, so shared chrome lives once in `components/` and every
layout includes it.

## The tree

```yaml
states:
  main:                 # the base, always first
    states:
      welcome: {}       # contained: exists only inside main
  focus: {}             # the ladder, in priority order
  products: {}
  detail: {}

layout: main
```

**Top-level order is the priority ladder.** The base comes first, then the reaction states in
the order they should win. [State](/design/state) covers the walk that uses it.

**Nesting is containment.** `welcome` exists only inside `main`. The compiler strips a declared
base substate out of every other arrangement, so no hand-written guard has to police it. The
first substate declared is the landing default.

**The shell is not declared.** The conversation timeline is `main`'s own content, drawn beside
the rail and the page and under focus. Declaring a state *contains* it, so declare only what
should exist in the base alone.

**Each state draws the layout of its own name.** Write `layout:` only when the filename
differs. An app with a single state is simply always in it.

### States or moods

The rearrange rule sorts these too.

> **If a component makes the app rearrange, it is a top-level state. If the app already knows
> and would not move, it is a mood nested in the base.**

A welcome hero on an empty conversation is a mood. A voice layout's call phases are moods. Put
them on the ladder and you break it twice: they outrank real reactions, and they draw inside
them.

## Width

> **The app is always the active state's layout total. Nothing else, ever.**

Widths are declared with `appWidth`, on a panel inside a layout. Normally a named size from
your `styles/semantic/app-sizes.yaml`, so the whole org stays on one scale.

```yaml
# components/core.yaml: the conversation column, always open
type: Box
appWidth: chat

# layouts/products.yaml: that core, plus a rail that declares its own width
type: Box
style: { direction: row, width: full, height: full, overflow: hidden }
children:
  - { $include: components/core }
  - type: ComponentSlot
    appWidth: rail
    select: { from: all, where: { field: view, eq: products } }
```

So the width is one of a small known set by construction. The base is the core alone, a rail
layout is core plus rail, and the host animates between the totals. Nothing inside resizes.

The rules, all enforced by lint:

| | |
|---|---|
| A bare name must exist in your app sizes | Raw CSS and `flex` are valid too. A name is simply easier to retune |
| One declaration per panel | The panel's `appWidth` sizes its box and grows the app, so its frame declares no width |
| Never on a layout root | The root is the arrangement. Panels inside it carry the widths |
| Never `visibleWhen`-guarded | A conditional arrangement is a state with its own layout, not a guarded pane |
| An overlay declares nothing | A surface over the core never changes the app's size |

Give every layout root `overflow: hidden`, so a panel mid-slide clips at the edge rather than
scrolling.

## Two primitives only apps use

**`Timeline`** renders the conversation. You supply the user and assistant turn subtrees, and
the stream fills them.

**`ComponentSlot`** is where components render, in two forms:

```yaml
# the flow slot: components render inline, the default home
- type: ComponentSlot
  select: {}

# a reaction slot: renders whichever component put the app in this state
- type: ComponentSlot
  select: { from: all, where: { field: view, eq: detail }, limit: 1 }
  frame: {}
```

A state's layout must contain a slot selecting that state's view. The tree claims the instance
and the slot renders it, and a guard enforces the pair.

A slot holding one occupant gives it the frame's full height automatically. Multi-occupant
slots, like a rail, keep their instances content-sized.

Never size or restyle a component from the app. A component owns its states and its size, and
the app owns only the framing.

An overlay is still normal. A wizard floating over the chat lives inside the core, claims its
view, and changes no width. Reach for a top-level state when the *arrangement* changes, and
keep an overlay in-core when only a layer appears.

## Voice

Declare `service: voice` in the manifest and the channel instantiates the native service, which
projects `callState` into scope. The call phases branch inside the base layouts, typically a
wide core in the base and a slim one beside a card slot.

Cards streaming in during a call are placed by the ladder exactly as in chat. Audio is never
wired in a definition.

## How an Agent finds your app

`whenToUse` is the text an Agent's search is ranked against, so it decides whether the app is
ever chosen. Getting it wrong fails silently: the app works, and is simply never picked.

| Field | Its one job |
|---|---|
| `title` | The thing itself. No org prefix, no mechanism |
| `description` | What it **is**, one line under 120 characters |
| `whenToUse` | The words a user would say, outcome first |
| `category` | The job's domain, never the implementation |

The trap for a general-purpose app is listing its siblings' jobs. That vocabulary then outranks
the focused apps for their own queries. A fallback owns general help and reaching a person, and
cedes specific jobs by property without naming anything.

[Node discoverability](/nodes/node-discoverability) is the full guide, and it applies to apps
verbatim.

## Next steps

<Card title="Styles and tokens" icon="palette" href="/design/styles-and-tokens" horizontal>
Your brand, as values every definition resolves against.
</Card>

<Card title="manifest.yaml" icon="book-marked" href="/reference/manifest" horizontal>
Every field an app manifest takes, with its type.
</Card>
