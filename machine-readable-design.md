---
document: Flash UI Reskin Guide
version: 2.5.0
design_system: https://mosw1014.github.io/flash-coded-design-system/
purpose: Guide design judgement while the live design system supplies tokens, components and implementation.
scope: Existing interfaces created with Claude, Replit, Lovable or similar tools.
changes: 2.5.0 is a token-lean rewrite of 2.4.1 — identical rules and thresholds, duplication and rhetoric removed. See the repo changelog.
---

# Flash UI Reskin Guide

Use this file to clean up, rearrange and visually refine an existing interface with the live Flash
Design System.

This file owns design judgement: hierarchy, layout, spacing, alignment, typography roles and
weights, component and variant selection, visual restraint, responsive prioritisation. The
[live Flash Design System](https://mosw1014.github.io/flash-coded-design-system/) owns exact tokens
and values, component anatomy, classes, states, CSS, JS and builder functions, implementation
examples, and current component availability. Do not duplicate the design system inside this file;
treat the live system as the current source of truth.

## 1. Scope

A reskin and refinement task, not an unrestricted product redesign.

**Preserve unless explicitly authorised:** routes and navigation destinations; features and
business logic; data and API behaviour; working interactions; form requirements; approved content;
analytics and event hooks; accessibility semantics; framework and project structure.

**You may change:** content order within a page; section grouping; widths, columns and responsive
reflow; visual hierarchy; spacing and alignment; typography size, role and weight; surface, border,
radius and elevation treatment; which Flash component represents an existing function; which
variant and size is most appropriate; placement and visual priority of actions.

Do not remove content or functionality merely to look cleaner — reduce visual noise before
reducing information.

**Priority order:** 1. explicit user requirements → 2. working product behaviour and verified
content → 3. live Flash Design System → 4. this guide → 5. agent preference. Where this file and
the live system differ on an exact component value, the live system wins.

## 2. Read the live system selectively

Do not read the complete design-system source line by line. At the start of a reskin: inspect the
existing interface and list the components actually present; read the live Brand, Colours,
Spacing & Grid, Typography, Elevation and Icons foundations; read only the component sections the
interface requires; inspect each visible example and its `AI context`; implement from the live
component source, using this file to choose and compose it.

The live site carries `<pre data-ai-context="…">` blocks. Index them lightly and load only relevant
entries; per entry inspect `status`, `realClasses`, `css`, `js`/`builderFunctions`, `usage`,
`note`, and the visible example. Interpret `status`: **static** — use the real markup and classes
shown; **js-rendered** — use the provided classes and only the builder/interaction logic required;
**placeholder** — the component does not exist; do not reconstruct or pretend it does. Modals and
Toasts are currently placeholders: preserve an existing working pattern or use another suitable
available component — never fabricate a Flash modal or toast.

Do not copy documentation-only playgrounds, galleries, phone frames, reference grids or navigation
chrome into the product. Copy the reusable component, not the page demonstrating it.

## 3. Flash design character

Every result should feel bold, direct, energetic, clear and controlled — through confident
hierarchy and selective contrast, not constant decoration.

### The green spark

Black, white and neutral surfaces do the structural work; green marks the most important moment.
Aim for one dominant green moment per screen — a primary brand highlight, active marker or rare
standout action. Do not scatter green across headings, icons, borders, badges and buttons. On light
surfaces use the accessible green token the live system identifies (never bright Flash Green as
body text on white). Semantic success green means success, not decoration.

The Button system distinguishes `Primary` from `Accent`: Primary is the normal high-emphasis
action; Accent is the rare brand-coloured spotlight, never the default. **Accent requires Primary
buttons already on the page** — its purpose is to make one action stand out *among* competing
Primary emphasis. **A page's only button is Primary, never Accent**: with nothing to stand out
against, Accent reads as an arbitrary colour choice.

### Shape

Generous rounding for major brand surfaces and large containers; the exact radius built into each
coded component for buttons, cards, inputs, navigation and overlays. Never one large radius on
every object — layout surfaces and reusable components have different scales.

## 4. Reskin sequence

Work in this order:

1. Understand the screen's task.
2. Identify the primary information and action.
3. Rearrange the layout and grouping.
4. Establish shared alignment lines.
5. Apply Flash spacing and grid tokens.
6. Choose typography roles and weights.
7. Replace ad hoc UI with appropriate Flash components.
8. Select component variants and sizes.
9. Apply colour, surfaces and elevation.
10. Implement states and responsive behaviour.
11. Inspect the running interface.

Do not start by changing colours. A successful reskin improves comprehension even in greyscale.

## 5. Hierarchy and layout judgement

### One focal point

Each screen has one dominant purpose, value or action; supporting information stays visibly
subordinate. Make the page title and primary task obvious. One primary action per decision group.
Place actions near the content they affect. Quiet secondary and rare actions rather than hiding
them. Use size, weight, position and space before colour.

### Rearrangement

Reorder and regroup existing content when it improves the task: move the primary action closer to
the decision; group related controls; separate unrelated content; replace an arbitrary card grid
with a list or table; convert an unstructured stack into a clear grid; move rare actions into an
available menu or contextual pattern; place filters beside the results they control; move
supporting information after the primary content; stack columns when readable width becomes weak.
Never reorder solely to make the composition unusual.

### Complex filters

One or two simple controls stay inline beside their results. A bloated filter set — several
dropdowns, date ranges, toggles and chips competing in the header — collapses behind a single
expandable "Filters" trigger (a button opening a Popover, Drawer or Accordion panel per Section 8).
The trigger stays visible and inline; the controls appear only when opened. Keep any
already-applied filter visible as a summary or Chip outside the panel. Do not collapse a genuinely
small filter row just to add a click — this rule reduces clutter, not simple controls.

### Progressive disclosure — most forms do not belong on the page

A form being present in the original layout is not a reason to render it inline in the reskin. A
reading-oriented page (dashboard, overview) should show data; every always-visible form competes
with the focal point and pushes real content below the fold. Judge each form by frequency and
whether it belongs to this page's task:

- **Frequent and central to this page's task** — keep it inline (e.g. a quick-add row on a page
  whose whole job is adding records).
