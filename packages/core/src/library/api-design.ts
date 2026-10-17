import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const json = (...lines: string[]) => code('json', ...lines)
const sql = (...lines: string[]) => code('sql', ...lines)
const yaml = (...lines: string[]) => code('yaml', ...lines)

const CARDS: CardContent[] = [
  // REST
  {
    front: 'What is REST?',
    back: 'An architectural style for networked APIs, described by Roy Fielding in 2000: resources identified by URLs and manipulated through a uniform interface of standard HTTP methods',
    extra:
      'Its constraints: client-server, stateless, cacheable, uniform interface, layered system, and optional code on demand.',
  },
  {
    front: 'How should REST endpoints be named?',
    back: 'Nouns for resources, plural for collections, and HTTP methods for the action: `GET /users`, `GET /users/42`, `POST /users/42/orders`',
    extra: 'Avoid verbs in paths, like `/getUser` or `/createOrder`.',
  },
  {
    front: 'What does “stateless” mean for a REST API?',
    back: 'Each request carries everything the server needs to handle it, such as the auth token; the server keeps no client session between requests',
    extra: 'Any server instance can then handle any request, which makes scaling out easy.',
  },
  {
    front: 'HATEOAS',
    back: 'Hypermedia as the engine of application state: responses include links to related resources and available actions, so clients follow links instead of hard-coding URLs',
    extra: 'It’s the strictest REST constraint and is rarely implemented in full.',
  },
  {
    front: 'Filtering, sorting and selecting fields in a REST API',
    back: 'Query parameters on the collection, e.g. `GET /orders?status=shipped&sort=-created_at&fields=id,total`',
  },
  // HTTP methods
  {
    front: 'What do GET, POST, PUT, PATCH and DELETE do?',
    back: 'GET reads, POST creates (or triggers processing), PUT replaces, PATCH partially updates, DELETE removes',
  },
  {
    front: 'Which HTTP methods are safe?',
    back: 'GET, HEAD and OPTIONS (and TRACE): they must not change server state',
    extra: 'Crawlers and link prefetchers assume safe methods are harmless, so never let a GET delete or modify data.',
  },
  {
    front: 'Which HTTP methods are idempotent?',
    back: 'GET, HEAD, OPTIONS, PUT and DELETE. POST is not, and PATCH isn’t guaranteed to be',
    extra: 'Idempotency is about server state, not the response: a repeated DELETE may return 404 and is still idempotent.',
  },
  {
    front: 'PUT vs PATCH',
    back: 'PUT replaces the whole resource with the request body; PATCH applies a partial change, such as updating only the fields sent',
    extra: 'Common PATCH formats are JSON Merge Patch (RFC 7396) and JSON Patch (RFC 6902).',
  },
  {
    front: 'Creating a resource: POST vs PUT',
    back: '`POST /users` when the server assigns the ID; `PUT /users/alice` when the client chooses the URL (PUT creates or replaces)',
  },
  // Status codes
  {
    front: 'The five classes of HTTP status codes',
    back: '1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error',
  },
  {
    front: '200 vs 201 vs 204',
    back: '200 OK, with a response body. 201 Created, usually with a `Location` header pointing to the new resource. 204 No Content: success with an empty body',
  },
  {
    front: '400 vs 422',
    back: '400 Bad Request: the request is malformed, e.g. invalid JSON. 422 Unprocessable Content: it’s well-formed but fails validation',
    extra: 'Many APIs use 400 for both; pick one convention and document it.',
  },
  {
    front: '401 vs 403',
    back: '401 Unauthorized: not authenticated (credentials missing or invalid). 403 Forbidden: authenticated, but not allowed to do this',
    extra:
      'Despite its name, 401 is about authentication. Some APIs answer 404 instead of 403 to avoid revealing that a resource exists.',
  },
  {
    front: '404 vs 405',
    back: '404 Not Found: nothing exists at this URL. 405 Method Not Allowed: the resource exists but doesn’t support this method, and the response must list the allowed ones in an `Allow` header',
  },
  {
    front: 'When should an API return 409 Conflict?',
    back: 'When the request conflicts with the resource’s current state, e.g. signing up with a username that’s taken, or updating a record that changed in the meantime',
  },
  {
    front: '500 vs 502 vs 503 vs 504',
    back: '500: an unexpected server error. 502 Bad Gateway: a proxy got an invalid response from upstream. 503 Service Unavailable: overloaded or down for maintenance. 504 Gateway Timeout: the upstream didn’t answer in time',
  },
  {
    front: 'How do ETags make repeated GET requests cheaper?',
    back: 'The server sends an `ETag` (a version tag); the client sends it back in `If-None-Match`, and if nothing changed the server answers `304 Not Modified` with no body',
  },
  {
    front: 'How do you prevent lost updates when two clients edit the same resource?',
    back: 'Optimistic concurrency: send `If-Match` with the ETag you read. If the resource changed since then, the server rejects the write with `412 Precondition Failed`',
    extra: 'Without such a check, the last write silently overwrites the other client’s changes.',
  },
  {
    front: 'Standard format for API error responses',
    back: 'Problem Details (RFC 9457): a JSON body served as `application/problem+json`',
    extra: json(
      '{',
      '  "type": "https://example.com/errors/out-of-credit",',
      '  "title": "You do not have enough credit.",',
      '  "status": 403,',
      '  "detail": "Your balance is 30, but that costs 50."',
      '}',
    ),
  },
  // Pagination
  {
    front: 'Offset vs cursor pagination',
    back: 'Offset (`?limit=20&offset=40`) is simple and can jump to any page, but slows down at large offsets and skips or repeats items when data changes. Cursor (`?limit=20&after=abc123`) is fast and stable, but only moves to the next or previous page',
  },
  {
    front: 'Keyset (cursor) pagination in SQL',
    back: sql(
      'SELECT * FROM posts',
      'WHERE (created_at, id) < (:last_created_at, :last_id)',
      'ORDER BY created_at DESC, id DESC',
      'LIMIT 20;',
    ),
    extra:
      'The cursor encodes the sort key of the last row returned. Including `id` breaks ties, and an index on `(created_at, id)` keeps every page fast.',
  },
  {
    front: 'How do API clients find the next page?',
    back: 'Return a cursor or URL for the next page in the body (e.g. `"next_cursor": "abc123"`), or a `Link` header with `rel="next"`, as GitHub does',
    extra: 'Leave the cursor out (or null) on the last page so clients know when to stop.',
  },
  // Versioning
  {
    front: 'Three common ways to version an API',
    back: 'In the URL path (`/v1/users`), in a header (e.g. `Accept: application/vnd.example.v2+json`), or as a query parameter (`?version=2`)',
    extra: 'Path versioning is the most common because it’s explicit and easy to route, cache and test.',
  },
  {
    front: 'Breaking vs non-breaking API changes',
    back: 'Breaking: removing or renaming fields, changing types or meanings, adding required parameters. Non-breaking: adding endpoints, optional parameters or new response fields',
    extra: 'New fields are only safe if clients ignore fields they don’t recognize, so tell them to.',
  },
  {
    front: 'How do you retire an old API version gracefully?',
    back: 'Announce a timeline, flag it in responses with `Deprecation` and `Sunset` headers, watch who still calls it, and only then switch it off',
    extra: 'The `Sunset` header (RFC 8594) gives the date the endpoint will stop working.',
  },
  // Authentication and authorization
  {
    front: 'Authentication vs authorization',
    back: 'Authentication checks who you are; authorization decides what you’re allowed to do',
  },
  {
    front: 'When do API keys fit, and how should they be sent?',
    back: 'For identifying a calling application or project, e.g. server-to-server calls and usage metering. Send them in a header, never in the URL',
    extra: 'An API key identifies an app, not a user, and can’t express a user’s consent; use OAuth for delegated access.',
  },
  {
    front: 'What problem does OAuth 2.0 solve?',
    back: 'Delegated authorization: a user lets an app access their data at another service, limited by scopes, without giving the app their password',
    extra: 'The app receives an access token and sends it with each call as `Authorization: Bearer <token>`.',
  },
  {
    front: 'The four OAuth 2.0 roles',
    back: 'Resource owner (the user), client (the app), authorization server (issues tokens), resource server (the API that accepts them)',
  },
  {
    front: 'Which OAuth 2.0 flow should web, mobile and single-page apps use?',
    back: 'Authorization code with PKCE: the user signs in at the authorization server, and the app exchanges the short-lived code it gets back, together with a secret code verifier, for tokens',
    extra: 'PKCE stops an intercepted code from being redeemed by an attacker. The older implicit flow is deprecated.',
  },
  {
    front: 'OAuth 2.0 flow for machine-to-machine calls with no user',
    back: 'Client credentials: the service authenticates with its own client ID and secret to get an access token',
  },
  {
    front: 'OAuth 2.0 vs OpenID Connect',
    back: 'OAuth 2.0 handles authorization (access tokens for APIs). OpenID Connect adds an identity layer on top, with an ID token (a JWT) saying who signed in',
    extra: '“Sign in with Google” uses OpenID Connect.',
  },
  {
    front: 'Structure of a JWT',
    back: 'Three base64url parts joined by dots, `header.payload.signature`. The payload holds claims such as `sub`, `exp`, `iss` and `aud`',
    extra: 'A typical JWT is signed, not encrypted: anyone can decode and read the payload, so never put secrets in it.',
  },
  {
    front: 'What must a server check when it receives a JWT?',
    back: 'The signature, using the algorithm it expects (never accept `alg: none`), plus the expiry (`exp`), the issuer (`iss`) and the audience (`aud`)',
  },
  {
    front: 'Access token vs refresh token',
    back: 'Access tokens are short-lived (minutes) and sent with every API call. Refresh tokens live longer and are sent only to the authorization server, to get new access tokens',
    extra:
      'Short lifetimes limit the damage of a leaked token, because a self-contained JWT can’t easily be revoked before it expires.',
  },
  // CORS
  {
    front: 'What is CORS?',
    back: 'Cross-Origin Resource Sharing: a way for a server to tell browsers which other origins may read its responses, using headers such as `Access-Control-Allow-Origin`',
    extra:
      'An origin is scheme + host + port. Without CORS headers, the browser’s same-origin policy stops scripts from reading cross-origin responses.',
  },
  {
    front: 'When does a browser send a CORS preflight request?',
    back: 'Before a cross-origin request that isn’t “simple”, e.g. `PUT` or `DELETE`, a `Content-Type: application/json` body, or custom headers. It sends `OPTIONS` to ask whether that method and those headers are allowed',
    extra: '`Access-Control-Max-Age` lets the browser cache the answer.',
  },
  {
    front: 'CORS rules for requests that send cookies',
    back: 'The server must send `Access-Control-Allow-Credentials: true` and name the exact origin; `Access-Control-Allow-Origin: *` isn’t allowed with credentials',
    extra: 'Only browsers enforce CORS. It doesn’t protect an API from curl or other servers; that’s the job of authentication.',
  },
  // Rate limits and retries
  {
    front: 'How should an API tell clients they hit a rate limit?',
    back: 'Respond with `429 Too Many Requests` and a `Retry-After` header',
    extra:
      'Many APIs also send headers like `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset`, so clients can slow down before they hit the limit.',
  },
  {
    front: 'How do you make `POST /payments` safe to retry?',
    back: 'The client sends a unique `Idempotency-Key` header; the server stores the first result for that key and returns it for any retry instead of charging again',
    extra: 'Stripe popularized this pattern, and the IETF is standardizing the header.',
  },
  // OpenAPI
  {
    front: 'What is OpenAPI?',
    back: 'A standard, machine-readable format (YAML or JSON) for describing HTTP APIs: endpoints, parameters, request and response schemas, and authentication',
    extra:
      'Formerly called Swagger. One spec can drive docs, client and server code generation, request validation and mock servers.',
  },
  {
    front: `What does this OpenAPI snippet describe?\n${yaml(
      'paths:',
      '  /users/{id}:',
      '    get:',
      '      parameters:',
      '        - name: id',
      '          in: path',
      '          required: true',
      '          schema:',
      '            type: integer',
      '      responses:',
      '        "200":',
      '          description: The user',
      '        "404":',
      '          description: No such user',
    )}`,
    back: 'A `GET /users/{id}` endpoint with a required integer path parameter `id`, which responds with 200 (the user) or 404',
  },
  // gRPC, GraphQL and webhooks
  {
    front: 'What is gRPC?',
    back: 'An RPC framework that sends Protocol Buffers messages over HTTP/2. Services are defined in `.proto` files that generate typed clients and servers, with streaming in either or both directions',
    extra:
      'Fast and strongly typed, it’s popular between internal services. Browsers can’t call it directly and need a bridge such as gRPC-Web.',
  },
  {
    front: 'What is GraphQL?',
    back: 'A query language for APIs: clients send queries to a single endpoint and get back exactly the fields they asked for, checked against a typed schema',
    extra:
      'It avoids over-fetching (too much data) and under-fetching (several round trips), but makes HTTP caching and rate limiting harder.',
  },
  {
    front: 'REST vs GraphQL vs gRPC: which fits?',
    back: 'REST for public, resource-oriented, cacheable APIs; GraphQL when varied clients need flexible, nested data in one request; gRPC for fast, typed service-to-service calls and streaming',
  },
  {
    front: 'The N+1 problem in GraphQL',
    back: 'Resolving a list and then a field on each item runs one query for the list plus one more per item',
    extra: 'Batch and cache those lookups per request with a DataLoader.',
  },
  {
    front: 'What is a webhook?',
    back: 'An HTTP callback: when an event happens, the provider sends a POST to a URL you registered, so you don’t have to poll for changes',
  },
  {
    front: 'How do you verify that a webhook really came from the provider?',
    back: 'Check its signature: compute an HMAC of the raw request body with the shared secret and compare it, in constant time, with the signature header, such as GitHub’s `X-Hub-Signature-256`',
    extra: 'Also reject old timestamps to block replayed requests, and accept webhooks only over HTTPS.',
  },
  {
    front: 'Best practices for receiving webhooks',
    back: 'Return a 2xx quickly and do the work asynchronously, deduplicate by event ID because providers retry, and don’t assume events arrive in order',
  },
]

