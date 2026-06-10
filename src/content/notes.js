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
      <button id="ls-notes-export" title="Export as markdown">⤓ export</button>
    </div>
    <div id="ls-tags-section">
      <div id="ls-tags-label">TAGS</div>
      <div id="ls-tags-list"></div>
      <div id="ls-tags-presets"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #ls-notes-area {
      width: 100%;
      height: 220px;
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
      align-items: center;
      padding: 6px 2px 0;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: rgba(0,212,255,0.3);
    }
    #ls-notes-status.saving { color: #FFB000; }
    #ls-notes-status.saved  { color: rgba(0,212,255,0.5); }

    #ls-notes-export {
      background: none;
      border: none;
      color: rgba(0,212,255,0.35);
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s;
    }
    #ls-notes-export:hover { color: #00D4FF; }

    #ls-tags-section {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid rgba(0,212,255,0.07);
    }
    #ls-tags-label {
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      color: rgba(200,214,229,0.25);
      letter-spacing: 0.8px;
      margin-bottom: 8px;
    }
    #ls-tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-bottom: 8px;
      min-height: 8px;
    }
    .ls-tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      background: rgba(0,212,255,0.08);
      border: 1px solid rgba(0,212,255,0.2);
      color: #00D4FF;
    }
    .ls-tag-chip .ls-tag-remove {
      background: none;
      border: none;
      color: rgba(0,212,255,0.4);
      cursor: pointer;
      font-size: 11px;
      padding: 0;
      line-height: 1;
      transition: color 0.15s;
    }
    .ls-tag-chip .ls-tag-remove:hover { color: #FF4B4B; }

    #ls-tags-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .ls-preset-tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      background: rgba(123,97,255,0.06);
      border: 1px solid rgba(123,97,255,0.15);
      color: rgba(123,97,255,0.6);
      cursor: pointer;
      transition: all 0.15s;
    }
    .ls-preset-tag:hover {
      background: rgba(123,97,255,0.15);
      border-color: rgba(123,97,255,0.4);
      color: #7B61FF;
    }
    .ls-preset-tag.active {
      background: rgba(123,97,255,0.2);
      border-color: #7B61FF;
      color: #7B61FF;
    }
  `;
  document.head.appendChild(style);

  const textarea = document.getElementById('ls-notes-area');
  const status   = document.getElementById('ls-notes-status');
  const count    = document.getElementById('ls-notes-count');
  let timer = null;

  // Auto-save
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

  // Export
  document.getElementById('ls-notes-export').addEventListener('click', () => {
    const content = textarea.value;
    if (!content.trim()) return;
    const markdown = `# Notes: ${slug}\n\n${content}\n\n---\n*exported from LeetSense · ${new Date().toLocaleDateString()}*`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leetsense-${slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Tags
  const PRESET_TAGS = ['revisit', 'hard', 'greedy', 'dp', 'graph', 'binary-search', 'sliding-window', 'done'];
  const tagsKey = `tags:${slug}`;

  async function renderTags() {
    const current = (await storage.get(tagsKey)) || [];
    const list = document.getElementById('ls-tags-list');
    const presets = document.getElementById('ls-tags-presets');

    list.innerHTML = '';
    current.forEach(tag => {
      const chip = document.createElement('div');
      chip.className = 'ls-tag-chip';
      chip.innerHTML = `
        ${tag}
        <button class="ls-tag-remove" data-tag="${tag}">×</button>
      `;
      chip.querySelector('.ls-tag-remove').addEventListener('click', async () => {
        const updated = ((await storage.get(tagsKey)) || []).filter(t => t !== tag);
        await storage.set(tagsKey, updated);
        renderTags();
      });
      list.appendChild(chip);
    });

    presets.innerHTML = '';
    PRESET_TAGS.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = `ls-preset-tag${current.includes(tag) ? ' active' : ''}`;
      btn.textContent = `+ ${tag}`;
      btn.addEventListener('click', async () => {
        const existing = (await storage.get(tagsKey)) || [];
        if (existing.includes(tag)) return;
        existing.push(tag);
        await storage.set(tagsKey, existing);
        renderTags();
      });
      presets.appendChild(btn);
    });
  }

  renderTags();
}