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

export function getEditorLanguageExtension() {
  try {
    const editors = window.monaco?.editor?.getEditors?.() || [];
    for (const ed of editors) {
      const val = ed.getValue?.();
      if (val && val.trim().length > 0) {
        const lang = ed.getModel?.()?.getLanguageId?.();
        const map = {
          'python': 'py', 'python3': 'py',
          'javascript': 'js', 'typescript': 'ts',
          'java': 'java', 'csharp': 'cs', 'cpp': 'cpp', 'c': 'c',
          'ruby': 'rb', 'swift': 'swift', 'go': 'go', 'golang': 'go',
          'scala': 'scala', 'kotlin': 'kt', 'rust': 'rs', 'php': 'php',
          'erlang': 'erl', 'elixir': 'ex', 'dart': 'dart'
        };
        return map[lang] || lang || 'cpp';
      }
    }
  } catch (e) {}
  return 'cpp';
}