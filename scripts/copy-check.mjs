#!/usr/bin/env node
/**
 * copy-check — the mechanical half of docs/doc-control/DOCS_AND_SKILLS_RULES.md.
 *
 * Every rule here is one that was BROKEN on a real page, so this is a record of actual
 * mistakes rather than a wish list. It catches what a regex can see: casing, banned
 * constructions, sentence length, colours, markup shape. It cannot judge whether a
 * sentence carries a fact, which is why §The checklist still has to be read.
 *
 * Run: npm run copy-check   (exits 1 on any error, 0 on warnings alone)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const KITS = ["onboarding", "design", "nodes", "architecture", "runbooks"];
const PALETTE = ["#6d5df6", "#8b7ef8", "#4c3fd1"];

const findings = [];
const add = (level, file, line, rule, detail) =>
  findings.push({ level, file, line, rule, detail });

/** Body prose only: fenced code, inline code, links and JSX attributes are not copy. */
function proseLines(src) {
  const out = [];
  let fenced = false;
  src.split("\n").forEach((raw, i) => {
    if (/^\s*```/.test(raw)) { fenced = !fenced; return; }
    if (fenced) return;
    if (/^\s*[-|]/.test(raw) && raw.includes("|")) return;   // table rows
    const text = raw
      .replace(/`[^`]*`/g, " ")                              // inline code
      .replace(/\]\([^)]*\)/g, "]")                          // link targets
      .replace(/<[^>]+>/g, " ");                             // JSX/HTML tags
    out.push({ n: i + 1, raw, text });
  });
  return out;
}

function checkMarkdown(file) {
  const src = readFileSync(file, "utf8");
  const rel = relative(ROOT, file);
  const lines = proseLines(src);

  for (const { n, raw, text } of lines) {
    if (text.includes("—") || text.includes("–"))
      add("error", rel, n, "no em dashes", text.trim().slice(0, 70));

    const construction = text.match(/\b(This is what|That's what|That is what)\b/i);
    if (construction)
      add("error", rel, n, "banned construction", construction[1]);

    // Product names are bold and LOWERCASE. Two exemptions, both from the rulebook:
    // a bare "Studio" is usually a UI label, and a name the reader is told to CLICK is a
    // label too ("Choose **Studio**" is the option in `unoverse create`).
    const bolded = text.match(/\*\*(Studio|Canvas|Spatial|Marketplace)\*\*/);
    const isUiLabel = /\b(choose|select|click|press|open)\b[^.]*$/i.test(
      text.slice(0, text.indexOf(bolded?.[0] ?? "\u0000")),
    );
    if (bolded && !isUiLabel)
      add("error", rel, n, "product name is lowercase", `**${bolded[1]}**`);

    if (/\bUnoverse\b/.test(text))
      add("error", rel, n, "brand is lowercase", "Unoverse");

    // A command the reader RUNS belongs in a code block. Inline is for commands discussed.
    const inlineCmd = raw.match(/(?:^|\s)(?:Run|run|Open .* with|Then run)\s+`(unoverse [a-z][a-z -]*)`/);
    if (inlineCmd)
      add("warn", rel, n, "run-command should be a code block", inlineCmd[1]);
  }

  // Sentence length, measured across the paragraph rather than the line
  const prose = lines.map((l) => l.text).join(" ");
  for (const s of prose.split(/(?<=[.!?])\s+/)) {
    const words = s.trim().split(/\s+/).filter(Boolean);
    if (words.length > 28) {
      const at = lines.find((l) => l.text.includes(words.slice(0, 4).join(" ")));
      add("warn", rel, at?.n ?? 1, `sentence is ${words.length} words`, s.trim().slice(0, 70));
    }
  }

  // Next steps: bare horizontal cards. A CardGroup lays them out two-up.
  const next = src.indexOf("## Next steps");
  if (next !== -1) {
    const tail = src.slice(next);
    if (tail.includes("<CardGroup"))
      add("error", rel, src.slice(0, next).split("\n").length, "Next steps", "remove the CardGroup wrapper");
    const cards = (tail.match(/<Card /g) || []).length;
    if (cards > 3)
      add("warn", rel, src.slice(0, next).split("\n").length, "Next steps", `${cards} cards, two is the norm`);
  }
}

function checkCss(file) {
  const rel = relative(ROOT, file);
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    if (/^\s*(\/\*|\*)/.test(line)) return;
    for (const hex of line.match(/#[0-9a-fA-F]{6}\b/g) || []) {
      const h = hex.toLowerCase();
      // greys are neutral and always allowed; hues must be brand
      const [r, g, b] = [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
      const neutral = Math.max(r, g, b) - Math.min(r, g, b) < 24;
      if (!neutral && !PALETTE.includes(h))
        add("error", rel, i + 1, "colour outside the palette", hex);
    }
  });
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (extname(full) === ".md") checkMarkdown(full);
  }
}

for (const kit of KITS) {
  try { walk(join(ROOT, kit)); } catch { /* kit not present */ }
}
checkMarkdown(join(ROOT, "index.md"));
checkCss(join(ROOT, "style.css"));

const errors = findings.filter((f) => f.level === "error");
const warns = findings.filter((f) => f.level === "warn");

for (const f of [...errors, ...warns]) {
  const tag = f.level === "error" ? "✗" : "!";
  console.log(`${tag} ${f.file}:${f.line}  ${f.rule}  ${f.detail}`);
}

console.log(
  findings.length
    ? `\n${errors.length} error(s), ${warns.length} warning(s). Rules: docs/doc-control/DOCS_AND_SKILLS_RULES.md`
    : "\n✓ clean",
);
process.exit(errors.length ? 1 : 0);
