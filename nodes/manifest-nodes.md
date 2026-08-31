---
sidebarTitle: "Anatomy of a Node"
title: "Anatomy of a Node"
---

A node is a service you drag onto the **canvas**. It connects an Agent to another system.

There is a marketplace of nodes. When none of them suits your situation, you build your own.

A node you build is a folder of YAML files. You describe the API call, and the platform
makes it.

> Computation over the request belongs to the platform. Description of the service belongs
> to you.

Auth schemes, retries, SSE framing and template resolution are the platform's job, written
once. Base URL, method, parameters, credentials and what comes out are yours, written as
data. You name a capability and the platform performs it, and `unoverse node lint` fails on
a capability that does not exist, so you find out while you write rather than at run time.

## Build and publish

You build a node in **studio**, on your own machine. It reads your files straight off disk,
so there is no server to start and no database to connect to while you work, which is why
it works offline.

Publishing is a separate act pointed at a separate place. It writes your node into a
universe as a record. There is no commit, no package to build and no image to push. Where
you keep your files before that is your business.

| Step | Where |
|---|---|
| Write the node | **studio**, on your own files |
| Check and run it | your machine, against the real service |
| Publish it | a record in the universe you chose |

### A published node waits to be accepted

A node is the only thing you publish that holds a URL and a credential, so it is the only
one somebody reviews.

Your node arrives **pending**. Whoever runs the universe sees what it is asking for before
it can run: the hosts it wants to call, the credential types it needs, and what changed
since the last version. Accepting it makes it live.

**After that, you are not interrupted.** Fix a prompt, change a mapping, correct an
expression, and publishing takes effect straight away. Publishing stops for acceptance again
only when the node reaches for something new, such as another host or another credential
type.

So the list in `allowedHosts` is not paperwork. It is the thing somebody says yes to, and it
is why they can say yes quickly.

> Publishing from **studio** is not available yet. Today you write, check and run nodes
> locally with the two commands on this page.

## One folder is one node

<Tree>
  <Tree.Folder name={<><b>nodes/&lt;package&gt;</b> <span className="tree-note">in your studio project workspace</span></>} defaultOpen>
    <Tree.File name={<><b>package.yaml</b> <span className="tree-note">name, category, allowedHosts, requires</span></>} />
    <Tree.Folder name="credentials" defaultOpen>
      <Tree.File name={<><b>&lt;name&gt;Credential.yaml</b> <span className="tree-note">one credential type</span></>} />
    </Tree.Folder>
    <Tree.Folder name="shared" defaultOpen>
      <Tree.File name={<><b>endpoints.yaml</b> <span className="tree-note">fragments several nodes reuse</span></>} />
      <Tree.File name={<><b>helpers.yaml</b> <span className="tree-note">named functions every expression can call</span></>} />
    </Tree.Folder>
    <Tree.Folder name="nodes" defaultOpen>
      <Tree.Folder name="&lt;NodeName&gt;" defaultOpen>
        <Tree.File name={<><b>node.yaml</b> <span className="tree-note">what it is: the only required file</span></>} />
        <Tree.File name={<><b>interface.yaml</b> <span className="tree-note">what it connects to</span></>} />
        <Tree.File name={<><b>config.yaml</b> <span className="tree-note">the settings form</span></>} />
        <Tree.Folder name={<><b>api</b> <span className="tree-note">always a folder</span></>} defaultOpen>
          <Tree.File name={<><b>run.yaml</b> <span className="tree-note">the calls it makes</span></>} />
          <Tree.File name={<><b>events.yaml</b> <span className="tree-note">everything that leaves the node</span></>} />
        </Tree.Folder>
        <Tree.File name={<><b>test.yaml</b> <span className="tree-note">a fixture that runs</span></>} />
      </Tree.Folder>
    </Tree.Folder>
  </Tree.Folder>
</Tree>

Each file carries a `$schema` pointer, so your editor autocompletes every field and shows
errors as you type. The schema descriptions are the field reference, so they cannot drift
from the format.

### The split is by rate of change

| File | Holds | How often you touch it |
|---|---|---|
| `node.yaml` | type, kind, name, category, description, whenToUse | Once |
| `interface.yaml` | inputs, outputs, credentials, serviceConnectors | When the node's shape changes |
| `config.yaml` | `configSchema` + `ui:order` | Constantly. Every new option lands here |
| `api/` | one file per call, plus the events table | When the upstream API changes |
| `test.yaml` | `testData` | Alongside config |

`interface.yaml` is its own file for a different reason than the rest: it answers the
question asked most about any node, "what can I connect to this?", and that should never
mean scrolling past a logo URL.

Every section except `api` may instead be inlined into `node.yaml`, so a simple node can
be one file. Defining a section in two places is an error, never a merge.

### The five files, in full

Taken from the real `OpenAI` node, trimmed of its comments.

### `node.yaml`