- **Occasional, or a side task** — collapse behind a trigger (Button or Link in its region; the
  form lives in a Popover, Drawer, Accordion or dialog per Section 8). Typical: invite a teammate,
  log a call, add an expense, schedule a report, add a tag, bulk update, import data.
- **Rare, or account/settings-shaped** — it does not belong on an overview page: link to where it
  actually lives. Typical: billing contact, change password, notification preferences,
  currency/locale settings. These are Settings; a link is the correct representation, not a
  collapsed panel and not an inline form.

Rules: no more than one or two inline forms on a reading-oriented page — a grid of four form
panels is itself the defect, so convert all but the most-used to triggers. The trigger names the
task ("Invite a teammate"), not the mechanism ("Open form"). Keep the resulting state visible
outside the panel (pending-invite count, last logged call), as an applied filter stays visible as a
Chip. Preserve functionality exactly (Section 1): moving a form behind a trigger changes where it
renders, never what it does — every field, validation rule and submit handler carries over. Do not
collapse a single small, frequent form just to add a click. This applies to forms and side tasks,
**never to navigation** — the Side Nav is explicitly out of scope (see Section 8).

### Field-to-label hierarchy inside a form

A form panel has three visibly different levels — never three near-identical bold lines:

1. **Panel/section heading** ("Quick add") — Black (900) at a section- or component-heading size.
2. **Field labels** ("Product", "Units") — Semibold (650) at a body size, clearly smaller and
   lighter than the heading.
3. **Input and helper text** — Semibold (650) values; Medium (500) Body S helper/caption text.

The heading must be unmistakably dominant over its labels at a glance — if you must compare to
tell which is which, the gap is too small. A field label is never Black (900); a panel heading is
never merely Semibold.

