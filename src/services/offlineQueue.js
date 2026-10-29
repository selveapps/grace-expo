// Pure offline write queue. Persistence and HTTP live in offlineSync.js.

export function enqueue(queue, item) {
  const list = Array.isArray(queue) ? queue.slice() : [];
  const at = item?.at || Date.now();
  if (!item?.kind) return list;

  if (item.kind === 'profile') {
    const previous = list.filter((row) => row.kind === 'profile');
    const rest = list.filter((row) => row.kind !== 'profile');
    const body = Object.assign({}, ...previous.map((row) => row.body), item.body || {});
    if (!Object.keys(body).length) return rest;
    rest.push({ id: 'profile', kind: 'profile', body, at });
    return rest;
  }

  if (item.kind === 'saved' || item.kind === 'unsave') {
    const ref = item.body?.ref;
    if (!ref) return list;
    const rest = list.filter((row) => !(
      (row.kind === 'saved' || row.kind === 'unsave') && row.body?.ref === ref
    ));
    if (item.kind === 'saved') {
      rest.push({
        id: `saved:${ref}`,
        kind: 'saved',
        body: { ref, text: typeof item.body.text === 'string' ? item.body.text : '' },
        at,
      });
    } else {
      rest.push({ id: `unsave:${ref}`, kind: 'unsave', body: { ref }, at });
    }
    return rest;
  }

  if (item.kind === 'reflection') {
    const body = item.body || {};
    if (!body.word) return list;
    list.push({
      id: item.id || `reflection:${at}`,
      kind: 'reflection',
      body: { word: body.word, note: body.note || '', ref: body.ref || '' },
      at,
    });
    return list;
  }

  return list;
}

export function acknowledgeProfile(queue, fields) {
  const keys = Object.keys(fields || {});
  if (!keys.length) return Array.isArray(queue) ? queue.slice() : [];
  return (queue || []).flatMap((item) => {
    if (item.kind !== 'profile') return [item];
    const body = { ...item.body };
    for (const key of keys) delete body[key];
    if (!Object.keys(body).length) return [];
    return [{ ...item, body }];
  });
}

export function acknowledgeVerse(queue, ref) {
  if (!ref) return Array.isArray(queue) ? queue.slice() : [];
  return (queue || []).filter((item) => !(
    (item.kind === 'saved' || item.kind === 'unsave') && item.body?.ref === ref
  ));
}

export function requestFor(item) {
  if (!item) return null;
  if (item.kind === 'profile') return { method: 'PATCH', path: '/me', body: item.body };
  if (item.kind === 'saved') return { method: 'POST', path: '/saved', body: item.body };
  if (item.kind === 'unsave') return { method: 'DELETE', path: `/saved/${encodeURIComponent(item.body.ref)}` };
  if (item.kind === 'reflection') return { method: 'POST', path: '/reflections', body: item.body };
  return null;
}

export async function replayQueue(queue, send) {
  const remaining = [];
  let failed = false;
  for (const item of queue || []) {
    if (failed) {
      remaining.push(item);
      continue;
    }
    try {
      await send(item);
    } catch {
      failed = true;
      remaining.push(item);
    }
  }
  return remaining;
}

export function hydrateSaved(server, local, queue) {
  const pendingSaves = [];
  const unsaved = new Set();
  for (const item of queue || []) {
    if (item.kind === 'unsave' && item.body?.ref) {
      unsaved.add(item.body.ref);
      const index = pendingSaves.findIndex((row) => row.ref === item.body.ref);
      if (index >= 0) pendingSaves.splice(index, 1);
    }
    if (item.kind === 'saved' && item.body?.ref) {
      unsaved.delete(item.body.ref);
      const index = pendingSaves.findIndex((row) => row.ref === item.body.ref);
      if (index >= 0) pendingSaves.splice(index, 1);
      pendingSaves.push({ ref: item.body.ref, text: item.body.text || '' });
    }
  }
  const base = Array.isArray(server) && server.length ? server : (Array.isArray(local) ? local : []);
  const out = [];
  const seen = new Set();
  for (const verse of pendingSaves) {
    if (!verse.ref || unsaved.has(verse.ref) || seen.has(verse.ref)) continue;
    seen.add(verse.ref);
    out.push(verse);
  }
  for (const verse of base) {
    if (!verse?.ref || unsaved.has(verse.ref) || seen.has(verse.ref)) continue;
    seen.add(verse.ref);
    out.push(verse);
  }
  return out;
}

export function hydrateReflections(server, local, queue) {
  const pending = (queue || []).filter((item) => item.kind === 'reflection').map((item) => ({
    id: item.id,
    word: item.body.word,
    note: item.body.note || '',
    ref: item.body.ref || '',
    date: 'Today',
  }));
  const base = Array.isArray(server) && server.length ? server : (Array.isArray(local) ? local : []);
  return [...pending, ...base];
}

function pendingProfile(queue) {
  return Object.assign({}, ...(queue || []).filter((item) => item.kind === 'profile').map((item) => item.body));
}

export function hydrateName(serverName, localName, queue) {
  const patch = pendingProfile(queue);
  if (Object.prototype.hasOwnProperty.call(patch, 'name')) return patch.name || '';
  const server = typeof serverName === 'string' ? serverName.trim() : '';
  if (server) return server;
  return typeof localName === 'string' ? localName : '';
}

export function hydrateField(serverValue, localValue, queue, key) {
  const patch = pendingProfile(queue);
  if (Object.prototype.hasOwnProperty.call(patch, key)) return patch[key];
  if (Array.isArray(serverValue) && serverValue.length) return serverValue;
  if (typeof serverValue === 'string' && serverValue.trim()) return serverValue;
  if (typeof serverValue === 'boolean') return serverValue;
  return localValue;
}
