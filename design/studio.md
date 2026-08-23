---
sidebarTitle: "studio"
title: "studio"
---

**Build and test your work: mock states in isolation, or live against a real platform, on every channel at once.**

**studio** is the workbench for everything you author. It runs on your own machine, reads
your files straight off disk, and needs Node and nothing else.

```bash
unoverse studio
```

It opens on http://localhost:4108 and finds your project by looking for `design/` in the
current folder, any parent, or a single folder directly below. So it works from inside your
project or from the folder you created it in. [Studio](/onboarding/studio) covers the install.

## What you get

A definitions rail on the left, a native preview on the right, and DevTools beneath it. The
nav is grouped in three:

| Group | Screens |
|---|---|
| Build | **Apps**, **Components**, **Atoms**, **Styles** |
| AI | **Skills**, **Prompt Blocks** |
| Code | **Nodes** |

A header org switcher scopes the whole of **studio**: the Apps list, the Components list,
and the preview theme. The Components list shows the design system plus the selected org's
own components. **All** shows every org at once, with a badge per card.

Atoms preview but never serve. The server expands every `Ref` before anything leaves it, so
no channel ever receives an atom.

**studio** is another MCP client: the same SDK, the same definition resources, the same
component stream as production. So hot reload is not a development trick, it is the resource
subscription that live-updates production channels
([How it works](/design/sdui-and-mcp-apps)).


## Mode A: Mock (isolation)

Render a component or app with **mock data and mock history**, no backend logic involved. This is your daily loop while designing.

### Mock data = prop defaults. The state switcher = the state tree.

Two mechanisms, zero hand-maintained fixtures:

1. **Prop `default`s are the mock data.** Studio renders every definition from its declared defaults: which is why defaults should be realistic content, not empty strings.
2. **States on top, steps below.** The switcher renders the definition's declared state tree ([Components](/design/components)), and nothing else:
   - the **public states** (the top level of the `view` axis) are **pills in the sub-navigation**, one per state, in tree order. A flat component with no tree shows none.
   - selecting a state reveals **its steps beneath, by step name**: the state's nested substates, never layout filenames (those are plumbing). The state's own shell is not listed (it is always on), and one drawing is not a choice: a single-layout state shows nothing below.

   Picking a state writes `view` into the slice; picking a step writes the state's own axis (`step`): both via the same generic `setValue` a real component's buttons use. (Apps work the same way: the manifest's `states:` tree is the switcher, base first; acting inside the preview transitions state like the runtime.)

**The viewer renders the served state tree; it never scans layouts.** There is no `visibleWhen` archaeology and no Switch-scanning: the declaration IS the enumeration, so "viewable states" falls straight out of authoring the tree. Use the switcher to exercise every discriminant value (each public state, each wizard `step`, each `callState` phase), and vary prop defaults to check edge data (empty lists, long text: how you catch a `bind` without a default).

**Apps show their widget's states too.** Selecting a single-widget app (a one-widget shell) also lists its **seeded component's** public states as pills, activated by writing the widget's `view` into its slice, exactly what its own buttons do.

### Copy for Canvas: drop a component onto a workflow

When a component is selected, **studio** shows a **`⧉ Copy for Canvas`** button. It copies the component as a **Canvas node** to your clipboard; then **`Cmd+V` on any workflow Canvas** pastes it in, sized to the component's `nodeSize`. This is **how a design component reaches a workflow**: the node library no longer lists components, so you preview it here, copy it, and paste it where the workflow needs it. (No file edit, no restart; it's just placing the node.)

---

## Mode B: Live (the proof)

Flip the toggle and **studio** connects **as an MCP client to your real running platform**. Real workflows stream real components, select real apps, deliver real data: into the local preview. You are watching production behavior before shipping.

Use Live mode to verify the things mock can't:

- your component's **node** receives and merges streamed `COMPONENT_DATA` correctly,
- the **app selection** picks your app for the intents you wrote `whenToUse` for,
- **reaction flow**: the widget streams in (or is clicked) into a public state, the app's ladder walk enters the matching state and its slot frames the widget, its ✕ releases it back to the base cleanly,
- **turn lifecycle**: thinking indicators derived from `isStreaming` appear and, critically, clear.

---

## DevTools: when something looks wrong

| Tool | Shows | Use it when |
|---|---|---|
| **State inspector** | the three buckets live: each component slice, app state, the timeline | "my `visibleWhen` never fires" → look at the actual key/value; it's usually a key-name or bucket mismatch |
| **Component stream log** | every `COMPONENT_INIT` / `COMPONENT_DATA` / `APP_DATA` / `WORKFLOW_STATE` with timing | "data isn't arriving" vs "data arrives but my bind is wrong": this log settles it in seconds |

Debugging order, always: **stream log** (did it arrive?) → **state inspector** (is it in the bucket I read?) → the definition (is my bind/condition right?). Never start by editing the definition on a guess: see the data first.

## The full loop

Edit the definition, watch it in mock, prove it in live, then publish.

```bash
unoverse deploy studio
```

Layouts, styles and copy refresh in the preview as you save, because the resource
subscription carries them. Nothing restarts.

Publishing is what a **new** component needs, or one whose node contract changed: new props,
a new name, changed discovery meta. The platform loads the set of definitions at boot and
builds one node from them, so a definition it has never seen has to arrive first. There is no
code generation at any point.

## Next steps

<Card title="Validate and ship" icon="shield-check" href="/design/validate-and-ship" horizontal>
What the lint enforces, and what only you can judge.
</Card>

<Card title="Troubleshooting" icon="wrench" href="/design/troubleshooting" horizontal>
Symptom, cause and fix for the mistakes that recur.
</Card>
