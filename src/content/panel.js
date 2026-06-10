import { initNotes } from './notes.js';
import { initHistory } from './history.js';
import { initAnalysis } from './analysis.js';

export function injectPanel(slug, title) {
  // Don't inject twice (happens on SPA navigation)
  if (document.getElementById('leetsense-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'leetsense-panel';
  panel.innerHTML = `
    <div id="leetsense-header">
      <span id="leetsense-logo">⚡ LeetSense</span>
      <button id="leetsense-toggle">−</button>
    </div>
    <div id="leetsense-tabs">
      <button class="ls-tab active" data-tab="notes">Notes</button>
      <button class="ls-tab" data-tab="history">History</button>
      <button class="ls-tab" data-tab="analysis">Analysis</button>
    </div>
    <div id="leetsense-body">
      <div id="ls-notes" class="ls-panel-section active"></div>
      <div id="ls-history" class="ls-panel-section"></div>
      <div id="ls-analysis" class="ls-panel-section"></div>
    </div>
  `;

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #leetsense-panel {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 340px;
      max-height: 520px;
      background: #1a1a2e;
      border: 1px solid #2d2d4e;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #e0e0e0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    #leetsense-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: #16213e;
      border-bottom: 1px solid #2d2d4e;
      cursor: move;
    }
    #leetsense-logo {
      font-weight: 600;
      font-size: 13px;
      color: #22c55e;
    }
    #leetsense-toggle {
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      font-size: 16px;
      padding: 0;
      line-height: 1;
    }
    #leetsense-toggle:hover { color: #fff; }
    #leetsense-tabs {
      display: flex;
      border-bottom: 1px solid #2d2d4e;
      background: #16213e;
    }
    .ls-tab {
      flex: 1;
      padding: 8px;
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
    }
    .ls-tab:hover { color: #ddd; }
    .ls-tab.active { color: #22c55e; border-bottom-color: #22c55e; }
    #leetsense-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }
    .ls-panel-section { display: none; }
    .ls-panel-section.active { display: block; }
    #leetsense-panel.collapsed #leetsense-body,
    #leetsense-panel.collapsed #leetsense-tabs { display: none; }
  `;

  document.head.appendChild(style);
  document.body.appendChild(panel);

  // Tab switching
  panel.querySelectorAll('.ls-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      panel.querySelectorAll('.ls-tab').forEach(t => t.classList.remove('active'));
      panel.querySelectorAll('.ls-panel-section').forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`ls-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // Collapse toggle
  document.getElementById('leetsense-toggle').addEventListener('click', () => {
    panel.classList.toggle('collapsed');
    document.getElementById('leetsense-toggle').textContent = 
      panel.classList.contains('collapsed') ? '+' : '−';
  });

  // Make panel draggable
  makeDraggable(panel, document.getElementById('leetsense-header'));

  // Init features
  initNotes(slug);
  initHistory(slug);
  initAnalysis(slug);
}

function makeDraggable(panel, handle) {
  let isDragging = false, startX, startY, startRight, startBottom;

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startRight = parseInt(getComputedStyle(panel).right);
    startBottom = parseInt(getComputedStyle(panel).bottom);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panel.style.right = `${startRight - dx}px`;
    panel.style.bottom = `${startBottom - dy}px`;
  });

  document.addEventListener('mouseup', () => isDragging = false);
}