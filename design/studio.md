---
sidebarTitle: "studio"
title: "studio"
---

Build and test everything you author, either against mock data in isolation or live against
a real platform. **studio** runs on your own machine, reads your files straight off disk,
and needs Node and nothing else.

```bash
unoverse studio
```

It opens on http://localhost:4108 and finds your project by looking for `design/` in the
current folder, any parent, or a single folder directly below, so it works from inside your
project or from the folder you created it in. [Studio](/onboarding/studio) covers the
install.

## What you get

A definitions rail on the left, a native preview on the right, and DevTools beneath it.

<Frame caption="An atom selected: the rail on the left, the live preview, and its controls beneath.">
  <img src="/images/design/design-system.png" alt="studio showing the atom list, a live button preview, and a controls panel" />
</Frame>

The nav is grouped in three:

| Group | Screens |
|---|---|
| Build | **Apps**, **Templates**, **Components**, **Atoms**, **Styles** |
| AI | **Skills**, **Prompt Blocks** |
| Code | **Nodes** |

A header switcher scopes the whole of **studio**: the lists and the preview theme. The
Components list shows the design system plus your own components, and **All** shows every
project at once with a badge per card.

Atoms preview but never serve, because the server expands every `Ref` before anything
leaves it, so no channel ever receives an atom.

**studio** is another MCP client, running the same SDK, the same definition resources and
the same component stream as production. Hot reload is not a development trick, it is the
resource subscription that live-updates production channels too, and a definition that
works here works in production because there is no second path for it to work differently
on ([How it works](/design/sdui-and-mcp-apps)).

## Mock mode

Render anything with mock data and mock history, and no backend involved. This is your
daily loop while designing, and it needs no fixtures at all, because two things you have
already authored supply everything.

**Prop defaults are the mock data.** Every definition renders from its own declared
defaults, which is why defaults should be realistic content rather than empty strings.

**The state switcher is the state tree.** Each public state appears as a pill, in tree
order, and a flat definition with no tree shows none.

<Frame caption="Each public state as a pill, taken straight from the declared tree.">
  <img src="/images/design/states_tabs.png" alt="studio showing Grid and Page state pills above a live preview" />
</Frame>

Selecting a state reveals its steps beneath, named by step. Those are the state's nested
substates, never layout filenames, and a state's own shell is not listed because it is
always on. One drawing is not a choice, so a single-layout state shows nothing below.

Picking a state writes `state` into the slice, and picking a step writes that state's own
axis. Both go through the same `setValue` a real button uses, so acting inside the preview
transitions exactly as the runtime does.

**The viewer renders the served tree and never scans layouts.** There is no `visibleWhen`
archaeology and no Switch-scanning, because the declaration is the enumeration. Use the
switcher to exercise every discriminant value, every public state, every wizard step and
every `callState` phase, and vary the prop defaults to check edge data such as empty lists
and long text. That is how you catch a `bind` with no default.

## Live mode

Flip the toggle and **studio** connects as an MCP client to your real running platform.
Real workflows stream real components, select real apps and deliver real data into the
local preview, so you are watching production behaviour before shipping.

Live mode proves the things mock cannot:

- Your component's node receives and merges streamed data correctly.
- App selection picks your app for the intents you wrote `whenToUse` for.
- The reaction runs end to end: an interface arrives in a public state, the app enters the
  matching state, its slot frames the interface, and the ✕ releases it back to the base.
- Turn lifecycle behaves, so thinking indicators derived from `isStreaming` appear and,
  critically, clear.

## DevTools

| Tool | Shows | Use it when |
|---|---|---|
| **State inspector** | The three buckets live: each interface slice, app state, the timeline | Your `visibleWhen` never fires. Look at the actual key and value, because it is usually a key-name or bucket mismatch |
| **Component stream log** | Every `COMPONENT_INIT`, `COMPONENT_DATA`, `APP_DATA` and `WORKFLOW_STATE`, with timing | You cannot tell whether data failed to arrive or arrived and bound wrongly. This settles it in seconds |

Debug in one order, always: the stream log to see whether it arrived, the state inspector
to see whether it landed in the bucket you read, then the definition to check your bind.
Never start by editing the definition on a guess.

## Copy for Canvas

Select a component and **studio** shows a **Copy for Canvas** button. It copies the
component as a canvas node to your clipboard, and `Cmd+V` on any workflow canvas pastes it
in, sized to the component's `nodeSize`.

That is how a design component reaches a workflow. The node library does not list
components, so you preview one here, copy it, and paste it where the workflow needs it. No
file edit and no restart, because you are only placing a node.

## The full loop

Edit the definition, watch it in mock, prove it in live, then publish.

```bash
unoverse deploy studio
```

Layouts, styles and copy refresh in the preview as you save, carried by the resource
subscription, and nothing restarts.

Publishing is what a new definition needs, or one whose node contract changed through new
props, a new name or changed discovery meta. The platform loads the set of definitions at
boot and builds one node from them, so a definition it has never seen has to arrive first.
There is no code generation at any point.

## Next steps

<Card title="Validate and ship" icon="shield-check" href="/design/validate-and-ship" horizontal>
What the lint enforces, and what only you can judge.
</Card>

<Card title="Troubleshooting" icon="wrench" href="/design/troubleshooting" horizontal>
Symptom, cause and fix for the mistakes that recur.
</Card>
