import { getEditorCode } from '../utils/leetcode.js';

export function initAnalysis(slug) {
  const container = document.getElementById('ls-analysis');

  container.innerHTML = `
    <div id="ls-analysis-inner">
      <p id="ls-analysis-hint">Paste or write your solution, then click analyse.</p>
      <button class="ls-btn" id="ls-analyse-btn">⬡ Analyse complexity</button>
      <div id="ls-analysis-result"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #ls-analysis-hint {
      font-size: 11px;
      color: rgba(200,214,229,0.35);
      font-family: 'JetBrains Mono', monospace;
      margin: 0 0 12px;
    }
    #ls-analyse-btn { width: 100%; margin-bottom: 14px; }
    #ls-analysis-result { font-size: 12px; line-height: 1.7; }
    .ls-complexity-box {
      background: rgba(0,0,0,0.4);
      border: 1px solid rgba(0,212,255,0.15);
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 10px;
    }
    .ls-complexity-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace;
    }
    .ls-complexity-label { color: rgba(200,214,229,0.45); font-size: 11px; }
    .ls-complexity-value { color: #00D4FF; font-size: 13px; font-weight: 600; }
    .ls-complexity-value.space { color: #7B61FF; }
    .ls-complexity-explain {
      font-size: 11px;
      color: rgba(200,214,229,0.55);
      border-top: 1px solid rgba(0,212,255,0.08);
      padding-top: 10px;
      margin-top: 4px;
      line-height: 1.7;
    }
    .ls-loading {
      display: flex;
      align-items: center;
      gap: 10px;
      color: rgba(0,212,255,0.6);
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      padding: 12px 0;
    }
    .ls-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(0,212,255,0.2);
      border-top-color: #00D4FF;
      border-radius: 50%;
      animation: ls-spin 0.8s linear infinite;
      flex-shrink: 0;
    }
    @keyframes ls-spin { to { transform: rotate(360deg); } }
    .ls-error {
      color: #FF4B4B;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      padding: 8px 12px;
      background: rgba(255,75,75,0.07);
      border: 1px solid rgba(255,75,75,0.2);
      border-radius: 6px;
    }
  `;
  document.head.appendChild(style);

  document.getElementById('ls-analyse-btn').addEventListener('click', () => runAnalysis());
}

async function runAnalysis() {
  const result = document.getElementById('ls-analysis-result');
  const btn = document.getElementById('ls-analyse-btn');

  const code = await getEditorCode();

  if (!code || !code.trim()) {
    result.innerHTML = `<div class="ls-error">⚠ Editor is empty — write some code first.</div>`;
    btn.disabled = false;
    return;
  }

  btn.disabled = true;
  result.innerHTML = `
    <div class="ls-loading">
      <div class="ls-spinner"></div>
      analysing complexity...
    </div>
  `;

  try {
    const requestId = `${Date.now()}_${Math.random()}`;

    const response = await new Promise((resolve) => {
      window.addEventListener(`ls_analyse_response_${requestId}`, (e) => {
        resolve(e.detail);
      }, { once: true });

      window.dispatchEvent(new CustomEvent('ls_analyse', {
        detail: { code, requestId }
      }));

      setTimeout(() => resolve({ error: 'Request timed out after 15s' }), 15000);
    });

    if (response.error) {
      result.innerHTML = `<div class="ls-error">⚠ ${response.error}</div>`;
      return;
    }

    const { time, space, explanation } = response;
    result.innerHTML = `
      <div class="ls-complexity-box">
        <div class="ls-complexity-row">
          <span class="ls-complexity-label">TIME COMPLEXITY</span>
          <span class="ls-complexity-value">${escapeHtml(time)}</span>
        </div>
        <div class="ls-complexity-row" style="margin-bottom:0">
          <span class="ls-complexity-label">SPACE COMPLEXITY</span>
          <span class="ls-complexity-value space">${escapeHtml(space)}</span>
        </div>
        <div class="ls-complexity-explain">${escapeHtml(explanation)}</div>
      </div>
    `;
  } catch (err) {
    result.innerHTML = `<div class="ls-error">⚠ ${err.message}</div>`;
  } finally {
    btn.disabled = false;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}