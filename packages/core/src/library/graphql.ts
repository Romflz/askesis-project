import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const gql = (...lines: string[]) => code('graphql', ...lines)
const js = (...lines: string[]) => code('js', ...lines)
const json = (...lines: string[]) => code('json', ...lines)

const CARDS: CardContent[] = [
  {
    front: 'What is GraphQL?',
    back: 'A query language for APIs plus a runtime that executes queries against a typed schema; clients ask for exactly the fields they need and get that shape back',
  },
  {
    front: 'How is a GraphQL API usually served over HTTP?',
    back: 'From a single endpoint, often `/graphql`, usually as a `POST` with a JSON body holding `query`, `variables` and an optional `operationName`',
  },
  {
    front: 'What is a GraphQL schema?',
    back: 'The contract of the API: every type, field, argument and root operation it supports, usually written in the Schema Definition Language (SDL)',
  },
  {
    front: 'Define a `User` type with an ID, a required name and a list of posts',
    back: gql('type User {', '  id: ID!', '  name: String!', '  email: String', '  posts: [Post!]!', '}'),
  },
  {
    front: 'What does `!` mean after a type?',
    back: 'Non-null: the field never returns `null`, or, on an argument, a value must be provided',
  },
  {
    front: '`[Post]` vs `[Post!]!`',
    back: '`[Post]`: the list may be null and may contain nulls. `[Post!]!`: the list is never null and has no null items, though it can be empty',
  },
  {
    front: 'The five built-in scalar types',
    back: '`Int` (32-bit signed), `Float` (double precision), `String`, `Boolean` and `ID`',
  },
  {
    front: 'What is the `ID` scalar?',
    back: 'A unique identifier that is serialized as a string; it accepts string or integer input and isn’t meant to be human-readable',
  },
  {
    front: 'What does `scalar DateTime` do?',
    back: 'Declares a custom scalar type; the server implements how it is serialized, parsed and validated',
  },
  {
    front: 'The three root operation types',
    back: '`Query` for reads, `Mutation` for writes and `Subscription` for real-time events',
  },
  {
    front: `What does this query return?\n${gql('query {', '  user(id: "1") {', '    name', '  }', '}')}`,
    back: json('{ "data": { "user": { "name": "Ada" } } }'),
    extra: 'The response mirrors the shape of the query.',
  },
  {
    front: 'What keys can a GraphQL response contain?',
    back: '`data` with the requested fields and, if anything failed, an `errors` array; both appear together when a result is partial',
    extra: 'An optional `extensions` key carries extra metadata such as tracing.',
  },
  {
    front: `Why is this query invalid?\n${gql('{', '  user(id: "1")', '}')}`,
    back: '`user` returns an object type, and every selection must end in leaf fields (scalars or enums). Add a sub-selection like `{ name }`',
  },
  {
    front: 'Pass an argument with a variable',
    back: gql('query GetUser($id: ID!) {', '  user(id: $id) {', '    name', '  }', '}'),
    extra: 'Variables travel separately as JSON, e.g. `{ "id": "42" }`. A default looks like `$limit: Int = 10`.',
  },
  {
    front: 'Why use variables instead of building the query string yourself?',
    back: 'No injection or escaping bugs, the server validates their types, and the query text stays constant, so it can be cached or persisted',
  },
  {
    front: 'What is `GetUser` in `query GetUser { … }`?',
    back: 'The operation name: it appears in logs and tracing, and selects which operation to run when a document holds several',
    extra: 'A single query may use the anonymous shorthand `{ me { name } }`.',
  },
  {
    front: 'Request the same field twice with different arguments',
    back: gql('{', '  thumb: avatar(size: 64)', '  full: avatar(size: 512)', '}'),
    extra: 'Aliases rename fields in the result so they don’t collide.',
  },
  {
    front: 'What is a fragment?',
    back: 'A reusable selection of fields on a type, spread into queries with `...`',
    extra: gql('fragment UserCard on User {', '  id', '  name', '  avatarUrl', '}', '', 'query {', '  me { ...UserCard }', '}'),
  },
  {
    front: 'Query a field that returns a union type',
    back: gql(
      '{',
      '  search(text: "ada") {',
      '    __typename',
      '    ... on User { name }',
      '    ... on Post { title }',
      '  }',
      '}',
    ),
    extra: 'Inline fragments (`... on Type`) select fields per concrete type.',
  },
  {
    front: 'What does `__typename` return?',
    back: 'The name of the object’s concrete type, like `"User"`; clients use it with unions, interfaces and cache normalization',
  },
  {
    front: 'Fetch a field only when a variable is true',
    back: gql(
      'query Profile($withAvatar: Boolean!) {',
      '  me {',
      '    name',
      '    avatarUrl @include(if: $withAvatar)',
      '  }',
      '}',
    ),
    extra: '`@skip(if: …)` is the inverse.',
  },
  {
    front: 'How do you retire a field without breaking clients?',
    back: 'Mark it `@deprecated(reason: "Use fullName instead")`: it keeps working, while introspection and tooling warn anyone still using it',
  },
  {
    front: 'Define an enum type',
    back: gql('enum Role {', '  ADMIN', '  EDITOR', '  VIEWER', '}'),
    extra: 'Enum values are serialized as their names, like `"ADMIN"`.',
  },
  {
    front: 'Interface vs union',
    back: 'An interface declares fields that implementing types must have, and you can query those fields directly; a union lists types with no shared fields, so you need fragments for everything but `__typename`',
  },
  {
    front: 'Why do mutation arguments use `input` types?',
    back: 'Arguments must be input types (scalars, enums or `input` objects); regular object types can’t be used as arguments',
    extra: gql('input CreatePostInput {', '  title: String!', '  body: String', '}'),
  },
  {
    front: 'Write a mutation that creates a post',
    back: gql(
      'mutation CreatePost($input: CreatePostInput!) {',
      '  createPost(input: $input) {',
      '    id',
      '    title',
      '  }',
      '}',
    ),
    extra: 'Returning the changed object lets clients update their caches without refetching.',
  },
  {
    front: 'How do top-level fields in one mutation execute?',
    back: 'Serially, in the order written, so each write finishes before the next starts; top-level query fields may resolve in parallel',
  },
  {
    front: 'What is a subscription?',
    back: 'A long-lived operation where the server pushes a result every time an event happens, usually over WebSockets (the graphql-ws protocol) or server-sent events',
    extra:
      gql('subscription {', '  messageAdded(roomId: "1") {', '    text', '  }', '}') +
      '\nA subscription must select exactly one root field.',
  },
  {
    front: 'What is a resolver?',
    back: 'A function that produces the value of one field; it receives `(parent, args, context, info)`',
  },
  {
    front: 'What happens for a field with no resolver?',
    back: 'The default resolver returns the property of the same name on the parent object (calling it if it’s a function)',
  },
  {
    front: 'What belongs in the resolver `context`?',
    back: 'Per-request shared things: the authenticated user, database clients and DataLoaders. It is created fresh for every request',
  },
  {
    front: `What is \`user\` in the \`User.posts\` resolver?\n${js('const resolvers = {', '  Query: {', '    user: (_parent, { id }, { db }) => db.users.find(id),', '  },', '  User: {', '    posts: (user, _args, { db }) => db.posts.byAuthor(user.id),', '  },', '}')}`,
    back: 'The `User` object returned by the parent resolver, `Query.user`; resolvers run top-down, each receiving its parent’s result',
  },
  {
    front: 'What is the N+1 problem in GraphQL?',
    back: 'Fetching a list of N posts with one query, then resolving each post’s `author` with its own query: 1 + N database round trips',
  },
  {
    front: 'How does DataLoader fix N+1?',
    back: 'It collects every `load(key)` made in the same tick, calls your batch function once with all the keys (one `WHERE id IN (…)` query) and caches results for the request',
    extra: js(
      'const userLoader = new DataLoader(async (ids) => {',
      '  const users = await db.users.findMany({ where: { id: { in: ids } } })',
      '  return ids.map((id) => users.find((u) => u.id === id) ?? null)',
      '})',
      '// Post.author: (post) => userLoader.load(post.authorId)',
    ),
  },
  {
    front: 'What must a DataLoader batch function return?',
    back: 'A promise of an array with the same length and order as the keys, holding `null` or an `Error` for keys that weren’t found',
  },
  {
    front: 'Why create DataLoaders per request?',
    back: 'Their cache would otherwise outlive the request, serving stale data and leaking one user’s results to another',
  },
  {
    front: 'What is introspection?',
    back: 'Querying the schema itself through fields like `__schema` and `__type`; it powers GraphiQL, editor autocomplete and code generators',
  },
  {
    front: `What does this query return?\n${gql('{', '  __type(name: "User") {', '    fields { name }', '  }', '}')}`,
    back: 'The names of all fields on the `User` type, read from the schema through introspection',
  },
  {
    front: 'Should introspection be on in production?',
    back: 'Private APIs often disable it to reduce attack surface; public APIs keep it. It isn’t real security on its own, since error suggestions can still leak field names',
  },
  {
    front: 'GraphQL vs REST: fetching data',
    back: 'GraphQL fetches nested data in one request with only the fields asked for; REST often needs several endpoints and returns fixed shapes (over- or under-fetching)',
  },
  {
    front: 'GraphQL vs REST: HTTP caching',
    back: 'REST caches per URL with standard HTTP caching; GraphQL usually POSTs to one URL, so caching moves to the client or to persisted queries sent with GET',
  },
  {
    front: 'Why can a failed GraphQL request return `200 OK`?',
    back: 'Many servers report field and validation errors in the `errors` array with a 200 status, so clients must check `errors`, not just the status code',
  },
  {
    front: 'What happens when a non-null field fails to resolve?',
    back: 'The `null` propagates up to the nearest nullable parent field, possibly making all of `data` null, and the error is added to `errors`',
  },
  {
    front: 'How do you protect a GraphQL server from expensive queries?',
    back: 'Limit query depth and complexity, cap list sizes with pagination, set timeouts, and for private APIs allow only known persisted queries',
  },
  {
    front: 'What are persisted queries?',
    back: 'Clients send a hash or ID instead of the full query text; requests get smaller, can be sent with GET for caching, and servers can allowlist them',
  },
  {
    front: 'Paginate with cursors (connections)',
    back: gql(
      'posts(first: 10, after: $cursor) {',
      '  edges {',
      '    cursor',
      '    node { id title }',
      '  }',
      '  pageInfo { hasNextPage endCursor }',
      '}',
    ),
    extra: 'The Relay convention: pass `pageInfo.endCursor` as `after` to load the next page.',
  },
  {
    front: 'Schema-first vs code-first',
    back: 'Schema-first: write the SDL, then attach resolvers. Code-first: define types in code (classes or builder functions) and generate the schema from them',
  },
  {
    front: 'How do GraphQL APIs usually handle versioning?',
    back: 'They avoid `/v2` endpoints: add new fields freely and deprecate old ones, since clients only get the fields they ask for',
  },
  {
    front: 'What does a normalized client cache do?',
    back: 'Clients like Apollo Client store each object once, keyed by `__typename` and `id`, so updating one object refreshes every query that shows it',
  },
  {
    front: 'Does GraphQL require a particular database?',
    back: 'No. It is only the API layer: resolvers can read from any database, REST service or other source, or several at once',
  },
]

