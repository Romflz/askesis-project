import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const redis = (...lines: string[]) => code('redis', ...lines)
const js = (...lines: string[]) => code('js', ...lines)

const CARDS: CardContent[] = [
  {
    front: 'What is Redis?',
    back: 'An in-memory data structure server: keys map to strings, lists, sets, hashes, sorted sets, streams and more. Common uses are caching, sessions, queues, rate limits and leaderboards',
  },
  {
    front: 'How does Redis execute commands?',
    back: 'One at a time on a single main thread, so every command is atomic and never interleaves with another client’s command',
    extra: 'Redis 6+ can use I/O threads for networking, and some work, like freeing big values, runs in background threads.',
  },
  {
    front: 'Why can one slow command hurt every client?',
    back: 'Nothing else runs while the main thread is busy. Avoid `KEYS *`, `SMEMBERS` or `HGETALL` on huge keys, and long Lua scripts, in production',
  },
  {
    front: '`KEYS` vs `SCAN`',
    back: '`KEYS` returns every match in one blocking O(N) call; `SCAN` walks the keyspace in small steps with a cursor. Repeat with the returned cursor until it is `0`; keys may appear more than once',
    extra: redis('SCAN 0 MATCH user:* COUNT 100'),
  },
  {
    front: '`DEL` vs `UNLINK`',
    back: 'Both remove keys. `DEL` frees the memory right away (by default), which is slow for huge values; `UNLINK` removes the key at once and frees memory in a background thread',
  },
  {
    front: 'What can a Redis string hold?',
    back: 'Any binary-safe value up to 512 MB: text, numbers, serialized JSON or raw bytes; `SET` and `GET` are O(1)',
  },
  {
    front: `What do the two \`INCR\` calls return?\n${redis('SET views 10', 'INCR views', 'INCR missing')}`,
    back: '`11` and `1`: `INCR` is atomic and treats a missing key as 0. It errors if the value isn’t an integer',
  },
  {
    front: 'What does `SET lock:job:42 worker-1 NX EX 30` do?',
    back: 'Sets the key only if it doesn’t exist (`NX`), expiring after 30 seconds (`EX`); it returns nil if the key already exists. The basis of a simple lock',
  },
  {
    front: 'What is a Redis list?',
    back: 'An ordered sequence of strings with O(1) push and pop at both ends: `LPUSH`, `RPUSH`, `LPOP`, `RPOP`',
  },
  {
    front: 'What does `LRANGE mylist 0 -1` return?',
    back: 'Every element of the list: negative indexes count from the end, so `-1` is the last element',
  },
  {
    front: 'Build a simple job queue with a list',
    back: 'Producers `LPUSH jobs …`; workers call `BRPOP jobs 0`, which blocks until an item arrives (a timeout of 0 waits forever)',
    extra:
      'A popped job is lost if the worker crashes; streams with consumer groups, or `LMOVE` to a processing list, add reliability.',
  },
  { front: 'Keep only the 100 most recent items in a list', back: redis('LPUSH recent:42 "item"', 'LTRIM recent:42 0 99') },
  {
    front: 'What is a Redis set?',
    back: 'An unordered collection of unique strings: `SADD`, `SREM` and `SISMEMBER` are O(1), and `SINTER`, `SUNION` and `SDIFF` combine sets',
  },
  {
    front: 'What is a sorted set?',
    back: 'Unique members, each with a floating-point score, kept ordered by score (ties ordered lexicographically); adding and ranking are O(log N)',
    extra: 'Typical uses: leaderboards, priority queues and time-based indexes.',
  },
  {
    front: 'Build a leaderboard and read the top 10',
    back: redis('ZADD scores 1500 alice 1200 bob', 'ZINCRBY scores 50 bob', 'ZRANGE scores 0 9 REV WITHSCORES'),
    extra: '`REV` needs Redis 6.2+; older code uses `ZREVRANGE`.',
  },
  {
    front: 'Store and update a user object in a hash',
    back: redis('HSET user:42 name Ada email ada@example.com', 'HGET user:42 name', 'HINCRBY user:42 logins 1'),
    extra: '`HGETALL` returns every field; `HSET` takes several field–value pairs (`HMSET` is deprecated).',
  },
  {
    front: 'Why use a hash instead of a JSON string?',
    back: 'You can read or change one field (`HGET`, `HINCRBY`) without fetching and rewriting the whole object',
    extra: 'Since Redis 7.4, individual hash fields can even expire (`HEXPIRE`).',
  },
  {
    front: 'What is a Redis stream?',
    back: 'An append-only log of entries, each with an ID and field–value pairs; consumers read ranges, block for new entries, or share work through consumer groups',
  },
  {
    front: 'What does `XADD orders * id 42 total 9.99` do?',
    back: 'Appends an entry to the `orders` stream; `*` makes Redis generate an ID like `1718000000000-0` (milliseconds, then a sequence number)',
  },
  {
    front: 'How do stream consumer groups work?',
    back: 'Each entry goes to one consumer in the group and stays pending until acknowledged with `XACK`, so messages from a crashed consumer can be claimed and retried (`XAUTOCLAIM`)',
    extra: redis(
      'XGROUP CREATE orders workers $ MKSTREAM',
      'XREADGROUP GROUP workers w1 COUNT 10 STREAMS orders >',
      'XACK orders workers 1718000000000-0',
    ),
  },
  {
    front: 'Streams vs pub/sub',
    back: 'Streams store messages, so consumers can replay history, acknowledge work and catch up after downtime; pub/sub delivers only to clients connected at that moment',
  },
  {
    front: 'What is a HyperLogLog for?',
    back: 'Counting unique items approximately (`PFADD`, `PFCOUNT`) with about 0.81% standard error, using at most 12 KB per key',
    extra: 'Example: unique visitors per day without storing every visitor ID.',
  },
  {
    front: 'Give a key a time to live',
    back: redis('EXPIRE session:abc 1800', 'SET session:abc "data" EX 1800'),
    extra:
      'The first adds a 30-minute TTL to an existing key; the second sets the value and TTL together. `PEXPIRE` takes milliseconds, `EXPIREAT` a Unix timestamp, and `PERSIST` removes the expiry.',
  },
  {
    front: 'What do `-1` and `-2` from `TTL` mean?',
    back: '`-1`: the key exists but has no expiry. `-2`: the key doesn’t exist. Otherwise `TTL` returns the remaining seconds',
  },
  {
    front: 'Does overwriting a key with `SET` keep its TTL?',
    back: 'No. `SET` clears the expiry unless you add `KEEPTTL` (Redis 6.0+); commands that modify the value in place, like `INCR`, `LPUSH` or `HSET`, keep it',
  },
  {
    front: 'How do expired keys get removed?',
    back: 'Passively, when a client accesses an expired key, and actively, by a background cycle that samples keys with a TTL; expired keys can linger in memory briefly',
  },
  {
    front: 'What is RDB persistence?',
    back: 'Point-in-time snapshots of the dataset written to a compact file on a schedule or with `BGSAVE`; restarts are fast, but writes since the last snapshot are lost on a crash',
  },
  {
    front: 'What is AOF persistence?',
    back: 'An append-only file logging every write, replayed on restart. With the default `appendfsync everysec` you lose at most about a second of writes; `always` is safest and slowest',
  },
  {
    front: 'Why does Redis rewrite the AOF?',
    back: 'The log keeps growing with every write; a rewrite (automatic, or `BGREWRITEAOF`) replaces it with the minimal set of commands that recreates the current data',
  },
  {
    front: 'With both RDB and AOF enabled, which one loads on restart?',
    back: 'The AOF, because it is usually the more complete record of recent writes',
    extra: 'Using both is common: AOF for durability, RDB files for backups.',
  },
  {
    front: 'Why can `BGSAVE` need a lot of extra memory?',
    back: 'It forks a child that shares memory copy-on-write; every page the parent modifies during the save gets copied, up to double the memory under heavy writes',
  },
  {
    front: 'Publish and subscribe to messages',
    back: redis('SUBSCRIBE news', 'PSUBSCRIBE news.*', 'PUBLISH news "hello"'),
    extra: '`PSUBSCRIBE` matches channels by pattern; `PUBLISH` returns how many subscribers received the message.',
  },
  {
    front: 'What delivery guarantee does pub/sub give?',
    back: 'At most once: messages aren’t stored, so a subscriber that is disconnected or slow to reconnect simply misses them',
  },
  {
    front: 'Why does a subscribed connection reject `GET`?',
    back: 'With the RESP2 protocol, a connection in subscribe mode can only run (un)subscribe commands, `PING`, `RESET` and `QUIT`; use a separate connection for other commands',
    extra: 'RESP3 connections can mix both.',
  },
  {
    front: 'How does the cache-aside pattern work?',
    back: 'Read from the cache; on a miss, load from the database and store it with a TTL. On writes, update the database and delete the cache key',
    extra: js(
      '// node-redis',
      'let user = await redis.get(`user:${id}`)',
      'if (!user) {',
      '  user = JSON.stringify(await db.users.find(id))',
      '  await redis.set(`user:${id}`, user, { EX: 300 })',
      '}',
    ),
  },
  {
    front: 'On a write, why delete the cached value instead of updating it?',
    back: 'Two concurrent writers can update the cache in the opposite order from the database, leaving stale data; deleting lets the next read load the fresh value',
  },
  {
    front: 'Write-through vs write-behind caching',
    back: 'Write-through writes to the cache and the database together on every write; write-behind writes to the cache and persists to the database later, which is faster but can lose data',
  },
  {
    front: 'What is a cache stampede?',
    back: 'A popular key expires and many requests miss at once, all hitting the database. Fix it with a lock so one request rebuilds the value, early refresh, or random TTL jitter',
  },
  {
    front: 'Conventional Redis key naming',
    back: 'Colon-separated namespaces from general to specific, like `user:42:profile` or `session:abc123`',
  },
  {
    front: 'What is the default `maxmemory-policy`?',
    back: '`noeviction`: once `maxmemory` is reached, commands that add data fail with an out-of-memory error while reads keep working',
    extra: 'For a pure cache, switch to an eviction policy like `allkeys-lru` or `allkeys-lfu`.',
  },
  {
    front: '`allkeys-lru` vs `volatile-lru`',
    back: '`allkeys-lru` can evict any key; `volatile-lru` only evicts keys that have a TTL, and acts like `noeviction` if none do',
  },
  {
    front: 'LRU vs LFU eviction',
    back: 'LRU evicts the least recently used keys; LFU (Redis 4.0+) evicts the least frequently used, which better protects keys that are steadily popular',
  },
  {
    front: 'Is Redis’s LRU eviction exact?',
    back: 'No. It samples a few keys (`maxmemory-samples`, default 5) and evicts the best candidate among them, which approximates LRU cheaply',
  },
  {
    front: 'What do `MULTI` and `EXEC` do?',
    back: 'Commands after `MULTI` are queued; `EXEC` runs them in order as one block, with no other client’s command in between',
    extra: redis('MULTI', 'INCR orders:count', 'LPUSH orders:recent 42', 'EXEC'),
  },
  {
    front: 'Does a Redis transaction roll back if a command fails?',
    back: 'No. If a command fails while running (say, a wrong type), the rest still execute. Only errors detected while queuing, like bad syntax, abort the whole transaction',
  },
  {
    front: 'What does `WATCH` add to a transaction?',
    back: 'Optimistic locking: if a watched key changes before `EXEC`, the transaction is aborted and `EXEC` returns nil, so the client retries',
    extra: redis('WATCH balance:42', 'GET balance:42', 'MULTI', 'SET balance:42 90', 'EXEC'),
  },
  {
    front: 'Why use a Lua script (`EVAL`) instead of `MULTI`?',
    back: 'A script runs atomically on the server and can branch on values it reads, like deleting a lock only if you still own it, which `MULTI` can’t express',
    extra: redis(
      "EVAL \"if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0\" 1 lock:job:42 worker-1",
    ),
  },
  {
    front: 'Pipelining vs transactions',
    back: 'Pipelining sends many commands without waiting for each reply, saving round trips, but other clients’ commands can interleave; `MULTI`/`EXEC` is atomic',
  },
  {
    front: 'How does Redis Cluster split data, and what breaks?',
    back: 'Keys are spread over 16,384 hash slots across nodes; multi-key commands fail unless all keys are in the same slot',
    extra: 'Hash tags force a slot: `{user:42}:cart` and `{user:42}:profile` hash only `user:42`.',
  },
  {
    front: 'Allow 100 requests per minute per IP',
    back: redis('INCR rate:203.0.113.7:202610151230', 'EXPIRE rate:203.0.113.7:202610151230 60 NX'),
    extra:
      'Reject when `INCR` returns more than 100. `EXPIRE … NX` (Redis 7.0+) sets the expiry only on the first hit of the window.',
  },
]

