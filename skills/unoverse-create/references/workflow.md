# Playbook: build a workflow on the canvas

**A different journey.** Every other playbook writes files in the workspace. A workflow is
built on a running universe's **canvas** through the builder MCP, and only here does a
pairing code exist. Do not carry this ceremony into any other artifact.

## Before you start

1. **The universe is running.** `unoverse start` in the universe folder, or `npm run dev`
   in the platform monorepo. `unoverse where` prints its addresses.
2. **The builder MCP is connected.** `unoverse create` registered it in the universe's
   `.mcp.json`. If it shows failed, the universe was not up when the session started:
   reconnect with `/mcp`.
3. **The developer gives you a pairing code.** Ask them to open a new empty workflow on
   the **canvas**, click **Connect agent**, and paste the code it shows. It binds you to
   that one workflow, single use, ten minutes. There is deliberately no way to list or
   find workflows from here. Prefer a fresh workflow: saves are provenance-scoped, and
   wiring into nodes you did not create may be refused.

## The contract

1. **`bindWorkflow` first.** Every other tool refuses until the session is bound.
2. **Goal first.** `getGoal`, and `defineGoal` if none is locked. Mutations refuse until
   a goal is locked. When you believe the build is done, `checkGoal`: an independent
   judge verdicts it and names the one next move. You never judge your own work.
3. **Read the builder's own guides before building**, through `readBuilderSkill`:
   `solution-design` first on any new goal, then `workflow-building`,
   `workflow-testing`, `template-references`. They are always current and are not
   repeated here.
4. **Build one stage at a time.** `saveWorkflow` one stage, `runTest`, read the trace, add
   the next stage from that evidence. Never pre-wire the whole graph.
5. **Ground truth.** `getCanvas` is the real graph. A node type is valid only if
   `getNodeCatalog` returned it. Layout and ids are not yours to set.
6. **Every Agent node that streams its reasoning gets a streaming text component wired
   to that output.** The person watching must see the Agent think.
7. **Done** is a saved workflow with no dropped edges that runs end to end with real,
   non-empty output from the terminal node. Report what you built and what the test
   showed, then stop. Never paste the deliverable into a node.

## Things that go wrong

| Symptom | Cause |
|---|---|
| Every tool returns "No workflow bound" | Call `bindWorkflow` with a fresh pairing code |
| "invalid or expired pairing code" | Codes are single use and expire. Ask for a new one |
| Tools error after working earlier | The universe restarted. Reconnect with `/mcp` |
| A save rejects an edge into an existing node | Provenance guard. Build on a fresh workflow |
