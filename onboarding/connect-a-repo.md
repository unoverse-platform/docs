---
sidebarTitle: "Connect a repo"
title: "Connect a repo"
---

Connect an org to its Git repo once, and every push you make reaches your universe by itself.

You need an org repo to connect. `unoverse create` makes one ([**studio**](/onboarding/studio)).
You also need to be an admin on the universe, because only an admin can change where an org's
work comes from.

## What you set up

A universe pulls an org's work from Git. Nothing is ever pushed into it. Connecting takes three
things, and the universe makes the two secret ones for you.

| | What it is | Where it goes |
| --- | --- | --- |
| The repo | The address of the org's Git repo, and the branch or release tags to follow | The org's **Source** tab |
| The deploy key | A key that lets the universe read the repo, and nothing more | The repo's deploy keys, with write access off |
| The webhook | An address the Git host calls on every push, with a secret that proves the call is real | The repo's webhooks, for push events |

The webhook is optional. Without it, the universe still checks the repo every five minutes.

## Connect it

<Steps>
<Step title="Open the org's Source tab">
In your universe, open **Organisations**, choose the org, then the **Source** tab.

Check the address bar first. The universe you connect is the one that pulls, so connect the
universe whose work you want to update.
</Step>
<Step title="Enter the repo">
Enter the repo's SSH address, such as `git@github.com:acme/acme.git`. Use the repo made for
this org: a repo whose `unoverse.yaml` declares a different org is refused.

Under **This universe follows**, choose **A branch** (usually `main`) or **Release tags**. A
production universe usually follows release tags, and the highest version wins. Press
**Connect**.
</Step>
<Step title="Copy the key and the secret">
The tab now shows a **Public key**, a **Payload URL** and a **Secret**. Use each **Copy**
button rather than reading them off the screen: one misread character makes a key that fails
without saying why.

The secret is shown once. If you lose it, **Change key** makes a new key and a new secret,
and both must then be replaced in the repo.
</Step>
<Step title="Add the deploy key to the repo">
On GitHub, open the repo's **Settings**, then **Deploy keys**, then **Add deploy key**. Paste
the public key and leave **Allow write access** off.

A new GitHub organisation may block deploy keys. If GitHub says they are disabled, an owner
allows them in the organisation's settings first.
</Step>
<Step title="Add the webhook">
In the repo's **Settings**, open **Webhooks**, then **Add webhook**. Paste the payload URL and
the secret, set the content type to `application/json`, and choose push events only.

GitHub sends a test call at once. A green tick on it means the universe accepted the secret.
</Step>
<Step title="Sync">
Press **Sync now**. The universe fetches the commit it follows, checks it, and applies it.
**History** records every sync.
</Step>
</Steps>

## Other Git hosts

The steps are the same, and only where the secret goes changes.

| Host | The deploy key | The webhook secret |
| --- | --- | --- |
| GitHub | Deploy keys, read-only | The webhook's **Secret** field |
| GitLab | Deploy keys, read-only | The webhook's **Secret token** field |
| Azure DevOps | SSH public keys | A service hook with basic authentication. The password is the secret, and the user name can be anything |

## Test on your own machine

A universe running on your laptop can follow a folder instead of a Git host. You commit, and
the universe syncs that commit within a second, with no push, no key and no webhook.

On the org's **Source** tab, enter the folder's full path as the repo, such as
`/Users/you/orgs/acme`. A path starting with `~` is refused. The universe reads commits, not
unsaved edits, so commit to try a change.

A deployed universe refuses a folder. Use a Git host for every universe other than your own.

## What each result means

**History** lists the latest syncs, newest first, with **Show all** for the rest. A refused
sync applies nothing, and the version already live keeps serving.

| You see | It means | Do this |
| --- | --- | --- |
| `Permission denied (publickey)`, or "make sure you have the correct access rights" | The repo does not have this universe's deploy key | Add the public key to the repo, or check you connected the right repo |
| `the repo declares org "…" in unoverse.yaml, but it is connected to "…"` | The repo belongs to another org | Connect this org to its own repo |
| `the repo has no unoverse.yaml declaring "org: …"` | The repo is not an org repo | Make it with `unoverse create`, or add `unoverse.yaml` |
| `the repo has no branch …`, or no tag matching the pattern | Nothing matches what the universe follows | Push the branch, tag a release, or change what it follows |
| A lint error naming a rule | The commit fails the same check your pull request runs | Fix it, commit and push again |

On GitHub, a webhook delivery marked `401` means the secret in the repo does not match the
universe's. Copy it again, or press **Change key** and replace both.

## Next steps

<Card title="Choose your environments" icon="layers" href="/architecture/environments" horizontal>
Decide which universe follows which branch, from dev to production.
</Card>

<Card title="Build in studio" icon="palette" href="/onboarding/studio" horizontal>
Author the components, apps and nodes your universe pulls.
</Card>
