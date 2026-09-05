---
sidebarTitle: "api/run.yaml"
title: "api/run.yaml"
---

The calls the node makes, and what leaves it.

The `api/` folder holds one file per key below. `run` is `api/run.yaml`, `events` is `api/events.yaml`, and each of those files IS its list — there is no wrapping `run:` or `events:` key inside them.

<div className="ref-source">
Generated from <code>schemas/nodes/api.schema.json</code>, the same file the node
linter validates against.
</div>

## Example

```yaml api/run.yaml
# The file IS the list of calls. There is no `run:` key.
- name: page
  method: GET
  url:
    $ref: table#url
  credential:
    $ref: table#credential
  query:
    filterByFormula: "{{ config.filterFormula }}"
    view: "{{ config.view }}"
  transport: json
  retry:
    attempts: 3
    backoff: exponential
    on: [429, 500, 502, 503, 504]
  paginate:
    strategy: cursor
    cursor: "return response.offset"
    into: offset
```

## Fields

<ResponseField name="run" type="object[]">
The calls this node makes, in order, always a list. Each step can read what earlier ones returned. Every call but the last must settle; only the last may stream.
</ResponseField>

<ResponseField name="events" type="object[]">
Everything that leaves the node, one row per output connector, in the order `interface.yaml` declares them. Lint enforces coverage and order.
</ResponseField>

<ResponseField name="service" type="object">
Methods this node offers to others over a service edge, keyed by name. Called by another node rather than by the graph, and each returns a value to the caller.
</ResponseField>

<ResponseField name="toolExchange" type="object">
Hands tools to a model and resolves the calls that come back. Declaring it makes the node a callback node.
</ResponseField>

<ResponseField name="narrate" type="object">
A second, cheaper model writing a status line while the main call runs. A `from: narrator` row in `events` says where the line lands.
</ResponseField>

<ResponseField name="publish" type="object">
A write straight into the caller's screen state, pushed after the node settles. A side channel to the person watching, never an output.
</ResponseField>

<ResponseField name="renderComponents" type="expression">
Rows to draw as content cards on the caller's live screen, such as `return response.results`. A row naming a component renders it as the node settles, so a card appears without the model choosing to show one. Evaluated after the events table, over the full settled reply, because a card needs the whole row that an events projection strips. Fire and forget: with no live session it does nothing.
</ResponseField>

<ResponseField name="audio" type="audio.schema.json">
Binds a voice node to the platform's audio lane, which is a separate socket. Everything that is not audio belongs in `events`.
</ResponseField>

## Next steps

<Card title="Building a node" icon="boxes" href="/nodes/overview" horizontal>
The guides behind these fields.
</Card>

<Card title="Troubleshooting" icon="wrench" href="/nodes/troubleshooting" horizontal>
When a node does not do what you wrote.
</Card>
