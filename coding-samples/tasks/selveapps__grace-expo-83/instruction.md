When a profile, saved-verse, or reflection write cannot be sent, keep it and replay it in order.

One pending profile patch. A later profile patch replaces the earlier one.
One pending save or unsave per verse reference. A later one replaces the earlier one.
Replay stops at the first failure and leaves that write, and every write after it, queued.
On hydrate, a non-empty server list wins. A write still in the queue is applied on top, once, so it is not dropped and not duplicated.
An empty server name does not erase a name that exists only in the queue.
Pending reflections stay in front of the server list.

Do not add an API endpoint. The web client does not get this queue.

No new imports. The tests call the behavior described above.
