---
sidebarTitle: "Tasks"
title: "Tasks"
---

A task is a unit of interaction for a person: a form they fill, a deck they go through.
A component, a template, an app or an Agent file IS the task. There is no separate task
file: each keeps its own manifest as the single home of what it is for.

**The switch makes it a task.** Every asset with a manifest carries an Available switch on
its own lane in Studio. Switched on, it is offered to every canvas in the org and lands on
the map in the `task` category. Nothing is written twice: the task reads its title,
description and selection text from the asset's own manifest.

**A task is named by its own URI**, everywhere: on the map, in the task table, in every
hand-off. `unoverse://templates/unoverse/about-you` is the about-you task. "Task" is a
category on the map, never part of an address.

## Every task has the same shape

A presentation, an application form and a chooser are built the same way. Four things make
a task, whatever it is for:

| Part | What it is | Where it lives |
|---|---|---|
| **Steps** | The state tree: external states, with the steps nested inside them as internal state | `<name>.yaml`, `states:` |
| **Props** | What is on each step. `input: true` means an Agent or a workflow fills it; `input: false` means it is drawn from its `default` | On the component, or on the parts a template holds |
| **Input** | The workflow that works it | The meta: `binding: { workflow, trigger }` on a component, template or app manifest; `workflow`, `trigger` and `output` on an Agent file |
| **Output** | What it hands back, when it hands anything back | `outputs:` on the envelope, sent by a button whose action ends in `type: submit` |

Every task also carries the same discovery meta: `title`, `description` and `whenToUse`.

**The skill is the only thing that changes.** An Agent presenting a deck and an Agent taking
a person through a form are handed the same thing: the step on screen and its props. The
presenter's skill says what is on them; the application's skill asks for each `input: true`
prop still empty. Nothing about the task itself says which it is.

**An Agent is a task that runs its own steps.** It is loaded the same ways and takes the
standard input (its Input Trigger's schema). Its steps are the nodes of its workflow: nobody
else fills or moves them, and it reports its progress node by node on its card. It finishes
as every task does, handing back its output. Its run is its state: it is not saved to the
task table, so an Agent task cannot yet be picked up again.

## Where it shows

A task shows wherever it is needed, and it is the same task in each place:

| Where | How it gets there |
|---|---|
| **A web page** | Served in the page's context: the page chose it and draws it in place |
| **An app** | One of the app's parts |
| **The unoverse experience** (chat, voice, the screen) | Found by a Spatial search and presented by an Agent |

## How it is loaded

| Loaded | From | Starts |
|---|---|---|
| **From Spatial** | An Agent finds it and opens it as an MCP tool | Where the person left it, else its first step |
| **By URI** | A page, or a node's config (`unoverse://templates/<org>/<name>`) | Where the person left it, else its first step |
| **By id** | An attempt already started, read back from the task table | Where it stopped |

## One state

**While a task is active it has one state**: the step it is on and the values it holds.
Everything connected to it reads and writes that one state: the screen, a voice, a chat, an
LLM, the node running it. A value typed on screen is the value the voice hears; a value the
voice fills shows on screen; a step moved anywhere moves everywhere. Nothing keeps its own
copy.

**A task with a finish line is saved, however it was loaded.** Each attempt at it is one row
in the task table, owned by the person and naming the task's URI. The person is who is
signed in, or the guest the runtime issued; a guest's rows become theirs when they sign in.
Opening a task finds the person's open attempt at that URI, or starts a new one, so a form
half filled on a page carries on in an app, after a reload, or after a dropped call, and a
task finished once can be done again. Every step handed out carries the attempt's id as its
`ref`, and every hand-off and submit sends it back, so a call always names the attempt it
belongs to.

**A task with no finish line is never saved.** A presentation carries its position in each
call, the step marker, and the screen holds it.

| | Role |
|---|---|
| **The saved row** | The truth: one per attempt |
| **The screen** | The view of it, plus whatever is being typed right now |

Each confirmed step saves the screen's state to the row. A change made anywhere else (a
voice, a node, an Agent) is published to the screen. The submit carries the screen's answers
and they win over what was saved, so nothing typed is lost. The submit completes the row, and
a completed row is kept, marked completed, never deleted: a call that names a completed
attempt does nothing, rather than finding no row and starting the task again.

