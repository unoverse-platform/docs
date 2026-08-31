---
sidebarTitle: "studio"
title: "studio"
---

In **studio** you build the interfaces, skills and integrations your Agents use. Save a
file and the preview updates.

It runs on your machine, reads your files off disk, and works offline. Node 20 or newer is
all you need to build: no database and no Docker. Shipping what you build needs an account
on the universe you are shipping to.

## Start it

```ansi Terminal
[32m$[0m npm install -g unoverse
[32m$[0m mkdir acme && cd acme
[32m$[0m unoverse create

  [36m⬡ What are you building?[0m

  [36m❯[0m 1  [1mStudio[0m     Components, agents and workflows
                  [2mMost people start here[0m
    2  Universe   [2mRun the platform yourself, on your own infrastructure[0m
    3  Client     [2mA client accelerator that talks to unoverse[0m

  [2m↑↓ to move, Enter to choose[0m

  [2mLaunching Unoverse Studio. It creates and manages your projects.[0m

  [2mCreated design/acme/, prompts/ and nodes/ in /Users/you/acme[0m
```

**studio** opens on **http://localhost:4108**, and it has made you a project. Everything you
author lives in one of three folders:

```
acme/
  design/
    acme/              your project, named after the folder
      components/      one piece of interface
      apps/            whole surfaces
      styles/          colour, type, spacing
  prompts/
    skills/            behaviour an Agent follows
    blocks/            reusable prompt fragments
  nodes/               your own integrations
```

**It is all YAML.** Components, apps, styles, skills and nodes are written in one language,
so any AI tool you already use can author them: it reads and writes YAML, the linter checks
it, and the skills give it the rules. Nothing here needs a build step.

Open `design/acme/components/welcome/welcome.yaml`, change the text and save. The preview
follows.

`unoverse studio` reopens the project from anywhere inside it, always on the current
version. There is nothing to update.

## What you can author

Seven kinds of asset, in the order the tabs appear. Every one is a file in your own
repository.

<AccordionGroup>

<Accordion title="Apps" icon="layout-dashboard">
Build a micro app: a small AI-powered interface, served to your users. A chat window, a
booking flow, a dashboard.

An app owns its own states and layouts, and arranges components inside it.

Lives in `design/<project>/apps/`. [How apps work](/design/apps).
</Accordion>

<Accordion title="Components" icon="square-dashed">
Build a card, a form, a document. Write it once and it renders in your web app, in ChatGPT
and in Claude. Change it, publish, and it is live everywhere with no rebuild.

Lives in `design/<project>/components/`. [How components work](/design/components).
</Accordion>

<Accordion title="Atoms" icon="atom">
Build the buttons, headings and badges your components are made from. Compose these rather
than hand-rolling a shape the design system already ships.

Lives in `design/<project>/atoms/`. [How components work](/design/components).
</Accordion>

<Accordion title="Styles" icon="palette">
Set colour, type and spacing once. Nothing else carries a hex code, so a rebrand is one
change here instead of a sweep through every component.

Lives in `design/<project>/styles/`. [Tokens in full](/design/styles-and-tokens).
</Accordion>

<Accordion title="Skills" icon="sparkles">
Tell an Agent how to behave, in plain markdown. What it should do, how it should answer,
and what it must never say.

Lives in `prompts/skills/`.
</Accordion>

<Accordion title="Prompt Blocks" icon="text-quote">
Write a piece of a prompt once, then reference it wherever it is needed. The same wording
stops drifting across a dozen Agents.

Lives in `prompts/blocks/`.
</Accordion>

<Accordion title="Nodes" icon="boxes">
Give an Agent something new it can do: call an API, read a database, transform a payload.
Written as YAML, not code.

The **Nodes** tab runs one against the real service with no platform running. Fill in the
settings, press **Run**, and the output appears beside them. Keys come from your own `.env`
and are stored nowhere.

Lives in `nodes/`. [Building a node](/nodes/overview), and [testing one](/nodes/testing-nodes).
</Accordion>

</AccordionGroup>

There is an eighth kind, the **recipe**, which is a workflow graph copied onto a canvas
rather than authored here.

<Frame caption="A component, its live preview at every size, and its controls.">
  <img src="/images/onboarding/studio2.png" alt="unoverse studio editing a card component" />
</Frame>

## The design system comes with it

You do not start from an empty screen. **studio** ships a full design system: atoms,
components and a token foundation, all there to build on. It grows with every release.

<Frame caption="Every asset is a YAML file, with its live preview beside it.">
  <img src="/images/onboarding/studio-code.png" alt="unoverse studio showing a component definition and its preview" />
</Frame>

Buttons, avatars, callouts and choice tiles. Cards, carousels, charts, list pickers and
composer bars. Colour, type and spacing as tokens, with themes on top.

Your own components sit beside them and read the same tokens, so what you build matches what
shipped. The [Design](/design/overview) section covers how to build components and apps on
top of it.

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

<Card title="Design a component" icon="palette" href="/design/overview" horizontal>
How components, apps and tokens fit together, and how to build your own.
</Card>

<Card title="Create your first node" icon="boxes" href="/onboarding/create-your-first-node" horizontal>
Build an integration as a few small YAML files, and run it against the real service.
</Card>

<Card title="Get the skills" icon="sparkles" href="/onboarding/skills" horizontal>
Let your AI tooling author all of this for you.
</Card>
