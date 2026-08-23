---
sidebarTitle: "Style keys"
title: "Style keys"
---

Every key a `style` block accepts. The set is closed, so an unknown key is ignored by every
renderer and is always a typo or a web-ism that would not port. Each entry names the CSS
property it maps to, for when you know the CSS name and not ours.

<div className="ref-source">
Generated from <code>definition-1.2.schema.json</code> and the token files, so it
cannot fall behind what ships.
</div>

## Size

```yaml
style: { width: full, maxWidth: reading, height: "20" }
```

<ResponseField name="width">
How wide the element is.
<div className="ref-takes">CSS `width` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

<ResponseField name="height">
How tall the element is.
<div className="ref-takes">CSS `height` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

<ResponseField name="maxWidth">
An upper bound on width. A page-level cap uses a name; an element's own size stays a step.
<div className="ref-takes">CSS `max-width` · takes a [scale step](/reference/scales), or a page-width name, or `auto` / `full`</div>
</ResponseField>

<ResponseField name="minWidth">
A lower bound on width.
<div className="ref-takes">CSS `min-width` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

<ResponseField name="minHeight">
A lower bound on height.
<div className="ref-takes">CSS `min-height` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

<ResponseField name="maxHeight">
An upper bound on height.
<div className="ref-takes">CSS `max-height` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

<ResponseField name="flex">
How this child shares the space its parent has left.
<div className="ref-takes">CSS `flex`</div>
</ResponseField>

## Spacing

```yaml
style: { padding: "6", gap: "3" }
```

<ResponseField name="padding">
Space inside the element.
<div className="ref-takes">CSS `padding` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

<ResponseField name="margin">
Space outside the element.
<div className="ref-takes">CSS `margin` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

<ResponseField name="gap">
Space between children.
<div className="ref-takes">CSS `gap` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

## Layout

```yaml
style: { direction: row, align: center, justify: between }
```

<ResponseField name="overflow">
What happens to content larger than the box.
<div className="ref-takes">CSS `overflow`</div>
</ResponseField>

<ResponseField name="position">
How the element is placed against its parent.
<div className="ref-takes">CSS `position`</div>
</ResponseField>

<ResponseField name="inset">
All four offsets at once. `0` is the usual overlay.
<div className="ref-takes">CSS `inset` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

<ResponseField name="top">
Offset from the top, when positioned.
<div className="ref-takes">CSS `top` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

<ResponseField name="right">
Offset from the right, when positioned.
<div className="ref-takes">CSS `right` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

<ResponseField name="bottom">
Offset from the bottom, when positioned.
<div className="ref-takes">CSS `bottom` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

<ResponseField name="left">
Offset from the left, when positioned.
<div className="ref-takes">CSS `left` · takes a [scale step](/reference/scales), or `auto` / `full`</div>
</ResponseField>

<ResponseField name="zIndex">
Which of two overlapping elements draws on top.
<div className="ref-takes">CSS `z-index`</div>
</ResponseField>

<ResponseField name="direction">
Whether children run in a row or a column.
<div className="ref-takes">CSS `flex-direction`</div>
</ResponseField>

<ResponseField name="wrap">
Whether children wrap onto another line.
<div className="ref-takes">CSS `flex-wrap`</div>
</ResponseField>

<ResponseField name="align">
Alignment across the direction children run in.
<div className="ref-takes">CSS `align-items`</div>
</ResponseField>

<ResponseField name="justify">
Alignment along the direction children run in.
<div className="ref-takes">CSS `justify-content`</div>
</ResponseField>

<ResponseField name="display">
Whether the element takes part in layout at all.
<div className="ref-takes">CSS `display`</div>
</ResponseField>

## Grid

```yaml
style: { columns: "12", gap: "4" }   # a child then takes span: "4"
```

<ResponseField name="columns">
Turns the element into a grid of this many columns.
<div className="ref-takes">CSS `grid-template-columns`</div>
</ResponseField>

<ResponseField name="span">
How many of the parent grid's columns this child covers.
<div className="ref-takes">CSS `grid-column`</div>
</ResponseField>

<ResponseField name="stackBelow">
The width at which a grid gives up and stacks. Measures the grid, never the viewport.
<div className="ref-takes">CSS `@container` · takes a [scale step](/reference/scales), or a page-width name, or `auto` / `full`</div>
</ResponseField>

## Container

```yaml
style: { container: inline-size, hideBelow: "120" }
```

<ResponseField name="container">
Makes this element the thing its children measure themselves against.
<div className="ref-takes">CSS `container-type`</div>
</ResponseField>

<ResponseField name="hideBelow">
Hide once the container is narrower than this.
<div className="ref-takes">CSS `@container` · takes a [scale step](/reference/scales), or a page-width name, or `auto` / `full`</div>
</ResponseField>

<ResponseField name="hideAbove">
Hide once the container is wider than this.
<div className="ref-takes">CSS `@container` · takes a [scale step](/reference/scales), or a page-width name, or `auto` / `full`</div>
</ResponseField>

## Surface

