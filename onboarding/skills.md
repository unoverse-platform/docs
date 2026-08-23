---
sidebarTitle: "Skills"
title: "Skills"
---

Skills are instructions your AI agent reads. They tell Claude Code how to build on
unoverse. Describe what you want and you get files that work. You build on the platform
before you have learned it.

They install by themselves with `unoverse update`. There is nothing to set up.

<Note>
**Two things wear this word.** The skills on this page are **authoring skills**: they live on
your machine and teach *your* agent to build unoverse artifacts. The skills in a project's
`prompts/skills/` are **Agent skills**: behaviour *your Agents* follow at runtime, published
to a universe. This page is about the first.
</Note>

## What you get

| Skill | What it does |
| --- | --- |
| `unoverse-create` | The authoring playbook. Routes any "create or edit an unoverse artifact" request to the right reference and the rules that govern it: components, templates, styles, org packs, Agent skills, prompt blocks, nodes, workflows. |
| `unoverse-prompt-component` | Briefed components, the ones an Agent fills with content. Which props the Agent may write, and the traps that silently discard a brief. |

Each one routes rather than repeats. It identifies what you are building, names the rules
that apply, and links the reference page that teaches it. The rules live in one place, so a
skill and a doc cannot drift apart.

## How they reach you

```bash
unoverse update
```

That is the whole story. The CLI installs them every time you update it, so they arrive with
your tooling and stay current with it.

**Per developer, not per project.** They install to `~/.claude/skills`, so Claude Code picks
them up in every folder you open, and nothing lands inside a workspace where it could be
committed by accident.

**Replaced whole, and only ours.** Each skill folder is removed and rewritten on update, so a
file deleted upstream really goes. Everything else in `~/.claude/skills` is yours and is
never touched.

If you want them in an agent the CLI does not manage:

```bash
npx skills add unoverse-platform/skills
```

They are published at
[unoverse-platform/skills](https://github.com/unoverse-platform/skills).

## What they change

Learning a platform normally comes before building on it. This turns that around.

Without the skills, an agent asked for help here writes something that looks right and does
not run. It has no way to know how unoverse expects things to be built, so you have to learn
the rules yourself and correct it every time.

With them, your first real piece of work can be something you describe. The agent builds it
the way the platform expects and reuses what your project already has, and you learn how it
works by reading something that already runs.

They are guidance, not a code generator. Everything the agent writes is an ordinary file in
your own repository, and you can read it, change it or delete it.

Next: [studio](/onboarding/studio) is where what they build gets previewed and shipped.
