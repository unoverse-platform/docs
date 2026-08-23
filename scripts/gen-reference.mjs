#!/usr/bin/env node
/**
 * gen-reference — build the Reference tab from the SDK conformance schema.
 *
 * The schema at packages/sdk/conformance/schema is the contract every SDK must pass, so
 * it is the only list that cannot be wrong. This script reads the SHAPE from there and
 * the WORDS from reference/_content.yaml, and REFUSES to write when the two disagree.
 *
 * Why it refuses rather than warns: two hand-maintained lists (the linter's
 * vocabulary.mjs and this schema) stayed in sync with each other and both drifted from
 * the prose. `Select` and `Orb` shipped as primitives while every page said the set was
 * sixteen. A warning would have scrolled past. A failed build does not. On its first run
 * it also caught two style keys the author had invented (`opacity`, `prose`).
 *
 * THE TAILWIND RULE: a reference must never send the reader to look up a second thing.
 * So accepted values are printed inline, resolved. Four machine sources carry them, and
 * none of them is prose:
 *   vocabulary.mjs TOKEN_KEYS     which token family a key takes
 *   vocabulary.mjs DIMENSION_KEYS which keys take a scale step
 *   styles/base/spacing.yaml      the steps, with the rem each resolves to
 *   styles/semantic/*.yaml        page widths and app sizes, same
 * Versions come from diffing definition-1.0/1.1/1.2, so "Added in" is free.
 *
 * Run: npm run gen-reference
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const DOCS = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = join(DOCS, "../..");
const SCHEMA_DIR = join(REPO, "packages/sdk/conformance/schema");
const STYLES = join(REPO, "apps/unoverse/design/marketplace/styles");
const OUT = join(DOCS, "reference");
const VERSIONS = ["1.0", "1.1", "1.2"];
const CURRENT = VERSIONS[VERSIONS.length - 1];

const readSchema = (v) => JSON.parse(readFileSync(join(SCHEMA_DIR, `definition-${v}.schema.json`), "utf8"));
const readTokens = (p) => parse(readFileSync(join(STYLES, `${p}.yaml`), "utf8"));

const schema = readSchema(CURRENT);
const content = parse(readFileSync(join(OUT, "_content.yaml"), "utf8"));
const { TOKEN_KEYS, DIMENSION_KEYS } = await import(
  join(REPO, "packages/base/src/lint/design/vocabulary.mjs")
);

const primitives = schema.definitions.node.properties.type.enum;
const styleKeys = schema.definitions.style.propertyNames.enum;

// ── The guard ─────────────────────────────────────────────────────────────────
const problems = [];
function reconcile(kind, fromSchema, fromContent) {
  for (const n of fromSchema.filter((x) => !fromContent[x]))
    problems.push(`${kind}: schema has "${n}", _content.yaml does not describe it`);
  for (const n of Object.keys(fromContent).filter((x) => !fromSchema.includes(x)))
    problems.push(`${kind}: _content.yaml describes "${n}", the schema does not have it`);
}
reconcile("primitive", primitives, content.primitives);
reconcile("style key", styleKeys, content.styleKeys);
if (problems.length) {
  console.error("✗ reference is out of date with the schema:\n");
  for (const p of problems) console.error(`  ${p}`);
  console.error(`\nSchema: packages/sdk/conformance/schema/definition-${CURRENT}.schema.json`);
  console.error("Describe the new entries in packages/docs/reference/_content.yaml, then re-run.");
  process.exit(1);
}

// ── Derived facts ─────────────────────────────────────────────────────────────
/** First version each name appeared in. */
function addedIn(pick) {
  const seen = {};
  for (const v of VERSIONS) for (const n of pick(readSchema(v))) if (!seen[n]) seen[n] = v;
  return seen;
}
const primitiveAdded = addedIn((s) => s.definitions.node.properties.type.enum);

/** Schema-declared companion requirements, e.g. Switch needs `on` + `cases`. */
const requires = {};
for (const rule of schema.definitions.node.allOf ?? []) {
  const t = rule.if?.properties?.type?.const;
  if (t && rule.then?.required) requires[t] = rule.then.required;
}

const scale = readTokens("base/spacing").space;
const steps = Object.keys(scale);
const pageWidths = Object.fromEntries(
  Object.entries(readTokens("semantic/layout").layout).filter(([k]) => !k.startsWith("$")),
);
const appSizes = Object.fromEntries(
  Object.entries(readTokens("semantic/app-sizes").appSize).filter(([k]) => !k.startsWith("$")),
);

const PAGE_WIDTH_KEYS = new Set(["maxWidth", "hideBelow", "hideAbove", "stackBelow"]);

/** What this key accepts, in the reader's terms, derived not written. */
function accepts(key) {
  const family = TOKEN_KEYS[key];
  if (family) return `a \`${family}\` token name`;
  if (DIMENSION_KEYS.has(key)) {
    const extra = PAGE_WIDTH_KEYS.has(key) ? ", or a page-width name" : "";
    return `a [scale step](/reference/scales)${extra}, or \`auto\` / \`full\``;
  }
  return null;
}

