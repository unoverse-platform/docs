---
sidebarTitle: "Studio"
title: "Studio"
---

**Build and test your work: mock states in isolation, or live against a real platform, on every channel at once.**

**Studio** is the workbench for everything you author. It runs on your own machine, reads
your files straight off disk, and needs Node and nothing else.

```bash
npm install -g unoverse
unoverse studio
```

It opens on http://localhost:4108 and finds your project by looking for `rx/` in the current
folder, any parent, or a single folder directly below. So it works from inside your project
or from the folder you created it in. [Studio](/onboarding/studio) covers the setup in full.

---

## What you get

```
┌────────────────────────────────────────────────────────────────┐
│  STUDIO                                      [ Mock | ● Live ] │
│ ┌──────────────────┐  ┌──────────────────────────────────────┐ │
│ │ DEFINITIONS      │  │ NATIVE PREVIEW: per channel          │  │
│ │  components/…    │  │  edit the definition ⇒ preview        │ │
│ │  templates/…     │  │  updates live (MCP resource subscribe)│ │
│ │  [props / states]│  │                                       │ │
│ └──────────────────┘  └──────────────────────────────────────┘ │
│  DEVTOOLS: state inspector · component stream log               │
└────────────────────────────────────────────────────────────────┘
```

Because **Studio** is **just another MCP client**: same SDK, same definition resources, same component stream as production, what you see is what ships ([02](/design/sdui-and-mcp-apps)). Hot reload isn't a dev trick: it's the same `resources/subscribe → updated` mechanism that live-updates production channels.

The top nav is flat: **Apps · Components · Styles · Nodes · AI**, and a header **org switcher** scopes the whole **Studio**: the Apps list, the Components list (the design system + the selected org's own components only), and the preview theme. **All** shows everything cross-org, with an org badge per card. Atoms have no **Studio** view: they're authoring-time only; the server expands them before anything is served.

---

## Mode A: Mock (isolation)

Render a component or template with **mock data and mock history**, no backend logic involved. This is your daily loop while designing.

### Mock data = prop defaults. The state switcher = the state tree.

Two mechanisms, zero hand-maintained fixtures:

1. **Prop `default`s are the mock data.** Studio renders every definition from its declared defaults: which is why defaults should be realistic content, not empty strings.
2. **States on top, steps below.** The switcher renders the definition's declared state tree ([03](/design/components)), and nothing else:
   - the **public states** (the top level of the `view` axis) are **pills in the sub-navigation**, one per state, in tree order. A flat component with no tree shows none.
   - selecting a state reveals **its steps beneath, by step name**: the state's nested substates, never layout filenames (those are plumbing). The state's own shell is not listed (it is always on), and one drawing is not a choice: a single-layout state shows nothing below.

   Picking a state writes `view` into the slice; picking a step writes the state's own axis (`step`): both via the same generic `setValue` a real component's buttons use. (Templates work the same way: the manifest's `states:` tree is the switcher, base first; acting inside the preview transitions state like the runtime.)

**The viewer renders the served state tree; it never scans layouts.** There is no `visibleWhen` archaeology and no Switch-scanning: the declaration IS the enumeration, so "viewable states" falls straight out of authoring the tree. Use the switcher to exercise every discriminant value (each public state, each wizard `step`, each `callState` phase), and vary prop defaults to check edge data (empty lists, long text: how you catch a `bind` without a default).

**Apps show their widget's states too.** Selecting an app template (a single-widget shell) also lists its **seeded component's** public states as pills, activated by writing the widget's `view` into its slice, exactly what its own buttons do.

### Copy for Canvas: drop a component onto a workflow

When a component is selected, **Studio** shows a **`⧉ Copy for Canvas`** button. It copies the component as a **Canvas node** to your clipboard; then **`Cmd+V` on any workflow Canvas** pastes it in, sized to the component's `nodeSize`. This is **how a design component reaches a workflow**: the node library no longer lists components, so you preview it here, copy it, and paste it where the workflow needs it. (No file edit, no restart; it's just placing the node.)

---

## Mode B: Live (the proof)

Flip the toggle and **Studio** connects **as an MCP client to your real running platform**. Real workflows stream real components, select real templates, deliver real data: into the local preview. You are watching production behavior before shipping.

Use Live mode to verify the things mock can't:

- your component's **node** receives and merges streamed `COMPONENT_DATA` correctly,
- the **template selection** picks your app for the intents you wrote `whenToUse` for,
- **reaction flow**: the widget streams in (or is clicked) into a public state, the template's ladder walk enters the matching state and its slot frames the widget, its ✕ releases it back to the base cleanly,
- **turn lifecycle**: thinking indicators derived from `isStreaming` appear and, critically, clear.

---

## DevTools: when something looks wrong

| Tool | Shows | Use it when |
|---|---|---|
| **State inspector** | the three buckets live: each component slice, template state, the timeline | "my `visibleWhen` never fires" → look at the actual key/value; it's usually a key-name or bucket mismatch |
| **Component stream log** | every `COMPONENT_INIT` / `COMPONENT_DATA` / `TEMPLATE_DATA` / `WORKFLOW_STATE` with timing | "data isn't arriving" vs "data arrives but my bind is wrong": this log settles it in seconds |

Debugging order, always: **stream log** (did it arrive?) → **state inspector** (is it in the bucket I read?) → the definition (is my bind/condition right?). Never start by editing the definition on a guess: see the data first.

---

## The full loop

```bash
vi rx/components/pricecard/pricecard.json   # 1. edit (schema validates as you type)
unoverse build              # 2. the node re-synthesizes from the definition at boot
# 3. Studio: mock states → looks right
# 4. Studio: live mode → streams right
```

For pure definition edits (layouts, styles, copy), the resource subscription refreshes the preview live: no restart at all. A restart is only needed when the component's **node** must change (new props, a new component, discovery meta), because node definitions synthesize from your JSON at boot: there is no code generation step, ever.

---

**Next:** [08. Validate & Ship](/design/validate-and-ship).
