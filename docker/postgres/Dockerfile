FROM postgres:18.6-alpine3.24

# Local-development defaults; override with -e / compose environment.
ENV POSTGRES_USER=askesis \
    POSTGRES_PASSWORD=askesis \
    POSTGRES_DB=askesis \
    TZ=UTC

HEALTHCHECK --interval=2s --timeout=3s --retries=20 \
  CMD pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" || exit 1

EXPOSE 5432
