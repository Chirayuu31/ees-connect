#!/usr/bin/env bash
# npm run backup — timestamped, compressed dump of the local Supabase DB
# keeps the last 20 backups, prunes older ones automatically.
set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP_DIR="backups"
STAMP=$(date +%Y%m%d-%H%M%S)
FILE="$BACKUP_DIR/ees-$STAMP.dump"
CONTAINER="supabase_db_ees-connect"

mkdir -p "$BACKUP_DIR"

# exclude live session credentials (auth.refresh_tokens/sessions) — members
# can simply log in again after a restore; a leaked dump must not carry
# anybody's active session
docker exec "$CONTAINER" pg_dump -U postgres -Fc \
  --exclude-table-data='auth.refresh_tokens' \
  --exclude-table-data='auth.sessions' \
  postgres > "$FILE"

# optional at-rest encryption: set BACKUP_PASSPHRASE in .env.local and the
# plaintext dump is replaced by an AES-256 .dump.enc (same passphrase needed
# by scripts/db-restore.sh)
if [ -f .env.local ] && grep -q '^BACKUP_PASSPHRASE=' .env.local; then
  export BACKUP_PASSPHRASE=$(grep -E '^BACKUP_PASSPHRASE=' .env.local | cut -d= -f2- | tr -d '"')
  if [ -n "$BACKUP_PASSPHRASE" ]; then
    openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -salt -in "$FILE" -out "$FILE.enc" -pass env:BACKUP_PASSPHRASE
    rm "$FILE"
    FILE="$FILE.enc"
    echo "(encrypted at rest with BACKUP_PASSPHRASE)"
  fi
fi

# prune: keep the newest 20
ls -1t "$BACKUP_DIR"/ees-*.dump 2>/dev/null | tail -n +21 | xargs -r rm --

SIZE=$(du -h "$FILE" | cut -f1)
echo "backup written: $FILE ($SIZE)"
echo "restore later with: npm run restore -- $FILE"
