import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const js = (...lines: string[]) => code('js', ...lines)
const sh = (...lines: string[]) => code('bash', ...lines)

const CARDS: CardContent[] = [
  {
    front: 'What is Node.js?',
    back: 'A JavaScript runtime built on the V8 engine and libuv, for running JavaScript outside the browser: servers, CLIs and build tools',
  },
  {
    front: 'Is Node.js single-threaded?',
    back: 'Your JavaScript runs on one main thread, but I/O is handed to the operating system and libuv’s thread pool, so waiting on files or the network doesn’t block it',
  },
  {
    front: 'What is the event loop?',
    back: 'The loop that takes ready callbacks (finished I/O, due timers, and so on) from queues and runs them one at a time on the main thread whenever the call stack is empty',
  },
  {
    front: 'The phases of the Node.js event loop, in order',
    back: 'timers → pending callbacks → poll (I/O) → check (`setImmediate`) → close callbacks',
    extra: 'The `process.nextTick` queue and promise microtasks are drained after each callback, between phases too.',
  },
  {
    front: `In what order does this CommonJS script print?\n${js("console.log('A')", "setTimeout(() => console.log('B'), 0)", "Promise.resolve().then(() => console.log('C'))", "process.nextTick(() => console.log('D'))", "console.log('E')")}`,
    back: '`A E D C B`: synchronous code first, then the `nextTick` queue, then promise callbacks, then timers',
    extra: 'In an ES module the top level already runs inside a promise job, so `C` prints before `D`.',
  },
  {
    front: '`setImmediate` vs `setTimeout(fn, 0)`',
    back: '`setImmediate` runs in the check phase right after I/O polling; `setTimeout(fn, 0)` waits for the timers phase (with a 1 ms minimum)',
    extra: 'Inside an I/O callback `setImmediate` always fires first; from the main module their order isn’t guaranteed.',
  },
  {
    front: 'What blocks the event loop?',
    back: 'Long synchronous work: heavy loops, `readFileSync` on big files, huge `JSON.parse` calls, sync crypto, catastrophic regexes. Every other request waits until it finishes',
  },
  {
    front: 'What runs on libuv’s thread pool?',
    back: 'File system calls, `dns.lookup`, CPU-heavy crypto like `pbkdf2` and `scrypt`, and zlib compression; it has 4 threads by default (`UV_THREADPOOL_SIZE`)',
    extra: 'Network sockets don’t use the pool; they rely on OS mechanisms such as epoll and kqueue.',
  },
  {
    front: 'Import and export in CommonJS vs ES modules',
    back: js(
      '// CommonJS',
      "const { readFile } = require('node:fs/promises')",
      'module.exports = { load }',
      '',
      '// ES modules',
      "import { readFile } from 'node:fs/promises'",
      'export { load }',
    ),
  },
  {
    front: 'How does Node decide whether a `.js` file is CommonJS or ESM?',
    back: 'ESM if the nearest `package.json` has `"type": "module"`, CommonJS otherwise; `.mjs` files are always ESM and `.cjs` files always CommonJS',
    extra:
      'Recent versions also detect `import`/`export` syntax in files with no `type` field, but setting the field is clearer.',
  },
  {
    front: 'What replaces `__dirname` in an ES module?',
    back: '`import.meta.dirname` (and `import.meta.filename`), available since Node 20.11; older code uses `fileURLToPath(import.meta.url)`',
  },
  {
    front: `Why does this ESM import fail?\n${js("import { sum } from './math'")}`,
    back: "ES modules need the full file path, extension included: `'./math.js'`. There is no automatic `.js` or `index.js` resolution as in `require()`",
  },
  {
    front: 'Can CommonJS `require()` an ES module?',
    back: 'Yes, since Node 22.12 and 20.19, as long as the module graph has no top-level `await`; on older versions use `await import()`',
  },
  { front: 'Where can you use top-level `await`?', back: 'Only in ES modules, not in CommonJS files' },
  {
    front: 'Why import `node:fs` instead of `fs`?',
    back: 'The `node:` prefix always loads the built-in module, never an npm package with the same name; some newer built-ins like `node:test` and `node:sqlite` require it',
  },
  {
    front: 'What do `^1.4.2` and `~1.4.2` allow?',
    back: '`^1.4.2` allows `>=1.4.2 <2.0.0` (minor and patch updates); `~1.4.2` allows `>=1.4.2 <1.5.0` (patch updates only)',
    extra: 'Below 1.0 the caret is stricter: `^0.4.2` means `<0.5.0`.',
  },
  {
    front: '`npm install` vs `npm ci`',
    back: '`npm ci` deletes `node_modules`, installs exactly what the lockfile says and fails if it disagrees with `package.json`; it never rewrites either file, which makes it right for CI',
  },
  {
    front: 'Should you commit `package-lock.json`?',
    back: 'Yes, for applications: it pins the whole dependency tree so every machine and deploy installs the same versions',
  },
  {
    front: '`dependencies` vs `devDependencies`',
    back: 'Packages needed at runtime vs tools only needed to build and test, like TypeScript or a test runner; `npm install --omit=dev` skips the latter',
  },
  {
    front: 'What does `npx` do?',
    back: 'Runs a package’s command-line tool: from `node_modules/.bin` if it’s installed, otherwise it offers to download it temporarily',
    extra: sh('npx prettier --check .'),
  },
  {
    front: 'The four kinds of Node.js streams',
    back: 'Readable, Writable, Duplex (both, like a TCP socket) and Transform (a duplex that changes data passing through, like gzip)',
  },
  {
    front: 'Why use streams instead of reading a whole file?',
    back: 'They process data chunk by chunk, so memory stays flat even for gigabyte files, and output can start before the input has finished',
  },
  {
    front: 'What is backpressure?',
    back: "A slow writer telling a fast reader to wait: `write()` returns `false` when the buffer is full, and you should pause until the `'drain'` event",
    extra: '`pipeline()` and `.pipe()` handle backpressure for you.',
  },
  {
    front: 'Gzip a file with streams',
    back: js(
      "import { pipeline } from 'node:stream/promises'",
      "import { createReadStream, createWriteStream } from 'node:fs'",
      "import { createGzip } from 'node:zlib'",
      '',
      "await pipeline(createReadStream('app.log'), createGzip(), createWriteStream('app.log.gz'))",
    ),
  },
  {
    front: 'Why prefer `pipeline()` over `.pipe()`?',
    back: '`pipeline()` forwards errors from any stage and destroys every stream on failure; `.pipe()` doesn’t propagate errors, which can leak file handles',
  },
  {
    front: 'Read a stream chunk by chunk without event handlers',
    back: js('for await (const chunk of stream) {', '  process(chunk)', '}'),
    extra: 'Readable streams are async iterables.',
  },
  {
    front: 'What is a `Buffer`?',
    back: 'A fixed-size chunk of raw binary data; `Buffer` is a subclass of `Uint8Array` with helpers for encodings like UTF-8, hex and base64',
  },
  {
    front: `What do these return?\n${js("Buffer.byteLength('é')", "'é'.length")}`,
    back: '`2` and `1`: the string is 2 bytes in UTF-8 but 1 UTF-16 code unit',
  },
  {
    front: '`Buffer.alloc(n)` vs `Buffer.allocUnsafe(n)`',
    back: '`alloc` fills the memory with zeros; `allocUnsafe` is faster but may contain old data, so overwrite it completely before use',
  },
  {
    front: 'Encode and decode base64',
    back: js("Buffer.from('hi').toString('base64')       // 'aGk='", "Buffer.from('aGk=', 'base64').toString('utf8') // 'hi'"),
  },
  {
    front: 'Read a text file with `fs/promises`',
    back: js("import { readFile } from 'node:fs/promises'", '', "const text = await readFile('notes.txt', 'utf8')"),
    extra: 'Without an encoding you get a `Buffer`.',
  },
  {
    front: 'Why avoid `readFileSync` in a web server?',
    back: 'It blocks the event loop, so every other request waits; it’s fine at startup or in short CLI scripts',
  },
  {
    front: 'Create a nested directory',
    back: js("await mkdir('data/cache/images', { recursive: true })"),
    extra: 'With `recursive: true` it also succeeds if the directory already exists.',
  },
  {
    front: 'How should you check that a file exists before reading it?',
    back: "Don’t: just read it and handle the error, since the file can change between the check and the read. A missing file fails with `err.code === 'ENOENT'`",
  },
  {
    front: `What is \`process.argv\` for this command?\n${sh('node app.js --port 3000')}`,
    back: "`[pathToNode, pathToApp, '--port', '3000']`: your arguments start at index 2, so use `process.argv.slice(2)`",
    extra: '`util.parseArgs` parses flags without a library.',
  },
  {
    front: 'What type are `process.env` values?',
    back: "Always strings (or `undefined`): `PORT=3000` gives `'3000'`, and `DEBUG=false` gives the truthy string `'false'`",
  },
  {
    front: 'Load a `.env` file without the dotenv package',
    back: sh('node --env-file=.env app.js'),
    extra: 'Available since Node 20.6; `process.loadEnvFile()` does the same from code.',
  },
  {
    front: '`process.exit(1)` vs `process.exitCode = 1`',
    back: '`process.exit()` stops immediately, possibly before pending writes or async work finish; setting `exitCode` lets the process end naturally with that code',
  },
  {
    front: '`process.cwd()` vs `import.meta.dirname`',
    back: '`cwd()` is the directory the process was started from; `dirname` is the folder of the current module file. Resolve files relative to the module',
  },
  {
    front: 'What is an error-first callback?',
    back: 'The classic Node callback style: the first argument is an error (or `null`) and the result comes second',
    extra: js('fs.readFile(path, (err, data) => {', '  if (err) return handle(err)', '  use(data)', '})'),
  },
  {
    front: 'What happens on an unhandled promise rejection?',
    back: 'Since Node 15 the process crashes with exit code 1 by default; always `await` promises or attach `.catch()`',
  },
  {
    front: "What should a `process.on('uncaughtException')` handler do?",
    back: 'Log the error, then exit. The process may be in an inconsistent state, so resuming is unsafe; let a supervisor restart it',
  },
  {
    front: "What happens when an EventEmitter emits `'error'` with no listener?",
    back: "The error is thrown, which usually crashes the process; always handle `'error'` on streams, sockets and other emitters",
  },
  {
    front: 'Are EventEmitter listeners called asynchronously?',
    back: 'No. `emit()` calls every listener synchronously, in the order they were added, before it returns',
  },
  {
    front: 'What are worker threads for?',
    back: 'Running CPU-heavy JavaScript in parallel; each worker has its own V8 instance and event loop and talks to the main thread with `postMessage`',
    extra: js(
      "import { Worker } from 'node:worker_threads'",
      '',
      "const worker = new Worker(new URL('./hash.js', import.meta.url), { workerData: file })",
      "worker.on('message', (digest) => console.log(digest))",
    ),
  },
  {
    front: 'Do worker threads speed up I/O-heavy code?',
    back: 'Not really: Node’s async I/O already avoids blocking. Workers help with CPU-bound tasks like image processing, parsing or hashing',
  },
  {
    front: 'Write a minimal HTTP server',
    back: js(
      "import { createServer } from 'node:http'",
      '',
      'createServer((req, res) => {',
      "  res.writeHead(200, { 'Content-Type': 'text/plain' })",
      "  res.end('Hello')",
      '}).listen(3000)',
    ),
    extra: 'Forget `res.end()` and the request hangs until it times out.',
  },
  {
    front: 'Read a JSON request body with plain `node:http`',
    back: js(
      'const chunks = []',
      'for await (const chunk of req) chunks.push(chunk)',
      'const body = JSON.parse(Buffer.concat(chunks).toString())',
    ),
    extra: '`req` is a Readable stream; the body arrives in chunks.',
  },
  {
    front: 'Does Node have `fetch` built in?',
    back: 'Yes, globally since Node 18 (stable since 21), along with `Request`, `Response`, `Headers` and `FormData`; it’s built on undici',
  },
  {
    front: 'Can Node run a `.ts` file directly?',
    back: 'Yes, since Node 22.18 and 23.6 it strips type annotations by default. It doesn’t type-check, and syntax that needs transforming, like `enum`, requires `--experimental-transform-types`',
  },
]

