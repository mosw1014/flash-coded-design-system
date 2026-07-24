# AI context notes

This file is read by AI tooling that consumes this design system programmatically — currently the
`design-system-reskin` Claude Code skill, which fetches it fresh from `main` on every run alongside
`index.html` itself (`raw.githubusercontent.com/mosw1014/flash-coded-design-system/main/AI-CONTEXT.md`).
It is not read by the doc site and has no effect on the live page.

**Why this file exists:** `index.html` is a single ~9,500-line file where most components are
rendered entirely by JavaScript for the doc site's own playgrounds — the static HTML for those
sections is just an empty mount `<div>`. Tooling that only reads the static markup gets nothing
useful for those components. This file tells it where the real markup/CSS actually lives.

**Maintenance rule:** if you add a component, rename a render function, or change whether a
component is static vs. JS-rendered, update its entry below in the same PR — same habit as
updating `CHANGELOG` for humans. If this file doesn't mention a component, tooling falls back to
reading the live section directly and guessing from context, so a stale/missing entry degrades
gracefully rather than breaking — but an accurate entry is always better than a guess.

## File structure notes

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

## Components with no static markup — read the render function, not the section HTML

For these, the section's own HTML is just an empty `<div id="...-playground">` or similar mount —
the actual DOM structure, class names, and states only exist inside the listed function(s).

- **Buttons** (`s-buttons`) — built by `makeBtnEl()` (colors applied via `applyBtnColors()`,
  classes via `getBtnClasses()`). **No standalone reusable `.btn` class exists** — colors/shape are
  applied inline via JS custom properties for the doc site's own playground. When reskinning
  elsewhere, reconstruct buttons from the semantic tokens (`--color-btn-p-bg`, `--color-btn-p-txt`,
  `--color-btn-s-bg`, `--color-btn-s-txt`, `--color-btn-o-border`, `--color-btn-o-txt`) and the
  documented shape: fully pill-rounded (`border-radius: 999px`).
- **Text Inputs** (`s-inputs`) — built by `tiBuildStandardField()` (Standard/floating-label variant)
  and `tiBuildSearchField()` (Search/pill variant). State lives in the `tiState` object. Unlike
  Buttons, these **do** produce genuine reusable classes (`.ti-shell`, `.ti-field`, `.ti-label`,
  `.ti-value-row`, `.ti-input`, `.ti-leading`, `.ti-trailing-icon`, `.ti-clear`, `.ti-eye`,
  `.ti-error`) — safe to copy the CSS for these directly once extracted from the function/style
  block, since they're not doc-only.
- **Tags** (`s-tags`) — built by `tagHTML()`. Simple and already genuinely reusable:
  `.tag`, `.tag--{sm|reg}`, `.tag--{neutral|info|success|warning|error}`, `.tag__dot`.
- **Chips** (`s-chips`) — built by `makeChipHTML()` / `makeChipEl()`. Reusable classes: `.chip`,
  `.chip--{sm|reg|lg}`, `.chip__label`, `.chip__x`.
- **Bottom Sheets / Drawers** (`s-drawers`) — built by `bshBuildSheetEl()` (and
  `bshBuildFooter()` for the footer layout variants).
- **Navigation / Side Nav** (`s-nav`) — rendered live into `#snav-play-stage`; there is no single
  named builder function as clean as the others above, and no static reference markup either. Use
  the written **Anatomy & specs** table in this section instead (exact px values: 208px panel width
  / 170px small, 12px corner radius, 4px 8px item padding, 20px icon chip / 12px small, idle vs.
  active colors) — it's more reliable to transcribe than to parse out of the render logic.

## Components that are mostly static — safe to read the section HTML directly

Switch (`s-switch`), Tabs (`s-tabs`), Cards (`s-cards`), Alert (`s-alert`), Accordion
(`s-accordion`), Breadcrumb (`s-breadcrumb`), Pagination (`s-pagination`), Avatar (`s-avatar`),
Separator (`s-separator`), Kbd (`s-kbd`), and most of the remaining sections not listed above use
plain BEM markup written directly in the section, so their real classes and CSS are already visible
without needing to unpack a render function.

**Tables** (`s-tables`) is mostly static hand-authored markup (`.tbl-wrap`, `.tbl-row`, `.tbl-cell`,
`.tbl-link`, `.tbl-pic`, etc.) — safe to read directly. It also has a small separate JS playground
widget (`#tbl-playground`) for the doc site's own interactive demo, which can be ignored; it doesn't
carry additional component spec beyond what the static markup already shows.

## Known placeholder sections (not yet real components)

- **Modals & Dialogs** (`s-modals`) — "Coming in a future session." Compose from Card + Button /
  overlay primitives instead of inventing a one-off design, and report the gap.
- **Toasts & Snackbars** (`s-toasts`) — same status as above. Compose from Alert primitives instead.

If either of these ships for real, remove its entry here (or mark it accordingly) in the same PR.