```yaml node.yaml
$schema: ../../../_schema/node.schema.json

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
It does not mean public. [Who Can Run It](/nodes/who-can-run-it) covers the other half,
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
is called; if a key field collects nothing on a run, that run is not cached.

`emitsExternally` is the other side of that coin, and you set it when your node's effect
**cannot be undone**: it sends, posts, charges, or writes into somewhere outside the
platform. A deleted scratch row can be undone and needs nothing; a delivered email cannot.

```yaml node.yaml
capabilities:
  cacheable: false
  emitsExternally: true
```

Test runs withhold these nodes. `runTest`, `startTestRun` and `stepNode` record what the
node would have done and do not perform it, because an agent building a workflow re-runs it
after every stage, and without this each attempt would put a real message in a real inbox.
The withheld output is marked `__withheld` and deliberately does not look like a success, so
nothing downstream and no reviewer can mistake it for a delivery; your node's inputs are
still traced, so the message can be checked for correctness. A genuine send is a real run of
the workflow, and there is no parameter that lets a test perform one.

If you are unsure, set it. A withheld node costs a build nothing; an unwanted send costs a
real person something.

### `interface.yaml`

```yaml interface.yaml
$schema: ../../../_schema/interface.schema.json

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
$schema: ../../../_schema/config.schema.json

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

Every node's form also ends with two access controls ("Require sign-in", "Require role")
that the platform injects; you never declare them, and their names (`authRequired`,
`authRole`) are reserved. See [Who Can Run It](/nodes/who-can-run-it).

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

**A call is one thing.** `transport`, `terminator` and `error` sit inside the call, because
whether a reply arrives as one body or as a stream is decided by the request you make. Ask
for `stream: true` and you get a stream.

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
ones as `calls.<name>`, which is why each entry is named. A node that grows a second call
does not change shape.

A list covers different calls in order. Where one call is really many, four capabilities
cover it: `paginate` to walk pages, `chunk` to write a collection in batches, `poll` to wait
on a job, and `state` to remember between runs. See
[Beyond One Request](/nodes/calls-that-loop).

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
 three places a wire carries it (`usage` on the body or final chunk, `response.usage` on a
 Responses stream, `metadata.usage` on a Bedrock stream), so a node on any of those wires
 fills the execution's Token Usage view with nothing declared. A vendor that reports usage
 anywhere else will not be picked up automatically: that is a platform gap to raise, not
 something to work around in the node. A connector named `usage` in the example above is a different thing: that is
 the node choosing to hand the block downstream as data.

Both are fire and forget: recording never slows a run and never fails one, and a node test,
which has no execution to attach to, records nothing.

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
$schema: ../../../_schema/test.schema.json

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

Then run it against the real API, with no platform running:

```bash
unoverse node test OpenAI
```

Keys come from your own `.env` as `<CREDENTIAL>_<FIELD>` in upper snake case, so
`openAICredential.apiKey` reads `OPENAICREDENTIAL_APIKEY`. They are read for that one run
and stored nowhere. This is deliberate: you test with **your** key, never with a universe's
stored credentials, which your manifest has no way to reach.

This catches the class of mistake no static check can. A real example: Handlebars always
produces a string, so `max_output_tokens: "{{ config.maxTokens }}"` once sent `"2048"` and
the API rejected it. Only running it showed that.

## Declaring `kind`

Every node states `PromiseNode` or `CallbackNode` in `node.yaml`, and lint checks the
declaration rather than trusting it. [Node types](/nodes/node-types) covers which to choose
and what makes a node one or the other.

## Templates and expressions

Two syntaxes read values out of the run and shape them into a call, and which one applies
is decided by the field: a `string` takes a `{{ }}` template, while an `object` or `array`
takes a `return` expression.

[Templates and expressions](/nodes/expressions) is the full grammar, the sandbox, and every
root your calls can see.

## Allowed hosts

`package.yaml` lists the only hosts this package's nodes may reach. **Deny by default.**

```yaml test.yaml
allowedHosts:
  - api.openai.com
```

The host list is what makes a manifest safe to accept from someone else. "Data cannot
execute" does not save you on its own: a URL plus `{{ credentials.x.apiKey }}` is
exfiltration in six lines with nothing to sandbox. So the capability is restricted instead.

Enforced twice: statically by lint, and at run time **after** templating, because a host
can itself be templated. Non-https is refused outright, since a credential must never
travel in clear text. `*.example.com` matches exactly one subdomain level.

## Check it

```bash
unoverse node lint
```

Every message names the rule it broke and the page that explains it. Errors stop the build.
Warnings inform.

It catches what would otherwise surface much later, in a workflow, as nothing happening:

- an output connector nothing emits to
- an events table out of connector order
- a credential field that does not exist
- a `testData.config` key your `config.yaml` never declared
- a host missing from `allowedHosts`
- a capability the platform does not implement

## Next steps

<Card title="Node Discoverability" icon="search" href="/nodes/node-discoverability" horizontal>
Read this before writing `whenToUse`. It decides whether your node is ever offered.
</Card>

<Card title="node.yaml" icon="book-marked" href="/reference/node-envelope" horizontal>
Every field a node envelope takes, generated from the schema.
</Card>
