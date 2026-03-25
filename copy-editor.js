(function () {
  // Prevent double-injection
  if (window.__copyEditorActive) {
    window.__copyEditorDeactivate?.();
    return;
  }
  window.__copyEditorActive = true;

  // ── State ──────────────────────────────────────────────
  const changes = [];
  let editMode = true;
  let hoveredEl = null;
  let activePopover = null;

  // ── Styles ─────────────────────────────────────────────
  const STYLES = document.createElement("style");
  STYLES.id = "__copy-editor-styles";
  STYLES.textContent = `
    .__ce-highlight {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px !important;
      cursor: pointer !important;
      transition: outline-color 0.15s ease;
    }
    .__ce-edited {
      outline: 2px dashed #f59e0b !important;
      outline-offset: 2px !important;
      background: rgba(245, 158, 11, 0.08) !important;
    }
    .__ce-popover {
      position: absolute;
      z-index: 2147483647;
      background: #1e1e2e;
      border: 1px solid #45475a;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-width: 320px;
      max-width: 480px;
      color: #cdd6f4;
    }
    .__ce-popover label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #a6adc8;
      margin-bottom: 4px;
    }
    .__ce-popover-original {
      font-size: 13px;
      color: #bac2de;
      background: #313244;
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 12px;
      max-height: 80px;
      overflow-y: auto;
      word-break: break-word;
      line-height: 1.4;
      border: 1px solid #45475a;
    }
    .__ce-popover textarea {
      width: 100%;
      min-height: 60px;
      background: #313244;
      color: #cdd6f4;
      border: 1px solid #585b70;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
      box-sizing: border-box;
      line-height: 1.4;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .__ce-popover textarea:focus {
      border-color: #3b82f6;
    }
    .__ce-popover-buttons {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      justify-content: flex-end;
    }
    .__ce-popover-buttons button {
      padding: 6px 14px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s ease, transform 0.1s ease;
    }
    .__ce-popover-buttons button:active {
      transform: scale(0.97);
    }
    .__ce-btn-save {
      background: #3b82f6;
      color: #fff;
    }
    .__ce-btn-save:hover { background: #2563eb; }
    .__ce-btn-cancel {
      background: #45475a;
      color: #cdd6f4;
    }
    .__ce-btn-cancel:hover { background: #585b70; }

    /* ── Panel ── */
    .__ce-panel {
      position: fixed;
      bottom: 16px;
      right: 16px;
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      color: #cdd6f4;
    }
    .__ce-panel-toggle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #3b82f6;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(59,130,246,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease, transform 0.15s ease;
      position: absolute;
      bottom: 0;
      right: 0;
    }
    .__ce-panel-toggle:hover { background: #2563eb; transform: scale(1.05); }
    .__ce-panel-toggle.__ce-active {
      background: #f59e0b;
      box-shadow: 0 4px 16px rgba(245,158,11,0.4);
    }
    .__ce-panel-toggle.__ce-active:hover { background: #d97706; }
    .__ce-panel-body {
      position: absolute;
      bottom: 60px;
      right: 0;
      width: 420px;
      max-height: 480px;
      background: #1e1e2e;
      border: 1px solid #45475a;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    .__ce-panel-body.__ce-open { display: flex; }
    .__ce-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #45475a;
      background: #181825;
      border-radius: 12px 12px 0 0;
    }
    .__ce-panel-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #cdd6f4;
    }
    .__ce-panel-header-actions {
      display: flex;
      gap: 6px;
    }
    .__ce-panel-header-actions button {
      padding: 4px 10px;
      border: none;
      border-radius: 5px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s ease;
    }
    .__ce-btn-copy {
      background: #3b82f6;
      color: #fff;
    }
    .__ce-btn-copy:hover { background: #2563eb; }
    .__ce-btn-clear {
      background: #45475a;
      color: #cdd6f4;
    }
    .__ce-btn-clear:hover { background: #585b70; }
    .__ce-btn-close-panel {
      background: #45475a;
      color: #cdd6f4;
    }
    .__ce-btn-close-panel:hover { background: #585b70; }
    .__ce-panel-list {
      overflow-y: auto;
      padding: 8px;
      flex: 1;
    }
    .__ce-panel-empty {
      text-align: center;
      color: #6c7086;
      padding: 32px 16px;
      font-style: italic;
    }
    .__ce-change-card {
      background: #313244;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 6px;
      border: 1px solid #45475a;
    }
    .__ce-change-card:last-child { margin-bottom: 0; }
    .__ce-change-num {
      display: inline-block;
      background: #3b82f6;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      border-radius: 50%;
      margin-right: 6px;
    }
    .__ce-change-selector {
      font-size: 11px;
      color: #a6adc8;
      font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
      word-break: break-all;
      margin: 6px 0;
    }
    .__ce-change-diff {
      font-size: 12px;
      line-height: 1.5;
    }
    .__ce-change-old {
      color: #f38ba8;
      text-decoration: line-through;
    }
    .__ce-change-new {
      color: #a6e3a1;
    }
    .__ce-change-remove {
      float: right;
      background: none;
      border: none;
      color: #6c7086;
      cursor: pointer;
      font-size: 14px;
      padding: 0 2px;
      line-height: 1;
    }
    .__ce-change-remove:hover { color: #f38ba8; }
    .__ce-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #f38ba8;
      color: #1e1e2e;
      font-size: 10px;
      font-weight: 700;
      width: 18px;
      height: 18px;
      line-height: 18px;
      text-align: center;
      border-radius: 50%;
      display: none;
    }
    .__ce-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      background: #1e1e2e;
      color: #a6e3a1;
      border: 1px solid #a6e3a1;
      padding: 10px 18px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      opacity: 0;
      transform: translateY(-8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .__ce-toast.__ce-show {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(STYLES);

  // ── Utilities ──────────────────────────────────────────
  function getCSSSelector(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;
    const parts = [];
    let cur = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      let selector = cur.tagName.toLowerCase();
      if (cur.id) {
        parts.unshift(`#${CSS.escape(cur.id)} > ${selector}`);
        break;
      }
      if (cur.className && typeof cur.className === "string") {
        const classes = cur.className
          .trim()
          .split(/\s+/)
          .filter((c) => !c.startsWith("__ce-"))
          .slice(0, 2);
        if (classes.length) selector += "." + classes.map(CSS.escape).join(".");
      }
      const parent = cur.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (s) => s.tagName === cur.tagName
        );
        if (siblings.length > 1) {
          const idx = siblings.indexOf(cur) + 1;
          selector += `:nth-of-type(${idx})`;
        }
      }
      parts.unshift(selector);
      cur = cur.parentElement;
    }
    return parts.join(" > ");
  }

  function isTextElement(el) {
    if (!el || !el.tagName) return false;
    // Skip our own UI
    if (el.closest(".__ce-panel, .__ce-popover, .__ce-toast")) return false;
    // Must have some direct text content
    const hasDirectText = Array.from(el.childNodes).some(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0
    );
    if (!hasDirectText) return false;
    // Target leaf-ish text elements
    const tag = el.tagName.toLowerCase();
    const textTags = [
      "p","span","h1","h2","h3","h4","h5","h6","a","li","td","th",
      "label","button","em","strong","b","i","u","small","mark",
      "code","pre","blockquote","figcaption","dt","dd","summary","legend",
    ];
    if (textTags.includes(tag)) return true;
    // Also divs/sections that are leaf text holders
    if (el.children.length === 0 && el.textContent.trim().length > 0)
      return true;
    return false;
  }

  function getTextContent(el) {
    // Get only the direct text (not deeply nested children's text)
    return Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join("")
      .trim();
  }

  function showToast(msg) {
    const t = document.createElement("div");
    t.className = "__ce-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("__ce-show"));
    setTimeout(() => {
      t.classList.remove("__ce-show");
      setTimeout(() => t.remove(), 200);
    }, 2000);
  }

  // ── Popover ────────────────────────────────────────────
  function closePopover() {
    if (activePopover) {
      activePopover.remove();
      activePopover = null;
    }
  }

  function openPopover(el) {
    closePopover();
    const originalText = el.textContent.trim();
    const pop = document.createElement("div");
    pop.className = "__ce-popover";

    pop.innerHTML = `
      <label>Original</label>
      <div class="__ce-popover-original"></div>
      <label>New Copy</label>
      <textarea class="__ce-popover-textarea"></textarea>
      <div class="__ce-popover-buttons">
        <button class="__ce-btn-cancel" type="button">Cancel</button>
        <button class="__ce-btn-save" type="button">Save Change</button>
      </div>
    `;

    // Set text safely (not innerHTML)
    pop.querySelector(".__ce-popover-original").textContent = originalText;
    const textarea = pop.querySelector("textarea");
    textarea.value = originalText;

    // Position near the element
    document.body.appendChild(pop);
    const rect = el.getBoundingClientRect();
    const popRect = pop.getBoundingClientRect();
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX;

    // Keep on screen
    if (left + popRect.width > window.innerWidth) {
      left = window.innerWidth - popRect.width - 16;
    }
    if (top + popRect.height > window.scrollY + window.innerHeight) {
      top = rect.top + window.scrollY - popRect.height - 8;
    }
    pop.style.top = Math.max(0, top) + "px";
    pop.style.left = Math.max(0, left) + "px";

    activePopover = pop;

    // Focus and select all text
    textarea.focus();
    textarea.select();

    // Handlers
    pop.querySelector(".__ce-btn-cancel").onclick = (e) => {
      e.stopPropagation();
      closePopover();
    };

    pop.querySelector(".__ce-btn-save").onclick = (e) => {
      e.stopPropagation();
      const newText = textarea.value.trim();
      if (newText && newText !== originalText) {
        // Apply the change to the DOM
        el.textContent = newText;
        el.classList.add("__ce-edited");

        // Record it
        changes.push({
          index: changes.length + 1,
          selector: getCSSSelector(el),
          original: originalText,
          updated: newText,
          tagName: el.tagName.toLowerCase(),
          timestamp: new Date().toISOString(),
        });

        renderPanel();
        showToast(`Change #${changes.length} saved`);
      }
      closePopover();
    };

    // Save on Cmd/Ctrl+Enter
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        pop.querySelector(".__ce-btn-save").click();
      }
      if (e.key === "Escape") {
        closePopover();
      }
    });
  }

  // ── Event Handlers ─────────────────────────────────────
  function onMouseOver(e) {
    if (!editMode) return;
    const el = e.target;
    if (!isTextElement(el)) return;
    if (hoveredEl) hoveredEl.classList.remove("__ce-highlight");
    el.classList.add("__ce-highlight");
    hoveredEl = el;
  }

  function onMouseOut(e) {
    if (hoveredEl) {
      hoveredEl.classList.remove("__ce-highlight");
      hoveredEl = null;
    }
  }

  function onClick(e) {
    if (!editMode) return;
    const el = e.target;
    if (el.closest(".__ce-panel, .__ce-popover, .__ce-toast")) return;
    if (!isTextElement(el)) return;
    e.preventDefault();
    e.stopPropagation();
    el.classList.remove("__ce-highlight");
    openPopover(el);
  }

  document.addEventListener("mouseover", onMouseOver, true);
  document.addEventListener("mouseout", onMouseOut, true);
  document.addEventListener("click", onClick, true);

  // ── Panel ──────────────────────────────────────────────
  const panel = document.createElement("div");
  panel.className = "__ce-panel";
  panel.innerHTML = `
    <div class="__ce-panel-body">
      <div class="__ce-panel-header">
        <h3>Copy Edits</h3>
        <div class="__ce-panel-header-actions">
          <button class="__ce-btn-copy" title="Copy changes as markdown">Copy</button>
          <button class="__ce-btn-clear" title="Clear all changes">Clear</button>
          <button class="__ce-btn-close-panel" title="Close panel">✕</button>
        </div>
      </div>
      <div class="__ce-panel-list">
        <div class="__ce-panel-empty">Click any text element to edit it</div>
      </div>
    </div>
    <button class="__ce-panel-toggle" title="Toggle Copy Editor">
      ✎
      <span class="__ce-badge">0</span>
    </button>
  `;
  document.body.appendChild(panel);

  const panelBody = panel.querySelector(".__ce-panel-body");
  const panelList = panel.querySelector(".__ce-panel-list");
  const toggleBtn = panel.querySelector(".__ce-panel-toggle");
  const badge = panel.querySelector(".__ce-badge");
  let panelOpen = false;

  toggleBtn.addEventListener("click", () => {
    panelOpen = !panelOpen;
    panelBody.classList.toggle("__ce-open", panelOpen);
    toggleBtn.classList.toggle("__ce-active", panelOpen);
  });

  panel.querySelector(".__ce-btn-close-panel").addEventListener("click", () => {
    panelOpen = false;
    panelBody.classList.remove("__ce-open");
    toggleBtn.classList.remove("__ce-active");
  });

  panel.querySelector(".__ce-btn-copy").addEventListener("click", () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md).then(() => {
      showToast("Copied to clipboard!");
    });
  });

  panel.querySelector(".__ce-btn-clear").addEventListener("click", () => {
    if (changes.length === 0) return;
    // Remove visual indicators
    document.querySelectorAll(".__ce-edited").forEach((el) => {
      el.classList.remove("__ce-edited");
    });
    changes.length = 0;
    renderPanel();
    showToast("All changes cleared");
  });

  function renderPanel() {
    badge.textContent = changes.length;
    badge.style.display = changes.length > 0 ? "block" : "none";

    if (changes.length === 0) {
      panelList.innerHTML =
        '<div class="__ce-panel-empty">Click any text element to edit it</div>';
      return;
    }

    panelList.innerHTML = changes
      .map(
        (c, i) => `
      <div class="__ce-change-card">
        <span class="__ce-change-num">${c.index}</span>
        <strong>&lt;${c.tagName}&gt;</strong>
        <button class="__ce-change-remove" data-idx="${i}" title="Remove this change">✕</button>
        <div class="__ce-change-selector">${escapeHtml(c.selector)}</div>
        <div class="__ce-change-diff">
          <div class="__ce-change-old">${escapeHtml(c.original)}</div>
          <div class="__ce-change-new">${escapeHtml(c.updated)}</div>
        </div>
      </div>
    `
      )
      .join("");

    // Bind remove buttons
    panelList.querySelectorAll(".__ce-change-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        changes.splice(idx, 1);
        // Re-index
        changes.forEach((c, i) => (c.index = i + 1));
        renderPanel();
      });
    });
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  // ── Markdown Export ────────────────────────────────────
  function generateMarkdown() {
    const url = window.location.href;
    const title = document.title;
    let md = `# Copy Edit Requests\n\n`;
    md += `**Page:** ${title}\n`;
    md += `**URL:** ${url}\n`;
    md += `**Total edits:** ${changes.length}\n\n`;

    // ── Quick reference: search → replace table ──
    md += `## Find and Replace\n\n`;
    md += `For each entry below, search the codebase for the **original** string and replace it with the **updated** string.\n\n`;

    changes.forEach((c) => {
      md += `### ${c.index}. \`<${c.tagName}>\` — ${c.selector}\n\n`;

      // Use fenced blocks so multi-line strings stay intact and agents
      // can copy them without blockquote artifacts
      md += `**Search for:**\n`;
      md += `\`\`\`\n${c.original}\n\`\`\`\n\n`;
      md += `**Replace with:**\n`;
      md += `\`\`\`\n${c.updated}\n\`\`\`\n\n`;
    });

    // ── Compact summary agents can parse programmatically ──
    md += `## Summary (compact)\n\n`;
    md += `\`\`\`\n`;
    changes.forEach((c) => {
      // One-line per change: original → updated
      // Truncate display if very long, but keep full string
      md += `${JSON.stringify(c.original)} → ${JSON.stringify(c.updated)}\n`;
    });
    md += `\`\`\`\n`;

    return md;
  }

  // ── Deactivate ─────────────────────────────────────────
  window.__copyEditorDeactivate = function () {
    document.removeEventListener("mouseover", onMouseOver, true);
    document.removeEventListener("mouseout", onMouseOut, true);
    document.removeEventListener("click", onClick, true);
    closePopover();
    panel.remove();
    STYLES.remove();
    document.querySelectorAll(".__ce-highlight, .__ce-edited").forEach((el) => {
      el.classList.remove("__ce-highlight", "__ce-edited");
    });
    delete window.__copyEditorActive;
    delete window.__copyEditorDeactivate;
    showToast("Copy Editor deactivated");
  };
})();
