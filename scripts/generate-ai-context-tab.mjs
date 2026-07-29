#!/usr/bin/env node
// Generates (never hand-type) the contents of a per-section AI context tab,
// per the convention documented in AI-CONTEXT.md. Run this after changing a
// component's markup/CSS/JS, then paste the printed <details> block over the
// old one in that section, in the same PR as the change.
//
// Usage:
//   node scripts/generate-ai-context-tab.mjs \
//     --section s-tags \
//     --classes .tag,.tag--sm,.tag--reg,.tag--neutral,.tag--info,.tag--success,.tag--warning,.tag--error,.tag__dot \
//     --consts TAG_VARIANTS,TAG_SIZES \
//     [--status static|js-rendered|placeholder] [--no-reusable-class] [--note "..."] [--file index.html]
//
// This performs the exact extraction + hashing algorithm documented in
// AI-CONTEXT.md's "Keeping this honest" section, so its output's
// contentHash matches what consuming tooling re-derives at read time.

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return process.argv[i + 1];
}
function flag(name) {
  return process.argv.includes(`--${name}`);
}
function fail(msg) {
  console.error(`[generate-ai-context-tab] ${msg}`);
  process.exit(1);
}

const sectionId = arg('section');
const classesArg = arg('classes', '');
const constsArg = arg('consts', '');
const status = arg('status', 'static');
const note = arg('note');
const noReusableClass = flag('no-reusable-class');
const filePath = path.resolve(arg('file', 'index.html'));

if (!sectionId) fail('--section is required, e.g. --section s-tags');
if (!existsSync(filePath)) fail(`file not found: ${filePath}`);

const rawHtml = readFileSync(filePath, 'utf8');

// Strip every existing AI context tab's <pre> contents before extracting
// anything. Without this, a regex search for e.g. "const TAG_VARIANTS ="
// can match the escaped, JSON-encoded COPY of that declaration sitting
// inside an earlier tab (this file's own tabs describe real identifiers by
// name, so those names inevitably appear again, HTML-escaped, inside the
// tab text itself) instead of the real declaration further down the file —
// silently re-encoding already-escaped text and corrupting the output.
const html = rawHtml.replace(/<pre data-ai-context="[^"]*">[\s\S]*?<\/pre>/g, '');

const classNames = classesArg.split(',').map(c => c.trim().replace(/^\./, '')).filter(Boolean);
const constNames = constsArg.split(',').map(c => c.trim()).filter(Boolean);

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Identical bracket-matcher to the design-system-reskin skill's resolver —
// keep these in sync; see AI-CONTEXT.md for why they must produce the same
// hash given the same live source.
function findMatchingClose(html, openIndex) {
  const openChar = html[openIndex];
  const closeChar = { '(': ')', '[': ']', '{': '}' }[openChar];
  let depth = 0;
  let inStr = null;
  for (let i = openIndex; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === openChar) depth++;
    else if (c === closeChar) {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return html.length;
}

function extractConst(html, name) {
  const re = new RegExp(`(?:const|let|var)\\s+${escapeRegex(name)}\\s*=`);
  const m = re.exec(html);
  if (!m) return null;
  let i = m.index + m[0].length;
  while (i < html.length && /\s/.test(html[i])) i++;
  if (html[i] === '{' || html[i] === '[' || html[i] === '(') {
    let end = findMatchingClose(html, i);
    while (end < html.length && /\s/.test(html[end])) end++;
    if (html[end] === ';') end++;
    return html.slice(m.index, end).trim();
  }
  let inStr = null;
  for (; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === ';') { i++; break; }
  }
  return html.slice(m.index, i).trim();
}

function extractFunctionDecl(html, name) {
  const re = new RegExp(`function\\s+${escapeRegex(name)}\\s*\\(`);
  const m = re.exec(html);
  if (!m) return null;
  const parenIdx = m.index + m[0].length - 1;
  const afterParams = findMatchingClose(html, parenIdx);
  let i = afterParams;
  while (i < html.length && /\s/.test(html[i])) i++;
  if (html[i] !== '{') return html.slice(m.index, afterParams).trim();
  const afterBody = findMatchingClose(html, i);
  return html.slice(m.index, afterBody).trim();
}

// Pull every CSS rule (across ALL <style> blocks — this file has more than
// one) whose selector references one of the given class names.
function extractCss(html, classNames) {
  const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const boundaries = classNames.map(cls => new RegExp(`\\.${escapeRegex(cls)}(?![\\w-])`));
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  const seen = new Set();
  let out = [];
  let m;
  while ((m = ruleRe.exec(css))) {
    const selector = m[1].trim();
    if (!selector || selector.startsWith('@')) continue;
    if (boundaries.some(re => re.test(selector)) && !seen.has(selector)) {
      seen.add(selector);
      out.push(`${selector} { ${m[2].trim()} }`);
    }
  }
  return out.join('\n');
}

