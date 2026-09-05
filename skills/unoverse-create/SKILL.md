---
name: unoverse-create
description: "Create or edit anything a developer authors on unoverse: components, apps, templates, atoms and styles (design/), brands and org packs, Agent skills and prompt blocks (prompts/), custom workflow nodes (nodes/), and workflows built live on the canvas. Use whenever the user wants to create, add, build or change a component, app, card, page, theme, brand, org pack, Agent skill, prompt block, custom node or workflow in an unoverse workspace, even when they do not say unoverse (they describe a card with a button, a page the AI fills in, a node that calls an API)."
---

# Creating on unoverse

You are helping a developer build in an unoverse workspace: three folders the platform reads.

| Folder | What lives there |
|---|---|
| `design/<project>/` | Interfaces as data: components, apps, templates, atoms, styles. One project is one org |
| `prompts/` | Behaviour: Agent skills (`skills/`) and prompt blocks (`blocks/`) |
| `nodes/` | Logic: custom workflow nodes, as YAML packages |

Paths here are relative to the workspace root. In the platform monorepo the root is
`apps/unoverse/`.

## The documentation is the source, and it is searchable

Every rule this skill routes to lives at docs.unoverse.ai. Read pages there, never from
memory. Append `.md` to any page URL for raw markdown, and use the site's own search
before writing anything you are not sure of:

```bash
claude mcp add unoverse https://docs.unoverse.ai/mcp
```

That adds the `search_unoverse` tool. This skill states what is non-negotiable and names
the page. It never restates a page, so when the two disagree, the page wins.

## Step 0: anchor in the workspace

1. **Pick the project.** Every design artifact belongs to `design/<project>/`. If there is
   more than one, or the only one looks like a placeholder, ask. Never invent a project
   folder to hold one artifact.
2. **Read the closest shipped exemplar first.** The base design system and every published
   node are public at
   [marketplace/definitions](https://github.com/unoverse-platform/marketplace/tree/main/definitions).
   Compose those atoms and mirror that shape. Never hand-roll what the base already ships.
   [The design system](https://docs.unoverse.ai/design/design-system.md) explains what ships.

## Step 1: identify the artifact, read its playbook

| The user wants | Read |
|---|---|
| A component or atom, including a page the AI fills | `references/component.md` |
| An app: a chat surface, a shell around components | `references/app.md` |
| A template: an arrangement with sections a delivery fills | `references/template.md` |
| A brand: an org pack, a rebrand, a clone for a new client | `references/brand.md` |
| An Agent skill the platform's Agents follow at run time | `references/agent-skill.md` |
| A prompt block, a reusable prompt fragment | `references/block.md` |
| A custom workflow node: an integration, a tool, logic | `references/node.md` |
| A workflow, wired live on the **canvas** | `references/workflow.md` |

"Add a card that shows the weather" is usually a component (the UI) plus a node (the
data). Confirm the scope before writing.

## Step 2: rules that apply to everything

1. **Edit the three folders only.** Never the SDK, the engine or the server. If a task
   seems to need a code change, the answer is almost always "express it as data".
2. **UI is data.** No pixels, no hex colours, no CSS: token names only. No logic in a
   definition: anything computed is computed in a node and sent as a plain field.
3. **Discovery meta is ranked, not read.** `title`, `description`, `whenToUse` and
   `category` decide whether a component, app, template, skill or node is ever chosen.
   [Node discoverability](https://docs.unoverse.ai/nodes/node-discoverability.md) is the
   contract for every kind. Read it before writing any of the four.
4. **kebab-case names, from the design.** Never invent a word the documentation does not
   use.

## Step 3: check, see, ship

```bash
unoverse lint
```

Zero errors before anything else. Every message names the rule and the page. Then:

| Artifact | To see it |
|---|---|
| Component, atom, app, template, style | Preview in **studio** (`unoverse studio`) |
| Node | The **Nodes** screen in **studio**: Load sample, then Run, against the real service |
| Agent skill, prompt block | Lint is the check; they take effect on deploy |

```bash
unoverse deploy studio
```

Deploy runs the same lint first and ships every kind in the workspace. Nothing goes if lint
fails. Tell the developer where to look once it is live: the rendered thing is the
deliverable, never the YAML alone.
