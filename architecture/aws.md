---
sidebarTitle: "AWS"
title: "unoverse on AWS"
mode: "wide"
---

Everything is created in your own account, by Terraform you keep in your own version
control. There is no hosted control plane and the universe does not call home.

<div className="figure-wide">
<Frame caption="Everything Terraform creates in your AWS account. Click to enlarge.">
 <img src="/images/architecture-aws.svg" alt="Everything Terraform creates in your AWS account. Click to enlarge." />
</Frame>
</div>

<div className="fig-notes">
<div>
<p className="fig-title">Exposure</p>
<ul>
<li><span className="zone" style={{ background: "#d97706" }} /><span>Reached from the internet</span></li>
<li><span className="zone" style={{ background: "#7c3aed" }} /><span>Operator address only</span></li>
<li><span className="zone" style={{ background: "#0f766e" }} /><span>Published on the VM, blocked by the security group</span></li>
</ul>
</div>
<div>
<p className="fig-title">The paths</p>
<ul>
<li><span className="num">1</span><span>A client speaks MCP over HTTPS. 443 is open on the load balancer because that is where TLS terminates; 80 exists only to redirect to it. The load balancer then forwards to the engine on 4105, and the instance itself is not reachable from the internet.</span></li>
<li><span className="num">2</span><span>An operator reaches Canvas through the same load balancer, at canvas.example.com, which the second host rule forwards to 3001. SSH on 22, the log viewer on 8080, and Canvas direct on 3001 stay open to your address as a fallback, and are the only route when canvas_public is off.</span></li>
<li><span className="num">3</span><span>The VM reaches Postgres on 5432 and Redis on 6379. Nothing else in the account can.</span></li>
<li><span className="num">4</span><span>Tokens are verified against Cognito. Bedrock is called with a scoped IAM user.</span></li>
<li><span className="num">5</span><span>Nodes call out on 443, only to hosts their own package declares.</span></li>
</ul>
</div>
</div>

<Note>
**This is the POC shape: one machine, one availability zone.** Larger deployments keep the same picture and change what sits behind the load balancer, which is where the multiple-instance work will land. [Deployment Options](/architecture/deployment-options) covers the sizes and what is deliberately not offered yet.
</Note>

## What Terraform creates

| | |
| --- | --- |
| Compute | An EC2 instance with an elastic IP, in two security groups |
| Data | RDS Postgres 16 and ElastiCache Redis 7, each with a generated password. **Always created, see below** |
| Identity | A Cognito user pool, an SPA client, a hosted domain, one group per role, and the first administrator |
| Claims | A pre-token Lambda, so email and roles reach the token |
| AI | An IAM user scoped to Bedrock |
| Secrets | A generated credential encryption key |

<Note>
**This ground always creates the database. You cannot bring your own.** There is no
`byo_postgres_url` and no way to adopt an RDS instance you already run: every AWS universe
provisions its own, and that is deliberate. [DigitalOcean](/architecture/digitalocean)
offers three modes because a managed cluster there is something operators already own and
pay for, and standing a second one beside it is waste. On AWS an instance is provisioned per
stack by convention, so the universe's database is its own, teardown removes everything it
built with nothing borrowed left behind, and moving existing data in is a copy: `pg_dump`
into the new instance, once, at the start. Decided 2026-08-02, and the one place the two
grounds deliberately differ.
</Note>

## The trust boundary is the security groups

Two groups, and the second one is the point. The data group admits the application group and
nothing else, so neither database is reachable from the internet. RDS is created with public
access switched off rather than merely firewalled away from it.

**The POC uses the account's default VPC on purpose.** There are no private subnets and no
NAT gateway to own, because the boundary is doing the work. A deployment that needs its own
VPC changes where the resources sit, not what protects them.

## Identity is included here

AWS is the one ground where the platform can own the identity provider, and that is why
`auth = cognito` exists.

