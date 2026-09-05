# Playbook: custom workflow nodes

**Read first, in order:**

1. [Anatomy of a node](https://docs.unoverse.ai/nodes/manifest-nodes.md): the folder, every
   file, a real example.
2. [Node discoverability](https://docs.unoverse.ai/nodes/node-discoverability.md): before
   writing `whenToUse`.
3. As needed: [Node types](https://docs.unoverse.ai/nodes/node-types.md),
   [Credentials](https://docs.unoverse.ai/nodes/credentials.md),
   [Who can run it](https://docs.unoverse.ai/nodes/who-can-run-it.md),
   [Config schema](https://docs.unoverse.ai/nodes/config-schema.md),
   [Handlebars and expressions](https://docs.unoverse.ai/nodes/expressions.md),
   [Beyond one request](https://docs.unoverse.ai/nodes/calls-that-loop.md),
   [Service connectors](https://docs.unoverse.ai/nodes/service-connectors.md),
   [MCP services](https://docs.unoverse.ai/nodes/mcp-services.md),
   [Connectors and signals](https://docs.unoverse.ai/nodes/signal-routing.md),
   [Testing](https://docs.unoverse.ai/nodes/testing-nodes.md).
   Fields: the [node reference](https://docs.unoverse.ai/reference/node-envelope.md).

**Exemplar:** every published node at
[marketplace/definitions/nodes](https://github.com/unoverse-platform/marketplace/tree/main/definitions/nodes).
The Anatomy page's table says which one to read for which shape. Add to an existing
package in the workspace where one fits; create a package only for a new integration.

## A node is YAML

No TypeScript, no `package.json`, no build. If the format cannot express what is needed,
the platform is missing a capability: say so and stop, never reach for code.

## The rules that bite

1. **Decide `kind` first.** One call, one reply is `PromiseNode`. Streaming or a tool loop
   is `CallbackNode`. Lint checks the declaration against the last call's transport.
2. **`whenToUse` decides whether the node is ever offered.** Outcome first, disqualify by
   property, never name another node, any wiring fact last.
3. **`auth` is compulsory** on every node. `required: false` is right for almost every one
   and does not mean public. Never declare `authRequired` or `authRole` in the config: the
   platform injects them.
4. **`api/run.yaml` is a list**, each call named. Add `error` wherever the service answers
   200 with a failure in the body. Where one call is really many, name the capability on
   it: `paginate`, `chunk`, `poll`, `state`.
5. **`api/events.yaml` has one row per output**, in the order `interface.yaml` declares
   them. A streaming row needs `match`, and usually `accumulate: true`.
6. **Every host in `allowedHosts`**, https only. **Never a credential value in a file.**
7. **Never hard-code instruction text.** `{{prompt.<blockName>}}` tracks the block.
8. **`cacheable: true` only for a pure read. `emitsExternally: true` for anything that
   cannot be undone.**

## Workflow

1. Read the closest published node and the Anatomy page.
2. `node.yaml`, then `interface.yaml`, `config.yaml`, `api/run.yaml`, `api/events.yaml`.
3. Add the host to the package, and the credential file if the service needs a key.
4. `test.yaml`: a real request, asserting the shape and never exact words.
5. `unoverse lint`, zero errors.
6. Run it on the **Nodes** screen in **studio**: Load sample, then Run, against the real
   service. Keys come from the workspace `.env`, named from the credential and field in
   upper snake case with the trailing `Credential` dropped: `openAICredential.apiKey`
   is `OPENAI_API_KEY`. A node that lints but has never run is not done.
7. `unoverse deploy studio`.

## Things that go wrong

[Troubleshooting](https://docs.unoverse.ai/nodes/troubleshooting.md) has the table: a
value that resolved to empty, a number that arrived as a string, an output that stays
empty, a request refused before it left, an expression the sandbox rejected.
