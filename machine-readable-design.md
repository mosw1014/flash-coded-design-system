---
document: Flash UI Reskin Guide
version: 2.4.0
design_system: https://mosw1014.github.io/flash-coded-design-system/
purpose: Guide design judgement while the live design system supplies tokens, components and implementation.
scope: Existing interfaces created with Claude, Replit, Lovable or similar tools.
---

# Flash UI Reskin Guide

Use this file to clean up, rearrange and visually refine an existing interface with the live Flash Design System.

This file owns design judgement:

- hierarchy;
- layout;
- spacing;
- alignment;
- typography roles and weights;
- component and variant selection;
- visual restraint;
- responsive prioritisation.

The [live Flash Design System](https://mosw1014.github.io/flash-coded-design-system/) owns:

- exact tokens and values;
- component anatomy;
- classes;
- states;
- CSS;
- JavaScript and builder functions;
- implementation examples;
- current component availability.

Do not duplicate the design system inside this file. Always treat the live system as the current source of truth.

## 1. Scope

This is a reskin and refinement task, not an unrestricted product redesign.

### Preserve unless explicitly authorised

- routes and navigation destinations;
- features and business logic;
- data and API behaviour;
- working interactions;
- form requirements;
- approved content;
- analytics and event hooks;
- accessibility semantics;
- framework and project structure.

### You may change

- content order within a page;
- section grouping;
- widths, columns and responsive reflow;
- visual hierarchy;
- spacing and alignment;
- typography size, role and weight;
- surface, border, radius and elevation treatment;
- which Flash component represents an existing function;
- which available component variant and size is most appropriate;
- placement and visual priority of actions.

Do not remove content or functionality merely to make the interface look cleaner. Reduce visual noise before reducing information.

### Priority order

1. Explicit user requirements
2. Working product behaviour and verified content
3. Live Flash Design System
4. This design judgement guide
5. Agent preference

When this file and the live system differ on an exact component value, use the live system.

## 2. Read the live system selectively

Do not read the complete design-system source line by line.

### At the start of a reskin

1. Inspect the existing interface and list the components actually present.
2. Read the live Brand, Colours, Spacing & Grid, Typography, Elevation and Icons foundations.
3. Read only the live component sections required by the interface.
4. Inspect the visible component example and its `AI context`.
5. Implement from the live component source; use this file to choose and compose it.

### AI context

The live site contains `<pre data-ai-context="…">` blocks. Build a lightweight index from these blocks and load only the relevant entries.

For each selected entry, inspect:

- `status`;
- `realClasses`;
- `css`;
- `js` and `builderFunctions`;
- `usage`;
- `note`;
- the visible example and variant controls.

Interpret `status` as follows:

- `static`: use the real markup and classes shown by the component.
- `js-rendered`: use the provided classes and only the builder or interaction logic required.
- `placeholder`: the component is not available. Do not reconstruct or pretend it exists.

The current Modals and Toasts sections are placeholders. Preserve an existing working pattern or use another suitable available component; do not fabricate a Flash modal or toast.

Do not copy documentation-only playgrounds, galleries, phone frames, reference grids or navigation chrome into the product. Copy the reusable component, not the page demonstrating it.

## 3. Flash design character

Every result should feel:

- bold;
- direct;
- energetic;
- clear;
- controlled.

Apply that character through confident hierarchy and selective contrast—not constant decoration.

### The green spark

Black, white and neutral surfaces should do most of the structural work. Green marks the most important moment.

- Aim for one dominant green moment per screen.
- Use green for a primary brand highlight, active marker or rare standout action.
- Do not scatter green across headings, icons, borders, badges and buttons.
- On light surfaces, use the accessible green token identified by the live system; do not use bright Flash Green as body text on white.
- Use semantic success green for success, not as general decoration.

The coded Button system distinguishes `Primary` from `Accent`: Primary is the normal high-emphasis action; Accent is the rare brand-coloured spotlight. Do not treat Accent as the default primary button.

- **Accent requires Primary buttons already present on the page.** Accent's whole purpose is to draw attention to the one main action *among* other Primary buttons already competing for attention — it is a spotlight relative to existing Primary emphasis, not a stronger default button.
- **If a page has only one button, that button is Primary, never Accent.** A lone button has no competing Primary emphasis for Accent to stand out against, so Accent on its own reads as an arbitrary colour choice, not a deliberate spotlight.

### Shape

Use generous rounding for major brand surfaces and large containers. Use the exact radius built into each coded component for buttons, cards, inputs, navigation and overlays.

Do not apply one large radius to every object. Large layout surfaces and reusable UI components have different scales.

## 4. Reskin sequence

Work in this order:

1. Understand the screen’s task.
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

Do not start by changing colours. A successful reskin should improve comprehension even in greyscale.

## 5. Hierarchy and layout judgement

### One focal point

Each screen should have one dominant purpose, value or action. Supporting information must remain visibly subordinate.

- Make the page title and primary task obvious.
- Keep one primary action per decision group.
- Place actions near the content they affect.
- Quiet secondary and rare actions rather than hiding them.
- Use size, weight, position and space before colour.

### Rearrangement

You may reorder and regroup existing content when it improves the task.

Good interventions include:

- moving the primary action closer to the decision;
- placing related controls together;
- separating unrelated content;
- replacing an arbitrary card grid with a list or table;
- converting an unstructured stack into a clear grid;
- moving rare actions into an available menu or contextual pattern;
- placing filters beside the results they control;
- moving supporting information after the primary content;
- stacking columns when their readable width becomes weak.

Do not reorder content solely to make the composition unusual.

### Complex filters

A small filter set (one or two simple controls) stays inline beside the results it controls. Once a filter set grows bloated — several dropdowns, date ranges, toggles and chips competing for space in the header — collapse it behind a single expandable "Filters" trigger (a button that opens a Popover, Drawer or Accordion panel per Section 8) rather than spreading every control across the page permanently.

- The trigger itself stays visible and inline; the individual filter controls only appear once it is opened.
- Keep any already-applied filter visible as a summary or Chip outside the panel, so the current state is legible without opening it.
- Do not collapse a genuinely small, low-count filter row just to add an interaction step — this rule exists to reduce clutter, not to hide simple controls unnecessarily.

### Progressive disclosure — most forms do not belong on the page

The Complex filters rule above is one case of a broader principle: **a form being present in the original layout is not a reason to render it inline in the reskin.** A dashboard or overview page whose job is *reading* — figures, charts, records, status — should show data, not a wall of stacked data-entry panels. Every always-visible form competes with the page's actual focal point and pushes the real content below the fold.

Judge each form by how often it is used and whether it belongs to this page's task:

- **Frequent, and central to this page's task** — keep it inline (e.g. a quick-add row on a page whose whole job is adding records).
- **Occasional, or a side task** — collapse it behind a trigger. The trigger is a Button or Link in the region it belongs to; the form itself lives in a Popover, Drawer, Accordion or dialog per Section 8. Typical examples: *invite a teammate, log a call, add an expense, schedule a report, add a tag, bulk update, import data.*
- **Rare, or account/settings-shaped** — it does not belong on an overview page at all. Link to where it actually lives. Typical examples: *billing contact, change password, notification preferences, currency/locale settings.* These are Settings; a link is the correct representation, not a collapsed panel and certainly not an inline form.

Rules:

- **Do not stack more than one or two inline forms on a reading-oriented page.** If you are laying out a grid of four or more form panels side by side, that layout is the defect — convert all but the most-used one to triggers.
- **The trigger must name the task, not the mechanism** — "Invite a teammate", not "Open form".
- **Keep any resulting state visible outside the panel**, the same way an applied filter stays visible as a Chip — e.g. a count of pending invites, the last logged call — so collapsing the form does not hide its outcome.
- **Preserve the functionality exactly** (Section 1): moving a form behind a trigger changes where it renders, never what it does. Every field, validation rule and submit handler carries over unchanged.
- **Do not collapse a single small form just to add a click.** As with filters, this rule exists to reduce competing panels, not to bury simple, frequent tasks.
- **This applies to forms and side tasks, never to navigation.** Persistent chrome — the Side Nav above all — is explicitly out of scope: it collapses to an icon-only rail but is never hidden or dismissed. See "Navigation is persistent" in Section 8.

### Field-to-label hierarchy inside a form

A form panel has at least three distinct levels, and they must be visibly different sizes/weights — not three near-identical lines of bold text:

1. **The panel/section heading** (e.g. "Quick add") — a section heading: Black (900), at the section- or component-heading size token.
2. **Field labels** (e.g. "Product", "Units", "Revenue") — Semibold (650) at a body size token, clearly smaller and lighter than the heading above them.
3. **Input text and helper text** — Semibold (650) for the value itself, Medium (500) at Body S for helper/caption text.

If the panel heading and its field labels read as the same level — same size, or both bold — the reader cannot tell where the group starts, and the form looks like a list of headings. The heading should be unmistakably dominant over its labels at a glance; if you have to compare them to tell which is which, the gap is too small. A field label is never Black (900), and a panel heading is never merely Semibold.

### Page header layout

A page's top header area (title plus its supporting controls) has one correct structure: the main page title sits on its own line, and every control that belongs to that header — toggles, filter triggers, tabs, buttons — sits together on a single row **directly under the title**, sharing one horizontal alignment line.

- Do not place controls above the title, or beside it on the same line, splitting attention between the title and the controls.
- Every control in that row shares the same baseline/centre alignment — mixed vertical positions (one control centred, another top-aligned) read as unfinished, not intentional.
- This governs the header row specifically; it does not require every action anywhere on the page to move — actions placed beside the specific content they affect (per Rearrangement, above) stay there.

### Grid and spacing

Use the live 8px-based spacing system and grid:

- 4 columns on mobile;
- 8 columns on tablet;
- 12 columns on desktop and wide screens.

Use the live margin and gutter tokens for each viewport.

Spacing rules:

- space within a group is smaller than space between groups;
- section separation is larger than component spacing;
- repeated items use identical gaps;
- alignment takes priority over filling every empty area;
- use white space before borders, shadows or extra containers.

### Containers and cards

Do not turn every section into a card.

Use a Card only for one coherent object, record, summary or destination. Use ordinary layout and spacing for page structure.

Avoid:

- cards nested inside cards;
- many equal-weight metric cards;
- separate borders around every text group;
- decorative surfaces without a grouping purpose.

## 6. Typography decisions

Use the live typography tokens. Do not invent intermediate sizes or weights.

### Typeface

- Use Satoshi for app UI, body copy, labels, inputs, navigation and most headings.
- Use Kilimanjaro Sans only for short, punchy marketing display copy.
- Never use Kilimanjaro Sans for body copy, forms, dashboards or functional UI.

### Weight selection

Use the weight to communicate role:

| Weight | Use |
| ---: | --- |
| 900 Black | One dominant hero or page-level heading; major display moments |
| 800 Bold | Section headings, important values, strong emphasis |
| 650 Semibold | Buttons, input text, UI labels, navigation and compact controls |
| 500 Medium | Body copy, supporting text, captions and reduced-emphasis headings |

Do not make every heading Black. If several headings compete, lower their size or weight according to hierarchy.

- **Section headings always use Black (900).** A section heading is never Semibold or Medium — that flattens the hierarchy the reader relies on to scan the page.
- **Medium (500) is only used for a subheading or supporting line that sits directly beneath a Black section heading** — never as a standalone section heading, and never for a heading with no Black heading immediately above it. If a heading has no Black heading above it, it is itself a section heading and takes Black, not Medium.

### Size selection

Choose a live heading token by semantic role, not by which size happens to fit.

- Hero tokens: marketing and splash moments only.
- Page-title tokens: one per page.
- Section-heading tokens: major content divisions.
- Component-heading tokens: cards, panels and local groups.
- Body L: introductions or featured explanatory content.
- Body M: default interface reading.
- Body S: helper text and secondary detail.
- Body XS/XXS: metadata, timestamps and legal text only.

Use the separate mobile heading tokens at narrow widths.

Keep paragraphs readable and avoid forcing manual line breaks. Heading hierarchy should primarily use size and weight; use muted text tokens for genuinely secondary supporting copy, not to compensate for weak structure.

## 7. Colour, surfaces and elevation

### Colour

- Use semantic tokens rather than arbitrary hex values.
- Use black or white for normal high-emphasis actions and text.
- Reserve brand green for the most important brand moment.
- Use blue for links and informational interaction where defined.
- Use status colours only for their actual semantic meaning.
- Prefer neutral or subtle green-tinted surfaces over decorative colour blocks.
- Verify contrast in the implemented context.

### Surfaces

Choose the lightest treatment that communicates the relationship:

1. spacing;
2. alignment;
3. subtle surface tone;
4. border;
5. elevation.

Do not use a shadow merely to make an object feel “premium”.

### Elevation

Use the live elevation level associated with the layer:

- XS for cards and tiles;
- S for tooltips and secondary overlays;
- M for menus and dropdowns;
- L for drawers and high overlays;
- XL only for the highest-priority notification layer.

If the component already defines its elevation, use that implementation.

## 8. Component selection

Read the relevant live component page before implementing any component below.

| Need | Choose | Decision rule |
| --- | --- | --- |
| Main action | Buttons `s-buttons` | Primary for the normal main action; Secondary for support; Accent only when Primary buttons already exist on the page and one action needs to stand out among them — never the only button on a page; Simple for low emphasis; Link for inline action |
| Group one coherent object | Cards `s-cards` | Basic for content, Footer when actions need separation, Media when imagery matters, Interactive only when the whole card has one destination |
| Persistent app destinations | Navigation `s-nav` | Side Nav for a small set of top-level destinations; one active item; one colour context and size per panel. **Persistent chrome: collapsible to an icon-only rail, never dismissible** — see Navigation is persistent, below |
| Related views of one object | Tabs `s-tabs` | One active tab; short parallel labels; do not use for unrelated destinations |
| Two to five modes or options | Toggle Group `s-toggle-group` | Use instead of a dropdown when options benefit from immediate comparison |
| Five to fifteen known options | Dropdown `s-dropdown` | Single-select by default; multi-select only when multiple answers are valid; use one field style consistently |
| Typed data | Text Inputs `s-inputs` | Standard field for submitted values; Caption label is the default; Inline only in genuinely compact layouts |
| Filtering a result set | Search field `s-inputs` | Use the Search pill only for finding or filtering, with a real loading state. **When it sits in the same row as a Small button (e.g. a "Filters" trigger), size the search field to match that button's height** — the same one-size-per-cluster rule below applies across a search+button row, not just a button-only row |
| Independent choices | Checkboxes `s-selection` | Use for opt-ins and multiple independent selections |
| One choice from visible options | Radios `s-selection` | Use when exactly one option is required and the set is worth showing |
| Immediate on/off setting | Switch `s-switch` | Use only when the change takes effect immediately; otherwise use a checkbox |
| Read-only metadata or state | Tags & Badges `s-tags` | Tags are not interactive; use semantic colour only when it adds meaning |
| Interactive filter or removable value | Chips `s-chips` | Use chips for selection, filtering or removal—not passive metadata |
| Comparable records | Tables `s-tables` | Use for records users scan across columns; right-align numeric values. **An avatar-plus-name cell is a flex row, not two inline `<span>`s with a hand-tuned margin** — lay it out as `[avatar] [name (+ optional subtitle stacked under it)]` in a flex container with the avatar `flex-shrink:0`, so a long name wraps to a second line *inside its own column*, aligned under the first line of the name, instead of sliding left and re-appearing underneath the avatar |
| Optional secondary content | Accordion `s-accordion` | Use for FAQs, optional settings or long supporting content |
| Persistent contextual message | Alert `s-alert` | Match severity; place beside the affected content; do not use critical styling for routine information |
| Short mobile task | Bottom Sheet `s-drawers` | Compact for short tasks; full screen for long lists, multi-field forms or stepped mobile flows |
| Brief explanation | Tooltip `s-tooltip` | Short, non-essential text only |
| Compact contextual interaction | Popover `s-popover` | Use for one focused action or detail connected to a trigger |
| Preview on pointer or focus | Hover Card `s-hover-card` | Never make its content essential; touch users must have another route |
| Short indeterminate wait | Spinner `s-spinner` | Place at the trigger or result location |
| Content-shaped loading | Skeleton `s-skeleton` | Mirror the final layout and prevent shifts |
| Deep hierarchy | Breadcrumb `s-breadcrumb` | Use only for structures at least three levels deep |
| Large countable result set | Pagination `s-pagination` | Keep current, previous and next controls available |
| Date is the main choice | Calendar `s-calendar` | Inline for date-focused tasks; field pattern inside forms |

If a component is not listed here, inspect its live page and `AI context` before choosing it.

### Navigation is persistent — collapsible, never dismissible

Side Nav is **persistent chrome, not page content**. It is the user's map of the product, so it stays on screen at every viewport width. The only permitted reduction is collapsing it to an **icon-only rail**: labels drop away, every destination stays visible and reachable, and the active item stays marked.

- **Never give the Side Nav a control that hides it completely** — no dismiss, no close, no `display:none` toggle. Hiding the only navigation leaves the user with no route back and no indication of where it went; a collapsed rail always beats an absent panel.
- **A close (×) icon on navigation is always wrong.** × means "dismiss this thing" and belongs to dialogs, alerts, chips and drawers. A collapse control is directional (a chevron pointing toward the edge it collapses to) or a menu glyph — never ×. If you find yourself reaching for the `close` icon on persistent chrome, that's the bug.
- **Collapsing is a width response, not a user-cleanup feature.** Follow Section 9: collapse to the rail when width genuinely demands it, and switch to the appropriate mobile navigation pattern at the narrowest widths — where a temporary overlay drawer *is* correct, because it's summoned by a persistent trigger that never disappears.
- **The collapsed state keeps the active marker.** An icon-only rail with no visible active item is not a valid collapsed state — the user must still be able to see where they are.
- **This is the one thing progressive disclosure does not apply to.** The Progressive disclosure rule in Section 5 says to collapse occasional forms and side tasks behind triggers; navigation is the explicit exception. Never treat the nav panel as clutter to be tidied away.

> **Availability:** the live `s-nav` currently ships three colour contexts (White / Charcoal / Dark green) and two sizes (Regular 208px / Small 170px) — it has **no** icon-only rail variant yet. Until it does, treat the rail as a documented gap per Section 2: use the Small size, keep the panel present, and say so in your report rather than inventing a collapsed treatment that doesn't trace back to the live component.

### Form field consistency

A form, filter row or panel that mixes Text Inputs, Dropdowns, Search fields and similar field-shaped controls uses **one consistent field style throughout** — not a different label position or size per field just because each happens to be a different component.

- **Pick one label position and use it for every field in the group.** If one field uses a Caption label placed outside/above the field, every other field in that group does too — do not mix outside-label fields with inline-label fields, or a labelled field with an unlabelled one, in the same form or row.
- **Match field heights and sizes across the group**, the same way button clusters share one size (see Size judgement, below) — a Dropdown next to a Text Input in the same row should be the same height, not a visually different control shape.
- **This produces one shared alignment line**: labels line up with labels, and fields line up with fields, down the group — not a ragged mix of taller/shorter or differently-labelled controls.
- Different field *types* (Text Input vs. Dropdown vs. Search) are fine to combine — it is the label position and sizing convention that must stay one choice per group, not the component itself.

### Chart sizing and legibility

A chart is only a chart if it can be read. Charts have a **minimum useful size**, and squeezing several into a row of narrow cells — or into a shared panel alongside other charts — produces unreadable axis labels, colliding value labels and sparkline-sized bars that carry no information. This is the most common way a reskin makes a dashboard *worse* while technically using the right component.

- **Give each chart its own cell, sized for the chart — do not pack several charts into one panel.** A row of four charts crammed into a single "Revenue" container is a defect. Lay charts out as peers on the page grid, one per cell, each with its own caption.
- **Respect a real minimum width.** Below roughly 320–360px a bar or line chart with axis labels stops being legible. On desktop that generally means **at most two charts per row** for anything with a category axis; a single trend chart that carries the page's main story earns a full-width or two-column-wide cell of its own.
- **Scale down by removing charts, not by shrinking them.** When width is limited (Section 9), stack charts one per row at full width — never keep four abreast at a quarter of the legible size.
- **A trend line is not a sparkline.** If a trend genuinely matters, give it a real chart cell with labelled axes and value labels. Reserve inline sparklines for dense table rows or stat tiles, where a shape-only impression is the whole intent — and never use one as the page's actual trend chart.
- **Label density scales with size.** A small chart shows fewer axis ticks and drops per-point value labels rather than overlapping them; do not render every label into a cell too narrow to hold them.
- **Charts are for comparison, so do not scatter comparable charts across separate panels.** Related charts sitting as peers in one grid, at one size, read as a comparable set; the same charts at different sizes in different containers do not.

### Icon sourcing

Flash's icon set (`s-icons`) is **Font Awesome Solid** — filled shapes, not outlines. A resolver's
own printed summary of this foundation may deliberately exclude the actual path/viewBox data (it can
be large) and list only icon *names*. Names alone are not enough to implement icons correctly — you
must fetch the real path data before drawing a single icon.

- **Before touching any icon, fetch the live `s-icons` section's own `ai-ctx` tab in full** (not a
  resolver summary of it) and read its `js` field — the actual `ICONS` data object, keyed by name,
  each with a real `vb` (viewBox) and `d` (SVG path markup). This is the one component where the
  path data itself, not just the class list, is the thing you need.
