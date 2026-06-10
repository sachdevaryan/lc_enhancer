import { storage } from '../utils/storage.js';
import { getEditorCode, getProblemSlug } from '../utils/leetcode.js';

export async function initHistory(slug) {
  const container = document.getElementById('ls-history');
  const key = `history:${slug}`;

  await renderHistory(container, key);
  setupAutoSnapshot(slug, key, container);
}

async function renderHistory(container, key) {
  const history = (await storage.get(key)) || [];

  if (history.length === 0) {
    container.innerHTML = `
      <div class="ls-empty">
        <span class="ls-empty-icon">◈</span>
        No snapshots yet.<br>
        Snapshots save automatically<br>when you run or submit.
      </div>
      <div style="margin-top:12px; text-align:center">
        <button class="ls-btn ls-btn-purple" id="ls-snap-btn">⊕ Save snapshot now</button>
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
    // Show newest first
    [...history].reverse().forEach((snap, i) => {
    const realIndex = history.length - 1 - i;
    const div = document.createElement('div');
    div.className = 'ls-snap-item';
    const preview = snap.code.slice(0, 120);
    const isTruncated = snap.code.length > 120;
    div.innerHTML = `
        <div class="ls-snap-header">
        <span class="ls-snap-num">#${realIndex + 1}</span>
        <span class="ls-snap-time">${formatTime(snap.timestamp)}</span>
        <span class="ls-snap-lines">${snap.code.split('\n').length} lines</span>
        <button class="ls-snap-expand" data-index="${realIndex}">expand ↓</button>
        </div>
        <pre class="ls-snap-preview" id="ls-snap-preview-${realIndex}">${escapeHtml(preview)}${isTruncated ? '...' : ''}</pre>
        <div class="ls-snap-full" id="ls-snap-full-${realIndex}" style="display:none">
        <pre class="ls-snap-full-code">${escapeHtml(snap.code)}</pre>
        </div>
    `;
    list.appendChild(div);

    // Expand/collapse toggle
    div.querySelector('.ls-snap-expand').addEventListener('click', (e) => {
        const full = document.getElementById(`ls-snap-full-${realIndex}`);
        const preview2 = document.getElementById(`ls-snap-preview-${realIndex}`);
        const isOpen = full.style.display !== 'none';
        full.style.display = isOpen ? 'none' : 'block';
        preview2.style.display = isOpen ? 'block' : 'none';
        e.target.textContent = isOpen ? 'expand ↓' : 'collapse ↑';
    });
    });
  }

  // Inject styles once
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
        .ls-snap-expand {
    background: none;
    border: 1px solid rgba(0,212,255,0.15);
    color: rgba(0,212,255,0.5);
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    padding: 2px 7px;
    border-radius: 4px;
    cursor: pointer;
    margin-left: auto;
    transition: all 0.15s;
    }
    .ls-snap-expand:hover {
    color: #00D4FF;
    border-color: rgba(0,212,255,0.4);
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
    `;
    document.head.appendChild(style);
  }

  // Snap button
    document.getElementById('ls-snap-btn').addEventListener('click', async () => {
    const code = await getEditorCode();  // add await
    if (!code || !code.trim()) {
        document.getElementById('ls-snap-btn').textContent = '⚠ Editor empty';
        setTimeout(() => document.getElementById('ls-snap-btn').textContent = '⊕ Save snapshot', 2000);
        return;
    }
    const key2 = `history:${getProblemSlug()}`;
    const existing = (await storage.get(key2)) || [];
    existing.push({ code, timestamp: Date.now() });
    await storage.set(key2, existing);
    renderHistory(container, key2);
    });
}

function setupAutoSnapshot(slug, key, container) {
  // Watch for LeetCode's Run / Submit buttons
  const observer = new MutationObserver(() => {
    const submitting = document.querySelector('[data-e2e-locator="console-submit-button"]');
    if (submitting && !submitting.dataset.lsWatched) {
      submitting.dataset.lsWatched = '1';
      submitting.addEventListener('click', async () => {
        const code = getEditorCode();
        if (!code || !code.trim()) return;
        const existing = (await storage.get(key)) || [];
        // Avoid duplicate snapshots within 5 seconds
        const last = existing[existing.length - 1];
        if (last && Date.now() - last.timestamp < 5000) return;
        existing.push({ code, timestamp: Date.now() });
        await storage.set(key, existing);
        renderHistory(container, key);
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}