<p align="center">
  <img src="banner.svg" alt="TextFix — Edit copy visually. Export for your coding agent." width="720" />
</p>

<p align="center">
  <strong>Click any text on a live page, edit it inline, and get structured output<br>you can paste straight into your AI coding agent.</strong>
</p>

<p align="center">
  Works with Claude Code &middot; Cursor &middot; Windsurf &middot; Copilot &middot; Aider &middot; Cline
</p>

---

## The problem

When vibe-coding, copy editing is painful. You find a typo on a live page and then have to describe it to your agent:

> "Change the button that says 'Get Strated' to 'Get Started' — it's in the pricing section, the first card"

Which button? Which component? The agent guesses, greps, gets it wrong, and you go back and forth.

**TextFix eliminates this.** Click the text, fix it, and get precise find-and-replace instructions the agent can act on immediately.

## How it works

1. **Activate** — Click the bookmarklet on any page
2. **Click & edit** — Hover over text elements, click to edit inline with a live preview
3. **Export** — Copy structured markdown with the original text, replacement, and location context

## Output format

When you copy your changes, TextFix generates agent-optimized markdown:

```markdown
### 1. `<button>` — section > div > div:nth-of-type(1) > button

**Location context:**
- Under heading: "Pricing Plans"
- Parent: `div.pricing-card`
- Text before: "$9 / month"

**Search for:**
Get Strated

**Replace with:**
Get Started
```

The agent gets the exact string to search for, what to replace it with, and enough surrounding context to find the right element — even on long pages with repeated patterns.

## Install

**Bookmarklet (recommended):**

1. Visit the [TextFix page](https://coreyrab.github.io/textfix) (or open `index.html` locally)
2. Drag the "Drag to bookmarks bar" button to your bookmarks bar
3. Click it on any page to activate

**Or load manually via DevTools console:**

```js
const s = document.createElement('script');
s.src = 'https://raw.githubusercontent.com/coreyrab/textfix/main/copy-editor.js';
document.body.appendChild(s);
```

## Features

- **Live preview** — See text changes on the page as you type, before committing
- **Draggable editor** — Move the edit popover out of the way when it covers content
- **Change tracking** — All edits logged in a floating panel with visual indicators
- **One-click export** — Copy all changes as structured markdown
- **Location context** — Each change includes nearest heading, parent element, and surrounding text
- **Toggle on/off** — Click the bookmarklet again to deactivate and restore the page
- **Zero dependencies** — Single vanilla JS file, works on any site

## Local development

```bash
git clone https://github.com/coreyrab/textfix.git
cd textfix
python3 -m http.server 8787
# Open http://localhost:8787
```

## License

MIT