export const NODEJS: PublicDeck = {
  slug: 'nodejs-essentials',
  title: 'Node.js essentials: 50 cards on the event loop, modules and streams',
  shortTitle: 'Node.js',
  category: 'web',
  level: 'beginner',
  icon: 'code',
  description:
    'Node.js fundamentals: the event loop, ESM vs CommonJS, npm, streams, Buffer, fs/promises, process, error handling, worker threads and a basic HTTP server.',
  intro:
    'Node.js runs your JavaScript on a single thread, and most surprises come from forgetting that. These cards explain the event loop and its queues, how ES modules differ from CommonJS, what npm’s version ranges and lockfile really do, and how streams, Buffers and the fs and process APIs work, plus the error-handling habits that keep a server from crashing.',
  faq: [
    {
      q: 'Which Node.js version does this deck target?',
      a: 'Current LTS releases. Cards note when a feature is recent, such as require() of ES modules (22.12), import.meta.dirname (20.11) and built-in TypeScript type stripping (22.18).',
    },
    {
      q: 'Do I need to know JavaScript first?',
      a: 'Yes. The deck assumes you know functions, promises and async/await; our JavaScript essentials deck covers those.',
    },
    {
      q: 'Does it cover Express or other frameworks?',
      a: 'No. It sticks to Node.js itself, which every framework builds on: the event loop, modules, streams and the built-in http module.',
    },
  ],
  cards: CARDS,
}
