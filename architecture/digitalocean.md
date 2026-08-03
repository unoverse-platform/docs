---
sidebarTitle: "DigitalOcean"
title: "unoverse on DigitalOcean"
mode: "wide"
---

The first ground built end to end, and the one to copy. It is the smallest amount of
infrastructure that still satisfies an enterprise review.

<div className="figure-wide">
<Frame caption="Everything Terraform creates in your DigitalOcean project. Click to enlarge.">
  <img src="/images/architecture-digitalocean.svg" alt="Everything Terraform creates in your DigitalOcean project. Click to enlarge." />
</Frame>
</div>

<div className="fig-notes">
<div>
<p className="fig-title">Exposure</p>
<ul>
<li><span className="zone" style={{ background: "#d97706" }} /><span>Reached from the internet</span></li>
<li><span className="zone" style={{ background: "#7c3aed" }} /><span>Operator address only</span></li>
<li><span className="zone" style={{ background: "#0f766e" }} /><span>Published on the droplet, blocked by the firewall</span></li>
</ul>
</div>
<div>
<p className="fig-title">The paths</p>
<ul>
<li><span className="num">1</span><span>A client reaches the load balancer at api.&lt;domain&gt; on 443. It terminates TLS with a managed certificate and forwards to the engine on 4105, which the firewall opens to that load balancer alone.</span></li>
<li><span className="num">2</span><span>An operator reaches Canvas at canvas.&lt;domain&gt; over HTTPS, on its own load balancer sharing the same certificate. SSH on 22, the log viewer on 8080 and Canvas direct on 3001 stay open to your address, and are the only route when canvas_public is off.</span></li>
<li><span className="num">3</span><span>The droplet reaches Postgres through its transaction pool and Redis over TLS. Each database firewall admits the droplet and nothing else.</span></li>
<li><span className="num">4</span><span>Tokens are verified against the OIDC issuer you bring. DigitalOcean universes have no identity provider of their own.</span></li>
<li><span className="num">5</span><span>Nodes call out on 443, only to hosts their own package declares.</span></li>
</ul>
</div>
</div>

<Note>
**Why Canvas has its own load balancer.** DigitalOcean load balancers route on port, never on the `Host` header, so one of them cannot serve two hostnames. Canvas therefore gets a second load balancer of its own: `https://canvas.<domain>` on 443, forwarding to 3001, sharing the api certificate (the hostname is a SAN on it) and carrying its own A record. About $12/month. The alternative was one load balancer with the port left in the URL, and a port in a hostname is not an address anyone ships: it breaks the expectation that `https` means 443, and it puts an implementation detail of the ingress in the address bar. On [AWS](/architecture/aws) one Application Load Balancer host-routes, so the same two hostnames come from a single door.
</Note>

## What Terraform creates

| | |
| --- | --- |
| Compute | A droplet, wrapped in a cloud firewall |
| Entry point | A load balancer with a managed Let's Encrypt certificate, a second one for Canvas when `canvas_public` is on, and optionally the DNS records |
| Data | Managed Postgres with its transaction pool, managed Redis, and a database firewall for each. **Redis is always this ground's own**: it is the shared-state backbone, so there is no bring-your-own path. **Postgres has three**: create a new cluster, adopt an existing one in your account, or point at any URL |
| Secrets | A generated credential encryption key |

Identity is not on that list. DigitalOcean universes bring their own OIDC issuer, which today
means an existing Auth0 tenant.

## Building it

Two commands, and the CLI carries the rest. It never leaves you holding a file to edit
or a value to copy between two of its own places.

```bash
npm install -g unoverse

mkdir my-universe && cd my-universe
unoverse create        # choose Universe, paste your registry credential
unoverse deploy        # choose DigitalOcean
```

`unoverse create` scaffolds into the folder you are standing in, which has to be empty,
and it finishes the job rather than handing you a setup step: it writes your `.env`, pulls
the platform images and sets up the database. You have a working local universe before any
of this reaches a cloud.

<Note>
**What the CLI installs, and the one thing it does not.** It offers to install `doctl`
(through brew, on your yes) and installs Terraform itself when it is missing, as the
official binary. **Ansible it expects to find**: `pip install ansible` if `unoverse deploy`
says so. That check lands late in the first run, so install it before you start.
</Note>

`unoverse deploy` is the whole journey, and it is the same command every time after:

