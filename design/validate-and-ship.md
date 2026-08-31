---
sidebarTitle: "Validate and ship"
title: "Validate and ship"
---

Publish your work with two commands, and nothing broken reaches a universe. What lands is
live in every canvas at once.

## Ship

Publishing runs from the terminal. Design assets never deploy through the core platform.

1. **Preview in mock.** Exercise every state from the prop defaults and the state picker.
2. **Preview in live.** Stream real data through it and watch the stream log stay clean.
   The preview runs the production path, so this is the release test ([studio](/design/studio)).
3. **Publish.**

```bash
unoverse login
unoverse deploy studio
```

`login` is a one-time browser sign-in to the universe you are publishing to, and publishing
is a specific permission on your account.

Edits to something already published apply live. Anything brand new has to be published
before a workflow can use it.

## What the lint checks

`deploy studio` runs the lint first and stops on any error, so nothing broken leaves your
machine.

| Level | Means |
|---|---|
| Error | Blocks the publish |
| Warning | A judgment call, such as a slot that selects nothing in particular |
| Hint | A nicety worth doing |

**Every message cites the page that owns the rule**, so there is nothing here to memorise.
The rules themselves are taught where you use them:

| If the lint complains about | Read |
|---|---|
| Raw values, style keys, invented scale steps | [Styles and tokens](/design/styles-and-tokens) |
| An unknown primitive, or an illegal condition | [Essentials](/design/essentials) |
| Props, `values:`, or a self-guarding `Switch` | [Components](/design/components) |
| A state tree, or a layout path that does not resolve | [State](/design/state) |
| Discovery meta, or a slot that selects too broadly | [Apps](/design/apps) |

[Reference](/reference/overview) is the generated field list behind all of it.

## Caught as you type

The schema at `design/_schema/unoverse.schema.json` validates every definition in your
editor, before the lint ever runs. It is structural, with no false positives, and it flags
a missing envelope field, an unknown primitive, a broken `Switch` or `Each`, and any
condition beyond `eq`, `ne`, `in` and truthy.

Wire it once through the YAML extension, which [Quick start](/design/quick-start) covers in
one snippet. Without it you meet these mistakes at publish rather than at the keystroke.

## What only you can judge

No linter decides these. Audit every artifact against them before calling it done.

**Structure**

- [ ] Structure is earned: flat if it can be, with folders only when the shape demands them
- [ ] Few shallow discriminants rather than boolean soup, and same-shape states collapsed
      into one data-driven state

**Data**

- [ ] Every `bind` has a prop or key with a default, and the defaults are realistic content
- [ ] Derived values are computed in the workflow and arrive as plain fields

**State** ([State](/design/state))

- [ ] Reactions are name-matches on the public state, and `setAppValue` writes chrome keys
      only
- [ ] Locked state is projected rather than simulated: lifecycle flags, `callState`, host
      chrome

**Templates and apps** ([Templates](/design/templates) · [Apps](/design/apps))

- [ ] No component is named in a directed part, and no component-type rules sit in a slot
- [ ] A component owns its own size and states, and the app owns only the framing
- [ ] `whenToUse` is outcome-first, in the words a user would say

**Style** ([Styles and tokens](/design/styles-and-tokens))

- [ ] Semantic tokens only, with no invented component-named tokens

## Next steps

<Card title="Troubleshooting" icon="wrench" href="/design/troubleshooting" horizontal>
Symptom, cause and fix for the mistakes that recur.
</Card>

<Card title="Reference" icon="book-marked" href="/reference/overview" horizontal>
Every field the lint checks, generated from the schemas.
</Card>
