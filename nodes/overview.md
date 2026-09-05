---
sidebarTitle: "Overview"
title: "Nodes"
---

A node is a service you drag onto the **canvas**. It connects an Agent to another system.

There is a marketplace of nodes. When none of them suits your situation, build your own.

<Tip>
**Check the marketplace first.** It ships with a library of ready-made nodes. They cover AI, Voice, Go To Market, Search, Web Scraping, Media & Design, Documents, Knowledge & Vectors, Storage & Data, Communication, Flow and Output. Adding one takes a click, and most of what an Agent needs is already there.
</Tip>

A node you build is a folder of YAML files. You describe the API call, and the platform
makes it.

Never built one? [Create your first node](/onboarding/create-your-first-node) walks a real
one from an empty folder to a run. Then [Anatomy of a node](/nodes/manifest-nodes) is the
place to start.

## The shape of a node

<Tree>
  <Tree.Folder name={<><b>nodes/&lt;package&gt;</b> <span className="tree-note">in your studio project workspace</span></>} defaultOpen>
    <Tree.File name={<><b>package.yaml</b> <span className="tree-note">what the package is and may call</span></>} />
    <Tree.Folder name={<><b>credentials</b> <span className="tree-note">the credentials its nodes ask for</span></>} />
    <Tree.Folder name={<><b>shared</b> <span className="tree-note">fragments more than one node reuses</span></>} />
    <Tree.Folder name="nodes" defaultOpen>
      <Tree.Folder name="YourNode" defaultOpen>
        <Tree.File name={<><b>node.yaml</b> <span className="tree-note">what it is</span></>} />
        <Tree.File name={<><b>interface.yaml</b> <span className="tree-note">what it connects to</span></>} />
        <Tree.File name={<><b>config.yaml</b> <span className="tree-note">the settings form</span></>} />
        <Tree.Folder name="api" defaultOpen>
          <Tree.File name={<><b>run.yaml</b> <span className="tree-note">the calls it makes</span></>} />
          <Tree.File name={<><b>events.yaml</b> <span className="tree-note">everything that leaves it</span></>} />
          <Tree.File name={<><b>service.yaml</b> <span className="tree-note">methods other nodes call</span></>} />
        </Tree.Folder>
        <Tree.File name={<><b>test.yaml</b> <span className="tree-note">sample data to run it with</span></>} />
      </Tree.Folder>
    </Tree.Folder>
  </Tree.Folder>
</Tree>

One folder is one node. The package around it holds anything its nodes share.

| File | What it does |
|---|---|
| `package.yaml` | Names the package and lists the hosts its nodes may call. A call to anywhere else is refused |
| `credentials/` | The credentials its nodes ask for. The shape of each one, never a value |
| `shared/` | Fragments more than one node reuses, such as a base URL or a list of models |
| `node.yaml` | What the node is: its name, colour, and the words that decide when an Agent picks it |
| `interface.yaml` | What it connects to: its inputs and outputs, the dots on the node a line attaches to, and the credentials it needs |
| `config.yaml` | The settings form someone fills in on the **canvas** |
| `api/` | What the node calls, what comes out, and what it offers to other nodes |
| `test.yaml` | Sample settings and inputs, so you can run the node for real before wiring it up. The docs call this a fixture |

A node that calls a service needs four of these: `node.yaml`, `api/run.yaml`,
`api/events.yaml` and `test.yaml`. Lint refuses a node with calls but no events table, and
a node with no sample data, because neither can be run. Everything except `api/` can be
written inside `node.yaml` instead of its own file, so a small node can be two files.

### Inside `api/`

One file per job, and a node uses the ones it needs.

| File | What it does |
|---|---|
| `run.yaml` | The calls the node makes when the workflow triggers it |
| `events.yaml` | Everything that leaves the node, one row per output connector |
| `service.yaml` | Methods this node offers to other nodes over a service edge |
| `toolExchange.yaml` | The protocol for a node that lets a model call tools over several turns |
| `narrate.yaml` | A second, cheaper model writing a status line while the main call runs |

