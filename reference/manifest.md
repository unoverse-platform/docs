---
sidebarTitle: "manifest.yaml"
title: "manifest.yaml"
---

The contract file beside a component or an app. Its presence is what makes the thing
discoverable, so an Agent can find it and open it.

<div className="ref-source">
Generated from <code>design/_schema/manifest.schema.json</code>, the same file the design
lint validates against.
</div>

## Example

```yaml design/acme/components/product-card/manifest.yaml
title: Product Card
description: A compact product card, expandable to full product detail.
whenToUse: >
  Show one product or service, with its price
  and what it includes.
category: Commerce
version: 1.0.0
lifetime: turn
```

An app's manifest is the whole envelope, and adds its state tree:

```yaml design/acme/apps/acme-chat/manifest.yaml
name: acme-chat
description: The Acme support chat.
whenToUse: Ask Acme a question, or get general help.
category: Assistant
layout: main

states:
  main:
    states:
      welcome: {}
  focus: {}
  products: {}

binding:
  workflow: wf-r4jzo7
  trigger: inputtrigger9
```

## Fields

<ResponseField name="name" type="string">
The definition name. Matches the folder (and the Ref), capitals included.
</ResponseField>

<ResponseField name="title" type="string">
Display name.
</ResponseField>

<ResponseField name="description" type="string">
What it is. The single home for this text — never duplicated in the definition envelope.
</ResponseField>

<ResponseField name="whenToUse" type="string">
The text an Agent's search is ranked against, so this is what decides whether the component is ever chosen. Write the words a person would actually say, outcome first, and disqualify by property rather than by naming a sibling. Getting it wrong fails silently: the component still works, it is just never picked. Full rules: [Node discoverability](/nodes/node-discoverability), which applies to components and apps verbatim.
</ResponseField>

<ResponseField name="category" type="string">
The job's domain, used in discovery ranking. Name the work, never the build.
</ResponseField>

<ResponseField name="version" type="string">
The definition's version.
</ResponseField>

<ResponseField name="defaultState" type="string">
LEGACY arrival state (STATE MODEL v2). A component declares its arrival as the `initial` of its `state.view` tree; an app's base is the first entry of `states:`. Kept only so unmigrated folders still read.
</ResponseField>

<ResponseField name="states" type="object">
An app's state tree. Top-level order IS the priority ladder, base first, and nesting is containment. Each state owns the layout that draws it.
</ResponseField>

<ResponseField name="layout" type="string">
APPS: the base arrangement (layouts/`<value>`) — the app's resting state, and the first entry of `states:`.
</ResponseField>

<ResponseField name="preview" type="object">
APPS: the Studio walk. Each key is a state name. An ARRAY seeds that state with components; an OBJECT is authored app-state data — the fields the workflow would have echoed — so a state can be seen without a live run.
</ResponseField>

<ResponseField name="lifetime" type="`conversation`">
COMPONENTS: opt out of supersession (rule 5). An instance marked `conversation` is not replaced when a newer instance arrives in the same state — it stays for the whole conversation.
</ResponseField>

<ResponseField name="lifecycle" type="object[]">
COMPONENTS: hooks that fire on a moment, not a URL. `onEnterView` runs when the instance enters one of the named states.
</ResponseField>

<ResponseField name="inputSchema" type="object">
APPS: the JSON Schema of the app's own input (what the calling agent sends to open it).
</ResponseField>

<ResponseField name="binding" type="object">
APPS: the workflow this app runs.
</ResponseField>

<ResponseField name="service" type="string">
APPS: the transport the app needs, e.g. voice.
</ResponseField>

<ResponseField name="autoTrigger" type="boolean">
Whether the app fires its bound workflow on load, without waiting for a message.
</ResponseField>

<ResponseField name="default" type="boolean">
APPS: the org's landing app.
</ResponseField>

<ResponseField name="expose" type="object">
Legacy. Org scoping is the boundary now, so this no longer does anything.
</ResponseField>

<ResponseField name="allowedHosts" type="string[]">
The outbound hosts this folder may reach. Part of the manifest's content hash.
</ResponseField>

<ResponseField name="credentials" type="string[]">
Credential NAMES, resolved server-side from encrypted storage. A key never enters the folder.
</ResponseField>

<ResponseField name="analytics" type="object[]">
COMPONENTS: declared analytics moments (docs/design/analytics.md). ONE rule: `phase` entries OBSERVE a state entry (onEnterView, scoped by `layouts`); `action` entries observe a SERVER action AND close the person's lifecycle state (LIFECYCLE_STATES.md §7) under the same event name. The platform names nothing and stamps where automatically.
</ResponseField>

## Next steps

<Card title="Components" icon="square-dashed" href="/design/components" horizontal>
What the manifest sits beside, and how a component is built.
</Card>

<Card title="Apps" icon="layout-template" href="/design/apps" horizontal>
The state tree, the priority ladder, and how an app reacts.
</Card>
