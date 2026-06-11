import { storage } from '../utils/storage.js';
import { getProblemSlug } from '../utils/leetcode.js';
import { showDiffModal, formatTime } from './history.js';

export async function initDiffTab(slug) {
  const container = document.getElementById('ls-diff');
  const key = `history:${slug}`;

  if (!document.getElementById('ls-difftab-style')) {
    const style = document.createElement('style');
    style.id = 'ls-difftab-style';
    style.textContent = `
      .ls-diff-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .ls-diff-selector-label {
        font-size: 9px;
        font-family: 'JetBrains Mono', monospace;
        color: rgba(200,214,229,0.3);
        letter-spacing: 0.8px;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .ls-diff-select {
        width: 100%;
        background: rgba(0,0,0,0.5);
        color: #c8d6e5;
        border: 1px solid rgba(0,212,255,0.2);
        border-radius: 6px;
        padding: 7px 10px;
        font-size: 11px;
        font-family: 'JetBrains Mono', monospace;
        outline: none;
        cursor: pointer;
        transition: border-color 0.15s;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(0,212,255,0.4)'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
      }
      .ls-diff-select:focus { border-color: rgba(0,212,255,0.5); }
      .ls-diff-select option {
        background: #080B14;
        color: #c8d6e5;
      }
      .ls-diff-compare-btn {
        width: 100%;
        margin-top: 4px;
      }
      .ls-diff-hint {
        font-size: 10px;
        color: rgba(200,214,229,0.25);
        font-family: 'JetBrains Mono', monospace;
        text-align: center;
        padding: 4px 0;
      }
    `;
    document.head.appendChild(style);
  }

  await renderDiffTab(container, key);
}

async function renderDiffTab(container, key) {
  const history = (await storage.get(key)) || [];

  if (history.length < 2) {
    container.innerHTML = `
      <div class="ls-empty">
        <span class="ls-empty-icon">⟺</span>
        Need at least 2 snapshots<br>to compare diffs.
      </div>
    `;
    return;
  }

  // Build options for dropdowns (newest first)
  const options = [...history].map((snap, i) => {
    const label = `#${i + 1}  ${formatTime(snap.timestamp)}  ${snap.auto ? 'auto' : 'manual'}`;
    return `<option value="${i}">${label}</option>`;
  }).reverse().join('');

  container.innerHTML = `
    <div class="ls-diff-section">
      <div>
        <div class="ls-diff-selector-label">SNAPSHOT A</div>
        <select id="ls-diff-select-a" class="ls-diff-select">
          ${options}
        </select>
      </div>
      <div>
        <div class="ls-diff-selector-label">SNAPSHOT B</div>
        <select id="ls-diff-select-b" class="ls-diff-select">
          ${options}
        </select>
      </div>
      <button class="ls-btn" id="ls-diff-compare-btn" style="width:100%">
        ⟺ Compare snapshots
      </button>
      <div class="ls-diff-hint">select two different snapshots to compare</div>
    </div>
  `;

  // Default select B to second newest
  const selectB = document.getElementById('ls-diff-select-b');
  if (history.length >= 2) {
    selectB.selectedIndex = 1;
  }

  document.getElementById('ls-diff-compare-btn').addEventListener('click', () => {
    const a = parseInt(document.getElementById('ls-diff-select-a').value);
    const b = parseInt(document.getElementById('ls-diff-select-b').value);

    if (a === b) {
      const hint = container.querySelector('.ls-diff-hint');
      hint.textContent = '⚠ select two different snapshots';
      hint.style.color = '#FFB000';
      setTimeout(() => {
        hint.textContent = 'select two different snapshots to compare';
        hint.style.color = '';
      }, 2000);
      return;
    }

    const [idxA, idxB] = [a, b].sort((x, y) => x - y);
    showDiffModal(history[idxA], history[idxB], idxA, idxB);
  });
}
