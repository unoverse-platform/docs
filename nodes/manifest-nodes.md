---
sidebarTitle: "Anatomy of a node"
title: "Anatomy of a node"
---

Build a node file by file, following a real one. The folder shape is on
[Nodes](/nodes/overview).

> Computation over the request belongs to the platform. Description of the service belongs
> to you.

Auth schemes, retries, SSE framing and Handlebars resolution are the platform's job, written
once. Base URL, method, parameters, credentials and what comes out are yours, written as
data. You name a capability and the platform performs it. `unoverse lint` fails on a capability
that does not exist, so you find out while you write rather than at run time.

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

## Every file has a `$schema`

Each file opens with a `$schema` line naming the schema this site serves for it. An editor
with the YAML language server, such as VS Code with the YAML extension, reads it and
autocompletes every field and marks errors as you type. The same schemas are what
`unoverse lint` validates against, so the two cannot disagree.

### The split is by rate of change

| File | Holds | How often you touch it |
|---|---|---|
| `node.yaml` | type, kind, name, category, description, whenToUse | Once |
| `interface.yaml` | inputs, outputs, credentials, serviceConnectors | When the node's shape changes |
| `config.yaml` | `configSchema` + `ui:order` | Constantly. Every new option lands here |
| `api/` | one file per call, plus the events table | When the upstream API changes |
| `test.yaml` | `testData` | Alongside config |

`interface.yaml` is its own file for a different reason. It answers the question asked most
about any node: what can I connect to this? That answer should never mean scrolling past a
logo URL.

Every section except `api` may instead be inlined into `node.yaml`, so a simple node can
be one file. Defining a section in two places is an error, never a merge.

## The files, in full

Taken from the real `OpenAI` node, trimmed of its comments.

### `node.yaml`

```yaml node.yaml
$schema: https://docs.unoverse.ai/schemas/nodes/node.schema.json

type: OpenAI
kind: PromiseNode

name: OpenAI
category: AI
description: One prompt in, one completion out, with no streaming or tools

whenToUse: >-
  Single prompt to single completion, the plain one-shot text generator: summarise,
  rewrite, classify, answer. No streaming, no tools, no schema enforcement.

auth:
  required: false

capabilities:
  cacheable: false
```

`auth` is compulsory on every node, and `required: false` is the usual answer. It says your
node adds no requirement of its own, so the run reaches it as whoever the trigger admitted.
It does not mean public. [Who can run it](/nodes/who-can-run-it) covers the other half,
which the person building the workflow sets.

`whenToUse` is not documentation. The catalog embeds it and ranks it against what a
workflow-building agent is trying to do, so it decides whether your node is ever
**offered**. Read [node-discoverability.md](/nodes/node-discoverability) before you
write it.

`cacheable` opts the node into memoization: the engine may serve a prior run's output when
nothing that matters has changed, instead of re-executing. `true` is for idempotent,
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

Test runs withhold these nodes. `runTest`, `startTestRun` and `stepNode` record what the
node would have done and do not perform it. An agent building a workflow re-runs it after
every stage, and each attempt would otherwise put a real message in a real inbox. The
withheld output is marked `__withheld` and deliberately does not look like a success, so
nothing downstream can mistake it for a delivery. Your node's inputs are still traced, so
the message can be checked for correctness. A genuine send is a real run of
the workflow, and there is no parameter that lets a test perform one.

If you are unsure, set it. A withheld node costs a build nothing; an unwanted send costs a
real person something.

### `interface.yaml`

```yaml interface.yaml
$schema: https://docs.unoverse.ai/schemas/nodes/interface.schema.json

inputs:
  - name: signal
    type: object
    description: Data from previous nodes that can be referenced in templates

outputs:
  - name: text
    type: string
    description: The generated text
  - name: usage
    type: object
    description: Token usage for this call

credentials:
  - name: openAICredential
    required: true
    displayName: OpenAI API
```

### `config.yaml`

Canvas renders the form from this, and the executor resolves `{{ config.* }}` against the
saved values.

```yaml config.yaml
$schema: https://docs.unoverse.ai/schemas/nodes/config.schema.json

configSchema:
  type: object
  required: [model]
  properties:
    model:
      type: string
      title: Model
      enum: { $ref: models#enum }
      enumNames: { $ref: models#enumNames }
      default: { $ref: models#default }
    prompt:
      type: string
      title: Prompt
      description: The request to answer. Usually wired in from an upstream node.
      default: ""
      ui:field: template

"ui:order": [model, prompt]
```

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
    max_output_tokens: "{{ config.maxTokens }}"

  timeoutMs: 120000

  retry:
    attempts: 3
    backoff: exponential
    on: [429, 500, 502, 503, 504]

  transport: json

  error:
    when: "return !!response.error"
    message: "return response.error.message"
