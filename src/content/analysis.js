import { getEditorCode, applyParallax } from '../utils/leetcode.js';

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
      color: #a1a1aa;
      font-family: 'Inter', sans-serif;
      margin: 0 0 16px;
      text-align: center;
      line-height: 1.6;
    }
    #ls-analyse-btn { width: 100%; margin-bottom: 20px; }
    #ls-analysis-result { font-size: 12px; line-height: 1.7; }
    .ls-complexity-box {
      background: #2b2d35;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 20px;
      margin-bottom: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      transition: transform .18s ease, box-shadow .18s ease;
      will-change: transform;
    }
    .ls-complexity-box:hover {
      transform: translateY(-4px) scale(1.03);
      box-shadow: 0 18px 40px rgba(0,0,0,0.22);
    }
    .ls-complexity-box:active {
      transform: translateY(-1px) scale(.99);
      transition: .12s ease;
    }
    .ls-complexity-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-family: 'Inter', sans-serif;
    }
    .ls-complexity-label {
      color: #a1a1aa;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.7;
    }
    .ls-complexity-value {
      background: rgba(74,222,128,0.15);
      color: #4ADE80;
      font-size: 13px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      padding: 8px 16px;
      border-radius: 999px;
    }
    .ls-complexity-value.space {
      background: rgba(94,161,255,0.15);
      color: #5EA1FF;
    }
    .ls-complexity-explain {
      font-size: 12px;
      font-family: 'Inter', sans-serif;
      color: #a1a1aa;
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 14px;
      margin-top: 10px;
      line-height: 1.7;
    }
    .ls-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #a1a1aa;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      padding: 16px 0;
    }
    .ls-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.1);
      border-top-color: #5EA1FF;
      border-radius: 50%;
      animation: ls-spin 0.8s linear infinite;
      flex-shrink: 0;
    }
    @keyframes ls-spin { to { transform: rotate(360deg); } }
    .ls-error {
      color: #FF4B4B;
      font-size: 11px;
      font-family: 'Inter', sans-serif;
      padding: 12px 16px;
      background: rgba(255,75,75,0.07);
      border: 1px solid rgba(255,75,75,0.15);
      border-radius: 14px;
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

    applyParallax(result.querySelector('.ls-complexity-box'));
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