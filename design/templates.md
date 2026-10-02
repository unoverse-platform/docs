---
sidebarTitle: "Templates"
title: "Templates"
---

A template is a component that holds components: a menu, a comparison pair, an email, a
landing page. It has the same shape as a component: external states that say where it shows,
internal steps, props, and it can be a task. The one difference is that it holds components,
and each one it holds manages its own state.

<Tip>
**Does it hold other components, or present one thing?** Holding is a template. One thing
is a component.
</Tip>

The folder grammar is the same as every other artifact, and
[Essentials](/design/essentials) covers it. This page is what makes a template a template.

## A complete template

`email-digest` is a whole template: an envelope, one layout, and the parts it places. It
composes one letter for one reader.

<CodeGroup>

```yaml email-digest.yaml
unoverse: "1.0"
type: template
name: email-digest
states:
  email:                   # one state: an email is read, never navigated
    layout: layouts/email
```

```yaml layouts/email.yaml
# The letter, in the order it is read.
type: Box
style:
  direction: column
  gap: "5"
children:
  - type: Ref
    ref: components/masthead   # its props are input: false, drawn as designed
  - type: Ref
    ref: components/subject    # its props are input: true, written by an Agent
  - type: Ref
    ref: components/body
  - type: Ref
    ref: components/items      # the items the letter shows, chosen by an Agent
  - type: Ref
    ref: components/signoff
  - type: Ref
    ref: components/footer
```

```yaml manifest.yaml
description: A composed email with a branded frame, a written message, the items worth the reader's attention and a sign-off.
whenToUse: Compose an email, digest or announcement for one reader.
category: Arrangement
```

</CodeGroup>

The parts live in the template's own `components/` folder as flat files with no manifest,
because a manifest is for being discovered and a template's parts never are. Each is a
normal component with its own props and its own drawing.

## Placing a part

A layout places one of its template's parts with the same element that places anything
else, a `Ref` whose `ref` is the part's path:

```yaml
- type: Ref
  ref: components/subject
```

A `Ref` into the template's own `components/` folder is a part. It is drawn where you put
it, and the part's file name is its name on the page: `components/subject` is the part
`subject`. Everything else on the line, such as a `style`, rides through to the place it
is drawn.

**What an Agent writes is decided by the part's props, and by nothing else.** Each prop
marked `input: true` is filled by an Agent or a workflow, and each prop marked
`input: false` is drawn from its `default`, as designed. A masthead whose props are all
`input: false` never changes; a body whose props are `input: true` is written for every
reader. The layout only arranges.

You never author `ComponentSlot`, `select` or `where` in a template. A placed part
compiles to those primitives when the template is served, so the renderer stays dumb.

## Holding a component

A template holds one of the project's own components with the same `Ref`, inside an `Each`
over the things it shows. Each item becomes its own instance of that component:

```yaml
# layouts/options.yaml: the courses, each with its dishes
- type: Each
  bind: { items: courses }
  item:
    type: Box
    children:
      - type: Text
        bind: { value: name }
      - type: Each
        bind: { items: dishes }
        item:
          type: Ref
          ref: menu-item           # each dish is its own menu-item, with its own state
```

A `Ref` to a component whose states name places, inside an `Each`, is held rather than
drawn flat. Each item's fields fill the component's props by name, so the item carries the
component's own prop names. Each held instance is keyed by its item's id.

The held component keeps its own state ([State: inside a template](/design/state)). It
arrives in its first state, in its spot in the template. Tapped, it writes its own `page` and
opens in the place that state names, laid over the template. Its ✕ writes `grid` and it is
back in its spot. The template never holds the component's fields in its `values:`, and
never gives it a step of its own to open into.

<Warning>
**Not built yet.** Today a component placed in a template is drawn flat, with no state of its
own. Until it is built, a set of things that each open is shown as top-level components in a
place that holds many.
</Warning>

## Writing into a part

A part's written fields are its `input: true` props, each with a description written as
direction to a writer, including what not to do
([Components](/design/components) covers props):

```yaml
props:
  greeting:
    type: string
    input: true
    description: >-
      The greeting, on its own line. The reader's first name and a comma when the source
      gives a name, and a plain "Hello," when it does not. Never invent a name, never
      guess a title, and never add a line of small talk here.
    maxLength: 40
    default: Hello,
```

Give each field its own prop when the jobs differ. A greeting, a message and a line that
hands off to the items below are three different writing jobs, and one description could
not govern all three.

