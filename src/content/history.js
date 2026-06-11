import { storage } from '../utils/storage.js';
import { getEditorCode, getProblemSlug } from '../utils/leetcode.js';
import { diffLines } from '../utils/diff.js';

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
      .ls-snap-download {
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
      .ls-snap-download:hover {
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
      .ls-snap-tags-row {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
        align-items: center;
      }
      .ls-snap-custom-tag {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 9px;
        font-family: 'JetBrains Mono', monospace;
        padding: 1px 6px;
        border-radius: 3px;
        background: rgba(0,212,255,0.08);
        color: #00D4FF;
        border: 1px solid rgba(0,212,255,0.2);
      }
      .ls-snap-custom-tag .ls-ctag-remove {
        background: none;
        border: none;
        color: rgba(0,212,255,0.4);
        cursor: pointer;
        font-size: 10px;
        padding: 0;
        line-height: 1;
        transition: color 0.15s;
      }
      .ls-snap-custom-tag .ls-ctag-remove:hover { color: #FF4B4B; }
      .ls-snap-add-tag-btn {
        background: none;
        border: 1px dashed rgba(123,97,255,0.3);
        color: rgba(123,97,255,0.5);
        font-size: 9px;
        font-family: 'JetBrains Mono', monospace;
        padding: 1px 6px;
        border-radius: 3px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .ls-snap-add-tag-btn:hover {
        border-color: rgba(123,97,255,0.6);
        color: #7B61FF;
      }
      .ls-snap-tag-input {
        background: rgba(0,0,0,0.5);
        border: 1px solid rgba(0,212,255,0.3);
        color: #c8d6e5;
        font-size: 9px;
        font-family: 'JetBrains Mono', monospace;
        padding: 2px 6px;
        border-radius: 3px;
        outline: none;
        width: 80px;
      }
      .ls-snap-tag-input:focus { border-color: rgba(0,212,255,0.6); }
      .ls-snap-tag-save {
        background: rgba(0,212,255,0.1);
        border: 1px solid rgba(0,212,255,0.25);
        color: #00D4FF;
        font-size: 9px;
        font-family: 'JetBrains Mono', monospace;
        padding: 1px 5px;
        border-radius: 3px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .ls-snap-tag-save:hover {
        background: rgba(0,212,255,0.2);
        border-color: rgba(0,212,255,0.5);
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

    const list = container.querySelector('#ls-history-list');

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

      // Build custom tags HTML
      const customTags = snap.tags || [];
      const customTagsHtml = customTags.map(t =>
        `<span class="ls-snap-custom-tag">${escapeHtml(t)}<button class="ls-ctag-remove" data-tag="${escapeHtml(t)}">×</button></span>`
      ).join('');

      div.innerHTML = `
        <div class="ls-snap-header">
          <span class="ls-snap-num">#${realIndex + 1}</span>
          <span class="ls-snap-time">${formatTime(snap.timestamp)}</span>
          ${tagHtml}
          <span class="ls-snap-lines">${lineCount} lines</span>
          <button class="ls-snap-download" title="Download code">⤓</button>
          <button class="ls-snap-expand">expand ↓</button>
        </div>
        <pre class="ls-snap-preview" id="ls-snap-preview-${realIndex}">${escapeHtml(preview)}${isTruncated ? '...' : ''}</pre>
        <div id="ls-snap-full-${realIndex}" style="display:none">
          <pre class="ls-snap-full-code">${escapeHtml(snap.code)}</pre>
        </div>
        <div class="ls-snap-tags-row" id="ls-snap-tags-${realIndex}">
          ${customTagsHtml}
          <button class="ls-snap-add-tag-btn">+ tag</button>
        </div>
      `;

      list.appendChild(div);

      // Expand/collapse
      div.querySelector('.ls-snap-expand').addEventListener('click', (e) => {
        const full = document.getElementById(`ls-snap-full-${realIndex}`);
        const prev = document.getElementById(`ls-snap-preview-${realIndex}`);
        const isOpen = full.style.display !== 'none';
        full.style.display = isOpen ? 'none' : 'block';
        prev.style.display = isOpen ? 'block' : 'none';
        e.target.textContent = isOpen ? 'expand ↓' : 'collapse ↑';
      });

      // Download button
      div.querySelector('.ls-snap-download').addEventListener('click', () => {
        const d = new Date(snap.timestamp);
        const pad = (n) => String(n).padStart(2, '0');
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
        const timeStr = `${pad(d.getHours())}-${pad(d.getMinutes())}`;
        const filename = `${slug}_${dateStr}_${timeStr}.cpp`;
        const blob = new Blob([snap.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      });

      // Custom tag: delete
      div.querySelectorAll('.ls-ctag-remove').forEach(btn => {
        btn.addEventListener('click', async () => {
          const tagToRemove = btn.dataset.tag;
          const hist = (await storage.get(key)) || [];
          if (hist[realIndex]) {
            hist[realIndex].tags = (hist[realIndex].tags || []).filter(t => t !== tagToRemove);
            await storage.set(key, hist);
            await renderHistory(container, key, slug);
          }
        });
      });

      // Custom tag: add
      const addBtn = div.querySelector('.ls-snap-add-tag-btn');
      addBtn.addEventListener('click', () => {
        const tagsRow = document.getElementById(`ls-snap-tags-${realIndex}`);
        // Prevent multiple inputs
        if (tagsRow.querySelector('.ls-snap-tag-input')) return;

        const input = document.createElement('input');
        input.className = 'ls-snap-tag-input';
        input.placeholder = 'tag...';
        input.maxLength = 30;

        const saveBtn = document.createElement('button');
        saveBtn.className = 'ls-snap-tag-save';
        saveBtn.textContent = '✓';

        const saveTag = async () => {
          const val = input.value.trim().toLowerCase();
          if (!val) { input.remove(); saveBtn.remove(); return; }
          const hist = (await storage.get(key)) || [];
          if (hist[realIndex]) {
            if (!hist[realIndex].tags) hist[realIndex].tags = [];
            if (!hist[realIndex].tags.includes(val)) {
              hist[realIndex].tags.push(val);
              await storage.set(key, hist);
            }
            await renderHistory(container, key, slug);
          }
        };

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') saveTag();
          if (e.key === 'Escape') { input.remove(); saveBtn.remove(); }
        });
        saveBtn.addEventListener('click', saveTag);

        tagsRow.insertBefore(input, addBtn);
        tagsRow.insertBefore(saveBtn, addBtn);
        input.focus();
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
  existing.push({ code, timestamp: Date.now(), auto, tags: [] });
  await storage.set(key, existing);

  // Track daily stats for heatmap
  await trackDailyStat();
}

async function trackDailyStat() {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const today = new Date(d.getTime() - offset).toISOString().slice(0, 10);
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

export function formatTime(ts) {
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

export function showDiffModal(snapA, snapB, indexA, indexB) {
  // Remove existing modal
  document.getElementById('ls-diff-modal')?.remove();

  const diff = diffLines(snapA.code, snapB.code);

  const modal = document.createElement('div');
  modal.id = 'ls-diff-modal';

  const diffHtml = diff.map(d => {
    if (d.type === 'same') {
      return `<div class="diff-same"> ${escapeHtml(d.line)}</div>`;
    } else if (d.type === 'added') {
      return `<div class="diff-added">+${escapeHtml(d.line)}</div>`;
    } else {
      return `<div class="diff-removed">-${escapeHtml(d.line)}</div>`;
    }
  }).join('');

  modal.innerHTML = `
    <div id="ls-diff-inner">
      <div id="ls-diff-header">
        <span id="ls-diff-title">
          diff <span style="color:#7B61FF">#${indexA + 1}</span>
          <span style="color:rgba(200,214,229,0.3)">→</span>
          <span style="color:#00D4FF">#${indexB + 1}</span>
        </span>
        <button id="ls-diff-close">✕ close</button>
      </div>
      <div id="ls-diff-stats">
        <span class="diff-stat-add">+${diff.filter(d => d.type === 'added').length} added</span>
        <span class="diff-stat-rem">-${diff.filter(d => d.type === 'removed').length} removed</span>
        <span class="diff-stat-same">${diff.filter(d => d.type === 'same').length} unchanged</span>
      </div>
      <div id="ls-diff-body">${diffHtml}</div>
    </div>
  `;

  const style = document.createElement('style');
  style.id = 'ls-diff-style';
  if (!document.getElementById('ls-diff-style')) {
    style.textContent = `
      #ls-diff-modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.75);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
      }
      #ls-diff-inner {
        width: 640px;
        max-width: 90vw;
        max-height: 80vh;
        background: #080B14;
        border: 1px solid rgba(0,212,255,0.2);
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.05);
      }
      #ls-diff-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(0,212,255,0.08);
        background: rgba(0,0,0,0.3);
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        font-weight: 600;
        color: #c8d6e5;
      }
      #ls-diff-close {
        background: none;
        border: 1px solid rgba(255,75,75,0.2);
        color: rgba(255,75,75,0.6);
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        padding: 3px 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s;
      }
      #ls-diff-close:hover {
        background: rgba(255,75,75,0.1);
        color: #FF4B4B;
        border-color: rgba(255,75,75,0.5);
      }
      #ls-diff-stats {
        display: flex;
        gap: 16px;
        padding: 8px 16px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        border-bottom: 1px solid rgba(0,212,255,0.06);
        background: rgba(0,0,0,0.2);
      }
      .diff-stat-add { color: #22c55e; }
      .diff-stat-rem { color: #FF4B4B; }
      .diff-stat-same { color: rgba(200,214,229,0.3); }
      #ls-diff-body {
        overflow-y: auto;
        padding: 8px 0;
        flex: 1;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        line-height: 1.6;
      }
      #ls-diff-body::-webkit-scrollbar { width: 4px; }
      #ls-diff-body::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius: 2px; }
      .diff-same {
        padding: 1px 16px;
        color: rgba(200,214,229,0.4);
        white-space: pre;
      }
      .diff-added {
        padding: 1px 16px;
        background: rgba(34,197,94,0.08);
        border-left: 3px solid #22c55e;
        color: #22c55e;
        white-space: pre;
      }
      .diff-removed {
        padding: 1px 16px;
        background: rgba(255,75,75,0.08);
        border-left: 3px solid #FF4B4B;
        color: #FF4B4B;
        white-space: pre;
        text-decoration: line-through;
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(modal);

  document.getElementById('ls-diff-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}