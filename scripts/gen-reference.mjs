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
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import Ajv from "ajv";

// OUTPUT IS OPT-IN, and that is the whole safety mechanism. The docs lane publishes by
// `rsync -a --delete packages/docs/ → the deploy repo` (scripts/lib/publish.sh), so every .md
// under packages/docs becomes a live URL whether or not it is committed or linked in the nav.
// A script and a content file are harmless there (copy-check.mjs already ships); PAGES are not.
// So this writes to a scratch dir unless you pass --publish, which is the moment a human
// decides those URLs should exist.
const HERE = dirname(fileURLToPath(import.meta.url));
const DOCS = join(HERE, "..");
const REPO = join(DOCS, "../..");
const PUBLISH = process.argv.includes("--publish");
const SCHEMA_DIR = join(REPO, "packages/sdk/conformance/schema");
const STYLES = join(REPO, "apps/unoverse/design/marketplace/styles");
// The preview goes to the OS temp dir, NOT anywhere under packages/docs. rsync excludes only
// .git/, node_modules/, .turbo/ and .DS_Store, so a dotfolder here would ship exactly like a
// normal one — which is how three unlinked pages reached the live site on 2026-08-23.
const OUT = PUBLISH ? join(DOCS, "reference") : join(tmpdir(), "unoverse-reference-preview");
mkdirSync(OUT, { recursive: true }); // build output is disposable: recreate it rather than require it
const VERSIONS = ["1.0", "1.1", "1.2", "1.3"];
const CURRENT = VERSIONS[VERSIONS.length - 1];

const readSchema = (v) => JSON.parse(readFileSync(join(SCHEMA_DIR, `definition-${v}.schema.json`), "utf8"));
const readTokens = (p) => parse(readFileSync(join(STYLES, `${p}.yaml`), "utf8"));

const schema = readSchema(CURRENT);
const content = parse(readFileSync(join(HERE, "reference-content.yaml"), "utf8"));
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
  console.error("Describe the new entries in packages/docs/scripts/reference-content.yaml, then re-run.");
  process.exit(1);
}

// ── Examples are validated, not trusted ──────────────────────────────────────
// An example is hand-written, so it is the one part of this page that CAN rot. Checking
// each one against the schema's own `node` definition closes that: an example using a
// field the contract dropped fails the build exactly like a missing description does.
const ajv = new Ajv({ allErrors: true, strict: false });
// Compile the node definition ALONE. Spreading the root schema drags in its envelope
// rules (unoverse/kind/name/root), which a single node fragment can never satisfy.
const validateNode = ajv.compile({ $ref: "#/definitions/node", definitions: schema.definitions });
for (const [name, entry] of Object.entries(content.primitives)) {
  if (!entry.example) {
    problems.push(`primitive: "${name}" has no example`);
    continue;
  }
  let parsed;
  try {
    parsed = parse(entry.example);
  } catch (e) {
    problems.push(`primitive: "${name}" example is not valid YAML — ${e.message}`);
    continue;
  }
  if (!validateNode(parsed))
    problems.push(
      `primitive: "${name}" example fails the schema — ` +
        validateNode.errors.map((e) => `${e.instancePath || "/"} ${e.message}`).join("; "),
    );
}
if (problems.length) {
  console.error("✗ reference examples do not match the schema:\n");
  for (const p of problems) console.error(`  ${p}`);
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

<div className="ref-source">
Generated from <code>definition-${CURRENT}.schema.json</code> and the token files, so it
cannot fall behind what ships.
</div>

${body}## Next steps

${next}
`,
  );
  console.log(`  ${PUBLISH ? join("packages/docs/reference", file) : join(OUT, file)}`);
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
    body += `<ResponseField name="${n}"${post}>\n${content.primitives[n].summary}\n\n\`\`\`yaml\n${content.primitives[n].example.trim()}\n\`\`\`\n</ResponseField>\n\n`;
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
  const ex = content.styleGroups?.[group];
  if (ex) body += `\`\`\`yaml\n${ex.trim()}\n\`\`\`\n\n`;
  for (const n of names) {
    const c = content.styleKeys[n];
    const takes = accepts(n);
    const meta = [c.css ? `CSS \`${c.css}\`` : null, takes ? `takes ${takes}` : null].filter(Boolean);
    body += `<ResponseField name="${n}">\n${c.summary}${
      meta.length ? `\n<div className="ref-takes">${meta.join(" · ")}</div>` : ""
    }\n</ResponseField>\n\n`;
  }
}
page({
  file: "style-keys.md",
  sidebar: "Style keys",
  title: "Style keys",
  description: `Every key a \`style\` block accepts. The set is closed, so an unknown key is ignored by every
renderer and is always a typo or a web-ism that would not port. Each entry names the CSS
property it maps to, for when you know the CSS name and not ours.`,
  body,
  next: `<Card title="Scales" icon="ruler" href="/reference/scales" horizontal>
Every value these keys accept, with what it resolves to.
</Card>

<Card title="Styles and tokens" icon="palette" href="/design/styles-and-tokens" horizontal>
Where the values come from, and how a rebrand works.
</Card>`,
});

// Scales
/** `{space.120}` is an alias, and an alias is not a value. Print what it resolves to. */
const resolve = (v) => {
  const alias = String(v).match(/^\{space\.([\w.]+)\}$/);
  return alias && scale[alias[1]] ? `${scale[alias[1]].$value}` : String(v);
};

const table = (rows) => {
  const noted = rows.some(([, , d]) => d);
  const head = noted ? `| Name | Resolves to | |\n|---|---|---|` : `| Name | Resolves to |\n|---|---|`;
  return `${head}\n${rows
    .map(([n, v, d]) => (noted ? `| \`${n}\` | \`${resolve(v)}\` | ${d || ""} |` : `| \`${n}\` | \`${resolve(v)}\` |`))
    .join("\n")}\n\n`;
};

body =
  "```yaml\n" +
  'style: { padding: "6", gap: "3", width: "20" }   # steps\n' +
  "style: { maxWidth: reading }                     # a page width by name\n" +
  "appWidth: rail                                   # an app size by name\n" +
  "```\n\n" +
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

if (!PUBLISH) console.log("\nPreview only. Pass --publish to write into packages/docs/reference (those become live URLs).");
