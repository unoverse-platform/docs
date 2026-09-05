#!/usr/bin/env node
/**
 * gen-node-reference — the node authoring surface, from the eight node schemas.
 *
 * Nodes never had the hole the design side did: `packages/base/src/lint/nodes/` already
 * validates every node file against `packages/docs/schemas/nodes/*.json`, and those schemas
 * already say what each file is. So there is no contract to build here, only a reference to
 * generate, and 41 of the 56 properties already carry their own description.
 *
 * SHAPE from the schema, WORDS from `node-reference-content.yaml`, and a REFUSAL to write
 * when a field has no copy. The schema's own `description` is deliberately NOT used: those
 * are maintainer notes (`api.run` is 244 words of rationale, and several cite
 * `docs/architecture/DECLARATIVE_NODES.md`, which is never published). Piping them into field
 * cards produced pages nobody could scan and leaked a private path onto five live pages.
 *
 * Output is opt-in (`--publish`) because every .md under packages/docs becomes a live URL on
 * the next release, linked or not.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { parse } from "yaml";

const HERE = dirname(fileURLToPath(import.meta.url));
const DOCS = join(HERE, "..");
const REPO = join(DOCS, "../..");
const SCHEMAS = join(DOCS, "schemas/nodes");
const PUBLISH = process.argv.includes("--publish");
const OUT = PUBLISH ? join(DOCS, "reference") : join(tmpdir(), "unoverse-node-reference-preview");
mkdirSync(OUT, { recursive: true });

const content = parse(readFileSync(join(HERE, "node-reference-content.yaml"), "utf8")) ?? {};

/** One page per file a node author writes. Order is the order you meet them. */
const PAGES = [
  { schema: "node", file: "node.yaml", slug: "node-envelope", title: "node.yaml" },
  { schema: "interface", file: "interface.yaml", slug: "node-interface", title: "interface.yaml" },
  { schema: "api", file: "api/run.yaml", slug: "node-api", title: "api/run.yaml", note: "The `api/` folder holds one file per key below. `run` is `api/run.yaml`, `events` is `api/events.yaml`, and each of those files IS its list — there is no wrapping `run:` or `events:` key inside them." },
  { schema: "config", file: "config.yaml", slug: "node-config", title: "config.yaml" },
  { schema: "credential", file: "credentials/<name>.yaml", slug: "node-credentials", title: "credentials" },
  { schema: "package", file: "package.yaml", slug: "node-package", title: "package.yaml" },
  { schema: "test", file: "test.yaml", slug: "node-test", title: "test.yaml" },
  { schema: "audio", file: "api/audio.yaml", slug: "node-audio", title: "api/audio.yaml" },
  { schema: "api", sub: "events", file: "api/events.yaml", slug: "node-events", title: "api/events.yaml" },
];

const problems = [];
const esc = (s) => String(s).replace(/\n+/g, " ").trim();

/** A readable type, from whatever the schema actually said. */
function typeOf(v) {
  if (!v || typeof v !== "object") return "";
  if (v.enum) return v.enum.map((e) => `\`${e}\``).join(" · ");
  if (v.const !== undefined) return `\`${v.const}\``;
  if (Array.isArray(v.type)) return v.type.join(" | ");
  if (v.type === "array") return `${v.items?.type ?? "object"}[]`;
  return v.type ?? (v.$ref ? v.$ref.split("/").pop() : "object");
}

let written = 0;
for (const page of PAGES) {
  const schema = JSON.parse(readFileSync(join(SCHEMAS, `${page.schema}.schema.json`), "utf8"));
  // A `sub` page documents ONE property's row shape rather than the file's top level.
  const target = page.sub ? schema.properties[page.sub].items : schema;
  const props = target.properties ?? {};
  const required = new Set(target.required ?? []);
  const fill = content[page.sub ?? page.schema] ?? {};

  let body = "";
  for (const [name, spec] of Object.entries(props)) {
    if (name === "$schema") continue;
    const desc = fill[name]; // the schema's own description is maintainer prose, never copy
    if (!desc) {
      problems.push(`${page.sub ?? page.schema} has "${name}", node-reference-content.yaml does not describe it`);
      continue;
    }
    const t = typeOf(spec);
    const post = required.has(name) ? ` post={["required"]}` : "";
    body += `<ResponseField name="${name}"${t ? ` type="${esc(t)}"` : ""}${post}>\n${esc(desc)}\n</ResponseField>\n\n`;
  }

  writeFileSync(
    join(OUT, `${page.slug}.md`),
    `---
sidebarTitle: "${page.title}"
title: "${page.title}"
---

${esc(content.pages?.[page.sub ?? page.schema] ?? "")}${page.note ? `\n\n${esc(page.note)}` : ""}

<div className="ref-source">
Generated from <code>schemas/nodes/${page.schema}.schema.json</code>, the same file the node
linter validates against.
</div>

${content.examples?.[page.sub ?? page.schema] ? `## Example\n\n\`\`\`yaml ${page.file}\n${content.examples[page.sub ?? page.schema].trim()}\n\`\`\`\n\n## Fields\n\n` : ""}${body}## Next steps

<Card title="Building a node" icon="boxes" href="/nodes/overview" horizontal>
The guides behind these fields.
</Card>

<Card title="Troubleshooting" icon="wrench" href="/nodes/troubleshooting" horizontal>
When a node does not do what you wrote.
</Card>
`,
  );
  written++;
}

if (problems.length) {
  console.error("✗ node reference is missing descriptions:\n");
  for (const p of problems) console.error(`  ${p}`);
  console.error("\nAdd them to packages/docs/scripts/node-reference-content.yaml, then re-run.");
  process.exit(1);
}

console.log(`✓ ${written} node reference pages → ${PUBLISH ? "packages/docs/reference" : OUT}`);
if (!PUBLISH) console.log("Preview only. Pass --publish to write into packages/docs/reference.");
