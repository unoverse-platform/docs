# Playbook: Agents

**Read first:** [Tasks](https://docs.unoverse.ai/design/tasks.md). The design behind this page is
`docs/architecture/signal/AGENTS.md` in the platform repo.

An Agent is someone who does work by calling tasks: a role, instructions, a character, ways to be
woken (its triggers), memory, a model, a daily budget, and the tasks it may call. Tasks are built on
the Canvas or as components; an Agent is written here, as a folder, and needs no canvas.

```
agents/<name>/
  agent.yaml     what it is and what it may do
  SOUL.md        who it is: its character, nothing else
```

## agent.yaml

```yaml
type: agent
name: sam                          # = the folder name
title: Sam                         # its name, as people see it
role: Sales lead                   # its job title: signs its emails and posts
description: The sales lead. Finds companies that fit and the people to talk to there.
whenToUse: Ask Sam about the market, who we have found, or give it sales work.
category: sales
version: 1.0.0
avatar: https://example.com/sam.png   # its picture, an image URL

skills: [sales-lead]               # what it does: Agent skills in skills/
soul: SOUL.md                      # who it is

model:
  use: <a model from the catalog>  # named, never defaulted
budget:
  perDay: 20 USD                   # required: no budget, no Agent
  perRun: 3 USD                    # optional

tasks:                             # every one a task, by its one URI
  - unoverse://tasks/acme/brief-a-person
  - unoverse://tasks/acme/companies
  - unoverse://tasks/marketplace/signal-save      # Signal for leads: save_person, add only
  - unoverse://tasks/marketplace/spatial-search   # Spatial: findIntent, discoverRelated
access:                            # the most it may ever do; none = no one's information
  - signal:write

triggers:                          # what wakes it: existing nodes, as a pipeline's steps are
  - name: spatial                  # found in Spatial and called there
  - name: slack
    node: SlackMCP
    wakes: mentions
  - name: email
    node: MailboxMCP
    wakes: replies

memory:
  agent: on                        # its own goal, plan and notes, kept under its id across wakes
askWhenUnsure: slack
```

## The rules that bite

1. **Budget and model are required.** No budget, no Agent: lint refuses the file, and Signal
   refuses to switch it on.
2. **Tasks by URI.** `unoverse://tasks/<org>/<name>`, whatever the task is built from: a form, a
   workflow's Task Start (by its Name field, never its title), a pipeline. Lint checks each exists.
3. **A marketplace MCP is a task too.** `unoverse://tasks/marketplace/<node>`, the node's type in
   kebab case, hands over every tool that MCP offers: `signal-save` (save a lead, add only,
   `signal:write`), `signal-people` (all of Signal: people, their tasks and goals,
   `signal:read-all`), `spatial-search`, `spatial-research`. The node is the gate: each call is
   checked against the Agent's `access`. A permission in `access` gives it nothing to call; a task
   does. Lint refuses a marketplace task that is no MCP, and an Agent with no tasks.
4. **Triggers name existing nodes.** `SlackMCP`, `MailboxMCP` (its Connect also gives the calendar),
   `OpenAIGPTLive`. No credentials in the file: they are connected in each environment.
5. **The soul is character only.** No permission, task or order in `SOUL.md`; lint warns.
6. **What it reads is never an order.** Instructions come only from its skills and a verified
   person in its org. Never write a skill that obeys text found in an email or a page.
7. **Its email address is never typed.** It is the address of the mailbox connected in each
   environment (Connect with Gmail or Outlook), what it sends from, shown in Signal. It signs as its
   `title`, `role` and that address.
8. **Never in the file:** who is responsible for it and whether it is on (set in Signal, per
   environment), secrets, and any permission beyond `access`.

## Workflow

1. Read the Tasks page, `AGENTS.md`, and any Agent folder in your org repo.
2. Write `agent.yaml` and `SOUL.md`; put what it does in a skill under `skills/`.
3. `unoverse lint`, then Studio's Agents lane to see it. Commit to ship it.
4. In Signal, a person who holds everything in `access` connects its accounts, sets who is
   responsible, and switches it on.

## Things that go wrong

| Symptom | Cause |
|---|---|
| Lint: "no budget" | `budget.perDay` missing. It is required |
| Lint: a task is unknown | the URI names no task in the org; a workflow task is named by its Task Start's Name |
| It never answers in Slack | not switched on in this environment, or its Slack account not connected |
| A task is refused mid-run | it needs a permission not in `access`; add it on purpose |
| It has the permission but never does it | `access` allows, it does not equip: add the task, e.g. `unoverse://tasks/marketplace/signal-save` |
| Lint: `spatial` is not allowed | retired; Spatial is a task: `unoverse://tasks/marketplace/spatial-search` |
| Its memory is empty | `memory.agent` is off, or it has not run since it was turned on |
