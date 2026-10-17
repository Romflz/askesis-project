import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

// Math is LaTeX inside String.raw templates; String.raw keeps the backslashes.
const r = String.raw
const py = (...lines: string[]) => code('python', ...lines)

const CARDS: CardContent[] = [
  // Scaling and reliability
  {
    front: 'Vertical vs horizontal scaling',
    back: 'Vertical: move to a bigger machine (more CPU and RAM). Horizontal: add more machines and spread the load across them',
    extra:
      'Vertical scaling is simpler but hits a hardware ceiling and keeps a single point of failure; horizontal scaling needs load balancing and stateless services.',
  },
  {
    front: 'Why keep application servers stateless?',
    back: 'So any server can handle any request, and you can add, remove or replace servers freely behind a load balancer',
    extra: 'Session data moves to a shared store such as Redis or a database, or into a signed token the client holds.',
  },
  {
    front: 'Latency vs throughput',
    back: 'Latency is how long one request takes; throughput is how many requests (or how much data) the system handles per unit of time',
    extra: 'Watch tail latency (p95, p99), not just the average: the slowest 1% of requests is often what users notice.',
  },
  {
    front: 'Downtime allowed by 99.9%, 99.99% and 99.999% availability',
    back: 'About 8.8 hours, 53 minutes and 5 minutes per year',
    extra: '99.9% (“three nines”) is roughly 43 minutes a month.',
  },
  {
    front: 'Single point of failure (SPOF)',
    back: 'A component whose failure takes the whole system down. Remove it with redundancy: several servers, database replicas, multiple availability zones',
  },
  {
    front: 'Availability of two 99.9% components in series vs in parallel',
    back: r`Series (both needed): \(0.999^2 \approx 99.8\%\). Parallel (either one is enough): \(1 - 0.001^2 = 99.9999\%\)`,
    extra: 'Every dependency in a request’s path lowers availability; redundancy raises it.',
  },
  // Load balancing
  {
    front: 'What does a load balancer do?',
    back: 'Spreads incoming requests across a pool of servers, health-checks them, and stops sending traffic to unhealthy ones',
    extra:
      'It’s a reverse proxy, so it often terminates TLS as well. Run at least two, or use a managed one, so it isn’t a single point of failure itself.',
  },
  {
    front: 'Layer 4 vs layer 7 load balancing',
    back: 'Layer 4 routes TCP or UDP connections by IP address and port without reading the content; layer 7 understands HTTP and can route by path, host, header or cookie',
    extra:
      'L4 is faster and works with any protocol; L7 allows smarter routing, such as sending `/api` to one pool and `/images` to another.',
  },
  {
    front: 'Load-balancing algorithm for requests with very uneven durations',
    back: 'Least connections: send each request to the server with the fewest active connections',
    extra:
      'Round robin, which takes servers in turn, works well when requests are similar. Weighted variants account for servers of different sizes.',
  },
  {
    front: 'Sticky sessions',
    back: 'The load balancer sends all of a user’s requests to the same server, using a cookie or a hash of the client IP',
    extra: 'Downsides: uneven load, and users lose their session when that server dies. Stateless servers remove the need.',
  },
  // Caching
  {
    front: 'Cache-aside (lazy loading)',
    back: 'The app checks the cache first; on a miss it reads from the database and stores the result in the cache',
    extra: py(
      'def get_user(user_id):',
      '    user = cache.get(f"user:{user_id}")',
      '    if user is None:',
      '        user = db.find_user(user_id)',
      '        cache.set(f"user:{user_id}", user, ttl=300)',
      '    return user',
    ),
  },
  {
    front: 'Write-through vs write-back caching',
    back: 'Write-through: every write goes to the cache and the database together (consistent, slower writes). Write-back (write-behind): writes go to the cache and reach the database later (fast, but data is lost if the cache fails first)',
  },
  {
    front: 'LRU eviction',
    back: 'When the cache is full, evict the least recently used entry',
    extra: 'Other policies: LFU (least frequently used), FIFO, and expiring entries after a TTL.',
  },
  {
    front: 'How do you keep cached data from going stale?',
    back: 'Give entries a TTL so they expire, and delete (or update) the cache key whenever the underlying data changes',
    extra: 'Phil Karlton: “There are only two hard things in Computer Science: cache invalidation and naming things.”',
  },
  {
    front: 'Cache stampede (thundering herd)',
    back: 'A popular key expires and many requests miss at the same moment, all hitting the database together',
    extra:
      'Mitigations: let one request rebuild the value while the others wait (request coalescing or a lock), add random jitter to TTLs, or refresh hot keys before they expire.',
  },
  {
    front: 'Where can a web system cache data?',
    back: 'In the browser, at a CDN, in a reverse proxy, in application memory, in a distributed cache such as Redis or Memcached, and in the database’s own buffer cache',
  },
  // CDN
  {
    front: 'What is a CDN?',
    back: 'A content delivery network: servers in many locations (edges) that cache content close to users, cutting latency and the load on your origin servers',
  },
  {
    front: 'Pull CDN vs push CDN',
    back: 'Pull: an edge fetches a file from your origin on the first request and caches it. Push: you upload content to the CDN ahead of time',
    extra: 'Pull is simpler and the usual default; push suits large files that rarely change.',
  },
  {
    front: 'How do you roll out a new version of a CDN-cached asset immediately?',
    back: 'Put a content hash in the filename (`app.3f9a1c.js`) and let it be cached forever; each new build gets a new URL',
    extra:
      'Serve fingerprinted files with `Cache-Control: public, max-age=31536000, immutable`. Purging the CDN instead is slower and easy to get wrong.',
  },
  // Databases
  {
    front: 'Leader-follower (primary-replica) replication',
    back: 'All writes go to the leader, which streams its changes to followers; reads can be served by the followers',
    extra: 'It scales reads and allows failover, but not writes: every write still goes through the leader.',
  },
  {
    front: 'Synchronous vs asynchronous replication',
    back: 'Synchronous: the leader waits for replicas to confirm each write (no data loss on failover, slower writes). Asynchronous: it doesn’t wait (fast, but replicas lag and the latest writes can be lost if the leader dies)',
  },
  {
    front: 'A user updates their profile but still sees the old version. Likely cause and fix?',
    back: 'The read went to a replica that hasn’t caught up (replication lag). Guarantee read-your-writes, e.g. by reading the user’s own data from the leader for a short time after they write',
  },
  {
    front: r`What does the quorum condition \(W + R > N\) guarantee?`,
    back: r`With \(N\) replicas, writes confirmed by \(W\) of them and reads querying \(R\), every read overlaps at least one replica that has the latest write`,
    extra: r`A common choice is \(N = 3\), \(W = 2\), \(R = 2\).`,
  },
  {
    front: 'Sharding (horizontal partitioning)',
    back: 'Splitting one dataset across several databases by a shard key, so each database holds a subset of the rows',
    extra: 'Unlike read replicas, sharding scales writes and storage beyond one machine.',
  },
  {
    front: 'Range vs hash sharding',
    back: 'Range: each shard owns a contiguous key range (fast range scans, but hotspots, e.g. every new timestamp lands on one shard). Hash: shard by a hash of the key (even spread, but range queries must ask every shard)',
  },
  {
    front: 'Consistent hashing',
    back: r`Nodes and keys sit on a hash ring and each key belongs to the next node clockwise, so adding or removing a node moves only about \(1/n\) of the keys`,
    extra: r`With plain \(\text{hash}(k) \bmod n\), changing \(n\) remaps almost every key. Virtual nodes (many ring positions per server) even out the load.`,
  },
  {
    front: 'What makes a good shard key?',
    back: 'Many distinct values, evenly spread traffic, and a match with how data is queried, e.g. `user_id` when most queries are per user',
    extra: 'A bad key creates hot shards: sharding by date piles all new writes onto one shard.',
  },
  {
    front: 'Costs of sharding, and what to try first',
    back: 'Cross-shard joins and transactions become hard, and rebalancing adds operational work. First try indexes, better queries, caching, read replicas and a bigger machine',
  },
  {
    front: 'Denormalization',
    back: 'Storing redundant copies of data, such as the author’s name on every post, to avoid joins and speed up reads, at the cost of more complex writes and possible inconsistency',
  },
  {
    front: 'SQL vs NoSQL: when does each fit?',
    back: 'Relational databases suit structured data with relationships, joins and ACID transactions. NoSQL stores (key-value, document, wide-column, graph) suit flexible schemas, very large scale and simple, known access patterns',
  },
  // CAP and consistency
  {
    front: 'CAP theorem',
    back: 'During a network partition, a distributed data store must choose between consistency (every read sees the latest write) and availability (every request gets a non-error response)',
    extra:
      'Partitions can’t be ruled out in practice, so “pick two of three” really means choosing CP or AP behavior when one happens.',
  },
  {
    front: 'CP vs AP systems',
    back: 'CP systems refuse some requests during a partition to stay consistent (e.g. etcd, ZooKeeper). AP systems keep answering but may return stale data (e.g. Cassandra, or DynamoDB with eventually consistent reads)',
  },
  {
    front: 'PACELC',
    back: 'If there is a Partition, choose Availability or Consistency; Else, in normal operation, choose Latency or Consistency',
    extra: 'It extends CAP: synchronous replication buys consistency with extra latency all the time, not only during failures.',
  },
  {
    front: 'Strong vs eventual consistency',
    back: 'Strong: once a write completes, every read sees it. Eventual: replicas converge once writes stop, but reads in between may return stale data',
  },
  {
    front: 'ACID vs BASE',
    back: 'ACID: Atomicity, Consistency, Isolation, Durability, the guarantees of traditional transactions. BASE: Basically Available, Soft state, Eventually consistent, the model of many distributed NoSQL stores',
  },
  // Messaging
  {
    front: 'Why put a message queue between two services?',
    back: 'It decouples them: the producer doesn’t wait for the consumer, traffic spikes are buffered, and failed work can be retried',
    extra: 'Typical uses: sending emails, resizing images and processing payments in the background.',
  },
  {
    front: 'Message queue vs publish-subscribe',
    back: 'Queue: each message is processed by one of several competing consumers. Pub/sub: each message goes to every subscriber of the topic',
  },
  {
    front: 'At-most-once vs at-least-once vs exactly-once delivery',
    back: 'At-most-once may lose messages; at-least-once may deliver duplicates; exactly-once processing needs deduplication or transactions on top',
    extra:
      'At-least-once is the usual choice, so consumers must be idempotent: processing the same message twice must be harmless.',
  },
  {
    front: 'Dead-letter queue (DLQ)',
    back: 'Where messages go after failing processing too many times, so they don’t block the queue and can be inspected or replayed later',
  },
  {
    front: 'Kafka-style log vs a classic message broker',
    back: 'Kafka keeps an append-only, partitioned log: consumers track their own offsets, can replay old messages, and get ordering within a partition. A classic broker like RabbitMQ delivers messages and deletes them once acknowledged',
  },
  {
    front: 'Back pressure',
    back: 'A way for an overloaded consumer to make producers slow down, e.g. bounded queues that block or reject new work, instead of letting queues grow until memory runs out',
  },
  // Rate limiting and resilience
  {
    front: 'Token bucket rate limiting',
    back: r`A bucket holds up to \(b\) tokens and refills at rate \(r\); each request spends a token and is rejected when the bucket is empty`,
    extra: r`It allows bursts of up to \(b\) requests while capping the long-run average at \(r\).`,
  },
  {
    front: 'Fixed window vs sliding window rate limiting',
    back: 'A fixed window counts requests per calendar minute and resets, so a client can send twice the limit around a boundary. A sliding window counts over the last 60 seconds and smooths that out',
  },
  {
    front: 'Idempotency key',
    back: 'A unique ID the client sends with a non-idempotent request, like a payment, so the server can recognize a retry and return the stored result instead of charging twice',
    extra: 'An operation is idempotent if doing it several times has the same effect as doing it once.',
  },
  {
    front: 'Retries with exponential backoff and jitter',
    back: 'Wait longer after each failure (e.g. 1 s, 2 s, 4 s, 8 s, up to a cap) plus a random amount, so clients don’t retry in lockstep and overwhelm a recovering service',
  },
  {
    front: 'Circuit breaker',
    back: 'After repeated failures, stop calling the failing dependency and fail fast for a while (open), then let a few trial requests through (half-open) before resuming normal traffic (closed)',
  },
  // Back-of-the-envelope estimates
  {
    front: 'Average requests per second for 1 million requests a day',
    back: r`About 12, since a day has 86,400 \(\approx 10^5\) seconds`,
    extra: 'Peak traffic is often several times the average, so size the system for the peak.',
  },
  {
    front: 'Rough latency of an L1 cache hit, RAM access, SSD read, datacenter round trip and cross-continent round trip',
    back: '~1 ns, ~100 ns, ~100 µs, ~0.5 ms, ~150 ms',
    extra:
      'From the classic “latency numbers every programmer should know”. Fast NVMe drives beat the SSD figure, but the orders of magnitude are what matter.',
  },
  {
    front: 'Powers of two for quick estimates',
    back: r`\(2^{10} \approx\) a thousand (KB), \(2^{20} \approx\) a million (MB), \(2^{30} \approx\) a billion (GB), \(2^{40} \approx\) a trillion (TB)`,
  },
  {
    front: 'Estimate the storage for 10 million photo uploads a day at 200 KB each',
    back: 'About 2 TB a day, or roughly 730 TB a year before replication',
    extra: r`\(10^7 \times 2 \times 10^5\) bytes \(= 2 \times 10^{12}\) bytes.`,
  },
]

