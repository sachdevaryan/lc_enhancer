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
        gap: 16px;
      }
      .ls-diff-selector-label {
        font-size: 11px;
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        color: #a1a1aa;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.7;
        margin-bottom: 8px;
      }
      .ls-diff-select {
        width: 100%;
        background: #23242a;
        color: #f4f4f5;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 14px;
        padding: 0 18px;
        height: 48px;
        font-size: 12px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        outline: none;
        cursor: pointer;
        transition: 0.2s ease;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.4)'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 18px center;
      }
      .ls-diff-select:focus { border-color: rgba(255,255,255,0.2); }
      .ls-diff-select option {
        background: #2b2d35;
        color: #f4f4f5;
      }
      .ls-diff-compare-btn {
        width: 100%;
        margin-top: 4px;
      }
      .ls-diff-hint {
        font-size: 11px;
        color: #a1a1aa;
        font-family: 'Inter', sans-serif;
        text-align: center;
        padding: 10px 16px;
        background: #2b2d35;
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
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
