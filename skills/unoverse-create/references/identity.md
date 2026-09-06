# Playbook: fill an org's identity

**Read first:** [Identity](https://docs.unoverse.ai/design/identity.md). The shape of the
four documents, where they go when published, and how a node reads them.

**Exemplar:** the four shipped with every new project, briefs written and defaults empty,
under `design/<project>/identity/`.

## The diagnostic that matters most

If a field seems to need a fifth document, a new prop, or a changed brief, stop. The job
is to fill `default` values. The documents, their props, their briefs and their manifests
stay as shipped.

## The rules that bite

1. **Read every brief in the file before writing a word.** The brief names the sources, the
   length, and what not to do. It is the whole instruction.
2. **The organisation's own publications are the only sources.** Its website, its investor
   relations, its annual and quarterly reports, its press releases, its official profiles
   with regulators and exchanges. Third-party articles, encyclopedias, reviews and analyst
   pages are not sources.
3. **Copy names as the organisation writes them.** Products, programmes, units, terms,
   capitalisation. Never paraphrase a name.
4. **A field the sources do not answer stays empty.** An empty string or an empty list.
   Never fill space, never infer from the industry.
5. **Respect `maxLength` and `maxItems`.** Quote where the brief says quote.
6. **Trees keep their shape.** `units`, `brands` and `goals` are lists of `{ name, what }` or
   `{ name, why }`, nested under the same key only where the organisation nests them.
   `values` is a flat list of `{ name, what }`.

## Order

`organisation` first. Its `what` and `vocabulary` ground every extraction and every Agent
that runs as this project. Then `purpose`, then `brand`, because the brand represents the
purpose and its `represents` field is written against it. Then `story`.

## Done when

Every `default` the sources can answer is filled, every one they cannot is empty, the lint
is clean, and the project is published. The Identity page above says what publishing does.