export const API_DESIGN: PublicDeck = {
  slug: 'api-design',
  title: 'API design basics: 50 cards on REST, status codes and auth',
  shortTitle: 'API design',
  category: 'cs',
  level: 'beginner',
  icon: 'code',
  description:
    'API design fundamentals: REST, HTTP methods, status codes, pagination, versioning, OAuth 2.0 and JWT, CORS, OpenAPI, GraphQL, gRPC and webhooks.',
  intro:
    'Fifty cards on designing HTTP APIs that are pleasant to use and hard to misuse: resource naming and methods, the status codes that matter, pagination and versioning, API keys, OAuth 2.0 and JWTs, CORS, rate limits and idempotency keys, and when GraphQL, gRPC or webhooks fit better than plain REST.',
  faq: [
    {
      q: 'Is REST still the default choice for APIs?',
      a: 'For public and resource-oriented APIs, yes: it works with every HTTP client, caches well and is easy to explore. GraphQL and gRPC fit specific needs, such as flexible client queries or fast internal calls.',
    },
    {
      q: 'Should I put the API version in the URL?',
      a: 'URL versioning like /v1/ is the most common because it is explicit and easy to route. Header versioning keeps URLs clean but is harder to try in a browser. Either works if you avoid breaking changes within a version.',
    },
    {
      q: 'Is a JWT the same as OAuth?',
      a: 'No. OAuth 2.0 is a framework for obtaining access tokens, and a JWT is one token format. Many OAuth servers issue JWTs, but others use opaque tokens.',
    },
  ],
  cards: CARDS,
}
