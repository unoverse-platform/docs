---
sidebarTitle: "Unoverse Markdown"
title: "Unoverse Markdown"
---

**Markdown is a language for formatting text. Unoverse Markdown is a language for streaming UI.**

Both are things a model writes. Markdown carries prose and nothing else, so it cannot say
"these four figures are a comparison" or "these six paragraphs are a sequence". The reader
gets a wall of text, and each surface guesses at the structure differently.

Unoverse Markdown is written the same way, by a model, in one pass. What comes back is a
list of typed sections rather than a string. The model says what shape each part is, the
design system draws each shape as a real component, and each one renders as it arrives.

---

## Two languages, side by side

| | Markdown | Unoverse Markdown |
|---|---|---|
| Written by | a model, in one pass | a model, in one pass |
| What it produces | one string | a list of typed sections |
| What it can express | headings, bold, bullets | comparison, sequence, question and answer, caveat |
| Who decides the look | the surface, guessing | a designer, once, in an atom |
| What renders | text | components, from the design system |
| Restyling it | find and replace | swap a token |
| On another surface | rewrite the renderer | the same closed list, drawn again |

Markdown styles characters. Unoverse Markdown names meaning, and meaning is what a designer
can act on. A figure the model marks as a key fact becomes a figure the design system knows
how to present, in every place that record appears.

---

## It is still the UI

A section is not a special document format sitting beside your components. Each kind maps
to an atom from the same design system your components are built from.

| Kind | For |
|---|---|
| `prose` | headed paragraphs, and the default for everything else |
| `keyFacts` | standalone figures: a price, a capacity, a timeframe |
| `table` | anything two-dimensional, such as rates by type |
| `list` | enumerable items |
| `steps` | an ordered procedure, where the order matters |
| `callout` | a must-not-miss warning, never a routine qualifier |
| `faq` | question and answer pairs |
| `finePrint` | legal or regulatory caveats |

The kinds name **shapes**, never domains, so the same eight serve a financial product, a
restaurant menu and an e-commerce listing.

What draws them is a served component, so every surface shows the same thing: a card in a
conversation, the content editor, and later an email. Styling lives in tokens. An org
restyles by swapping tokens, and nobody forks an atom to change a colour.

The result is genuine interface rather than formatted text. Enough material with two or more
groups renders as tabs, with ungrouped material above the strip and fine print on every tab.
Long lists and fine print fold by default. None of that is available to a string.

Sections arrive one at a time, so the interface builds downward as the model writes. A
completed section is a finished component, not a fragment waiting for the rest.

---

## Rich UX an LLM can actually produce

The model chooses which kinds, in what order, filled with the source's own words. It chooses
nothing else.

A colour, a size, a font and a layout are not fields it can fill, so a bad one is
unreachable rather than discouraged. What a `keyFacts` strip looks like was decided once, by
a designer. The model reaches sophistication it could never author, by choosing rather than
designing, and the output stays small enough to be fast and small enough to be right.

<Note>
**It is an editor, never an author.** The model receives copy that is already written, and
it may not add a fact, a figure or a claim the source does not state. Writing and
structuring are separate passes, which is what keeps the grounding chain intact.
</Note>

Restraint is part of the instruction. Prose is the default and carries anything Markdown
carries. A document is mostly prose with a little structure in it, and one that is mostly
structure reads as a dashboard.

---

## Two ways to produce one

| | Unoverse Markdown | Unoverse Markdown Template |
|---|---|---|
| Who chooses the components | the model | a designer, up front |
| What the model does | composes and fills | fills |
| Right when | the shape should follow the content | the arrangement is part of the product |

Same vocabulary, same renderer, same output. A document does not know which way made it.

---

## Where the vocabulary comes from

Two sources, deliberately apart.

| Source | Carries |
|---|---|
| The atoms | the vocabulary. Which components exist, and the fields each one has |
| The prompt block | the judgement. When a passage is `steps` rather than prose |

The prompt block never lists the components. A hand-written vocabulary drifts from what
actually renders, so the schema is compiled from the atoms marked `category: markdown`.
Adding an atom offers the model a new component on the next call, with no prompt to edit.

---

**Next**: [Validate and Ship](/design/validate-and-ship)
