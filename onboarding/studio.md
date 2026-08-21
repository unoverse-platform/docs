---
sidebarTitle: "Studio"
title: "Studio"
---

**Studio** is where you build everything an Agent uses: interfaces, nodes, skills and the
design system behind them.

It runs on your machine, reads your files straight off disk, and needs Node and nothing
else. No database, no Docker, no account, and it works offline.

<Frame caption="The Studio workbench: a component, its live preview at every size, and its controls.">
  <img src="/images/onboarding/studio2.png" alt="Unoverse Studio editing a card component" />
</Frame>

| | |
| --- | --- |
| **What you need** | Node 20+ |
| **What you get** | The workbench for every asset you author |
| **Where your work goes** | Published to a universe when you are ready |

## Start it

Studio is a tool, not a project. Install it, run it where you want your project, and it
sets everything up for you.

<Steps>
<Step title="Install the CLI">

```bash Install the unoverse CLI
npm install -g unoverse
```

One small package, and it gives you the `unoverse` command:

| Command | What it does |
| --- | --- |
| `unoverse create` | Asks what you are building: a Studio project, a universe, or a client app |
| `unoverse studio` | Launches Studio, downloading it on first run |

Open source and free. No account, and nothing else to install.

</Step>
<Step title="Run Studio">

```bash Start a project
unoverse studio
```

Make a folder for your project, and run it there. The first time, it builds the project in
that folder and names it after the folder:

```
mkdir acme && cd acme
unoverse studio

  Created design/acme/, prompts/ and nodes/ in /Users/you/code/acme
```

The folder's name is also the **org** on everything that project publishes. So it has to be
lowercase letters, numbers and dashes. If your folder is called something else, Studio asks
for a name instead.

```
acme/                        your project
  design/acme/                   components, templates, styles
  prompts/                   Agent skills and prompt blocks
  nodes/                     your own integrations
```

`design/` holds a folder per project, not your files directly, because one repository can carry
several and each publishes separately. Add more from Studio's **New project** whenever you
want; they sit beside `design/acme/`.

You also get a first component, so Studio opens on something real rather than an empty list.

Next time, run `unoverse studio` from `acme/` or anywhere inside it.

A project and a universe are different sets of files, so they can share one folder. Run
`unoverse create` in this folder later and you get a universe here too, with your `design/`,
`prompts/` and `nodes/` untouched.

</Step>
<Step title="Edit the first component">

Studio opens on **http://localhost:4108**. Open `design/<your-project>/components/welcome/welcome.yaml`,
change the text, and save. Studio updates as you save.

</Step>
</Steps>

Two equivalent routes, if you prefer them: `npm create unoverse@latest` runs the same
wizard with nothing installed, and `npm install -g @unoverse-platform/studio` installs
Studio itself, as the `unoverse-studio` command.

Run it again inside an existing project and it skips all that and opens straight away. It
finds your project by looking for `design/` in the current folder or any parent, so it works from
anywhere inside it, and it will not offer to make a second project inside one you already
have.

## What you build here

| Tab | What it holds |
| --- | --- |
| **Apps** | The surfaces an Agent speaks through |
| **Components** | The interface pieces, as data rather than code |
| **Atoms** | The shared pieces components are built from |
| **Design System** | Tokens: colour, type, spacing |
| **Skills** | Behaviour an Agent follows |
| **Prompt Blocks** | Reusable prompt fragments |
| **Nodes** | Your own integrations, and a place to run them |

Everything is a file in your repository. Studio renders what is there, and saving a file
updates what you see.

## Check your work

Studio validates as you go, and it will not let a broken definition be published.

## Run a node for real

The **Nodes** tab runs a node against the real service, with no platform running. Fill in
the settings, press **Run**, and the output appears beside them.

Keys come from your own `.env` and are stored nowhere.
[Testing Nodes](/nodes/testing-nodes) covers it.

## Deploy to a universe

Everything up to here is offline. No account, no network, no universe. Deploying is the
one step that reaches one, and it happens in your terminal, not in Studio:

```
unoverse deploy studio
```

**Signing in happens by itself.** The first deploy asks which universe this workspace
ships to (an address like `universe.example.com`, saved to `unoverse.yaml` so the whole
team deploys to the same place) and opens your browser to sign in with whatever your
organisation uses. Studio names no provider and holds no credential; the CLI keeps the
session. `unoverse login` exists to sign in ahead of time, but you never need it first.

**The deploy checks your work, then shows a plan.** Lint runs locally and blocks on any
error, so you see the problem in your terminal rather than as a server rejection. Then a
plan lists every item, what kind it is, and whether it is new or a change. Nothing is
sent until you answer.

```
$ unoverse deploy studio
  ~ design/cards/DealCard.yaml      (changed)
  + design/atoms/StatusPill.yaml    (new)
  ~ nodes/hubspot/node.yaml         (changed, lands PENDING review)

  3 items -> https://universe.example
  Deploy? [y/N]
```

**A node then waits to be accepted**, because it is the only thing you deploy that holds a
URL and a key. Whoever runs the universe sees the hosts it wants to call and the credentials
it needs before it can run. After that first acceptance you deploy freely, and it only
pauses again if the node reaches for something new.

Deploying needs permission on your account, and it is a specific one. Being able to build a
workflow does not carry it, because pushing a node the whole universe can use is a different
power. If you do not have it, whoever runs the universe grants it.

## Set up your editor

Everything you author is validated against a schema **as you type**, so a typo or an unknown
field is underlined rather than surfacing later.

This works for `.json` out of the box. YAML needs one extension:

| Extension | ID | Install from |
| --- | --- | --- |
| **YAML** | `redhat.vscode-yaml` | [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) · [Open VSX](https://open-vsx.org/extension/redhat/vscode-yaml) |

Install it from your editor's extensions panel, or the links above. It is the same
extension everywhere: VS Code installs it from the Marketplace; Cursor and Windsurf
install it from Open VSX.

<Warning>
Without the extension, YAML files get **no validation at all**. Nothing warns you: they simply stop being checked. If you skipped the prompt, search for `redhat.vscode-yaml` in your editor's extensions panel.
</Warning>

Each file you author carries a `$schema` line, which is what the extension follows. To
confirm it works, open a node's `node.yaml` and delete a required field such as `type`. A red
underline should appear within a second. Undo, and it clears.

## Next steps

<Card title="Create your first node" icon="boxes" href="/onboarding/create-your-first-node" horizontal>
Build an integration as four small YAML files.
</Card>

<Card title="Components and templates" icon="palette" href="/onboarding/components-and-templates" horizontal>
Design the interfaces your Agents speak through.
</Card>

<Card title="Run the platform" icon="server" href="/onboarding/platform" horizontal>
Run a universe yourself: Docker, database, images.
</Card>
