import { storage } from '../utils/storage.js';
import { getEditorCode, getProblemSlug } from '../utils/leetcode.js';

export async function initHistory(slug) {
  const container = document.getElementById('ls-history');
  const key = `history:${slug}`;

  await renderHistory(container, key, slug);
  setupAutoSnapshot(slug, key, container);
}

async function renderHistory(container, key, slug) {
  const history = (await storage.get(key)) || [];

  if (!document.getElementById('ls-history-style')) {
    const style = document.createElement('style');
    style.id = 'ls-history-style';
    style.textContent = `
      .ls-snap-item {
        background: rgba(0,0,0,0.35);
        border: 1px solid rgba(123,97,255,0.15);
        border-radius: 8px;
        padding: 10px 12px;
        margin-bottom: 8px;
        transition: border-color 0.15s;
      }
      .ls-snap-item:hover { border-color: rgba(123,97,255,0.4); }
      .ls-snap-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
      }
      .ls-snap-num { color: #7B61FF; font-weight: 600; }
      .ls-snap-time { color: rgba(200,214,229,0.5); flex: 1; }
      .ls-snap-lines {
        color: rgba(0,212,255,0.4);
        background: rgba(0,212,255,0.06);
        padding: 1px 6px;
        border-radius: 4px;
        border: 1px solid rgba(0,212,255,0.1);
      }
      .ls-snap-expand {
        background: none;
        border: 1px solid rgba(0,212,255,0.15);
        color: rgba(0,212,255,0.5);
        font-size: 10px;
        font-family: 'JetBrains Mono', monospace;
        padding: 2px 7px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .ls-snap-expand:hover {
        color: #00D4FF;
        border-color: rgba(0,212,255,0.4);
      }
      .ls-snap-preview {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: rgba(200,214,229,0.45);
        margin: 0;
        white-space: pre-wrap;
        word-break: break-all;
        line-height: 1.5;
        border-left: 2px solid rgba(123,97,255,0.3);
        padding-left: 8px;
      }
      .ls-snap-full-code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: rgba(200,214,229,0.7);
        margin: 8px 0 0;
        white-space: pre-wrap;
        word-break: break-all;
        line-height: 1.6;
        border-left: 2px solid rgba(0,212,255,0.3);
        padding-left: 8px;
        max-height: 300px;
        overflow-y: auto;
      }
      .ls-snap-tag {
        font-size: 9px;
        font-family: 'JetBrains Mono', monospace;
        padding: 1px 5px;
        border-radius: 3px;
        background: rgba(0,212,255,0.08);
        color: rgba(0,212,255,0.5);
        border: 1px solid rgba(0,212,255,0.15);
      }
      .ls-snap-tag.auto {
        background: rgba(123,97,255,0.08);
        color: rgba(123,97,255,0.6);
        border-color: rgba(123,97,255,0.2);
      }
    `;
    document.head.appendChild(style);
  }

  if (history.length === 0) {
    container.innerHTML = `
      <div class="ls-empty">
        <span class="ls-empty-icon">◈</span>
        No snapshots yet.<br>
        Auto-saves on Submit,<br>or save manually below.
      </div>
      <div style="margin-top:12px; text-align:center">
        <button class="ls-btn ls-btn-purple" id="ls-snap-btn">⊕ Save snapshot</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div id="ls-history-list"></div>
      <div style="margin-top:10px; text-align:center">
        <button class="ls-btn ls-btn-purple" id="ls-snap-btn">⊕ Save snapshot</button>
      </div>
    `;

    const list = document.getElementById('ls-history-list');
    [...history].reverse().forEach((snap, i) => {
      const realIndex = history.length - 1 - i;
      const div = document.createElement('div');
      div.className = 'ls-snap-item';

      const preview = snap.code.slice(0, 120);
      const isTruncated = snap.code.length > 120;
      const lineCount = snap.code.split('\n').length;
      const tagHtml = snap.auto
        ? `<span class="ls-snap-tag auto">auto</span>`
        : `<span class="ls-snap-tag">manual</span>`;

      div.innerHTML = `
        <div class="ls-snap-header">
          <span class="ls-snap-num">#${realIndex + 1}</span>
          <span class="ls-snap-time">${formatTime(snap.timestamp)}</span>
          ${tagHtml}
          <span class="ls-snap-lines">${lineCount} lines</span>
          <button class="ls-snap-expand">expand ↓</button>
        </div>
        <pre class="ls-snap-preview" id="ls-snap-preview-${realIndex}">${escapeHtml(preview)}${isTruncated ? '...' : ''}</pre>
        <div id="ls-snap-full-${realIndex}" style="display:none">
          <pre class="ls-snap-full-code">${escapeHtml(snap.code)}</pre>
        </div>
      `;

      list.appendChild(div);

      div.querySelector('.ls-snap-expand').addEventListener('click', (e) => {
        const full = document.getElementById(`ls-snap-full-${realIndex}`);
        const prev = document.getElementById(`ls-snap-preview-${realIndex}`);
        const isOpen = full.style.display !== 'none';
        full.style.display = isOpen ? 'none' : 'block';
        prev.style.display = isOpen ? 'block' : 'none';
        e.target.textContent = isOpen ? 'expand ↓' : 'collapse ↑';
      });
    });
  }

  // Manual snap button
  document.getElementById('ls-snap-btn').addEventListener('click', async () => {
    const btn = document.getElementById('ls-snap-btn');
    const code = await getEditorCode();
    if (!code || !code.trim()) {
      btn.textContent = '⚠ Editor empty';
      setTimeout(() => { btn.textContent = '⊕ Save snapshot'; }, 2000);
      return;
    }
    await saveSnapshot(key, code, false);
    await renderHistory(container, key, slug);
  });
}

async function saveSnapshot(key, code, auto = false) {
  const existing = (await storage.get(key)) || [];
  // Avoid duplicates within 5 seconds
  const last = existing[existing.length - 1];
  if (last && Date.now() - last.timestamp < 5000 && last.code === code) return;
  existing.push({ code, timestamp: Date.now(), auto });
  await storage.set(key, existing);

  // Track daily stats for heatmap
  await trackDailyStat();
}

async function trackDailyStat() {
  const today = new Date().toISOString().slice(0, 10); // "2026-06-10"
  const statsKey = `stats:${today}`;
  const count = (await storage.get(statsKey)) || 0;
  await storage.set(statsKey, count + 1);
}

function setupAutoSnapshot(slug, key, container) {
  // Poll for submit button — more reliable than MutationObserver on LeetCode
  let watchedBtn = null;

  const interval = setInterval(() => {
    // LeetCode's submit button selector
    const submitBtn = document.querySelector('[data-e2e-locator="console-submit-button"]')
      || document.querySelector('button[class*="submit"]');

    if (submitBtn && submitBtn !== watchedBtn) {
      watchedBtn = submitBtn;
      submitBtn.addEventListener('click', async () => {
        // Small delay to let LeetCode register the submission
        setTimeout(async () => {
          const code = await getEditorCode();
          if (!code || !code.trim()) return;
          await saveSnapshot(key, code, true);
          await renderHistory(container, key, slug);
        }, 500);
      });
    }
  }, 2000);

  // Clean up interval when panel is removed
  const panel = document.getElementById('leetsense-panel');
  if (panel) {
    const observer = new MutationObserver(() => {
      if (!document.getElementById('leetsense-panel')) {
        clearInterval(interval);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true });
  }
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}