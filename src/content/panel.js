import { initNotes } from './notes.js';
import { initHistory } from './history.js';
import { initAnalysis } from './analysis.js';

export function injectPanel(slug, title) {
  if (document.getElementById('leetsense-panel')) return;

  // Load JetBrains Mono from Google Fonts
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap';
  document.head.appendChild(font);

  const panel = document.createElement('div');
  panel.id = 'leetsense-panel';
  panel.innerHTML = `
    <div id="ls-glow-bar"></div>
    <div id="leetsense-header">
      <span id="leetsense-logo">
        <span id="ls-logo-bracket">[</span>
        <span id="ls-logo-text">LeetSense</span>
        <span id="ls-logo-bracket">]</span>
      </span>
      <div id="ls-header-right">
        <span id="ls-problem-slug">${slug}</span>
        <button id="leetsense-toggle" title="Collapse">−</button>
      </div>
    </div>
    <div id="leetsense-tabs">
      <button class="ls-tab active" data-tab="notes">
        <span class="ls-tab-icon">✦</span> Notes
      </button>
      <button class="ls-tab" data-tab="history">
        <span class="ls-tab-icon">◈</span> History
      </button>
      <button class="ls-tab" data-tab="analysis">
        <span class="ls-tab-icon">⬡</span> Analysis
      </button>
    </div>
    <div id="leetsense-body">
      <div id="ls-notes" class="ls-panel-section active"></div>
      <div id="ls-history" class="ls-panel-section"></div>
      <div id="ls-analysis" class="ls-panel-section"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');

    #leetsense-panel {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 340px;
      max-height: 500px;
      background: #080B14;
      border: 1px solid rgba(0, 212, 255, 0.25);
      border-radius: 12px;
      box-shadow:
        0 0 0 1px rgba(0,212,255,0.05),
        0 20px 60px rgba(0,0,0,0.7),
        inset 0 1px 0 rgba(0,212,255,0.1);
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #c8d6e5;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: box-shadow 0.3s ease;
    }

    #leetsense-panel:hover {
      border-color: rgba(0, 212, 255, 0.45);
      box-shadow:
        0 0 0 1px rgba(0,212,255,0.1),
        0 20px 60px rgba(0,0,0,0.8),
        0 0 30px rgba(0,212,255,0.06),
        inset 0 1px 0 rgba(0,212,255,0.15);
    }

    /* Animated top bar */
    #ls-glow-bar {
      height: 2px;
      width: 100%;
      background: linear-gradient(90deg, #7B61FF, #00D4FF, #7B61FF);
      background-size: 200% 100%;
      animation: ls-slide 3s linear infinite;
      flex-shrink: 0;
    }

    @keyframes ls-slide {
      0% { background-position: 0% 0%; }
      100% { background-position: 200% 0%; }
    }

    /* Header */
    #leetsense-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: rgba(0,0,0,0.3);
      border-bottom: 1px solid rgba(0,212,255,0.08);
      cursor: move;
      user-select: none;
    }

    #leetsense-logo {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.5px;
    }

    #ls-logo-bracket {
      color: #7B61FF;
    }

    #ls-logo-text {
      color: #00D4FF;
      margin: 0 2px;
    }

    #ls-header-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #ls-problem-slug {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: rgba(0,212,255,0.45);
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #leetsense-toggle {
      background: none;
      border: 1px solid rgba(0,212,255,0.2);
      color: rgba(0,212,255,0.6);
      cursor: pointer;
      font-size: 14px;
      width: 22px;
      height: 22px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: all 0.15s;
      padding: 0;
    }

    #leetsense-toggle:hover {
      background: rgba(0,212,255,0.1);
      color: #00D4FF;
      border-color: rgba(0,212,255,0.5);
    }

    /* Tabs */
    #leetsense-tabs {
      display: flex;
      border-bottom: 1px solid rgba(0,212,255,0.08);
      background: rgba(0,0,0,0.2);
      padding: 6px 8px 0;
      gap: 4px;
    }

    .ls-tab {
      flex: 1;
      padding: 6px 4px;
      background: none;
      border: 1px solid transparent;
      border-bottom: none;
      color: rgba(200,214,229,0.4);
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      border-radius: 6px 6px 0 0;
      transition: all 0.15s;
      letter-spacing: 0.3px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }

    .ls-tab-icon {
      font-size: 9px;
      opacity: 0.7;
    }

    .ls-tab:hover {
      color: rgba(0,212,255,0.7);
      background: rgba(0,212,255,0.04);
    }

    .ls-tab.active {
      color: #00D4FF;
      background: rgba(0,212,255,0.08);
      border-color: rgba(0,212,255,0.2);
      border-bottom: 1px solid #080B14;
      margin-bottom: -1px;
    }

    .ls-tab.active .ls-tab-icon {
      opacity: 1;
      color: #7B61FF;
    }

    /* Body */
    #leetsense-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      scrollbar-width: thin;
      scrollbar-color: rgba(0,212,255,0.2) transparent;
    }

    #leetsense-body::-webkit-scrollbar { width: 4px; }
    #leetsense-body::-webkit-scrollbar-track { background: transparent; }
    #leetsense-body::-webkit-scrollbar-thumb {
      background: rgba(0,212,255,0.2);
      border-radius: 2px;
    }

    .ls-panel-section { display: none; }
    .ls-panel-section.active { display: block; }

    /* Collapsed state */
    #leetsense-panel.collapsed #leetsense-body,
    #leetsense-panel.collapsed #leetsense-tabs {
      display: none;
    }

    /* Shared component styles used across features */
    .ls-btn {
      background: rgba(0,212,255,0.08);
      border: 1px solid rgba(0,212,255,0.25);
      color: #00D4FF;
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.3px;
    }

    .ls-btn:hover {
      background: rgba(0,212,255,0.15);
      border-color: rgba(0,212,255,0.5);
      box-shadow: 0 0 12px rgba(0,212,255,0.15);
    }

    .ls-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      box-shadow: none;
    }

    .ls-btn.ls-btn-purple {
      background: rgba(123,97,255,0.08);
      border-color: rgba(123,97,255,0.25);
      color: #7B61FF;
    }

    .ls-btn.ls-btn-purple:hover {
      background: rgba(123,97,255,0.15);
      border-color: rgba(123,97,255,0.5);
      box-shadow: 0 0 12px rgba(123,97,255,0.15);
    }

    .ls-empty {
      text-align: center;
      padding: 32px 16px;
      color: rgba(200,214,229,0.3);
      font-size: 12px;
      line-height: 1.8;
    }

    .ls-empty-icon {
      font-size: 24px;
      display: block;
      margin-bottom: 8px;
      opacity: 0.4;
    }

    .ls-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .ls-tag-easy { background: rgba(0,212,255,0.1); color: #00D4FF; border: 1px solid rgba(0,212,255,0.2); }
    .ls-tag-medium { background: rgba(255,176,0,0.1); color: #FFB000; border: 1px solid rgba(255,176,0,0.2); }
    .ls-tag-hard { background: rgba(255,75,75,0.1); color: #FF4B4B; border: 1px solid rgba(255,75,75,0.2); }
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

  // Draggable
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
    startRight = parseInt(getComputedStyle(panel).right) || 24;
    startBottom = parseInt(getComputedStyle(panel).bottom) || 24;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panel.style.right = `${startRight - (e.clientX - startX)}px`;
    panel.style.bottom = `${startBottom - (e.clientY - startY)}px`;
  });

  document.addEventListener('mouseup', () => isDragging = false);
}