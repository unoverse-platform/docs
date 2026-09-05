---
sidebarTitle: "Testing nodes"
title: "Testing nodes"
---

Run your node against the real service before you put it in a workflow. **studio** has a
Nodes tab for exactly that, and nothing has to be published first.

## In studio

Open the **Nodes** tab and pick your node. The screen shows three things.

**The node**, as everyone else will read it: name, category, description, and the
`whenToUse` you wrote. Any credential it needs is named here too, so a node asking for
something you have not set up says so before you run it.

**The settings**, rendered from your `config.yaml`. This is the same form **canvas** shows,
built from the same file, so a field that reads badly here reads badly everywhere.

**The output**, empty until you press Run.

Fill in the settings, press **Run**, and the node calls the real service. A streaming node
streams into the pane as it arrives.

This is the fastest way to see whether your node works, and it is also the honest preview of
your `config.yaml`. If the labels are unclear or the fields are in a strange order, fix it
now rather than after someone else meets it.

## Load sample

If your node has `test.yaml`, **studio** shows a **Load sample** button. It fills the form from
`testData.config` and the inputs from `testData.inputs`, so you are one click from a run
rather than typing settings each time.

That is most of why `test.yaml` earns its place.

```yaml test.yaml
$schema: https://docs.unoverse.ai/schemas/nodes/test.schema.json

testData:
  config:
    model: gpt-5.6
    prompt: Explain what a workflow engine does, in two sentences.
    maxTokens: 1200
  inputs:
    signal:
      topic: workflow engines
  expect:
    text: "return output.text.length > 0"
```

Write the fixture as a real request, not a minimal one. It is the sample every future
reader loads first.

## Before you deploy

Check every node in the workspace, with nothing running:

```bash
unoverse lint
```

It runs every static rule. An output nothing emits to, an events table out of connector
order, a host missing from `allowedHosts`, a fixture that does not match the settings form:
each message names the rule it broke. `unoverse deploy studio` runs the same check before
it sends anything, so a tick here is a tick there.

## Keys stay yours

A run needs a real key, and **studio** stores none.

It reads your own `.env`, using the credential name and field in upper snake case with any
trailing `Credential` dropped. So `openAICredential.apiKey` is `OPENAI_API_KEY`. A missing
one is named before anything runs.

## What `expect` is for

`expect` turns a run into a check. Each key is an output, and each value is an expression
over `output` that has to come back true.

```yaml
expect:
  text: "return output.text.length > 0"
  usage: "return output.usage.total_tokens > 0"
```

Assert the **shape**, not the words. A model writes something different every time, so
`output.text.length > 0` holds and `output.text === "Hello"` does not.

For a service node, name the method to call:

```yaml
testData:
  call:
    method: createEmbedding
    params: { text: hello }
  expect:
    embedding: "return output.dimensions === 1024"
```

## What a run cannot tell you

A node can pass here and still misbehave in a workflow, because the bench feeds it
`testData.inputs` while a workflow feeds it whatever the edges carry.

When that happens, the difference is almost always a Handlebars path: the node id or the
output name does not match the edge you drew. [Troubleshooting](/nodes/troubleshooting)
covers it.

## Next steps

<Card title="Packages" icon="package" href="/nodes/package-marketplace" horizontal>
The envelope around a set of nodes, and publishing it.
</Card>

<Card title="test.yaml" icon="book-marked" href="/reference/node-test" horizontal>
Every field a fixture takes, generated from the schema.
</Card>