1. **Asks which cloud**, once. Arrow keys.
2. **Connects your DigitalOcean account.** It takes an API token and hands it to `doctl`
   for you. The token needs **Full Access**: this is the credential that creates servers,
   databases and networking, and Read Only cannot. It stays on your machine and is never
   shared with anyone running your universe.
3. **Fills the ground in.** Your IP and SSH key are discovered; the registry credential,
   OpenAI key, issuer and client id come from the `.env` written during `unoverse create`.
   If your account already has a PostgreSQL cluster, it asks whether to reuse it. The
   difference is lifecycle: a reused cluster is read, not owned, so this universe gets
   its own database, user and pool inside it and tearing the universe down leaves the
   cluster running. A created cluster belongs to the stack and is destroyed with it.
4. **Shows the plan in plain English**, with a monthly estimate, and takes one answer.
   It also prints the current `size`. That is not a one-way door: `small` is the POC box,
   and moving to `medium` or `large` later is an edit and another `unoverse deploy`.
   `d` prints the full Terraform plan if you want to audit it. Anything being destroyed
   or replaced is shown in red under its own heading.
5. **Builds, then ships.** Terraform applies the plan you approved, the environment is
   rendered from the ground's outputs, and Ansible installs and starts the platform on
   the new droplet, migrations included.

```
  Creating
    ● Server               4 vCPU, 16 GB · lon1              ~$96/mo
    ● PostgreSQL database  1 vCPU, 1 GB · v16                ~$15/mo
    ● Redis cache          1 vCPU, 1 GB · v7                 ~$15/mo
    ● Load balancer        the public way in                 ~$12/mo
    ● Load balancer        Canvas                            ~$12/mo
    ● Firewall             admin ports limited to your IP
    plus 6 supporting resources (users, rules, keys)

  Roughly $150/month at your provider's current prices

  Go ahead? [y/N] (d for the full technical plan)
```

**Afterwards, one command keeps everything true.** `unoverse deploy` run again compares
the ground with reality: change a size or a variable, and the next deploy plans it, shows
it and applies it before shipping the platform. Nothing rots because you forgot a step.

| | |
| --- | --- |
| `unoverse where` | Your live URLs, each one actually requested rather than recited |
| `unoverse check` | Services, database schema and environment |
| `unoverse logs` | What the platform is doing |
| `unoverse update` | The CLI and the platform images |

<Note>
**A deployed universe always has a login.** Local development can run without one, but
`unoverse deploy` asks for your issuer and client id if the local setup skipped them, and
the platform refuses to start with authentication off in production. The `canvas_url`
output has to be added to your identity provider's allowed origins.
</Note>

## What the POC costs to run

Estimates at list prices, mid-2026. Round numbers, for budgeting rather than billing.

| | Monthly, about |
| --- | --- |
| Droplet `s-4vcpu-16gb-amd`, 4 vCPU / 16 GB | $96 |
| Managed Postgres `db-s-1vcpu-1gb` | $15 |
| Managed Redis `db-s-1vcpu-1gb` | $15 |
| Load balancer, small | $12 |
| Second load balancer, for Canvas (`canvas_public` with a domain) | $12 |
| **Total** | **about $150 a month** |

**The ground prices itself.** These numbers live in `infra/digitalocean/prices.tf`, keyed by
the exact size slugs this ground uses, and everything else reads them from there:
`unoverse deploy` quotes them in its plan summary, and this table quotes the same output.
Change a size and both move together, because there is only one copy.

```bash
terraform -chdir=infra/digitalocean output monthly_estimate   # what yours costs, as configured
terraform -chdir=infra/digitalocean output prices             # the whole table
```

An adopted or bring-your-own Postgres is not in the estimate: that cluster is somebody
else's line item, and pricing it here would invent a charge this stack does not create.

`canvas_public` adds a load balancer, and that is the whole of its cost: with a domain set,
Canvas gets its own so its URL needs no port. Without a domain it takes a second port on the
main one and adds nothing. Bandwidth is included at POC traffic levels, and the certificates
are free. **Model usage is not in this
number**: OpenAI and the other providers bill per call, so the AI cost follows what your
Agents actually do rather than the infrastructure.

### Tokens, and how many users a POC can take

The table above is the infrastructure alone. Tokens are the other bill, and they scale with
people rather than with servers: every Agent turn spends model tokens, so this line follows
how many users you let in and how hard they work the Agents.