### Page header layout

The main page title sits on its own line; every control belonging to that header — toggles, filter
triggers, tabs, buttons — sits together on a single row **directly under the title**, sharing one
alignment line. Never controls above the title or beside it on the same line. Every control in the
row shares the same baseline/centre alignment — mixed vertical positions read as unfinished. This
governs the header row only; actions placed beside the specific content they affect (Rearrangement,
above) stay there.

### Grid and spacing

Use the live 8px-based spacing system and grid: 4 columns mobile, 8 tablet, 12 desktop and wide,
with the live margin and gutter tokens per viewport. Space within a group is smaller than space
between groups; section separation is larger than component spacing; repeated items use identical
gaps; alignment takes priority over filling empty area; use white space before borders, shadows or
extra containers.

### Containers and cards

Do not turn every section into a card. A Card wraps one coherent object, record, summary or
destination; ordinary layout and spacing handle page structure. Avoid cards nested inside cards,
many equal-weight metric cards, borders around every text group, and decorative surfaces with no
grouping purpose.

## 6. Typography decisions

Use the live typography tokens; never invent intermediate sizes or weights.

**Typeface:** Satoshi for app UI, body copy, labels, inputs, navigation and most headings.
Kilimanjaro Sans only for short, punchy marketing display copy — never body copy, forms, dashboards
or functional UI.

**Weight selection:**

| Weight | Use |
| ---: | --- |
| 900 Black | One dominant hero or page-level heading; major display moments |
| 800 Bold | Section headings, important values, strong emphasis |
| 650 Semibold | Buttons, input text, UI labels, navigation, compact controls |
| 500 Medium | Body copy, supporting text, captions, reduced-emphasis headings |

Do not make every heading Black; if headings compete, lower size or weight per hierarchy.
**Section headings always use Black (900)** — never Semibold or Medium, which flattens the
hierarchy readers scan by. **Medium (500) appears only as a subheading directly beneath a Black
section heading** — never standalone; a heading with no Black heading above it is itself a section
heading and takes Black.

**Size selection** — choose a live heading token by semantic role, not by what fits: Hero tokens
for marketing/splash only; one page-title token per page; section-heading tokens for major
divisions; component-heading tokens for cards, panels and local groups; Body L for introductions or
featured explanations; Body M as default reading; Body S for helper/secondary detail; Body XS/XXS
for metadata, timestamps and legal only. Use the mobile heading tokens at narrow widths. Keep
paragraphs readable without forced manual breaks; hierarchy comes from size and weight, with muted
text tokens for genuinely secondary copy — not as compensation for weak structure.

## 7. Colour, surfaces and elevation

**Colour:** semantic tokens, never arbitrary hex. Black or white for normal high-emphasis actions
and text; brand green reserved for the most important brand moment; blue for links and
informational interaction where defined; status colours only for their semantic meaning; prefer
neutral or subtle green-tinted surfaces over decorative colour blocks; verify contrast in the
implemented context.

**Surfaces** — the lightest treatment that communicates the relationship, in order: spacing →
alignment → subtle surface tone → border → elevation. Never a shadow merely to feel "premium".

**Elevation** — the live level for the layer: XS cards/tiles, S tooltips/secondary overlays,
M menus/dropdowns, L drawers/high overlays, XL only the highest-priority notification layer. If
the component defines its elevation, use that.

## 8. Component selection

Read the relevant live component page before implementing anything below.

