---
sidebarTitle: "Security Posture"
title: "Security Posture"
mode: "wide"
---

This page is written for the review, not for the brochure. Every control below is one you
can find in the code or in the Terraform. The last section lists what is still open, including
two gaps you should compensate for before going live.

## Who owns what

| | Owned by |
| --- | --- |
| The cloud account, the VM, the data stores | You |
| The identity provider and its user directory | You |
| The data, and every credential in it | You |
| The platform images | Us |
| The Terraform that creates the ground | Shipped to you, run by you, in your version control |

There is no hosted control plane in the middle. A universe does not call home, and nothing
about running it depends on our availability.

## Authentication

**Authentication is always on.** There is no deployment mode that turns it off, because
**canvas** and **studio** sign in against it.

The gate is default-deny and lives in the application, at the single public listener. Tokens
are verified against your provider's published keys, checking both issuer and audience. A
request that does not present a valid one is refused before anything executes.

Because the check is in the application, no proxy is ever load bearing for security. A
misconfigured load balancer is an availability problem, not an authentication bypass.

Letting anonymous visitors reach a workflow is possible, and the decision is made per
trigger. Those callers arrive with a synthetic guest identity that carries no roles, so they
fail every role requirement naturally.

<Frame caption="Public entry is a toggle on the trigger, off by default. A guest's runs spend your AI and API budget, so the toggle names that before you turn it on.">
  <img src="/images/architecture/auth-access.png" alt="A trigger's configuration panel in canvas, showing the Public Entry toggle" />
</Frame>

## Authorization

**Two levels.** A person holds **roles**. A role grants **permissions**. The platform gates
on permissions.

| | | |
| --- | --- | --- |
| **Role** | who somebody is | `admin`, `author` |
| **Permission** | what they may do, always `noun:verb` | `workflow:author`, `credentials:manage` |

An author builds. They open **canvas**, create and delete workflows, write to **spatial**,
manage nodes, and publish assets into the universe. An admin does all of that and holds the
secrets as well: the credential store, and other people's memory.

The difference between the two roles is exactly that. An author can build anything on the
platform and cannot read an API key. Grant the role in your identity provider and the
platform follows it.

An end user holds neither role. They sign in, chat, and run workflows. Nothing else opens
to them.

**Every route declares what it needs, in one table.** The table names each route beside its
requirement. One function reads it before any handler runs. A route missing from the table is
refused, and the build fails until somebody adds it. Access cannot be left undecided by
accident.

**How each ground provides it.** With `byo-oidc` the provider already models both levels. An
Auth0 tenant has roles containing permissions, and Terraform touches none of it. Cognito has
one level, groups, so the AWS ground holds the role-to-permission map. A pre-token Lambda
applies it, so your Cognito **groups are the roles** and the Lambda expands them into the
permissions claim.

Flattening the two is a real failure mode. A pool built from permission-shaped groups gives
an administrator every permission and no role. **canvas** checks the role before it renders,
so the person is refused by the surface they own.

**Identity comes from the token, never from the request.** A client sends a user id with
every chat message, for routing replies. The server takes the subject from the verified token
instead. A caller cannot run as somebody else, write into their memory, or subscribe to their
conversation.

**Every node states who may run it, and the block is compulsory.** A reviewer can tell a node
that was considered and left open from a node nobody thought about.

A node can demand a signed-in caller, or a specific claim. The person building the workflow
can demand more on top. Neither can loosen the other. A node that reaches the executor with
nothing declared is treated as requiring authentication.

<Frame caption="Per step, on the canvas. The claim is yours to name: the platform never invents finance:approve, and your identity provider decides who carries it.">
  <img src="/images/architecture/auth-RBAC.png" alt="A node's Require sign-in toggle and Require role field in canvas" />
</Frame>

[Who Can Run It](/nodes/who-can-run-it) is the developer-facing version of this.

## Credentials

**A secret is write-only.** You type it once. Nothing reads it back, including the screen
you typed it into. Editing a credential shows dots and leaves the stored value untouched
unless you type a new one.

Credential values are encrypted at rest, per field. Every field is encrypted unless it is
declared public, so a new credential type cannot leak a key by omission. A region or an
account id can be declared public; a key cannot.

Values are decrypted at the moment a node runs, and handed to that node alone. A node
receives only the credentials it declared. Two nodes in one workflow cannot read each other's
keys, whatever either of them writes, because credentials are addressed by name rather than
discovered.

The store is admin-only. Reading and writing it needs `credentials:manage`, which the author
role does not grant.

Nothing an author writes ever contains a value. The manifest names the credential. The value
is entered once in **canvas** and lives only in the database.

## What a node is allowed to do

A node is YAML interpreted by the platform, not code the platform runs on its behalf. Two
controls bound it.

**Declared hosts.** Every host a node may call is declared in its package. The list is
deny-by-default and HTTPS-only, and it is checked twice: when the package is linted, and
again at run time after the URL has been built. A node cannot construct its way to an
undeclared destination.

**A content hash.** A node's composed definition, including its host list, is hashed. The
hash is checked when the definition is loaded, so a definition that changed after it was
accepted does not quietly run.

Publishing a node reaches a universe as pending rather than live. Whoever runs that universe
sees the hosts it wants to call, the credentials it needs and the access it demands, and
accepts it before it can run. After that first acceptance, iteration is not gated. A node
that reaches for something new pauses again.

## Network posture

Only 443 is open to the internet. SSH, **canvas** and the log viewer are restricted to an
address you nominate, and the builder surface binds to loopback so it is not routable at
all.

Firewall rules live in the cloud provider rather than on the VM, which removes the class of
problem where a container runtime writes its own rules underneath a host firewall.

Outbound, a universe needs the container registry, the npm registry, your identity provider
and your AI providers. Each provider's Terraform states them, and
[Networking](/architecture/networking) explains what breaks if one is blocked.

## Secrets and rotation

Every deployment generates its own secrets. Database and Redis passwords are random per
universe, and so is the credential encryption key. None of them is shared between
deployments and none of them is known to us.

Secrets are entered per environment. They are never copied from one environment to another,
which is covered in [Environments](/architecture/environments).

## Auditability

Agent activity is recorded, including the content that produced each decision, so behaviour
can be reconstructed after the fact rather than inferred.

Small deployments ship with a log viewer, restricted to your operator address. Larger ones
turn it off and point the container logging driver at whatever you already run, whether that
is Splunk, ELK or Datadog.

## Still open

Three items are honest gaps rather than controls. All three are known and tracked.

**There is no rate limit and no spend cap.** Any signed-in caller can run workflows, and
workflows spend money with your AI providers. Nothing in the platform slows a caller down or
stops them. Set spend limits at the provider until this lands, because a provider limit holds
even if the platform does not.

**Decrypted credentials are cached in Redis for twenty minutes.** A Redis backup taken in
that window contains plaintext keys. Treat those backups as secrets.

**One connection carries its token in the query string.** That is why load balancer access
logs are switched off in the entry point requirements. Moving the token to a header lifts both
the gap and the restriction.

The credential encryption key no longer has a fallback default. A universe refuses to start
without a real key, so a deployment cannot silently run on a published one.

---

**Next**: [Environments and Promotion](/architecture/environments)
