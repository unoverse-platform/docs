---
sidebarTitle: "Overview"
title: "Design"
---

Design the interfaces your Agents speak through: cards, forms, documents and whole apps. You
write each one once, and [server-driven UI](#server-driven-ui) renders it natively on every
channel through [our SDKs](#mcp-apps).

<Frame>
  <img src="/images/design/ai_ux.jpg" alt="Abstract light curves" />
</Frame>

## UX for Agents

Traditional UX designs for a person arriving at a website. Its patterns give that person a
mental model: how to move around, where the content lives, how to find the right thing at
the right time. Decades of refining those patterns produced modern UX.

Designing for AI is different, because you design for the Agent, and the human is
context. An Agent works through a task and reaches a moment where it needs a person. At
that moment it presents an interface, because a problem is solved faster on an interface
than in prose.

That moment is almost always a decision:

| The moment | What the interface does |
|---|---|
| A decision is open | Presents the choices that can be made |
| The person has chosen | Helps them carry it out better and faster |
| The Agent has chosen | Asks the person to confirm it |

So an Agent's interface is about bubbling up the right functionality, in the right form,
at the right time. This is a new space for UX, and it builds toward something bigger:
**relationship experience (RX)**, products and services where a person builds a
relationship with technology over time.

You never write React, SwiftUI or Compose. Three ideas make that possible, and everything
else in this section is built on them.

<div className="concept-label">Core concept</div>

## An interface-centric system

<div className="concept-lede">The unit of a design system for AI is the interface, not the component.</div>

<Tip>
An **interface** is a component that carries its data, and it can have multiple states.
</Tip>

Take a product card: the card is the component and the product is its data. Give it
states, and the same card can show as a compact tile or a full page. A simple card needs
none.

An interface arrives whole. One delivery carries the data for every state it can show, so
when a compact tile opens into its full page, there is nothing left to fetch. An update is
simply a new delivery, and the templates on screen react to it.

That one noun is what makes this design system different. Other systems route between
screens. Here, interfaces move, and everything on screen reacts to them:

- Agents **stream** interfaces into the conversation as they answer.
- Templates **query** interfaces, or hold the ones each delivery brings.
- A template **reacts to the state** an interface arrives in. Six cards arriving compact
  draw a grid. One arriving as a full page draws the hero.
- Apps **arrange** templates into the experience.

<Frame caption="Interfaces arrive in a state; templates react; the app arranges.">
  <img src="/images/design/interface-flow.svg" alt="Interfaces streaming and being queried into templates, arranged by an app" />
</Frame>

Nothing wires any of this together. An interface owns its own state, a template reacts to
the states it recognises by name, and an app holds only the arrangement. When a card opens
itself into its full page, the template showing it reacts. The app did nothing, because
there is nothing for it to do.

You author five kinds, top to bottom, each with its own section ahead:

| | What it is |
|---|---|
| **App** | Arranges templates into an experience: the shell, the navigation, which templates exist |
| **Template** | An authored arrangement with open sections that deliveries fill: a grid, a rail, an email frame |
| **Component** | Presents one thing an Agent sends into a conversation: a card showing a product, a form, a chart |
| **Atom** | A shape components share, composed in rather than copied: a button, a badge, a card frame |
| **Styles** | Your brand: the colour, type and spacing values every definition resolves against |

The line between a template and a component is one question: does it arrange many sections, or
present one thing?

**You start with a design system, not a blank folder.** The platform ships one as a
marketplace package: generic components, templates and atoms, plus the token foundation,
installed into your universe and read-only. Browse it in **studio**'s Components list, use
any piece by its bare name, and compose its atoms into your own components with `Ref`.
Your org's tokens skin all of it, so it arrives already wearing your brand.

Every kind is a plain YAML file: a description, not a program. A definition cannot compute,
loop or call anything, which is exactly why an AI can write one safely and why the same file
renders on every platform.

If you think in React, keep one law and drop the rest: `UI = f(state)`, applied at every
scale. There is no router and no global store. [Coming from React](/design/coming-from-react)
maps the rest of your instincts.

<div className="concept-label">Core concept</div>

## Server-driven UI

<div className="concept-lede">Your interface is data, and it travels.</div>

Instead of shipping screens inside an app, you describe them on the server and send the
description. The client draws it with that device's own native controls.

<Frame caption="One description on the server, drawn natively by whatever asks for it.">
  <img src="/images/design/SDUI-Framework.png" alt="Interface pieces assembled from a single served description" />
</Frame>

A definition says "a box, containing a bold text bound to `title`, and a button". It never
says what a button looks like, because that is the device's job and the theme's job.

**Server-driven UI is how much of the mobile industry now ships.** Every company below
adopted it for the same core benefit: changing what a user sees no longer requires a
release.

| Company | What runs on server-driven UI |
|---|---|
| **Airbnb** | Search, listing pages and checkout, on an internal platform called Ghost. One backend response controls the layout, the sections, the data and the actions, on web, iOS and Android at once |
| **Lyft** | Interface A/B tests that no longer wait on app-store release cycles |
| **DoorDash** | Facets, its layout system. Banner rollouts went from weeks to under a day |
| **Netflix, Spotify, Instacart** | Their most-used surfaces |

<div className="ref-source">
Further reading:
<a href="https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5" target="_blank" rel="noopener">A Deep Dive into Airbnb's Server-Driven UI System</a>,
by Ryan Brooks
(<a href="https://www.infoq.com/news/2021/07/airbnb-server-driven-ui/" target="_blank" rel="noopener">InfoQ summarises it</a>
if Medium asks you to sign in).
<a href="https://medium.com/digia-studio/server-driven-ui-sdui-the-necessary-evil-for-scalable-mobile-apps-80c650a2c8de" target="_blank" rel="noopener">SDUI: the necessary evil for scalable mobile apps</a>
is the honest case, trade-offs included.
</div>

For you, coming into this fresh, server-driven UI removes whole categories of work:

| What it gives you | Why it follows |
|---|---|
| **Cross-platform** | The same file draws on web today, and natively on iOS, Android and Flutter as those SDKs land. You never fork an interface per platform |
| **Cross-channel** | Your interfaces reach your website, your apps, ChatGPT and Claude, because every channel is an MCP client. [MCP Apps](#mcp-apps) below covers this, and you will learn a lot about it |
| **AI-native** | A model can choose an interface, fill it and update it mid-conversation, because a definition is data rather than code |
| **Live changes** | No build step, no bundler, no release. Save the file and **studio** redraws it; publish it and every client hot-reloads |
| **Your brand** | Every visual value is a token name, so a rebrand edits `styles/` and touches no definition |
| **Verifiable** | A definition cannot compute, loop or call anything. What an AI writes is checkable, and what you review is a small, readable diff |

The industry moved to server-driven UI to ship faster. We chose it because AI can work
with it. A model cannot write React you would dare run. It can pick a card and fill six
fields, and the worst it can do is pick the wrong card.

So your Agent answers with a real product card, a working form, a comparison table. Not a
wall of text describing one.

<div className="concept-label">Core concept</div>

## MCP Apps

<div className="concept-lede">The way your interface reaches a model, using a standard rather than an integration.</div>

<Frame caption="MCP Apps: one protocol, spoken by every host worth reaching.">
  <img src="/images/design/mcp-app.png" alt="The Model Context Protocol mark" />
</Frame>

[MCP](https://modelcontextprotocol.io/extensions/apps/overview) is the protocol Claude,
ChatGPT and a growing list of hosts already speak. MCP Apps is its extension for tools that
carry a user interface, and your definitions are served as exactly that.

An Agent calls an ordinary tool. The result points at a `ui://` resource, and the host
renders it. Nothing about that is unoverse-specific.

**The renderer belongs to the channel, not to your app.** That is the part worth
understanding, because it is what keeps one definition native everywhere:

| Whatever calls your app | Loads | And draws |
|---|---|---|
| Web | the web SDK | React and the DOM |
| iOS | the Swift SDK | SwiftUI |
| Android | the Kotlin SDK | Jetpack Compose |
| Flutter | the Dart SDK | Flutter widgets |

So the same app is native on each, without an HTML bundle in the middle. Write once as a
neutral definition, render native on whatever calls it.

A host carrying no unoverse renderer, such as Claude showing a widget in a plain iframe, gets
a self-contained web-rendered bundle built from that same definition. A fallback, not the
main path, and you author nothing extra for it.

| What you get | Rather than |
|---|---|
| Your app opens inside ChatGPT and Claude | Building a separate integration for each |
| Hot reload in production | A deploy. Clients subscribe to your definitions, so the update notification is the reload |
| One interaction path | A bespoke transport per channel. Sending is `tools/call`, and answering a form is an elicitation |
| Portable Agents | Being locked to whichever host you built for |

The practical consequence: the surface you preview in **studio** is the surface a host
renders, because **studio** is another MCP client reading the same resources.

MCP Apps brings your app into the chat, and the same server speaks a second direction.
With WebMCP, a page built on unoverse announces its own tools to the visitor's browser
agent. An agent on your website calls the real app rather than scraping the screen.

In both directions the Agent is a concierge, not a driver. It surfaces your interface and
prepares it; the person uses it. What the person does on the interface returns to the
Agent as context, so the interface itself is the conversation.

## Next steps

<Card title="Quick start" icon="rocket" href="/design/quick-start" horizontal>
Build a component and watch it render in **studio**.
</Card>

<Card title="Reference" icon="book-marked" href="/reference/overview" horizontal>
Every field you can write, generated from the schemas.
</Card>
