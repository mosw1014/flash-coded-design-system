#!/usr/bin/env node
// Keeps the doc-site's semantic COLOUR table (`const SEM`) honest by
// GENERATING its per-theme hex values from the real CSS custom properties
// (`:root` + the `[data-brand="flash"][data-theme="light"|"dark"]` blocks),
// instead of trusting hand-typed values that silently drift from the CSS the
// browser actually paints with.
//
// Same philosophy as the AI-context tabs (AI-CONTEXT.md, CLAUDE.md rule 5):
// the CSS is the single source of truth, the display table is a GENERATED
// artifact of it, and a pre-commit hook re-derives it on every commit so it
// can never quietly go stale. The token NAMES and human descriptions in SEM
// stay hand-authored (they're editorial); only the colour VALUES are derived.
//
// It also VALIDATES that every `var(--token)` referenced anywhere in the
// stylesheet is actually declared — catching a broken/renamed token at commit
// time instead of as an invisible wrong colour in the running page.
//
// Usage:
//   node scripts/sync-token-tables.mjs           # rewrite SEM values in place + validate
//   node scripts/sync-token-tables.mjs --check    # validate only, no write (non-zero exit on drift/errors)
//   node scripts/sync-token-tables.mjs --quiet     # suppress the "in sync" success line
//
// Exit non-zero when: a referenced token isn't declared, a SEM colour token
// isn't declared in CSS, or (in --check) SEM values are out of sync with CSS.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}
const CHECK = process.argv.includes('--check');
const QUIET = process.argv.includes('--quiet');
const filePath = path.resolve(arg('file', 'index.html'));

function fail(msg) {
  console.error(`[sync-token-tables] ${msg}`);
  process.exit(1);
}

const src = readFileSync(filePath, 'utf8');

/* ---------------------------------------------------------------------------
   1. Parse the CSS custom-property declaration blocks.
   :root holds the raw --prim-* palette; each theme block holds the semantic
   --color-* / --chrome-* / etc. tokens (usually pointing at a --prim-* via var()).
--------------------------------------------------------------------------- */
function parseBlock(selectorRegex) {
  const m = src.match(selectorRegex);
  if (!m) fail(`could not find CSS block: ${selectorRegex}`);
  // From the matched "{" walk to its matching "}".
  const start = m.index + m[0].length - 1; // at the "{"
  let depth = 0, end = -1;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) fail(`unterminated CSS block: ${selectorRegex}`);
  const body = src.slice(start + 1, end);
  const map = new Map();
  // --name: value;  (value may contain var(), rgba(), commas, etc.)
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let d;
  while ((d = re.exec(body)) !== null) map.set(d[1], d[2].trim());
  return map;
}

