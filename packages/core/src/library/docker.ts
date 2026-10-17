import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const sh = (...lines: string[]) => code('bash', ...lines)
const dockerfile = (...lines: string[]) => code('dockerfile', ...lines)
const yaml = (...lines: string[]) => code('yaml', ...lines)

const CARDS: CardContent[] = [
  {
    front: 'Image vs container',
    back: 'An image is a read-only template made of layers; a container is a running (or stopped) instance of an image with its own writable layer',
  },
  { front: 'What creates a new image layer?', back: 'Instructions that change the filesystem, mainly `RUN`, `COPY` and `ADD`' },
  {
    front: 'When does Docker’s build cache stop being reused?',
    back: 'At the first instruction whose inputs changed; every instruction after it is rebuilt',
  },
  {
    front: 'Order a Node.js Dockerfile so dependency installs stay cached',
    back: dockerfile('COPY package.json package-lock.json ./', 'RUN npm ci', 'COPY . .'),
    extra: 'Copying the lockfile first means code changes don’t invalidate the `npm ci` layer.',
  },
  {
    front: 'What does `FROM` do?',
    back: 'Sets the base image for the build stage; every Dockerfile starts with it (after optional `ARG`s)',
  },
  {
    front: '`COPY` vs `ADD`',
    back: '`COPY` copies files from the build context; `ADD` can also fetch URLs and auto-extract local tar archives',
    extra: 'Prefer `COPY` unless you need those extras.',
  },
  {
    front: '`CMD` vs `ENTRYPOINT`',
    back: '`ENTRYPOINT` sets the executable; `CMD` sets default arguments (or the default command) that `docker run` arguments replace',
  },
  {
    front: 'Exec form vs shell form',
    back: 'Exec form (JSON array) runs the program directly as PID 1 so it receives signals; shell form wraps it in `/bin/sh -c`',
    extra: dockerfile('CMD ["node", "server.js"]   # exec form', 'CMD node server.js           # shell form'),
  },
  {
    front: '`ARG` vs `ENV`',
    back: '`ARG` exists only at build time; `ENV` is set at build time and persists into running containers',
  },
  {
    front: 'What does `WORKDIR` do?',
    back: 'Sets (and creates if needed) the working directory for later instructions and for the container',
  },
  {
    front: 'Run the container as a non-root user',
    back: dockerfile('RUN useradd --create-home app', 'USER app'),
    extra: 'Official Node images already include a `node` user: `USER node`.',
  },
  {
    front: 'What does `EXPOSE 3000` do?',
    back: 'Documents the port the app listens on; it doesn’t publish it. Use `-p` at run time',
  },
  {
    front: 'Add a health check to an image',
    back: dockerfile('HEALTHCHECK --interval=30s --timeout=3s \\', '  CMD curl -fsS http://localhost:3000/health || exit 1'),
  },
  {
    front: 'Multi-stage build',
    back: 'Build in one stage and copy only the artifacts into a small final image',
    extra: dockerfile(
      'FROM node:22 AS build',
      'WORKDIR /app',
      'COPY . .',
      'RUN npm ci && npm run build',
      '',
      'FROM node:22-slim',
      'WORKDIR /app',
      'COPY --from=build /app/dist ./dist',
      'CMD ["node", "dist/server.js"]',
    ),
  },
  {
    front: 'What is `.dockerignore` for?',
    back: 'Excludes files from the build context (like `node_modules`, `.git`, `.env`), making builds faster and images safer',
  },
  {
    front: 'What is the build context?',
    back: 'The set of files sent to the builder, usually the directory passed to `docker build` (often `.`)',
  },
  { front: 'Build and tag an image', back: sh('docker build -t myapp:1.0 .') },
  { front: 'Run a container detached, named, with a published port', back: sh('docker run -d --name web -p 8080:80 nginx') },
  { front: 'In `-p 8080:80`, which port is the host’s?', back: 'The first: host port 8080 maps to container port 80' },
  { front: 'Remove the container automatically when it exits', back: sh('docker run --rm alpine echo hi') },
  { front: 'Pass an environment variable or an env file', back: sh('docker run -e NODE_ENV=production --env-file .env myapp') },
  { front: 'Open a shell in a running container', back: sh('docker exec -it web sh') },
  { front: 'Follow a container’s logs', back: sh('docker logs -f web') },
  { front: 'List all containers, including stopped ones', back: sh('docker ps -a') },
  {
    front: 'Remove unused data (stopped containers, unused networks, dangling images, build cache)',
    back: sh('docker system prune'),
    extra: 'Add `-a` to also remove all unused images, and `--volumes` for unused anonymous volumes.',
  },
  {
    front: 'Named volume vs bind mount',
    back: 'A volume is managed by Docker and survives container removal; a bind mount maps a host path into the container',
  },
  { front: 'Mount a named volume for Postgres data', back: sh('docker run -v pgdata:/var/lib/postgresql/data postgres:17') },
  { front: 'Bind-mount the current directory read-only', back: sh('docker run -v "$(pwd)":/app:ro myapp') },
  {
    front: 'What happens to data written inside a container without a volume?',
    back: 'It lives in the container’s writable layer and is lost when the container is removed',
  },
  {
    front: 'How do containers on the same user-defined network reach each other?',
    back: 'By container (or Compose service) name, through Docker’s built-in DNS',
  },
  { front: 'Default network driver for standalone containers', back: '`bridge`' },
  {
    front: 'Compose v2 command to start services in the background',
    back: sh('docker compose up -d'),
    extra: 'Compose v2 is a Docker CLI plugin: `docker compose`, not `docker-compose`.',
  },
  {
    front: 'Stop and remove Compose services (and their volumes)',
    back: sh('docker compose down', 'docker compose down -v  # also removes named volumes'),
  },
  {
    front: 'Start a service only after the database is healthy',
    back: yaml(
      'services:',
      '  api:',
      '    depends_on:',
      '      db:',
      '        condition: service_healthy',
      '  db:',
      '    image: postgres:17',
      '    healthcheck:',
      '      test: ["CMD-SHELL", "pg_isready -U postgres"]',
      '      interval: 5s',
    ),
  },
  {
    front: 'Does plain `depends_on` wait until a service is ready?',
    back: 'No, only until it has started. Use `condition: service_healthy` with a health check',
  },
  {
    front: 'Compose profiles',
    back: 'Services with `profiles` only start when that profile is enabled',
    extra: yaml(
      'services:',
      '  adminer:',
      '    image: adminer',
      '    profiles: ["debug"]',
      '# docker compose --profile debug up',
    ),
  },
  { front: 'Rebuild images and start with Compose', back: sh('docker compose up -d --build') },
  { front: 'Run a one-off command in a Compose service', back: sh('docker compose run --rm api npm test') },
  {
    front: 'Where does Compose read variable substitutions like `${TAG}` from?',
    back: 'The shell environment and a `.env` file next to the compose file',
  },
  {
    front: 'Why use a `-slim` or `alpine` base image?',
    back: 'Fewer packages mean smaller images, faster pulls and less attack surface',
    extra: 'Alpine uses musl libc, which some native modules don’t support.',
  },
  {
    front: 'Keep an image small when installing packages',
    back: 'Combine install and cleanup in one `RUN` so deleted files never land in a layer',
    extra: dockerfile(
      'RUN apt-get update && apt-get install -y --no-install-recommends curl \\',
      '    && rm -rf /var/lib/apt/lists/*',
    ),
  },
  {
    front: 'Why shouldn’t secrets go in `ENV` or `ARG`?',
    back: 'They end up in the image metadata or history where anyone with the image can read them',
    extra: 'Use build secrets (`RUN --mount=type=secret`) or runtime environment variables.',
  },
  {
    front: 'Why pin image tags instead of using `latest`?',
    back: '`latest` changes over time, so builds aren’t reproducible; pin a version or a digest',
  },
  { front: 'Show an image’s layers and the commands that made them', back: sh('docker history myapp:1.0') },
  { front: 'Inspect a container’s configuration as JSON', back: sh('docker inspect web') },
  { front: 'Copy a file out of a container', back: sh('docker cp web:/app/log.txt ./log.txt') },
  { front: 'Limit a container’s memory and CPU', back: sh('docker run --memory=512m --cpus=1.5 myapp') },
  {
    front: 'Restart policy that brings a container back after crashes and reboots',
    back: sh('docker run -d --restart unless-stopped myapp'),
  },
  {
    front: 'Push an image to a registry',
    back: sh('docker tag myapp:1.0 ghcr.io/me/myapp:1.0', 'docker push ghcr.io/me/myapp:1.0'),
  },
  { front: 'Build for another CPU architecture', back: sh('docker buildx build --platform linux/arm64 -t myapp:arm64 .') },
]

