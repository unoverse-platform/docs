---
sidebarTitle: "Node discoverability"
title: "Node discoverability"
---

Write the four fields that decide whether your work is ever chosen. Every other guide links
here rather than restating the rules.

**Nothing selects your artifact by name.** When an Agent needs something, it does not see
your catalogue. It describes the job, and the platform returns a handful of candidates
ranked by how close their meta reads to that description. You are in that handful or you
are invisible. The failure is silent, because the thing works perfectly and is simply never
reached for.

The same contract covers **nodes, apps, components, templates and Agent skills**. A node
carries the fields in `node.yaml`, where the thing's name is `name`; everything else carries
them in its `manifest.yaml`, where it is `title`.

| Field | Its one job |
|---|---|
| `name` or `title` | The thing itself. No project prefix, no mechanism |
| `description` | What it **is**: the listing subtitle, one line. No "use when…" inside it |
| `whenToUse` | The **selection text**, which replaces `description` in the ranking when present |
| `category` | The domain of the job, never the implementation |

The ranked text for a node is its name, then `whenToUse`, then its category. `description`
is used only when there is no `whenToUse`. So `whenToUse` is the field that matters most.
It is not a footnote. It is the text being matched.

Lint holds you to it. A node with no `whenToUse` is an error, because it can never be
found. One that merely repeats its description is an error, because it carries no signal.
One that opens with plumbing or marketing is a warning. A component's or app's
`description` must be one line of 20 to 120 characters, or it is an error.

```yaml node.yaml
name: Smart Document
category: Documents
description: Authors and revises a long document section by section
whenToUse: >-
  Pick whenever an Agent must author or revise a long document: a report, plan, spec,
  article or brief. Writes and revises section by section, so a one-shot generation
  cannot be revised and blows the context window on every change.
```

## Write for the task, not for a reader

Before writing a word, write down the one-line task a planner would type for the job your
node does.

> "write a long report that the Agent can revise"

Those nouns and verbs are what your `name` and `whenToUse` have to match. If your opening
words are not in that sentence, your node loses to one whose are.

**The opening dominates.** A `whenToUse` that starts "Hybrid MCP node, attach via a service
edge…" is matched against wiring vocabulary rather than the job. It ranks low and never
surfaces. Same node, same capability, invisible.

## The formula

Three layers, in this order.

**1. Outcome first.** Lead with the job in the words someone would use to describe it, not
the mechanism you built.

> Pick whenever an Agent must author or revise a long document: a report, plan, spec,
> article or brief.

**2. Disqualify yourself by property.** Say what makes your node right or wrong as a
property of the work, never by naming another node.

> Writes and revises section by section, so a one-shot generation cannot be revised and
> blows the context window on every change.

Naming a rival dates the moment a node is added or renamed, and it builds a web of
cross-references between nodes that all have to be maintained. Describe your own property
and let ranking surface the alternative.

**3. The wiring fact, last.** One sentence, and only if it is needed to work at all.

> Attach via a service edge to an agent node.

Keep it generic. Name the *kind* of consumer, "an agent node", not a specific node that will
be renamed later. The exception is a hard dependency: if your output must go somewhere
specific to be any use, name that.

Mechanism last, always. It is necessary for wiring and fatal for ranking when it leads.

## Category counts too

`category` is part of what gets matched, so pick the one that describes the **job**, not how
you built it. A node that produces a document is `Documents`, not `Agent Tools`, because the
second pulls it towards tool-plumbing vocabulary and away from the work.

The categories are: AI, Voice, Go To Market, Search, Web Scraping, Media & Design, Documents,
Knowledge & Vectors, Storage & Data, Communication, Flow, Output.

Add a new one only when a node's job genuinely fits none of them. Do not force-fit into a
catch-all.

## Anti-patterns

| Do not | Why |
|---|---|
| Lead with mechanism | "Hybrid MCP node…", "Callback node that…". Right words, wrong position, sinks the ranking |
| Name another node | Dates immediately, and describes their job rather than yours |
| Restate the description | "Use this node to call the Example API" carries no signal |
| Write marketing | "A powerful, flexible node for all your needs" |
| Describe the endpoint | "Calls GET /v2/companies/enrich with retry". Selection is on the job, not the URL |
| List what it is not for | Every job named in the text pulls messages about that job towards it |

## Before you ship

1. Write the one-line task a planner would type. Do its key words appear in your **first
   sentence**?
2. Which node wins that job today if yours did not exist? Did you sharpen the property that
   beats it, without naming it?
3. Is any wiring fact last rather than first?
4. Does `category` match the job the node does?
5. Is every claim true of what the node actually does?

Ranking uses what is published, so deploy the node before expecting new wording to change
what gets picked.

## The same rule for tasks: apps, components and skills

Apps, components with a manifest, and Agent skills are discovered the same way, with one
difference that decides everything. Nodes are matched against a **planner's task**, so "Pick
when a step needs…" reads correctly. Tasks are matched against **what a person actually
said**. Write the words they would say.

```yaml
# Wrong: instructions about the user, in developer vocabulary
whenToUse: Pick when the user asks to talk or wants a phone-style assistant.

# Right: the words a person would say
whenToUse: Talk to the assistant by voice, hands free, instead of typing.
```

A task is placed on the map by its `title` and its `whenToUse`, verbatim. A short request
from a person lands on the task whose text sounds like it. So the opening of `whenToUse`
does the work, and it should be several phrasings of the same request, not one.

```yaml
title: Card Finder
description: A guided chooser that ends in one card the customer wants to apply for.
whenToUse: >-
  Help me choose a card. Which one is right for me, I do not know where to start, decide
  for me. Asks the few things only I can answer, then names one card and why it fits.
```

Three rules for a task, in order:

1. **Open with the request, three or four ways.** Short, in the first person, the way it is
   typed or said: "help me choose a card", "which one is right for me", "decide for me".
   Each phrasing is another way for a real message to land on this task.
2. **Then one property, stated as what the thing is.** "It moves money." "It starts from a
   product I have named." One sentence. It is how a near neighbour loses the match without
   being named.
3. **Nothing else.** No steps, no list of what it is not for, no sibling's job. Every idea in
   the text pulls the match towards itself, so naming the jobs you should lose pulls those
   messages to you.

**Requests and questions are different sentences.** A task is something a person wants
done: compare, choose, send, apply, speak to someone. A question, "what does this card
cost", should land on content, not on a task. If a task's `whenToUse` reads like an
answer to questions, questions will open it. Keep it to requests.

**Beware the generalist trap.** A fallback surface that lists everything its siblings do will
outrank them for their own jobs. A fallback owns general help and questions, and cedes
specific jobs by property without naming them.

## Next steps

<Card title="Testing" icon="flask-conical" href="/nodes/testing-nodes" horizontal>
Run the node against the real service before you wire it up.
</Card>

<Card title="node.yaml" icon="book-marked" href="/reference/node-envelope" horizontal>
Where `whenToUse` sits, with every other envelope field.
</Card>
