# Flash Design System — Project Rules for Claude Code

This repository is the shared, collaboratively-edited Flash design system. Multiple designers work on it through Claude Code, each in their own session. Follow these rules in every session, automatically — the person doesn't need to remind you.

---

## 1. Identify the author

At the start of a session, if the person hasn't stated their name, ask for it before making any changes. Use their name as the author for changelog entries (see rule 4). GitHub already tracks commits and PRs automatically by account — this is specifically for the design system's own in-app changelog, which has no other way to know who's making a change.

## 2. Always start from the latest version

Before making any change, get the latest version of `main`. If the project folder is empty or not yet a git repository — which happens if someone is working from a brand-new, empty project folder — clone it from `https://github.com/mosw1014/flash-coded-design-system` instead of failing. Don't assume the folder is already set up; check, and self-heal if it isn't.

## 3. Read `AI-CONTEXT.md` before touching `index.html`

`AI-CONTEXT.md` documents the conventions, tokens, and structure this design system depends on. Before making any change to `index.html` — a new component, variant, visual fix, or behaviour change — read `AI-CONTEXT.md` in full first. This is not optional and not skippable because a change looks small: the file exists precisely so changes stay consistent with decisions that aren't obvious from the code alone.

## 4. Log every non-trivial change to the in-app changelog

`index.html` has its own changelog built in — a `CHANGELOG` const rendered by JS inside the file itself (around line 7604), separate from git history. It is not optional documentation; treat updating it as part of making the change, not a follow-up step. (This is still part of touching `index.html` — rule 3's requirement to read `AI-CONTEXT.md` first applies here too.)

**Structure.** `CHANGELOG` has two parts, and a real change touches both:

- `CHANGELOG.system` — one global version/history for the whole design system. Bump `SYSTEM_VERSION` (declared just above `CHANGELOG`) and `CHANGELOG.system.version` to match, then prepend a new entry to the **front** of `CHANGELOG.system.entries` (newest first — do not append to the end).
- `CHANGELOG.components` — an array of per-component objects (`{secId, name, version, entries}`), one per section (Charts, Buttons, Text Inputs, etc.). Find the object whose `secId`/`name` matches the section you changed, bump **its own** `version` field, and prepend a matching entry to the **front** of that object's `entries` array.
  - If the change doesn't belong to any existing component/foundation section (e.g. a global nav or theming change), it's fine to log it in `system` only.
  - If you're adding a brand-new section, add a new object to `CHANGELOG.components` with `secId` (must match the `showSection('...')` id used elsewhere in the file), `name`, starting `version` (e.g. `'1.0.0'`), and its own `entries`.

**Each entry, in both places, is:**

```js
{version:'X.Y.Z', date:'YYYY-MM-DD', author:'Name', title:'One-line summary', changes:[
  ['added'|'changed'|'fixed'|'removed', 'Specific, concrete description of what changed and, where useful, why'],
]}
```

- **version** — semver-ish: bump the patch digit for fixes/small tweaks, the minor digit for new features/components, reset patch to 0 on a minor bump. The `system` version and a component's own `version` are independent counters — bumping one does not require bumping the other unless both were actually touched.
- **date** — today's actual date (`YYYY-MM-DD`), not the date of a past entry.
- **author** — the person's stated name from rule 1, exactly as given (this drives the avatar initials in the UI).
- **title** — one line, specific enough to identify the change without reading the tags below it.
- **changes[]** — one array entry per distinct change, each a `[tag, description]` pair. Tag must be exactly one of `added` / `changed` / `fixed` / `removed`. Descriptions should be concrete (name the actual class/token/component touched and the before→after), matching the level of detail already present in existing entries — not vague filler like "misc improvements."

Don't invent a new format, don't skip a field, and don't skip this step because a change seems small — every non-trivial change gets an entry with a real, specific description.

## 5. AI context tabs ("ML blobs") auto-update on commit — don't hand-edit them, don't skip the setup

Some sections of `index.html` carry a machine-readable `<details class="ai-ctx">` tab (see `AI-CONTEXT.md`) — real CSS/JS extracted from the live file, plus auto-extracted Do/Don't `usage` guidance, tied together with a `contentHash`. These are **generated, never hand-typed**, and they self-update:

- **One-time setup per clone**: run `git config core.hooksPath .githooks` once. Git doesn't enable tracked hooks automatically — do this yourself if you haven't, and check it's set (`git config core.hooksPath`) before assuming a commit will self-heal.
- With that set, a `pre-commit` hook (`.githooks/pre-commit`) runs `scripts/auto-update-ai-context.mjs` on every commit touching `index.html`. It re-derives every **existing** tab's hash, regenerates any that drifted (e.g. because you edited a component's classes, JS, or its Do/Don't copy), and re-stages `index.html` before the commit lands — no separate step needed.
- This only refreshes tabs that **already exist**. Adding the first tab to a section not yet covered is still a deliberate, one-time manual step — see `AI-CONTEXT.md`'s "Keeping this honest" section and run `scripts/generate-ai-context-tab.mjs` yourself.
- This is enforced by the hook, not CI — there is no automated PR check for stale tabs. If you haven't enabled the hook (or edited `index.html` outside git, e.g. via GitHub's web UI), a tab can go stale silently. Run `node scripts/verify-ai-context-tabs.mjs` yourself if you want to check, and regenerate per the command it prints.
- Never edit the JSON inside a `<pre data-ai-context="...">` block directly. It's a computed artifact of the real markup/CSS/JS/Do-Don't copy elsewhere in the section — edit the actual component instead and let the hook (or the generator) regenerate the tab from that.

## 6. Always work on a branch — never commit directly to `main`

For every change:
1. Create a new branch (ask the person for a name, or pick a short, sensible one automatically)
2. Make the change, commit it with a clear message
3. Push the branch
4. Open a pull request

**Do not merge the pull request yourself.** A human reviews and merges — that's the team's checkpoint before anything becomes official. Opening a PR is not the same as publishing.

## 7. Keep changes scoped

Do one clear thing per branch. Don't refactor unrelated sections, rename unrelated tokens, or "clean up while you're in there" unless the person explicitly asked for that too. Small, focused changes are easier to review and far easier to resolve if they ever conflict with someone else's work.

## 8. Never handle credentials in chat

If GitHub authentication is needed, a separate system prompt (browser popup or terminal credential prompt) will handle it — never ask the person to paste a token into the conversation, and never echo one back if they do by mistake. If a token or password does appear in the chat, tell them plainly to treat it as compromised and generate a new one immediately in GitHub settings.

## 9. The live preview updates itself

This repo is connected to GitHub Pages, serving from `main`. Once a pull request is merged, the live site at the project's GitHub Pages URL updates automatically within a couple of minutes. Nothing needs to be manually published, synced, or announced — don't suggest extra steps here.

## 10. Defer to the full guide for anything outside your control

Manual, human-only steps — generating a GitHub token, reviewing a pull request, DNS setup for a custom domain — are documented in `TEAM_SETUP_GUIDE.md` and `CONTRIBUTING.md` in this repo. If someone seems stuck on one of these, point them there rather than guessing at UI details you can't see.
