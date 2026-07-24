# AI context notes

This file is read by AI tooling that consumes this design system programmatically — currently the
`design-system-reskin` Claude Code skill, which fetches it fresh from `main` on every run alongside
`index.html` itself (`raw.githubusercontent.com/mosw1014/flash-coded-design-system/main/AI-CONTEXT.md`).
It is not read by the doc site and has no effect on the live page.

**Why this matters:** `index.html` is a single ~9,500-line file where many components are rendered
entirely by JavaScript for the doc site's own playgrounds — the static HTML for those sections is
just an empty mount `<div>`. Tooling that only reads the static markup gets nothing useful for
those. Rather than track per-component facts in one central file (which drifts out of sync the
moment someone changes a component without remembering to update a separate document), that detail
lives **inside each section itself**, as a small collapsed disclosure. This file only documents the
convention — it deliberately does not enumerate specific sections, so it never goes stale as
components are added, renamed, or restructured.

## The per-section machine context tab

Any `<section>` may optionally include one collapsed `<details>` disclosure carrying
machine-readable facts about that component — **visible, not hidden**, but styled to sit at the
very bottom of the visual hierarchy, well below the actual component documentation:

```html
<details class="ai-ctx">
  <summary>AI context</summary>
  <pre data-ai-context="SECTION_ID">
{ ... }
  </pre>
</details>
```

`<details>/<summary>` is a native, fully accessible disclosure — keyboard-operable and correctly
announced by screen readers with zero extra ARIA or JS required. Collapsed by default, so it never
competes with the real documentation above it, but a curious human can still expand it to see
exactly what the AI tooling reads — useful for spot-checking that it's accurate. `data-ai-context`
must match the enclosing section's own `id` so tooling can verify it's reading the right tab. Place
it at the end of the section.

### Suggested styling (low visual hierarchy, still meets contrast requirements)

```css
.ai-ctx { margin-top: 20px; font-size: 11px; }
.ai-ctx summary {
  display: inline-flex; align-items: center; gap: 4px;
  cursor: pointer; list-style: none; user-select: none;
  color: var(--chrome-muted); font-weight: 600; letter-spacing: .02em;
}
.ai-ctx summary::-webkit-details-marker { display: none; }
.ai-ctx summary::before { content: '▸'; font-size: 9px; }
.ai-ctx[open] summary::before { content: '▾'; }
.ai-ctx summary:focus-visible { outline: 2px solid var(--color-input-focus); outline-offset: 2px; }
.ai-ctx pre {
  margin: 6px 0 0; padding: 10px 12px;
  background: var(--chrome-nav); border-radius: 8px;
  font-family: 'SF Mono', Consolas, monospace; font-size: 10.5px; line-height: 1.5;
  color: var(--chrome-muted); overflow-x: auto; white-space: pre-wrap;
}
```

Reuses `--chrome-muted` — the same token already used for `.sec__desc` body copy elsewhere in this
file — rather than inventing a lighter, lower-contrast grey purely to look more "hidden." Low visual
hierarchy comes from size, position, and the collapsed state, not from making the text hard to read
once it's open.

