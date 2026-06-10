import { getProblemSlug, getProblemTitle } from '../utils/leetcode.js';
import { injectPanel } from './panel.js';

function waitForEditor(callback, retries = 20) {
  const editor = document.querySelector('.view-lines');
  if (editor) {
    callback();
  } else if (retries > 0) {
    setTimeout(() => waitForEditor(callback, retries - 1), 500);
  }
}

function init() {
  const slug = getProblemSlug();
  if (!slug) return;

  // Remove existing panel if navigating between problems
  const existing = document.getElementById('leetsense-panel');
  if (existing) existing.remove();

  const title = getProblemTitle();
  console.log(`LeetSense loaded for: ${title} (${slug})`);
  injectPanel(slug, title);
}

// Initial load
waitForEditor(init);

// SPA navigation — LeetCode changes URL without full page reload
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    if (location.pathname.includes('/problems/')) {
      // Wait for new problem's editor to mount
      setTimeout(() => waitForEditor(init), 800);
    }
  }
}).observe(document.body, { childList: true, subtree: true });