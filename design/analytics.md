---
sidebarTitle: "Analytics"
title: "Analytics"
---

**Add one key to a node and that interaction is reported to the page's analytics. You choose the moments. Nothing is measured unless you say so.**

Analytics here means what a person did in your experience. Which items they opened, what
they clicked, where they stopped. It is separate from platform monitoring, which measures
whether the machinery is healthy.

---

## The one key

`analytics` sits on a node, beside the action it accompanies.

```yaml
- type: Button
  label: Book now
  action: bookNow
  analytics:
    event: generate_lead
    params:
      item_id: "{{universal_id}}"
```

Two fields. `event` is the name that arrives in the analytics tool. `params` are the values
sent with it.

`{{...}}` reads the data already in scope at that node. It is the same binding an action's
`values` use, so there is nothing new to learn.

A node with no `analytics` block reports nothing. Silence is the default.

---

## Opening a view is a moment, not a click

A card and its detail view are one instance. The detail can open several ways: the card is
tapped, the workflow pushes it open, a suggestion lands on it. Reporting the tap alone
misses the rest.

So the view event is declared in the **manifest**, beside the lifecycle hooks, and it uses
their grammar. It fires when the state is entered, however it was entered.

```yaml manifest.yaml
lifecycle:
  - phase: onEnterView
    layouts: [ detail ]
    handler: getDetail
analytics:
  - phase: onEnterView
    layouts: [ detail ]
    event: view_item
    params:
      item_id: "{{universal_id}}"
      item_name: "{{title}}"
```

`layouts` names the STATES that fire it, exactly as it does for a hook. The component
already reports entering a state, because that is the moment `onEnterView` exists for. The
declaration rides the same moment, so there is nothing to wire and no action to chain.

A server action takes a manifest entry too. Key it by `action` instead of `phase`:

```yaml
analytics:
  - action: apply
    event: generate_lead
    params:
      form_type: request_callback
      item_id: "{{universal_id}}"
```

An `action` entry fires when your universe receives that action from the component. Not
on the click, which an ad-blocker can silence, and not on the workflow finishing. The
submission arrived; that is the fact it reports.

A button whose action stays on the page still carries its `analytics` key on the node,
as above.

## Choosing event names

Use the analytics tool's own vocabulary where it has a word for what happened. GA4 defines
`view_item`, `generate_lead`, `select_item` and others. Those names populate its built-in
reports with no setup.

Invent a name only when no standard one fits. Prefix it with `unoverse_` so it cannot
collide with an event the page already fires.

| Moment | Name |
|---|---|
| Somebody views one item in detail | `view_item` |
| Somebody submits an enquiry form | `generate_lead` |
| Somebody opens the experience | `unoverse_experience_opened` |

Names are yours to choose. The platform holds no list.

---

## Choosing params

Send what answers a question somebody will ask. Leave out anything that only describes the
machinery.

Match the field names the customer's own analytics already uses. Their reports and filters
are built on those names, so a matching param joins work they have already done. A generic
name arrives as a column somebody has to map by hand.

```yaml
analytics:
  event: view_item
  params:
    item_id: "{{universal_id}}"
    item_name: "{{title}}"
    item_category: "{{object_type}}"
```

A param that resolves to nothing is dropped. An absent value is absent in the report, never
an empty column that reads as data.

---

## What never goes in an event

Three rules, and breaking any of them is a data protection problem rather than a bug.

**No personal data.** No name, email, phone or date of birth. Analytics tools prohibit it,
and the property receiving it belongs to your customer.

**No authored content.** Report which item somebody opened. Never report what it said.

**No typed text.** A person's question or form entry stays out. Both routinely contain
personal detail.

An enquiry event carries an opaque reference to the record, never the record.

```yaml
analytics:
  event: generate_lead
  params:
    lead_id: "{{lead_id}}"
    item_id: "{{universal_id}}"
```

---

## One event per kind of thing

A course, a product and a service are the same moment. Somebody looked at one thing in
detail. Give them one event and separate them with a param.

```yaml
analytics:
  event: view_item
  params:
    item_category: "course"
```

Splitting them into `view_course` and `view_product` fragments the reporting. An analytics
tool breaks one event down by param automatically. It cannot recombine two event names into
one funnel.

---

## Where events go is not your decision

You declare what happened. The destination is configured per customer, outside `design/`.

The reason is practical. The same template runs on a customer's site, in the Unoverse
client, and inside an MCP app host. Each has a different destination, or none. A template
cannot know which one it is in.

Analytics is off unless a customer has been configured. Your declarations sit dormant until
then, and cost nothing.

---

## Checking your events

Turn on debug for the channel you are testing. Each event prints as it fires.

```
[unoverse:analytics] view_item {item_id: "...", item_name: "..."}
```

Filter the browser console on `unoverse:analytics` to see only these.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| No event at all | the node has no `analytics` block, or the interaction runs on a different node than you think |
| Event fires, params empty | the `{{field}}` name is not in scope at that node: check the field the node's own binds use |
| Event fires twice | two nodes declare it, commonly a wrapper and the element inside it |
| Nothing reaches the analytics tool | the destination is not configured for that channel, which is the default |
| Params arrive under the wrong names | match the customer's vocabulary, not a generic one |

---

## Related

- [Components](/design/components) for the node grammar
- [State](/design/state) for how a view change is a state write
- [Lifecycle Hooks](/design/lifecycle-hooks) for fetching data at a moment, which is a different job