```yaml
style: { background: surface.base, border: subtle, radius: lg }
```

<ResponseField name="background">
Background colour.
<div className="ref-takes">CSS `background` · takes a `color` token name</div>
</ResponseField>

<ResponseField name="radial">
A radial gradient background.
<div className="ref-takes">CSS `radial-gradient()`</div>
</ResponseField>

<ResponseField name="border">
All four borders.
<div className="ref-takes">CSS `border`</div>
</ResponseField>

<ResponseField name="borderTop">
The top border alone.
<div className="ref-takes">CSS `border-top`</div>
</ResponseField>

<ResponseField name="borderRight">
The right border alone.
<div className="ref-takes">CSS `border-right`</div>
</ResponseField>

<ResponseField name="borderBottom">
The bottom border alone.
<div className="ref-takes">CSS `border-bottom`</div>
</ResponseField>

<ResponseField name="borderLeft">
The left border alone.
<div className="ref-takes">CSS `border-left`</div>
</ResponseField>

<ResponseField name="outline">
A ring drawn outside the border, usually for focus.
<div className="ref-takes">CSS `outline`</div>
</ResponseField>

<ResponseField name="shadow">
Drop shadow.
<div className="ref-takes">CSS `box-shadow` · takes a `shadow` token name</div>
</ResponseField>

<ResponseField name="radius">
Corner rounding on all four corners.
<div className="ref-takes">CSS `border-radius` · takes a `radius` token name</div>
</ResponseField>

<ResponseField name="radiusTopLeft">
One corner's rounding.
<div className="ref-takes">CSS `border-top-left-radius` · takes a `radius` token name</div>
</ResponseField>

<ResponseField name="radiusTopRight">
One corner's rounding.
<div className="ref-takes">CSS `border-top-right-radius` · takes a `radius` token name</div>
</ResponseField>

<ResponseField name="radiusBottomLeft">
One corner's rounding.
<div className="ref-takes">CSS `border-bottom-left-radius` · takes a `radius` token name</div>
</ResponseField>

<ResponseField name="radiusBottomRight">
One corner's rounding.
<div className="ref-takes">CSS `border-bottom-right-radius` · takes a `radius` token name</div>
</ResponseField>

## Type

```yaml
style: { font: headline.lg, weight: semibold, color: text.primary }
```

<ResponseField name="font">
A text style, such as `headline.lg`.
<div className="ref-takes">CSS `font / font-size` · takes a `text` token name</div>
</ResponseField>

<ResponseField name="weight">
Font weight.
<div className="ref-takes">CSS `font-weight`</div>
</ResponseField>

<ResponseField name="lineHeight">
Line height.
<div className="ref-takes">CSS `line-height` · takes a `lineHeight` token name</div>
</ResponseField>

<ResponseField name="color">
Text colour.
<div className="ref-takes">CSS `color` · takes a `color` token name</div>
</ResponseField>

<ResponseField name="textAlign">
Text alignment within its box.
<div className="ref-takes">CSS `text-align`</div>
</ResponseField>

## Media

```yaml
style: { fit: cover }
```

<ResponseField name="fit">
How an image fills its box.
<div className="ref-takes">CSS `object-fit`</div>
</ResponseField>

## Motion

```yaml
style: { transition: fast, cursor: pointer }
```

<ResponseField name="transform">
A visual transform, such as a scale or a nudge.
<div className="ref-takes">CSS `transform`</div>
</ResponseField>

<ResponseField name="transition">
Which property changes are animated, and how fast.
<div className="ref-takes">CSS `transition`</div>
</ResponseField>

<ResponseField name="animation">
A named keyframe animation from `semantic/keyframes.yaml`.
<div className="ref-takes">CSS `animation`</div>
</ResponseField>

<ResponseField name="animationDelay">
How long to wait before the animation starts.
<div className="ref-takes">CSS `animation-delay`</div>
</ResponseField>

<ResponseField name="cursor">
The pointer shown on hover.
<div className="ref-takes">CSS `cursor`</div>
</ResponseField>

## Conditional

```yaml
style:
  background: surface.base
  hover: { background: surface.raised }
  when:
    - field: deltaPositive
      eq: true
      apply:
        color: status.success
```

<ResponseField name="hover">
A patch of styles applied while the pointer is over the element.
<div className="ref-takes">CSS `:hover`</div>
</ResponseField>

<ResponseField name="active">
A patch applied while the element is being pressed.
<div className="ref-takes">CSS `:active`</div>
</ResponseField>

<ResponseField name="disabled">
A patch applied while the element is disabled.
<div className="ref-takes">CSS `:disabled`</div>
</ResponseField>

<ResponseField name="when">
A list of conditions, each applying its own style patch when it matches.
<div className="ref-takes">CSS `(conditional)`</div>
</ResponseField>

## Next steps

<Card title="Scales" icon="ruler" href="/reference/scales" horizontal>
Every value these keys accept, with what it resolves to.
</Card>

<Card title="Styles and tokens" icon="palette" href="/design/styles-and-tokens" horizontal>
Where the values come from, and how a rebrand works.
</Card>