- **For every icon the target needs, check whether that exact name exists in the real `ICONS` data
  first.** If it does, use its real `vb`/`d` verbatim, rendered filled (`fill="currentColor"`,
  `stroke="none"`) — never redraw a Flash-covered icon as an outline/stroke glyph, and never
  substitute a different real Flash icon just because it's "real" if it doesn't semantically match
  (e.g. don't reuse the `link` chain icon for a generic "open externally" arrow just to claim a real
  asset — semantic correctness comes first, real-asset-or-not second).
- **Only for names genuinely outside Flash's icon set**, draw a custom solid glyph — filled shapes,
  simple geometry, no thin outline strokes — visually consistent with Flash's solid style. State
  plainly in the report which icons are real Flash assets and which are custom-matched, so nobody
  mistakes a custom glyph for a verified one.
- A generic icon library (Feather/Lucide-style outline icons, or any other pre-built set) is never an
  acceptable substitute for Flash's own icons, even as a placeholder — see Restraint, below.

### Size judgement

- Use Regular component sizes by default.
- Use Large for dominant, high-consideration or spacious marketing actions.
- Use Small in compact product areas.
- Use XSmall or XXSmall only in dense toolbars, rows or secondary controls.
- Preserve the live minimum 44×44px tappable area when the visible control is smaller.
- Keep one size within a component group unless hierarchy requires a clear exception.
- **A header / toolbar / filter row of buttons is one group: every button in it takes the same
  size — no mixing Small and Regular in the same cluster.** Emphasis on the primary action comes
  from its *variant* (a filled Primary/Accent among Secondary/Simple buttons), never from making it
  taller than its neighbours. Default a compact action cluster to Small; reserve Regular for a
  button standing alone (or a spacious modal/drawer footer, kept consistent within that footer).
  A Small utility button beside a Regular create button in the same row is the failure this rule
  exists to prevent — check button heights actually match, don't just eyeball the variants.

