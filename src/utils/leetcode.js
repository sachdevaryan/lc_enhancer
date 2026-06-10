// Returns the problem slug from the URL
// e.g. "two-sum" from "leetcode.com/problems/two-sum/"
export function getProblemSlug() {
  const match = window.location.pathname.match(/\/problems\/([^/]+)/);
  return match ? match[1] : null;
}

// Returns the problem title from the DOM
export function getProblemTitle() {
  const el = document.querySelector('[data-cy="question-title"]') 
    || document.querySelector('div[class*="title"] a')
    || document.querySelector('h1');
  return el ? el.textContent.trim() : getProblemSlug();
}

// Returns the current code from the CodeMirror editor
export function getEditorCode() {
  // LeetCode uses CodeMirror 6 embedded in React
  const lines = document.querySelectorAll('.view-lines .view-line');
  if (lines.length === 0) return null;
  return Array.from(lines).map(l => l.textContent).join('\n');
}

// Returns difficulty badge text
export function getDifficulty() {
  const el = document.querySelector('[diff]') 
    || document.querySelector('div[class*="difficulty"]');
  return el ? el.textContent.trim() : 'Unknown';
}