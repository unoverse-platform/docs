---
sidebarTitle: "Interface data"
title: "Interface data"
---

An interface is a component and its data, delivered together. When that data comes from
your content, its shape is fixed, and these are the field names to bind to.

## Where it comes from

Ingesting a site or a document writes rows into **spatial**. One row is one item: a
product, a service, a page, an article. The rows are the only content truth, and the
sections tree you curate during an import is derived from them, which is why a row carries
the `section` it came from.

A search returns rows. A row that names a component arrives on screen as an interface,
already filled.

Content data arrives in two layers. Layer 1 comes with the delivery, and every card is
drawn from it. Layer 2 is the long-form record behind the card, fetched only when
something opens.

## Which component a row renders as

A row carries an `app` field naming the component or app it should render as, such as
`acme/product-card`. Anything that finds the row renders what it names, and the row's
fields fill that component's props.

That field is the join between your content and your design. Assign it once per row, or in
bulk across a section, and every future delivery of that row arrives wearing the right
component. A row without one is data an Agent can talk about, rather than an interface it
can show.

## Layer 1: what arrives with the card

Every row carries these, whatever kind of item it is:

| Field | What it holds |
|---|---|
| `universal_id` | The row's handle. The platform uses it to fetch layer 2 |
| `title` | The item's name |
| `description` | Its summary line |
| `object_type` | The kind of row, which decides what else it carries |
| `key_need` | The need this row answers |
| `source_url` | The page it was ingested from |
| `source_id` | Which source it came from, for scoping a follow-up to one document |

**`object_type` is the field to know.** Ingesting a page extracts `need` rows, which carry
one editorial field between them. Promoting a page writes a `service` row, which is the
authored content item a card is built from, and it carries the full set:

| Field | What it holds | On |
|---|---|---|
| `tagline` | The one-line hook, or the category line | `service` |
| `shortDescription` | A short summary, longer than the tagline | `service` |
| `introParagraph` | The opening paragraph | `service` |
| `callToAction` | The label for the action, written for a button | `service` |
| `actionPrompt` | The prompt behind that action | `service` |
| `primaryImage` | The item's main image | `service` |
| `images` | Every image the item carries | `service` |
| `action` | The short verb the page leads with, such as "Check requirements" | `need` |

Rows of other kinds live in **spatial** too, such as `image`, `skill` and `mcp`. They are
not content items, and they do not fill a card.

Images take one detour worth knowing about. A model never receives image URLs, so a row
reaching an Agent carries only a `hasImage` flag, and the server fills `primaryImage` and
`images` on the way to the card. You still bind to them by name as usual, and authored
artwork reaches the screen without passing through a model.

## Layer 2: what `getDetail` adds

A search result is a summary. The full record stays in the dictionary until a component
asks for it, and a component asks by declaring the `getDetail` hook on the state that
needs it ([Lifecycle hooks](/design/lifecycle-hooks)).

| Field | What it holds |
|---|---|
| `bodyCopy` | The long-form markdown body, the main thing a detail view shows |
| `features` | The stated key features, each with a `title`, a `description` and a lucide `icon` name |
| `mainCategory` | The item's category |
| `section` | The section of the site it came from |
| `needs` | The needs this item answers |
| `images` | The image URL array |

The layer 1 editorial fields arrive again with layer 2, so a detail view has the whole
record in one place.

Fields outside these lists never reach a card. Crawler bookkeeping such as timestamps,
paths and structured markup is not content, and a renderer that never sees it cannot leak
it.

## Bind by name

A row fills a component by name, with no mapping layer anywhere. Name a prop `tagline` and
the row's tagline fills it. Name it `subtitle` and nothing arrives, because no row carries
that word.

```yaml
props:
  title:
    type: string
    input: true
    default: Trail Runner
  tagline:
    type: string
    input: true
    default: Built for long distances
  primaryImage:
    type: string
    input: true
    default: /samples/shoe.jpg
```

The failure is quiet, so it is worth recognising: a card whose title streams in while its
image and tagline sit on their preview defaults has a prop name the row does not carry.
Rename the prop to the field, and never add a mapping layer.

## Next steps

<Card title="Lifecycle hooks" icon="webhook" href="/design/lifecycle-hooks" horizontal>
Declare the hook that fetches layer 2 when a detail state opens.
</Card>

<Card title="Components" icon="square-dashed" href="/design/components" horizontal>
Build the card these fields fill.
</Card>
