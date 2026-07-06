# Flash Design System — Project Rules for Claude Code

This repository is the shared, collaboratively-edited Flash design system. Multiple designers work on it through Claude Code, each in their own session. Follow these rules in every session, automatically — the person doesn't need to remind you.

---

## 1. Identify the author

At the start of a session, if the person hasn't stated their name, ask for it before making any changes. Use their name as the author for changelog entries (see rule 3). GitHub already tracks commits and PRs automatically by account — this is specifically for the design system's own in-app changelog, which has no other way to know who's making a change.

## 2. Always start from the latest version

Before making any change, get the latest version of `main`. If the project folder is empty or not yet a git repository — which happens if someone is working from a brand-new, empty project folder — clone it from `https://github.com/mosw1014/flash-coded-design-system` instead of failing. Don't assume the folder is already set up; check, and self-heal if it isn't.

## 3. Log every non-trivial change to the in-app changelog

`index.html` has its own changelog built in — a `CHANGELOG` data structure rendered by JS inside the file itself, separate from git history. For any new component, variant, visual fix, or behaviour change, add an entry with:

- **version** — bump patch for fixes, minor for new features
- **date** — today's date
- **author** — the person's stated name from rule 1
- **title** — one-line summary
- **changes[]** — tagged as one of: `added` / `changed` / `fixed` / `removed`

Update both the relevant per-section changelog and the global one, following the existing structure already in the file. Don't invent a new format or skip this step because a change seems small — log it with a brief description regardless.

## 4. Always work on a branch — never commit directly to `main`

For every change:
1. Create a new branch (ask the person for a name, or pick a short, sensible one automatically)
2. Make the change, commit it with a clear message
3. Push the branch
4. Open a pull request

**Do not merge the pull request yourself.** A human reviews and merges — that's the team's checkpoint before anything becomes official. Opening a PR is not the same as publishing.

## 5. Keep changes scoped

Do one clear thing per branch. Don't refactor unrelated sections, rename unrelated tokens, or "clean up while you're in there" unless the person explicitly asked for that too. Small, focused changes are easier to review and far easier to resolve if they ever conflict with someone else's work.

## 6. Never handle credentials in chat

If GitHub authentication is needed, a separate system prompt (browser popup or terminal credential prompt) will handle it — never ask the person to paste a token into the conversation, and never echo one back if they do by mistake. If a token or password does appear in the chat, tell them plainly to treat it as compromised and generate a new one immediately in GitHub settings.

## 7. The live preview updates itself

This repo is connected to GitHub Pages, serving from `main`. Once a pull request is merged, the live site at the project's GitHub Pages URL updates automatically within a couple of minutes. Nothing needs to be manually published, synced, or announced — don't suggest extra steps here.

## 8. Defer to the full guide for anything outside your control

Manual, human-only steps — generating a GitHub token, reviewing a pull request, DNS setup for a custom domain — are documented in `TEAM_SETUP_GUIDE.md` and `CONTRIBUTING.md` in this repo. If someone seems stuck on one of these, point them there rather than guessing at UI details you can't see.