export const GRAPHQL: PublicDeck = {
  slug: 'graphql-essentials',
  title: 'GraphQL essentials: 50 cards on schemas, queries and resolvers',
  shortTitle: 'GraphQL',
  category: 'web',
  level: 'beginner',
  icon: 'code',
  description:
    'GraphQL basics: schema types, queries, mutations, subscriptions, resolvers, variables, fragments, N+1 and DataLoader, introspection and GraphQL vs REST.',
  intro:
    'GraphQL lets clients ask for exactly the data they need, but a good API takes more than a schema. These cards cover the type system and nullability, writing queries with variables, aliases and fragments, mutations and subscriptions, how resolvers run, the N+1 problem and DataLoader, introspection, and the trade-offs against REST around caching, errors and security.',
  faq: [
    {
      q: 'Is this deck about a specific GraphQL server or client?',
      a: 'No. It covers the GraphQL language and spec, which work the same in Apollo, GraphQL Yoga, Relay, urql or any other implementation. Resolver examples use plain JavaScript.',
    },
    {
      q: 'Is GraphQL better than REST?',
      a: 'Neither is better in general. GraphQL shines when clients need flexible, nested data from one endpoint; REST is simpler to cache and fine for straightforward resources.',
    },
    {
      q: 'What is the N+1 problem?',
      a: 'When a list field returns N items and a nested field on each item triggers its own database query, one request turns into N + 1 queries. Batching with DataLoader collapses them into two.',
    },
  ],
  cards: CARDS,
}
