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
lives **inside each section itself**, as a small inert data block. This file only documents the
convention — it deliberately does not enumerate specific sections, so it never goes stale as
components are added, renamed, or restructured.

## The per-section machine context block

Any `<section>` may optionally include one inert, non-rendering block carrying machine-readable
facts about that component:

```html
<script type="application/json" data-ai-context="SECTION_ID">
{ ... }
</script>
```

`type="application/json"` means browsers never parse or execute it — zero effect on the live page.
`data-ai-context` must match the enclosing section's own `id` so tooling can verify it's reading the
right block. Place it anywhere inside the section (start or end both work).

**Adoption is optional and incremental.** A section with no block is not an error — tooling falls
back to reading the section's live HTML/CSS directly and inferring what it can. A block is only
worth adding where that fallback would actually miss something (chiefly: components with no static
markup, or with a real gotcha a plain read wouldn't reveal).

### Fields (all optional — include only what's actually useful for that component)

| Field | Purpose |
|---|---|
| `status` | `"static"` (safe to read the section's HTML/CSS directly), `"js-rendered"` (real markup only exists inside JS — see `builderFunctions`), or `"placeholder"` (not a real component yet — don't extract it as if it were). |
| `builderFunctions` | Array of function names that actually build this component's DOM, for `"js-rendered"` components whose static section HTML is just an empty mount. |
| `realClasses` | Array of CSS class names that are genuinely reusable outside this doc site (as opposed to doc-site-only chrome classes that happen to live in the same stylesheet). |
| `noReusableClass` | `true` when the component has no standalone class of its own at all — visual identity is applied ad hoc (e.g. via inline JS custom properties) purely for this doc site's own playground. Signals: reconstruct from tokens, don't copy markup. |
| `specs` | Flat key/value object of exact values worth stating plainly rather than parsed out of code — dimensions, radii, breakpoints, whatever's most load-bearing for that component. |
| `note` | Short free-text flag for anything else a plain read wouldn't reveal. |

### Two examples (format only — not a claim that these exist in the file yet)

A simple, fully static, already-reusable component:

```html
<script type="application/json" data-ai-context="EXAMPLE_A">
{
  "status": "static",
  "realClasses": [".tag", ".tag--sm", ".tag--reg", ".tag--neutral", ".tag--info", ".tag--success", ".tag--warning", ".tag--error", ".tag__dot"],
  "specs": { "radius": "6px", "heightSm": "20px", "heightReg": "24px" }
}
</script>
```

A JS-rendered component with the "no reusable class" gotcha:

```html
<script type="application/json" data-ai-context="EXAMPLE_B">
{
  "status": "js-rendered",
  "builderFunctions": ["makeSomeEl", "applySomeColors"],
  "noReusableClass": true,
  "note": "Colors/shape applied inline via JS custom props for this doc site's own playground — rebuild from tokens, don't copy markup.",
  "specs": { "shape": "pill", "radius": "999px" }
}
</script>
```

**Maintenance rule:** when you add a component, rename a render function, or change whether a
component is static vs. JS-rendered, add or update its block in the same PR — same habit as updating
`CHANGELOG`. Consuming tooling always treats a missing or stale block as "fall back to live
detection," never as ground truth it can't question — so this degrades gracefully rather than
breaking, but an accurate block is always more useful than a guess.

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
