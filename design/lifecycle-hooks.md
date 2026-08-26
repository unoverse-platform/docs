---
sidebarTitle: "Lifecycle hooks"
title: "Lifecycle hooks"
---

**A hook fires at a moment in a component's life: when the instance is created, or when one of its views opens. The component fetches its own data at that moment.**

Think React lifecycle. A component fetches on mount, and the framework decides when mount
happens. Here the platform owns the fire points, and a hook is data like everything else in
`design/`. You declare the calls. The platform runs them.

---

## When you need one

Two situations, and both are data the workflow did not send.

**The data belongs to one view.** A card in a grid shows a title and a line of
description. Its detail view needs the whole record: body copy, sections, call to action.
Loading that for the grid would fetch twelve documents to draw twelve thumbnails.

**The data lives somewhere else.** A live rating, a stock level, a venue lookup. It
changes on its own schedule, so the component asks for it when it renders.

---

## The two moments

| Hook | Fires | Use it for |
|---|---|---|
| `onStart` | the instance is **created** | data every copy of the card needs, however it is shown |
| `onEnterView` | the instance **enters one of its states** | data only that state needs |

**The scope key is spelled `layouts`, and its entries are STATE names.** A component
declares a state tree, and each state owns the layout that draws it ([Components](/design/components)),
so scoping a hook to a state also names the moment its drawing appears. The names in the
list are always states, never layout filenames: the shipped `product-card` declares
`layouts: [ detail ]`, and `detail` is the state whose shell file is `layouts/product`.
When a state's layout carries the same name (the same-name default), the two readings
coincide, which is why the spelling never mattered before states and filenames could
differ.

The distinction matters more than it looks. A card and its detail view are **one
instance**: a course in a grid and the same course expanded differ only by which layout is
active. So if a detail view's content were fetched at `onStart`, opening a grid of twelve
cards would fetch twelve full documents to render twelve thumbnails.

`onEnterView` fetches only what somebody actually opened.

---

## Declaring one

The manifest opts in. Nothing runs that the manifest did not name.

```yaml manifest.yaml
lifecycle:
  - phase: onEnterView
    layouts: [ detail ]      # only this state wakes it, the grid state never does
    handler: getDetail       # a platform-ready handler, so this component ships no code
```

Three fields:

- **`phase`**: which moment, `onStart` or `onEnterView`.
- **`layouts`**: which STATES wake it. `onEnterView` only. Omit it and every state fires.
- **`handler`**: what runs. Either a platform-ready handler, or your own, in which case
  `<handler>.yaml` sits beside the manifest.

**A hook is named for what it does, not for when it fires.** `fetchPlaceDetails` says the
job; `onEnterView` already said the moment. It also means one component can want two
different jobs at the same moment without a naming collision.

**Nothing to wire up.** A component changes its own view by writing `view` (the
close button on a focused card writes `list`, the card in the list writes `focus`). That
write **is** the event: the platform reports it, and a hook scoped to the entered state
runs. No signal to author, no extra action to chain, nothing to remember. If your card
already changes its own view, it already emits the event.

---

## Platform-ready handlers

Some handlers would be identical in every project, so the platform ships them and a
component just points at one. No file, no code, no copy-paste.

### `getDetail`

*Fill this card with its own full record.*

A search result is a summary. `getDetail` fetches the long-form copy behind it: the body
of a product or service page, and the editorial fields around it.

It reads the instance's `universal_id`, fetches that item from the dictionary, and merges
these fields into the card:

| Field | What arrives |
|---|---|
| `bodyCopy` | the long-form markdown body, the main thing a detail view shows |
| `introParagraph` | the opening paragraph |
| `shortDescription` | a short summary |
| `tagline` | the one-line hook or category line |
| `features` | the stated key features, each with a `title`, a `description` and a lucide `icon` name |
| `callToAction` | the CTA label |
| `actionPrompt` | the prompt behind that action |
| `mainCategory` | the item's category |
| `section` | the section of the site it came from |
| `needs` | the needs this item answers |
| `images` | the image URL array |
| `source_url` | the page it was ingested from |

