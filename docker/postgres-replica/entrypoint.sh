#!/bin/bash
set -e

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
MAX_ATTEMPTS=30
ATTEMPT_INTERVAL=2

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  attempt=1
  while [ $attempt -le $MAX_ATTEMPTS ]; do
    if pg_isready -h postgres-write -U postgres; then
      break
    fi
    if [ $attempt -eq $MAX_ATTEMPTS ]; then
      echo "Primary (postgres-write) did not become ready in time."
      exit 1
    fi
    echo "Waiting for primary... attempt $attempt/$MAX_ATTEMPTS"
    sleep $ATTEMPT_INTERVAL
    attempt=$((attempt + 1))
  done

  echo "Running pg_basebackup from primary..."
  export PGPASSWORD="$REPLICATION_PASSWORD"
  if ! gosu postgres pg_basebackup -R -h postgres-write -U replicator -D "$PGDATA"; then
    echo "pg_basebackup failed."
    exit 1
  fi
  chmod 700 "$PGDATA"
  unset PGPASSWORD
fi

exec gosu postgres postgres
