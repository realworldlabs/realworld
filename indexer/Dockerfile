# Build context is the repository root (set RAILWAY_DOCKERFILE_PATH=indexer/Dockerfile on the service).
FROM node:24-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/abi ./packages/abi
COPY indexer ./indexer
COPY contracts/deployments ./contracts/deployments
RUN pnpm install --frozen-lockfile --filter @rwa/indexer...
WORKDIR /app/indexer
ENV NODE_ENV=production
EXPOSE 42069
# One database schema per deployment keeps zero-downtime redeploys safe; the "rwa" views schema is the stable API.
CMD ["sh", "-c", "pnpm exec ponder start --schema ${RAILWAY_DEPLOYMENT_ID:-rwa_local} --views-schema rwa --port ${PORT:-42069}"]
