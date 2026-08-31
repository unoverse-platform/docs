---
sidebarTitle: "Templates"
title: "Templates"
---

A template is an authored arrangement with open parts: a grid of cards, a comparison pair,
an email, a landing page. It owns its region of the screen, so nothing else has to manage
what appears there.

<Tip>
**Does it arrange many parts, or present one thing?** Many parts is a template. One thing
is a component.
</Tip>

The folder grammar is the same as every other artifact, and
[Essentials](/design/essentials) covers it. This page is what makes a template a template.

## A complete template

`grid-page` is the whole thing, four files and nothing else. It browses a set of items in a
grid, and opens any one of them into its own full page.

<CodeGroup>

```yaml grid-page.yaml
unoverse: "1.0"
type: template
name: grid-page
states:
  grid:                    # first declared = the base
    layout: layouts/grid
  page:
    layout: layouts/page
```

```yaml layouts/grid.yaml
# The browse arrangement: a responsive grid, its column count set per width band.
type: Box
style:
  width: full
  container: inline-size
children:
  - type: Box
    style:
      columns:
        mobile: "1"
        tablet: "2"
        desktop: "3"
        full: "4"
      gap: "4"
      width: full
    children:
      - director:
          rules: The items most relevant to the user, strongest matches first.
          preview: [ card, card, card ]
```

```yaml layouts/page.yaml
# The detail arrangement: the one item the guest opened, full width.
type: Box
style:
  direction: column
  width: full
children:
  - director:
      limit: 1
```

```yaml manifest.yaml
description: Browse a set of peer items in a responsive grid, and open any one into its own page.
whenToUse: Four to eight peer items the guest is browsing or choosing between.
category: Arrangement
```

</CodeGroup>

Four things carry the model:

- **Each state owns one arrangement.** `grid` is declared first, so it is the base, and
  `page` is how the template rearranges.
- **`grid` and `page` are the standard names.** Every card declares the same two, in every
  project, so any card matches any template with no mapping.
- **Browse and detail are one template.** Tapping a tile is the card writing itself into
  `page`, the `page` state draws, and the card's ✕ writes it back. Nothing was wired to
  make that happen ([State](/design/state)).
- **No component is named anywhere.** The template holds whatever the delivery brings,
  which is why the same file works for course cards on one project and products on another.

## The three words

Every part of a layout says how it is filled, and there are exactly three answers:

| Word | Who fills it | What you write |
|---|---|---|
| `static:` | Nobody. It renders as designed | A component path |
| `copywriter:` | An Agent, through the component's briefs | A component path, and it must carry briefs |
| `director:` | The delivery, judged by the director | No component. `state`, `limit`, `rules`, `preview` |

`grid-page` needs only the third. A richer template uses all three, like this email digest,
whose layout links its own parts by path and leaves one band open:

```yaml
# layouts/email.yaml, from the email-digest template
type: Box
style:
  direction: column
  gap: "5"
children:
  - static: components/masthead        # placed as designed
  - copywriter: components/subject     # placed, then written into
  - copywriter: components/body
  - director:                          # not placed: decided per delivery
      state: grid
      limit: 3
      rules: The items most relevant to the reader, strongest matches first.
      preview: [ card, card, card ]
  - static: components/footer
```

**Link what you know, leave open what the delivery decides.** The masthead and the prose
are that template's own components, sitting in its `components/` folder as flat files with
no manifest, because a manifest is for being discovered and these never are. The item band
names nothing, because nobody knows at design time what will fill it.

You never author `ComponentSlot`, `select` or `where` in a template. The three words
compile to those primitives when the template is served, so the renderer stays dumb.

## The copywriter

A `copywriter:` part is a normal component whose fields carry briefs. The brief describes
what belongs in the field, and an Agent writes to it at delivery time
([Components](/design/components) covers briefs).

Write the brief as direction to a writer, including what not to do:

