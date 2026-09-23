---
sidebarTitle: "Tasks"
title: "Tasks"
---

A task is something an Agent reaches for in a conversation to get an outcome. On the map it
is one kind of row, whatever it was authored as. Off the map nothing is called a task: a
component is a component, a template a template, an app an app, and each keeps its own
manifest as the single home of what it is for.

**The switch makes it a task.** Every asset with a manifest carries an Available switch on
its own lane in Studio. Switched on, it is offered to every canvas in the org and lands on
the map as a `task` row. Nothing is written twice: the task reads its title, description and
selection text from the asset's own manifest.

A task opens onto one of three doors:

- **Interface.** A component or a template the customer completes on screen: a chooser, a
  form, a transfer, a page.
- **Agent.** A workflow on a canvas, fired at its Input Trigger. Either a bare Agent (an
  `agents/` file, below) or an app whose binding fires a workflow, an Agent with an
  interface in front.
- **MCP.** A tool on another system. Reserved.

Every task is a native MCP tool. An interface renders and elicits over MCP. An Agent is a
task-augmented tool: its call creates an MCP task, progress is the task's status, and the
run's result is the tool's result. A task is done only when its door says so.

## The Agent file

A workflow with no interface has no manifest anywhere, so it is the one thing authored for
the map alone: one file, `design/<org>/agents/<name>.yaml`.

```yaml order-status.yaml
type: agent
name: order-status
title: Order Status
description: Answers a question about the customer's recent orders from their own order history.
whenToUse: Where is my order, when will it arrive, what did I order last month. Questions about my own orders, answered from my account.
category: Orders
version: 1.0.0
message: Checking your orders
workflow: wf-acme-orders          # any canvas in the org
trigger: inputtrigger1            # the Input Trigger that starts it
output: answer                    # the node whose output is the result
```

| Field | What it is |
|---|---|
| `name` | The file name, kebab-case. The tool's name on the wire |
| `title`, `description`, `whenToUse`, `category`, `version` | The same discovery meta every manifest carries, written to the [discoverability rules](/nodes/node-discoverability) |
| `message` | What the face says while the Agent runs |
| `workflow`, `trigger`, `output` | The door: the canvas id, the Input Trigger node id, and the node whose output is the result. All three, always |
| `app` | The face while it runs. Default is the shared `unoverse://components/agent-card`; an Agent whose result deserves its own component names it |
| `instructions`, `skills` | What to do, and the skills the Agent needs, by name. Optional |

The Agent's input schema is not on the file. It is the Input Trigger's own Input Schema,
declared on the canvas where the workflow starts. A trigger that declares none takes a
single `message`.

## What happens when an Agent is called

1. A search surfaces the task row. The harness mints it as a tool.
2. The caller calls it. The server creates an MCP task, pushes the face into the
   conversation with the Agent's name and message, and fires the workflow at its trigger
   with the caller's own identity.
3. As the run moves, the face shows the current node and the steps done. A step that
   waits on the person shows as waiting, and the person answers in the same conversation.
4. When the run completes, the output node's text lands in the face and returns to the
   caller as the tool's result. The caller carries on with it in the same turn.

Nothing is fire-and-forget. A task that has not completed is a task still running.

## On the execution timeline

A call to a task is drawn as a task, in amber with a door, under the Agent that called it.
An MCP tool stays purple, a skill in force stays cyan. The model chose the task among its
tools like any other, and the row keeps that count; what changes is what the person reading
the timeline sees first: the outcome, not the plumbing.

## Where the switch lives

On the asset's own lane in Studio: Components, Templates, Apps, and the Agents lane for the
Agent files. On a canvas, a switched-on task is installed from the Content Library, exactly
like a skill.

## Related

- [Components](/design/components) and [Templates](/design/templates): interfaces, with
  the selection text on their manifest.
- [Apps](/design/apps): an app keeps its manifest and its binding; switched on, it is an
  Agent with an interface in front.
- [Agent skills](/onboarding/skills): what an Agent follows while doing a task. A skill's
  switch makes it a skill on the map, never a task.
