---
sidebarTitle: "Connectors and signals"
title: "Connectors and signals"
---

Connectors are the dots on a node. Inputs on the left, outputs on the right, and the lines
you draw between them are how data moves through a workflow.

You declare them in `interface.yaml`, and **canvas** draws one dot per entry.

```yaml interface.yaml
inputs:
  - name: signal
    type: object
    description: Data from previous nodes

outputs:
  - name: quote
    type: string
    description: The quote text
  - name: author
    type: string
    description: Who said it
```

That node has one input dot and two output dots.

## Sending something to an output

Declaring an output only creates the dot. `api/events.yaml` is what puts a value on it.

**One row per output connector, in the same order `interface.yaml` declares them.** Read that
one file and you know everything the node ever emits.

```yaml api/events.yaml
- emit: quote
  value: "return response[0].q"

- emit: author
  value: "return response[0].a"
```

`emit` names the connector. `value` shapes what lands on it, as an expression over the
reply. An output with no row is a dot that never carries anything, and lint warns about it.

### Emitting once, or many times

This is where the node's `kind` shows up.

**A `PromiseNode` settles.** One call, one reply, and each row fires once over that reply.
The rows above are a settling node.

**A `CallbackNode` emits.** The reply arrives as a stream of events, so a row says which
event it fires on, and it fires every time that event arrives.

```yaml api/events.yaml
- emit: stream
  match: response.output_text.delta
  value: "return response.delta"
  accumulate: true
  throttleMs: 200

- emit: text
  from: complete
  value: "return events.filter(e => e.emit === 'stream').map(e => e.value).at(-1) ?? ''"
```

| Key | Does |
|---|---|
| `match` | the event type this row fires on. Streaming only |
| `accumulate` | emit the running total instead of the fragment |
| `throttleMs`, `throttleChars` | emit at most this often. Nothing held back is lost, it is flushed at the end |
| `from` | where the row fires from, when it is not the reply |

`from: complete` fires once at the end, over everything already emitted. That is how a
streaming node also produces a single settled value for downstream nodes to use.

The other `from` values cover what leaves the node without ever being in the reply. `tool`
is the result of a tool call. `narrator` is a status line written alongside the main work.

## Reading what arrives

A downstream node reads an upstream output by name:

```
signal.<nodeId>.<output>.<field>
```

`quote1` is the id **canvas** gives the node on the canvas, and `quote` is the output
connector. So `signal.quote1.quote` is the quote text.

Give outputs names worth reading. They become the reference someone types into a Handlebars string
later, and a good name is the difference between `signal.crm1.contact` and
`signal.crm1.output`.

## Types

| `type` | Carries |
|---|---|
| `string`, `number`, `boolean` | a single value |
| `object` | a structured result |
| `array` | a list |
| `signal` | nothing but the fact that something happened |

`type` also decides how a wired field is written. A `string` field takes a Handlebars
string, an `object` or `array` field takes a `return` expression.
[Config schema](/nodes/config-schema) covers both.

## Required, and what waiting means

`required: true` means the node waits for that connector before it runs.

```yaml
inputs:
  - name: content
    type: string
    required: true
```

A node that never runs is usually a required connector with nothing wired to it. Nothing
reports an error, because waiting is a legitimate state for a node to be in.

## Looping over a list

A node does not loop itself. You loop in the workflow, with the Loop nodes, and your node
runs once per item like any other step.

That keeps a node simple: it takes what it is given, does one job, and emits.

A service connector is a different thing entirely. It is a node calling another node on
demand, rather than a value travelling along an edge, and it fires no outputs. See
[Service connectors](/nodes/service-connectors).

## When it goes wrong

| What you see | Why |
|---|---|
| The node never runs | A required connector has nothing wired to it |
| A value resolves to nothing | The id or the output name is wrong. Check it against the edge you drew |
| An output stays empty | No row in `events.yaml` emits to it |
| Lint: an output has nothing emitting to it | The connector and the events table have drifted apart |
| Lint: this must be a `CallbackNode` | The transport streams, or the node declares a `toolExchange` |
| A downstream node gets one word at a time | The row needs `accumulate: true` |

## Next steps

<Card title="Node types" icon="split" href="/nodes/node-types" horizontal>
Settling once or emitting many times, and how the platform tells.
</Card>

<Card title="api/events.yaml" icon="book-marked" href="/reference/node-events" horizontal>
Every field an events row takes, generated from the schema.
</Card>
