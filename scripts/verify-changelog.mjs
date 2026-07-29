#!/usr/bin/env node
// CI check: any PR that changes index.html must also add a new entry to
// the in-app CHANGELOG (CLAUDE.md rule 4) — not just documented, enforced.
// Diffs index.html against the PR base ref; if real content changed but no
// new CHANGELOG entry object was added, fails the check with a pointer to
// the rule, same as a failing test — no need to have read CLAUDE.md to get
// an actionable failure.
//
// Usage: node scripts/verify-changelog.mjs --base <base-sha-or-ref> [--file index.html]

import { execSync } from 'node:child_process';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return process.argv[i + 1];
}
function fail(msg) {
  console.error(`[verify-changelog] ${msg}`);
  process.exit(1);
}

const base = arg('base');
const file = arg('file', 'index.html');
if (!base) fail('missing --base <ref-or-sha> to diff against');

let diff;
try {
  diff = execSync(`git diff --unified=0 ${base} -- ${file}`, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 50,
  });
} catch (e) {
  fail(`git diff failed: ${e.message}`);
}

if (!diff.trim()) {
  console.log(`[verify-changelog] ${file} unchanged against ${base} — nothing to check.`);
  process.exit(0);
}

// Only look at added lines (real content changes), ignore removed lines.
const addedLines = diff
  .split('\n')
  .filter((l) => l.startsWith('+') && !l.startsWith('+++'));

if (addedLines.length === 0) {
  console.log(`[verify-changelog] ${file} diff has no added lines — nothing to check.`);
  process.exit(0);
}

// A genuine new changelog entry looks like:
//   {version:'1.32.2', date:'2026-07-30', author:'Mo', title:'...', changes:[
// The four fields can be split across lines by the differ, so check the
// *set* of added lines together rather than requiring one single line match.
const addedBlob = addedLines.join('\n');
const hasVersionField = /version\s*:\s*['"][\d.]+['"]/.test(addedBlob);
const hasDateField = /date\s*:\s*['"]\d{4}-\d{2}-\d{2}['"]/.test(addedBlob);
const hasAuthorField = /author\s*:\s*['"][^'"]+['"]/.test(addedBlob);
const hasTitleField = /title\s*:\s*['"][^'"]+['"]/.test(addedBlob);
const hasChangesArray = /changes\s*:\s*\[/.test(addedBlob);

const looksLikeChangelogEntry =
  hasVersionField && hasDateField && hasAuthorField && hasTitleField && hasChangesArray;

if (!looksLikeChangelogEntry) {
  fail(
    [
      `${file} changed but no new CHANGELOG entry was detected in the diff.`,
      '',
      'Per CLAUDE.md rule 4, every non-trivial change to index.html needs a new entry',
      "prepended to CHANGELOG.system.entries (and the relevant component's own",
      'entries array, if applicable), of the form:',
      '',
      "  {version:'X.Y.Z', date:'YYYY-MM-DD', author:'Name', title:'...', changes:[",
      "    ['added'|'changed'|'fixed'|'removed', 'description'],",
      '  ]}',
      '',
      'If this change genuinely has no user-facing effect (e.g. a comment-only or',
      'CI-only edit), you can skip this by not touching index.html in this PR.',
    ].join('\n')
  );
}

console.log('[verify-changelog] found a new CHANGELOG entry in the diff — OK.');
