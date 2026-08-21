# CLAUDE.md: building unoverse nodes

Authoritative agent guide. A node is a folder of YAML, and this file is the condensed
rulebook. The pages beside it hold the detail: `manifest-nodes.md` first, then the
numbered guides.

## A node is a folder

```
nodes/<package>/            # in your Studio project workspace
  package.yaml                # the package: name, category, allowedHosts, requires
  credentials/
    <name>Credential.yaml     # the SHAPE of a credential, never a value
  shared/
    endpoints.yaml            # fragments several nodes $ref
    helpers.yaml              # named functions every expression can call
  nodes/
    <NodeName>/
      node.yaml               # what it IS            (the only REQUIRED file)
      interface.yaml          # what it CONNECTS TO
      config.yaml             # the settings form
      api/                    # ALWAYS a folder
        run.yaml              #   the calls it makes
        events.yaml           #   everything that leaves the node
      test.yaml               # a fixture that runs
```

Never write TypeScript for a node. There is no `src/`, no `package.json`, no build, no
publish step. If the format cannot express something, the platform is missing a capability;
say so rather than reaching for code.

## Non-negotiable rules

1. **`api` is always a folder.** `api.yaml` and an inline `api:` block are lint errors.
2. **`api/run.yaml` is a LIST**, even for one call. Each entry has a `name`.
3. **`api/events.yaml` is one row per output connector, in the order `interface.yaml`
   declares them.** Lint enforces coverage and order.
4. **A section is defined in ONE place.** Inline in `node.yaml` or its own file, never both.
5. **Declare every host in `allowedHosts`.** Deny by default, https only.
6. **Never put a credential value in a file.** Declare the shape, reference it by name.
7. **Never hard-code instruction text.** Use `{{prompt.<blockName>}}` so it tracks the block.
8. **A manifest may only name a capability the platform implements.** Lint fails otherwise.

## Decide `kind` first

| The node | `kind` |
|---|---|
| One call, one reply | `PromiseNode` |
| Streams, or loops over tool calls | `CallbackNode` |

Lint verifies it. A node is a `CallbackNode` when its LAST call's transport is `sse` or `ws`,
or it declares a `toolExchange`, or an input declares `SPAWN`. Declaring `PromiseNode` while
doing any of them is an error.

Only the LAST call counts: it is the node's answer, and every earlier call settles by
definition. `paginate`, `chunk`, `poll`, `state`, `loop` and `presign` change nothing here
and work on either kind.

## `node.yaml`

```yaml
$schema: ../../../_schema/node.schema.json

type: Example                 # the identity a saved workflow stores. Never rename lightly
kind: PromiseNode
name: Example
category: AI                  # the JOB, not the implementation
color: "#7c5cff"
description: One line on what it does
whenToUse: >-
  Outcome first, in the words a planner would use. Then what disqualifies it, as a
  property of the work. Never name another node.
# WHO MAY RUN THIS. Compulsory on every node (who-can-run-it.md).
# `required: false` adds no requirement of its own: the node runs for whoever the
# trigger admitted. It does NOT mean public.
auth:
  required: false
  # role: finance:approve     # optional; implies required: true

capabilities:
  cacheable: false            # true ONLY for idempotent, side-effect-free reads
  # emitsExternally: true     # set when the effect cannot be undone (send, post, charge)
```

**`whenToUse` decides whether the node is ever offered.** Read
`node-discoverability.md` before writing it. Lead with the job, disqualify by property,
put any wiring fact last.

**`cacheable: true` only for a pure read.** Never for anything effectful, because reuse
skips the side effect, and never for anything non-deterministic, because re-running is the
correct behaviour.

**`emitsExternally: true` when the effect has no inverse.** Sending an email, posting to a
third party, charging a card, firing a webhook: once it has left the building the engine
cannot take it back. Test runs (`runTest`, `startTestRun`, `stepNode`) **withhold** these
nodes, tracing what the node would have done instead of doing it, because a build calls
`runTest` after every stage and each one would otherwise reach a real person. A real send is
a real run of the workflow; there is no flag that lets a test perform it.

Set it whenever the effect cannot be undone. Deleting a scratch row can be undone and does
not need it. If in doubt, set it: a withheld node costs a build nothing, an unwanted send
costs someone something. Only ever set it to `true` — omitting it is the default.

This is the positive half of what `cacheable: false` already implies. Saying "do not cache
me" describes an effectful node only by omission, which the engine cannot act on.

**The object form, for content keyed by identity rather than by URL.** A parse node's
`fileUrl` is usually a presigned link: a new signature every run over the same bytes, so
caching on it never hits, and caching on the bare URL risks a stale transcript when the
file changes underneath it. Declare what is volatile and what actually identifies the
content:

```yaml
capabilities:
  cacheable:
    ignore: [fileUrl]     # volatile config fields, dropped from the fingerprint
    key: [etag]           # input leaf fields that identify the content
```