Prop names match by name, exactly like every other hydration path. A field the record does
not carry is left alone, so the card keeps whatever the search row already gave it. Fields
outside this list stay behind: crawler bookkeeping such as timestamps, paths and structured
markup never reaches a card.

The card carries the id and the platform dereferences it, so authored copy never travels
through a model to reach a card.

```yaml
lifecycle:
  - phase: onEnterView
    layouts: [ detail ]        # the state name, exactly as product-card ships it
    handler: getDetail
```

Two things make this safe to use everywhere:

1. **It can only fetch its own record.** The id comes from the platform's copy of the
   instance, so a card cannot ask for somebody else's content.
2. **It fails quietly.** No id, an unknown id, a slow engine: the card keeps whatever the
   search row already gave it. A thinner detail view, never a broken one.

---

## Beyond the built-ins: declare the calls

When no platform handler fits, a hook makes its own requests. It declares them the way a
node does. Name your own handler, and the platform runs the calls you put in
`<handler>.yaml`.

Here is a whole component that does it. **RestaurantCard** streams into the conversation
knowing only what the search gave it. Open it, and it fills its own live details from a
maps API. Three parts, no code:

```
design/<org>/components/restaurant-card/
├── manifest.yaml            opts in, and declares what the calls may reach
├── fetchplacedetails.yaml   the calls, and the fields they return
├── restaurant-card.yaml      the card itself: props, and its state tree
└── layouts/                 list · focus · planned
```

### `manifest.yaml`

```yaml manifest.yaml
title: Restaurant Card
description: One restaurant as a compact card, expandable to full detail and a booking form.
whenToUse: Show one restaurant a guest could eat at. Stream one card per restaurant so options build up as the conversation continues.
category: Travel
version: 1.0.0

# The card fills its live details when it is OPENED, not when it lands in the list.
# Its tree declares `initial: list`; `view` goes list to focus on the card's own
# button, and that write IS the event. A list of twelve cards costs nothing until
# one of them is looked at.
lifecycle:
  - phase: onEnterView
    layouts: [ focus ]
    handler: fetchPlaceDetails

# Deny by default. These are the only hosts fetchplacedetails.yaml may reach.
allowedHosts:
  - www.searchapi.io

# Resolved by name from encrypted storage, server-side. The key never enters this folder.
credentials:
  - searchapiCredential
```

`handler: fetchPlaceDetails` is not a platform handler, so the platform runs
`fetchplacedetails.yaml` from this folder. `layouts: [ focus ]` is why the card in the
list never calls anything: only entering the `focus` state wakes the hook.

**`allowedHosts` is not optional.** A hook that makes requests without it is a lint error,
not a warning. Deny by default, and the refusal names the component.

Credentials are named here and fetched server-side by type. The key never sits in the
folder. It never sits in the definition either.

<Tip>
**A credential appears where you enter it, and leaves when nothing needs it.** The
definition ships with a node package. Install the package and the credential shows up in
**canvas** under **Credentials**, ready to fill in. Uninstall it and the type is retracted
again. A component simply NAMES a credential: the value exists in the universe or it
does not, and shipping never blocks on it. Naming one that no installed package defines
is a deploy WARNING (no pre-built form exists yet to enter it) and a loud runtime
warning whenever the hook runs without a value — never a blocked deploy.
</Tip>

### `fetchplacedetails.yaml`

The file is named after the handler, lowercased.

