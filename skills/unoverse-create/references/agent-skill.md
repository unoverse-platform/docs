# Playbook: Agent skills

An Agent skill is a markdown behaviour guide the platform's Agents discover and follow at
run time: how to handle a complaint, how to walk someone through a process. Prose for an
Agent, not code. Do not confuse it with this skill, which is for Claude Code.

## Where it goes

```
design/marketplace/skills/<skill-name>/
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
required too: frontmatter alone is invalid. The frontmatter is YAML: a value that holds a
colon followed by a space must be quoted (`description: "Guide for X: when and how"`), or
the whole block fails to parse and the skill silently does not exist. Lint reports it at
the line.

## The rules that bite

1. **`whenToUse` routes, `description` describes.** Never blend them. `whenToUse` is
   ranked against what a person actually says, so write it outcome first, in their words.
   [Node discoverability](https://docs.unoverse.ai/nodes/node-discoverability.md) applies
   verbatim.
2. **One skill, one behaviour.** "And also" means a second skill.
3. **Study a skill already in `design/marketplace/skills/`** and match its voice: short sections,
   do and don't bullets, explicit stop conditions, example lines the Agent can say.

## Ship

`unoverse lint <project>` (or `unoverse lint marketplace` for the universal tier), then
`unoverse deploy studio`. Lint checks every skill: the frontmatter parses, `name` matches
the folder, `description` is one line, `whenToUse` exists and does not repeat the
description, the body is not empty. The universe rescans skills on deploy.