```yaml
- type: Text
  brief:
    description: >-
      The greeting, on its own line. The reader's first name and a comma when the source
      gives a name, and a plain "Hello," when it does not. Never invent a name, never
      guess a title, and never add a line of small talk here.
    maxLength: 40
  bind:
    value: greeting
```

Give each field its own brief when the jobs differ. A greeting, a message and a line that
hands off to the items below are three different writing jobs, and one description could
not govern all three.

## The director

The **director** decides what a template holds. When a delivery lands it chooses which of
the arriving interfaces deserve the space, in what order, and whether the previous set is
spent. Grant it by writing a `director:` part:

```yaml
- director:
    state: grid          # arrivals are switched into this state and held there
    limit: 3             # a hard cap, enforced by the machine
    rules: >-            # soft guidance, written like a brief
      The items most relevant to the reader, strongest matches first.
```

One director **mind** per template, and it may hold more than one **band**. Several
`director:` parts are fine as long as each claims a distinct `state:`, which is how one
verdict says which band each item belongs to: a day told in two halves is a written head
and its cards, then a second head and its cards, on one page. Two bands claiming the same
state is an error, because a state has exactly one surface.

`state:` declared means arrivals render in that state and stay there, which suits an email,
where nothing opens. Omit it and arrivals keep their own state, so the template's states
react by name and the grid-to-page dance comes free.

The director works under fixed laws:

| Law | What it means |
|---|---|
| Selection only | It chooses among what you authored and the delivery supplied. It never invents layout or content |
| Delivery moments only | It is silent between deliveries, so nothing rearranges while the reader reads |
| Fails open | A slow or errored call leaves the screen exactly as it is |
| Empty is a real answer | "Nothing deserves this space" is a legitimate verdict |
| Your hand outranks it | Hard limits are structural, and the guest's own navigation always wins |

A design-system template ships a universal rule like the one above. A project wanting its
own judgment ships its own template, because the director's brain has one home and that is
its part in the layout.

### Preview

`preview:` lists the sample interfaces **studio** drops into a directed part while you
design, before any workflow has run, so the arrangement is never a page of holes. Linked
parts need none, because they render their own defaults.

Every preview is ignored at runtime. Real deliveries replace all of it.

### Fetching its own interfaces

<Note>
The query lane is designed and not yet built. The shape below is the model, and the
authoring grammar lands with the build.
</Note>

A directed part waits for a delivery. A queried part does not: the template asks for the
interfaces it should hold and fills itself. A rail of products that is simply always
there, rather than one that appears when an Agent happens to mention products.

That is the difference between the two sources a template can have:

| Source | Fills when | Suits |
|---|---|---|
| A delivery | An Agent answers, and interfaces stream in | A shelf that reacts to the conversation |
| A query | The template loads, and it fetches its own | A catalogue, a dashboard, a rail that is always populated |

Everything else is unchanged. Queried interfaces arrive wearing a state, the template's
states react by name, and the director still judges which of them deserve the space.

## Placing one in an app

```yaml
- type: Template
  name: products             # the app state this place belongs to
  template: grid-page        # what it holds
  appWidth: flex             # a place declares its width once
```

The placement only places, and the director's rules stay in the template itself.

The delivery owns the parts. Each turn's delivery replaces the last, a delivery that
confirms nothing clears them, and an empty template collapses, frame included.

## How an Agent finds it

Your `manifest.yaml` carries the four fields that decide whether this is ever chosen:
`title`, `description`, `whenToUse` and `category`. The rules are identical for every kind,
they are enforced by the deploy lint, and
[Node discoverability](/nodes/node-discoverability) is the contract.

## Next steps

<Card title="Apps" icon="layout-template" href="/design/apps" horizontal>
Arrange templates into the whole experience.
</Card>

<Card title="State" icon="workflow" href="/design/state" horizontal>
The reaction contract templates and interfaces share.
</Card>
