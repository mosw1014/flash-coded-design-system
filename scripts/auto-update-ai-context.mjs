#!/usr/bin/env node
// Auto-regenerates every EXISTING AI context tab in index.html whose source
// has drifted, and re-splices the result in place. Designed to run from the
// pre-commit hook (see .githooks/pre-commit) so a contributor never has to
// remember to hand-run generate-ai-context-tab.mjs after touching a
// component that already has a tab.
//
// This does NOT invent new tabs for sections that don't have one yet — a
// brand-new component's first tab is still a deliberate, one-time choice
// (which classes/consts actually matter), made once by hand per
// AI-CONTEXT.md. This script only keeps already-adopted tabs honest.
//
// It shells out to generate-ai-context-tab.mjs itself (rather than
// duplicating its extraction algorithm a fourth time) so its output is
// guaranteed byte-identical to a manual run — same tool, just invoked
// automatically using each tab's own stored realClasses/builderFunctions/
// status/note as the arguments.
//
// Usage: node scripts/auto-update-ai-context.mjs [--file index.html] [--quiet]

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return process.argv[i + 1];
}
function flag(name) {
  return process.argv.includes(`--${name}`);
}
function fail(msg) {
  console.error(`[auto-update-ai-context] ${msg}`);
  process.exit(1);
}

const quiet = flag('quiet');
const filePath = path.resolve(arg('file', 'index.html'));
if (!existsSync(filePath)) fail(`file not found: ${filePath}`);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const generatorPath = path.join(scriptDir, 'generate-ai-context-tab.mjs');

function decodeHtmlEntities(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

let html = readFileSync(filePath, 'utf8');

// Discover every existing tab and the metadata needed to regenerate it —
// same fields generate-ai-context-tab.mjs's CLI flags accept.
const tabs = [...html.matchAll(/<pre data-ai-context="([^"]*)">([\s\S]*?)<\/pre>/g)]
  .map(m => ({ sectionId: m[1], raw: m[2] }));

if (tabs.length === 0) {
  if (!quiet) console.log('[auto-update-ai-context] No AI context tabs found — nothing to auto-update.');
  process.exit(0);
}

let changed = [];

for (const { sectionId, raw } of tabs) {
  let block;
  try {
    block = JSON.parse(decodeHtmlEntities(raw));
  } catch {
    if (!quiet) console.error(`[auto-update-ai-context] ${sectionId}: existing tab is not valid JSON — skipping, leave for manual fix.`);
    continue;
  }

  const classesArg = (block.realClasses || []).join(',');
  const constsArg = (block.builderFunctions || []).join(',');
  const cliArgs = ['--section', sectionId];
  if (classesArg) cliArgs.push('--classes', classesArg);
  if (constsArg) cliArgs.push('--consts', constsArg);
  if (block.status) cliArgs.push('--status', block.status);
  if (block.noReusableClass) cliArgs.push('--no-reusable-class');
  if (block.note) cliArgs.push('--note', block.note);
  cliArgs.push('--file', filePath);

  let output;
  try {
    output = execFileSync(process.execPath, [generatorPath, ...cliArgs], { encoding: 'utf8' });
  } catch (e) {
    if (!quiet) console.error(`[auto-update-ai-context] ${sectionId}: regeneration failed — ${e.message}`);
    continue;
  }

  const newBlockMatch = /<details class="ai-ctx">[\s\S]*?<\/details>/.exec(output);
  if (!newBlockMatch) {
    if (!quiet) console.error(`[auto-update-ai-context] ${sectionId}: generator produced no <details> block — skipping.`);
    continue;
  }
  const newBlock = newBlockMatch[0];

  // Re-locate the CURRENT tab in `html` fresh each iteration — earlier
  // splices in this same loop shift byte offsets for everything after them.
  const oldRe = new RegExp(`<details class="ai-ctx">\\s*<summary>AI context<\\/summary>\\s*<pre data-ai-context="${sectionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">[\\s\\S]*?<\\/pre>\\s*<\\/details>`);
  const oldM = oldRe.exec(html);
  if (!oldM) {
    if (!quiet) console.error(`[auto-update-ai-context] ${sectionId}: could not re-locate existing tab to splice over — skipping.`);
    continue;
  }

  if (oldM[0] === newBlock) continue; // byte-identical, nothing changed

  html = html.slice(0, oldM.index) + newBlock + html.slice(oldM.index + oldM[0].length);
  changed.push(sectionId);
}

if (changed.length) {
  writeFileSync(filePath, html);
  if (!quiet) console.log(`[auto-update-ai-context] Regenerated and re-spliced: ${changed.join(', ')}`);
} else if (!quiet) {
  console.log('[auto-update-ai-context] All existing AI context tabs already current — nothing to do.');
}

process.exit(0);
