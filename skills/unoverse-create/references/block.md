# Playbook: prompt blocks

A prompt block is a reusable prompt fragment: formatting rules, a reasoning pattern, a
policy. Workflows compose blocks into an Agent's system prompt, and a node references one
as `{{prompt.<blockName>}}` so the words track the block. Smaller than a skill: a skill is a
behaviour, a block is an ingredient.

## Where it goes

```
prompts/blocks/<category>/<block-name>.md
```

The folder is the category. The shipped ones are `core`, `formatting` and `media`; add a
folder only for a genuinely new family.

## Format

```markdown
---
name: Human Readable Name
description: What this block contributes to a prompt
tags: [topic, topic2]
---

The prompt text, written as direct instructions to the Agent, present tense.
```

The block's reference name is the filename in camelCase: `markdown-guidelines.md` is
`{{prompt.markdownGuidelines}}`.

## The rules that bite

1. **A block stands alone.** No references to other blocks, no assumptions about the rest
   of the prompt.
2. **Generic and reusable.** Anything specific to one workflow belongs in that workflow's
   own prompt.
3. **Match the shipped shape:** tight sections, imperative bullets, no commentary about
   being a block.

## Ship

`unoverse lint`, then `unoverse deploy studio`.