export const REDIS: PublicDeck = {
  slug: 'redis-essentials',
  title: 'Redis essentials: 50 cards on data types, caching and persistence',
  shortTitle: 'Redis',
  category: 'databases',
  level: 'beginner',
  icon: 'code',
  description:
    'Redis basics: strings, lists, sets, sorted sets, hashes and streams, TTLs, RDB and AOF persistence, pub/sub, caching patterns, eviction and MULTI/EXEC.',
  intro:
    'Redis is simple to start with, and its simplicity hides a few sharp edges. These cards cover each core data type and when to reach for it, how expiry really works, RDB vs AOF persistence, pub/sub vs streams, the caching patterns and eviction policies behind a good cache, and what MULTI/EXEC, WATCH and Lua scripts can and can’t guarantee on a single-threaded server.',
  faq: [
    {
      q: 'Does this deck apply to Valkey?',
      a: 'Yes. Valkey is a fork of Redis 7.2.4, so the commands and concepts here work the same; only features added to Redis later, like hash field expiry in 7.4, may differ.',
    },
    {
      q: 'Is Redis open source?',
      a: 'Redis moved to source-available licenses with version 7.4 in 2024, and Redis 8 added the AGPLv3 as an open-source option. Valkey remains BSD-licensed.',
    },
    {
      q: 'Can Redis be my primary database?',
      a: 'It can for data that fits in memory, with AOF persistence and replication, but most teams use it next to a database as a cache, queue or session store.',
    },
  ],
  cards: CARDS,
}
