---
sidebarTitle: "Style keys"
title: "Style keys"
---

Every key a `style` block accepts. The set is closed, so an unknown key is ignored by every
renderer and is always either a typo or a web-ism that would not port. Values are token
names or scale steps, never raw pixels or hex.

<Note>
This page is generated from `definition-1.2.schema.json`, the contract every
unoverse SDK is tested against. It cannot describe a primitive the platform does not have.
</Note>

## Size

<ResponseField name="width" type="style key">
Width, as a space-scale step or a page-width name.
</ResponseField>

<ResponseField name="height" type="style key">
Height, as a space-scale step.
</ResponseField>

<ResponseField name="maxWidth" type="style key">
An upper bound. Page-level caps use a name, an element's own size uses a step.
</ResponseField>

<ResponseField name="minWidth" type="style key">
A lower bound on width.
</ResponseField>

<ResponseField name="minHeight" type="style key">
A lower bound on height.
</ResponseField>

<ResponseField name="maxHeight" type="style key">
An upper bound on height.
</ResponseField>

<ResponseField name="flex" type="style key">
How this child shares the space its parent has left.
</ResponseField>

## Spacing

<ResponseField name="padding" type="style key">
Space inside the element, as a scale step.
</ResponseField>

<ResponseField name="margin" type="style key">
Space outside the element.
</ResponseField>

<ResponseField name="gap" type="style key">
Space between children.
</ResponseField>

## Layout

<ResponseField name="overflow" type="style key">
What happens to content larger than the box.
</ResponseField>

<ResponseField name="position" type="style key">
How the element is placed against its parent.
</ResponseField>

<ResponseField name="inset" type="style key">
All four offsets at once. `0` is the usual overlay.
</ResponseField>

<ResponseField name="top" type="style key">
Offset from the top, when positioned.
</ResponseField>

<ResponseField name="right" type="style key">
Offset from the right, when positioned.
</ResponseField>

<ResponseField name="bottom" type="style key">
Offset from the bottom, when positioned.
</ResponseField>

<ResponseField name="left" type="style key">
Offset from the left, when positioned.
</ResponseField>

<ResponseField name="zIndex" type="style key">
Which of two overlapping elements draws on top.
</ResponseField>

<ResponseField name="direction" type="style key">
Whether children run in a row or a column.
</ResponseField>

<ResponseField name="wrap" type="style key">
Whether children wrap onto another line.
</ResponseField>

<ResponseField name="align" type="style key">
Alignment across the direction children run in.
</ResponseField>

<ResponseField name="justify" type="style key">
Alignment along the direction children run in.
</ResponseField>

<ResponseField name="display" type="style key">
Whether the element takes part in layout at all.
</ResponseField>

## Grid

<ResponseField name="columns" type="style key">
Turns the element into a grid of this many columns.
</ResponseField>

<ResponseField name="span" type="style key">
How many of the parent grid's columns this child covers.
</ResponseField>

<ResponseField name="stackBelow" type="style key">
The width at which a grid gives up and stacks. Measures the grid, never the viewport.
</ResponseField>

## Container

<ResponseField name="container" type="style key">
Makes this element the thing its children measure themselves against.
</ResponseField>

<ResponseField name="hideBelow" type="style key">
Hide once the container is narrower than this.
</ResponseField>

<ResponseField name="hideAbove" type="style key">
Hide once the container is wider than this.
</ResponseField>

## Surface

<ResponseField name="background" type="style key">
Background colour, as a semantic token name.
</ResponseField>

<ResponseField name="radial" type="style key">
A radial gradient background.
</ResponseField>

<ResponseField name="border" type="style key">
All four borders, as a token name.
</ResponseField>

<ResponseField name="borderTop" type="style key">
The top border alone.
</ResponseField>

<ResponseField name="borderRight" type="style key">
The right border alone.
</ResponseField>

<ResponseField name="borderBottom" type="style key">
The bottom border alone.
</ResponseField>

<ResponseField name="borderLeft" type="style key">
The left border alone.
</ResponseField>

<ResponseField name="outline" type="style key">
A ring drawn outside the border, usually for focus.
</ResponseField>

<ResponseField name="shadow" type="style key">
Drop shadow, as a token name.
</ResponseField>

<ResponseField name="radius" type="style key">
Corner rounding on all four corners.
</ResponseField>

<ResponseField name="radiusTopLeft" type="style key">
One corner's rounding.
</ResponseField>

<ResponseField name="radiusTopRight" type="style key">
One corner's rounding.
</ResponseField>

<ResponseField name="radiusBottomLeft" type="style key">
One corner's rounding.
</ResponseField>

<ResponseField name="radiusBottomRight" type="style key">
One corner's rounding.
</ResponseField>

## Type

<ResponseField name="font" type="style key">
A text style from `semantic/text-styles.yaml`, such as `headline.lg`.
</ResponseField>

<ResponseField name="weight" type="style key">
Font weight, as a token name.
</ResponseField>

<ResponseField name="lineHeight" type="style key">
Line height, as a token name.
</ResponseField>

<ResponseField name="color" type="style key">
Text colour, as a semantic token name.
</ResponseField>

<ResponseField name="textAlign" type="style key">
Text alignment within its box.
</ResponseField>

## Media

<ResponseField name="fit" type="style key">
How an image fills its box.
</ResponseField>

## Motion

<ResponseField name="transform" type="style key">
A visual transform, such as a scale or a nudge.
</ResponseField>

<ResponseField name="transition" type="style key">
Which property changes are animated, and how fast.
</ResponseField>

<ResponseField name="animation" type="style key">
A named keyframe animation from `semantic/keyframes.yaml`.
</ResponseField>

<ResponseField name="animationDelay" type="style key">
How long to wait before the animation starts.
</ResponseField>

<ResponseField name="cursor" type="style key">
The pointer shown on hover.
</ResponseField>

## Conditional

<ResponseField name="hover" type="style key">
A patch of styles applied while the pointer is over the element.
</ResponseField>

<ResponseField name="active" type="style key">
A patch applied while the element is being pressed.
</ResponseField>

<ResponseField name="disabled" type="style key">
A patch applied while the element is disabled.
</ResponseField>

<ResponseField name="when" type="style key">
A list of conditions, each applying its own style patch when it matches.
</ResponseField>


## Next steps

<Card title="Styles and tokens" icon="palette" href="/design/styles-and-tokens" horizontal>
Where these values come from, and how a rebrand works.
</Card>

<Card title="Primitives" icon="box" href="/reference/primitives" horizontal>
The elements these styles apply to.
</Card>
