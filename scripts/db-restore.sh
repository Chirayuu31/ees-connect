#!/usr/bin/env bash
# npm run restore -- backups/ees-<stamp>.dump
# restores into the running local Supabase container.
# --clean drops existing objects first, so this OVERWRITES current data.
set -euo pipefail
cd "$(dirname "$0")/.."

FILE="${1}"
CONTAINER="supabase_db_ees-connect"

if [ -z "${FILE:-}" ]; then
  echo "usage: npm run restore -- backups/ees-<stamp>.dump"
  exit 1
fi
if [ ! -f "$FILE" ]; then
  echo "not found: $FILE"
  exit 1
fi

echo "restoring $FILE (this overwrites current data in the container)"

TMP=""
TARGET="$FILE"
if [ "${FILE##*.}" = "enc" ]; then
  if [ ! -f .env.local ] || ! grep -q '^BACKUP_PASSPHRASE=' .env.local; then
    echo ".enc backup needs BACKUP_PASSPHRASE in .env.local"
    exit 1
  fi
  export BACKUP_PASSPHRASE=$(grep -E '^BACKUP_PASSPHRASE=' .env.local | cut -d= -f2- | tr -d '"')
  TMP=$(mktemp)
  openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 -in "$FILE" -out "$TMP" -pass env:BACKUP_PASSPHRASE
  TARGET="$TMP"
  trap 'rm -f "$TMP"' EXIT
fi

docker exec -i "$CONTAINER" pg_restore -U postgres -d postgres --clean --if-exists --no-owner < "$TARGET"

echo "restored. verify inside the Studio at http://localhost:54323 or:"
echo "  docker exec $CONTAINER psql -U postgres -t -c \"select count(*) from public.posts;\""
