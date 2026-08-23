---
sidebarTitle: "studio"
title: "studio"
---

**studio** is where you build everything an Agent uses. Open it and you can:

- design components, atoms and the styles behind them
- write Agent skills and prompt blocks
- build custom nodes, and run them against the real service
- preview every one of them at any size, as you save

It runs on your machine, reads your files off disk, and works offline. You need Node 20 or
newer. There is no database, no Docker and no account.

## What you can author

Seven kinds of asset, in the order the tabs appear. Every one is a file in your own
repository.

<AccordionGroup>

<Accordion title="Apps" icon="layout-dashboard">
A whole surface an Agent speaks through: a chat window, a wizard, a dashboard. An app carries
its own states and layouts, and arranges the components inside it.

Lives in `design/<project>/templates/`, and publishes as a `template`.
</Accordion>

<Accordion title="Components" icon="square-dashed">
One piece of interface, described as data rather than code. A card, a form, a document. The
same definition renders on the web, in ChatGPT and in Claude, with no build step.

Lives in `design/<project>/components/`.
</Accordion>

<Accordion title="Atoms" icon="atom">
The shared pieces components are built from: a button, a heading, a badge. Compose these
rather than hand-rolling a shape the design system already ships.

Lives in `design/<project>/atoms/`.
</Accordion>

<Accordion title="Styles" icon="palette">
Tokens: colour, type, spacing. No pixels or hex codes anywhere else, so a rebrand is a change
here rather than a sweep through every component.

Lives in `design/<project>/styles/`.
</Accordion>

<Accordion title="Skills" icon="sparkles">
Behaviour an Agent follows, written in plain markdown. What it should do, how it should
answer, what it must never say.

Lives in `prompts/skills/`.
</Accordion>

<Accordion title="Prompt Blocks" icon="text-quote">
A reusable fragment of a prompt, written once and referenced wherever it is needed, so the
same wording does not drift across a dozen Agents.

Lives in `prompts/blocks/`.
</Accordion>

<Accordion title="Nodes" icon="boxes">
Your own integration, written as YAML rather than code. The **Nodes** tab runs one against
the real service with no platform running: fill in the settings, press **Run**, and the
output appears beside them. Keys come from your own `.env` and are stored nowhere.

Lives in `nodes/`. [Testing nodes](/nodes/testing-nodes) covers it.
</Accordion>

</AccordionGroup>

There is an eighth kind, the **recipe**, which is a workflow graph copied onto a canvas
rather than authored here.

<Frame caption="A component, its live preview at every size, and its controls.">
  <img src="/images/onboarding/studio2.png" alt="unoverse studio editing a card component" />
</Frame>

## Start it

```bash
unoverse studio
```

That is the whole install. **studio** is fetched on launch and opens on
**http://localhost:4108**.

Run it in an empty folder the first time and it creates a project there, named after the
folder. The name becomes the **org** on everything that project publishes, so it has to be
lowercase letters, numbers and dashes, two to 39 characters. If the folder's name does not
qualify, **studio** asks for one.

```
acme/
  design/acme/               components, templates, styles
  prompts/skills/            Agent skills
  prompts/blocks/            prompt blocks
  nodes/                     your own integrations
```

You also get a first component, `design/acme/components/welcome/welcome.yaml`, so **studio**
opens on something real rather than an empty list. Change its text, save, and the preview
follows.

After that, run `unoverse studio` from anywhere inside the project.

<Note>
**It updates itself.** Each launch resolves the current version, so there is nothing to
update and no version to track. A **studio** left running from an earlier session is
replaced automatically. Anything else holding port 4108 is left alone and named, so nothing
of yours is ever killed.
</Note>

## Where your work lives

`design/` holds a folder per project, because one repository can carry several and each
publishes separately. **studio** renders what is on disk, and saving a file updates what you
see.

## Ship it

Publishing happens in your terminal, not in **studio**. There is no sign-in and no publish
button in the app: your identity lives in the CLI.

```bash
unoverse login https://your-universe.example
unoverse deploy studio
```

`login` keeps the session and writes the address to `unoverse.yaml`, so the whole team ships
to the same universe. After that `deploy studio` needs nothing else.

The order is the safety. Lint runs locally and blocks on any error, so you see the problem in
your terminal rather than as a server rejection. Then every item is compared against the
universe, and a plan lists what is new and what changes. Nothing leaves your machine until
you answer.

```
$ unoverse deploy studio
  ~ design/acme/components/deal-card.yaml   (changed)
  + design/acme/atoms/status-pill.yaml      (new)
  ~ nodes/hubspot/node.yaml                 (changed, lands PENDING review)

  3 items -> https://your-universe.example
  Deploy? [y/N]
```

A node then waits to be accepted, because it is the only thing you ship that holds a URL and
a key. Whoever runs the universe sees the hosts it wants to call and the credentials it needs
before it can run. After that first acceptance you ship freely, and it only pauses again if
the node reaches for something new.

## Set up your editor

Everything you author is validated against a schema as you type, so a typo or an unknown
field is underlined rather than surfacing later.

This works for `.json` out of the box. YAML needs one extension:

| Extension | ID | Install from |
| --- | --- | --- |
| **YAML** | `redhat.vscode-yaml` | [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) · [Open VSX](https://open-vsx.org/extension/redhat/vscode-yaml) |

VS Code installs it from the Marketplace; Cursor and Windsurf install it from Open VSX.

<Warning>
Without the extension, YAML files get **no validation at all**. Nothing warns you: they simply stop being checked.
</Warning>

Each file carries a `$schema` line, which is what the extension follows. To confirm it works,
open a node's `node.yaml` and delete a required field such as `type`. A red underline should
appear within a second. Undo, and it clears.

## Next steps

<CardGroup cols={2}>

<Card title="Components and templates" icon="palette" href="/onboarding/components-and-templates">
Design the interfaces your Agents speak through.
</Card>

<Card title="Create your first node" icon="boxes" href="/onboarding/create-your-first-node">
Build an integration as a few small YAML files.
</Card>

</CardGroup>
