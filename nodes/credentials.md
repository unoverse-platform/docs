---
sidebarTitle: "Credentials"
title: "Credentials"
---

Give your node the key a service wants, without the value ever touching your files. Most
services want one before they answer, so most nodes need this.

**The value never goes in your files.** Not in a config default, not in a `.example`, not
commented out. Your node names the credential it needs, and that name is all your YAML ever
holds.

Someone enters the real value once in **canvas**. The platform stores it encrypted, and
hands it to your node at the moment it runs, and only to your node.

A node holding no secret is safe to commit and safe to hand to someone else. It is also
what makes it publishable: the same node runs in someone else's universe, against their
account, with nothing of yours in it.

A node that calls a public API declares no credential at all, and skips all of this.

## A credential is not a permission

These two get confused constantly, because both look like "auth" and both show up on the
same node in a workflow. They answer opposite questions.

Picture a refund step on a canvas.

| | **Credential** | **Run authorization** |
| --- | --- | --- |
| Answers | How does the node prove itself to the payments API? | May this caller set off a refund? |
| About | Your node and the service it calls | The person, and this box in this workflow |
| Direction | Outbound | Inbound |
| You write | `credentials:` in `interface.yaml` | `auth:` in `node.yaml` |
| Someone else supplies | The key, once, in **canvas** | The sign-in and role settings, per box |
| Getting it wrong looks like | A 401 from the service | Anyone who reaches the node can issue refunds |

**The key is always there.** Once an admin has entered it, every run of that node can spend
it, whoever set the run off. The credential never asks who is calling.

That is precisely why the second question exists. Nothing about holding the key limits who
may pull the trigger, so a node that does something serious has to say so separately.
[Who can run it](/nodes/who-can-run-it) is that half.

## Three steps

### 1. Describe the credential

One file per credential type, in the package's `credentials/` folder. It describes the
shape, never a value.

```yaml credentials/exampleCredential.yaml
name: exampleCredential
displayName: Example
description: Credentials for the Example API
documentationUrl: https://example.com/docs/api-keys

properties:
  - name: apiKey
    displayName: API Key
    type: string
    required: true
    secret: true
    description: Your Example API key
    placeholder: sk-...

  - name: baseUrl
    displayName: Base URL
    type: string
    required: false
    secret: false
    description: Custom API endpoint
    default: https://api.example.com
```

**`properties` becomes the form** someone fills in. `displayName`, `description` and
`placeholder` are what they read while doing it, so write them for a person who has your
service open in another tab. `documentationUrl` is the link to where the key comes from.

**`secret: true` is the field's whole security posture.** Mark anything that grants access.
A base URL is not secret. A key is.

### 2. Ask for it

The node names what it needs in `interface.yaml`.

```yaml interface.yaml
credentials:
  - name: exampleCredential
    required: true
    displayName: Example API
```

**canvas** reads this and asks for the credential on the node's settings. A node with
`required: true` and no credential selected tells you before it runs.

### 3. Use it

Reference the value in the call, by name.

```yaml api/run.yaml
- name: fetch
  method: GET
  url: https://api.example.com/things
  transport: json
  credential:
    scheme: bearer
    token: "{{ credentials.exampleCredential.apiKey }}"
```

The path is `credentials.<name>.<field>`: the name from `interface.yaml`, then the property
from the credential file.

## Auth schemes

`scheme` names how the credential reaches the service. Each one is implemented by the
platform, so you pick one rather than assembling headers yourself.

| Scheme | What it sends |
|---|---|
| `bearer` | `Authorization: Bearer <token>` |
| `basic` | `Authorization: Basic <base64 of username:password>` |
| `apiKeyHeader` | your key in a header you name |
| `apiKeyQuery` | your key as a query parameter you name |
| `oauth2ClientCredentials` | exchanges the client id and secret for a token, and refreshes it before it expires |
| `awsSigV4` | signs the request with AWS Signature Version 4 |
| `none` | no auth, for a public API |

`awsSigV4` is what turns every AWS service into a node. The signature hashes the exact
bytes being sent, so it is computation rather than description, and the platform does it.

A key that belongs in a header of its own:

```yaml
credential:
  scheme: apiKeyHeader
  header: X-API-Key
  token: "{{ credentials.exampleCredential.apiKey }}"
```

## Testing with your own key

Running a node on the **Nodes** screen in **studio** calls the real service, so it needs a
real key. **studio** reads yours from your own `.env`, and stores nothing.

The variable is the credential name and the field, in upper snake case, with any trailing
`Credential` dropped:

| Credential and field | Variable |
|---|---|
| `openAICredential.apiKey` | `OPENAI_API_KEY` |
| `exampleCredential.apiKey` | `EXAMPLE_API_KEY` |
| `exampleCredential.baseUrl` | `EXAMPLE_BASE_URL` |

A missing one is named before anything runs, rather than surfacing as a 401 from the
service.

## Your node sees only its own credential

A node receives the credentials it declared in `interface.yaml`, and nothing else. A workflow
holding an OpenAI node and a HubSpot node keeps the two apart: neither can read the other's
key, whatever it writes.

So `{{ credentials.hubspotCredential.apiKey }}` inside a node that declared only
`exampleCredential` resolves to nothing. That is not a bug to work around. Declare what you
need, and reference what you declared.

Naming the credential also rules out a subtler mistake. A node that went looking for "the
first thing with an `apiKey`" would find whichever credential came first, since
`openAICredential`, `apolloCredential` and `hunterCredential` all have one. It would work
alone and authenticate against the wrong service the moment a second credential joined the
workflow. `{{ credentials.<name>.<field>}}` names the credential, so the wrong one is never
reachable by accident either.

## When it goes wrong

| What you see | Why | Fix |
|---|---|---|
| Lint: needs credential `x` but no `credentials/x.yaml` exists | The node asks for a credential its package never described | Add the credential file, or correct the name in `interface.yaml` |
| Lint: credential is declared elsewhere with different fields | Two packages describe the same credential differently. They share one entry at run time, so they have to agree | Make the `properties` match, or give yours its own name |
| **studio** names a missing variable | No key in your `.env` | Add it in the form above |
| 401 from the service | The key is wrong, or the scheme is | Check the value in **canvas**, then check `scheme` against the service's own docs |
| points at credential id N, which does not exist in this universe | The workflow was copied from another universe, and a credential reference is a per-universe id, so it came over pointing at nothing | Open the node's settings in **canvas**, re-select the credential, save the workflow |
| needs a `<credential>` and none is attached | A pasted or newly placed node starts with no credential selected, and this node requires one | Open the node's settings in **canvas**, select the credential, save the workflow |

## Next steps

<Card title="Who can run it" icon="shield-check" href="/nodes/who-can-run-it" horizontal>
Requiring sign-in or a role before your node runs.
</Card>

<Card title="Credential files" icon="book-marked" href="/reference/node-credentials" horizontal>
Every field a credential declares, generated from the schema.
</Card>
