import { storage } from '../utils/storage.js';
import { getEditorCode, getProblemSlug, getEditorLanguageExtension } from '../utils/leetcode.js';
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
        background: #2b2d35;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        padding: 18px;
        margin-bottom: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        transition: 0.2s ease;
      }
      .ls-snap-item.manual {
        border-left: 4px solid #5EA1FF;
      }
      .ls-snap-item.auto {
        border-left: 4px solid #9C7CFF;
      }
      .ls-snap-item:hover {
        transform: translateY(-2px);
      }
      .ls-snap-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-family: 'Inter', sans-serif;
        font-size: 11px;
      }
      .ls-snap-num { color: #f4f4f5; font-weight: 700; }
      .ls-snap-time { color: #a1a1aa; flex: 1; font-weight: 500; }
      .ls-snap-lines {
        color: #a1a1aa;
        background: rgba(255,255,255,0.05);
        padding: 2px 6px;
        border-radius: 6px;
        font-weight: 500;
      }
      .ls-snap-expand {
        background: transparent;
        border: 1px solid rgba(255,255,255,0.08);
        color: #a1a1aa;
        font-size: 10px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        padding: 4px 10px;
        border-radius: 10px;
        cursor: pointer;
        transition: 0.2s ease;
      }
      .ls-snap-expand:hover {
        color: #f4f4f5;
        background: #31343d;
        transform: scale(1.02);
      }
      .ls-snap-expand:active { transform: scale(0.98); }
      .ls-snap-download {
        background: transparent;
        border: 1px solid rgba(255,255,255,0.08);
        color: #a1a1aa;
        font-size: 10px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        padding: 4px 10px;
        border-radius: 10px;
        cursor: pointer;
        transition: 0.2s ease;
      }
      .ls-snap-download:hover {
        color: #f4f4f5;
        background: #31343d;
        transform: scale(1.02);
      }
      .ls-snap-download:active { transform: scale(0.98); }
      .ls-snap-preview {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: #a1a1aa;
        margin: 0;
        white-space: pre-wrap;
        word-break: break-all;
        line-height: 1.6;
        border-left: 2px solid rgba(255,255,255,0.1);
        padding-left: 12px;
        background: transparent;
      }
      .ls-snap-full-code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: #f4f4f5;
        margin: 12px 0 0;
        white-space: pre-wrap;
        word-break: break-all;
        line-height: 1.7;
        border-left: 2px solid rgba(255,255,255,0.2);
        padding-left: 12px;
        max-height: 300px;
        overflow-y: auto;
        scrollbar-width: thin;
      }
      .ls-snap-full-code::-webkit-scrollbar { width: 5px; }
      .ls-snap-full-code::-webkit-scrollbar-track { background: transparent; }
      .ls-snap-full-code::-webkit-scrollbar-thumb { background: #3d414c; border-radius: 100px; }
      .ls-snap-full-code::-webkit-scrollbar-thumb:hover { background: #505565; }
      .ls-snap-tags-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255,255,255,0.06);
        align-items: center;
      }
      .ls-snap-custom-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        padding: 3px 10px;
        border-radius: 20px;
        background: rgba(94,161,255,0.15);
        color: #8db9ff;
      }
      .ls-snap-custom-tag .ls-ctag-remove {
        background: none;
        border: none;
        color: rgba(141,185,255,0.6);
        cursor: pointer;
        font-size: 12px;
        padding: 0;
        line-height: 1;
        transition: 0.2s ease;
      }
      .ls-snap-custom-tag .ls-ctag-remove:hover { color: #8db9ff; }
      .ls-snap-add-tag-btn {
        background: transparent;
        border: 1px dashed rgba(255,255,255,0.15);
        color: #a1a1aa;
        font-size: 10px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        padding: 3px 10px;
        border-radius: 20px;
        cursor: pointer;
        transition: 0.2s ease;
      }
      .ls-snap-add-tag-btn:hover {
        border-color: rgba(255,255,255,0.3);
        color: #f4f4f5;
      }
      .ls-snap-tag-input {
        background: #23242a;
        border: 1px solid rgba(255,255,255,0.1);
        color: #f4f4f5;
        font-size: 10px;
        font-family: 'Inter', sans-serif;
        padding: 4px 10px;
        border-radius: 14px;
        outline: none;
        width: 90px;
        transition: 0.2s ease;
      }
      .ls-snap-tag-input:focus { border-color: rgba(255,255,255,0.3); }
      .ls-snap-tag-save {
        background: #31343d;
        border: 1px solid rgba(255,255,255,0.08);
        color: #f4f4f5;
        font-size: 10px;
        font-family: 'Inter', sans-serif;
        padding: 4px 10px;
        border-radius: 14px;
        cursor: pointer;
        transition: 0.2s ease;
      }
      .ls-snap-tag-save:hover { background: #393d47; transform: scale(1.02); }
      .ls-snap-tag-save:active { transform: scale(0.98); }
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
      div.className = `ls-snap-item ${snap.auto ? 'auto' : 'manual'}`;

      const preview = snap.code.slice(0, 120);
      const isTruncated = snap.code.length > 120;
      const lineCount = snap.code.split('\n').length;

      // Build custom tags HTML
      const customTags = snap.tags || [];
      const customTagsHtml = customTags.map(t =>
        `<span class="ls-snap-custom-tag">${escapeHtml(t)}<button class="ls-ctag-remove" data-tag="${escapeHtml(t)}">×</button></span>`
      ).join('');

      div.innerHTML = `
        <div class="ls-snap-header">
          <span class="ls-snap-num">#${realIndex + 1}</span>
          <span class="ls-snap-time">${formatTime(snap.timestamp)}</span>
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
        const ext = snap.langExt || 'cpp';
        const filename = `${slug}_${dateStr}_${timeStr}.${ext}`;
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
  const langExt = getEditorLanguageExtension();
  existing.push({ code, timestamp: Date.now(), auto, tags: [], langExt });
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
        background: rgba(0,0,0,0.6);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
      }
      #ls-diff-inner {
        width: 640px;
        max-width: 90vw;
        max-height: 80vh;
        background: #23242a;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      }
      #ls-diff-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        background: transparent;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.7;
        color: #f4f4f5;
      }
      #ls-diff-close {
        background: transparent;
        border: 1px solid rgba(255,255,255,0.08);
        color: #a1a1aa;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        font-size: 11px;
        padding: 5px 14px;
        border-radius: 10px;
        cursor: pointer;
        transition: 0.2s ease;
      }
      #ls-diff-close:hover {
        background: #31343d;
        color: #f4f4f5;
        transform: scale(1.02);
      }
      #ls-diff-close:active { transform: scale(0.98); }
      #ls-diff-stats {
        display: flex;
        gap: 16px;
        padding: 10px 20px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        font-size: 11px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        background: rgba(0,0,0,0.1);
      }
      .diff-stat-add { color: #4ADE80; }
      .diff-stat-rem { color: #FF4B4B; }
      .diff-stat-same { color: #a1a1aa; }
      #ls-diff-body {
        overflow-y: auto;
        padding: 12px 0;
        flex: 1;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        line-height: 1.6;
        background: #23242a;
      }
      #ls-diff-body::-webkit-scrollbar { width: 5px; }
      #ls-diff-body::-webkit-scrollbar-track { background: transparent; }
      #ls-diff-body::-webkit-scrollbar-thumb { background: #3d414c; border-radius: 100px; }
      #ls-diff-body::-webkit-scrollbar-thumb:hover { background: #505565; }
      .diff-same {
        padding: 1px 18px;
        color: #a1a1aa;
        white-space: pre;
      }
      .diff-added {
        padding: 1px 18px;
        background: rgba(74,222,128,0.08);
        border-left: 3px solid #4ADE80;
        color: #4ADE80;
        white-space: pre;
      }
      .diff-removed {
        padding: 1px 18px;
        background: rgba(255,75,75,0.08);
        border-left: 3px solid #FF4B4B;
        color: #FF4B4B;
        white-space: pre;
        text-decoration: line-through;
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(modal);

  document.getElementById('ls-diff-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}