// ── Emit ──────────────────────────────────────────────────────────────────────
function page({ file, sidebar, title, description, body, next }) {
  writeFileSync(
    join(OUT, file),
    `---
sidebarTitle: "${sidebar}"
title: "${title}"
---

${description}

<Note>
Generated from \`definition-${CURRENT}.schema.json\`, the contract every unoverse SDK is
tested against, and from the token files themselves. It cannot describe something the
platform does not have, and the values below are the values that ship.
</Note>

${body}## Next steps

${next}
`,
  );
  console.log(`  reference/${file}`);
}

const grouped = (names, source) => {
  const g = new Map();
  for (const n of names) {
    const k = source[n].group;
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(n);
  }
  return g;
};

// Primitives
let body = "";
for (const [group, names] of grouped(primitives, content.primitives)) {
  body += `## ${group}\n\n`;
  for (const n of names) {
    const labels = [];
    if (requires[n]) labels.push(`requires ${requires[n].join(" + ")}`);
    if (primitiveAdded[n] !== VERSIONS[0]) labels.push(`added in ${primitiveAdded[n]}`);
    const post = labels.length ? ` post={${JSON.stringify(labels)}}` : "";
    body += `<ResponseField name="${n}" type="primitive"${post}>\n${content.primitives[n].summary}\n</ResponseField>\n\n`;
  }
}
page({
  file: "primitives.md",
  sidebar: "Primitives",
  title: "Primitives",
  description: `The complete set a definition may compose from. It is closed: a renderer meeting an unknown
type would have nothing to draw, so adding to it is a change to every SDK.`,
  body,
  next: `<Card title="Style keys" icon="palette" href="/reference/style-keys" horizontal>
Every key a \`style\` block accepts, and what each one takes.
</Card>

<Card title="Components" icon="square-dashed" href="/design/components" horizontal>
How these compose into something an Agent can send.
</Card>`,
});

// Style keys
body = "";
for (const [group, names] of grouped(styleKeys, content.styleKeys)) {
  body += `## ${group}\n\n`;
  for (const n of names) {
    const c = content.styleKeys[n];
    const post = c.css ? ` post={${JSON.stringify([c.css])}}` : "";
    const takes = accepts(n);
    body += `<ResponseField name="${n}" type="style key"${post}>\n${c.summary}${
      takes ? `\n\nTakes ${takes}.` : ""
    }\n</ResponseField>\n\n`;
  }
}
page({
  file: "style-keys.md",
  sidebar: "Style keys",
  title: "Style keys",
  description: `Every key a \`style\` block accepts. The set is closed, so an unknown key is ignored by every
renderer and is always a typo or a web-ism that would not port. The badge on the right is the
CSS property it maps to, for when you know the CSS name and not ours.`,
  body,
  next: `<Card title="Scales" icon="ruler" href="/reference/scales" horizontal>
Every value these keys accept, with what it resolves to.
</Card>

<Card title="Styles and tokens" icon="palette" href="/design/styles-and-tokens" horizontal>
Where the values come from, and how a rebrand works.
</Card>`,
});

// Scales
const table = (rows) =>
  `| Name | Resolves to | |\n|---|---|---|\n${rows
    .map(([n, v, d]) => `| \`${n}\` | \`${v}\` | ${d || ""} |`)
    .join("\n")}\n\n`;

body =
  `## The space scale\n\n` +
  `One scale serves spacing and element size alike, Tailwind-style: step N is N × 0.25rem.\n` +
  `Only these steps exist. An invented one such as \`26\` is not rounded, it falls through as\n` +
  `broken CSS and the element silently reverts to auto sizing.\n\n` +
  table(steps.map((s) => [s, scale[s].$value, ""])) +
  `## Page widths\n\n` +
  `Aliases onto the same scale, so a page-level cap reads as what it is. The rule that keeps\n` +
  `one value from having two spellings: a PAGE-level cap uses a name, an element's own size\n` +
  `stays a step.\n\n` +
  table(Object.entries(pageWidths).map(([n, v]) => [n, v.$value, v.$description ?? ""])) +
  `## App sizes\n\n` +
  `The named widths an app's \`appWidth\` references. Each carries a viewport ceiling, so a\n` +
  `panel is its designed width on a desktop and never wider than a phone.\n\n` +
  table(Object.entries(appSizes).map(([n, v]) => [n, v.$value, v.$description ?? ""]));

page({
  file: "scales.md",
  sidebar: "Scales",
  title: "Scales",
  description: `Every dimension value a definition may use, and what each one resolves to. These are read
straight from the token files, so this page is what actually ships.`,
  body,
  next: `<Card title="Style keys" icon="palette" href="/reference/style-keys" horizontal>
The keys these values go with.
</Card>

<Card title="Styles and tokens" icon="palette" href="/design/styles-and-tokens" horizontal>
The layers behind these, and how to retune them for a brand.
</Card>`,
});

console.log(
  `\n✓ ${primitives.length} primitives, ${styleKeys.length} style keys, ${steps.length} scale steps, from schema v${CURRENT}`,
);