`ignore` names top-level resolved-config fields that are transport, not identity — every
other config field still busts the cache. `key` names input leaf fields matched by dot
suffix against the resolved inputs (wiring-independent: `etag` matches
`file.<anyUpstreamNode>.file.etag`), and their collected values become the content's
identity in the fingerprint. If a key field collects nothing on a run — a hand-typed URL
with no upstream etag — that run is simply not cached: no identity, no reuse. Declaring
the object form is itself the opt-in.

## `interface.yaml`

```yaml
inputs:
  - name: signal
    type: object              # string | number | boolean | object | array | signal
    required: true

outputs:
  - name: text
    type: string

credentials:
  - name: exampleCredential
    required: true
    displayName: Example API

serviceConnectors:
  - name: mcpService
    serviceType: mcp          # mcp | embedding
    isService: false          # true offers, false consumes
```

Output names become what someone types in a template later, so name them for what they
carry.

## `api/run.yaml`

```yaml
- name: fetch                 # lowerCamel. Later calls read it as calls.fetch
  method: GET
  url: https://api.example.com/things
  transport: json             # json | text | sse
  credential:                 # OUTBOUND: how this node proves itself to the API.
    scheme: bearer            # none | bearer | basic | apiKeyHeader | apiKeyQuery | oauth2ClientCredentials
    token: "{{ credentials.exampleCredential.apiKey }}"
                              # NOT node.yaml's `auth`, which is inbound: who may RUN this node.
  timeoutMs: 120000
  retry:
    attempts: 3
    backoff: exponential
    on: [429, 500, 502, 503, 504]
  error:
    when: "return !!response.error"
    message: "return response.error.message"
```

A call frames its own reply, so `transport`, `terminator` and `error` belong inside it.
Always write `error` where the API can return 200 with a failure body.

Two calls where one fact needs two requests. A later call reads an earlier reply as
`calls.<name>`, and a call skipped by `when` leaves no key at all.

Where a call is not one plain request, name the capability on it: `paginate` (walk pages,
reply becomes `{items, pages, truncated}`), `chunk` (write in API-sized batches, reply
becomes `{sent, batches, results, errors}`, partial success is normal), `poll` (start a job
and wait, reply is the FINAL status, always write `failed`), `state`
(`read`/`merge`/`drain`/`save`), `loop` (LoopStart/LoopEnd bookkeeping), `presign` (mint
signed URLs, makes no request). `transport: ws` holds a socket open with `open`/`send`/
`close`. Declare each in `requires` in `package.yaml` (credential schemes go under `requires.credential`). Full reference:
`calls-that-loop.md`.

## `api/events.yaml`

```yaml
- emit: text                  # must be a declared output
  value: "return response.result"
```

Streaming adds `match`, and usually `accumulate`:

```yaml
- emit: stream
  match: response.output_text.delta
  value: "return response.delta"
  accumulate: true            # emit the running total, not the fragment
  throttleMs: 200

- emit: text
  from: complete              # response | narrator | tool | complete
  value: "return events.filter(e => e.emit === 'stream').map(e => e.value).at(-1) ?? ''"
```

## `config.yaml`

```yaml
configSchema:
  type: object
  required: [model]
  properties:
    prompt:
      type: string
      title: Prompt
      description: Say what the setting DOES, not what it is called
      default: ""
      ui:field: template      # template | code | textarea | password
"ui:order": [model, prompt]
```

**`authRequired` and `authRole` are RESERVED. Never declare them.** The builder's two
access controls ("Require sign-in", "Require role") are platform chrome, injected into
every runnable node's composed schema after your own fields. Declaring either in a
manifest is a lint error. Run authorization still has two halves: `node.yaml`'s `auth` is
YOUR floor, true of every copy of the node; the injected controls are the BUILDER's, per
box on a canvas. The executor takes the stricter; neither can loosen the other. A role
usually belongs to the builder, because `finance:approve` is a claim one deployment's
identity provider mints and a published node cannot know it. See who-can-run-it.md.

`ui:widget` is `toggle` or `select`. `ui:dependencies` shows a field only when a sibling
matches. `ui:hidden` keeps a field out of the form.

## Templates and expressions

Decided by the field's `type`, never per node.

- **`string`** takes Handlebars: `"{{signal.inputtrigger1.output.message}}"`
- **`object` or `array`** takes an expression: `"return signal.upload1.files"`

Roots: `config`, `credentials`, `signal`, `services`, `prompt`, plus `user`, `scope`,
`calls`, `params`, `token` at run time. Workflow-level values (`workflow.variables`, `loop`,
`saved`) resolve into config fields before the node runs.

**There is no `input.*` root.** A wrong path resolves to empty silently. Dot segments, never
brackets: `records.0.Name`.

Helpers: `eq`, `contains`, `filter`, `toJSON`.