| Need | Choose | Decision rule |
| --- | --- | --- |
| Main action | Buttons `s-buttons` | Primary = normal main action; Secondary = support; Accent only among existing Primary buttons (see §3 — never a page's only button); Simple = low emphasis; Link = inline |
| Group one coherent object | Cards `s-cards` | Basic for content; Footer when actions need separation; Media when imagery matters; Interactive only when the whole card has one destination |
| Persistent app destinations | Navigation `s-nav` | Side Nav for a small set of top-level destinations; one active item; one colour context and size per panel. Persistent chrome — collapsible, never dismissible (below) |
| Related views of one object | Tabs `s-tabs` | One active tab; short parallel labels; never unrelated destinations |
| Two to five modes/options | Toggle Group `s-toggle-group` | Instead of a dropdown when options benefit from immediate comparison |
| Five to fifteen known options | Dropdown `s-dropdown` | Single-select default; multi only when multiple answers are valid; one field style consistently |
| Typed data | Text Inputs `s-inputs` | Standard field for submitted values; Caption label default; Inline only in genuinely compact layouts |
| Filtering a result set | Search field `s-inputs` | Search pill only for finding/filtering, with a real loading state; sized to match its row (see Size judgement) |
| Independent choices | Checkboxes `s-selection` | Opt-ins and multiple independent selections |
| One choice from visible options | Radios `s-selection` | Exactly one required and the set is worth showing |
| Immediate on/off setting | Switch `s-switch` | Only when the change takes effect immediately; else a checkbox |
| Read-only metadata/state | Tags & Badges `s-tags` | Not interactive; semantic colour only when it adds meaning |
| Interactive filter / removable value | Chips `s-chips` | Selection, filtering or removal — not passive metadata |
| Comparable records | Tables `s-tables` | For records scanned across columns; right-align numerics; avatar cells per the rule below |
| Optional secondary content | Accordion `s-accordion` | FAQs, optional settings, long supporting content |
| Persistent contextual message | Alert `s-alert` | Match severity; place beside affected content; never critical styling for routine info |
| Short mobile task | Bottom Sheet `s-drawers` | Compact for short tasks; full screen for long lists, multi-field forms, stepped flows |
| Brief explanation | Tooltip `s-tooltip` | Short, non-essential text only |
| Compact contextual interaction | Popover `s-popover` | One focused action or detail on a trigger |
| Preview on pointer/focus | Hover Card `s-hover-card` | Never essential content; touch users need another route |
| Short indeterminate wait | Spinner `s-spinner` | At the trigger or result location |
| Content-shaped loading | Skeleton `s-skeleton` | Mirror the final layout; prevent shifts |
| Deep hierarchy | Breadcrumb `s-breadcrumb` | Only for structures at least three levels deep |
| Large countable result set | Pagination `s-pagination` | Keep current, previous and next available |
| Date is the main choice | Calendar `s-calendar` | Inline for date-focused tasks; field pattern inside forms |

If a component is not listed, inspect its live page and `AI context` before choosing it.

### Navigation is persistent — collapsible, never dismissible

The Side Nav is persistent chrome, the user's map of the product: on screen at every viewport
width. The only permitted reduction is collapsing to an **icon-only rail** — labels drop, every
destination stays reachable, the active item stays marked.

- Never give the Side Nav a control that hides it completely — no dismiss, no close, no
  `display:none` toggle; a collapsed rail always beats an absent panel.
- **A close (×) icon on navigation is always wrong.** × means dismiss and belongs to dialogs,
  alerts, chips and drawers; a collapse control is a directional chevron or menu glyph.
- Collapsing is a **width response**, not a user-cleanup feature (Section 9): rail when width
  demands it; at the narrowest widths the correct mobile pattern — a temporary overlay drawer — is
  fine because a persistent trigger summons it.
- The collapsed rail still shows the active marker.
- This is the one exception to progressive disclosure (Section 5): navigation is never clutter to
  tidy away.

Availability: live `s-nav` ships three colour contexts (White / Charcoal / Dark green), two sizes
(Regular 208px / Small 170px) and a `.snav--collapsed` rail (72px / 60px) with an edge-docked
toggle — read the component's own live source rather than reconstructing the rail.

### Form field consistency

A form, filter row or panel mixing Text Inputs, Dropdowns and Search fields uses **one field style
throughout**: one label position for every field in the group (all Caption-outside or all inline —
never mixed, and never a labelled field beside an unlabelled one); matched field heights and sizes
across the group (a Dropdown beside a Text Input in one row is the same height); one shared
alignment line — labels align with labels, fields with fields. Different field *types* combine
freely; the label-position and sizing convention is the one-choice-per-group constraint.

### Avatar-plus-name cells

An avatar-plus-name cell is a flex row, not two inline `<span>`s with a hand-tuned margin:
`[avatar] [name (+ optional stacked subtitle)]` in a flex container with the avatar
`flex-shrink:0`, so a long name wraps to a second line inside its own column, aligned under the
first line — instead of sliding left and reappearing under the avatar. Verify by actually wrapping
a long name, not by eyeballing short ones.

### Chart sizing and legibility

A chart is only a chart if it can be read. Charts have a minimum useful size; squeezing several
into narrow cells or one shared panel produces unreadable axes and sparkline-sized bars — the most
common way a reskin makes a dashboard worse while using the right component.

- One chart per cell, sized for the chart; never several charts packed into one panel. Charts lay
  out as peers on the page grid, each with its own caption.
- Respect a real minimum width: below ~320–360px a bar or line chart with axis labels stops being
  legible. Desktop: **at most two category-axis charts per row**; a single trend chart carrying the
  page's main story earns a full-width or two-column cell.
- Scale down by stacking charts one per row at full width — never four abreast at a quarter of
  legible size.
- A trend line is not a sparkline: a trend that matters gets a real chart cell with labelled axes
  and value labels. Inline sparklines belong in dense table rows or stat tiles, where a shape-only
  impression is the intent — never as the page's actual trend chart.
- Label density scales with size: fewer ticks, drop per-point labels rather than overlap them.
- Charts are for comparison: related charts sit as peers in one grid at one size — the same charts
  at different sizes in different containers do not read as a comparable set.

### Icon sourcing

Flash's icon set (`s-icons`) is Font Awesome Solid — filled shapes, not outlines. A resolver
summary may list icon *names* only; names are not enough to draw an icon.

- Before touching any icon, fetch the live `s-icons` section's own `ai-ctx` tab in full and read
  its `js` field — the real `ICONS` object, keyed by name, each with a real `vb` (viewBox) and `d`
  (path). This is the one component where the path data itself is what you need.
- For every icon the target needs, check whether that exact name exists in the real `ICONS` data
  first. If it does, use its `vb`/`d` verbatim, rendered filled (`fill="currentColor"`,
  `stroke="none"`) — never redraw a covered icon as an outline, and never substitute a different
  real icon that doesn't semantically match just to claim a real asset (semantic correctness first,
  real-asset second).
