---
sidebarTitle: "Primitives"
title: "Primitives"
---

The complete set a definition may compose from. It is closed: a renderer that met an
unknown type would have nothing to draw, so adding to it is a change to every SDK.

<Note>
This page is generated from `definition-1.2.schema.json`, the contract every
unoverse SDK is tested against. It cannot describe a primitive the platform does not have.
</Note>

## Structure

<ResponseField name="Box" type="primitive">
A container. The one you reach for by default, and the thing every layout is built from.
</ResponseField>

<ResponseField name="Stack" type="primitive">
Children in one direction, spaced evenly. A `Box` that has already decided it is a stack.
</ResponseField>

<ResponseField name="Row" type="primitive">
Children left to right. Stacks automatically once the space runs out.
</ResponseField>

<ResponseField name="Column" type="primitive">
Children top to bottom.
</ResponseField>

<ResponseField name="Each" type="primitive" post={["requires template"]}>
Repeats one subtree over a list, either a literal `items` array or a bound field.
</ResponseField>

<ResponseField name="Switch" type="primitive" post={["requires on + cases"]}>
Draws one case out of several, chosen by a single discriminant field.
</ResponseField>

<ResponseField name="ComponentSlot" type="primitive">
Where a component renders inside an app. A bare slot is the conversation flow; one with `select` is a reaction surface.
</ResponseField>

<ResponseField name="Timeline" type="primitive">
The conversation itself. You supply the user and assistant turn subtrees, and the stream fills them.
</ResponseField>

## Leaf

<ResponseField name="Text" type="primitive">
A string. Bound to a field, or a literal you typed.
</ResponseField>

<ResponseField name="Image" type="primitive">
An image, from a bound URL or a literal `src`.
</ResponseField>

<ResponseField name="Button" type="primitive">
Something to press. Carries the `action` that runs when it is pressed.
</ResponseField>

<ResponseField name="Input" type="primitive">
A text field. Its `bind.value` is the one two-way binding in the set: it reads and writes the same key.
</ResponseField>

<ResponseField name="Select" type="primitive">
A choice from a fixed list of options.
</ResponseField>

<ResponseField name="Markdown" type="primitive">
Renders markdown, for text an Agent wrote rather than text you laid out.
</ResponseField>

<ResponseField name="Skeleton" type="primitive">
A loading placeholder in the shape of the thing that has not arrived.
</ResponseField>

<ResponseField name="Icon" type="primitive">
One glyph from the icon set. A literal name, or a bound field.
</ResponseField>

<ResponseField name="Orb" type="primitive">
The voice indicator. Shows that a call is live and who is speaking.
</ResponseField>

## Helper

<ResponseField name="Ref" type="primitive">
Composes an atom. `props` remaps fields onto it, `with` passes literals into it.
</ResponseField>


## Next steps

<Card title="Style keys" icon="palette" href="/reference/style-keys" horizontal>
Every key a `style` block accepts.
</Card>

<Card title="Components" icon="square-dashed" href="/design/components" horizontal>
How these compose into something an Agent can send.
</Card>
