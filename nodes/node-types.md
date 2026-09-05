---
sidebarTitle: "Node types"
title: "Node types"
---

A node is either stateless or stateful, and `kind` is where you say which.

A **`PromiseNode`** is stateless. It is called, it answers, and it is gone. The docs call
that settling: the node answers once and is done. Nothing lives
between the call and the answer, so there is nothing to hold: an API call, a transform, a
read or a write.

A **`CallbackNode`** is stateful. It stays alive while it works and holds what it has done
so far: the text streamed to this point, which turn of a tool loop it is on, what it is
waiting for. It emits as it goes, meaning it puts a value on an output more than once, and settles when
it is finished.

| Your node | `kind` |
|---|---|
| Calls an API and gets one reply | `PromiseNode` |
| Transforms data and hands it on | `PromiseNode` |
| Reads or writes one record | `PromiseNode` |
| Streams text as it is generated | `CallbackNode` |
| Uses tools over several turns | `CallbackNode` |
| Waits on something outside the workflow | `CallbackNode` |

Settle it first, because everything else about the node follows from it. You declare it at
the top of `node.yaml`:

```yaml
type: Quote
kind: PromiseNode
```

## It is declared, and it is checked

`kind` could be inferred from the rest of the file. You write it anyway, because stateful
or stateless is the first thing anyone asks about a node.

Lint checks the declaration rather than trusting it. **A node is a `CallbackNode` when
any of these is true:**

- its **last** call's transport streams (`sse` or `ws`)
- it declares a `toolExchange`, which is a multi-turn loop by definition
- an input declares a `SPAWN` signal, which only a node that spawns a long-lived actor does

Declare `PromiseNode` while doing any of them and lint names the one that contradicts you.

**Only the last call counts.** It is the node's answer, so it alone decides whether the node
streams. Every earlier call settles by definition, which is why a node can look up a record,
page through a list and then stream its reply.

**Many requests is not state.** Paging, batching, waiting on a job and remembering between
runs all work on either kind and change neither. The platform does that looping inside one
call, and the node still answers once. A node that walks forty pages still
settles once if its last call settles. [Beyond one request](/nodes/calls-that-loop) covers
them.

## A node that answers once

`transport: json` says the reply arrives as one body. The events table maps that body onto
the node's outputs.

```yaml api/run.yaml
- name: fetch
  method: GET
  url: https://api.example.com/thing
  transport: json
```

```yaml api/events.yaml
- emit: text
  value: "return response.result"
```

Nothing streams, so no row needs a `match`. There is one body, and the rows shape it.

## A node that keeps answering

`transport: sse` says the reply arrives as a stream of events. Now each row names the event
type it fires on.

```yaml api/run.yaml
- name: generate
  method: POST
  url: https://api.example.com/generate
  transport: sse
  terminator: "[DONE]"
  body:
    stream: true
```

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

Two things there are worth copying into any streaming node.

**`accumulate: true` emits the running total, not the fragment.** A stream of single words is
almost never what a downstream node wants. It wants the answer so far.

**`throttleMs` bounds how often it emits.** A long answer would otherwise produce hundreds of
events. Nothing held back is lost, because whatever is pending is flushed when the run ends.

The last row uses `from: complete`, which fires once at the end over everything emitted. That
is how a streaming node also produces a settled final value.

## How the reply arrives

| `transport` | The reply is |
|---|---|
| `json` | one JSON body |
| `text` | one body of plain text |
| `xml` | one XML body, parsed to the same plain shape JSON gives |
| `headers` | the headers themselves, for an endpoint whose answer is a header |
| `binary` | bytes, handed on rather than parsed |
| `sse` | a stream of events, so each events row names the event it fires on |
| `ws` | a socket that stays open in both directions |

`xml` is for the services that never moved, and it parses to the same shape as JSON so an
events row reads it identically.

`encoding` is a second axis. `transport` says how the reply is framed, `encoding` says how
the values inside it are spelled. `dynamodbJson` is the one to know: DynamoDB carries
`{ name: { S: "Ada" } }` where you want `{ name: "Ada" }`, and the platform translates both
ways so a node never writes type tags.

## Where each part lives

| Question | File |
|---|---|
| Does it answer once or many times? | `node.yaml`, as `kind` |
| How does the reply arrive? | `api/run.yaml`, as `transport` |
| What leaves the node, and when? | `api/events.yaml` |
| What has to arrive before it runs? | `interface.yaml`, as `required` |


## Next steps

<Card title="Anatomy of a node" icon="boxes" href="/nodes/manifest-nodes" horizontal>
The folder, the files in it, and how a call is described.
</Card>

<Card title="node.yaml" icon="book-marked" href="/reference/node-envelope" horizontal>
Where `kind` sits, with every other envelope field.
</Card>