export const SYSTEM_DESIGN: PublicDeck = {
  slug: 'system-design',
  title: 'System design basics: 50 cards on scaling, caching and databases',
  shortTitle: 'System design',
  category: 'cs',
  level: 'intermediate',
  icon: 'globe',
  description:
    'System design fundamentals: load balancers, caching, CDNs, replication and sharding, CAP, consistency, queues, rate limiting and back-of-the-envelope math.',
  intro:
    'The building blocks behind every system design interview and every service that outgrows one server: scaling out behind load balancers, caching at each layer, replicating and sharding data, the trade-offs named by CAP and PACELC, queues and delivery guarantees, rate limits and retries, and the latency and capacity numbers that make quick estimates possible.',
  faq: [
    {
      q: 'Is this enough to prepare for a system design interview?',
      a: 'It gives you the vocabulary and trade-offs interviewers expect. Practice by designing real systems out loud, such as a URL shortener, a chat app or a news feed, and reach for these building blocks as you go.',
    },
    {
      q: 'What does the CAP theorem actually say?',
      a: 'When the network cuts nodes off from each other, a distributed data store has to either reject some requests to stay consistent or keep answering with possibly stale data. Without a partition, it can offer both.',
    },
    {
      q: 'Do I need to memorize latency numbers?',
      a: 'Only the orders of magnitude: nanoseconds for memory, microseconds for SSDs, milliseconds for network round trips. That is enough to see which part of a design dominates.',
    },
  ],
  cards: CARDS,
}
