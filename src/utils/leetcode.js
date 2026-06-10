export function getProblemSlug() {
  const match = window.location.pathname.match(/\/problems\/([^/]+)/);
  return match ? match[1] : null;
}

export function getProblemTitle() {
  const el = document.querySelector('[data-cy="question-title"]') || document.querySelector('h1');
  return el ? el.textContent.trim() : getProblemSlug();
}

export function getDifficulty() {
  const el = document.querySelector('[diff]') || document.querySelector('div[class*="difficulty"]');
  return el ? el.textContent.trim() : 'Unknown';
}

export function getEditorCode() {
  return new Promise((resolve) => {
    try {
      const editors = window.monaco?.editor?.getEditors?.() || [];
      for (const ed of editors) {
        const val = ed.getValue?.();
        if (val && val.trim().length > 0) {
          resolve(val);
          return;
        }
      }
    } catch (e) {}
    resolve(null);
  });
}