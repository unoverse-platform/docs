---
sidebarTitle: "Primitives"
title: "Primitives"
---

The complete set a definition may compose from. It is closed: a renderer meeting an unknown
type would have nothing to draw, so adding to it is a change to every SDK.

<div className="ref-source">
Generated from <code>definition-1.2.schema.json</code> and the token files, so it
cannot fall behind what ships.
</div>

## Structure

<ResponseField name="Box">
A container. The one you reach for by default, and the thing every layout is built from.

```yaml
type: Box
style: { direction: column, gap: "3", padding: "6" }
children:
  - { type: Text, value: Hello }
```
</ResponseField>

<ResponseField name="Stack">
Children in one direction, spaced evenly. A `Box` that has already decided it is a stack.

```yaml
type: Stack
style: { direction: column, gap: "2" }
children:
  - { type: Text, value: First }
  - { type: Text, value: Second }
```
</ResponseField>

<ResponseField name="Row">
Children left to right. Stacks automatically once the space runs out.

```yaml
type: Row
style: { gap: "3", align: center }
children:
  - { type: Icon, icon: check }
  - { type: Text, value: Confirmed }
```
</ResponseField>

<ResponseField name="Column">
Children top to bottom.

```yaml
type: Column
style: { gap: "2" }
children:
  - { type: Text, value: Total }
  - { type: Text, value: "$49" }
```
</ResponseField>

<ResponseField name="Each" post={["requires template"]}>
Repeats one subtree over a list, either a literal `items` array or a bound field.

```yaml
type: Each
bind: { items: features }
style: { direction: column, gap: "2" }
template:
  type: Text
  bind: { value: label }
```
</ResponseField>

<ResponseField name="Switch" post={["requires on + cases"]}>
Draws one case out of several, chosen by a single discriminant field.

```yaml
type: Switch
on: view
cases:
  products: { type: Text, value: The rail card }
  detail: { type: Text, value: The full page }
```
</ResponseField>

<ResponseField name="ComponentSlot">
Where a component renders inside an app. A bare slot is the conversation flow; one with `select` is a reaction surface.

```yaml
type: ComponentSlot
select: { from: all, where: { field: view, eq: detail }, limit: 1 }
frame:
  type: Box
  style: { direction: column, overflow: auto }
```
</ResponseField>

<ResponseField name="Timeline">
The conversation itself. You supply the user and assistant turn subtrees, and the stream fills them.

```yaml
type: Timeline
user:
  type: Text
  bind: { value: text }
assistant:
  type: Markdown
  bind: { value: text }
```
</ResponseField>

## Leaf

<ResponseField name="Text">
A string. Bound to a field, or a literal you typed.

```yaml
type: Text
bind: { value: title }
style: { font: headline.lg, color: text.primary }
```
</ResponseField>

<ResponseField name="Image">
An image, from a bound URL or a literal `src`.

```yaml
type: Image
bind: { src: primaryImage }
alt: Product photo
style: { width: full, radius: md, fit: cover }
```
</ResponseField>

<ResponseField name="Button">
Something to press. Carries the `action` that runs when it is pressed.

```yaml
type: Button
value: Choose plan
action:
  type: setValue
  values:
    - { key: view, value: detail }
```
</ResponseField>

<ResponseField name="Input">
A text field. Its `bind.value` is the one two-way binding in the set: it reads and writes the same key.

```yaml
type: Input
bind: { value: draft }
placeholder: Ask a question
```
</ResponseField>

<ResponseField name="Select" post={["added in 1.1"]}>
A choice from a fixed list of options.

```yaml
type: Select
bind: { value: plan }
options:
  - { value: starter, label: Starter }
  - { value: pro, label: Pro }
```
</ResponseField>

<ResponseField name="Markdown">
Renders markdown, for text an Agent wrote rather than text you laid out.

```yaml
type: Markdown
bind: { value: bodyCopy }
```
</ResponseField>

<ResponseField name="Skeleton">
A loading placeholder in the shape of the thing that has not arrived.

```yaml
type: Skeleton
style: { width: full, height: "8", radius: md }
```
</ResponseField>

<ResponseField name="Icon">
One glyph from the icon set. A literal name, or a bound field.

```yaml
type: Icon
icon: arrowRight
style: { color: text.secondary }
```
</ResponseField>

<ResponseField name="Orb">
The voice indicator. Shows that a call is live and who is speaking.

```yaml
type: Orb
style: { width: "20", height: "20" }
```
</ResponseField>

## Helper

<ResponseField name="Ref" post={["added in 1.2"]}>
Composes an atom. `props` remaps fields onto it, `with` passes literals into it.

```yaml
type: Ref
ref: button
with: { label: Learn more, icon: arrowRight }
action: { type: setValue, values: [{ key: view, value: detail }] }
```
</ResponseField>

## Next steps

<Card title="Style keys" icon="palette" href="/reference/style-keys" horizontal>
Every key a `style` block accepts, and what each one takes.
</Card>

<Card title="Components" icon="square-dashed" href="/design/components" horizontal>
How these compose into something an Agent can send.
</Card>
