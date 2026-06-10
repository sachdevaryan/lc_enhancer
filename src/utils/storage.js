function bridgeRequest(eventName, responseEvent, detail) {
  return new Promise((resolve) => {
    const requestId = `${Date.now()}_${Math.random()}`;
    window.addEventListener(`${responseEvent}_${requestId}`, (e) => {
      resolve(e.detail);
    }, { once: true });
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: { ...detail, requestId }
    }));
    setTimeout(() => resolve(null), 3000);
  });
}

export const storage = {
  async get(key) {
    const res = await bridgeRequest('ls_storage_get', 'ls_storage_response', { key });
    return res?.value ?? null;
  },
  async set(key, value) {
    await bridgeRequest('ls_storage_set', 'ls_storage_response', { key, value });
  }
};