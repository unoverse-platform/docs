# Playbook: Agent skills

An Agent skill is a markdown behaviour guide the platform's Agents discover and follow at
run time: how to handle a complaint, how to walk someone through a process. Prose for an
Agent, not code. Do not confuse it with this skill, which is for Claude Code.

## Where it goes

```
prompts/skills/<skill-name>/
  SKILL.md                 required: frontmatter plus the instructions
  references/              optional files the Agent may be handed
```

An org-private skill lives at `design/<org>/skills/<skill-name>/` instead and is addressed
`<org>/<skill-name>`.

## Frontmatter the platform reads

```markdown
---
name: skill-name          # required. lowercase, digits, hyphens
description: One line saying what it is    # required. the listing subtitle
title: Skill Name         # what a person sees
whenToUse: The selection text, outcome first, in the user's own words
version: 1.0.0
category: support
triggers: [keyword, phrase]
---
```

`name` and `description` are required; a file missing either does not load. The body is
required too: frontmatter alone is invalid.

## The rules that bite

1. **`whenToUse` routes, `description` describes.** Never blend them. `whenToUse` is
   ranked against what a person actually says, so write it outcome first, in their words.
   [Node discoverability](https://docs.unoverse.ai/nodes/node-discoverability.md) applies
   verbatim.
2. **One skill, one behaviour.** "And also" means a second skill.
3. **Study a skill already in `prompts/skills/`** and match its voice: short sections,
   do and don't bullets, explicit stop conditions, example lines the Agent can say.

## Ship

`unoverse lint`, then `unoverse deploy studio`. The universe rescans skills on deploy.