## What can be done to it

Every task offers the same features, however it is worked:

| Feature | Does |
|---|---|
| **Read** | The step it is on, that step's props, and the values so far |
| **Fill** | Sets a field on the step: an `input: true` prop (what an Agent writes, described by the prop) or an answer the task collects (its `outputs`). A filled field is `held`, not locked: the person can still change it, and the last change is saved. An `input: false` prop is fixed content and is never filled |
| **Move** | To the next step or back, never past a step with a required field still empty |
| **Save** | Writes the state to its row |
| **Submit** | Finishes it, only when every required field is filled, handing back its `outputs` |

A field is required unless the task marks it optional (`required` on its `outputs`, and on an
`input: true` prop). Only a required field holds back a step or the submit.

Two different ways reach them, with the same features and the same rules:

| | Loaded as MCP | Run by a node |
|---|---|---|
| **Who works it** | An Agent that found the task in Spatial | Nodes on a canvas: GPT-Live, a ChatGPT node, any LLM node, the page's submit |
| **How** | The Agent calls the task's tools | A node hands values to the Task Runner, which hands back the next step |
| **Step by step** | The Agent reads the step and fills it | The Task Runner hands out one step at a time: its empty fields, what is held, what the task is for |

An LLM may fill many fields in one go, from whatever it can reach: Spatial, the
conversation, memory. What it fills is `held`, not final: the person sees it and may change
it, and only their submit makes it the answer.

Connecting a node is a choice made on the canvas: a task with no voice or LLM wired to it is
worked by typing alone. Either way nothing skips an empty field and nothing finishes a task
short, and every fill is saved to the row and shown on the screen.

## Run by a node

The Task Runner is the node that runs a task in a workflow. It is a `PromiseNode`: each call
is one step of the state machine. It reads the task and its state, applies what arrived,
saves it, publishes where the task now is, and answers. It holds nothing between calls; the
task's row is the memory.

Each call publishes the task's position to the person's screen as app state,
`tasks.<ref>` = `{ step, stepNumber, stepsTotal }`, so whatever shows that task follows it.
The call that finds nothing outstanding fires `done`, and `result` carries what the task
finished with: its `outputs`, or an Agent's result. Wire `result` into the next Task Runner to
start the next task with it.

**Nothing but the task decides when it is finished.** A voice, a chat or the person typing
are only ways of filling it; the task runs without any of them, and none of them can finish
it short.

## Its events

A task is a node, and it sends its own events at the moments it saves, however it was run:

| Moment | Saved to the task table | Sent to the journey (Signal) |
|---|---|---|
| **Opened** | the attempt opens | `opened` |
| **Step** | the step and the answers | `step` |
| **Finished** | the attempt completes | `finished` |

Nothing else sends a task's events. `analytics` is separate: it only reports to the page's
analytics tool, when declared, and never decides whether an event is written
([Analytics](/design/analytics)).

## The submit

The submit is the standard one, the same as any form's, and it is just the last call:

1. The person presses Enter. The page sends `submit` with the task's URI and every answer.
2. The submit goes to whoever opened the task. An Agent that opened it from Spatial gets the
   answers as its tool call's result. A task with a `binding` has its own workflow called at
   its trigger, with the task's URI and the answers, as the person.
3. The Task Runner in that call lays the answers over the saved row. If nothing is
   outstanding, it completes the row and fires `done` and `result`; if a field is still
   empty, it holds the step back and publishes it, and the page shows what is short.

Nothing waits for the submit. Every call reads and writes the row, so a task is carried
across as many calls, and runs, as it takes. Five rules keep that safe:

