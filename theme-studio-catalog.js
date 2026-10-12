/* Published packages are read from immutable revisions, verified, and kept in memory. */
(() => {
  'use strict';
  const ROOT = 'https://raw.githubusercontent.com/Edgajuman/AK-Screen-Themes/';
  const MB = 1024 * 1024;
  function safePath(path) {
    return typeof path === 'string' && path.length > 0 && path.length <= 400 &&
      !/[\\:?#%\x00-\x1f]/.test(path) && !path.startsWith('/') &&
      path.split('/').every(part => part && part !== '.' && part !== '..');
  }
  function resourceUrl(theme, path) {
    if (!/^[0-9a-f]{40}$/.test(theme.revision) ||
        !/^[a-zA-Z0-9_-]{1,80}$/.test(theme.author) ||
        !/^[a-z0-9_-]{1,80}$/.test(theme.id) || !safePath(path)) {
      throw new Error('El catálogo contiene una ruta no válida.');
    }
    return ROOT + [theme.revision, 'themes', theme.author, theme.id, ...path.split('/')].map(encodeURIComponent).join('/');
  }
  async function readBytes(url, limit, signal) {
    const response = await fetch(url, { credentials: 'omit', cache: 'no-store', signal });
    if (!response.ok) throw new Error(`No se pudo cargar el recurso (${response.status}).`);
    if (Number(response.headers.get('content-length')) > limit) throw new Error('Recurso demasiado grande.');
    const reader = response.body.getReader(), chunks = [];
    let size = 0;
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > limit) throw new Error('El recurso supera el tamaño permitido.');
        chunks.push(value);
      }
    } finally { await reader.cancel().catch(() => {}); }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return bytes;
  }
  async function catalogue() {
    const bytes = await readBytes('themes.json', 4 * MB, AbortSignal.timeout(20000));
    const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (data.schema !== 1 || !Array.isArray(data.themes) || data.themes.length > 100) {
      throw new Error('El catálogo no usa el formato de AK Screen.');
    }
    for (const theme of data.themes) {
      resourceUrl(theme, theme.preview || 'theme.json');
      if (!Array.isArray(theme.assets) || theme.assets.length > 256) throw new Error('Paquete no válido.');
      const names = new Set();
      let total = 0;
      for (const asset of theme.assets) {
        if (!safePath(asset.path) || names.has(asset.path.toLowerCase()) ||
            !Number.isSafeInteger(asset.size) || asset.size < 0 || asset.size > 16 * MB ||
            !/^[a-f0-9]{64}$/.test(asset.sha256)) throw new Error('Recurso no válido en el catálogo.');
        names.add(asset.path.toLowerCase()); total += asset.size;
      }
      if (total > 64 * MB) throw new Error('El tema supera 64 MB.');
    }
    return data.themes;
  }
  async function verifiedAsset(theme, asset, signal) {
    const bytes = await readBytes(resourceUrl(theme, asset.path), asset.size, signal);
    if (bytes.length !== asset.size) throw new Error(`El tamaño de ${asset.path} no coincide.`);
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    const hash = Array.from(digest, value => value.toString(16).padStart(2, '0')).join('');
    if (hash !== asset.sha256) throw new Error(`La verificación de ${asset.path} falló.`);
    return bytes;
  }
  async function packageEntries(theme, signal, progress) {
    const entries = new Map();
    let index = 0, complete = 0;
    // Four requests at a time; failures never partially replace the user's draft.
    async function worker() {
      while (index < theme.assets.length) {
        const asset = theme.assets[index++];
        entries.set(asset.path, await verifiedAsset(theme, asset, signal));
        progress?.(++complete, theme.assets.length);
      }
    }
    await Promise.all(Array.from({ length: Math.min(4, theme.assets.length) }, worker));
    return entries;
  }
  window.AKScreenThemeCatalogue = Object.freeze({ catalogue, resourceUrl, packageEntries });
})();
