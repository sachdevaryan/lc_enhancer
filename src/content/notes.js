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
      <div id="ls-tags-add-row">
        <input id="ls-tag-input" class="ls-tag-custom-input" placeholder="add tag..." maxlength="30" />
        <button id="ls-tag-add-btn" class="ls-tag-add-save">+ add</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #ls-notes-area {
      width: 100%;
      height: 220px;
      background: #23242a;
      color: #f4f4f5;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 14px 16px;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      resize: none;
      outline: none;
      line-height: 1.7;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
      scrollbar-width: thin;
    }
    #ls-notes-area:focus { border-color: rgba(255,255,255,0.2); }
    #ls-notes-area::placeholder { color: #a1a1aa; opacity: 0.7; }
    #ls-notes-area::-webkit-scrollbar { width: 5px; }
    #ls-notes-area::-webkit-scrollbar-track { background: transparent; }
    #ls-notes-area::-webkit-scrollbar-thumb { background: #3d414c; border-radius: 100px; }
    #ls-notes-area::-webkit-scrollbar-thumb:hover { background: #505565; }

    #ls-notes-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 4px 0;
      font-size: 11px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      color: #a1a1aa;
    }
    #ls-notes-status.saving { color: #F59E0B; }
    #ls-notes-status.saved  { color: rgba(161,161,170,0.7); }

    #ls-notes-export {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.08);
      color: #a1a1aa;
      font-size: 10px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 10px;
      transition: 0.2s ease;
    }
    #ls-notes-export:hover {
      color: #f4f4f5;
      background: #31343d;
      transform: scale(1.02);
    }
    #ls-notes-export:active { transform: scale(0.98); }

    #ls-tags-section {
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    #ls-tags-label {
      font-size: 11px;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      color: #a1a1aa;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.7;
      margin-bottom: 12px;
    }
    #ls-tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
      min-height: 8px;
    }
    .ls-tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 20px;
      background: rgba(94,161,255,0.15);
      color: #8db9ff;
    }
    .ls-tag-chip .ls-tag-remove {
      background: none;
      border: none;
      color: rgba(141,185,255,0.6);
      cursor: pointer;
      font-size: 12px;
      padding: 0;
      line-height: 1;
      transition: 0.2s ease;
    }
    .ls-tag-chip .ls-tag-remove:hover { color: #8db9ff; }

    #ls-tags-add-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .ls-tag-custom-input {
      background: #23242a;
      border: 1px solid rgba(255,255,255,0.1);
      color: #f4f4f5;
      font-size: 10px;
      font-family: 'Inter', sans-serif;
      padding: 5px 12px;
      border-radius: 14px;
      outline: none;
      flex: 1;
      transition: 0.2s ease;
    }
    .ls-tag-custom-input:focus { border-color: rgba(255,255,255,0.3); }
    .ls-tag-add-save {
      background: #31343d;
      border: 1px solid rgba(255,255,255,0.08);
      color: #f4f4f5;
      font-size: 10px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      padding: 5px 12px;
      border-radius: 14px;
      cursor: pointer;
      transition: 0.2s ease;
    }
    .ls-tag-add-save:hover {
      background: #393d47;
      transform: scale(1.02);
    }
    .ls-tag-add-save:active { transform: scale(0.98); }
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

  // Tags — fully custom, no presets
  const tagsKey = `tags:${slug}`;

  async function renderTags() {
    const current = (await storage.get(tagsKey)) || [];
    const list = document.getElementById('ls-tags-list');

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
  }

  // Add tag handler
  const tagInput = document.getElementById('ls-tag-input');
  const tagAddBtn = document.getElementById('ls-tag-add-btn');

  const addTag = async () => {
    const val = tagInput.value.trim().toLowerCase();
    if (!val) return;
    const existing = (await storage.get(tagsKey)) || [];
    if (existing.includes(val)) { tagInput.value = ''; return; }
    existing.push(val);
    await storage.set(tagsKey, existing);
    tagInput.value = '';
    renderTags();
  };

  tagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTag();
  });
  tagAddBtn.addEventListener('click', addTag);

  renderTags();
}