import { initNotes } from './notes.js';
import { initHistory } from './history.js';
import { initAnalysis } from './analysis.js';
import { initDiffTab } from './diffTab.js';
import { storage } from '../utils/storage.js';

export async function injectPanel(slug, title) {
  if (document.getElementById('leetsense-panel')) return;

  // Load fonts
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap';
  document.head.appendChild(font);

  const panel = document.createElement('div');
  panel.id = 'leetsense-panel';
  panel.innerHTML = `
    <div id="leetsense-header">
      <span id="leetsense-logo">
        <span id="ls-logo-text">LeetSense</span>
      </span>
      <div id="ls-header-right">
        <span id="ls-problem-slug">${slug}</span>
        <button id="leetsense-toggle" title="Collapse">−</button>
      </div>
    </div>
    <div id="leetsense-tabs">
      <button class="ls-tab active" data-tab="notes">Notes</button>
      <button class="ls-tab" data-tab="history">History</button>
      <button class="ls-tab" data-tab="diff">Diff</button>
      <button class="ls-tab" data-tab="analysis">Analysis</button>
    </div>
    <div id="leetsense-body">
      <div id="ls-notes" class="ls-panel-section active"></div>
      <div id="ls-history" class="ls-panel-section"></div>
      <div id="ls-diff" class="ls-panel-section"></div>
      <div id="ls-analysis" class="ls-panel-section"></div>
    </div>
    <div id="ls-resize-handle-n" class="ls-resize-handle" data-dir="n"></div>
    <div id="ls-resize-handle-s" class="ls-resize-handle" data-dir="s"></div>
    <div id="ls-resize-handle-e" class="ls-resize-handle" data-dir="e"></div>
    <div id="ls-resize-handle-w" class="ls-resize-handle" data-dir="w"></div>
    <div id="ls-resize-handle-ne" class="ls-resize-handle" data-dir="ne"></div>
    <div id="ls-resize-handle-nw" class="ls-resize-handle" data-dir="nw"></div>
    <div id="ls-resize-handle-se" class="ls-resize-handle" data-dir="se"></div>
    <div id="ls-resize-handle-sw" class="ls-resize-handle" data-dir="sw"></div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #leetsense-panel {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 340px;
      height: 500px;
      background: rgba(30,31,37,0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      z-index: 9999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #f4f4f5;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 320px;
      min-height: 300px;
    }

    /* Header */
    #leetsense-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: transparent;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 4px 20px rgba(94,161,255,0.15);
      cursor: move;
      user-select: none;
      z-index: 2;
    }

    #leetsense-logo {
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 0;
    }

    #ls-logo-text {
      color: #f4f4f5;
    }

    #ls-header-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #ls-problem-slug {
      font-weight: 500;
      font-size: 11px;
      color: #a1a1aa;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #leetsense-toggle {
      background: none;
      border: 1px solid rgba(255,255,255,0.08);
      color: #a1a1aa;
      cursor: pointer;
      font-size: 14px;
      width: 24px;
      height: 24px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: 0.2s ease;
      padding: 0;
    }

    #leetsense-toggle:hover {
      background: #30333b;
      color: #f4f4f5;
      border-color: rgba(255,255,255,0.15);
      transform: scale(1.02);
    }
    #leetsense-toggle:active { transform: scale(0.98); }

    /* Tabs */
    #leetsense-tabs {
      display: flex;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      background: transparent;
      padding: 8px 10px;
      gap: 6px;
    }

    .ls-tab {
      flex: 1;
      padding: 7px 4px;
      background: transparent;
      border: none;
      color: #a1a1aa;
      opacity: 0.7;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      border-radius: 10px;
      transition: 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ls-tab:hover {
      background: #343740;
      opacity: 1;
      color: #f4f4f5;
    }

    .ls-tab.active {
      opacity: 1;
      color: #f4f4f5;
      background: #2f3138;
      font-weight: 600;
      transform: translateY(-1px);
    }

    /* Body */
    #leetsense-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.15) transparent;
    }

    #leetsense-body::-webkit-scrollbar { width: 5px; }
    #leetsense-body::-webkit-scrollbar-track { background: transparent; }
    #leetsense-body::-webkit-scrollbar-thumb {
      background: #3d414c;
      border-radius: 100px;
    }
    #leetsense-body::-webkit-scrollbar-thumb:hover { background: #505565; }

    .ls-panel-section { display: none; }
    .ls-panel-section.active { display: block; }

    /* Collapsed state */
    #leetsense-panel.collapsed {
      height: auto !important;
      min-height: auto;
    }
    #leetsense-panel.collapsed #leetsense-body,
    #leetsense-panel.collapsed #leetsense-tabs {
      display: none;
    }
    #leetsense-panel.collapsed .ls-resize-handle {
      display: none;
    }

    /* Shared component styles used across features */
    .ls-btn {
      background: #31343d;
      border: 1px solid rgba(255,255,255,0.08);
      color: #f4f4f5;
      padding: 8px 14px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: 0.2s ease;
    }

    .ls-btn:hover {
      background: #393d47;
      transform: scale(1.02);
    }

    .ls-btn:active { transform: scale(0.98); }

    .ls-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .ls-btn.ls-btn-purple {
      /* Maintaining class for JS compatibility, but matching new standard button */
      background: #31343d;
      border-color: rgba(255,255,255,0.08);
      color: #f4f4f5;
    }

    .ls-btn.ls-btn-purple:hover {
      background: #393d47;
    }

    .ls-empty {
      text-align: center;
      padding: 32px 20px;
      color: #a1a1aa;
      font-size: 12px;
      line-height: 1.9;
      font-family: 'Inter', sans-serif;
      background: #2b2d35;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 18px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      transition: transform .18s ease, box-shadow .18s ease;
      will-change: transform;
    }

    .ls-empty:hover {
      transform: translateY(-4px) scale(1.03);
      box-shadow: 0 18px 40px rgba(0,0,0,0.22);
    }

    .ls-empty:active {
      transform: translateY(-1px) scale(.99);
      transition: .12s ease;
    }

    .ls-empty-icon {
      font-size: 24px;
      display: block;
      margin-bottom: 10px;
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

    /* Resize handles */
    .ls-resize-handle {
      position: absolute;
      z-index: 10;
    }
    .ls-resize-handle[data-dir="n"] {
      top: -3px; left: 12px; right: 12px; height: 6px;
      cursor: n-resize;
    }
    .ls-resize-handle[data-dir="s"] {
      bottom: -3px; left: 12px; right: 12px; height: 6px;
      cursor: s-resize;
    }
    .ls-resize-handle[data-dir="e"] {
      right: -3px; top: 12px; bottom: 12px; width: 6px;
      cursor: e-resize;
    }
    .ls-resize-handle[data-dir="w"] {
      left: -3px; top: 12px; bottom: 12px; width: 6px;
      cursor: w-resize;
    }
    .ls-resize-handle[data-dir="ne"] {
      top: -3px; right: -3px; width: 14px; height: 14px;
      cursor: ne-resize;
    }
    .ls-resize-handle[data-dir="nw"] {
      top: -3px; left: -3px; width: 14px; height: 14px;
      cursor: nw-resize;
    }
    .ls-resize-handle[data-dir="se"] {
      bottom: -3px; right: -3px; width: 14px; height: 14px;
      cursor: se-resize;
    }
    .ls-resize-handle[data-dir="sw"] {
      bottom: -3px; left: -3px; width: 14px; height: 14px;
      cursor: sw-resize;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(panel);

  // Restore saved dimensions
  const savedWidth = await storage.get('ls_panel_width');
  const savedHeight = await storage.get('ls_panel_height');
  if (savedWidth) panel.style.width = `${savedWidth}px`;
  if (savedHeight) panel.style.height = `${savedHeight}px`;

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
  let lastPanelHeight = null;
  document.getElementById('leetsense-toggle').addEventListener('click', () => {
    const isCollapsing = !panel.classList.contains('collapsed');
    if (isCollapsing) {
      lastPanelHeight = panel.style.height;
      panel.style.height = '';
    } else {
      if (lastPanelHeight) panel.style.height = lastPanelHeight;
    }
    panel.classList.toggle('collapsed');
    document.getElementById('leetsense-toggle').textContent =
      panel.classList.contains('collapsed') ? '+' : '−';
  });

  // Draggable
  makeDraggable(panel, document.getElementById('leetsense-header'));

  // Resizable
  makeResizable(panel);

  // Init features
  initNotes(slug);
  initHistory(slug);
  initDiffTab(slug);
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

function makeResizable(panel) {
  const MIN_W = 320;
  const MIN_H = 300;
  let isResizing = false;
  let resizeDir = '';
  let startX, startY, startW, startH, startRight, startBottom;
  let saveTimer = null;

  panel.querySelectorAll('.ls-resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      resizeDir = handle.dataset.dir;
      startX = e.clientX;
      startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;
      startRight = parseInt(getComputedStyle(panel).right) || 24;
      startBottom = parseInt(getComputedStyle(panel).bottom) || 24;
      document.body.style.cursor = getComputedStyle(handle).cursor;
      document.body.style.userSelect = 'none';
    });
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const maxW = window.innerWidth - 20;
    const maxH = window.innerHeight - 20;

    let newW = startW;
    let newH = startH;
    let newRight = startRight;
    let newBottom = startBottom;

    if (resizeDir.includes('e')) {
      newW = Math.min(maxW, Math.max(MIN_W, startW + dx));
      newRight = startRight - dx;
    }
    if (resizeDir.includes('w')) {
      newW = Math.min(maxW, Math.max(MIN_W, startW - dx));
    }
    if (resizeDir.includes('s')) {
      newH = Math.min(maxH, Math.max(MIN_H, startH + dy));
      newBottom = startBottom - dy;
    }
    if (resizeDir.includes('n')) {
      newH = Math.min(maxH, Math.max(MIN_H, startH - dy));
    }

    // Clamp right/bottom so panel doesn't go off-screen
    if (newRight < 0) newRight = 0;
    if (newBottom < 0) newBottom = 0;

    panel.style.width = `${newW}px`;
    panel.style.height = `${newH}px`;

    if (resizeDir.includes('e')) {
      panel.style.right = `${newRight}px`;
    }
    if (resizeDir.includes('s')) {
      panel.style.bottom = `${newBottom}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (!isResizing) return;
    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // Debounce persist dimensions
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const rect = panel.getBoundingClientRect();
      storage.set('ls_panel_width', Math.round(rect.width));
      storage.set('ls_panel_height', Math.round(rect.height));
    }, 300);
  });
}