The template's schema is every placed part's `input: true` props, gathered under each
part's name in the order the page reads. An Agent fills the whole page in one call.

### A list of found things

A part can hold things the Agent found rather than wrote: products, places, articles. Give
it an array prop whose item fields are all hydrated, and each item collapses to one
required `ref`, the result the Agent picked. Its name, words, picture and link arrive with
the result, so nothing about the thing itself is ever invented:

```yaml
props:
  items:
    type: array
    input: true
    description: The items worth this reader's attention, most relevant first.
    minItems: 1
    maxItems: 3
    items:
      title:
        type: string
        description: The item's own name, exactly as it is published.
        hydrate: title
      description:
        type: string
        description: What the item is, in its own published words.
        hydrate: body
      image:
        type: string
        description: The item's own picture.
        hydrate: image
```

`maxItems` is how many the part holds, and the referee enforces it.

### Pictures

You never author or search for a part's picture. A found item always shows its own
image: it arrived with the content, and it is data. Every other image slot (a written
part's banner, a section's mood image) is assigned by the platform from the page's own
pool: the pictures carried by all the content the page holds, best first. The same
photograph appearing on an item and as the banner is normal design, and a slot is only
ever empty when the page holds no pictures at all.

So a component that wants a picture declares an image prop (writer vocabulary:
`primaryImage`) and stops there. No search for it, nothing to wire.

## A template that asks

A template hands answers back exactly as a component does
([Components: a component that asks](/design/components)): an `outputs:` block on the
envelope names the answers, and the button that finishes it ends in `type: submit`. The
fields it asks for are its parts' `input: true` props, so an Agent working it asks for each
one still empty, and the person's answer fills it.

```yaml
# the envelope
outputs:
  name:
    type: string
    description: The person's full name, as they would like to be addressed.
```

```yaml
# layouts/form.yaml, the last button
action:
  type: setValue
  values:
    - key: state
      value: done
  then:
    type: submit
```

## Slides

A template whose steps are slides says so with `arrows: true` on the state that holds them,
and the arrow keys step it. Only a state marked so answers the keys: a form whose last step
is its thanks leaves it out, so the keys never skip the form.

```yaml
states:
  presentation:
    layout: layouts/presentation
    place: main
    arrows: true
    states:
      welcome:
        layout: layouts/welcome
```

## Preview

**studio** seeds every part from each prop's `preview:` (falling back to `default:`), so
the arrangement reads as finished while you design, before any Agent has written a word.
Give an array prop a `preview:` list of realistic items, mock content included. Without
one the array seeds empty, a `visibleWhen` on it hides the whole part, and the template
previews with the part simply missing, which reads as a bug rather than as an empty mock.

Every preview is ignored at runtime. A real fill replaces all of it.

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
    - type: Ref
      ref: components/opening
```

The block is inlined before the page's parts compile, so a part placed in its opening is a
real part of the composing page. A block's own authored children double as its mock:
**studio** previews the frame holding them, and any caller replaces them. Give mock stand-ins `background: surface.base` with `border: subtle` so
they read against the canvas.

The sorting test against an atom: an atom is leaf vocabulary a component composes, while a
block is page arrangement a template composes. If it holds parts, it is a block.

## Arriving in an app

A template is streamed into an app exactly as a component is. Its external state names the
place it shows in, and the app opens that place. The app never names a template:

```yaml
states:
  task:                      # the whole comparison
    layout: layouts/page
    place: main
  inline:                    # the chip it steps aside to
    layout: layouts/inline
    place: chat
```

Everything about how a template fills stays in the template itself.

The delivery owns the parts. Each turn's delivery replaces the last, a delivery that
confirms nothing clears them, and an empty template collapses, frame included.

## How an Agent finds it

Your `manifest.yaml` carries the four fields that decide whether this is ever chosen:
`title`, `description`, `whenToUse` and `category`. The rules are identical for every kind,
they are enforced by the deploy lint, and
[Node discoverability](/nodes/node-discoverability) is the contract.

A template that a workflow works names it in the same manifest, the field an app carries:

```yaml
binding: { workflow: wf-acme-site, trigger: inputtrigger1 }
```

## Next steps

<Card title="Apps" icon="layout-template" href="/design/apps" horizontal>
Arrange templates into the whole experience.
</Card>

<Card title="State" icon="workflow" href="/design/state" horizontal>
The reaction contract templates and interfaces share.
</Card>
