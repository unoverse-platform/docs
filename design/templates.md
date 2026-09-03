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
      pick: 1
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

Every part of a layout says **who fills it**, and there are exactly three answers, a
small cast of characters:

| Word | Who fills it | What you write |
|---|---|---|
| `static:` | Nobody. It renders as designed | A component path |
| `copywriter:` | The copywriter, through the component's briefs | A component path, and it must carry briefs |
| `director:` | The director, the judge | With a component: a search place. Without: a delivery band |

The director works one of two ways, and one sentence covers both: **give the director a
component and they go find its content; give them nothing and they judge what the
conversation delivers.**

`grid-page` needs only the third. A richer template mixes them, like this email digest,
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
      pick: 3
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

The **director** decides what a template holds: the same judge in both of its modes, and
`pick` is always its signature: how many it keeps.

### A delivery band

A `director:` part with no component waits for the conversation. When a delivery lands the
director chooses which of the arriving interfaces deserve the space, in what order, and
whether the previous set is spent:

```yaml
- director:
    state: grid          # arrivals are switched into this state and held there
    pick: 3              # how many the director keeps, enforced by the machine
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
| Your hand outranks it | `pick` is structural, and the guest's own navigation always wins |

A design-system template ships a universal rule like the one above. A project wanting its
own judgment ships its own template, because the director's brain has one home and that is
its part in the layout.

### Preview

`preview:` lists the sample interfaces **studio** drops into a directed part while you
design, before any workflow has run, so the arrangement is never a page of holes. Linked
parts need none, because they render their own defaults.

Every preview is ignored at runtime. Real deliveries replace all of it.

### A search place

A `director:` part **with** a component does not wait: the page fetches the content it
should hold when it opens. A rail that is simply always populated, rather than one that
appears when an Agent happens to mention its subject.

| Mode | Fills when | Suits |
|---|---|---|
| A delivery band | An Agent answers, and interfaces stream in | A shelf that reacts to the conversation |
| A search place | The page opens, and it fetches its own | A catalogue, a dashboard, a composed page |

```yaml
- director:
    component: components/nearby   # what draws it, and what makes this a search place
    type: intent                   # which search answers (optional; derived when absent)
    include: [ services ]          # what kind may answer
    pick: 2                        # how many the director keeps
```

**You never write the question.** The director derives it from the first of four voices
that speaks:

1. **The writing.** An `items` place: the writer's headings are the searches.
2. **The page's own pool.** A place wanting only `images` fills from the pictures of
   content the page already holds. No search at all.
3. **The component's contract.** A part whose name and description name a subject
   searches for that subject. Want a section that is always about one thing? Make a
   component that says so; the part is the voice.
4. **The guest's ask.** Every page exists because someone asked for something. A
   generic part searches on that, narrowed by `include`.

An authored question could only duplicate one of these, and a duplicate either agrees
(dead weight) or disagrees (a lie). So the layout says only what **kind** may answer and
how **many** survive, never what to look for.

The search returns more candidates than `pick` (the node's own config owns how many; there
is no per-place search size), and the director judges them against the page's brief. The
part keeps both lanes: its content arrives from the search with no model involved, and its
headings and taglines are the copywriter's afterwards. Nothing declares which prop takes
the rows, because the schema already says so: the prop whose items require only `ref` is
the content prop.

### A list the writer shapes

A search place may carry `items:`. The part then holds a list: the writer authors each
item's heading and its search in one call, one batched search runs with every question
keeping the node's full result budget to itself, and the director places results under
the heading they answer. Heading and content can never disagree,
because the heading is the search.

```yaml
- director:
    component: components/chapters
    items:                # how many items the writer may shape; each ITEM searches
      min: 3
      max: 5
      type: discovery
      include: [ services ]
      pick: 2             # results per item
```

The search words nest inside `items:` because each item is its own search, so `pick`
here always reads per item. On a plain search place the place itself searches, so the same
words sit flat on the place. One word never means two scopes, and the lint holds the
line.

Pick `type` by what the headings will be. Headings that are themes (a stretch of a day, a
mood, a stage of a journey) are neighbourhood questions, so author `discovery` and collect
what lives around each one. Headings that each name one precise kind of thing are named
needs, so author `intent`.

An item whose search returns nothing is dropped, and the page reports it rather than
drawing a hole.

### Pictures

You never author, brief, or search for a part's picture. A card always shows its own
image: it arrived with the content, and it is data. Every other image slot (a written
part's banner, a section's mood image) is assigned by the platform from the page's own
pool: the pictures carried by all the content the page holds, best first. The same
photograph appearing on a card and as the banner is normal design, and a slot is only
ever empty when the page holds no pictures at all.

So a component that wants a picture declares an image prop (writer vocabulary:
`primaryImage`) and stops there. No brief on it, no search for it, nothing to wire.

### Mocking a search place

**studio** seeds a part's props from each prop's `preview:` (falling back to `default:`).
A queried part is usually a component with an array prop, so give that prop a `preview:`
list of realistic items, mock content included. Without one the array seeds empty, a
`visibleWhen` on it hides the whole part, and the template previews with the band simply
missing, which reads as a bug rather than as an empty mock.

## Blocks

A **block** is a small reusable template: a band that holds the reading measure, a
two-column pair, a card frame. It exists so a page's column arithmetic is written once
instead of repeated on every band.

A block is not a new kind. It is a flat template file in the templates home with
`category: Block` and no manifest, and its whole body is a `root:` drawing:

```yaml
unoverse: "1.0"
type: template
name: band
category: Block
root:
  type: Box
  style:
    direction: column
    padding: [ "0", "8" ]
    width: full
    maxWidth: wide
    margin: [ "0", auto ]
    container: inline-size
  children:
    # The block's own mock: studio previews the frame holding these stand-ins.
    - type: Box
      style: { height: "40", width: full, radius: 2xl, background: surface.base, border: subtle }
    - type: Box
      style: { height: "40", width: full, radius: 2xl, background: surface.base, border: subtle }
```

Compose it with `Ref`, exactly like an atom. A `Ref` carrying `children:` fills the
block's opening with your own content, and a `Ref` without children keeps the block's:

```yaml
- type: Ref
  ref: band
  children:
    - copywriter: components/opening
```

The block is inlined before the page's sections compile, so its opening can carry any of
the three words and they become real sections of the composing page. A block's own authored
children double as its mock: **studio** previews the frame holding them, and any caller
replaces them. Give mock stand-ins `background: surface.base` with `border: subtle` so
they read against the canvas.

The sorting test against an atom: an atom is leaf vocabulary a component composes, while a
block is page arrangement a template composes. If it holds sections, it is a block.

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
