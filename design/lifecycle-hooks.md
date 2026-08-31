---
sidebarTitle: "Lifecycle hooks"
title: "Lifecycle hooks"
---

A hook fires at a moment in a component's life: when the instance is created, or when one
of its states opens. The component fetches its own data at that moment.

Think React lifecycle. A component fetches on mount, and the framework decides when mount
happens. Here the platform owns the fire points, and a hook is data like everything else in
`design/`. You declare the calls, and the platform runs them.

## When you need one

Two situations, and both are data the workflow did not send.

**The data belongs to one state.** A card in a grid shows a title and a line of
description, while its detail state needs the whole record: body copy, sections, call to
action. Loading that for the grid would fetch twelve documents to draw twelve thumbnails.

**The data lives somewhere else.** A live rating, a stock level, a venue lookup. It changes
on its own schedule, so the component asks for it when it renders.

Which hook you need follows from what the data is:

| The data is | Reach for |
|---|---|
| The item's own stored record | `handler: getDetail`, and no code at all |
| Something else, such as a live rating or a third-party lookup | Your own handler, with the calls in `<handler>.yaml` |
| Something the model already knows | Not a hook. Content the model authored is a prop, fed by the workflow |

## The two moments

| Hook | Fires when | Use it for |
|---|---|---|
| `onStart` | The instance is created | Data every copy of the card needs, however it is shown |
| `onEnterView` | The instance enters one of its states | Data only that state needs |

**The scope key is spelled `layouts`, and its entries are state names.** A component
declares a state tree, and each state owns the layout that draws it
([Components](/design/components)), so scoping a hook to a state also names the moment its
drawing appears. The names in the list are always states, never layout filenames. The
shipped product card declares `layouts: [ page ]`, and `page` is a state, whose own
drawing happens to live at `layouts/page`.

The distinction matters more than it looks. A card and its detail are one instance, and
they differ only by which state is active. So if a detail's content were fetched at
`onStart`, opening a grid of twelve cards would fetch twelve full documents to render
twelve thumbnails. `onEnterView` fetches only what somebody actually opened.

## Declaring one

The manifest opts in, and nothing runs that the manifest did not name.

```yaml manifest.yaml
lifecycle:
  - phase: onEnterView
    layouts: [ page ]        # only this state wakes it, the grid state never does
    handler: getDetail       # a platform handler, so this component ships no code
```

Three fields:

- **`phase`** is which moment, `onStart` or `onEnterView`.
- **`layouts`** is which states wake it, on `onEnterView` only. Omit it and every state
  fires.
- **`handler`** is what runs: either a platform handler, or your own, in which case
  `<handler>.yaml` sits beside the manifest.

**A hook is named for what it does, not for when it fires.** `fetchPlaceDetails` says the
job, and `onEnterView` already said the moment. It also means one component can want two
different jobs at the same moment without a naming collision.

Two behaviours are worth knowing as you write one. **A phase fires once per instance**, so
opening a detail view, closing it and opening it again is one fetch. And **enrichment
streams in**: the state opens immediately with whatever the card already has, and the
fetched fields fill in when they arrive, so there is no blocked render and no spinner to
author.

**Nothing to wire up.** A component changes its own face by writing `state`, and that write
is the event. The platform reports it, and a hook scoped to the entered state runs. There
is no signal to author and no action to chain: if your card already changes its own state,
it already emits the event.

## Platform handlers

Some handlers would be identical in every project, so the platform ships them and a
component points at one.

**`getDetail`** fills a card with its own full record. A search result is a summary, and
`getDetail` fetches the long-form copy behind it. It reads the instance's `universal_id`,
fetches that item from the dictionary, and merges the record's editorial fields into the
card. [Interface data](/design/interface-data) lists every field that arrives, and the
fields the card already had before the hook ran.

Prop names match by name, exactly like every other hydration path. A field the record does
not carry is left alone, so the card keeps whatever the search row already gave it, and
crawler bookkeeping such as timestamps and paths never reaches a card at all.

Two things make it safe to use everywhere:

1. **It can only fetch its own record.** The id comes from the platform's copy of the
   instance, so a card cannot ask for somebody else's content.
2. **It fails quietly.** No id, an unknown id or a slow engine leaves the card with
   whatever the search row gave it. A thinner detail view, never a broken one.

The card carries the id and the platform dereferences it, so authored copy never travels
through a model to reach a card.

