---
sidebarTitle: "Who can run it"
title: "Who can run it"
---

Decide who is allowed to make your node run at all. A credential is the other direction,
your node's key to a service, and the two are easy to confuse.

| In | Key | Question |
| --- | --- | --- |
| `api/run.yaml` | `credential` | how does my node prove itself to the service? |
| `node.yaml` | `auth` | may this caller run my node? |

## You set the floor

`auth` is compulsory in `node.yaml`. Most nodes need no protecting, but a node that says
nothing looks the same as a node nobody thought about. There are three shapes.

**Adds nothing, which is almost every node.** The trigger already decided who was let in,
and your node runs as that person. It does not mean public.

```yaml node.yaml
auth:
  required: false
```

**Any signed-in caller.** For a node that is privileged however it is wired, so an anonymous
visitor must never reach it.

```yaml node.yaml
auth:
  required: true
```

**One platform role.** Only for a claim the platform itself defines, such as
`marketplace:publish`, so it means the same thing in every universe. A role your own
identity provider mints, like `finance:approve`, belongs to the person building the
workflow, not to the node: nobody installing your node has that role.

```yaml node.yaml
auth:
  required: true
  role: marketplace:publish
```

Write `required` every time. A role with `required: false` is a lint error, because a role
lives on a sign-in and cannot be demanded of someone who has not signed in.

## The builder sets the rest

Every node's settings form ends with two controls the platform adds: **Require sign-in**, a
toggle, and **Require role**, a text box shown once the toggle is on. They apply to that one
box on that one workflow, because the same node can face staff on one workflow and
customers on another, and only the person building it knows which.

You never write those two fields. Their names, `authRequired` and `authRole`, are reserved,
and a `config.yaml` declaring either is a lint error.

**The stricter of the two wins, and neither can loosen the other.** Turning the builder's
toggle off does not unlock a node you marked `required: true`. Letting anonymous visitors in
at all is a decision about a workflow, and it is a separate toggle on the trigger.

## Where it is enforced

At the trigger, before anything runs, for whether an anonymous visitor gets in at all.
Everywhere else, as the node starts, before any call is built, so a refused run costs no
request and has no side effect. That includes a node reached over a service edge. A refused
run fails and names the claim it wanted; it never silently skips its work.

## Identity in your calls

An authenticated run gives your calls the person as `user.id`, `user.email` and
`user.name`. The sign-in token itself never reaches a node.

```yaml api/run.yaml
body:
  requestedBy: "{{ user.email }}"
```

## Next steps

<Card title="Config schema" icon="sliders-horizontal" href="/nodes/config-schema" horizontal>
The settings form, and every field type it renders.
</Card>

<Card title="node.yaml" icon="book-marked" href="/reference/node-envelope" horizontal>
Every envelope field including `auth`, generated from the schema.
</Card>
