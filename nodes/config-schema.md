---
sidebarTitle: "Config schema"
title: "Config schema"
---

`config.yaml` is the settings form. **canvas** renders it, someone fills it in, and your
calls read the saved values as `{{ config.<field> }}`.

It is the file you touch most. Every new option a node grows lands here and nowhere else.

```yaml config.yaml
configSchema:
  type: object
  required: [model]
  properties:
    model:
      type: string
      title: Model
      description: Which model answers
      enum: [fast, balanced, deep]
      enumNames: [Fast, Balanced, Deep reasoning]
      default: balanced

    prompt:
      type: string
      title: Prompt
      description: The request to answer. Usually wired in from an upstream node.
      default: ""
      ui:field: template

"ui:order": [model, prompt]
```

`configSchema` is a JSON Schema, so any keyword you already know works. The `ui:` keys are
the platform's, and they decide how a field is drawn.

## Writing the labels

Three fields decide whether the form makes sense to the person filling it in.

| Key | Is |
|---|---|
| `title` | The label. Without one the raw property name is shown, which reads as unfinished |
| `description` | The help text under the field |
| `default` | What the field starts as |

**Say what the setting does, not what it is called.** "Maximum number of tokens to generate"
tells a reader nothing they could not get from the label. "The model stops when it hits this,
mid-sentence and without an error" tells them why they might change it.

Keep it to a line or two. Detail belongs in your node's own documentation, not under a form
field.

## Field types

### Text

```yaml
systemPrompt:
  type: string
  title: System Prompt
  description: Standing instructions for every run. Optional.
  default: ""
  ui:field: template
```

### A choice

`enum` is the values, `enumNames` is what a person sees. They are positional, so they must be
the same length.

```yaml
tone:
  type: string
  title: Tone
  enum: [neutral, warm, terse]
  enumNames: [Neutral, Warm, Terse]
  default: neutral
```

### A number

```yaml
maxTokens:
  type: number
  title: Max Tokens
  description: The reply stops when it hits this, mid-sentence and without an error.
  default: 1200
  minimum: 1
  maximum: 128000
  step: 100
```

`minimum` and `maximum` are enforced, so a bad value is caught in the form rather than by the
service.

### A switch

```yaml
includeSources:
  type: boolean
  title: Include sources
  default: false
  ui:widget: toggle
```

### Structured data

```yaml
schema:
  type: object
  title: Output schema
  description: The JSON Schema the answer must match.
  ui:field: template
```

## Making a field wirable

`ui:field: template` is what lets a field take data from an upstream node instead of a
typed value. Without it, the field is whatever someone typed.

```yaml
prompt:
  type: string
  title: Prompt
  ui:field: template
```

The syntax follows the field's `type`, on every node: a `string` takes a `{{ }}` Handlebars string,
while an `object` or `array` takes a `return` expression.

```yaml
prompt: "Summarise this: {{signal.inputtrigger1.output.message}}"
```

[Handlebars and expressions](/nodes/expressions) covers the grammar, every root a field can
reach, and what the sandbox allows. Workflow-level values such as `workflow.variables`
resolve here, before the node runs, which is why they belong in a config field rather than
in a call.

## Showing a field only when it matters

`ui:dependencies` hides a field until another field has the right value. A scalar means it
must match exactly, an array means it must be one of several, and multiple keys are all
required at once.

```yaml
mode:
  type: string
  title: Mode
  enum: [simple, advanced]
  default: simple

retries:
  type: number
  title: Retries
  default: 3
  ui:dependencies:
    mode: advanced

timeout:
  type: number
  title: Timeout
  ui:dependencies:
    mode: [advanced, expert]
```

Lint checks that every key names a real sibling field, so a rename cannot leave a field
permanently hidden.

### Two fields you never write

`authRequired` and `authRole` are reserved. The builder's two access controls are platform
chrome, injected into every runnable node's form, and declaring either yourself is a lint
error. [Who can run it](/nodes/who-can-run-it) covers how your floor and the builder's
controls resolve together.

## Other keys you will meet

| Key | Does |
|---|---|
| `ui:order` | The order fields appear in. Lint refuses a name that is not a field |
| `ui:widget: toggle` | A switch instead of a checkbox |
| `ui:widget: select` | A dropdown where the default control would not be one |
| `ui:field: textarea` | A multi-line box |
| `ui:field: password` | Masks what is typed |
| `ui:field: code` | A code editor |
| `ui:hidden` | Keeps the field in the schema and out of the form |
| `required` | Named at the `configSchema` level, not on the field |

The [reference](/reference/node-config) lists every `ui:` key.

## When it goes wrong

| What you see | Why |
|---|---|
| A field labelled with its property name | No `title` |
| The value arrived empty and nothing errored | The path matched nothing. Check the node id against the edge you drew |
| The service rejected a number as a string | The value went through Handlebars. A field that is exactly one `{{ path }}` keeps its type; anything else becomes text |
| Lint: `ui:order` names a field that does not exist | A rename left the list behind |
| Lint: `enumNames` is a different length from `enum` | They are positional |
| A field never appears | A `ui:dependencies` condition that can never be true |

## Next steps

<Card title="Handlebars and expressions" icon="braces" href="/nodes/expressions" horizontal>
The grammar a wirable field resolves, and every root it can reach.
</Card>

<Card title="config.yaml" icon="book-marked" href="/reference/node-config" horizontal>
Every field the settings form takes, generated from the schema.
</Card>
