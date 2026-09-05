---
sidebarTitle: "api/events.yaml"
title: "api/events.yaml"
---

Everything that leaves the node, one row per output connector.

<div className="ref-source">
Generated from <code>schemas/nodes/api.schema.json</code>, the same file the node
linter validates against.
</div>

## Example

```yaml api/events.yaml
# The file IS the list of rows, one per output connector,
# in interface.yaml order.
- emit: records
  from: response
  value: >-
    return response.items.map(
      r => Object.assign({ id: r.id }, r.fields || {}))

- emit: totalCount
  from: response
  value: >-
    return response.items.length
```

## Fields

<ResponseField name="emit" type="string">
The output connector this row writes to. Must be one of the outputs declared in `interface.yaml`, in the same order.
</ResponseField>

<ResponseField name="from" type="`response` · `narrator` · `tool` · `complete`">
Where the row fires from. `response` is the last call's reply; `narrator` is a status line; `tool` is a tool call's result; `complete` fires once at the end over everything emitted. Earlier calls do not fire rows: read them as `calls.<name>`.
</ResponseField>

<ResponseField name="match" type="object">
Streaming only. The event type this row fires on, such as `response.output_text.delta`. A literal, never a pattern.
</ResponseField>

<ResponseField name="when" type="expression">
An extra test, for when one event type carries more than one meaning.
</ResponseField>

<ResponseField name="value" type="expression">
What to emit. A `return` expression over whatever the row's `from` puts in scope.
</ResponseField>

<ResponseField name="accumulate" type="boolean">
Emit the running total rather than each fragment. A delta-per-event stream is rarely what a consumer wants.
</ResponseField>

<ResponseField name="resetOn" type="object">
The event types that end a turn, after which `accumulate` starts again.
</ResponseField>

<ResponseField name="throttleMs" type="number">
Emit at most this often. Nothing is dropped; what is held back is flushed at the end of the run.
</ResponseField>

<ResponseField name="throttleChars" type="number">
Emit only once this many characters have built up. Also flushed at the end.
</ResponseField>

<ResponseField name="send" type="template">
Deliver to a named node instead of an output connector. Mutually exclusive with `emit`.
</ResponseField>

<ResponseField name="handle" type="string">
Send rows only. Which input connector on the target node this arrives on. Defaults to `input`.
</ResponseField>

## Next steps

<Card title="Building a node" icon="boxes" href="/nodes/overview" horizontal>
The guides behind these fields.
</Card>

<Card title="Troubleshooting" icon="wrench" href="/nodes/troubleshooting" horizontal>
When a node does not do what you wrote.
</Card>
