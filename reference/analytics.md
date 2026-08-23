---
sidebarTitle: "analytics"
title: "analytics"
---

One key on any node reports that interaction to the analytics your page already has. Nothing
is measured unless you add it.

<div className="ref-source">
The <code>analytics</code> key is part of <code>definition-1.2.schema.json</code>; the event
names below are a project convention, not a platform one.
</div>

## The key

```yaml
- type: Button
  value: Request information
  analytics:
    event: generate_lead
    params:
      form_type: request_information
      item_id: "{{ universal_id }}"
  action:
    type: setValue
    values:
      - key: step
        value: sent
```

<ResponseField name="event" type="string" post={["required"]}>
The event name. Use GA4's own name where one exists, and prefix `unoverse_` only where none
does.
</ResponseField>

<ResponseField name="params" type="object">
Sent with the event. `{{path}}` resolves against the data in scope where the interaction
happened, so a param can carry the record the person was looking at.
</ResponseField>

## The four ready-made events

These cover the moments every experience has. Two are GA4 standard names, so they populate
the built-in item and conversion reports with nothing built on your side.

| Moment | Event | Why this name |
|---|---|---|
| Someone opens the experience | `unoverse_experience_opened` | No GA4 equivalent, so it takes the prefix |
| Someone asks a question | `unoverse_question_asked` | No GA4 equivalent |
| Someone views a product or service | `view_item` | GA4 standard: fills the item reports |
| Someone submits a form, creating a lead | `generate_lead` | GA4 standard: fills the conversion reports |

The first fires when the experience opens. The rest you declare, on the node where the
interaction happens.

## What the platform adds

Every event carries a namespaced `unoverse` block you never write. Your own params stay flat,
because that is what GTM variables and GA4 mappings read.

| Field | Where it comes from |
|---|---|
| `conversation_id` | The same id the chat, session and Agent memory use. Not minted for analytics |
| `user_id` | The channel's, or `guest-<uuid>` from the browser when nobody is signed in |
| `surface` | The host: `unoverse_assistant`, `unoverse_client` or `mcp_app_host` |

There is no session id. GA computes its own from its cookie, and a second one beside it would
only ever be reconciled with the first.

## Turning it on

**Off by default.** With nothing configured, nothing is sent. Writing into someone's analytics
property means writing into their consent configuration and retention terms, so it is switched
on deliberately, per site.

The embedding page names the destination, because the delivery runs in that page's own realm
and the `dataLayer`'s name belongs to the page. Declare it beside your token getter, before
the embed tag:

```html
<script>
  window.unoverseConfig = {
    analytics: {
      target: "dataLayer",
      measurementId: "G-XXXXXXXXXX"
    }
  }
</script>
<script async src="https://api.your-domain.com/embed.js"
        data-app="your-org/your-app"></script>
```

<ResponseField name="target" type="`dataLayer` · `gtag` · `custom`" post={["required"]}>
Where events go. Absent means silence.
</ResponseField>

<ResponseField name="global" type="string">
The global to call when `target` is `custom`. Defaults to `dataLayer` for that target.
</ResponseField>

<ResponseField name="measurementId" type="string">
Your GA4 measurement id.
</ResponseField>

<ResponseField name="debug" type="boolean">
Log every send to the console, with its payload. Useful while wiring it up.
</ResponseField>

**The target is named, never detected, and never falls back.** A page routinely carries
several analytics tools at once, so sniffing for whichever global happens to exist would
eventually push one customer's behavioural data into a different vendor's property. A missing
target warns once and drops the events rather than redirecting them.

Why the page rather than the server: the visitor's client id lives in a first-party cookie on
your domain, and their consent state is already resolved by your own tag. Calling that tag
inherits all of it. A server-side call inherits none of it, and files the events under a
separate visitor nobody can join up.

## Next steps

<Card title="Analytics" icon="chart-bar" href="/design/analytics" horizontal>
Choosing moments, naming events, and what never goes in one.
</Card>

<Card title="api/events.yaml" icon="boxes" href="/reference/node-events" horizontal>
The other events: what leaves a node on its connectors.
</Card>