Terraform creates the user pool, creates one group per role you listed, creates the first
administrator and puts them in every group. The roles exist because the apply ran. Cognito
emails that administrator a temporary password **and the address to use it at**, the
default invitation is credentials with no link, so the template names your Canvas URL. It is
sent when the account is created, once. Deploying again never re-sends it and never changes
a password.

Cognito refuses any redirect it has not been told about, so the universe's own address is
always in the client's allowed list, derived from the same expression that builds the email
link. Add a second front end and it goes in `oauth_callback_urls`; you never have to
remember the app's own.

The pre-token Lambda is doing real work. Cognito does not put email or group membership onto
an access token by default, and the platform needs both, so the Lambda adds them. It also
carries the role-to-permission map: Cognito has one level where the platform needs
[two](/architecture/security#authorization), so **your Cognito groups are the roles** and the
Lambda expands them into the permissions claim. `admin` and `developer` are always created;
anything in `roles` is a deployment's own and grants itself.

Every other ground reaches the same contract by configuring their own provider, an Auth0
tenant already has roles containing permissions, and Terraform touches none of it.

## What you need before the first apply

Three things, and two of them the CLI collects for you.

**An SSH key on the machine you deploy from.** Deploying is `ssh` from your laptop, so the
key that must work is the one your laptop holds. The ground reads `~/.ssh/id_ed25519.pub`
and Terraform uploads it as `<name>-operator`. Nothing has to pre-exist in the account, and
no private key is ever downloaded or stored. If you have no key at all,
`ssh-keygen -t ed25519` first: an EC2 key pair created in the console is one whose private
half you do not have, and the apply will succeed and then fail to reach the instance.

**An email for the first administrator.** `unoverse deploy aws` asks. That account is
created in Cognito with every role.

**A domain, if you want HTTPS.** Optional, and the honest consequence of skipping it is no
certificate: the load balancer serves plain HTTP on its own Amazon address, and a browser
marks it Not Secure. There is nothing to secure it with, because a certificate is proof you
own a name and `*.elb.amazonaws.com` is Amazon's. Adding one later is two lines and one
deploy, and nothing is destroyed.

<Note>
**The domain has to be in Route 53** for this to be two lines. AWS proves you own it by
writing a DNS record, which it can only do in a zone it controls. A domain hosted elsewhere
still works, the module prints the validation records for you to create once, but that is
a manual step and a wait, rather than a variable.
</Note>

## Deploying into an account that withholds IAM

Some accounts are owned by the customer and governed by a permission set. AWS's
`PowerUserAccess` policy is the common shape, and it excludes IAM by design. Two resources
in this ground need IAM write. Both have an answer, and neither costs you a feature.

**The Bedrock user.** Set `bedrock_credentials = false` and Terraform skips the user and its
access key. Create a key by hand later, then paste it into a credential like any other
provider key. Nothing in the platform reads those outputs.

**The pre-token Lambda's execution role.** This one cannot be skipped. Cognito puts neither
email nor roles on an access token without the Lambda, and no Lambda runs without a role.
Ask whoever administers the account to create it, then set `pretoken_role_arn` to the ARN
they return.

That role is close to empty. Its trust policy names `lambda.amazonaws.com`. Its one
permission is the AWS managed `AWSLambdaBasicExecutionRole`, which writes log lines.

```hcl
pretoken_role_arn   = "arn:aws:iam::000000000000:role/unoverse-pretoken-role"
bedrock_credentials = false
```

Leave both settings out anywhere you can create IAM roles yourself. The module then creates
the role, waits for it to propagate, and behaves as it always has.

<Note>
**One IAM permission is still needed on the principal that deploys.** `iam:PassRole` is
checked against whoever creates the Lambda, not whoever created the role. The deploy creates
the Lambda, so it must be allowed to attach that role. Being handed an ARN does not remove
the requirement, and `PowerUserAccess` does not grant it.
</Note>

Request it scoped to the one role and the one service:

```json
{
  "Effect": "Allow",
  "Action": "iam:PassRole",
  "Resource": "arn:aws:iam::000000000000:role/unoverse-pretoken-role",
  "Condition": {
    "StringEquals": { "iam:PassedToService": "lambda.amazonaws.com" }
  }
}
```

## What the module actually provisions

| | |
| --- | --- |
| Instance | `t3.xlarge`, Ubuntu 22.04, 100 GB gp3 root volume, Elastic IP |
| Postgres | RDS 16, `db.t4g.small`, single AZ, 20 GB growing to 50, gp3 |
| Backups | 7 days of automated backups, removed with the instance. No final snapshot: take one yourself before destroying if you want a recovery point |
| Redis | ElastiCache 7.1, `cache.t4g.micro`, one node, TLS in transit with an auth token |
| Identity | Cognito Essentials pool, SPA client, hosted domain, one group per role |
| Claims | A pre-token Lambda, held in Terraform so a pool rebuild cannot drop it |
| AI | An IAM user and access key scoped to Bedrock, unless you switch it off |

Redis has no snapshots, deliberately. It holds cache and queue state, so there is nothing in
it worth restoring.

The module ships the small shape and takes no `size` variable yet. The
[size table](/architecture/deployment-options) describes where medium and large land when it does.

Postgres connections are direct rather than pooled. The smallest RDS instance allows well
over a hundred, so the [connection budget](/architecture/data) has ample headroom.

## What the POC costs to run

Estimates at on-demand list prices in a US region, mid-2026. Round numbers, for budgeting
rather than billing.

| | Monthly, about |
| --- | --- |
| EC2 `t3.xlarge` | $120 |
| RDS `db.t4g.small` | $25 |
| ElastiCache `cache.t4g.micro` | $12 |
| Application Load Balancer | $18 |
| Storage, public IPv4, DNS, transfer | $15 |
| **Total** | **about $190 a month** |

**The ground prices itself.** These numbers live in `infra/aws/prices.tf`, keyed by the
exact instance types this ground uses, and everything else reads them from there:
`unoverse deploy` quotes them in its plan summary, and this table quotes the same output.
Change a size and both move together, because there is only one copy.

```bash
terraform -chdir=infra/aws output monthly_estimate   # what yours costs, as configured
terraform -chdir=infra/aws output prices             # the whole table
```

Cognito is free at POC scale, and the certificate costs nothing. **Model usage is not in
this number**: Bedrock bills per token, so the AI cost follows what your Agents actually do
rather than the infrastructure. The instance is the bulk of the bill, and a POC that stops
it outside working hours roughly halves that line.

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
machine but your AI provider's rate limits, tokens per minute on your Bedrock or OpenAI account, which caps simultaneous Agent work long before the CPU does.
[Deployment Options](/architecture/deployment-options) has the sizes above this one.

## One load balancer, host-routed

The Application Load Balancer is the only thing facing the internet. Its own security group
takes 80 and 443 from the world, 80 redirects to 443, and the application security group
accepts 4105 and 3001 from that load balancer and nothing else. The instance is not reachable
directly.

**One door serves both hostnames**, which is the thing DigitalOcean cannot do. `api.<domain>`
forwards to the engine on 4105 by default. Turning on `canvas_public` adds a listener rule
for `canvas.<domain>` to Canvas on 3001, and adds that name to the certificate. On
[DigitalOcean](/architecture/digitalocean) the same outcome costs a second load balancer, because its
load balancers cannot route on the hostname.

**The idle timeout is 3600 seconds**, set deliberately. Streaming and the websocket are
long-lived, and the ALB default of 60 seconds severs them.

**An unknown hostname falls through to the platform** rather than being rejected at the
edge. That is safe because the authentication gate is in the application, so the load
balancer is never load bearing for security.

The certificate is ACM with DNS validation. If your zone is in Route 53 the module creates
the validation records and the A records itself. Otherwise it prints the records for you to
create once.

## Still single availability zone

One instance, one database with failover off, one cache node. That is the right shape for a
POC and the wrong shape for production. Moving is a variable rather than a redesign, and the
picture above does not change: what alters is what sits behind the load balancer, which is
where the multiple-instance work will land.

---

**Next**: [DigitalOcean](/architecture/digitalocean)