## 9. Responsive and accessibility

Responsive design must reprioritise and reflow the interface, not merely shrink it.

When width becomes limited:

1. stack or reflow columns;
2. preserve the primary content and action;
3. reduce gaps using live spacing tokens;
4. move genuinely secondary controls;
5. change to the appropriate mobile component pattern;
6. use the mobile typography tokens.

Requirements:

- no horizontal page overflow;
- no clipped content;
- no essential hover-only interaction;
- minimum 44×44px touch targets;
- visible keyboard focus;
- logical tab order;
- persistent field labels;
- colour is never the only state cue;
- content remains usable at 200% zoom;
- reduced-motion preferences are respected.

Validate at approximately 390px, 768px, 1280px and 1440px, plus every width where the layout changes.

## 10. Restraint

Do not add:

- generic blue-purple gradients;
- glow, glass or floating decorative orbs;
- a card around every section;
- unnecessary pills and badges;
- multiple green focal points;
- decorative icons without meaning;
- icon sets that conflict with Font Awesome Solid;
- arbitrary colours, radii, shadows or spacing;
- large marketing typography inside functional product screens;
- animation that does not explain a state change;
- invented testimonials, metrics, claims or content.

Do not make the result look like a generic AI template. Flash character comes from confident typography, contrast, spacing, rounded brand surfaces and the controlled green spark.

