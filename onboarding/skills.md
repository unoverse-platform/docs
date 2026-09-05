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

A skill points at the documentation rather than copying it, so the two cannot drift apart.
Everything a skill tells your agent is on a page of this site, which is where to read it.

## Install them

```bash
unoverse update
```

The CLI downloads the skills from this site into `~/.claude/skills`, which is why
Claude Code finds them in every folder you open. `unoverse create` and a first
`unoverse studio` install them too, and every update keeps them current.

## Let your agent search this site

This site serves its own MCP server, with a search tool over every page. Add it once and
Claude Code answers from the documentation instead of guessing:

```bash
claude mcp add unoverse https://docs.unoverse.ai/mcp
```

## Next steps

<Card title="Open studio" icon="palette" href="/onboarding/studio" horizontal>
Build and preview everything your agent writes.
</Card>

<Card title="Build a component" icon="palette" href="/onboarding/create-a-component" horizontal>
See what the skill writes, by writing one yourself.
</Card>
