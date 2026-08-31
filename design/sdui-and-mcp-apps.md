---
sidebarTitle: "How it works"
title: "From file to screen"
---

A definition is data, so it can travel. This page follows one interface from the file you
save to the screens it draws on.

<Frame caption="One file, served over MCP, drawn natively by every channel that subscribes.">
  <img src="/images/design/pipeline.svg" alt="A definition travelling from a YAML file through the universe to every channel's SDK" />
</Frame>

## What you write

You author YAML definitions and token files: components, templates, apps and styles.
Nothing you write is compiled, bundled or shipped inside a client.

## Your universe serves it

Your universe serves every definition over MCP, as a resource with a `unoverse://` address.
Clients subscribe to those resources, so an update notification is how a change reaches a
running app. Themes travel the same way, at `unoverse://theme/<name>`.

This is why change is live. Save a file and **studio** redraws it. Publish it, and every
subscribed client updates, in production, with no release.

## The SDK draws it

Each channel has an SDK that draws your definition with that platform's own native
controls: React on the web, SwiftUI on iOS, Jetpack Compose on Android, Flutter widgets in
Flutter. The SDK hardcodes no feature, no style and no UI concept. It resolves token names
and moves state, and that is the whole of it.

<Frame caption="The SDK receives the definition, the data and the theme; the client renders the hydrated interface.">
  <img src="/images/design/sdk-draw.svg" alt="A definition, its data and a theme entering the SDK, and the client rendering a fully hydrated product card" />
</Frame>

The web SDK is served by the MCP server itself, so it is never installed anywhere: a
browser channel loads it with the page, out of the box. A native SDK, such as Flutter or
React Native, is a package inside the client app, so it arrives and updates with the app's
own upgrade. Your definitions update live on both, because the SDK is the renderer, never
the content.

Because the renderer belongs to the channel, one definition is native everywhere, and a new
channel needs a client rather than a new set of screens.

## One interaction path

The SDK owns every message that moves. You never build transport.

| What happens | How it travels |
|---|---|
| A user sends a message | `tools/call` on the app's trigger tool, fire and forget |
| A form or wizard answers | A native MCP elicitation, resolving the call the Agent is waiting on |
| Results come back | The component stream, never the call result |
| UI state arrives | Run-scoped messages on the MCP `/stream` |

A host must never hand-roll its own send, its own state push or its own message shape. Every
consumer shares the one path: **studio**, a native app, an external MCP client. A channel
that needs something the path does not do is a gap to raise.

Voice is the one exception, and it is not yours to wire. Audio frames travel a separate SDK
socket because binary audio cannot ride the same lane. [State](/design/state) covers what
that projects into your scope.

## How interfaces arrive

An interface reaches the screen three ways, and every route ends the same: it arrives
whole, wearing a state.

<Frame caption="Three routes, one ending: interfaces arrive complete, and the template holds them.">
  <img src="/images/design/interfaces-arrive.svg" alt="Interfaces streamed from spatial, answered by a query, or carried in the definition, all landing in a template" />
</Frame>

| Route | Where the data comes from |
|---|---|
| **Streamed** | The running workflow answers with interfaces from **spatial**, complete with their data |
| **Queried** | A template asks for interfaces the way you would query data: `query: { type: product }` fills a rail with product cards |
| **Carried** | The definition holds its own data, authored in: the static parts of a template, or a self-contained app |

Which route delivered an interface tells you where its data came from, and nothing else.
Showing it is the same contract for all three: the interface owns its state, and the
templates on screen react to the state it is in, by name.

## State, in one paragraph

Every interface is a small state machine. Its states are the faces it can show, each state
owns its own layout, and only the interface writes its own state. A tile becomes a full
page because it wrote `state: page`, and the template holding it reacted to the name.
Nothing else is consulted, which is why there is no router, no global store and no wiring.
[State](/design/state) is that contract in full.

## Next steps

<Card title="Coming from React" icon="repeat" href="/design/coming-from-react" horizontal>
Every framework reflex, and what it becomes here.
</Card>

<Card title="Components" icon="layout" href="/design/components" horizontal>
Author your first kind: the anatomy, the vocabulary and the rules.
</Card>
