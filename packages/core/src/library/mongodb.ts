import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

// mongosh speaks JavaScript.
const js = (...lines: string[]) => code('js', ...lines)

const CARDS: CardContent[] = [
  {
    front: 'What is a MongoDB document?',
    back: 'A record of field–value pairs, like a JSON object, that can nest objects and arrays; it is stored as BSON',
  },
  {
    front: 'What is BSON?',
    back: 'Binary JSON: the binary format MongoDB stores documents in. It adds types JSON lacks, like `ObjectId`, `Date`, `Decimal128`, 32- and 64-bit integers and binary data',
  },
  {
    front: 'Maximum size of a single document',
    back: '16 MB. Store larger files with GridFS, and keep documents from growing without limit',
  },
  {
    front: 'What is special about the `_id` field?',
    back: 'It is every document’s primary key: unique in the collection, immutable, automatically indexed, and generated as an `ObjectId` if you don’t supply one',
  },
  {
    front: 'What is inside an `ObjectId`?',
    back: '12 bytes: a 4-byte timestamp in seconds, a 5-byte random value and a 3-byte counter, so IDs roughly sort by creation time',
    extra: '`id.getTimestamp()` returns the creation date.',
  },
  {
    front: 'What is a collection?',
    back: 'A group of documents, similar to a table but with no fixed schema by default; it is created automatically on the first insert',
  },
  {
    front: 'Enforce a schema on a collection',
    back: js(
      "db.createCollection('users', {",
      '  validator: {',
      '    $jsonSchema: {',
      "      bsonType: 'object',",
      "      required: ['email'],",
      "      properties: { email: { bsonType: 'string' } },",
      '    },',
      '  },',
      '})',
    ),
    extra: 'Add a validator to an existing collection with `collMod`.',
  },
  {
    front: 'Insert one and several documents',
    back: js("db.users.insertOne({ name: 'Ada', age: 36 })", "db.users.insertMany([{ name: 'Alan' }, { name: 'Grace' }])"),
  },
  {
    front: `What does this return?\n${js('db.users.find(', '  { age: { $gte: 18 } },', '  { name: 1, email: 1, _id: 0 },', ')')}`,
    back: 'The name and email (without `_id`) of every user aged 18 or over: the first argument filters, the second is a projection',
  },
  {
    front: 'Can a projection mix `1` and `0`?',
    back: 'No, except for `_id`: either list the fields to include or the fields to exclude',
  },
  {
    front: 'What does `find()` return?',
    back: 'A cursor that fetches results in batches; iterate it, or call `.toArray()` in a driver',
    extra: 'mongosh prints the first 20 documents; type `it` for more.',
  },
  {
    front: `What does this return?\n${js('db.posts.find().sort({ createdAt: -1 }).limit(10)')}`,
    back: 'The ten newest posts: `-1` sorts descending, `1` ascending',
    extra: 'Paging with large `skip()` values gets slow; filter on an indexed field instead, like `createdAt < lastSeen`.',
  },
  {
    front: 'Change one field of a document',
    back: js("db.users.updateOne({ _id: id }, { $set: { email: 'ada@example.com' } })"),
  },
  {
    front: `What happens here?\n${js("db.users.updateOne({ _id: id }, { email: 'ada@example.com' })")}`,
    back: 'It throws: update documents must use operators like `$set`. To replace a whole document on purpose, use `replaceOne`',
  },
  {
    front: 'Common update operators',
    back: '`$set` sets fields, `$unset` removes them, `$inc` adds to a number, `$push` appends to an array, `$addToSet` appends only if absent, `$pull` removes matching elements',
  },
  {
    front: 'What does `upsert: true` do?',
    back: 'Updates the matching document, or inserts a new one built from the filter and the update if nothing matches',
    extra: js("db.stats.updateOne({ day: '2026-10-15' }, { $inc: { views: 1 } }, { upsert: true })"),
  },
  {
    front: '`deleteOne` vs `deleteMany`',
    back: '`deleteOne` removes the first matching document; `deleteMany` removes all matches, and `deleteMany({})` empties the collection',
  },
  {
    front: 'MongoDB comparison operators',
    back: '`$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in` and `$nin`',
    extra: js("db.orders.find({ status: { $in: ['paid', 'shipped'] } })"),
  },
  {
    front: `Why does this ignore the lower bound?\n${js('db.users.find({ age: { $gt: 18 }, age: { $lt: 30 } })')}`,
    back: 'A JavaScript object can’t have two `age` keys, so the second replaces the first. Combine them: `{ age: { $gt: 18, $lt: 30 } }`',
  },
  {
    front: `What does this match?\n${js("db.users.find({ $or: [{ role: 'admin' }, { age: { $gte: 65 } }] })")}`,
    back: 'Users who are admins or at least 65. Listing several fields in one filter, without `$or`, means AND',
  },
  {
    front: 'Query a field inside an embedded document',
    back: "Use quoted dot notation: `{ 'address.city': 'Paris' }`",
    extra: 'Without quotes, `address.city` as a key is a JavaScript syntax error.',
  },
  {
    front: "What does `{ tags: 'mongodb' }` match when `tags` is an array?",
    back: "Every document whose `tags` array contains `'mongodb'`",
    extra: "`{ tags: ['a', 'b'] }` matches only that exact array in that order; use `$all` for “contains both”.",
  },
  {
    front: 'Why use `$elemMatch`?',
    back: 'To require a single array element to meet every condition. `{ scores: { $gte: 80, $lt: 90 } }` can match with one element ≥ 80 and a different one < 90',
    extra: js('db.students.find({ scores: { $elemMatch: { $gte: 80, $lt: 90 } } })'),
  },
  {
    front: 'What does `{ phone: null }` match?',
    back: 'Documents where `phone` is null and documents with no `phone` field at all; use `{ phone: { $exists: false } }` for missing only',
  },
  {
    front: "Which extra documents does `{ status: { $ne: 'banned' } }` return?",
    back: 'Documents that have no `status` field at all; `$ne` and `$nin` match missing fields too',
  },
  {
    front: '`countDocuments` vs `estimatedDocumentCount`',
    back: '`countDocuments(filter)` counts matching documents exactly; `estimatedDocumentCount()` returns the whole collection’s count from metadata, much faster',
  },
  {
    front: 'Create a unique index on `email`',
    back: js('db.users.createIndex({ email: 1 }, { unique: true })'),
    extra: '`1` is ascending and `-1` descending; direction matters mostly for compound sorts.',
  },
  {
    front: 'The ESR rule for compound indexes',
    back: 'Order fields as Equality, then Sort, then Range: fields matched exactly first, sort fields next, range filters like `$gt` last',
  },
  {
    front: 'Which queries can use an index on `{ a: 1, b: 1, c: 1 }`?',
    back: 'Queries on its prefixes: `a`, `a` and `b`, or all three. A query on `b` or `c` alone can’t use it efficiently',
  },
  {
    front: 'What is a multikey index?',
    back: 'An index on an array field: MongoDB indexes every element automatically. A compound index can include at most one array field per document',
  },
  {
    front: 'Delete sessions an hour after creation',
    back: js('db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })'),
    extra:
      'A TTL index needs a date field. A background task removes expired documents about every 60 seconds, so deletion isn’t instant.',
  },
  {
    front: 'How do you check whether a query uses an index?',
    back: "Run `.explain('executionStats')`: `IXSCAN` means an index scan, `COLLSCAN` a full collection scan. Compare `totalDocsExamined` with `nReturned`",
  },
  {
    front: 'What is the aggregation pipeline?',
    back: 'An array of stages, such as `$match`, `$group`, `$sort` and `$project`, where each stage transforms the documents and passes them to the next',
  },
  {
    front: 'Total paid order amounts per customer, largest first',
    back: js(
      'db.orders.aggregate([',
      "  { $match: { status: 'paid' } },",
      "  { $group: { _id: '$customerId', total: { $sum: '$amount' }, orders: { $sum: 1 } } },",
      '  { $sort: { total: -1 } },',
      '])',
    ),
  },
  {
    front: 'Why put `$match` as early as possible in a pipeline?',
    back: 'It shrinks the data every later stage processes, and a `$match` at the start of the pipeline can use indexes',
  },
  {
    front: 'Join orders with their users',
    back: js("{ $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } }"),
    extra: '`$lookup` is a left outer join within the same database; `user` is always an array.',
  },
  {
    front: "What does `{ $unwind: '$tags' }` do?",
    back: 'Outputs one copy of the document per element of `tags`, with `tags` set to that element; often used after `$lookup`',
  },
  {
    front: "`'$amount'` vs `'amount'` in an aggregation expression",
    back: "`'$amount'` is a field path that reads each document’s `amount`; `'amount'` is just the literal string",
  },
  {
    front: '`$project` vs `$addFields`',
    back: '`$project` reshapes documents, keeping only what you list (plus `_id`); `$addFields` (alias `$set`) keeps every field and adds or overwrites some',
  },
  {
    front: '`$out` vs `$merge`',
    back: 'Both write pipeline results to a collection and must be the last stage: `$out` replaces the target collection, `$merge` inserts or updates into it',
  },
  {
    front: 'When should you embed related data?',
    back: 'When it is read together with its parent, belongs to it, and stays small and bounded, like a user’s addresses or an order’s line items',
  },
  {
    front: 'When should you reference another document instead?',
    back: 'When the related data is large or unbounded, shared by many documents (many-to-many), or read and updated on its own',
  },
  {
    front: 'Why are ever-growing arrays an anti-pattern?',
    back: 'An array that grows without limit, like every comment on a post, slows updates and indexes and eventually hits the 16 MB document limit',
  },
  {
    front: 'Are MongoDB writes atomic?',
    back: 'A write to a single document is atomic, including its embedded documents. Multi-document ACID transactions exist (since 4.0) but cost more, so model data to need them rarely',
  },
  {
    front: 'What is a replica set?',
    back: 'A group of servers holding the same data: one primary takes writes, secondaries copy its oplog, and if the primary fails the others elect a new one',
  },
  {
    front: 'Why should a replica set have at least three members?',
    back: 'Electing a primary needs a majority of voting members. With three, losing one still leaves a majority; with two, losing either leaves no primary',
  },
  {
    front: 'What is the catch with reading from secondaries?',
    back: 'Replication is asynchronous, so a read preference like `secondaryPreferred` can return stale data',
  },
  {
    front: "What does write concern `w: 'majority'` mean?",
    back: 'The write is acknowledged only after most voting members have it, so it survives a primary failover; it is the default since MongoDB 5.0 in most deployments',
  },
  {
    front: 'What is sharding?',
    back: 'Horizontal scaling: a collection is split across shards by a shard key, `mongos` routers send each query to the right shards, and config servers hold the metadata',
    extra: 'Each shard is itself a replica set.',
  },
  {
    front: 'What makes a bad shard key?',
    back: 'A steadily increasing value like a timestamp (with ranged sharding, every insert hits one shard), low cardinality, or a field most queries don’t filter on (scatter-gather queries)',
    extra: 'Hashed sharding spreads monotonically increasing keys across shards.',
  },
]