const root = parseBlock(/:root\s*\{/);
const light = parseBlock(/\[data-brand="flash"\]\[data-theme="light"\]\s*\{/);
const dark = parseBlock(/\[data-brand="flash"\]\[data-theme="dark"\]\s*\{/);

// Merged lookup per theme: theme tokens win, fall back to :root primitives.
const scopes = {
  light: new Map([...root, ...light]),
  dark: new Map([...root, ...dark]),
};

/* Resolve a token to a concrete value by expanding var() chains within a scope. */
function resolve(token, scope, seen = new Set()) {
  if (seen.has(token)) fail(`cyclic token reference at ${token}`);
  seen.add(token);
  let val = scope.get(token);
  if (val == null) return null;
  // Expand any var(--x[, fallback]) occurrences.
  const varRe = /var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/i;
  let guard = 0;
  while (varRe.test(val)) {
    if (guard++ > 50) fail(`var() expansion runaway at ${token}`);
    val = val.replace(varRe, (_, ref, fb) => {
      const r = resolve(ref, scope, new Set(seen));
      if (r != null) return r;
      if (fb != null) return fb.trim();
      fail(`token ${token} references undeclared ${ref}`);
    });
  }
  return val.trim();
}

/* ---------------------------------------------------------------------------
   2. Locate `const SEM = { ... };` and regenerate each row's light/dark hex.
   Row shape (unchanged): ['--token','<light>','<dark>','<b2-light>','<b2-dark>','note']
   Only columns 2 (light) and 3 (dark) — the Flash values the renderer actually
   reads — are derived; the token name, the legacy brand-2 columns, and the note
   are preserved verbatim.
--------------------------------------------------------------------------- */
const semStart = src.indexOf('const SEM = {');
if (semStart === -1) fail('could not find `const SEM = {`');
const semEnd = src.indexOf('\n};', semStart);
if (semEnd === -1) fail('could not find end of SEM object');
const semBlock = src.slice(semStart, semEnd + 3);

const rowRe = /\['(--[a-z0-9-]+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\]/gi;
const problems = [];
const drifts = [];

const newSemBlock = semBlock.replace(rowRe, (full, token, oldL, oldD, b2l, b2d, note) => {
  const rl = resolve(token, scopes.light);
  const rd = resolve(token, scopes.dark);
  if (rl == null || rd == null) {
    problems.push(`SEM token ${token} is not declared in the Flash ${rl == null ? 'light' : 'dark'} theme CSS`);
    return full; // leave untouched; validation will fail below
  }
  if (rl !== oldL || rd !== oldD) {
    drifts.push(`${token}: light ${oldL} -> ${rl}${oldD !== rd ? ` , dark ${oldD} -> ${rd}` : ''}`);
  }
  return `['${token}','${rl}','${rd}','${b2l}','${b2d}','${note}']`;
});

/* ---------------------------------------------------------------------------
   3. Validate: every var(--token) referenced in real CSS must be declared.
   Scoped to the <style> blocks only — token names quoted in JS data (SEM),
   copied into AI-context <pre> blobs, or written in changelog/doc prose are
   not live CSS and must not count as declarations OR references.
--------------------------------------------------------------------------- */
const css = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
// A token counts as DECLARED if it's set anywhere as a custom property — a CSS
// (or inline-style-template) `--x:` declaration, OR a runtime JS setProperty
// call. Several components (chips, buttons) set their per-variant colours via
// JS inline custom properties rather than a static CSS class, so those are
// legitimate declarations even though they're not in a <style> block.
const declared = new Set();
for (const m of src.matchAll(/(--[a-z0-9-]+)\s*:/g)) declared.add(m[1]);
for (const m of src.matchAll(/setProperty\(\s*['"`](--[a-z0-9-]+)/g)) declared.add(m[1]);
// REFERENCES are only counted from real CSS (<style> blocks): a token name
// quoted in JS data, copied into an AI-context <pre> blob, or written in
// changelog/doc prose is not a live var() reference.
const referenced = new Map(); // token -> offset
for (const m of css.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
  const t = m[1];
  if (!referenced.has(t)) referenced.set(t, m.index);
}
const undeclared = [...referenced.keys()].filter(t => !declared.has(t) && !t.startsWith('--_'));
for (const t of undeclared) problems.push(`token ${t} is referenced via var() in CSS but never declared (CSS or JS)`);

/* ---------------------------------------------------------------------------
   4. Report / write.
--------------------------------------------------------------------------- */
if (problems.length) {
  console.error('[sync-token-tables] token validation FAILED:');
  for (const p of problems) console.error('  • ' + p);
  process.exit(1);
}

if (CHECK) {
  if (drifts.length) {
    console.error('[sync-token-tables] SEM colour table is OUT OF SYNC with the CSS:');
    for (const d of drifts) console.error('  • ' + d);
    console.error('  Run: node scripts/sync-token-tables.mjs   (then re-commit)');
    process.exit(1);
  }
  if (!QUIET) console.log('[sync-token-tables] ✓ token references valid; SEM colour table in sync with CSS');
  process.exit(0);
}

if (drifts.length) {
  const out = src.slice(0, semStart) + newSemBlock + src.slice(semEnd + 3);
  writeFileSync(filePath, out);
  if (!QUIET) {
    console.log('[sync-token-tables] regenerated SEM colour values from CSS:');
    for (const d of drifts) console.log('  • ' + d);
  }
} else if (!QUIET) {
  console.log('[sync-token-tables] ✓ token references valid; SEM colour table already in sync');
}