**Adoption is optional and incremental.** A section with no tab is not an error — tooling falls back
to reading the section's live HTML/CSS directly and inferring what it can. A tab is only worth
adding where that fallback would actually miss something (chiefly: components with no static
markup, or with a real gotcha a plain read wouldn't reveal).

### Fields (all optional — include only what's actually useful for that component)

| Field | Purpose |
|---|---|
| `status` | `"static"` (safe to read the section's HTML/CSS directly), `"js-rendered"` (real markup only exists inside JS — see `builderFunctions`), or `"placeholder"` (not a real component yet — don't extract it as if it were). |
| `builderFunctions` | Array of **every** identifier (functions and data consts alike) whose source makes up the `js` field below — not only actual `function` declarations. This must list everything `js` was built from, or a consumer re-deriving `contentHash` from the live file can't reproduce it. |
| `realClasses` | Array of CSS class names that are genuinely reusable outside this doc site (as opposed to doc-site-only chrome classes that happen to live in the same stylesheet). |
| `noReusableClass` | `true` when the component has no standalone class of its own at all — visual identity is applied ad hoc (e.g. via inline JS custom properties) purely for this doc site's own playground. Signals: reconstruct from tokens, don't copy markup. |
| `css` | The **verbatim** real CSS rules for `realClasses` — not a hand-summarized description, the actual rule text, generated (see below), never hand-typed. |
| `js` | The **verbatim** real JS for `builderFunctions`/relevant data consts — same principle: real source, not a paraphrase. |
| `contentHash` | A hash tying `css`+`js` to the exact live source they were extracted from (see "Keeping this honest" below). |
| `note` | Short free-text flag for anything a plain read wouldn't reveal — scope caveats, gotchas, anything `css`/`js` alone don't make obvious. |

`css`/`js` are deliberately **verbatim, not summarized**. Earlier drafts of this convention used a
hand-picked `specs` object (a few named numbers like radius/height) — dropped in favour of embedding
the real source directly, because hand-picking which facts matter is exactly the kind of judgement
call that goes stale silently: a color, a state, a spacing value nobody thought to name doesn't show
up in a curated summary, but it's right there if the actual CSS is embedded. This is also *why*
`realClasses`/`builderFunctions` still matter as separate fields — they tell the generator (and a
human) exactly what to re-extract, so `css`/`js` stay scoped and small rather than pulling in
unrelated rules.

### Keeping this honest: `contentHash` and the generator script

A tab that silently drifts out of sync with the component it describes is worse than no tab at all —
tooling is told to trust it. So `css`/`js` are never hand-typed and never trusted blindly:

1. **Generate, don't transcribe.** A script (companion tooling, not part of this file) reads the
   live `index.html`, extracts the real CSS rules matching a section's `realClasses` and the real
   source of its `builderFunctions`/data consts, and prints the full tab ready to paste in. Run it
   again and paste over the old tab whenever you touch that component's markup, CSS, or JS.
2. **`contentHash`** is `sha256(css + "\n" + js)` — computed once at generation time over the exact
   `css`/`js` text embedded in the same tab, using the untrimmed strings exactly as embedded, joined
   with a single newline.
3. **Consuming tooling re-derives the same hash from the live file at read time** (using the tab's
   own `realClasses`/`builderFunctions` as the extraction targets) and compares it to the stored
   `contentHash`. A match means the tab is provably current — trust `css`/`js` as-is and skip
   re-parsing the file for that component entirely (this is what makes a valid tab genuinely lean:
   the expensive part only ever has to run once, at generation time, not on every read). A mismatch
   means the component changed since the tab was last generated — tooling must fall back to its own
   fresh extraction and should flag the tab as stale rather than silently using either version.

### Two examples (format only — not a claim that these exist in the file yet)

A simple, fully static, already-reusable component:

```html
<details class="ai-ctx">
  <summary>AI context</summary>
  <pre data-ai-context="EXAMPLE_A">
{
  "status": "static",
  "realClasses": [".tag", ".tag--sm", ".tag--reg", ".tag--neutral"],
  "css": ".tag{display:inline-flex;...}\n.tag--sm{height:20px;padding:0 7px;font-size:11px}\n...",
  "contentHash": "e3b0c44298fc1c14..."
}
  </pre>
</details>
```

A JS-rendered component with the "no reusable class" gotcha:

```html
<details class="ai-ctx">
  <summary>AI context</summary>
  <pre data-ai-context="EXAMPLE_B">
{
  "status": "js-rendered",
  "builderFunctions": ["makeSomeEl", "applySomeColors"],
  "noReusableClass": true,
  "note": "Colors/shape applied inline via JS custom props for this doc site's own playground — rebuild from tokens, don't copy markup.",
  "js": "function makeSomeEl(...) {...}\nfunction applySomeColors(...) {...}",
  "contentHash": "9f86d081884c7d65..."
}
  </pre>
</details>
```

**Maintenance rule:** when you add a component, rename a render function, or change whether a
component is static vs. JS-rendered, **regenerate and paste over** its tab in the same PR — same
habit as updating `CHANGELOG`, but mechanical rather than manual. Consuming tooling always treats a
missing OR hash-mismatched tab as "fall back to live detection," never as ground truth it can't
question — so this degrades gracefully rather than breaking, but a fresh, hash-verified tab lets
tooling skip re-parsing the file for that component entirely.

## File structure notes (apply to the whole file, not any one component)

- There are **two `<style>` blocks** in `index.html`: a small one near the top (doc-site chrome
  reset) and a much larger one further down containing virtually all real component CSS. Tooling
  should read both, not just the first.
- Design tokens: raw palette values live in `:root`; semantic tokens are scoped per brand/theme in
  `[data-brand="flash"][data-theme="light"]` and `[data-brand="flash"][data-theme="dark"]` blocks
  (e.g. `--color-btn-p-bg`, `--color-surface-n1`, `--color-info-h`). These are genuine, reusable
  CSS custom properties — safe to reference directly in another project.
- The `CHANGELOG` JS object has two parts: `CHANGELOG.system` (global entries) and
  `CHANGELOG.components` (one array per section, keyed by `secId`). Both need updating for a
  component change, per this repo's `CLAUDE.md`.