An expression is sandboxed. No `process`, `require`, `fetch`, `eval`, `Function`, `new`,
assignment or `constructor`. Available: `JSON`, `Math`, `Number`, `String`, `Boolean`,
`parseInt`, `encodeURIComponent`, `Object.*`, `Array.*`, `Date.now()`, `Date.iso(ms)`,
`sha256(value)` and `toBase64(value)`. Nothing mutates: `.at(-1)` not `.pop()`,
`.toSorted()` not `.sort()`.

Dates: `Date.iso(Date.now() - 30 * 86400000).split('T')[0]` is thirty days ago as
`YYYY-MM-DD`. There is no `new Date(...)`.

**An expression past a few lines gets a name.** Declare it in `shared/helpers.yaml` and every
expression in the package can call it:

```yaml
helpers:
  row:
    args: [r]
    body: "return { id: r.id, title: r.title }"
```
```yaml
returns: "return response.items.map(helpers.row)"
```

A helper sees ONLY its arguments and its sibling helpers, never `config`, `credentials` or
the caller's scope. Same sandbox, no extra authority.

## `test.yaml`

```yaml
testData:
  config: { model: fast, prompt: Say hello }
  inputs:
    signal: {}
  expect:
    text: "return output.text.length > 0"
```

Every node needs one. It is the only check that proves the manifest describes the real
service rather than something merely coherent.

## Before you finish

```bash
unoverse node lint
unoverse node test <NodeType>
```

Both must pass. `node test` reads keys from `.env` as `<CREDENTIAL>_<FIELD>` in upper snake
case, so `openAICredential.apiKey` is `OPENAI_API_KEY`.

## Checklist

1. Pick `kind`
2. Write `node.yaml`, including a `whenToUse` per doc 14
3. Write `interface.yaml`
4. Write `config.yaml`
5. Write `api/run.yaml` and `api/events.yaml`
6. Add the host to `allowedHosts` in `package.yaml`
7. Add the credential file if the service needs a key
8. Write `test.yaml`
9. `unoverse node lint`, then `unoverse node test <NodeType>`

## Common error, and the fix

| Lint or run says | Fix |
|---|---|
| `api must be a FOLDER` | Move `api.yaml` to `api/run.yaml` and `api/events.yaml` |
| `is retired: this is api/run.yaml, a LIST` | Make it a list, each entry with a `name` |
| an output has nothing emitting to it | Add a row to `events.yaml`, or drop the output |
| events rows are out of connector order | Reorder to match `interface.yaml` |
| this must be a `CallbackNode` | The transport streams, or it declares a `toolExchange` |
| needs credential `x` but no `credentials/x.yaml` | Add the credential file to the package |
| refusing a request to `host` | Add the host to `allowedHosts` |
| a capability is declared but not implemented | Use one that exists, or ask for it to be built |
| the template resolved to empty | The path matched nothing. Check the node id against the real edge |

## Nodes to copy from

Every published node is public. Read the closest one and mirror it.

**[marketplace/definitions/nodes](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes)**

| Read it for | Node |
|---|---|
| The simplest case: one call, one answer | [SearchWeb](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/search/SearchWeb) |
| Walking pages and accumulating the results | [AirtableFetch](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/airtable/AirtableFetch) |
| Writing a collection in batches the API accepts | [AirtableInsert](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/airtable/AirtableInsert) |
| A cheap existence check before an insert | [AirtableExists](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/airtable/AirtableExists) |
| Caching an answer between runs | [ApolloCompany](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/gtm/ApolloCompany) |
| Two calls, where the second uses the first | [HunterEnrich](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/gtm/HunterEnrich) |
| Starting a job and waiting for it to finish | [HyperbrowserCrawl](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/hyperbrowser/HyperbrowserCrawl) |
| Tokens streaming in as they are produced | [OpenAIStream](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/openai/OpenAIStream) |
| A request whose shape changes with the settings | [OpenAIStructuredOutput](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/openai/OpenAIStructuredOutput) |
| A node other nodes call, rather than a workflow step | [OpenAIEmbeddingService](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/openai/OpenAIEmbeddingService) |
| Offering tools to an Agent | [HubspotMCP](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/hubspot/HubspotMCP) |
| A tool loop, and a second model narrating progress | [OpenAIAgent](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/openai/OpenAIAgent) |

Also published: [airtable](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/airtable), [gtm](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/gtm), [hubspot](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/hubspot),
[salesforce](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/salesforce), [search](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/search), [slack](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/slack) and
[x-search](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/x-search).

## Further reading

- `manifest-nodes.md`: the format in full
- `node-types.md`: settling once or emitting many times
- `credentials.md`: keys, auth schemes, local testing
- `who-can-run-it.md`: node.yaml's compulsory `auth` block, roles, anonymous triggers
- `config-schema.md`: every field type and the run context
- `service-connectors.md`: offering a capability to other nodes
- `mcp-services.md`: tools for an Agent
- `signal-routing.md`: connectors, and putting values on an output
- `package-marketplace.md`: the package envelope
- `testing-nodes.md`: fixtures and running for real
- `node-discoverability.md`: **read before writing `whenToUse`**
