#!/bin/sh
# Starts the indexer (foreground) and, if a keeper key is configured, the keeper loop (background, restarted on exit).
set -u
cd /app

if [ -n "${KEEPER_PRIVATE_KEY:-}" ]; then
  (
    cd /app/keeper
    while true; do
      node src/main.ts
      echo '{"level":"warn","message":"keeper exited; restarting in 30s"}'
      sleep 30
    done
  ) &
fi

cd /app/indexer
exec node src/main.ts