Arithmetic you can redo with your own numbers: a pilot user who runs twenty Agent turns a
day, at a few thousand tokens a turn, spends one to two million tokens a month. Fifty pilot
users is then fifty to a hundred million tokens a month, which at mid-2026 prices is tens to
a few hundred dollars. Model choice moves that by an order of magnitude; user count only
multiplies it.

As for the box itself: plan on **a few hundred signed-in users and tens of simultaneous
Agent runs**. That is a pilot, not production. And in practice the first ceiling is not the
machine but your AI provider's rate limits, tokens per minute on your OpenAI account, which caps simultaneous Agent work long before the CPU does.
[Deployment Options](/architecture/deployment-options) has the sizes above this one.

## The firewall rules, in full

| Port | Source |
| --- | --- |
| 4105 | The load balancer, and only the load balancer |
| 3001 | Your address. Plus the Canvas load balancer, when `canvas_public` is on |
| 22 | Your address |
| 8080 | Your address |

**Canvas has two possible doors, and one of them is optional.** By default it is reached
direct on 3001 from your address, in the same trust ring as SSH and the log viewer. That is
the contract default and the posture an enterprise deployment should keep.

Turning on `canvas_public` creates a second load balancer for Canvas alone:
`https://canvas.<domain>` on 443, terminating TLS with the same certificate (the hostname is
a SAN on it) and forwarding to 3001. The firewall then admits that load balancer on 3001 as
well. It does not open 3001 to the internet: direct access to the droplet stays restricted
to your address either way, so the public route exists only through the load balancer.

Without a domain there is no hostname to route by, so Canvas keeps a second port on the main
load balancer instead, at `http://<lb-ip>:3001`, and no second load balancer is created.

**The shipped `terraform.tfvars.example` turns it on**, because this ground's first job is
the POC box and a POC usually wants Canvas reachable in a browser. The variable itself
defaults to `false`. So an operator following the example gets the second rule, and anyone
applying the module without it does not. The `canvas_url` output prints the exact URL, and
it has to be added to your identity provider's allowed origins.

## Two facts found while building it

**The idle timeout caps at 600 seconds.** The platform holds long-lived connections, and
DigitalOcean will not hold one quiet for longer than ten minutes. The Terraform sets the
maximum, and a client that goes quiet must reconnect cleanly. That belongs in your acceptance
test rather than in a footnote.

**Postgres is always pooled.** The smallest managed database allows around nineteen usable
connections, and the platform's pools would ask for roughly thirty-two if each were tuned
alone. The managed transaction pooler turns those nineteen into hundreds of client
connections. [Data and State](/architecture/data) has the budget and the two rules that come with
pooling.

## Bringing your own Postgres

Two ways, both first-class. Give Terraform the name of an existing managed cluster and it
adds this universe's database, user and pool to it: the cluster is read as a data source,
never owned, so `terraform destroy` takes this universe's database with it and leaves the
cluster running. Or give it a URL and it uses that verbatim.

**A universe never takes ownership of a database it did not create**, and the firewall is
where that rule earns its keep. `digitalocean_database_firewall` is *authoritative*: it
replaces a cluster's entire trusted-sources list rather than adding to it. Applied to an
adopted cluster it therefore deletes every rule the account already had: your own IP,
your other droplets, your App Platform apps. It locks you out of a database this universe
merely borrows. That happened once, on 2026-08-01, to the cluster running other
production work.

So Terraform manages the database firewall **only for a cluster it created**. For an
adopted one, `unoverse deploy` appends this universe's droplet to the existing rules
through the API and leaves everything else untouched, which is additive and safe to
repeat. The same rule holds for anything borrowed: read it, add to it, never replace it. [Data and State](/architecture/data) covers what you take on.

## Sizing

`size` is `small`, `medium` or `large`, and it moves the droplet, both databases, the backup
window and the connection budget together.

**Start on `small`.** It is the POC box, and growing is one edit: set `size = "medium"` in
`terraform.tfvars` and run `unoverse deploy` again. It plans the change, shows you what
resizes and what it will cost, and applies it. Managed databases resize in place, so the
data stays; the droplet resize needs a reboot, which the plan will show as such. Nothing
about the first choice is permanent, so there is no reason to over-provision on day one.

---

**Next**: [Azure](/architecture/azure)