export const DOCKER: PublicDeck = {
  slug: 'docker-essentials',
  title: 'Docker flashcards: 50 essentials for developers',
  shortTitle: 'Docker',
  category: 'devops',
  level: 'beginner',
  icon: 'code',
  description:
    'Learn Docker from images and layers to multi-stage builds, volumes, networks and Compose, with the commands and best practices you use daily.',
  intro:
    'Fifty cards on the Docker you actually use: how images, layers and the build cache work; every common Dockerfile instruction and its gotchas; run flags, volumes, networks and Compose (health checks, profiles, one-off commands); and the habits that keep images small and secure. Commands target Docker Engine 27+ and Compose v2.',
  faq: [
    {
      q: 'Does this deck cover Docker Compose?',
      a: 'Yes: services, dependencies with health checks, profiles, rebuilds and one-off commands, using the Compose v2 docker compose command.',
    },
    {
      q: 'Is it about Kubernetes too?',
      a: 'No. It focuses on Docker and Compose, the foundation you need before orchestration; the Kubernetes deck picks up from there.',
    },
    {
      q: 'Which Docker version does it assume?',
      a: 'A current Docker Engine (27 or newer) with BuildKit and Compose v2, the defaults in Docker Desktop and recent Linux packages.',
    },
  ],
  cards: CARDS,
}
