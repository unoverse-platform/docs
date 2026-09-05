---
sidebarTitle: "Anatomy of a node"
title: "Anatomy of a node"
---

Build a node file by file, following a real one. The folder shape is on
[Nodes](/nodes/overview).

You write what the service needs: the URL, the method, the parameters, the credential, and
what comes out. The platform does the rest: auth, retries, streaming and Handlebars.
`unoverse lint` fails on anything the platform does not do, so you find out while you write
rather than at run time.

## Build and check

You build a node in **studio**, on your own machine. It reads your files straight off disk.
There is no server to start and no database to connect to, so it works offline.

| Step | Where |
|---|---|
| Write the node | **studio**, on your own files |
| Run it against the real service | the **Nodes** screen in **studio** |
| Check it | `unoverse lint`, the same check `unoverse deploy studio` runs before it sends |
| Ship it | `unoverse deploy studio`, which carries every node in the workspace with your components and skills |

A deployed node is live in that universe's node library as soon as the deploy finishes.

## Editor help

A **studio** workspace carries a `.vscode/settings.json` that maps every node file to its
schema on this site. With the YAML extension installed, your editor autocompletes every
field and marks errors as you type, in every file of every node, with nothing written in
the file itself. The same schemas are what `unoverse lint` validates against, so the two
cannot disagree. Any other editor that reads JSON Schema can use the same URLs, which start
at [node.schema.json](https://docs.unoverse.ai/schemas/nodes/node.schema.json).

## The split is by rate of change

| File | Holds | How often you touch it |
|---|---|---|
| `node.yaml` | type, kind, name, category, description, whenToUse | Once |
| `interface.yaml` | inputs, outputs, credentials, serviceConnectors | When the node's shape changes |
| `config.yaml` | `configSchema` + `ui:order` | Constantly. Every new option lands here |
| `api/` | the calls, and the events table that puts values on outputs | When the upstream API changes |
| `test.yaml` | `testData` | Alongside config |

`interface.yaml` is its own file for a different reason. It answers the question asked most
about any node: what can I connect to this? That answer should never mean scrolling past a
logo URL.

Every section except `api` may instead be inlined into `node.yaml`, so a simple node can
be one file. Defining a section in two places is an error, never a merge.

## The files, in full

Taken from the real `OpenAI` node, exactly as it ships, with only its comments removed.

### `node.yaml`

```yaml node.yaml
type: OpenAI
kind: PromiseNode

name: OpenAI
category: AI
color: "#2F6F66"
description: One prompt in, one completion out, with no streaming or tools
whenToUse: >-
  Single prompt to single completion, the plain one-shot text generator: summarise,
  rewrite, classify, answer. No streaming, no tools, no schema enforcement; reach for a
  heavier node only when a step genuinely needs token streaming, iterative tool use, or
  strict JSON output.

auth:
  required: false

capabilities:
  cacheable: false
```

`kind` is `PromiseNode` for a node that answers once and `CallbackNode` for one that keeps
answering. Lint checks the declaration against the calls. [Node types](/nodes/node-types)
covers the choice.

`auth` is compulsory on every node, and `required: false` is the usual answer. It says your
node adds no requirement of its own, so the run reaches it as whoever the trigger admitted.
It does not mean public. [Who can run it](/nodes/who-can-run-it) covers the other half,
which the person building the workflow sets.

`whenToUse` is not documentation. The catalogue embeds it and ranks it against what a
workflow-building agent is trying to do, so it decides whether your node is ever
**offered**. Read [Node discoverability](/nodes/node-discoverability) before you write it.

`cacheable` opts the node into caching: the engine may serve a prior run's output when
nothing that matters has changed, instead of running again. `true` is for idempotent,
side-effect-free reads (search, scrape, fetch-by-id), never for anything effectful or
non-deterministic. Nodes that read content through a **volatile URL** (a presigned link
that changes every run) use the object form and declare the content's real identity
instead:

```yaml node.yaml
capabilities:
  cacheable:
    ignore: [fileUrl]     # volatile config fields, dropped from the fingerprint
    key: [etag]           # input leaf fields that identify the content
```

Every config field you did not `ignore` still busts the cache. `key` fields are matched by
dot suffix against the resolved inputs, so the declaration works whatever the upstream node
is called. If a key field collects nothing on a run, that run is not cached.

`emitsExternally` is the other side of that coin. Set it when your node's effect **cannot be
undone**: it sends, posts, charges, or writes somewhere outside the platform. A deleted scratch row can be undone and needs nothing; a delivered email cannot.

```yaml node.yaml
capabilities:
  cacheable: false
  emitsExternally: true
```

Test runs on the **canvas** withhold these nodes. They record what the node would have done
and do not perform it. An agent building a workflow re-runs it after
every stage, and each attempt would otherwise put a real message in a real inbox. The
withheld output is marked `__withheld` and deliberately does not look like a success, so
nothing downstream can mistake it for a delivery. Your node's inputs are still traced, so
the message can be checked for correctness. A genuine send is a real run of
the workflow, and there is no parameter that lets a test perform one.

If you are unsure, set it. A withheld node costs a build nothing; an unwanted send costs a
real person something.

### `interface.yaml`

One input, two outputs, and the credential the calls will need.

```yaml interface.yaml
inputs:
  - name: signal
    type: object
    description: Data from previous nodes that can be referenced in templates

outputs:
  - name: text
    type: string
    description: The generated text response
  - name: usage
    type: object
    description: Token burn (prompt_tokens, completion_tokens, total_tokens)

credentials:
  - name: openAICredential
    required: true
    displayName: OpenAI API
    description: OpenAI API credentials for authentication
```

### `config.yaml`

**canvas** renders the form from this, and the platform resolves `{{ config.* }}` against
the saved values.

```yaml config.yaml
configSchema:
  type: object
  required: [model, prompt]
  properties:
    model:
      type: string
      title: Model
      description: Select the OpenAI model to use
      enum: { $ref: models#enum }
      enumNames: { $ref: models#enumNames }
      default: { $ref: models#default }
      resolve: modelTier
    maxTokens:
      type: number
      title: Max Tokens
      description: >-
        Hard ceiling on the reply. The model stops when it hits this, mid-sentence and
        without an error, so raise it for long output rather than leaving it to trim.
      default: 1200
      minimum: 1
      maximum: 128000
    systemPrompt:
      type: string
      title: System Prompt
      description: >-
        Standing instructions for every run: the model's role, tone and limits. Optional.
        Shared blocks work here, e.g. {{prompt.markdownGuidelines}}.
      default: ""
      ui:field: template
    prompt:
      type: string
      title: Prompt
      description: The request to answer. Usually wired in from an upstream node.
      default: ""
      ui:field: template

ui:order: [model, maxTokens, systemPrompt, prompt]
```

`{ $ref: models#enum }` reads a fragment from `shared/models.yaml`, so every node in the
package offers the same list. [Packages](/nodes/package-marketplace) covers `shared/`.
`resolve: modelTier` lets a saved workflow keep working when a model generation is retired:
the platform resolves the saved name to the current model of the same tier.

Every node's form also ends with two access controls, **Require sign-in** and **Require
role**, which the platform injects. You never declare them, and their names `authRequired`
and `authRole` are reserved. See [Who can run it](/nodes/who-can-run-it).

`description` is the help text a person reads under the field. Say what the setting
**does**, keep it short, and don't restate the label.

`ui:field: template` is what makes a field wirable from an upstream node.

### `api/run.yaml`

A list, always, even when there is one call. Each entry is named for what it fetches.

```yaml api/run.yaml
- name: generate
  method: POST
  url: { $ref: endpoints#responses }

  credential:
    scheme: bearer
    token: "{{ credentials.openAICredential.apiKey }}"

  body:
    model: "{{ config.model }}"
    input: "{{ config.prompt }}"
    instructions: "{{ config.systemPrompt }}"
    max_output_tokens: "{{ config.maxTokens }}"

  timeoutMs: 120000

  retry:
    attempts: 3
    backoff: exponential
    on: [429, 500, 502, 503, 504, 520, 522, 524]

  transport: json

  error:
    when: "return !!response.error"
    message: "return response.error.message"
```

**A call is one thing.** `transport`, `terminator` and `error` sit inside the call. Whether a
reply arrives as one body or as a stream is decided by the request you make. Ask for
`stream: true` and you get a stream.

**It is a list because one fact often takes more than one call.** Resolving a contact is a
search by email, then a second call built from the first reply. Later calls read earlier
ones as `calls.<name>`. That is why each entry is named. A node that grows a second call
does not change shape.

A list covers different calls in order. Where one call is really many, four capabilities
cover it. `paginate` walks pages. `chunk` writes a collection in batches. `poll` waits on a
job. `state` remembers between runs. See [Beyond one request](/nodes/calls-that-loop).

`error` matters more than it looks. An API that returns HTTP 200 with an error in the
body will otherwise read as success and hand nonsense downstream.

The `{{ }}` values are Handlebars strings and the `return` values are expressions. The
field decides which applies, and [Handlebars and expressions](/nodes/expressions) is the
grammar, the sandbox and every root a call can see.

### `api/events.yaml`

**One row per output connector, in the same order `interface.yaml` declares them.** Read
this one file and you know the node's entire outward behaviour. Lint enforces the coverage
and the order, so it stays true after edits.

```yaml api/events.yaml
- emit: text
  value: >-
    return response.output
      .filter(item => item.type === 'message')
      .flatMap(item => item.content)
      .filter(part => part.type === 'output_text')
      .map(part => part.text)
      .join('')

- emit: usage
  value: "return response.usage"
```

For a streaming node, two controls matter:

- `accumulate: true` emits the running total instead of the fragment. A consumer wants the
 text so far, not one word.
- `throttleMs` or `throttleChars` bound how often a row emits. Nothing held back is
 dropped; it is flushed when the run ends.

```yaml api/events.yaml
- emit: stream
  from: response
  match: response.output_text.delta
  value: "return response.delta"
  accumulate: true
  throttleMs: 200
```

### `test.yaml`

```yaml test.yaml
testData:
  config:
    model: gpt-5.6-terra
    maxTokens: 256
    systemPrompt: You are a concise assistant.
    prompt: Write a one-sentence summary of what a workflow engine does.
  inputs:
    signal:
      question: What does a workflow engine do?
  expect:
    text: "return output.text.length > 0"
    usage: "return output.usage.total_tokens > 0"
```

Then open it on the **Nodes** screen in **studio**, press **Load sample**, then **Run**. The
node calls the real API, with no platform running.

Keys come from your own `.env`, named from the credential and the field in upper snake
case with the trailing `Credential` dropped, so `openAICredential.apiKey` reads
`OPENAI_API_KEY`. They are read for that one run
and stored nowhere. This is deliberate: you test with **your** key, never with a universe's
stored credentials, which your manifest has no way to reach.

This catches the class of mistake no static check can: a field the service rejects, a path
that resolves to nothing, a reply shaped differently from what the events rows expect.
Running the node is the only way to see the request as the service sees it.

## Allowed hosts and checks

Every host a node calls is listed in its package's `allowedHosts`, and a call to anywhere
else is refused: [Packages](/nodes/package-marketplace) covers the list. `unoverse lint`
checks every file against every rule before you deploy: [Testing nodes](/nodes/testing-nodes)
covers what it catches.

## Next steps

<Card title="Node discoverability" icon="search" href="/nodes/node-discoverability" horizontal>
Read this before writing `whenToUse`. It decides whether your node is ever offered.
</Card>

<Card title="node.yaml" icon="book-marked" href="/reference/node-envelope" horizontal>
Every field a node envelope takes, generated from the schema.
</Card>