```

**A call is one thing.** `transport`, `terminator` and `error` sit inside the call. Whether a
reply arrives as one body or as a stream is decided by the request you make. Ask for
`stream: true` and you get a stream.

### How the reply arrives

| `transport` | The reply is |
|---|---|
| `json` | one JSON body |
| `text` | one body of plain text |
| `xml` | one XML body, parsed to the same plain shape JSON gives |
| `headers` | the headers themselves, for an endpoint whose answer is a header |
| `binary` | bytes, handed on rather than parsed |
| `sse` | a stream of events, so the node needs `match` rows in `events.yaml` |
| `ws` | a socket that stays open in both directions |

`xml` is for the services that never moved, and it parses to the same shape as JSON so an
events row reads it identically.

`encoding` is a second axis. `transport` says how the reply is framed, `encoding` says how
the values inside it are spelled. `dynamodbJson` is the one to know: DynamoDB carries
`{ name: { S: "Ada" } }` where you want `{ name: "Ada" }`, and the platform translates both
ways so a node never writes type tags.

**It is a list because one fact often takes more than one call.** Resolving a contact is a
search by email, then a second call built from the first reply. Later calls read earlier
ones as `calls.<name>`. That is why each entry is named. A node that grows a second call
does not change shape.

A list covers different calls in order. Where one call is really many, four capabilities
cover it. `paginate` walks pages. `chunk` writes a collection in batches. `poll` waits on a
job. `state` remembers between runs. See [Beyond one request](/nodes/calls-that-loop).

`error` matters more than it looks. An API that returns HTTP 200 with an error in the
body will otherwise read as success and hand nonsense downstream.

### `api/events.yaml`

**One row per output connector, in the same order `interface.yaml` declares them.** Read
this one file and you know the node's entire outward behaviour. Lint enforces the coverage
and the order, so it stays true after edits.

```yaml api/events.yaml
- emit: text
  from: response
  value: "return response.output.filter(o => o.type === 'message').map(...).join('')"

- emit: usage
  from: response
  value: "return response.usage"
```

A row's `from` says where it fires:

| `from` | Fires | What's in scope |
|---|---|---|
| `response` | a streamed event matching `match`, or the whole body when the transport settles | `response` |
| `narrator` | each line the narrator writes | `narrator.line` |
| `tool` | after a tool call RETURNS, with its result | `call.name`, `call.args`, `call.output` |
| `complete` | once at the end, over everything emitted | `events` |

`from: tool` exists because a tool's result is never in the HTTP stream. The tool loop
produced it.

**Two things are recorded without any row here**, because they are execution facts rather
than node outputs:

- **Every tool call** becomes a bar on the execution timeline the moment it returns, with
 its arguments, its result, its duration, and whether it succeeded.
- **Token usage** is read straight off the vendor's reply and summed across the turns of a
 run, detail blocks included (reasoning tokens, cached tokens). The runtime checks the
 three places a wire carries it: `usage` on the body or final chunk, `response.usage` on a
 Responses stream, and `metadata.usage` on a Bedrock stream. A node on any of those wires
 fills the execution's Token Usage view with nothing declared. A vendor that reports usage
 anywhere else is a platform gap to raise, not something to work around in the node. A
 connector named `usage`, as in the example above, is a different thing: the node choosing
 to hand the block downstream as data.

Both are fire and forget. Recording never slows a run and never fails one. A run from the
**Nodes** screen has no execution to attach to, so it records nothing.

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
$schema: https://docs.unoverse.ai/schemas/nodes/test.schema.json

testData:
  config:
    model: gpt-5.6
    prompt: Explain what a workflow engine does, in two sentences.
    maxTokens: 1200
  inputs:
    signal: { topic: workflow engines }
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

This catches the class of mistake no static check can. A real example: Handlebars always
produces a string, so `max_output_tokens: "{{ config.maxTokens }}"` once sent `"2048"` and
the API rejected it. Only running it showed that.

## Declaring `kind`

Every node states `PromiseNode` or `CallbackNode` in `node.yaml`, and lint checks the
declaration rather than trusting it. [Node types](/nodes/node-types) covers which to choose
and what makes a node one or the other.

## Handlebars and expressions

Two syntaxes read values out of the run and shape them into a call. The field decides which
applies: a `string` takes a `{{ }}` Handlebars string, and an `object` or `array` takes a
`return` expression.

[Handlebars and expressions](/nodes/expressions) is the full grammar, the sandbox, and every
root your calls can see.

## Allowed hosts

`package.yaml` lists the only hosts this package's nodes may reach. **Deny by default.**

```yaml package.yaml
allowedHosts:
  - api.openai.com
```

The host list is what makes a manifest safe to accept from someone else. "Data cannot
execute" does not save you on its own: a URL plus `{{ credentials.x.apiKey }}` is
exfiltration in six lines with nothing to sandbox. So the capability is restricted instead.

Enforced twice: statically by lint, and at run time **after** templating, because a host
can itself come from a Handlebars string. Non-https is refused outright, since a credential must never
travel in clear text. `*.example.com` matches exactly one subdomain level.

## Check it

```bash
unoverse lint
```

Every message names the rule it broke. Errors stop a deploy. Warnings inform.
`unoverse deploy studio` runs the same check before it sends anything.

It catches what would otherwise surface much later, in a workflow, as nothing happening:

- an output connector nothing emits to
- an events table out of connector order
- a credential field that does not exist
- a `testData.config` key your `config.yaml` never declared
- a host missing from `allowedHosts`
- a capability the platform does not implement

## Next steps

<Card title="Node discoverability" icon="search" href="/nodes/node-discoverability" horizontal>
Read this before writing `whenToUse`. It decides whether your node is ever offered.
</Card>

<Card title="node.yaml" icon="book-marked" href="/reference/node-envelope" horizontal>
Every field a node envelope takes, generated from the schema.
</Card>
