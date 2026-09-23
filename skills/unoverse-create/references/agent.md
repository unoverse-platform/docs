# Playbook: Agents

**Read first:** [Tasks](https://docs.unoverse.ai/design/tasks.md). An Agent is a workflow on
a canvas with no interface of its own, listed on the map so a conversation can reach for it.
It is the one thing authored for the map alone: everything else (a component, a template, an
app) is offered to the map by its Available switch and keeps its meta on its own manifest.

One file: `design/<project>/agents/<name>.yaml`.

## The rules that bite

1. **An Agent is an outcome, not a canvas.** `whenToUse` says what the person is trying to
   get done, in their words. "What were my top transactions last month", never "runs the
   account workflow". The [discoverability rules](https://docs.unoverse.ai/nodes/node-discoverability.md)
   apply exactly as they do to a manifest.
2. **The door is three fields, always.** `workflow` (a canvas id in this org), `trigger`
   (the Input Trigger node id) and `output` (the node whose output is the result). Find them
   on the canvas: the id in the Studio URL, the node ids in the definition.
3. **The input schema is the trigger's.** Declare it on the Input Trigger node's Input
   Schema on the canvas, never on this file. None means a single `message`.
4. **The face is shared.** `app` defaults to `unoverse://components/agent-card`. Name a
   component only when the result deserves its own face. Never author a card per Agent.
5. **Vocabulary.** A canvas holds workflows. A workflow is one trigger and its downstream.
   An Agent is a workflow by another name.

## Workflow

1. Read the Tasks page and any Agent in the workspace.
2. Write the file: `type: agent`, `name` equal to the file name, the discovery meta, the
   `message`, and the door.
3. `unoverse lint`, then Studio's Agents lane to see it and switch it Available.
4. On a canvas, install it from the Content Library, then call it from a chat.

## Things that go wrong

| Symptom | Cause |
|---|---|
| The Agent never appears in search | Not Available in Studio, or not installed on the canvas. Both are needed |
| The call returns with "produced no output" | `output` names a node the run never reached, or the trigger id is wrong |
| The card shows "waits for the person" for ever | The trigger fires a component node with nobody in front of it |
| Lint rejects the door | One of workflow, trigger, output is missing |
