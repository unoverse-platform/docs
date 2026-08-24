---
sidebarTitle: "Overview"
title: "Design"
---

Design the interfaces your Agents speak through: cards, forms, documents and whole apps. You
write each one once, in YAML, and every channel renders it natively.

You never write React, SwiftUI or Compose. Three ideas make that possible, and everything
else in this section is built on them.

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

**This is not a new idea, and it is not a small one.** Server-driven UI is how much of the
mobile industry now ships. Airbnb, Netflix, Lyft, DoorDash, Spotify and Instacart have all
moved their most-used surfaces onto it. Each had its own reason, and all of them shared one:
changing what a user sees stopped requiring a release.

Airbnb rebuilt search, listing pages and checkout on a server-driven platform they call
Ghost. One backend response controls the layout, the sections in it, the data in each, and
the actions on them. Web, iOS and Android, at once.

Lyft did the same so it could A/B test interface changes without waiting on release cycles.
DoorDash built Facets, and took banner rollouts from weeks to under a day.

<div className="ref-source">
Further reading:
<a href="https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5" target="_blank" rel="noopener">A Deep Dive into Airbnb's Server-Driven UI System</a>,
by Ryan Brooks
(<a href="https://www.infoq.com/news/2021/07/airbnb-server-driven-ui/" target="_blank" rel="noopener">InfoQ summarises it</a>
if Medium asks you to sign in).
<a href="https://medium.com/digia-studio/server-driven-ui-sdui-the-necessary-evil-for-scalable-mobile-apps-80c650a2c8de" target="_blank" rel="noopener">SDUI: the necessary evil for scalable mobile apps</a>
is the honest case, trade-offs included.
</div>

| What it buys you | Why it follows |
|---|---|
| **Every platform, one definition** | The same file draws on web today, and natively on iOS, Android and Flutter as those SDKs land. You never fork an interface per platform |
| **AI can work with it** | A model can choose an interface, fill it and update it mid-conversation, because a definition is data rather than code |
| **It is quick to build and to change** | No build step, no bundler, no release. Save the file and **studio** redraws it |
| **The brand stays yours** | Every visual value is a token name, so a rebrand edits `styles/` and touches no definition. With no release cycle in the way, the experience is something you tune rather than something you schedule |
| **New channels cost nothing** | Anything that speaks MCP can render your interfaces. A new surface needs a client, not a new set of screens |

The second row is why we build this way rather than for the usual reason. A model cannot write
React you would dare run. It can pick a card and fill six fields, and the worst it can do is
pick the wrong card.

So your Agent answers with a real booking card, a working form, a comparison table. Not a wall
of text describing one.

<div className="concept-label">Core concept</div>

## Why YAML

<div className="concept-lede">Because the thing you are writing is a description, not a program.</div>

YAML is the plainest format that carries structure. It is a deliberate constraint rather than
a preference.

| | |
|---|---|
| Your editor checks it as you type | The schema squiggles an unknown primitive or a missing field before you save |
| There is nothing to compile | Save the file, and **studio** redraws it |
| It reviews like prose | A colour change is a one-line diff a designer can read |
| **An AI can write it safely** | The whole point of the constraint |

A definition cannot compute, loop or call anything. That sounds limiting for about an hour,
and then it is the feature: what an Agent produces is verifiable, and what you review is
small. The same property makes a definition portable, because there is no code for another
platform to be unable to run.

Anything genuinely computed happens in a workflow node and arrives as a plain field.

<div className="concept-label">Core concept</div>

## MCP Apps

<div className="concept-lede">The way your interface reaches a model, using a standard rather than an integration.</div>

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

## What you author

Four kinds of file, all YAML, all under `design/<your-org>/`.

| | What it is | Where it lives |
|---|---|---|
| **Component** | One piece of interface an Agent sends into a conversation: a card showing a booking, a form, a chart | `components/<name>/` |
| **App** | A whole surface with its own layouts and states, opened by an Agent rather than placed in the flow | `apps/<name>/` |
| **Atom** | A shape two components share, composed in rather than copied: a button, a badge, a card frame | `design/marketplace/atoms/` |
| **Styles** | Your brand: the colour, type and spacing values every definition resolves against | `styles/` |

An atom is authoring-time only. The server expands it before serving, so nothing downstream
has to know it existed.

## The rules that never bend

Four constraints, and each one is the price of something above.

**Primitives are a closed set.** `Box`, `Text`, `Each`, `Switch` and fourteen more. You
compose a chart from `Box` and `Each`, and never add a primitive. Anything a client would
have to special-case cannot travel.

**No raw values.** Never a pixel, never a hex colour, only token names.

**No expressions.** Nothing computed beyond equality and truthiness.

**A component owns its own state.** It writes only its own slice, and the app hosting it
reacts by name. Nothing reaches into a component after it is placed.

## Next steps

<Card title="Quick start" icon="rocket" href="/design/quick-start" horizontal>
Build a component and watch it render in **studio**.
</Card>

<Card title="Reference" icon="book-marked" href="/reference/overview" horizontal>
Every field you can write, generated from the schemas.
</Card>
