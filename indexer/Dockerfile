# Build context is the repository root (set RAILWAY_DOCKERFILE_PATH=indexer/Dockerfile on the service).
# Runs the indexer and, when KEEPER_PRIVATE_KEY is set, the keeper as a sidecar in the same container.
# The sidecar exists for plans that allow a single service; use keeper/Dockerfile for a separate service.
FROM node:24-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/abi ./packages/abi
COPY indexer ./indexer
COPY keeper ./keeper
COPY contracts/deployments ./contracts/deployments
RUN pnpm install --frozen-lockfile --filter @rwa/indexer... --filter @rwa/keeper...
COPY indexer/start.sh /app/start.sh
RUN chmod +x /app/start.sh
ENV NODE_ENV=production
EXPOSE 42069
CMD ["/app/start.sh"]
