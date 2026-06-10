import { getProblemSlug, getProblemTitle } from '../utils/leetcode.js';
import { injectPanel } from './panel.js';

// LeetCode is a React SPA — the DOM we need isn't always ready
// even at document_idle. We wait for the editor to appear.
function waitForEditor(callback, retries = 20) {
  const editor = document.querySelector('.view-lines');
  if (editor) {
    callback();
  } else if (retries > 0) {
    setTimeout(() => waitForEditor(callback, retries - 1), 500);
  } else {
    console.warn('LeetSense: editor not found after retries');
  }
}

function init() {
  const slug = getProblemSlug();
  const title = getProblemTitle();
  if (!slug) return;

  console.log(`LeetSense loaded for: ${title} (${slug})`);
  injectPanel(slug, title);
}

waitForEditor(init);