#!/bin/bash
set -e

if [ -z "$REPLICATION_PASSWORD" ]; then
  echo "REPLICATION_PASSWORD must be set"
  exit 1
fi

pw_escaped="${REPLICATION_PASSWORD//\'/\'\'}"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<EOSQL
  CREATE USER replicator WITH REPLICATION PASSWORD '${pw_escaped}';
EOSQL

echo "wal_level = replica" >> "$PGDATA/postgresql.conf"
echo "hot_standby = on" >> "$PGDATA/postgresql.conf"
echo "max_wal_senders = 5" >> "$PGDATA/postgresql.conf"
echo "host replication replicator 0.0.0.0/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"
