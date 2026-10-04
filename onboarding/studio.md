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

  [36m❯[0m 1  [1mStudio[0m     Components, apps, agents and nodes
                  [2mMost people start here[0m
    2  Universe   [2mRun the platform yourself, on your own infrastructure[0m
    3  Client     [2mA client accelerator that talks to unoverse[0m

  [2m↑↓ to move, Enter to choose[0m

  [2mLaunching Unoverse Studio. It creates and manages your projects.[0m
```

`unoverse create` asks for your org's name (it suggests the folder's), turns the folder into
that org's own Git repo, and opens **studio** on **http://localhost:4108**. One folder, one
org, one repo. Everything the org is made of sits at the top:

```text
acme/
  unoverse.yaml      org: acme   (the org's name, declared here)
  styles/            colour, type, spacing: your starting tokens
  identity/          who the organisation is: four documents to fill
  components/        one piece of interface
  apps/              whole surfaces
  skills/            behaviour an Agent follows
  blocks/            reusable prompt fragments
  nodes/             your own integrations
```

A new org starts with the baseline only: its tokens, its identity and Git with a first commit.
It also carries one check, run on every pull request: the same lint your universe runs. The other
folders appear as you build. For worked examples to read and copy, clone the demo org,
[Acme](https://github.com/unoverse-orgs/acme).

**It is all YAML.** Components, apps, styles, skills and nodes are written in one language.
Any AI tool you already use can author them. The linter checks its work, and the skills give it
the rules. Nothing here needs a build step.

`unoverse studio` reopens the org from anywhere inside it, always on the current version.
There is nothing to update. A second org is a second repo, made in a new folder:

```bash
unoverse create
```

## What you can author

The main kinds of asset. Every one is a file in your own repository.

<AccordionGroup>

<Accordion title="Apps" icon="layout-dashboard">
Build a micro app: a small AI-powered interface, served to your users. A chat window, a
booking flow, a dashboard.

An app owns its own states and layouts, and arranges components inside it.

Lives in `apps/`. [How apps work](/design/apps).
</Accordion>

<Accordion title="Templates" icon="layout-template">
Build an arrangement with open sections a delivery fills: a shelf grid, an email, a
comparison page. You place what you know and leave open what the Agent decides.

Lives in `templates/`. [How templates work](/design/templates).
</Accordion>

<Accordion title="Components" icon="square-dashed">
Build a card, a form, a document. Write it once and it renders in your web app, in ChatGPT
and in Claude. Change it, publish, and it is live everywhere with no rebuild.

Lives in `components/`. [How components work](/design/components).
</Accordion>

<Accordion title="Atoms" icon="atom">
Build the buttons, headings and badges your components are made from. Compose these rather
than hand-rolling a shape the design system already ships.

Lives in `atoms/`. [How components work](/design/components).
</Accordion>

<Accordion title="Styles" icon="palette">
Set colour, type and spacing once. Nothing else carries a hex code, so a rebrand is one
change here instead of a sweep through every component.

Lives in `styles/`. [Tokens in full](/design/styles-and-tokens).
</Accordion>

<Accordion title="Skills" icon="sparkles">
Tell an Agent how to behave, in plain markdown. What it should do, how it should answer,
and what it must never say.

Lives in `skills/`.
</Accordion>

<Accordion title="Prompt Blocks" icon="text-quote">
Write a piece of a prompt once, then reference it wherever it is needed. The same wording
stops drifting across a dozen Agents.

Lives in `blocks/`.
</Accordion>

<Accordion title="Nodes" icon="boxes">
Give an Agent something new it can do: call an API, read a database, transform a payload.
Written as YAML, not code.

The **Nodes** tab runs one against the real service with no platform running. Fill in the
settings, press **Run**, and the output appears beside them. Keys come from your own `.env`
and are stored nowhere.

Lives in `nodes/`. A node type is one per platform, so a node copied from Acme gets your own type. [Building a node](/nodes/overview), and [testing one](/nodes/testing-nodes).
</Accordion>

</AccordionGroup>

**studio** also has **Agents** and **Identity** tabs, and two kinds have no tab yet: **objects**
and **pipelines**. All four are folders at the top of your repo and ship the same way.

Workflows are not authored here. They are built on the **canvas**.

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

Push to Git. Your universe **pulls** your org's repo, checks every commit with the same lint,
and applies it with no restart. Nothing is pushed into a universe.

```bash
git push
```

An admin connects the org to its repo once, on the org's **Source** tab in the universe. They
set the repo, the branch (or release tags) to follow, a read-only deploy key and a webhook. After
that, a push arrives within seconds, or within five minutes without the webhook, and **Sync
now** pulls at once. [Environments](/architecture/environments) covers dev, UAT and production.

To undo a change, revert it in Git, and the universe follows.

<Note>
The Git sync is built but not yet released. Until your universe runs a release that has it, or
until it is connected to the repo, `unoverse deploy studio` sends the org's work to it from your
terminal. It lints, shows a plan, and asks before sending.
</Note>

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

Your workspace carries a `.vscode/settings.json` that maps every file to its schema, which
is what the extension follows. To confirm it works, open a node's `node.yaml` and delete a
required field such as `type`. A red underline should
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
