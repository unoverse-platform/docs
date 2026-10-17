---
sidebarTitle: "MCP services"
title: "MCP services"
---

MCP is how an Agent gets tools. A node offers tools, an Agent node calls them, and the two
are joined by a service edge on the **canvas**.

There are two sides to build, and they are separate jobs.

| You are building | Read |
|---|---|
| A node that **offers** tools to an Agent | [Offering tools](#offering-tools) |
| A node that **uses** tools, meaning an Agent | [Using tools](#using-tools) |

## Offering tools

Declare an `mcp` connector with `isService: true`, and list the tools by name.

```yaml interface.yaml
serviceConnectors:
  - name: mcpService
    description: Looks things up in the product catalogue
    serviceType: mcp
    isService: true
    methods:
      - findProduct
      - readProduct
    instructions: >-
      Search first with findProduct, then read the one you want with readProduct.
      Never guess an id.
```

Then write each tool in `api/service.yaml`, exactly as any other service method.

```yaml api/service.yaml
findProduct:
  description: Find products matching a search term.

  calls:
    - name: search
      method: GET
      url: https://api.example.com/products
      transport: json
      query:
        q: "{{ params.term }}"

  returns: "return response.items"
```

**`description` is what the Agent reads to decide whether to call it.** It is the tool's
selection text, so write what the tool achieves, not how it works. A vague description means
a tool that never gets picked, or gets picked for the wrong thing.

**`instructions` on the connector is different.** Each `description` says what one tool does.
`instructions` says how to use them well together, which is the thing no single tool
description can express. There is a section on writing it below.

**`params` is what the Agent passed.** Its shape comes from the tool's own inputs, so
validate what you rely on rather than assuming.

## Using tools

An Agent node consumes tools rather than offering them, so it declares the same
`serviceType` with `isService: false`.

```yaml interface.yaml
serviceConnectors:
  - name: mcpService
    serviceType: mcp
    isService: false
    description: MCP service connector, automatic schema discovery
```

Whatever is wired to that connector becomes the tool list. Nothing wired means no tools, and
the node should degrade to a single request rather than fail.

Then `api/toolExchange.yaml` describes how this API expresses a tool call.

```yaml api/toolExchange.yaml
$ref: tools

maxTurns: "{{ config.maxTurns }}"
stuckAfterRepeats: 3
```

**Declaring a `toolExchange` makes the node a `CallbackNode`**, because a tool loop is
multi-turn by definition. Lint enforces that.

### What the exchange describes

The platform counts the turns and runs the tools. The manifest describes the wire format,
because every API expresses the same idea differently: how a tool is offered to the model
and which request field the list goes in, how a call arrives and how to read its name and
arguments, how a result goes back, and how one turn chains to the next. The
[reference](/reference/node-api) lists every key.

That is a lot to write per node, so **put it in `shared/` once and `$ref` it**. Every node
for the same API imports the same protocol, and local keys layer on top.

```yaml
$ref: tools
maxTurns: 5
```

When the API changes how a function call is expressed, exactly one file changes.

### Many tools: progressive discovery

An Agent given many tools does not get every definition up front. This is MCP's own guidance
for hosts ([Client Best Practices, Progressive Tool Discovery](https://modelcontextprotocol.io/docs/2026-07-28/develop/clients/client-best-practices)),
and the platform's harness is the host, so it does this for every Agent, on any model.

When the definitions of the tools wired to an Agent add up to more than about 2,000 tokens
(MCP suggests switching at 1% to 5% of the context window), the model starts with two tools
instead of all of them:

| Tool | What it does |
|---|---|
| `search_tools` | Takes a plain description of the job and answers with the few tools that fit it, each with its full input schema and the server it comes from |
| `call_tool` | Calls one of those tools by name, with its arguments |

Below the threshold nothing changes: every tool is offered as before.

Some tools are never held back: Spatial search, the screen verbs, and any tool a search or an
open page has already given the Agent. A server's `instructions` still reach the Agent in
full, so a rule that spans its tools is known before any tool is loaded.

**The tool list never changes during a run.** Every call goes through `call_tool`, so the
model's prompt cache holds from the first turn to the last. This is the second of MCP's two
cache-safe options; adding tools mid-run would break the cache at that point.

**What this asks of a node.** Nothing new, but your tool `description`s now do the finding:
`search_tools` matches the job against each tool's name, server and description. A
description that says what the tool is for is found; one that says how it works is not
([Node discoverability](/nodes/node-discoverability)).

### Two limits, and why both exist

`maxTurns` bounds how long the loop may run. Set it to 1 and the node answers in a single
pass and cannot call a tool at all.

`stuckAfterRepeats` catches a different failure. The same tool with the same arguments three
times is stuck. `maxTurns` does not catch it, because a model calling many *different* tools
forever is not stuck by that rule.

## A Task as a tool

A **Task Start** offers its Task the same way. Draw a line from the handle at the bottom of a
Task Start to an Agent, and the Agent has one more tool: the Task, named by its title,
described by its description and when to use, taking its input schema.

The Agent calls it as an MCP task: it gets the task's id at once, follows it, and reads its
result when it finishes. A Task Start needs a title and a description before it offers anything.

## Writing instructions

`instructions` is appended to the Agent's system prompt, so it costs tokens on every turn.
Earn them.

**Not every node needs it.** Where the tool descriptions are self-sufficient, leave it out.
Include it when:

- the tools have a **sequence**, such as read, then edit, then retry
- which tool to reach for depends on **context**, such as a small edit against a full rewrite
- there are **anti-patterns** that waste calls or fail outright
- recovering from an error needs an order that no single description implies

**Five rules for writing it:**

1. **Do not repeat the tool descriptions.** Write the strategy between tools, not the tools.
2. **Be prescriptive.** "Always" and "never", not "consider".
3. **Give the reason for anything non-obvious.** "Never re-read after a stale error, because
   the error already carries the new hash" saves a wasted call.
4. **Show sequences.** The value is in the choreography, not the inventory.
5. **Keep it short.** Under a hundred lines, because it is in the prompt on every turn.

Agent skills are a different thing, authored in `skills/` at the root of your org repo and discovered at run time.
`instructions` is part of the MCP schema and travels with the tools.

## Who records a call

A tool records its own call. When a method runs, it writes one row on the run's trace, nested
under the node that called it, with what it was asked and what it answered. The caller
records nothing about the call, so a tool reads the same on the trace whoever called it: an
Agent on the canvas, a voice Agent, or an outside host such as ChatGPT. That holds for every
kind of tool: a node's methods, the functions a found row offers (`getDetail`, `readSkill`),
the platform's own tools (the screen, apps and tasks, memory). A node that runs as a step
records its own run the same way, and stops there.

## When it goes wrong

| What you see | Why |
|---|---|
| The Agent never calls your tool | The `description` does not read like the job the Agent is trying to do |
| The Agent has no tools at all | Nothing is wired to the `mcp` connector |
| Lint: this must be a `CallbackNode` | It declares a `toolExchange`, which is multi-turn |
| The loop runs and runs | Check `maxTurns`, then `stuckAfterRepeats` |
| A tool returns but the workflow does not react | Expected. A service call returns to its caller and fires no outputs |

## Next steps

<Card title="Connectors and signals" icon="git-branch" href="/nodes/signal-routing" horizontal>
Wiring nodes together, and putting values on an output.
</Card>

<Card title="api/service.yaml" icon="book-marked" href="/reference/node-api" horizontal>
Every field `toolExchange` takes, generated from the schema.
</Card>
