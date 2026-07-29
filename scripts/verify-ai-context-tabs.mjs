#!/usr/bin/env node
// CI check: every AI context tab in index.html must still match the live
// source it claims to describe. Run this on every PR touching index.html —
// see .github/workflows/verify-ai-context.yml. Exits non-zero (failing the
// check) if any tab's contentHash no longer matches, printing the exact
// command to regenerate it.
//
// This exists so keeping AI context tabs in sync is enforced automatically,
// not something a contributor needs to know or remember to do by reading
// AI-CONTEXT.md — a stale tab fails CI with an actionable fix, same as a
// failing test.
//
// Usage: node scripts/verify-ai-context-tabs.mjs [--file index.html]

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return process.argv[i + 1];
}
function fail(msg) {
  console.error(`[verify-ai-context-tabs] ${msg}`);
  process.exit(1);
}

const filePath = path.resolve(arg('file', 'index.html'));
if (!existsSync(filePath)) fail(`file not found: ${filePath}`);

const rawHtml = readFileSync(filePath, 'utf8');

// Same contamination fix as the generator: strip every tab's own <pre>
// contents before extracting anything, so a regex search for e.g.
// "const TAG_VARIANTS =" can't match the escaped copy sitting inside a tab.
const cleanHtml = rawHtml.replace(/<pre data-ai-context="[^"]*">[\s\S]*?<\/pre>/g, '');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeHtmlEntities(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

// Identical to generate-ai-context-tab.mjs and the design-system-reskin
// skill's resolver — all three must produce byte-identical output given the
// same input, or hash comparisons across them are meaningless. Keep in sync.
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
  const re = new RegExp(`const\\s+${escapeRegex(name)}\\s*=`);
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

function extractCss(html, classNames) {
  const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const boundaries = classNames.map(cls => new RegExp(`\\.${escapeRegex(cls)}(?![\\w-])`));
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  const seen = new Set();
  const out = [];
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

// Same section-slicing and Do/Dont extraction as generate-ai-context-tab.mjs
// — must stay identical or the re-derived hash here won't match a tab whose
// usage field was computed there. See AI-CONTEXT.md.
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

// Find every tab in the ORIGINAL (unstripped) file — this is the only place
// we need the tabs' own text, everything else works against cleanHtml.
const tabs = [...rawHtml.matchAll(/<pre data-ai-context="([^"]*)">([\s\S]*?)<\/pre>/g)]
  .map(m => ({ sectionId: m[1], raw: m[2] }));

if (tabs.length === 0) {
  console.log('[verify-ai-context-tabs] No AI context tabs found in this file — nothing to verify.');
  process.exit(0);
}

let failures = 0;
let skipped = 0;

for (const { sectionId, raw } of tabs) {
  let block;
  try {
    block = JSON.parse(decodeHtmlEntities(raw));
  } catch (e) {
    console.error(`✗ ${sectionId}: tab is not valid JSON (${e.message}) — this is a hard error, not just staleness.`);
    failures++;
    continue;
  }

  if (!block.contentHash) {
    console.log(`… ${sectionId}: no contentHash present (older-style tab) — skipping verification, not failing the build.`);
    skipped++;
    continue;
  }

  const classNames = (block.realClasses || []).map(c => c.replace(/^\./, ''));
  const freshCss = classNames.length ? extractCss(cleanHtml, classNames) : '';

  const freshJsParts = [];
  for (const name of block.builderFunctions || []) {
    const decl = extractConst(cleanHtml, name) || extractFunctionDecl(cleanHtml, name);
    if (decl) freshJsParts.push(decl);
  }
  const freshJs = freshJsParts.join('\n\n');

  const freshSectionHtml = extractSectionHtml(cleanHtml, sectionId);
  const freshUsage = extractUsage(freshSectionHtml);

  // contentHash covers css + js + usage — same formula as
  // generate-ai-context-tab.mjs, or a tab whose Do/Dont guidance changed
  // without CSS/JS changing would never be flagged stale here.
  const freshHash = crypto.createHash('sha256')
    .update(freshCss + '\n' + freshJs + '\n' + JSON.stringify(freshUsage))
    .digest('hex');

  if (freshHash === block.contentHash) {
    console.log(`✓ ${sectionId}: AI context tab is current.`);
    continue;
  }

  failures++;
  const classesArg = classNames.map(c => `.${c}`).join(',');
  const constsArg = (block.builderFunctions || []).join(',');
  console.error(`✗ ${sectionId}: AI context tab is STALE — its contentHash no longer matches the live file.`);
  console.error(`  This means the component's markup/CSS/JS changed since the tab was last generated.`);
  console.error(`  Regenerate it and paste the output over the existing tab in this same PR:`);
  console.error(`    node scripts/generate-ai-context-tab.mjs --section ${sectionId} --classes ${classesArg} --consts ${constsArg}${block.noReusableClass ? ' --no-reusable-class' : ''}${block.note ? ` --note "${block.note.replace(/"/g, '\\"')}"` : ''}`);
}

console.log('');
console.log(`[verify-ai-context-tabs] ${tabs.length} tab(s) checked: ${tabs.length - failures - skipped} current, ${failures} stale, ${skipped} unverifiable (no hash).`);

if (failures > 0) {
  console.error('[verify-ai-context-tabs] FAILED — see above for exactly what to run.');
  process.exit(1);
}
