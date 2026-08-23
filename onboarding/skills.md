---
sidebarTitle: "Skills"
title: "Skills"
---

A skill is a set of instructions your AI coding agent reads before it writes anything.
Install ours, and Claude Code knows how to build on unoverse.

Ask it for a component, an app or a node. It writes files that run: the right shape, the
right folder, your project's own tokens. You do not have to learn the rules first.

## What you get

| Skill | What it covers |
| --- | --- |
| `unoverse-create` | Everything you can author: components, apps, atoms, styles, themes, Agent skills, prompt blocks, nodes and workflows. It works out which one you are building, then applies the rules for it. |
| `unoverse-prompt-component` | Components an Agent fills with content. Which fields the Agent may write, and what silently throws its work away. |

A skill points at the documentation rather than copying it, so the two cannot drift apart.

## Install them

```bash
unoverse update
```

Every update installs them, so they arrive with your tooling and stay current with it. They
live in `~/.claude/skills`, which is why Claude Code finds them in every folder you open.

For an agent the CLI does not manage:

```bash
npx skills add unoverse-platform/skills
```

Both skills are plain markdown, and you can read every rule they apply at
[github.com/unoverse-platform/skills](https://github.com/unoverse-platform/skills).

## Next steps

<Card title="Open studio" icon="palette" href="/onboarding/studio" horizontal>
Build and preview everything your agent writes.
</Card>

<Card title="Read the skills on GitHub" icon="book-open" href="https://github.com/unoverse-platform/skills" horizontal>
Every rule your agent follows, in plain markdown.
</Card>