```yaml fetchplacedetails.yaml
calls:
  - name: place
    method: GET
    url: https://www.searchapi.io/api/v1/search
    query:
      engine: google_maps
      q: "{{ props.title }} Yas Island, Abu Dhabi"
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

# The card's prop names ARE the contract, so this names each field exactly as the
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

Two keys. **`calls`** is the same list a node's `api/run.yaml` holds, and it runs through
the same function. A hook inherits the host allowlist, the credentials, the retries, the
timeouts and the transports. **`returns`** projects the results into partial props. They
merge into the instance by name, like any other hook.

The real component takes a second call for photos, and guards it with
`when: "return !!(...).place_id"` so it only runs when the first call found a place. Calls
run in order, and each one can read the ones before it through `calls.<name>`.

<Note>
**The filename is the handler, lowercased.** `handler: fetchPlaceDetails` looks for
`fetchplacedetails.yaml`. macOS ignores the case difference and Linux does not, so a
camel-cased file works on a laptop and fetches nothing in a container.
</Note>

A component describes what it shows. The calls describe how to fetch something. Neither
has to grow into the other, which is how `design/` stays free of code.

<Note>
A raw `<phase>.js` file beside the manifest is the older form, and the one case still
named for the phase. It still runs, for handlers
that predate declared calls. It is not the pattern to copy. A script does its own `fetch`
to any host, with a key read from the environment, and the calls runtime settles both of
those questions once.
</Note>

---

## What the platform guarantees

A hook runs on the server, so the platform is strict about it.

**Fire points are platform-owned.** You add handlers, never moments. The phase set is
closed, so nothing fires that the platform did not define.

**The hosts are locked.** A hook reaches only the hosts its own manifest lists, and a
component that declares none reaches nothing. A definition cannot execute code, but it
could name any URL, so the allowlist is the boundary that makes a data hook safe. A call
carrying a credential must also be HTTPS, so a key never travels in clear text.

**The credential stays in the platform.** The manifest names it by type. The platform
fetches it server-side from encrypted storage and attaches it to the call. It is never in
the folder, never in the definition, and never on the client.

**The client asks for nothing.** When a view opens, the client says only "this instance
entered this layout". The platform answers every other question itself: which component
that is, whose session owns it, what props it holds. Inputs are re-derived server-side and
never taken from the message. An instance the session does not own runs nothing at all.

**A phase fires once per instance.** Open a detail view, close it, open it again: one
fetch. Body copy does not change mid-conversation.

**Enrichment streams in.** The view opens immediately with what the card already has, and
the fetched fields fill in when they arrive. No blocked render, no spinner.

---

## Lint catches the mismatches

The two halves, what the manifest declares and what actually runs, have to agree. Each of
these is an error, not a silent no-op:

| Lint says | What happened |
|---|---|
| `lifecycle "X" is not a phase the platform fires` | a typo or an invented moment, so it would never run |
| `names handler "X", so x.yaml must sit beside this manifest` | a custom handler with no matching file. Add it, or name a platform handler |
| `declares layouts, but only onEnterView fires per view` | layout scope on a phase that has no view |
| `is a lifecycle handler no manifest opted into` | code in the folder nothing declared. Name it or delete it |
| `declares no "handler", so nothing would run` | a phase opted into with nothing named to run |
| `<handler>.yaml makes requests, so this manifest must declare "allowedHosts"` | declared calls with no host allowlist |
| `credential "X" has no definition in any installed node package` (warning) | no pre-built form exists to enter it — the hook runs without it until a value is provided. Install the defining package, or provide the value another way |

---

## Which one do I need?

```
Does the data belong to ONE state (a detail page, an expanded card)?
  → onEnterView, scoped to that state

Is it the item's own stored record?
  → handler: getDetail, no code

Is it something else (a live rating, a stock level, a third-party lookup)?
  → name your own handler, and put the calls in <handler>.yaml beside the manifest
```

And if the answer is "the model already knows it", that is not a hook. Content the model
authored is a prop, fed by the workflow like any other.

## Next steps

<Card title="Studio" icon="layout-dashboard" href="/design/studio" horizontal>
Watch a hook fire against a live universe.
</Card>

<Card title="manifest.yaml" icon="book-marked" href="/reference/manifest" horizontal>
Where `lifecycle` is declared, with every other manifest field.
</Card>
