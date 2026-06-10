import { storage } from '../utils/storage.js';

export async function initNotes(slug) {
  const container = document.getElementById('ls-notes');
  const key = `notes:${slug}`;
  const saved = await storage.get(key);

  container.innerHTML = `
    <textarea id="ls-notes-area" placeholder="// your notes for ${slug}...&#10;// approach, edge cases, complexity" spellcheck="false">${saved || ''}</textarea>
    <div id="ls-notes-footer">
      <span id="ls-notes-status">●  saved</span>
      <span id="ls-notes-count">${(saved || '').length} chars</span>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #ls-notes-area {
      width: 100%;
      height: 280px;
      background: rgba(0,0,0,0.4);
      color: #c8d6e5;
      border: 1px solid rgba(0,212,255,0.12);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      resize: none;
      outline: none;
      line-height: 1.7;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    #ls-notes-area:focus { border-color: rgba(0,212,255,0.4); }
    #ls-notes-area::placeholder { color: rgba(0,212,255,0.2); }
    #ls-notes-footer {
      display: flex;
      justify-content: space-between;
      padding: 6px 2px 0;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: rgba(0,212,255,0.3);
    }
    #ls-notes-status.saving { color: #FFB000; }
    #ls-notes-status.saved  { color: rgba(0,212,255,0.5); }
  `;
  document.head.appendChild(style);

  const textarea = document.getElementById('ls-notes-area');
  const status   = document.getElementById('ls-notes-status');
  const count    = document.getElementById('ls-notes-count');
  let timer = null;

  textarea.addEventListener('input', () => {
    count.textContent = `${textarea.value.length} chars`;
    status.textContent = '●  saving...';
    status.className = 'saving';
    clearTimeout(timer);
    timer = setTimeout(async () => {
      await storage.set(key, textarea.value);
      status.textContent = '●  saved';
      status.className = 'saved';
    }, 800);
  });
}