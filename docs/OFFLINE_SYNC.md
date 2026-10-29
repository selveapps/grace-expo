# Offline sync

SEL-22 / GRACE-018. The phone keeps a write queue when grace-api cannot be reached, then replays it on the next successful hydrate.

## What is queued

| Kind | Request | Rule |
|---|---|---|
| `profile` | `PATCH /me` | One row. Later fields merge onto it. |
| `saved` | `POST /saved` | One row per verse reference. A second save of the same reference replaces the first. |
| `unsave` | `DELETE /saved/:ref` | Replaces a pending save of that reference, so a save-then-remove offline does not come back. |
| `reflection` | `POST /reflections` | Appended. Reflections are not collapsed. |

The queue lives in AsyncStorage under `grace.writeQueue`, through `StorageService`. `src/services/offlineQueue.js` is pure. `src/services/offlineSync.js` performs the HTTP calls.

## Replay

`replayOfflineQueue` runs at the start of profile hydrate, before `GET /me`, `GET /saved`, and `GET /reflections`.

The first failed write stops the replay. Everything after it stays in order. A write that succeeded is not sent again.

A successful live `PATCH /me` drops those fields from the pending profile row, so an older offline name cannot overwrite a newer one. A successful live save or unsave drops the pending row for that reference.

## Conflict policy

Server wins on hydrate.

- A non-empty server list of saved verses replaces the local list.
- A non-empty server reflection list replaces the local list.
- A non-empty server name, carrying list, gentleness, or rhythm replaces the local value.
- An empty server name does not erase a name that only exists on the phone.
- A write still in the queue is applied on top of the server snapshot. That is how an offline save stays on screen when the server already has other verses. Replayed writes are no longer in the queue, so they are not added twice.

## Verify

```bash
node --test src/services/offlineQueue.test.js
```

Those tests cover coalesce, dedupe, replay order, and hydrate. They do not turn on airplane mode. A device check is still: airplane on, save a verse, airplane off, `GET /saved` contains that verse once.
