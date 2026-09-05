---
sidebarTitle: "api/audio.yaml"
title: "api/audio.yaml"
---

How a voice node binds to the platform's audio lane.

<div className="ref-source">
Generated from <code>schemas/nodes/audio.schema.json</code>, the same file the node
linter validates against.
</div>

## Example

```yaml api/audio.yaml
# api/audio.yaml — only for a `transport: ws` voice node.
in:
  encoding: pcm16
  sampleRate: 24000
out:
  encoding: pcm16
  sampleRate: 24000
```

## Fields

<ResponseField name="in" type="object">
How audio arriving from the caller reaches the vendor socket.
</ResponseField>

<ResponseField name="out" type="object">
How audio from the vendor reaches the caller.
</ResponseField>

<ResponseField name="control" type="object">
The non-audio messages that steer the call.
</ResponseField>

## Next steps

<Card title="Building a node" icon="boxes" href="/nodes/overview" horizontal>
The guides behind these fields.
</Card>

<Card title="Troubleshooting" icon="wrench" href="/nodes/troubleshooting" horizontal>
When a node does not do what you wrote.
</Card>