export const MONGODB: PublicDeck = {
  slug: 'mongodb-essentials',
  title: 'MongoDB essentials: 50 cards on queries, indexes and aggregation',
  shortTitle: 'MongoDB',
  category: 'databases',
  level: 'beginner',
  icon: 'code',
  description:
    'MongoDB basics: documents and BSON, CRUD in mongosh, query operators, indexes, the aggregation pipeline, embedding vs referencing, replica sets and sharding.',
  intro:
    'MongoDB is quick to start with and easy to model badly. These cards cover documents and BSON, CRUD and query operators in mongosh, the gotchas that return surprising results (like null matching missing fields), compound and TTL indexes, the aggregation pipeline, when to embed and when to reference, and how replica sets and sharding keep data available and scalable.',
  faq: [
    {
      q: 'Which syntax do the examples use?',
      a: 'mongosh, the MongoDB shell, which is JavaScript. The Node.js driver uses the same method names and query documents, so the cards carry over directly.',
    },
    {
      q: 'Should I embed or reference related data?',
      a: 'Embed data that is read with its parent and stays bounded, like an order’s items. Reference data that is large, unbounded or shared, like a user’s orders or many-to-many relations.',
    },
    {
      q: 'Does MongoDB support transactions?',
      a: 'Yes. Single-document writes are always atomic, and multi-document ACID transactions are available on replica sets and sharded clusters, though a good schema needs them rarely.',
    },
  ],
  cards: CARDS,
}