## Your own calls

When no platform handler fits, a hook makes its own requests, declared the way a node
declares them. Name your own handler, and the platform runs the calls in `<handler>.yaml`.

A restaurant card streams into the conversation knowing only what the search gave it. Open
it, and it fills its own live details from a maps API. Three parts, no code:

<CodeGroup>

```yaml manifest.yaml
description: One restaurant as a compact card, expandable to full detail and a booking form.
whenToUse: Show one restaurant a guest could eat at, one card per restaurant.
category: Travel

# The card fills its live details when it is OPENED, not when it lands in the list.
# A list of twelve cards costs nothing until one of them is looked at.
lifecycle:
  - phase: onEnterView
    layouts: [ page ]
    handler: fetchPlaceDetails

# Deny by default. These are the only hosts fetchplacedetails.yaml may reach.
allowedHosts:
  - www.searchapi.io

# Resolved by name from encrypted storage, server-side.
credentials:
  - searchapiCredential
```

```yaml fetchplacedetails.yaml
calls:
  - name: place
    method: GET
    url: https://www.searchapi.io/api/v1/search
    query:
      engine: google_maps
      q: "{{ props.title }}"
    credential:
      scheme: apiKeyQuery
      param: api_key
      value: "{{ credentials.searchapiCredential.apiKey }}"
    transport: json
    timeoutMs: 15000
    # A 200 is not always a success: the vendor reports a bad parameter or an
    # exhausted quota in the body, which would otherwise read as "nothing found".
    error:
      when: "return !!response.error"
      message: "return typeof response.error === 'string' ? response.error : JSON.stringify(response.error)"
    retry:
      attempts: 3
      backoff: exponential
      on: [429, 500, 502, 503, 504]

# The card's prop names are the contract, so this names each field exactly as the
# card declares it.
returns: >-
  return ((p) => p ? {
    rating: typeof p.rating === 'number' ? p.rating : undefined,
    openState: p.open_state,
    hours: p.hours,
    address: p.address,
    phone: p.phone,
    website: p.website
  } : {})((calls.place.local_results || [])[0])
```

</CodeGroup>

`handler: fetchPlaceDetails` is not a platform handler, so the platform runs
`fetchplacedetails.yaml` from this folder. `layouts: [ page ]` is why the card in the list
never calls anything, because only entering the `page` state wakes the hook.

Two keys do the work. **`calls`** is the same list a node's `api/run.yaml` holds, run
through the same function, so a hook inherits the host allowlist, the credentials, the
retries, the timeouts and the transports. **`returns`** projects the results into partial
props, which merge into the instance by name like any other hook. Calls run in order, and
each one can read the ones before it through `calls.<name>`, so a second call can be
guarded with `when` and only run when the first found something.

**`allowedHosts` is not optional.** A hook that makes requests without it is a lint error
rather than a warning. A definition cannot execute code, but it could name any URL, so the
allowlist is the boundary that makes a data hook safe. Deny by default, and the refusal
names the component.

A call carrying a credential must be HTTPS, and the platform attaches the key server-side,
so it is never in the folder, never in the definition and never on the client.

<Note>
**The filename is the handler, lowercased.** `handler: fetchPlaceDetails` looks for
`fetchplacedetails.yaml`. macOS ignores the case difference and Linux does not, so a
camel-cased file works on a laptop and fetches nothing in a container.
</Note>

<Tip>
**A credential appears where you enter it, and leaves when nothing needs it.** The
definition ships with a node package. Install the package and the credential shows up in
**canvas** under **Credentials**, ready to fill in, and uninstalling retracts the type
again. A component simply names a credential: the value exists in the universe or it does
not, and shipping never blocks on it. Naming one that no installed package defines is a
deploy warning and a loud runtime warning whenever the hook runs without a value, never a
blocked deploy.
</Tip>

A raw `<phase>.js` file beside the manifest is the older form, and the one case still named
for the phase. It still runs, for handlers that predate declared calls, but it is not the
pattern to copy: a script does its own fetch to any host with a key read from the
environment, and the calls runtime settles both of those questions once.

## Next steps

<Card title="Studio" icon="layout-dashboard" href="/design/studio" horizontal>
Watch a hook fire against a live universe.
</Card>

<Card title="manifest.yaml" icon="book-marked" href="/reference/manifest" horizontal>
Where `lifecycle` is declared, with every other manifest field.
</Card>
