#!/bin/sh
# Starts Ponder (foreground) and, if a keeper key is configured, the keeper loop (background, restarted on exit).
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
# One database schema per deployment keeps zero-downtime redeploys safe; the "rwa" views schema is the stable API.
exec pnpm exec ponder start --schema "${RAILWAY_DEPLOYMENT_ID:-rwa_local}" --views-schema rwa --port "${PORT:-42069}"
