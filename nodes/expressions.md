---
sidebarTitle: "Handlebars and expressions"
title: "Handlebars and expressions"
---

Read a value out of the run and shape it on the way into a call. Two syntaxes do this, and
which one applies is decided by the field, never by the node.

| Write | When the field is |
|---|---|
| `{{ }}`, a Handlebars string | a `string` |
| `return …`, a sandboxed expression | an `object` or an `array` |

## Handlebars

`{{ }}` resolves against the run context, which is everything the run knows: this node's
settings, its credentials, the outputs of the nodes before it, and who is asking. Registered helpers work anywhere Handlebars does,
so conditional prompt text is an ordinary `{{#if}}`:

```yaml
instructions: |-
  {{#if (eq config.tone "warm")}}Be warm.{{else}}Be terse.{{/if}}
  {{prompt.markdownGuidelines}}
```

The helpers are `eq`, `contains`, `filter` and `toJSON`.

**There is no `{{input.*}}` root.** A wrong path resolves to empty, silently, which is the
single most common reason a call arrives with a field missing. Array elements and object
keys are dot segments, never brackets: `records.0.Name`.

**`prompt.<blockName>` is why a manifest never hard-codes instruction text.** Blocks live in
`prompts/blocks/**/*.md` and are camelCased from the filename, so
`markdown-guidelines.md` becomes `{{prompt.markdownGuidelines}}`. A block's words copied
into a node is a fork that stops tracking the block.

## Expressions

A string starting with `return ` is a sandboxed expression, evaluated at any depth. Reach
for one when a value's shape depends on the run: an array member that is only sometimes
present, or a key whose name varies by model.

Security is by absence. There is no `process`, `require`, `fetch`, `eval`, `new`,
assignment or `constructor` to reach, because the interpreter never implements them.

Available: member access, indexing, literals, spread, backtick strings, operators,
ternaries, arrow callbacks, and `JSON`, `Math`, `Number`, `String`, `Boolean`, `parseInt`,
`parseFloat`, `encodeURIComponent`, `Object.*` and `Array.*`. The platform adds three more,
because without them a node could not be a manifest at all:

- **`Date.now()` and `Date.iso(ms)`.** Half the APIs a node calls take a date range and
  want an ISO string, so `Date.iso(Date.now() - 30 * 86400000).split('T')[0]` is thirty
  days ago as `YYYY-MM-DD`. There is no `new Date(...)`.
- **`sha256(value)`.** A stable id derived from content, which downstream dedup joins on.
- **`toBase64(value)`.** Plain text as UTF-8 bytes in base64, the form bytes take on the
  way to an `encoding: binary` body.

**Nothing mutates.** Use `.at(-1)` rather than `.pop()`, and `.toSorted()` rather than
`.sort()`. The array you would be sorting is a live upstream output, so sorting it in place
reorders it for every other node reading the same value.

## Named helpers

An expression is one string, which is fine for `return response.data` and bad for a row
projection. When one grows past a few lines, declare it as a helper in any `shared/*.yaml`
file. Helpers are collected across the package and callable from every expression in it:

```yaml shared/helpers.yaml
helpers:
  keptMeta:
    args: [metadata, keep]
    body: >-
      return keep.filter(k => metadata[k] != null && metadata[k] !== '')
        .reduce((acc, k) => Object.assign(acc, { [k]: metadata[k] }), {})
  row:
    args: [r]
    body: "return { id: r.id, title: r.title, meta: helpers.keptMeta(r.metadata, ['tagline']) }"
```

```yaml api/service.yaml
returns: "return response.items.map(helpers.row)"
```

A helper sees only its arguments and its sibling helpers, never `config`, `credentials` or
the scope of whatever called it. Same sandbox, no extra authority, and a broken body fails
when the package loads rather than on the first request that reaches it.

Declare helpers next to the call they shape rather than in one large file. Two files
declaring the same helper name is an error rather than a merge.

## The run context

What your calls can see, and where each piece comes from.

| Root | Is |
|---|---|
| `config.<field>` | This node's settings, already resolved |
| `credentials.<name>.<field>` | A credential this node declared |
| `signal.<nodeId>.<output>.<field>` | An upstream node's output |
| `services.<connector>` | What is wired at run time, such as `services.mcpService.tools` |
| `prompt.<blockName>` | A prompt block from the library |
| `user.email`, `user.id`, `user.name` | The signed-in person |
| `scope.workflowId`, `scope.userId` | Which run this is |
| `calls.<name>` | The reply from a call made earlier in this node |
| `params.<name>` | Arguments a caller passed, for a service method |
| `token.instanceUrl` | Where an OAuth2 exchange said to talk, when an API returns one |

**`user` is identity, and nothing that authenticates as them.** Email, id and name, never
the caller's access token. A token is the user against our own services, so a node holding
one could send it to any host its package allows, while an email authenticates nothing.

It is a first-class root because "who is asking" is the join key for every CRM, support and
account node. Reading identity out of the request instead would let a caller fetch somebody
else's record.

```yaml
- name: contact
  method: GET
  url: https://api.example.com/contacts
  transport: json
  query:
    email: "{{ user.email }}"
```

**`calls.<name>` is how a second call uses the first.** A call skipped by its `when` leaves
no key at all, so `calls.x` is also how you ask whether it ran.

### Workflow-level values

Set on the workflow and shared by every node in it: `workflow.variables`, plus
`workflow.id`, `workflow.name`, `workflow.runId`, `workflow.userId` and
`workflow.conversationId`. Inside a loop, `loop` carries the current item, and `saved`
carries outputs other nodes chose to keep.

These resolve **before your node runs**, while its settings are being prepared, so they
belong in a `config.yaml` field and your calls read the result as `{{ config.<field> }}`:

```yaml config.yaml
region:
  type: string
  title: Region
  default: "{{workflow.variables.region}}"
```

## Next steps

<Card title="Config schema" icon="sliders-horizontal" href="/nodes/config-schema" horizontal>
The settings form these values resolve into.
</Card>

<Card title="api/run.yaml" icon="book-marked" href="/reference/node-api" horizontal>
Every field a call takes, generated from the schema.
</Card>