- Only for names genuinely outside Flash's set, draw a custom solid glyph — filled, simple
  geometry, no thin outline strokes — visually consistent with Flash's style, and state in the
  report which icons are real Flash assets and which are custom-matched.
- A generic icon library (Feather/Lucide-style outlines or any pre-built set) is never a
  substitute, even as a placeholder (Section 10).

### Size judgement

Regular component sizes by default; Large for dominant, high-consideration or spacious marketing
actions; Small in compact product areas; XSmall/XXSmall only in dense toolbars, rows or secondary
controls. Preserve the live minimum 44×44px tappable area when the visible control is smaller.
Keep one size within a component group unless hierarchy requires a clear exception. **A header /
toolbar / filter row is one group: every button in it takes the same size** — emphasis comes from
*variant* (a filled Primary/Accent among Secondary/Simple), never from a taller button. Default a
compact cluster to Small; reserve Regular for a button standing alone or a spacious modal/drawer
footer (consistent within that footer). A search field sharing the row is sized to match. Check
heights actually match; don't eyeball the variants.

## 9. Responsive and accessibility

Responsive design reprioritises and reflows, not merely shrinks. When width becomes limited:
stack or reflow columns; preserve the primary content and action; reduce gaps using live spacing
tokens; move genuinely secondary controls; change to the appropriate mobile component pattern; use
the mobile typography tokens.

