---
sidebarTitle: "Overview"
title: "Agent skills"
---

The rules your AI coding agent reads before it writes anything on unoverse, published here
as pages so the agent and you read the same words.

A skill routes: it works out what you are building, states the hard rules for that kind,
and links the page in this documentation that teaches it. It never restates a page.

| Skill | What it covers |
| --- | --- |
| `unoverse-create` | Everything you can author: components, apps, atoms, styles, themes, Agent skills, prompt blocks, nodes and workflows |

## Install them

```bash
unoverse update
```

The CLI reads this site's `llms.txt`, downloads every page under `skills/`, and writes them
to `~/.claude/skills`, so Claude Code finds them in every folder you open. `unoverse create`
and a first `unoverse studio` do the same, so a fresh machine has them from the start.

## Next steps

<Card title="Skills, from the onboarding kit" icon="sparkles" href="/onboarding/skills" horizontal>
What each skill lets your agent do, with the commands.
</Card>

<Card title="unoverse-create" icon="wand" href="/skills/unoverse-create/SKILL" horizontal>
The authoring playbook, as your agent reads it.
</Card>
