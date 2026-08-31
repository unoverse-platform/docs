---
sidebarTitle: "Analytics"
title: "Analytics"
---

Add one key to a node and that interaction is reported to the page's analytics. You choose
the moments, and nothing is measured unless you say so.

Analytics here means what a person did in your experience: which items they opened, what
they clicked, where they stopped. It is separate from platform monitoring, which measures
whether the machinery is healthy.

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

Two fields. `event` is the name that arrives in the analytics tool, and `params` are the
values sent with it. `{{...}}` reads the data already in scope at that node, which is the
same binding an action's `values` use.

A node with no `analytics` block reports nothing. Silence is the default.

## Moments a click does not cover

A card and its detail are one instance, and the detail opens several ways: the card is
tapped, the workflow pushes it open, a suggestion lands on it. Reporting the tap alone
misses the rest.

So a view event is declared in the manifest, beside the lifecycle hooks, using their
grammar. It fires when the state is entered, however it was entered:

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

`layouts` names the states that fire it, exactly as it does for a hook
([Lifecycle hooks](/design/lifecycle-hooks)). The component already reports entering a
state, so the declaration rides that moment and there is nothing to wire.

A server action takes a manifest entry too, keyed by `action` instead of `phase`:

```yaml
analytics:
  - action: apply
    event: generate_lead
    params:
      form_type: request_callback
      item_id: "{{universal_id}}"
```

An `action` entry fires when your universe receives that action, rather than on the click,
which an ad-blocker can silence, and rather than on the workflow finishing. The submission
arrived, and that is the fact it reports. A button whose action stays on the page keeps its
`analytics` key on the node.

## Naming events

Use the analytics tool's own vocabulary wherever it has a word for what happened. GA4
defines `view_item`, `generate_lead`, `select_item` and others, and those names populate
its built-in reports with no setup. Invent a name only when no standard one fits, and
prefix it with `unoverse_` so it cannot collide with an event the page already fires.

| Moment | Name |
|---|---|
| Somebody views one item in detail | `view_item` |
| Somebody submits an enquiry form | `generate_lead` |
| Somebody opens the experience | `unoverse_experience_opened` |

**One event per kind of thing.** A course, a product and a service are the same moment:
somebody looked at one thing in detail. Give them one event and separate them with a param.

```yaml
analytics:
  event: view_item
  params:
    item_category: "course"
```

Splitting them into `view_course` and `view_product` fragments the reporting. An analytics
tool breaks one event down by param automatically, and it cannot recombine two event names
into one funnel.

## Choosing params

Send what answers a question somebody will ask, and leave out anything that only describes
the machinery.

Match the field names the customer's own analytics already uses. Their reports and filters
are built on those names, so a matching param joins work they have already done, while a
generic name arrives as a column somebody has to map by hand.

```yaml
analytics:
  event: view_item
  params:
    item_id: "{{universal_id}}"
    item_name: "{{title}}"
    item_category: "{{object_type}}"
```

A param that resolves to nothing is dropped, so an absent value is absent in the report
rather than an empty column that reads as data.

**Three things never go in an event**, and breaking any of them is a data protection
problem rather than a bug:

- **No personal data.** No name, email, phone or date of birth. Analytics tools prohibit
  it, and the property receiving it belongs to your customer.
- **No authored content.** Report which item somebody opened, never what it said.
- **No typed text.** A person's question or form entry stays out, because both routinely
  contain personal detail.

An enquiry event carries an opaque reference to the record, never the record:

```yaml
analytics:
  event: generate_lead
  params:
    lead_id: "{{lead_id}}"
    item_id: "{{universal_id}}"
```

## Connecting Google Analytics

You declare what happened, and the host page declares where it goes.

That split is deliberate. A visitor's analytics client id lives in a first-party cookie on
the customer's own domain, which code in the host page can read and a server call cannot.
Sending from the server would file your events under a separate, unjoinable visitor: data
that looks real and is unusable. Running in the page also inherits the consent state,
regional configuration and retention terms the customer has already set, rather than
reimplementing all of it per customer.

Name the destination on `window.unoverseConfig`, beside the embed:

```html
<script>
  window.unoverseConfig = {
    analytics: { target: "gtag", measurementId: "G-XXXXXXX" }
  };
</script>
<script async src="https://universe.example.com/embed.js" data-app="acme/acme-chat"></script>
```

| Field | What it does |
|---|---|
| `target` | `gtag`, `dataLayer` or `custom` |
| `measurementId` | `gtag` only. Pins one GA4 property |
| `global` | The window global to write to, when it is not the default |
| `debug` | Prints each event to the console as it fires |

**Which target to name.** A bare GA4 snippet is `gtag`, because a dataLayer push only
becomes a GA event under Tag Manager. A page running GTM is `dataLayer`.

**The target is never detected.** A customer page routinely carries several analytics tools
at once, and picking whichever global happens to exist would eventually push one customer's
behavioural data into a different vendor's property. That is a data protection incident
rather than a bug, so the destination is always named, and an absent one means silence,
warned once.

### Where events reach

| Surface | Do events reach their analytics? |
|---|---|
| Embedded on a customer's own site | Yes. The host page carries their tag |
| The unoverse client | Not applicable, because the host page is ours |
| An MCP app host, such as ChatGPT | No. The widget is sandboxed under an enforced CSP |

Events fire on all three and only delivery differs, so with no listening host the post is a
silent no-op rather than a broken call.

**Expect undercounting.** Content blockers stop some of these calls, so never reconcile
these numbers against server-side totals as though the gap were a bug.

## Checking your events

Turn on debug for the channel you are testing, and each event prints as it fires.

```
[unoverse:analytics] view_item {item_id: "...", item_name: "..."}
```

Filter the browser console on `unoverse:analytics` to see only these.

### When an event misbehaves

| Symptom | Fix |
|---|---|
| No event at all | The node has no `analytics` block, or the interaction runs on a different node than you think |
| Event fires, params empty | The `{{field}}` name is not in scope at that node. Check the fields the node's own binds use |
| Event fires twice | Two nodes declare it, commonly a wrapper and the element inside it |
| Nothing reaches the analytics tool | The destination is not configured for that channel, which is the default |
| Params arrive under the wrong names | Match the customer's vocabulary rather than a generic one |

## Next steps

<Card title="Validate and ship" icon="shield-check" href="/design/validate-and-ship" horizontal>
What the lint enforces, and what only you can judge.
</Card>

<Card title="analytics" icon="book-marked" href="/reference/analytics" horizontal>
The key, the four ready-made events, and turning it on.
</Card>