A node the workflow triggers has `run.yaml` and `events.yaml`. A node that exists to be
called by other nodes has `service.yaml` instead, and no outputs at all. Some have both. A
voice node adds `audio.yaml`, and the [reference](/reference/node-api) lists every file.

[Anatomy of a node](/nodes/manifest-nodes) walks through each of them with a real example.

## Which files your node needs

| Your node | Files |
|---|---|
| Calls one API and answers | `node.yaml`, `interface.yaml`, `config.yaml`, `api/run.yaml`, `api/events.yaml`, `test.yaml` |
| Streams its reply | The same, with `transport: sse` on the last call and `match` on its events rows |
| Is called by other nodes, not by the workflow | `node.yaml`, `interface.yaml`, `api/service.yaml`, `test.yaml`. No outputs, no `events.yaml` |
| Hands tools to an Agent | The service shape above, with an `mcp` connector in `interface.yaml` |
| Needs a key | Any of the above, plus one file in the package's `credentials/` |

Every node's package carries `package.yaml` with the hosts its nodes may call.

## How you build one

1. Create the folder under a package's `nodes/`
2. Describe the node: `node.yaml`, `interface.yaml`, `config.yaml`
3. Describe the calls in `api/run.yaml`, and what comes out in `api/events.yaml`
4. Add the host to the package's `allowedHosts`
5. Run it against the real service, on the **Nodes** screen in **studio**
6. Check it before you deploy:

   ```bash
   unoverse lint
   ```

`unoverse deploy studio` runs the same check first, then ships every node in the workspace
alongside your components and skills.

## Nodes to learn from

Every published node is public. Find the one closest to what you are building and mirror it.

**[marketplace/definitions/nodes](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes)**

| Read it for | Node |
|---|---|
| The simplest case: one call, one answer | [SearchWeb](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/search/SearchWeb) |
| Walking pages and accumulating the results | [AirtableFetch](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/airtable/AirtableFetch) |
| Writing a collection in batches the API accepts | [AirtableInsert](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/airtable/AirtableInsert) |
| A cheap existence check before an insert | [AirtableExists](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/airtable/AirtableExists) |
| Caching an answer between runs | [ApolloCompany](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/gtm/ApolloCompany) |
| Two calls, where the second uses the first | [HunterEnrich](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/gtm/HunterEnrich) |
| Starting a job and waiting for it to finish | [HyperbrowserCrawl](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/hyperbrowser/HyperbrowserCrawl) |
| Tokens streaming in as they are produced | [OpenAIStream](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/openai/OpenAIStream) |
| A request whose shape changes with the settings | [OpenAIStructuredOutput](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/openai/OpenAIStructuredOutput) |
| A node other nodes call, rather than a workflow step | [OpenAIEmbeddingService](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/openai/OpenAIEmbeddingService) |
| Offering tools to an Agent | [HubspotMCP](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/hubspot/HubspotMCP) |
| A tool loop, and a second model narrating progress | [OpenAIAgent](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/openai/OpenAIAgent) |

Whole packages worth reading: [airtable](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/airtable), [apify](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/apify),
[aws-dynamodb](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/aws-dynamodb), [aws-s3](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/aws-s3), [gtm](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/gtm),
[hubspot](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/hubspot), [hyperbrowser](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/hyperbrowser), [openai](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/openai),
[salesforce](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/salesforce), [search](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/search), [slack](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/slack) and
[x-search](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes/x-search).

## Next steps

<Card title="Anatomy of a node" icon="boxes" href="/nodes/manifest-nodes" horizontal>
The folder, the files in it, and how a call is described.
</Card>

<Card title="Reference" icon="book-marked" href="/reference/node-envelope" horizontal>
Every field a node declares, generated from the schemas.
</Card>