| Rule | Why |
|---|---|
| **Only the call that completes the row fires `result`.** The row moves from open to completed once, in the database; any other call sees it completed and does nothing | A double Enter, or Enter while a voice hands off, would otherwise start the next task twice |
| **A completed row is kept, marked completed, and every call names its attempt** | A late call would otherwise find no row and start the task again |
| **Every call loads the task's definition from the URI on its row** | Without the definition a call cannot check the steps or the `outputs`, and would finish a task short |
| **A submit counts only for an attempt the person holds, and calls only that task's own `binding`**, under their sign-in or guest id | Otherwise a forged submit could start any workflow as anyone |
| **What runs once per task hangs off the Task Runner's outputs, never the trigger** | The submit calls the workflow at its trigger again, so anything wired to the trigger runs again |

A voice still on the call hears the task is `done` and ends. One task may span several runs;
the timeline links them through the row.

**A page that leaves stops its runs.** When the last connection of a page's conversation
closes and does not come back within ten seconds, every run on that conversation stops: its
Task Runners, its voice, all of it. The run is marked `failed` with the reason "the page
closed", and nothing fires `done` or `result`, so no next task starts from a page nobody is
on. Ten seconds rides out a reconnect, and the task's saved row keeps what it held.

## Not built yet

The standard above is ruled. These parts of it are not yet true in the code:

- **One name.** The page saves a task under its short name (`unoverse/about-you`), the Task
  Runner under what it was given, and map rows carry a `unoverse://tasks/` address. All
  become the task's URI.
- **Saved by URI.** A task loaded by URI is not saved today.
- **Analytics decides saving.** The page saves a task, and its submit completes it, only when
  the manifest has an `analytics` action. The finish line (`outputs` and a submit) decides
  both; an analytics event on submit stays optional and changes neither.
- **Attempts.** A row is found by workflow, person and task today, and a finished task
  cannot be started again for the same person. It becomes one row per attempt, found by the
  person's open attempt at the task's URI, and every step carries the attempt's id.
- **Optional fields.** Whether a prop can be marked `required` is not checked; today every
  collected answer holds the step back.
- **Agent tasks saved.** An Agent's run is not saved, so an Agent task cannot be resumed.
- **Its own events.** Today seven places in the conversation code send a task's events, the
  finish only when the manifest declares an `analytics` action, and memory keeps its own task
  rows beside the journey. A task run by the Task Runner on a page sends none, so Signal never
  sees it. All of it moves into the task's node. Built so far (2026-09-28): the Task Runner
  sends `opened` and `finished` itself. Not yet: `step` (it needs the saved attempt to know
  the step changed), and removing the old senders.
- **Guest rows linked on sign-in.** Designed, not checked.
- **The submit calling the binding.** Built for a page's template (2026-09-28): its submit
  calls the template's binding with the answers, and the Task Runner in that call finishes it;
  the wait is gone. Seen live on about-you: typed, no voice, Enter fired `done` and
  `result`. Not built for a task in an app or on the map.
- **Completing once.** Completing a row today clears it, and nothing stops two calls both
  firing `result`.
- **The definition on every call.** A Task Runner loaded by id reads the saved answers but not
  the task's definition.
- **Who may submit.** How a guest's submit passes the check for starting a workflow
  (`/api/executions` needs `workflow:author`) is not checked.
- **The trigger rule.** Nothing checks that once-per-task nodes hang off the Task Runner.
- **The voice ending on `done`.** Not built.
- **Props handed out.** A step should carry its empty `input: true` props as fields to fill
  (each with its description), its filled ones as `held` with the value from the row, and
  never an `input: false` prop, which is fixed content. Today the Task Runner hands out only
  empty `outputs` as fields, and passes every prop on the step as `held`, `input: false`
  included, valued with its Studio `preview` or `default`: a mock that looks filled, so an
  `input: true` prop is never asked for.
- **Update Task is not saved.** What the Update Task node fills is published to the screen
  but never written to the row.
- **The MCP tools.** Which tools an LLM uses to read, fill, move and submit is not checked.

## Doors

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
the map alone: one file, `agents/<name>.yaml` at the root of your org repo.

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
3. As the run moves, the face shows the latest four steps: the one running now and the
   ones just before it. An older step drops off the top as a new one starts, and the count
   (`12 of 40`) keeps the whole run. A step that waits on the person shows as waiting, and
   the person answers in the same conversation.
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