// Slice out just this section's own HTML (start tag through the next
// top-level <section class="sec...">, or EOF) — same boundary logic as the
// design-system-reskin skill's resolver.
function extractSectionHtml(html, sectionId) {
  const startRe = new RegExp(`<section class="sec[^"]*" id="${escapeRegex(sectionId)}">`);
  const m = startRe.exec(html);
  if (!m) return null;
  const start = m.index + m[0].length;
  const nextRe = /<section class="sec/g;
  nextRe.lastIndex = start;
  const next = nextRe.exec(html);
  return html.slice(start, next ? next.index : html.length);
}

// Named entities this file is known to use in prose, plus generic numeric
// entities (&#NNN; / &#xHHH;) so an entity nobody thought to name explicitly
// still decodes correctly instead of leaking into the extracted text as-is.
const NAMED_ENTITIES = {
  mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  hellip: '…', nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
};
function decodeEntitiesForText(s) {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (full, code) => {
    if (code[0] === '#') {
      const cp = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : full;
    }
    return NAMED_ENTITIES[code] ?? full;
  });
}

function stripTags(s) {
  return decodeEntitiesForText(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

// Auto-extract "Do"/"Don't" usage guidance from the section's own
// `.sel-usage__card` blocks — the plain-prose judgment calls (when to reach
// for this component vs. a neighbour, what not to do with it) that no
// class-name or identifier list captures, but that genuinely change how a
// reskin should apply the component. Automatic and unconditional — this is
// the "bake it in" version of reading it by hand.
function extractUsage(sectionHtml) {
  if (!sectionHtml) return null;
  const doItems = [];
  const dontItems = [];
  const cardRe = /<div class="sel-usage__tag sel-usage__tag--(do|dont)">[\s\S]*?<\/div>\s*<ul class="sel-usage__list">([\s\S]*?)<\/ul>/g;
  let m;
  while ((m = cardRe.exec(sectionHtml))) {
    const kind = m[1];
    const liRe = /<li>([\s\S]*?)<\/li>/g;
    let li;
    while ((li = liRe.exec(m[2]))) {
      const text = stripTags(li[1]);
      if (text) (kind === 'do' ? doItems : dontItems).push(text);
    }
  }
  if (doItems.length === 0 && dontItems.length === 0) return null;
  return { do: doItems, dont: dontItems };
}

if (classNames.length === 0 && constNames.length === 0 && status !== 'placeholder') {
  fail('provide at least --classes and/or --consts (or use --status placeholder)');
}

const cssText = classNames.length ? extractCss(html, classNames) : '';
if (classNames.length && !cssText) {
  console.error(`[generate-ai-context-tab] warning: none of the given classes matched any CSS rule — check the class names or the section's actual markup.`);
}

let jsParts = [];
for (const name of constNames) {
  const decl = extractConst(html, name) || extractFunctionDecl(html, name);
  if (!decl) {
    console.error(`[generate-ai-context-tab] warning: no const or function named "${name}" found.`);
    continue;
  }
  jsParts.push(decl);
}
const jsText = jsParts.join('\n\n');

const sectionHtml = extractSectionHtml(html, sectionId);
const usage = extractUsage(sectionHtml);

// contentHash covers css + js + usage — if the Do/Don't guidance changes
// without the CSS/JS changing, the tab should still be flagged stale, so
// usage has to be part of what's hashed, not a side note that can silently
// drift on its own.
const contentHash = crypto.createHash('sha256')
  .update(cssText + '\n' + jsText + '\n' + JSON.stringify(usage))
  .digest('hex');

const blob = { status };
// Every identifier passed via --consts, not just the ones that happen to be
// actual `function` declarations — consuming tooling re-derives the same
// hash by re-extracting exactly these names, so this must list everything
// that went into `js` below, data consts included, or verification can
// never match.
if (constNames.length) blob.builderFunctions = constNames;
if (classNames.length) blob.realClasses = classNames.map(c => '.' + c);
if (noReusableClass) blob.noReusableClass = true;
if (cssText) blob.css = cssText;
if (jsText) blob.js = jsText;
if (usage) blob.usage = usage;
blob.contentHash = contentHash;
if (note) blob.note = note;

// contentHash is always computed over the RAW css/js text (above), before
// any HTML-escaping — hashing has to match what a reader gets back out
// after decoding, not the escaped-for-display encoding.
const json = JSON.stringify(blob, null, 2);

// <pre> is NOT a raw-text element like <script>/<style> — the browser
// parses its contents as normal HTML. Since css/js frequently contain
// literal `<`/`>` (e.g. tagHTML's own `<span>` markup) and the JSON syntax
// itself contains `"` freely, this MUST be HTML-entity-escaped before
// embedding or the browser will parse stray tags out of the JSON text and
// visibly corrupt it. Order matters: escape `&` first, or `&lt;` etc. would
// themselves get double-escaped.
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
const escapedJson = escapeHtml(json);

process.stdout.write(
`Paste this over the existing tab in <section id="${sectionId}"> (or add it at the end of the section if none exists yet):

<details class="ai-ctx">
  <summary>AI context</summary>
  <pre data-ai-context="${sectionId}">
${escapedJson}
  </pre>
</details>
`
);