Requirements: no horizontal page overflow; no clipped content; no essential hover-only
interaction; minimum 44×44px touch targets; visible keyboard focus; logical tab order; persistent
field labels; colour never the only state cue; usable at 200% zoom; reduced-motion respected.

Validate at approximately 390px, 768px, 1280px and 1440px, plus every width where the layout
changes.

## 10. Restraint

Do not add: generic blue-purple gradients; glow, glass or floating decorative orbs; a card around
every section; unnecessary pills and badges; multiple green focal points; decorative icons without
meaning; icon sets conflicting with Font Awesome Solid; arbitrary colours, radii, shadows or
spacing; large marketing typography inside functional product screens; animation that does not
explain a state change; invented testimonials, metrics, claims or content.

Do not make the result look like a generic AI template. Flash character comes from confident
typography, contrast, spacing, rounded brand surfaces and the controlled green spark.

## 11. Implementation

- Preserve the existing framework and functional code.
- Reuse the live component's real classes, CSS, states and required interaction logic; adapt
  markup to the project framework without changing component appearance or behaviour.
- Use native semantic elements where applicable; reuse the live semantic tokens.
- Remove or isolate old styles that visibly conflict with the reskin.
- Implement default, hover, focus, pressed, disabled, loading and error states when applicable.
- Do not install another component library to recreate something Flash already ships.
- Do not claim a live component exists when its `AI context` says `placeholder`.
- **Every inline `<svg>` icon needs `display:block`.** An inline `<svg>` reserves invisible
  baseline space and renders visibly off-centre even when its width/height fill the container;
  `vertical-align` does not fix it — only `display:block` (or a centred flex parent) does. A
  padded slot absorbs the offset invisibly, so check icon centring at the smallest size variant
  actually used, not just the default.

## 12. Completion check

Confirm before finishing — each item is specified in full in the section cited:

- [ ] Product behaviour and required content preserved (§1)
- [ ] One clear focal point; correct primary/secondary action hierarchy (§5)
- [ ] Green as a controlled spark, not decoration (§3)
- [ ] Satoshi + live type tokens; weights follow semantic roles (§6)
- [ ] Section headings Black (900); Medium only directly beneath a Black heading (§6)
- [ ] Page-header controls on one row directly under the title, one alignment line (§5)
- [ ] Bloated filter sets behind one Filters trigger; applied filters visible outside (§5)
- [ ] Side Nav present at every width — rail, never hidden, no ×, active item visible (§8)
- [ ] Occasional/side-task forms behind named triggers; settings-shaped forms are links; ≤2 inline
      forms per reading page (§5)
- [ ] Form panel headings unmistakably dominant over Semibold body-size labels (§5)
- [ ] Charts: own cell each, ≤2 category-axis per desktop row, none <~320–360px, stack don't
      shrink, no shared chart panel (§8)
- [ ] Accent only among existing Primary buttons; a lone button is Primary (§3)
- [ ] Live grid and spacing system; cards/containers have a real grouping purpose (§5)
- [ ] Every changed component read from the live system; variants/sizes match intent (§2, §8)
- [ ] One button size per header/toolbar/filter cluster (heights measured); search field matches (§8)
- [ ] Avatar-plus-name cells flex, avatar `flex-shrink:0`, checked with a long name (§8)
- [ ] One label position and field height per form/row (§8)
- [ ] Icon SVGs `display:block`, centred at the smallest used size (§11)
- [ ] No placeholder component fabricated (§2)
- [ ] Icons: Font Awesome Solid only; real `ICONS` `vb`/`d` verbatim from the live `ai-ctx` where
      covered; custom solid glyphs only for uncovered names, each declared in the report (§8)
- [ ] Responsive widths inspected; keyboard focus, touch targets, contrast, zoom usable (§9)
- [ ] Loading, empty, error and disabled states coherent (§11)
- [ ] No generic AI decoration (§10)
- [ ] The running interface — not only the source — visually inspected (§4)

After implementation, report only: the major layout decisions; the Flash components and variants
selected; any unavailable component or justified exception; the viewport widths inspected.