## 11. Implementation

- Preserve the existing framework and functional code.
- Reuse the live component’s real classes, CSS, states and required interaction logic.
- Adapt markup to the project framework without changing component appearance or behaviour.
- Use native semantic elements where applicable.
- Reuse the live semantic tokens.
- Remove or isolate old styles that visibly conflict with the reskin.
- Implement default, hover, focus, pressed, disabled, loading and error states when applicable.
- Do not install another component library to recreate something already available in Flash.
- Do not claim a live Flash component exists when its `AI context` says `placeholder`.
- **Every inline `<svg>` icon needs `display:block`.** An `<svg>` defaults to inline, which reserves
  invisible baseline/descender space around it — even when its own width/height exactly fill a
  sized container, the icon renders visibly off-centre inside that container. `vertical-align`
  does not fix this; only `display:block` (or making the icon's direct parent a centred flex box)
  removes the inline formatting context that causes it. This is easy to miss because a generously
  padded icon slot can absorb the offset invisibly — it only becomes visible once an icon is placed
  in a tightly-sized box (a small/dense control size, a compact toolbar icon). Check icon centring
  at the smallest size variant actually used, not just the default size.

## 12. Completion check

Before finishing, confirm:

- [ ] Product behaviour and required content are preserved.
- [ ] The screen has one clear focal point.
- [ ] Primary and secondary actions have the correct hierarchy.
- [ ] Green is used as a controlled spark, not decoration.
- [ ] Satoshi and the live type tokens are used correctly.
- [ ] Weight choices follow semantic roles.
- [ ] Every section heading is Black (900); Medium (500) appears only directly beneath a Black
      heading, never as a standalone section heading.
- [ ] Every top page header's controls (toggles, buttons, tabs) sit together on one row directly
      under the page title, sharing one alignment line — not above or beside the title.
- [ ] A bloated filter set is collapsed behind a single expandable Filters trigger, with any
      already-applied filter still visible as a summary outside the panel.
- [ ] The Side Nav is present at every width — collapsed to an icon-only rail where space demands
      it, never hidden or dismissible, and carrying no close (×) control. Its collapsed state still
      shows the active item.
- [ ] Occasional and side-task forms sit behind a named trigger (Popover/Drawer/Accordion/dialog),
      not inline; account/settings-shaped forms are a link, not a panel. No reading-oriented page
      renders more than one or two inline forms.
- [ ] Inside every form, the panel heading is unmistakably dominant over its field labels at a
      glance — heading Black (900) at a heading size, labels Semibold (650) at a body size. No
      field label is Black; no panel heading is merely Semibold.
- [ ] Every chart has its own cell at a legible size — at most two category-axis charts per
      desktop row, none below ~320–360px wide, and charts stack one-per-row rather than shrinking
      when width is limited. No row of charts is packed into a single shared panel.
- [ ] Accent buttons appear only on a page that already has Primary buttons, marking the one main
      action among them; a page with a single button uses Primary, not Accent.
- [ ] Layout follows the live grid and spacing system.
- [ ] Cards and containers have a real grouping purpose.
- [ ] Every changed component was read from the live design system.
- [ ] Component variants and sizes match their intended use.
- [ ] Every button within a single header / toolbar / filter cluster shares one size (heights
      match); primary emphasis comes from variant, not from a taller button. A search field
      sharing that row is sized to match too.
- [ ] Every avatar-plus-name/label cell uses a flex layout (avatar `flex-shrink:0` beside a text
      column) — checked by actually wrapping a long name, not just eyeballing the short ones.
- [ ] Every Text Input, Dropdown and Search field in the same form or row shares one label
      position and one field height — not a mix of outside/inline labels or inconsistent sizes.
- [ ] Every icon SVG renders `display:block` and sits visibly centred in its box at the smallest
      size it's actually used at, not just at the default size.
- [ ] No placeholder component was fabricated.
- [ ] Font Awesome Solid remains the only icon style — every icon the real `s-icons` `ICONS` data
      covers uses its actual `vb`/`d` verbatim (fetched from the live `ai-ctx` tab, not guessed from
      the name), rendered filled; only genuinely uncovered names are custom-drawn, and the report
      says which is which.
- [ ] Responsive layouts were inspected at the required widths.
- [ ] Keyboard focus, touch targets, contrast and zoom remain usable.
- [ ] Loading, empty, error and disabled states remain coherent.
- [ ] No generic AI decoration was introduced.
- [ ] The running interface—not only the source—was visually inspected.

After implementation, report only:

- the major layout decisions;
- the Flash components and variants selected;
- any unavailable component or justified exception;
- the viewport widths inspected.
