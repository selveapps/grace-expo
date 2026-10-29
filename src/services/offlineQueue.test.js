import assert from 'node:assert/strict';
import test from 'node:test';
import {
  acknowledgeProfile,
  acknowledgeVerse,
  enqueue,
  hydrateField,
  hydrateName,
  hydrateReflections,
  hydrateSaved,
  replayQueue,
  requestFor,
} from './offlineQueue.js';

test('profile patches collapse into one write', () => {
  let queue = enqueue([], { kind: 'profile', body: { name: 'Ada' }, at: 1 });
  queue = enqueue(queue, { kind: 'profile', body: { rhythm: 'evening' }, at: 2 });
  assert.equal(queue.length, 1);
  assert.deepEqual(queue[0].body, { name: 'Ada', rhythm: 'evening' });
  assert.deepEqual(requestFor(queue[0]), { method: 'PATCH', path: '/me', body: queue[0].body });
});

test('a saved verse is queued once, and an unsave removes that save', () => {
  let queue = enqueue([], { kind: 'saved', body: { ref: 'John 1:1', text: 'In the beginning' }, at: 1 });
  queue = enqueue(queue, { kind: 'saved', body: { ref: 'John 1:1', text: 'In the beginning was the Word' }, at: 2 });
  queue = enqueue(queue, { kind: 'saved', body: { ref: 'Psalm 23:1', text: 'The Lord is my shepherd' }, at: 3 });
  assert.equal(queue.filter((item) => item.kind === 'saved').length, 2);
  assert.equal(queue.find((item) => item.body.ref === 'John 1:1').body.text, 'In the beginning was the Word');
  queue = enqueue(queue, { kind: 'unsave', body: { ref: 'John 1:1' }, at: 4 });
  assert.equal(queue.some((item) => item.body.ref === 'John 1:1' && item.kind === 'saved'), false);
  assert.equal(queue.find((item) => item.body.ref === 'John 1:1').kind, 'unsave');
  assert.equal(requestFor(queue.find((item) => item.kind === 'saved')).method, 'POST');
});

test('replay stops at the first failure and keeps order', async () => {
  const queue = [
    { id: 'saved:a', kind: 'saved', body: { ref: 'a', text: 'one' }, at: 1 },
    { id: 'saved:b', kind: 'saved', body: { ref: 'b', text: 'two' }, at: 2 },
  ];
  const sent = [];
  const remaining = await replayQueue(queue, async (item) => {
    if (item.body.ref === 'b') throw new Error('offline');
    sent.push(item.body.ref);
  });
  assert.deepEqual(sent, ['a']);
  assert.deepEqual(remaining.map((item) => item.body.ref), ['b']);
});

test('server wins on hydrate, and a pending save is not dropped or duplicated', () => {
  const server = [{ ref: 'Psalm 23:1', text: 'server' }, { ref: 'John 1:1', text: 'server john' }];
  const local = [{ ref: 'John 1:1', text: 'local john' }, { ref: 'Ruth 1:1', text: 'local ruth' }];
  const queue = enqueue([], { kind: 'saved', body: { ref: 'Ruth 1:1', text: 'local ruth' }, at: 1 });
  const merged = hydrateSaved(server, local, queue);
  assert.deepEqual(merged.map((verse) => verse.ref), ['Ruth 1:1', 'Psalm 23:1', 'John 1:1']);
  assert.equal(merged.filter((verse) => verse.ref === 'John 1:1').length, 1);
  assert.equal(merged.find((verse) => verse.ref === 'John 1:1').text, 'server john');
});

test('a pending profile field wins, and an empty server name does not erase a local name', () => {
  const queue = enqueue([], { kind: 'profile', body: { rhythm: 'evening' }, at: 1 });
  assert.equal(hydrateName('', 'Ada', queue), 'Ada');
  assert.equal(hydrateName('Bea', 'Ada', []), 'Bea');
  assert.equal(hydrateName('Bea', 'Ada', enqueue([], { kind: 'profile', body: { name: 'Ada' }, at: 1 })), 'Ada');
  assert.equal(hydrateField('morning', 'later', queue, 'rhythm'), 'evening');
  assert.deepEqual(
    acknowledgeProfile(queue, { rhythm: 'evening' }),
    [],
  );
});

test('pending reflections stay in front of the server list', () => {
  const queue = enqueue([], { kind: 'reflection', body: { word: 'Trust', note: 'Hope' }, at: 5 });
  const rows = hydrateReflections([{ id: 'srv', word: 'Peace', note: '', ref: '', date: '2026-10-28' }], [], queue);
  assert.equal(rows[0].word, 'Trust');
  assert.equal(rows[1].word, 'Peace');
  assert.deepEqual(acknowledgeVerse(queue, 'nope'), queue);
});
