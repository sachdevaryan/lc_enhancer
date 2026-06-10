// Bridge: isolated world — handles chrome.storage and chrome.runtime
// Listens for messages from MAIN world via custom events

window.addEventListener('ls_storage_get', async (e) => {
  const { key, requestId } = e.detail;
  chrome.storage.local.get(key, (result) => {
    window.dispatchEvent(new CustomEvent(`ls_storage_response_${requestId}`, {
      detail: { value: result[key] ?? null }
    }));
  });
});

window.addEventListener('ls_storage_set', async (e) => {
  const { key, value, requestId } = e.detail;
  chrome.storage.local.set({ [key]: value }, () => {
    window.dispatchEvent(new CustomEvent(`ls_storage_response_${requestId}`, {
      detail: { ok: true }
    }));
  });
});

window.addEventListener('ls_analyse', async (e) => {
  const { code, requestId } = e.detail;
  const response = await chrome.runtime.sendMessage({ type: 'ANALYSE_COMPLEXITY', code });
  window.dispatchEvent(new CustomEvent(`ls_analyse_response_${requestId}`, {
    detail: response
  }));
});